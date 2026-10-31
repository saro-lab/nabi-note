import { P, isElement, isWrapper, type ElementNode, type NabiDoc, type NabiNode } from '../schema/index.js';
import {
  holderLength,
  isHolder,
  isolationPath,
  nodeAt,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sliceRuns, stepAfter, stepBefore, withChildren } from './runs-edit.js';

// 부모 자식 목록의 [index, index+count)를 replacement로 갈아 끼운다.
// Swaps [index, index+count) in the parent's children for replacement.
function spliceSiblings(
  doc: NabiDoc,
  parentPath: readonly number[],
  index: number,
  count: number,
  replacement: readonly NabiNode[],
): NabiDoc {
  if (parentPath.length === 0) {
    const next = [...doc.slice(0, index), ...replacement, ...doc.slice(index + count)];
    return next.filter(isElement);
  }
  const parent = nodeAt(doc, parentPath);
  if (!parent) return doc;
  const ch = [...parent.ch.slice(0, index), ...replacement, ...parent.ch.slice(index + count)];
  const walk = (nodes: readonly NabiNode[], depth: number): readonly NabiNode[] => {
    const i = parentPath[depth] as number;
    const node = nodes[i];
    if (node === undefined || !isElement(node)) return nodes;
    const inner = depth === parentPath.length - 1 ? ch : walk(node.ch, depth + 1);
    if (inner === node.ch) return nodes;
    const next: ElementNode = {
      w: node.w,
      ...(node.a ? { a: node.a } : {}),
      ch: inner,
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
    return [...nodes.slice(0, i), next, ...nodes.slice(i + 1)];
  };
  return walk(doc, 0) as NabiDoc;
}

function joinsOnDelete(wrapper: ElementNode, env: EditEnv): boolean {
  const block = wrapper.ch[0];
  return isElement(block) && env.joinOnDelete?.has(block.w) === true && !env.isolating?.has(block.w);
}

function edgeHolderIn(root: ElementNode, env: EditEnv, dir: -1 | 1): readonly number[] | null {
  const walk = (node: ElementNode, at: readonly number[]): readonly number[] | null => {
    if (env.isolating?.has(node.w) || env.singleParagraph?.has(node.w)) return null;
    for (let i = dir === 1 ? 0 : node.ch.length - 1; i >= 0 && i < node.ch.length; i += dir) {
      const child = node.ch[i];
      if (!isElement(child)) continue;
      const path = [...at, i];
      if (isHolder(child, env) && (!isWrapper(child, env) || !joinsOnDelete(child, env))) {
        return path;
      }
      return walk(child, path);
    }
    return null;
  };
  return walk(root, []);
}

function containsIsolation(node: ElementNode, env: EditEnv): boolean {
  return (
    env.isolating?.has(node.w) === true ||
    env.singleParagraph?.has(node.w) === true ||
    node.ch.some((child) => isElement(child) && containsIsolation(child, env))
  );
}

function joinFromVessel(
  doc: NabiDoc,
  parentPath: readonly number[],
  index: number,
  next: ElementNode,
  cur: ElementNode,
  env: EditEnv,
): EditResult | null {
  const inner = edgeHolderIn(next, env, 1);
  if (!inner) {
    return containsIsolation(next, env)
      ? { doc, caret: { path: [...parentPath, index], offset: holderLength(cur, env) } }
      : null;
  }

  const wrapperPath = [...parentPath, index + 1];
  const source = nodeAt(doc, [...wrapperPath, ...inner]);
  if (!source) return null;
  if (
    JSON.stringify(isolationPath(doc, [...wrapperPath, ...inner], env)) !==
    JSON.stringify(isolationPath(doc, [...parentPath, index], env))
  ) {
    return { doc, caret: { path: [...parentPath, index], offset: holderLength(cur, env) } };
  }
  if (isWrapper(source, env)) return selectBlock(doc, [...wrapperPath, ...inner]);

  const terminal = terminalOf(env);
  const junction = holderLength(cur, env);
  const filled = withChildren(cur, fromRuns([...holderRuns(cur, terminal), ...holderRuns(source, terminal)]));
  let out = replaceAt(doc, [...parentPath, index], [filled]);

  // 글을 내준 글자리를 걷고, 그로 인해 빈 껍데기가 생기면 항목째·목록째·래퍼문단째 따라 걷는다.
  // Removes the holder that gave up its text, then keeps walking up through any husk it leaves — item, then list, then wrapper.
  let cut: readonly number[] = inner;
  for (;;) {
    const ownerPath = cut.slice(0, -1);
    const owner = ownerPath.length > 0 ? nodeAt(out, [...wrapperPath, ...ownerPath]) : nodeAt(out, wrapperPath);
    if (!owner) break;
    const at = cut[cut.length - 1] as number;
    const kept = [...owner.ch.slice(0, at), ...owner.ch.slice(at + 1)];
    if (kept.length === 0 && ownerPath.length > 0) {
      cut = ownerPath; // 껍데기가 비었다 — 한 겹 위를 걷는다
      continue;
    }
    if (kept.length === 0) {
      // 그릇이 통째로 비었다 — 래퍼문단째 걷는다.
      // The container is now fully empty — remove the whole wrapper.
      out = spliceSiblings(out, parentPath, index + 1, 1, []);
      return { doc: out, caret: { path: [...parentPath, index], offset: junction } };
    }
    const target = ownerPath.length > 0 ? [...wrapperPath, ...ownerPath] : wrapperPath;
    out = replaceAt(out, target, [withChildren(owner, kept)]);
    break;
  }
  return { doc: out, caret: { path: [...parentPath, index], offset: junction } };
}

// 문단을 앞 그릇의 마지막 글자리에 잇고, 뒤따르는 같은 갈래의 그릇도 함께 이어 붙인다 — 아니면 둘로 남아 번호가 1부터 다시 시작한다.
// Joins the paragraph to the preceding container's last holder, then fuses a following container of the same kind too — otherwise it'd stay split and numbering would restart at 1.
function joinIntoVessel(
  doc: NabiDoc,
  parentPath: readonly number[],
  siblings: readonly NabiNode[],
  index: number,
  prev: ElementNode,
  cur: ElementNode,
  env: EditEnv,
): EditResult | null {
  const lump = prev.ch[0];
  if (!isElement(lump)) return null;
  const inner = edgeHolderIn(prev, env, -1);
  if (!inner) {
    return containsIsolation(prev, env) ? { doc, caret: { path: [...parentPath, index], offset: 0 } } : null;
  }

  const terminal = terminalOf(env);
  const target = nodeAt(doc, [...parentPath, index - 1, ...inner]);
  if (!target) return null;
  if (
    JSON.stringify(isolationPath(doc, [...parentPath, index - 1, ...inner], env)) !==
    JSON.stringify(isolationPath(doc, [...parentPath, index], env))
  ) {
    return { doc, caret: { path: [...parentPath, index], offset: 0 } };
  }
  if (isWrapper(target, env)) return selectBlock(doc, [...parentPath, index - 1, ...inner]);
  const junction = holderLength(target, env);
  const filled = withChildren(target, fromRuns([...holderRuns(target, terminal), ...holderRuns(cur, terminal)]));

  // 래퍼문단째 갈아 끼우므로 바깥 구조는 안 흔들린다.
  // Swapped in via the whole wrapper, so the outer structure never shifts.
  const wrapperPath = [...parentPath, index - 1];
  let next = replaceAt(doc, [...wrapperPath, ...inner], [filled]);

  const after = siblings[index + 1];
  const follower = after !== undefined && isElement(after) && isWrapper(after, env) ? after.ch[0] : undefined;
  if (follower !== undefined && isElement(follower) && follower.w === lump.w) {
    const head = nodeAt(next, [...wrapperPath, 0]);
    if (head) {
      next = replaceAt(next, [...wrapperPath, 0], [withChildren(head, [...head.ch, ...follower.ch])]);
      next = spliceSiblings(next, parentPath, index, 2, []); // 문단과 뒤 그릇을 함께 걷는다
      return { doc: next, caret: { path: [...wrapperPath, ...inner], offset: junction } };
    }
  }
  next = spliceSiblings(next, parentPath, index, 1, []);
  return { doc: next, caret: { path: [...wrapperPath, ...inner], offset: junction } };
}

function mergeParagraphs(
  doc: NabiDoc,
  parentPath: readonly number[],
  index: number,
  prev: ElementNode,
  cur: ElementNode,
  env: EditEnv,
): EditResult {
  const terminal = terminalOf(env);
  const junction = holderLength(prev, env);
  const merged = withChildren(prev, fromRuns([...holderRuns(prev, terminal), ...holderRuns(cur, terminal)]));
  const next = spliceSiblings(doc, parentPath, index, 2, [merged]);
  return { doc: next, caret: { path: [...parentPath, index], offset: junction } };
}

function selectBlock(doc: NabiDoc, path: readonly number[]): EditResult {
  return { doc, anchor: { path, offset: 0 }, caret: { path, offset: 1 } };
}

function removeEmptyAtBlock(
  doc: NabiDoc,
  parentPath: readonly number[],
  index: number,
  block: ElementNode,
  dir: -1 | 1,
  env: EditEnv,
): EditResult {
  const next = spliceSiblings(doc, parentPath, index, 1, []);
  const blockPath = [...parentPath, dir === 1 ? index : index - 1];
  if (joinsOnDelete(block, env)) {
    const inner = edgeHolderIn(block, env, dir);
    if (inner) {
      const path = [...blockPath, ...inner];
      const holder = nodeAt(next, path);
      if (holder && !isWrapper(holder, env)) {
        return { doc: next, caret: { path, offset: dir === 1 ? 0 : holderLength(holder, env) } };
      }
      return selectBlock(next, path);
    }
  }
  return selectBlock(next, blockPath);
}

// [at-step, at)이면 백스페이스, [at, at+step)이면 Delete.
// [at-step, at) for Backspace, [at, at+step) for Delete.
function removeSlot(
  doc: NabiDoc,
  path: readonly number[],
  holder: ElementNode,
  from: number,
  to: number,
  caretAt: number,
  env: EditEnv,
): EditResult {
  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  const ch = fromRuns([...sliceRuns(runs, 0, from), ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER)]);
  const next = spliceSiblings(doc, path.slice(0, -1), path[path.length - 1] as number, 1, [withChildren(holder, ch)]);
  return { doc: next, caret: { path, offset: caretAt } };
}

