// 블록(최상위 문단) 매칭 — **내용만 본다.** `_id` 는 안 쓴다(260825_001 4절 1번): 이 기능의
// 흔한 쓰임은 이미 저장된 과거본과 지금 상태의 비교라, 저장된 쪽에 지금 트리로 이어지는 `_id`
// 계보가 있으리라는 보장이 없다.
//
// 세 걸음이다:
//   1. 조립 HTML 을 그대로 열쇠로 Myers — 같은 블록을 잇는다(결정적 조립이라 같은 내용 = 같은 글자열).
//   2. 남은 틈 안에서 글자 유사도로 "고쳐진 블록" 짝을 잇고 글자 단위 diff 를 단다.
//   3. 남은 삭제·추가 중 열쇠가 같은 쌍을 "이동"으로 접는다.
import { diffSeq, type EditRun } from './myers.js';
import { changedRanges, type CharRange } from './paint.js';

export type DiffKind = 'same' | 'changed' | 'removed' | 'added' | 'moved';

export interface DiffEntry {
  readonly kind: DiffKind;
  // 각 문서의 최상위 블록 인덱스 — removed 는 after 가, added 는 before 가 null 이다.
  readonly before: number | null;
  readonly after: number | null;
  readonly beforeRanges?: readonly CharRange[];
  readonly afterRanges?: readonly CharRange[];
}

export interface MatchBlock {
  readonly key: string;
  readonly text: string;
  readonly formats: readonly string[];
}

// 두 글자열의 닮음 — 공통 코드포인트 비율(0~1).
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const ca = [...a];
  const cb = [...b];
  if (ca.length + cb.length === 0) return 1;
  let eq = 0;
  for (const run of diffSeq(ca, cb)) if (run.op === 'eq') eq += run.n;
  return (2 * eq) / (ca.length + cb.length);
}

// 이 아래면 "고친 블록"이 아니라 지우고 새로 쓴 것이다.
const PAIR_THRESHOLD = 0.4;

function mergeRanges(first: readonly CharRange[], second: readonly CharRange[]): CharRange[] {
  const sorted = [...first, ...second].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: CharRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push(range);
      continue;
    }
    merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, range.end) };
  }
  return merged;
}

function formatChangedRanges(
  runs: readonly EditRun[],
  before: readonly string[],
  after: readonly string[],
): { readonly before: CharRange[]; readonly after: CharRange[] } {
  const beforeRanges: CharRange[] = [];
  const afterRanges: CharRange[] = [];
  for (const run of runs) {
    if (run.op !== 'eq') continue;
    for (let k = 0; k < run.n; k += 1) {
      const bi = run.a + k;
      const ai = run.b + k;
      if ((before[bi] ?? '') === (after[ai] ?? '')) continue;
      beforeRanges.push({ start: bi, end: bi + 1 });
      afterRanges.push({ start: ai, end: ai + 1 });
    }
  }
  return { before: mergeRanges(beforeRanges, []), after: mergeRanges(afterRanges, []) };
}

function changedEntry(blocks: { before: MatchBlock; after: MatchBlock }, bi: number, ai: number): DiffEntry {
  const runs = diffSeq([...blocks.before.text], [...blocks.after.text]);
  const { del, ins } = changedRanges(runs);
  const formatted = formatChangedRanges(runs, blocks.before.formats, blocks.after.formats);
  return {
    kind: 'changed',
    before: bi,
    after: ai,
    beforeRanges: mergeRanges(del, formatted.before),
    afterRanges: mergeRanges(ins, formatted.after),
  };
}

export function matchBlocks(before: readonly MatchBlock[], after: readonly MatchBlock[]): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const runs = diffSeq(
    before.map((block) => block.key),
    after.map((block) => block.key),
  );

  // del run 과 ins run 이 붙어 오면 한 틈이다 — 그 안에서 짝을 찾는다.
  let pendingDel: number[] = [];
  const flushGap = (pendingIns: number[]): void => {
    let i = 0;
    let j = 0;
    while (i < pendingDel.length && j < pendingIns.length) {
      const bi = pendingDel[i] as number;
      const ai = pendingIns[j] as number;
      const b = before[bi] as MatchBlock;
      const a = after[ai] as MatchBlock;
      if (similarity(b.text, a.text) >= PAIR_THRESHOLD) {
        entries.push(changedEntry({ before: b, after: a }, bi, ai));
        i += 1;
        j += 1;
      } else {
        entries.push({ kind: 'removed', before: bi, after: null });
        i += 1;
      }
    }
    while (i < pendingDel.length) {
      entries.push({ kind: 'removed', before: pendingDel[i] as number, after: null });
      i += 1;
    }
    while (j < pendingIns.length) {
      entries.push({ kind: 'added', before: null, after: pendingIns[j] as number });
      j += 1;
    }
    pendingDel = [];
  };

  for (const run of runs) {
    if (run.op === 'eq') {
      flushGap([]);
      for (let k = 0; k < run.n; k += 1) {
        entries.push({ kind: 'same', before: run.a + k, after: run.b + k });
      }
      continue;
    }
    if (run.op === 'del') {
      flushGap([]);
      for (let k = 0; k < run.n; k += 1) pendingDel.push(run.a + k);
      continue;
    }
    const pendingIns: number[] = [];
    for (let k = 0; k < run.n; k += 1) pendingIns.push(run.b + k);
    flushGap(pendingIns);
  }
  flushGap([]);

  // 이동 접기 — 열쇠가 같은 removed·added 쌍은 한 블록이 자리를 옮긴 것이다.
  const removedByKey = new Map<string, number[]>();
  entries.forEach((entry, at) => {
    if (entry.kind !== 'removed') return;
    const key = (before[entry.before as number] as MatchBlock).key;
    const list = removedByKey.get(key);
    if (list) list.push(at);
    else removedByKey.set(key, [at]);
  });
  const dropped = new Set<number>();
  entries.forEach((entry, at) => {
    if (entry.kind !== 'added') return;
    const key = (after[entry.after as number] as MatchBlock).key;
    const list = removedByKey.get(key);
    const removedAt = list?.shift();
    if (removedAt === undefined) return;
    const removed = entries[removedAt] as DiffEntry;
    entries[removedAt] = { kind: 'moved', before: removed.before, after: entry.after };
    dropped.add(at);
  });
  return entries.filter((_, at) => !dropped.has(at));
}
