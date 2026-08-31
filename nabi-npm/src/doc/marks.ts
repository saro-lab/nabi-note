// 값 마크(hl·tc·fs·tf)와 단순 마크(b·i·u·s·sub·sup)가 한 모양을 쓴다 — 길이가 안 바뀌므로 범위는 그대로 돌아간다.
// Value marks (hl/tc/fs/tf) and simple marks (b/i/u/s/sub/sup) share one shape; length never changes, so the range comes back as-is.
import {
  P,
  isWrapper,
  takesAlign,
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

// 래퍼문단은 글이 없어 마크의 자리가 아니므로 건너뛴다.
// Wrapper paragraphs hold no text, so they're not a place for marks and get skipped.
function coveredHolders(doc: NabiDoc, start: Position, end: Position, env: EditEnv): Covered[] {
  const out: Covered[] = [];
  for (const { path, node } of holders(doc, env)) {
    if (isWrapper(node, env)) continue;
    const length = holderLength(node, env);
    if (comparePositions({ path, offset: length }, start) <= 0) continue;
    if (comparePositions({ path, offset: 0 }, end) >= 0) continue;
    const samePathAs = (p: Position): boolean => p.path.length === path.length && p.path.every((v, i) => v === path[i]);
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
  return forward ? { start: range.anchor, end: range.focus } : { start: range.focus, end: range.anchor };
}

const keepRange = (doc: NabiDoc, range: DocRange): EditResult => ({
  doc,
  caret: range.focus,
  anchor: range.anchor,
});

// 덮인 글자 런 전부가 이미 그 마크를 입었을 때만 벗기고, 아니면 입힌다.
// Strips the mark only when every covered run already has it; otherwise applies it.
export function toggleMark(doc: NabiDoc, range: DocRange, mark: ElementNode, env: EditEnv): EditResult {
  const { start, end } = normalize(range);
  if (comparePositions(start, end) === 0) return keepRange(doc, range);
  const covered = coveredHolders(doc, start, end, env);
  if (covered.length === 0) return keepRange(doc, range);

  const terminal = terminalOf(env);
  const coveredRuns = covered.flatMap((c) => sliceRuns(holderRuns(c.node, terminal), c.from, c.to));
  const judged = coveredRuns.filter((run) => run.kind === 'text');
  const pool = judged.length > 0 ? judged : coveredRuns;
  const allHave = pool.length > 0 && pool.every((run) => run.marks.some((m) => m.w === mark.w));

  let next = doc;
  for (const c of covered) {
    next = remapCovered(
      next,
      { ...c, node: nodeAt(next, c.path) ?? c.node },
      (marks) => {
        if (allHave) return marks.filter((m) => m.w !== mark.w);
        if (marks.some((m) => sameMark(m, mark))) return marks;
        return [...marks.filter((m) => m.w !== mark.w), mark];
      },
      env,
    );
  }
  return keepRange(next, range);
}

// attrs를 주면 같은 이름을 교체하며 입히고, null이면 벗긴다.
// Passing attrs replaces any same-named mark; null strips it.
export function setMark(doc: NabiDoc, range: DocRange, w: string, a: Attrs | null, env: EditEnv): EditResult {
  const { start, end } = normalize(range);
  if (comparePositions(start, end) === 0) return keepRange(doc, range);
  const covered = coveredHolders(doc, start, end, env);
  let next = doc;
  for (const c of covered) {
    next = remapCovered(
      next,
      { ...c, node: nodeAt(next, c.path) ?? c.node },
      (marks) => {
        const rest = marks.filter((m) => m.w !== w);
        return a === null ? rest : [...rest, { w, a, ch: [] }];
      },
      env,
    );
  }
  return keepRange(next, range);
}

// cocoon과 같은 규칙의 이중 방어다.
// A second line of defense with the same rules cocoon enforces.
function validParagraphAttr(key: string, value: AttrValue): boolean {
  if (key === 'h') return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6;
  if (key === 'a') return value === 'l' || value === 'c' || value === 'r';
  if (key === 'dc') return value === 1;
  return false;
}

// 래퍼문단은 정렬(a)만 받고, noAlign 물건(코드 상자)은 그것도 안 받는다.
// A wrapper paragraph accepts only alignment; a noAlign object (a code box) refuses even that.
export function setParagraphAttr(
  doc: NabiDoc,
  range: DocRange,
  key: string,
  value: AttrValue | null,
  env: EditEnv,
): EditResult {
  const { start, end } = normalize(range);
  if (value !== null && !validParagraphAttr(key, value)) return keepRange(doc, range);

  // 접힌 캐럿은 자기 문단 하나만 겨눈다.
  // A collapsed caret targets only its own paragraph.
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
    // 인라인 홀더(summary·code)는 문단 속성의 자리가 아니다.
    // An inline holder (summary/code) isn't a place for paragraph attrs.
    if (!node || node.w !== P) continue;
    if (isWrapper(node, env) && key !== 'a') continue;
    if (key === 'a' && !takesAlign(node, env)) continue;
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
