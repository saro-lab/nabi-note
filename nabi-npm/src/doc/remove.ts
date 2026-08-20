// 삭제 — 한 줄 규칙: 백스페이스는 캐럿 앞의 한 덩어리를, Delete 는 뒤의 한 덩어리를 지운다.
// 글자·라인은 한 칸, 물건(래퍼문단)은 통째, 문단끼리 만나면 병합(속성은 윗 속성).
// 방향 규칙은 래퍼문단 안까지 관통한다 — 오프셋 0/1 에서는 경계 너머 이웃에 작용한다.
// 2단계(선택 후 삭제)는 없다 — 즉시 삭제, 안전망은 undo 한 걸음이다.
import {
  P,
  isElement,
  isWrapper,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
} from '../schema/index.js';
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

// 부모 자식 목록의 [index, index+count) 를 replacement 로 갈아 끼운 새 문서.
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

// 두 글 문단을 하나로 — 앞 문단이 남고(속성은 윗 속성) 뒤 문단의 속이 이어진다.
// 그릇 속 **마지막 글자리** — 문서 순서로 가장 뒤에 선 글 홀더의 경로다(래퍼문단은 글자리가
// 아니라 건너뛴다). 속이 없는 물건은 null 이고, 그때는 부르는 쪽이 통째 삭제로 돌아간다.
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

// 그릇 속 **첫 글자리** — `lastHolderIn` 의 거울이다. 문서 순서로 가장 앞에 선 글 홀더.
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

// 뒤 그릇의 **첫 글자리**를 이 문단 끝으로 끌어올린다 — `joinIntoVessel` 의 거울이다 (§9).
//
// 이것이 없으면 문단 끝의 Delete 가 뒤 그릇을 **통째로** 지웠다. 그 가지는 속이 없는 물건
// (그림·구분선·영상)을 겨눈 규칙인데 그릇에도 그대로 맞아서, `head|` 뒤의 목록이 항목 둘을 든 채
// 한 번에 사라졌다. 백스페이스 쪽에는 `joinIntoVessel` 이 있어 한 글자씩 합치는데(§7) Delete
// 쪽만 이 보호가 없었다 — 거울이 깨져 있던 자리다.
//
// 끌어올리고 나서 그릇의 그 글자리가 **빈 껍데기로 남으면 걷는다**: 항목 하나뿐이던 목록은
// 통째로 사라지고, 여럿이면 그 항목만 빠진다.
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

  // 글을 내준 글자리를 그릇에서 걷는다. 걷다가 **빈 껍데기가 생기면 그것도 따라 걷는다**
  // 항목 하나뿐이던 목록은 항목째, 그러고도 비면 목록째, 끝내 래퍼문단째 사라진다.
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
      out = spliceSiblings(out, parentPath, index + 1, 1, []);
      return { doc: out, caret: { path: [...parentPath, index], offset: junction } };
    }
    const target = ownerPath.length > 0 ? [...wrapperPath, ...ownerPath] : wrapperPath;
    out = replaceAt(out, target, [withChildren(owner, kept)]);
    break;
  }
  return { doc: out, caret: { path: [...parentPath, index], offset: junction } };
}

// 문단 하나를 앞 그릇의 마지막 글자리에 이어 붙인다. 붙일 자리가 없으면 null.
//
// 붙이고 나면 **뒤따르던 같은 갈래의 그릇과도 이어 붙인다** — 목록 사이에 끼어 있던 문단이
// 사라지면 그 위아래는 원래 한 목록이었던 것이고, 둘로 남겨 두면 번호가 1 부터 다시 시작한다.
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

  // 그릇을 그 자리에서 고쳐 넣는다 — 래퍼문단째 갈아 끼우므로 바깥 구조는 안 흔들린다.
  const wrapperPath = [...parentPath, index - 1];
  let next = replaceAt(doc, [...wrapperPath, ...inner], [filled]);

  // 문단이 빠진 자리를 걷고, 뒤가 같은 갈래의 그릇이면 그 속을 앞 그릇 끝에 잇는다.
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

// 래퍼문단(또는 빈 문단) 하나를 걷어낸 뒤의 캐럿 — 앞 홀더의 끝, 없으면 다음 홀더의 처음
// 문서(그 자리)가 비면 빈 문단 하나를 세워 캐럿의 집을 지킨다.
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