const unchanged = (doc: NabiDoc, pos: Position): EditResult => ({ doc, caret: pos });

export function deleteBackward(doc: NabiDoc, pos: Position, env: EditEnv): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return unchanged(doc, pos);
  const parentPath = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  const siblings = parentPath.length === 0 ? doc : (nodeAt(doc, parentPath)?.ch ?? []);

  if (isWrapper(holder, env)) {
    if (pos.offset >= 1) return selectBlock(doc, pos.path);
    return actOnNeighbour(doc, parentPath, siblings, index, -1, pos, env);
  }

  if (pos.offset > 0) {
    const step = stepBefore(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset - step, pos.offset, pos.offset - step, env);
  }

  const prev = siblings[index - 1];
  if (prev === undefined || !isElement(prev)) return unchanged(doc, pos);
  if (holder.w === P && isWrapper(prev, env)) {
    if (holderLength(holder, env) === 0) return removeEmptyAtBlock(doc, parentPath, index, prev, -1, env);
    if (joinsOnDelete(prev, env)) {
      const joined = joinIntoVessel(doc, parentPath, siblings, index, prev, holder, env);
      if (joined) return joined;
    }
    return selectBlock(doc, [...parentPath, index - 1]);
  }
  if (prev.w === P && holder.w === P) {
    if (prev.ch.length === 0) {
      const next = spliceSiblings(doc, parentPath, index - 1, 1, []);
      return { doc: next, caret: { path: [...parentPath, index - 1], offset: 0 } };
    }
    return mergeParagraphs(doc, parentPath, index - 1, prev, holder, env);
  }
  // 앞이 문단이 아닌 홀더(접기 제목 등)면 경계는 병합의 자리가 아니다.
  // A non-paragraph holder (a details title, say) before it means this boundary never merges.
  return unchanged(doc, pos);
}

