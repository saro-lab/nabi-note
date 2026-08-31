// 백스페이스는 캐럿 앞 한 덩어리를, Delete는 뒤 한 덩어리를 지운다 — 글 있는 문단끼리 만나면 병합하고, 래퍼문단 경계(offset 0/1)에서는 경계 너머 이웃에 작용한다. 2단계(선택 후 삭제)는 없다.
// Backspace removes one unit before the caret, Delete removes one after; text paragraphs merge on contact, and a wrapper boundary (offset 0/1) acts on the neighbor across it. No two-step (select-then-delete) path exists.
import { P, isElement, isWrapper, type ElementNode, type NabiDoc, type NabiNode } from '../schema/index.js';
import {
  holderLength,
  isHolder,
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

// 그릇 속 문서 순서상 마지막 글자리(래퍼문단은 건너뛴다) — 속이 없으면 null(부르는 쪽은 통째 삭제로 돌아간다).
// The last holder inside a container, in document order (wrappers skipped) — null when there's none, so the caller falls back to a whole-block delete.
function lastHolderIn(root: ElementNode, env: EditEnv): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (node: ElementNode, at: readonly number[]): void => {
    node.ch.forEach((child, i) => {
      if (!isElement(child)) return;
      const path = [...at, i];
      if (isHolder(child, env) && !isWrapper(child, env)) found = path;
      walk(child, path);
    });
  };
  walk(root, []);
  return found;
}

// lastHolderIn의 거울 — 그릇 속 문서 순서상 첫 글자리.
// The mirror of lastHolderIn — the first holder inside a container, in document order.
function firstHolderIn(root: ElementNode, env: EditEnv): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (node: ElementNode, at: readonly number[]): void => {
    if (found) return;
    for (const [i, child] of node.ch.entries()) {
      if (found) return;
      if (!isElement(child)) continue;
      const path = [...at, i];
      if (isHolder(child, env) && !isWrapper(child, env)) {
        found = path;
        return;
      }
      walk(child, path);
    }
  };
  walk(root, []);
  return found;
}

