// 통째로 덮인 블록은 지우고(래퍼면 물건도 함께), 부분만 걸린 컨테이너는 구조를 지키며 속만 비운다 — 경계 문단은 안 없애고 빈 문단으로 남긴다.
// A fully covered block is deleted (a wrapper takes its object with it); a partially covered container keeps its structure and just empties; boundary paragraphs survive as empty ones, never removed.
import { P, isElement, isWrapper, type ElementNode, type NabiDoc, type NabiNode } from '../schema/index.js';
import {
  comparePositions,
  holderLength,
  isHolder,
  nodeAt,
  positionExists,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sliceRuns, withChildren } from './runs-edit.js';

export interface DocRange {
  readonly anchor: Position;
  readonly focus: Position;
}

// 부분만 걸린 컨테이너 안에서는 "통째 덮임"도 삭제가 아니라 비움이다.
// Inside a partially covered container, even a fully-covered child is emptied, not deleted.
function emptied(node: ElementNode, env: EditEnv): ElementNode {
  const holder = node.w === P || env.inlineHolders.has(node.w);
  if (holder) return withChildren(node, []);
  const ch = node.ch.filter(isElement).map((child) => emptied(child, env));
  return withChildren(node, ch);
}

// 자식이 전부 문단·인라인 홀더인 컨테이너(접기·인용·리스트 항목)만 블록을 통째로 지울 수 있다 — 격자 조각(행·칸)을 든 컨테이너는 구조 보호로 속만 비운다.
// Only a container whose children are all paragraphs/inline holders (details/quote/list item) allows a whole block to vanish; one holding grid pieces (rows/cells) protects structure and only empties.
function freeScope(container: ElementNode, env: EditEnv): boolean {
  if (env.singleParagraph?.has(container.w)) return false;
  return container.ch.every((child) => !isElement(child) || isHolder(child, env));
}

// [0, from)와 [to, end)만 남기고 사이를 잘라 낸다 — 경계 문단은 남는다.
// Keeps only [0, from) and [to, end), cutting the middle; a boundary paragraph survives.
function trimmed(holder: ElementNode, from: number, to: number, env: EditEnv): ElementNode {
  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  return withChildren(holder, fromRuns([...sliceRuns(runs, 0, from), ...sliceRuns(runs, to, Number.MAX_SAFE_INTEGER)]));
}

// sp/ep는 이 스코프 기준 남은 경로(null=그쪽 경계가 스코프 밖, 전부 덮임) — mode는 물려받되 실제 통삭제 가능 여부(local)는 freeScope로 다시 좁힌다.
// sp/ep are the remaining path relative to this scope (null = that boundary lies outside, fully covered); mode is inherited but whether this scope can actually delete wholesale (local) is narrowed again by freeScope.
function cut(
  nodes: readonly NabiNode[],
  container: ElementNode | null,
  sp: readonly number[] | null,
  so: number,
  ep: readonly number[] | null,
  eo: number,
  mode: 'delete' | 'empty',
  env: EditEnv,
): NabiNode[] {
  const local: 'delete' | 'empty' =
    mode === 'delete' && (container === null || freeScope(container, env)) ? 'delete' : 'empty';
  const si = sp === null ? Number.NEGATIVE_INFINITY : (sp[0] as number);
  const ei = ep === null ? Number.POSITIVE_INFINITY : (ep[0] as number);
  const out: NabiNode[] = [];

  nodes.forEach((node, i) => {
    if (!isElement(node)) {
      if (i < si || i > ei) out.push(node);
      return;
    }
    if (i < si || i > ei) {
      out.push(node);
      return;
    }
    if (i > si && i < ei) {
      if (local === 'empty') out.push(emptied(node, env));
      return; // 'delete'면 떨어진다 — 래퍼문단이면 물건도 함께
    }

    const startHere = i === si && sp !== null;
    const endHere = i === ei && ep !== null;
    const sDeeper = startHere && (sp as readonly number[]).length > 1;
    const eDeeper = endHere && (ep as readonly number[]).length > 1;

    // 양쪽 다 이 자식 안이면(공통 조상 하강) mode를 지키고, 한쪽만 안이면(부분 걸림) 비우는 모드로 내려간다.
    // If both boundaries go deeper into this child (common-ancestor descent) mode is kept; if only one does (partial coverage) it drops to empty mode.
    if (sDeeper || eDeeper) {
      const both = sDeeper && eDeeper;
      const ch = cut(
        node.ch,
        node,
        sDeeper ? (sp as readonly number[]).slice(1) : null,
        sDeeper ? so : 0,
        eDeeper ? (ep as readonly number[]).slice(1) : null,
        eDeeper ? eo : 0,
        both ? mode : 'empty',
        env,
      );
      out.push(withChildren(node, ch));
      return;
    }

    const wrapper = isWrapper(node, env);
    const from = startHere ? so : 0;
    const to = endHere ? eo : holderLength(node, env);

    if (wrapper) {
      // 래퍼문단은 칸이 하나뿐 — [0,1)이 덮이면 통째, 아니면 그대로 남는다.
      // A wrapper has just one slot; covering [0,1) takes the whole thing, else it survives untouched.
      const covered = from <= 0 && to >= 1;
      if (!covered) out.push(node);
      else if (local === 'empty') out.push(withChildren(node, []));
      return; // 'delete'면 물건과 함께 떨어진다
    }

    out.push(trimmed(node, from, to, env));
  });

  return out;
}

