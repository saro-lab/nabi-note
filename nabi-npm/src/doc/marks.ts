// 마크·문단 속성 연산 — 값 마크(hl·tc·fs·tf)와 단순 마크(b·i·u·s·sub·sup)가 한 모양을 쓴다.
// 범위의 글자 길이는 안 바뀌므로 반환 자리는 들어온 범위 그대로다.
import {
  P,
  isWrapper,
  type Attrs,
  type AttrValue,
  type ElementNode,
  type NabiDoc,
  type Run,
} from '../schema/index.js';
import {
  comparePositions,
  holderLength,
  holders,
  nodeAt,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sameMark, sliceRuns, withChildren } from './runs-edit.js';
import type { DocRange } from './range.js';

interface Covered {
  readonly path: readonly number[];
  readonly node: ElementNode;
  readonly from: number;
  readonly to: number;
}

// 범위가 덮는 홀더들과 각자의 [from, to) — 래퍼문단은 글이 없어 마크의 자리가 아니다.
function coveredHolders(doc: NabiDoc, start: Position, end: Position, env: EditEnv): Covered[] {
  const out: Covered[] = [];
  for (const { path, node } of holders(doc, env)) {
    if (isWrapper(node, env)) continue;
    const length = holderLength(node, env);
    if (comparePositions({ path, offset: length }, start) <= 0) continue;
    if (comparePositions({ path, offset: 0 }, end) >= 0) continue;
    const samePathAs = (p: Position): boolean =>
      p.path.length === path.length && p.path.every((v, i) => v === path[i]);
    const from = samePathAs(start) ? start.offset : 0;
    const to = samePathAs(end) ? end.offset : length;
    if (from < to) out.push({ path, node, from, to });
  }
  return out;
}

// 덮인 구간의 런만 remap 한 새 홀더.
function remapCovered(
  doc: NabiDoc,
  covered: Covered,
  remap: (marks: readonly ElementNode[]) => readonly ElementNode[],
  env: EditEnv,
): NabiDoc {
  const terminal = terminalOf(env);
  const runs = holderRuns(covered.node, terminal);
  const middle = sliceRuns(runs, covered.from, covered.to).map((run): Run =>
    run.kind === 'text'
      ? { kind: 'text', text: run.text, marks: remap(run.marks) }
      : { kind: 'node', node: run.node, marks: remap(run.marks) },
  );
  const next = fromRuns([
    ...sliceRuns(runs, 0, covered.from),
    ...middle,
    ...sliceRuns(runs, covered.to, Number.MAX_SAFE_INTEGER),
  ]);
  return replaceAt(doc, covered.path, [withChildren(covered.node, next)]);
}

function normalize(range: DocRange): { start: Position; end: Position } {
  const forward = comparePositions(range.anchor, range.focus) <= 0;
  return forward
    ? { start: range.anchor, end: range.focus }
    : { start: range.focus, end: range.anchor };
}

const keepRange = (doc: NabiDoc, range: DocRange): EditResult => ({
  doc,
  caret: range.focus,
  anchor: range.anchor,
});

// 토글 — 덮인 글자 런 전부가 이미 그 마크를 입었을 때만 벗기고, 아니면 입힌다.
export function toggleMark(doc: NabiDoc, range: DocRange, mark: ElementNode, env: EditEnv): EditResult {
  const { start, end } = normalize(range);
  if (comparePositions(start, end) === 0) return keepRange(doc, range);
  const covered = coveredHolders(doc, start, end, env);
  if (covered.length === 0) return keepRange(doc, range);

  const terminal = terminalOf(env);
  const coveredRuns = covered.flatMap((c) =>
    sliceRuns(holderRuns(c.node, terminal), c.from, c.to),
  );
  const judged = coveredRuns.filter((run) => run.kind === 'text');
  const pool = judged.length > 0 ? judged : coveredRuns;
  const allHave = pool.length > 0 && pool.every((run) => run.marks.some((m) => m.w === mark.w));

  let next = doc;
  for (const c of covered) {
    next = remapCovered(next, { ...c, node: nodeAt(next, c.path) ?? c.node }, (marks) => {
      if (allHave) return marks.filter((m) => m.w !== mark.w);
      if (marks.some((m) => sameMark(m, mark))) return marks;
      return [...marks.filter((m) => m.w !== mark.w), mark];
    }, env);
  }
  return keepRange(next, range);
}

// 값 마크 — attrs 를 주면 같은 이름을 교체하며 입히고, null 이면 벗긴다.
export function setMark(
  doc: NabiDoc,
  range: DocRange,
  w: string,
  a: Attrs | null,
  env: EditEnv,
): EditResult {
  const { start, end } = normalize(range);
  if (comparePositions(start, end) === 0) return keepRange(doc, range);
  const covered = coveredHolders(doc, start, end, env);
  let next = doc;
  for (const c of covered) {
    next = remapCovered(next, { ...c, node: nodeAt(next, c.path) ?? c.node }, (marks) => {
      const rest = marks.filter((m) => m.w !== w);
      return a === null ? rest : [...rest, { w, a, ch: [] }];
    }, env);
  }
  return keepRange(next, range);
}

// 문단 속성 값 검증 — cocoon 과 같은 규칙의 이중 방어다 (h: 1~6· a: l/c/r· dc: 1).
function validParagraphAttr(key: string, value: AttrValue): boolean {
  if (key === 'h') return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6;
  if (key === 'a') return value === 'l' || value === 'c' || value === 'r';
  if (key === 'dc') return value === 1;
  return false;
}

// 문단 속성 — 범위가 덮는 문단마다 얹거나(value) 벗긴다(null). 래퍼문단은 정렬(a)만 받는다.
export function setParagraphAttr(
  doc: NabiDoc,
  range: DocRange,
  key: string,
  value: AttrValue | null,
  env: EditEnv,
): EditResult {
  const { start, end } = normalize(range);
  if (value !== null && !validParagraphAttr(key, value)) return keepRange(doc, range);

  // 접힌 캐럿은 자기 문단 하나를 겨눈다.
  const targets: { path: readonly number[]; node: ElementNode }[] = [];
  if (comparePositions(start, end) === 0) {
    const node = nodeAt(doc, start.path);
    if (node) targets.push({ path: start.path, node });
  } else {
    for (const { path, node } of holders(doc, env)) {
      const length = holderLength(node, env);
      if (comparePositions({ path, offset: length }, start) < 0) continue;
      if (comparePositions({ path, offset: 0 }, end) > 0) continue;
      targets.push({ path, node });
    }
  }

  let next = doc;
  for (const target of targets) {
    const node = nodeAt(next, target.path);
    if (!node || node.w !== P) continue; // 인라인 홀더(summary·code)는 문단 속성의 자리가 아니다
    if (isWrapper(node, env) && key !== 'a') continue;
    const attrs: Record<string, AttrValue> = { ...(node.a ?? {}) };
    if (value === null) delete attrs[key];
    else attrs[key] = value;
    const a = Object.keys(attrs).length > 0 ? attrs : undefined;
    const rebuilt: ElementNode = {
      w: node.w,
      ...(a ? { a } : {}),
      ch: node.ch,
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
    next = replaceAt(next, target.path, [rebuilt]);
  }
  return keepRange(next, range);
}
