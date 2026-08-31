// 저장 모양(중첩 마크)을 런으로 펴서 자르고 잇고, 다시 최소 중첩으로 되감는다 — 편집 계산만 런 위에서 한다.
// Flattens the stored shape (nested marks) into runs to cut/join, then folds back to minimal nesting; only the edit math runs on runs.
import {
  runLength,
  runsOf,
  type Attrs,
  type ElementNode,
  type NabiNode,
  type Run,
  type Terminal,
} from '../schema/index.js';
import { graphemeBoundaries } from './grapheme.js';

// 이름과 attrs가 같으면 같은 마크다 — `_id`는 안 본다.
// Same name and attrs makes it the same mark; `_id` is ignored.
export function sameMark(a: ElementNode, b: ElementNode): boolean {
  if (a === b) return true;
  if (a.w !== b.w) return false;
  const ka = a.a ? Object.keys(a.a) : [];
  const kb = b.a ? Object.keys(b.a) : [];
  if (ka.length !== kb.length) return false;
  return ka.every((key) => (a.a as Attrs)[key] === (b.a as Attrs)[key]);
}

// 이웃한 같은 마크는 한 엘리먼트로 모이고, 그 묶음이 전부 같은 원본 참조면 `_id`를 지킨다(부분 재그리기).
// Adjacent identical marks merge into one element; if the whole run shares one original reference, its `_id` survives (partial repaint).
export function fromRuns(runs: readonly Run[]): NabiNode[] {
  const build = (slice: readonly Run[], depth: number): NabiNode[] => {
    const out: NabiNode[] = [];
    let i = 0;
    while (i < slice.length) {
      const run = slice[i] as Run;
      const mark = run.marks[depth];
      if (mark === undefined) {
        if (run.kind === 'text') {
          const last = out[out.length - 1];
          if (typeof last === 'string') out[out.length - 1] = last + run.text;
          else if (run.text !== '') out.push(run.text);
        } else {
          out.push(run.node);
        }
        i += 1;
        continue;
      }
      let j = i;
      let sameRef = true;
      while (j < slice.length) {
        const next = (slice[j] as Run).marks[depth];
        if (next === undefined || !sameMark(next, mark)) break;
        if (next !== mark) sameRef = false;
        j += 1;
      }
      const ch = build(slice.slice(i, j), depth + 1);
      const el: ElementNode = {
        w: mark.w,
        ...(mark.a ? { a: mark.a } : {}),
        ch,
        ...(sameRef && mark._id !== undefined ? { _id: mark._id } : {}),
      };
      out.push(el);
      i = j;
    }
    return out;
  };
  return build(runs, 0);
}

// 글자 런은 경계에서 쪼개진다.
// A text run splits right at the [from, to) boundary.
export function sliceRuns(runs: readonly Run[], from: number, to: number): Run[] {
  const out: Run[] = [];
  let at = 0;
  for (const run of runs) {
    const end = at + runLength(run);
    const lo = Math.max(from, at);
    const hi = Math.min(to, end);
    if (lo < hi) {
      if (run.kind === 'text') {
        const text = run.text.slice(lo - at, hi - at);
        if (text !== '') out.push({ kind: 'text', text, marks: run.marks });
      } else {
        out.push(run);
      }
    }
    at = end;
  }
  return out;
}

export function holderRuns(holder: ElementNode, isTerminal: Terminal): Run[] {
  return runsOf(holder, isTerminal);
}

// 이름·attrs·`_id`는 지키고 속만 갈아 끼운다.
// Swaps only the children, keeping name/attrs/`_id`.
export function withChildren(holder: ElementNode, ch: readonly NabiNode[]): ElementNode {
  return {
    w: holder.w,
    ...(holder.a ? { a: holder.a } : {}),
    ch,
    ...(holder._id !== undefined ? { _id: holder._id } : {}),
  };
}

export function runGraphemeBoundaries(runs: readonly Run[]): readonly number[] {
  const out: number[] = [0];
  let offset = 0;
  let text = '';
  const flush = (): void => {
    if (text === '') return;
    for (const boundary of graphemeBoundaries(text)) {
      const absolute = offset + boundary;
      if (absolute !== out[out.length - 1]) out.push(absolute);
    }
    offset += text.length;
    text = '';
  };
  for (const run of runs) {
    if (run.kind === 'text') {
      text += run.text;
      continue;
    }
    flush();
    offset += 1;
    if (offset !== out[out.length - 1]) out.push(offset);
  }
  flush();
  return out;
}

// 오프셋 바로 앞 한 문자소의 너비 — 단말은 한 칸, 앞이 없으면 0.
// Width of the one grapheme just before the offset; a terminal counts as one, 0 if there's nothing before.
export function stepBefore(runs: readonly Run[], offset: number): number {
  if (offset <= 0) return 0;
  const boundaries = runGraphemeBoundaries(runs);
  let before = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return Math.max(0, offset - before);
    before = boundary;
  }
  return Math.max(0, offset - before);
}

// stepBefore의 대칭 — 뒤가 없으면 0.
// The mirror of stepBefore; 0 if there's nothing after.
export function stepAfter(runs: readonly Run[], offset: number): number {
  for (const boundary of runGraphemeBoundaries(runs)) {
    if (boundary > offset) return boundary - offset;
  }
  return 0;
}