// si였던 자리와 그다음 자리가 둘 다 글 문단이면 병합한다.
// Merges the old start index with its neighbor, when both are text paragraphs.
function mergeAt(nodes: NabiNode[], index: number, env: EditEnv): NabiNode[] {
  const head = nodes[index];
  const tail = nodes[index + 1];
  if (
    head === undefined ||
    tail === undefined ||
    !isElement(head) ||
    !isElement(tail) ||
    head.w !== P ||
    tail.w !== P ||
    isWrapper(head, env) ||
    isWrapper(tail, env)
  ) {
    return nodes;
  }
  const terminal = terminalOf(env);
  const merged = withChildren(head, fromRuns([...holderRuns(head, terminal), ...holderRuns(tail, terminal)]));
  return [...nodes.slice(0, index), merged, ...nodes.slice(index + 2)];
}

// --- 지운 뒤 두 끝이 만난다 (§11) ---------------------------------------------------------------

// mergeAt은 같은 부모의 글 문단만 잇는다 — 목록을 걸친 삭제(`he|ad`와 항목 등)는 반쪽이 따로 남으므로,
// 여기서는 부모를 안 보고 자른 뒤 남은 시작 글자리와 문서상 다음 글자리를 곧장 이어 붙인다.
// mergeAt only joins sibling text paragraphs under one parent, leaving a list-spanning delete (e.g. across `he|ad` and an item) split in half; here we skip parentage entirely and join the surviving start holder straight to whatever holder comes next in document order.

// 문서 순서로 이 경로 다음에 오는 글자리 — 없으면 null. 래퍼문단은 글자리가 아니다.
// The next holder after this path in document order, or null; a wrapper paragraph doesn't count.
function nextHolderAfter(doc: NabiDoc, path: readonly number[], env: EditEnv): readonly number[] | null {
  const after = (a: readonly number[], b: readonly number[]): boolean => {
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
      const x = a[i] as number;
      const y = b[i] as number;
      if (x !== y) return x > y;
    }
    return a.length > b.length;
  };
  let found: readonly number[] | null = null;
  const walk = (nodes: readonly NabiNode[], at: readonly number[]): void => {
    for (const [i, node] of nodes.entries()) {
      if (found) return;
      if (!isElement(node)) continue;
      const here = [...at, i];
      if (isHolder(node, env) && !isWrapper(node, env)) {
        if (after(here, path)) {
          found = here;
          return;
        }
        continue; // 글자리 속은 안 판다 — 글자리 안에 글자리는 없다
      }
      walk(node.ch, here);
    }
  };
  walk(doc, []);
  return found;
}

// 노드 하나를 걷고, 그로 인해 빈 껍데기가 생기면 위로 따라 걷는다(뿌리까지 비면 멈춘다).
// Removes one node, then keeps walking up through any husk it leaves empty, stopping at the document root.
function pruneAt(doc: NabiDoc, path: readonly number[]): NabiDoc {
  let out = doc;
  let cut: readonly number[] = path;
  for (;;) {
    const parentPath = cut.slice(0, -1);
    const at = cut[cut.length - 1] as number;
    const siblings = parentPath.length === 0 ? out : (nodeAt(out, parentPath)?.ch ?? []);
    const kept = [...siblings.slice(0, at), ...siblings.slice(at + 1)];
    if (parentPath.length === 0) return kept as NabiDoc;
    if (kept.length === 0) {
      cut = parentPath; // 껍데기가 비었다 — 한 겹 위를 마저 걷는다
      continue;
    }
    const parent = nodeAt(out, parentPath);
    if (!parent) return out;
    return replaceAt(out, parentPath, [withChildren(parent, kept)]) as NabiDoc;
  }
}