export function deleteForward(doc: NabiDoc, pos: Position, env: EditEnv): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return unchanged(doc, pos);
  const parentPath = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  const siblings = parentPath.length === 0 ? doc : (nodeAt(doc, parentPath)?.ch ?? []);

  if (isWrapper(holder, env)) {
    if (pos.offset <= 0) return selectBlock(doc, pos.path);
    return actOnNeighbour(doc, parentPath, siblings, index, +1, pos, env);
  }

  const length = holderLength(holder, env);

  if (pos.offset < length) {
    const step = stepAfter(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset, pos.offset + step, pos.offset, env);
  }

  const next = siblings[index + 1];
  if (next === undefined || !isElement(next)) return unchanged(doc, pos);
  if (holder.w === P && isWrapper(next, env)) {
    if (length === 0) return removeEmptyAtBlock(doc, parentPath, index, next, 1, env);
    if (joinsOnDelete(next, env)) {
      const joined = joinFromVessel(doc, parentPath, index, next, holder, env);
      if (joined) return joined;
    }
    return selectBlock(doc, [...parentPath, index + 1]);
  }
  if (next.w === P && holder.w === P) {
    if (length === 0) {
      return { doc: spliceSiblings(doc, parentPath, index, 1, []), caret: pos };
    }
    const merged = mergeParagraphs(doc, parentPath, index, holder, next, env);
    return { doc: merged.doc, caret: pos };
  }
  return unchanged(doc, pos);
}

function actOnNeighbour(
  doc: NabiDoc,
  parentPath: readonly number[],
  siblings: readonly NabiNode[],
  index: number,
  dir: -1 | 1,
  pos: Position,
  env: EditEnv,
): EditResult {
  const at = index + dir;
  const neighbour = siblings[at];
  if (neighbour === undefined || !isElement(neighbour)) return unchanged(doc, pos);

  if (isWrapper(neighbour, env)) return selectBlock(doc, [...parentPath, at]);

  if (!isHolder(neighbour, env)) return unchanged(doc, pos);
  const length = holderLength(neighbour, env);

  // 빈 이웃 — 그 빈 문단이 사라진다 (유도 케이스, 그물로 고정).
  if (length === 0) {
    const next = spliceSiblings(doc, parentPath, at, 1, []);
    const shifted = dir === -1 ? index - 1 : index;
    return { doc: next, caret: { path: [...parentPath, shifted], offset: pos.offset } };
  }

  const runs = holderRuns(neighbour, terminalOf(env));
  if (dir === -1) {
    const step = stepBefore(runs, length);
    return removeSlot(doc, [...parentPath, at], neighbour, length - step, length, length - step, env);
  }
  const step = stepAfter(runs, 0);
  return removeSlot(doc, [...parentPath, at], neighbour, 0, step, 0, env);
}