// 홀더 속 한 칸을 지운다 — [at-step, at) 백스페이스 / [at, at+step) Delete.
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
  const ch = fromRuns([
    ...sliceRuns(runs, 0, from),
    ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER),
  ]);
  const next = spliceSiblings(doc, path.slice(0, -1), path[path.length - 1] as number, 1, [
    withChildren(holder, ch),
  ]);
  return { doc: next, caret: { path, offset: caretAt } };
}

const unchanged = (doc: NabiDoc, pos: Position): EditResult => ({ doc, caret: pos });

export function deleteBackward(doc: NabiDoc, pos: Position, env: EditEnv): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return unchanged(doc, pos);
  const parentPath = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  const siblings = parentPath.length === 0 ? doc : (nodeAt(doc, parentPath)?.ch ?? []);

  // 래퍼문단 — 1(물건 뒤)은 물건 통째, 0(물건 앞)은 앞 이웃에 작용한다.
  if (isWrapper(holder, env)) {
    if (pos.offset >= 1) return removeBlock(doc, parentPath, siblings, index, env);
    return actOnNeighbour(doc, parentPath, siblings, index, -1, pos, env);
  }

  // 홀더 안 — 앞 한 칸.
  if (pos.offset > 0) {
    const step = stepBefore(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset - step, pos.offset, pos.offset - step, env);
  }

  // 문단 첫머리 — 앞이 문단이면 병합, 래퍼문단이면 통째 삭제, 없으면 없음.
  const prev = siblings[index - 1];
  if (prev === undefined || !isElement(prev)) return unchanged(doc, pos);
  if (isWrapper(prev, env)) {
    // 앞이 **글을 품은 그릇**(목록·인용·접기·코드·표)이면 그 속 마지막 글자리에 이어 붙는다.
    // 통째로 지우는 것은 속이 없는 물건(그림·구분선·영상)의 답이지 그릇의 답이 아니다
    // 목록 뒤에서 백스페이스를 한 번 쳤다고 목록 전체가 사라지면 안 된다.
    const joined = joinIntoVessel(doc, parentPath, siblings, index, prev, holder, env);
    if (joined) return joined;
    const next = spliceSiblings(doc, parentPath, index - 1, 1, []);
    return { doc: next, caret: { path: [...parentPath, index - 1], offset: 0 } };
  }
  if (prev.w === P && holder.w === P) {
    return mergeParagraphs(doc, parentPath, index - 1, prev, holder, env);
  }
  // 앞이 문단이 아닌 홀더(접기 제목 등) — 경계는 병합의 자리가 아니다.
  return unchanged(doc, pos);
}

export function deleteForward(doc: NabiDoc, pos: Position, env: EditEnv): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return unchanged(doc, pos);
  const parentPath = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  const siblings = parentPath.length === 0 ? doc : (nodeAt(doc, parentPath)?.ch ?? []);

  // 래퍼문단 — 0(물건 앞)은 물건 통째, 1(물건 뒤)은 뒤 이웃에 작용한다.
  if (isWrapper(holder, env)) {
    if (pos.offset <= 0) return removeBlock(doc, parentPath, siblings, index, env);
    return actOnNeighbour(doc, parentPath, siblings, index, +1, pos, env);
  }

  const length = holderLength(holder, env);

  // 홀더 안 — 뒤 한 칸.
  if (pos.offset < length) {
    const step = stepAfter(holderRuns(holder, terminalOf(env)), pos.offset);
    if (step === 0) return unchanged(doc, pos);
    return removeSlot(doc, pos.path, holder, pos.offset, pos.offset + step, pos.offset, env);
  }

  // 문단 끝 — 뒤가 문단이면 병합(속성은 지금 속성), 래퍼문단이면 통째 삭제, 없으면 없음.
  const next = siblings[index + 1];
  if (next === undefined || !isElement(next)) return unchanged(doc, pos);
  if (isWrapper(next, env)) {
    // 뒤가 **글을 품은 그릇**이면 그 속 첫 글자리를 끌어올린다 (§9 — §7 의 거울).
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

// 래퍼문단 안에서 경계 너머 이웃에 작용한다 (dir: -1 앞 / +1 뒤).
//   이웃 문단에 글이 있으면 그 끝/첫 한 칸을 지우고 캐럿이 그리로 간다 (예: 1234→123).
//   이웃이 빈 문단이면 그 빈 문단을 지운다. 이웃이 래퍼문단이면 그 물건을 통째로 지운다.
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
