// 런 편집 — 저장 모양(중첩 마크)을 런으로 펴서(runsOf, 02) 자르고 잇고, 다시 최소 중첩으로
// 되감는다(fromRuns). 저장은 언제나 중첩 한 모양이고, 편집 계산만 런 위에서 한다.
import {
  runLength,
  runsOf,
  type Attrs,
  type ElementNode,
  type NabiNode,
  type Run,
  type Terminal,
} from '../schema/index.js';

// 마크가 같은가 — 이름과 attrs 가 같으면 같은 마크다 (`_id` 는 안 본다).
export function sameMark(a: ElementNode, b: ElementNode): boolean {
  if (a === b) return true;
  if (a.w !== b.w) return false;
  const ka = a.a ? Object.keys(a.a) : [];
  const kb = b.a ? Object.keys(b.a) : [];
  if (ka.length !== kb.length) return false;
  return ka.every((key) => (a.a as Attrs)[key] === (b.a as Attrs)[key]);
}

// 런 목록을 다시 자식 목록으로 — 이웃한 같은 마크는 한 엘리먼트로 모이고, 이웃한 글자는 이어진다.
// 한 묶음의 런이 전부 같은 원본 마크 참조를 들고 있으면 그 참조의 `_id` 를 지킨다 (부분 재그리기).
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

// [from, to) 칸 구간의 런만 잘라 낸다 — 글자 런은 경계에서 쪼개진다.
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

// 홀더의 런 — 편의 축약.
export function holderRuns(holder: ElementNode, isTerminal: Terminal): Run[] {
  return runsOf(holder, isTerminal);
}

// 홀더의 속만 갈아 끼운 새 홀더 — 이름·attrs·`_id` 는 지킨다.
export function withChildren(holder: ElementNode, ch: readonly NabiNode[]): ElementNode {
  return {
    w: holder.w,
    ...(holder.a ? { a: holder.a } : {}),
    ch,
    ...(holder._id !== undefined ? { _id: holder._id } : {}),
  };
}

// 오프셋 바로 앞 한 칸의 너비 — 글자는 코드 포인트 단위로 물러난다(서로게이트 쌍 보호)
// 단말은 한 칸이다. 앞이 없으면 0.
export function stepBefore(runs: readonly Run[], offset: number): number {
  if (offset <= 0) return 0;
  let at = 0;
  for (const run of runs) {
    const end = at + runLength(run);
    if (offset <= end) {
      if (run.kind === 'node') return 1;
      const local = offset - at;
      if (local >= 2 && isPair(run.text.charCodeAt(local - 2), run.text.charCodeAt(local - 1))) return 2;
      return 1;
    }
    at = end;
  }
  return 0;
}

// 오프셋 바로 뒤 한 칸의 너비 — stepBefore 의 대칭. 뒤가 없으면 0.
export function stepAfter(runs: readonly Run[], offset: number): number {
  let at = 0;
  for (const run of runs) {
    const end = at + runLength(run);
    if (offset < end) {
      if (run.kind === 'node') return 1;
      const local = offset - at;
      if (local + 1 < run.text.length && isPair(run.text.charCodeAt(local), run.text.charCodeAt(local + 1))) return 2;
      return 1;
    }
    at = end;
  }
  return 0;
}

// 서로게이트 쌍인가 — 높은 짝 뒤에 낮은 짝.
function isPair(hi: number, lo: number): boolean {
  return hi >= 0xd800 && hi <= 0xdbff && lo >= 0xdc00 && lo <= 0xdfff;
}
