// 블록 매칭은 내용만 본다 — _id는 안 쓴다: 저장된 과거본엔 지금 트리로 이어지는 id 계보가 없을 수 있다(260825_001 4-1)
// Block matching looks only at content, not `_id`: a saved past version may lack id lineage to the current tree (260825_001 4-1)
import { diffSeq, type EditRun } from './myers.js';
import { changedRanges, type CharRange } from './paint.js';

export type DiffKind = 'same' | 'changed' | 'removed' | 'added' | 'moved';

export interface DiffEntry {
  readonly kind: DiffKind;
  // removed는 after가, added는 before가 null이다
  // removed has null `after`, added has null `before`
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

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const ca = [...a];
  const cb = [...b];
  if (ca.length + cb.length === 0) return 1;
  let eq = 0;
  for (const run of diffSeq(ca, cb)) if (run.op === 'eq') eq += run.n;
  return (2 * eq) / (ca.length + cb.length);
}

// 이 아래는 "고친 블록"이 아니라 지우고 새로 쓴 것으로 본다
// Below this, treat it as delete+add rather than an edited block
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

  let pendingDel: number[] = [];
  const flushGap = (pendingIns: number[]): void => {
    const pairs: Array<{ bi: number; ai: number; score: number }> = [];
    for (const bi of pendingDel)
      for (const ai of pendingIns) {
        const score = similarity(before[bi]!.text, after[ai]!.text);
        if (score >= PAIR_THRESHOLD) pairs.push({ bi, ai, score });
      }
    // 점수 우선, 문서 순서로 동점 정리 — 순회·Map 순서에 안 흔들리게
    // Score first, document order breaks ties — independent of traversal/Map order
    pairs.sort(
      (x, y) => y.score - x.score || Math.abs(x.bi - x.ai) - Math.abs(y.bi - y.ai) || x.bi - y.bi || x.ai - y.ai,
    );
    const usedB = new Set<number>();
    const usedA = new Set<number>();
    const chosen: Array<{ bi: number; ai: number }> = [];
    for (const pair of pairs) {
      if (usedB.has(pair.bi) || usedA.has(pair.ai)) continue;
      usedB.add(pair.bi);
      usedA.add(pair.ai);
      chosen.push(pair);
    }
    chosen.sort((x, y) => x.bi - y.bi || x.ai - y.ai);
    for (const pair of chosen)
      entries.push(changedEntry({ before: before[pair.bi]!, after: after[pair.ai]! }, pair.bi, pair.ai));
    for (const bi of pendingDel) if (!usedB.has(bi)) entries.push({ kind: 'removed', before: bi, after: null });
    for (const ai of pendingIns) if (!usedA.has(ai)) entries.push({ kind: 'added', before: null, after: ai });
    pendingDel = [];
  };

  for (const run of runs) {
    if (run.op === 'eq') {
      const pendingIns: number[] = [];
      flushGap(pendingIns);
      for (let k = 0; k < run.n; k += 1) {
        entries.push({ kind: 'same', before: run.a + k, after: run.b + k });
      }
      continue;
    }
    if (run.op === 'del') {
      for (let k = 0; k < run.n; k += 1) pendingDel.push(run.a + k);
      continue;
    }
    const pendingIns: number[] = [];
    for (let k = 0; k < run.n; k += 1) pendingIns.push(run.b + k);
    flushGap(pendingIns);
  }
  flushGap([]);

  // 열쇠가 같은 removed·added 쌍은 한 블록이 자리를 옮긴 것으로 접는다
  // A removed/added pair sharing a key collapses into one moved block
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