// 뒤 그릇의 첫 글자리를 이 문단 끝으로 끌어올린다 — joinIntoVessel의 거울(§9). 이게 없으면 `head|` 뒤의 목록이
// 통째로(항목째) 사라졌다 — 속 없는 물건용 규칙이 그릇에도 새서, 백스페이스 쪽만 있던 보호가 Delete엔 없었다.
// Pulls the following container's first holder up to the end of this paragraph — the mirror of joinIntoVessel (§9). Without it, Delete at `head|` erased the whole following list at once, since the empty-object rule leaked onto containers too; only Backspace had this guard.
function joinFromVessel(
  doc: NabiDoc,
  parentPath: readonly number[],
  index: number,
  next: ElementNode,
  cur: ElementNode,
  env: EditEnv,
): EditResult | null {
  const inner = firstHolderIn(next, env);
  if (!inner) return null; // 속이 없는 물건 — 통째 삭제가 그 답이다

  const wrapperPath = [...parentPath, index + 1];
  const source = nodeAt(doc, [...wrapperPath, ...inner]);
  if (!source) return null;

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
  const inner = lastHolderIn(prev, env);
  if (!inner) return null; // 속이 없는 물건 — 통째 삭제가 그 답이다

  const terminal = terminalOf(env);
  const target = nodeAt(doc, [...parentPath, index - 1, ...inner]);
  if (!target) return null;
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

// 걷어낸 뒤 캐럿은 앞 홀더의 끝, 없으면 다음 홀더의 처음, 그마저 없으면 세운 빈 문단으로 간다.
// After removal the caret lands at the previous holder's end, else the next holder's start, else a freshly planted empty paragraph.
function removeBlock(
  doc: NabiDoc,
  parentPath: readonly number[],
  siblings: readonly NabiNode[],
  index: number,
  env: EditEnv,
): EditResult {
  const removed = spliceSiblings(doc, parentPath, index, 1, []);
  const before = siblings[index - 1];
  if (before !== undefined && isHolder(before, env)) {
    return {
      doc: removed,
      caret: { path: [...parentPath, index - 1], offset: holderLength(before, env) },
    };
  }
  const after = siblings[index + 1];
  if (after !== undefined && isHolder(after, env)) {
    return { doc: removed, caret: { path: [...parentPath, index], offset: 0 } };
  }
  // 설 자리가 없다 — 빈 문단을 세운다.
  const empty: ElementNode = { w: P, ch: [] };
  const next = spliceSiblings(doc, parentPath, index, 1, [empty]);
  return { doc: next, caret: { path: [...parentPath, index], offset: 0 } };
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

  // offset 1(물건 뒤)은 물건 통째, 0(물건 앞)은 앞 이웃에 작용한다.
  // Offset 1 (after the object) removes it whole; offset 0 (before it) acts on the previous neighbor.
  if (isWrapper(holder, env)) {
    if (pos.offset >= 1) return removeBlock(doc, parentPath, siblings, index, env);
    return actOnNeighbour(doc, parentPath, siblings, index, -1, pos, env);
  }

  if (pos.offset > 0) {
    const step = stepBefore(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset - step, pos.offset, pos.offset - step, env);
  }

  // 문단 첫머리 — 앞이 글 있는 문단이면 병합, 빈 문단이면 그것만 삭제, 래퍼문단이면 통째 삭제.
  // At a paragraph's start: merge with a text-bearing previous paragraph, delete an empty one outright, or remove a wrapper whole.
  const prev = siblings[index - 1];
  if (prev === undefined || !isElement(prev)) return unchanged(doc, pos);
  if (isWrapper(prev, env)) {
    // 글을 품은 그릇(목록·인용·접기·코드·표)이면 통째로 안 지우고 그 속 마지막 글자리에 이어 붙는다.
    // A text-bearing container (list/quote/details/code/table) isn't deleted whole; it joins at its last holder instead.
    const joined = joinIntoVessel(doc, parentPath, siblings, index, prev, holder, env);
    if (joined) return joined;
    const next = spliceSiblings(doc, parentPath, index - 1, 1, []);
    return { doc: next, caret: { path: [...parentPath, index - 1], offset: 0 } };
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

  // offset 0(물건 앞)은 물건 통째, 1(물건 뒤)은 뒤 이웃에 작용한다.
  // Offset 0 (before the object) removes it whole; offset 1 (after it) acts on the next neighbor.
  if (isWrapper(holder, env)) {
    if (pos.offset <= 0) return removeBlock(doc, parentPath, siblings, index, env);
    return actOnNeighbour(doc, parentPath, siblings, index, +1, pos, env);
  }

  const length = holderLength(holder, env);

  if (pos.offset < length) {
    const step = stepAfter(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset, pos.offset + step, pos.offset, env);
  }

  // 문단 끝 — 뒤가 문단이면 병합, 래퍼문단이면 통째 삭제, 없으면 없음.
  // At a paragraph's end: merge with a following paragraph, remove a wrapper whole, or do nothing.
  const next = siblings[index + 1];
  if (next === undefined || !isElement(next)) return unchanged(doc, pos);
  if (isWrapper(next, env)) {
    // 글을 품은 그릇이면 그 속 첫 글자리를 끌어올린다(§9, §7의 거울).
    // A text-bearing container pulls its first holder up instead (§9, mirroring §7).
    const joined = joinFromVessel(doc, parentPath, index, next, holder, env);
    if (joined) return joined;
    const removed = spliceSiblings(doc, parentPath, index + 1, 1, []);
    return { doc: removed, caret: pos };
  }
  if (next.w === P && holder.w === P) {
    const merged = mergeParagraphs(doc, parentPath, index, holder, next, env);
    return { doc: merged.doc, caret: pos };
  }
  return unchanged(doc, pos);
}

// 래퍼문단 경계 너머 이웃에 작용한다(dir -1=앞/+1=뒤) — 글 있는 이웃은 끝/첫 한 칸을 지우고, 빈 문단은 통째로, 래퍼면 그 물건째 지운다.
// Acts on the neighbor across a wrapper boundary (dir -1 before / +1 after) — trims one slot off a text neighbor, removes an empty paragraph whole, or deletes a wrapper's object entirely.
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

  if (isWrapper(neighbour, env)) {
    const next = spliceSiblings(doc, parentPath, at, 1, []);
    const shifted = dir === -1 ? index - 1 : index;
    return { doc: next, caret: { path: [...parentPath, shifted], offset: pos.offset } };
  }

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