// 이 글자리를 품은 보호 칸(singleParagraph) — 없으면 null.
// The protected cell (singleParagraph) holding this holder, or null.
function cellOf(doc: NabiDoc, path: readonly number[], env: EditEnv): ElementNode | null {
  for (let depth = path.length - 1; depth >= 1; depth -= 1) {
    const node = nodeAt(doc, path.slice(0, depth));
    if (node && env.singleParagraph?.has(node.w)) return node;
  }
  return null;
}

// 둘까지만 센다 — 하나뿐인지만 알면 된다.
// Counts up to two — all that matters is whether it's exactly one.
function holdersUnder(node: ElementNode, env: EditEnv): number {
  let count = 0;
  const walk = (nodes: readonly NabiNode[]): void => {
    for (const child of nodes) {
      if (count > 1) return;
      if (!isElement(child)) continue;
      if (isHolder(child, env) && !isWrapper(child, env)) {
        count += 1;
        continue;
      }
      walk(child.ch);
    }
  };
  walk(node.ch);
  return count;
}

// 시작 글자리와 그 다음 글자리를 잇는다 — 이을 것이 없으면 그대로 돌려준다.
// Joins the start holder to whatever holder follows it; returns unchanged if there's nothing to join.
function joinEnds(doc: NabiDoc, startPath: readonly number[], env: EditEnv): NabiDoc {
  const head = nodeAt(doc, startPath);
  if (!head || head.w !== P) return doc;
  const tailPath = nextHolderAfter(doc, startPath, env);
  if (!tailPath) return doc;
  const tail = nodeAt(doc, tailPath);
  // 글 문단끼리만 만난다 — 접기 제목·코드 상자는 글자리라도 문단이 아니라 병합 대상이 아니다.
  // Only text paragraphs meet; a details title or code box is a holder but not a paragraph, so it never merges.
  if (!tail || tail.w !== P) return doc;
  // 격자는 안 넘는다 — 서로 다른 칸(singleParagraph)의 글을 합치면 표가 무너진다.
  // Never crosses a grid boundary — merging text across different cells (singleParagraph) would collapse the table.
  if (cellOf(doc, startPath, env) !== cellOf(doc, tailPath, env)) return doc;

  const terminal = terminalOf(env);
  const filled = withChildren(head, fromRuns([...holderRuns(head, terminal), ...holderRuns(tail, terminal)]));
  let out = replaceAt(doc, startPath, [filled]) as NabiDoc;
  out = pruneAt(out, tailPath);

  // 이은 글자리가 비었고 그 그릇에 남은 글자리가 그것뿐이면, 빈 껍데기로 안 남기고 그릇째 걷는다.
  // If the joined holder ended up empty and was the only one its container held, collapse the whole container instead of leaving an empty husk.
  const joined = nodeAt(out, startPath);
  if (!joined || holderLength(joined, env) > 0) return out;
  for (let depth = startPath.length - 1; depth >= 1; depth -= 1) {
    const at = startPath.slice(0, depth);
    const node = nodeAt(out, at);
    if (!node) break;
    if (!isWrapper(node, env)) continue;
    if (holdersUnder(node, env) <= 1) out = replaceAt(out, at, [{ w: P, ch: [] }]) as NabiDoc;
    break;
  }
  return out;
}

export function deleteRange(doc: NabiDoc, range: DocRange, env: EditEnv): EditResult {
  const forward = comparePositions(range.anchor, range.focus) <= 0;
  const start = forward ? range.anchor : range.focus;
  const end = forward ? range.focus : range.anchor;
  if (comparePositions(start, end) === 0) return { doc, caret: start };

  let next = cut(doc, null, start.path, start.offset, end.path, end.offset, 'delete', env) as ElementNode[];

  // 같은 깊이·같은 부모일 때만 병합 후보다.
  // Only a candidate for merging when both ends share the same depth and parent.
  const sameParent =
    start.path.length === end.path.length && start.path.slice(0, -1).every((v, i) => v === end.path[i]);
  if (sameParent && start.path.length >= 1 && start.path[start.path.length - 1] !== end.path[end.path.length - 1]) {
    const parentPath = start.path.slice(0, -1);
    const index = start.path[start.path.length - 1] as number;
    if (parentPath.length === 0) {
      next = mergeAt(next, index, env).filter(isElement);
    } else {
      const parent = nodeAt(next, parentPath);
      // 자유 스코프에서만 병합한다 — 보호 스코프(격자)는 비워졌을 뿐 지워진 게 아니다.
      // Merging only happens in a free scope; a protected one (grid) was emptied, not removed.
      if (parent && freeScope(parent, env)) {
        const merged = mergeAt([...parent.ch], index, env);
        next = replaceAt(next, parentPath, [withChildren(parent, merged)]) as ElementNode[];
      }
    }
  }

  // 양 끝의 부모가 달랐다 — 문단끼리 규칙이 안 서는 자리라 여기서 두 끝을 잇는다(§11).
  if (!sameParent) next = joinEnds(next, start.path, env) as ElementNode[];

  // 전체선택 삭제는 시작 문단의 그릇을 남기고 속성(a·h·dc)을 지고 있는 껍데기가 될 수 있다(주인 신고 2026-08-20) —
  // 문서가 통째로 빈 경우에만 그 속성을 걷어 "빈 문서는 한 모양"으로 맞춘다. 한 줄만 비운 경우는 서식이 남아야 하므로 안 건드린다.
  // A select-all delete can leave a husk carrying the start paragraph's attrs (a/h/dc) (owner-reported 2026-08-20) — only when the whole doc is empty do we strip them so "empty" has one shape; emptying a single line among others keeps its formatting on purpose.
  const only = next.length === 1 ? next[0] : undefined;
  const husk = only !== undefined && isElement(only) && only.w === P && only.ch.length === 0 && only.a !== undefined;
  if (next.length === 0 || husk) {
    const empty: ElementNode = { w: P, ch: [] };
    return { doc: [empty], caret: { path: [0], offset: 0 } };
  }

  // 캐럿은 범위의 시작 자리다 — 시작 홀더가 사라졌으면 그 인덱스로 당겨진 홀더의 처음, 그것도 없으면 앞 홀더의 끝이다.
  // The caret targets the range start; if that holder vanished, the index shifts to whatever took its place, else back to the previous holder's end.
  const caret: Position = { path: start.path, offset: start.offset };
  if (positionExists(next, caret, env)) return { doc: next, caret };
  const atIndex: Position = { path: start.path, offset: 0 };
  if (positionExists(next, atIndex, env)) return { doc: next, caret: atIndex };
  const parentPath = start.path.slice(0, -1);
  const index = start.path[start.path.length - 1] as number;
  for (let back = index - 1; back >= 0; back -= 1) {
    const candidate = nodeAt(next, [...parentPath, back]);
    if (candidate && isHolder(candidate, env)) {
      return { doc: next, caret: { path: [...parentPath, back], offset: holderLength(candidate, env) } };
    }
  }
  // 이 스코프에 홀더가 안 남았다 — 빈 문단을 세운다.
  // No holder survived in this scope; plant an empty paragraph.
  const empty: ElementNode = { w: P, ch: [] };
  const scope = parentPath.length === 0 ? next : (nodeAt(next, parentPath)?.ch ?? []);
  const clamped = Math.min(index, scope.length);
  if (parentPath.length === 0) {
    const rebuilt = [...next.slice(0, clamped), empty, ...next.slice(clamped)];
    return { doc: rebuilt, caret: { path: [clamped], offset: 0 } };
  }
  const parent = nodeAt(next, parentPath);
  if (!parent) return { doc: next, caret: { path: [0], offset: 0 } };
  const rebuiltParent = withChildren(parent, [...parent.ch.slice(0, clamped), empty, ...parent.ch.slice(clamped)]);
  const rebuilt = replaceAt(next, parentPath, [rebuiltParent]) as ElementNode[];
  return { doc: rebuilt, caret: { path: [...parentPath, clamped], offset: 0 } };
}
