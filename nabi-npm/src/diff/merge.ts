import { $guarded, $toJson } from '../schema/json.js';
import type { NabiDoc } from '../schema/types.js';
import type { Registry, StoredHtmlOptions } from '../wing/index.js';
import { normalizeMergeInput } from '../merge/input.js';
import { joinMergeUnits, mergeUnitKey, splitMergeUnits, type MergeUnit } from '../merge/units.js';
import { diffSeq } from './myers.js';

export interface DiffMergeRange {
  readonly start: number;
  readonly end: number;
}

export interface DiffMergeChange {
  readonly id: string;
  readonly kind: 'changed' | 'removed' | 'added' | 'moved';
  readonly beforeRanges: readonly DiffMergeRange[];
  readonly afterRanges: readonly DiffMergeRange[];
  readonly beforeBlocks: readonly number[];
  readonly afterBlocks: readonly number[];
  readonly beforePosition: { readonly block: number; readonly offset: number } | null;
  readonly afterPosition: { readonly block: number; readonly offset: number } | null;
}

export interface DiffMergePlan {
  readonly before: readonly unknown[];
  readonly after: readonly unknown[];
  readonly changes: readonly DiffMergeChange[];
}

export interface DiffMergeProposal {
  readonly before: unknown[];
  readonly after: unknown[];
  readonly result: unknown[];
  readonly changeId: string;
  readonly revision: number;
  readonly signal: AbortSignal;
}

interface Patch {
  readonly before: DiffMergeRange;
  readonly after: DiffMergeRange;
}

interface Prepared {
  readonly before: NabiDoc;
  readonly after: NabiDoc;
  readonly beforeUnits: readonly MergeUnit[];
  readonly afterUnits: readonly MergeUnit[];
  readonly groups: readonly { readonly change: DiffMergeChange; readonly patches: readonly Patch[] }[];
}

function fingerprint(parts: readonly string[]): string {
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (const part of parts) {
    for (let at = 0; at < part.length; at += 1) {
      const value = part.charCodeAt(at);
      a = Math.imul(a ^ value, 0x01000193);
      b = Math.imul(b ^ value, 0x85ebca6b);
    }
    a = Math.imul(a ^ part.length, 0x01000193);
    b = Math.imul(b ^ part.length, 0xc2b2ae35);
  }
  return `${(a >>> 0).toString(36)}-${(b >>> 0).toString(36)}`;
}

function prepare(before: unknown, after: unknown, registry: Registry, options?: StoredHtmlOptions): Prepared | null {
  const beforeDoc = normalizeMergeInput(before, registry, options);
  const afterDoc = normalizeMergeInput(after, registry, options);
  if (!beforeDoc || !afterDoc) return null;
  const beforeUnits = splitMergeUnits(beforeDoc, registry);
  const afterUnits = splitMergeUnits(afterDoc, registry);
  const beforeKeys = beforeUnits.map(mergeUnitKey);
  const afterKeys = afterUnits.map(mergeUnitKey);
  const patches: Patch[] = [];
  let current: { before: { start: number; end: number }; after: { start: number; end: number } } | null = null;
  for (const run of diffSeq(beforeKeys, afterKeys)) {
    if (run.op === 'eq') {
      current = null;
      continue;
    }
    if (!current) {
      current = { before: { start: run.a, end: run.a }, after: { start: run.b, end: run.b } };
      patches.push(current);
    }
    if (run.op === 'del') current.before.end = run.a + run.n;
    else current.after.end = run.b + run.n;
  }

  const parents = patches.map((_, at) => at);
  const parent = (at: number): number => {
    while (parents[at] !== at) at = parents[at]!;
    return at;
  };
  const removed = new Map<string, number[]>();
  patches.forEach((patch, at) => {
    for (let unit = patch.before.start; unit < patch.before.end; unit += 1) {
      const key = beforeKeys[unit]!;
      const found = removed.get(key) ?? [];
      found.push(at);
      removed.set(key, found);
    }
  });
  patches.forEach((patch, at) => {
    for (let unit = patch.after.start; unit < patch.after.end; unit += 1) {
      for (const other of removed.get(afterKeys[unit]!) ?? []) {
        const first = parent(at);
        const second = parent(other);
        parents[Math.max(first, second)] = Math.min(first, second);
      }
    }
  });

  const grouped = new Map<number, Patch[]>();
  patches.forEach((patch, at) => {
    const group = parent(at);
    const found = grouped.get(group) ?? [];
    found.push(patch);
    grouped.set(group, found);
  });
  const source = fingerprint([...beforeKeys, '\u0000after', ...afterKeys]);
  const blocks = (units: readonly MergeUnit[], ranges: readonly DiffMergeRange[]): number[] => [
    ...new Set(ranges.flatMap((range) => units.slice(range.start, range.end).map((unit) => unit.paragraph))),
  ];
  const groups = [...grouped].map(([at, group]) => {
    const beforeRanges = group.map((patch) => patch.before);
    const afterRanges = group.map((patch) => patch.after);
    const hasBefore = beforeRanges.some((range) => range.start < range.end);
    const hasAfter = afterRanges.some((range) => range.start < range.end);
    const kind: DiffMergeChange['kind'] =
      group.length > 1 ? 'moved' : !hasBefore ? 'added' : !hasAfter ? 'removed' : 'changed';
    const beforeUnit = beforeRanges.flatMap((range) => beforeUnits.slice(range.start, range.end))[0];
    const afterUnit = afterRanges.flatMap((range) => afterUnits.slice(range.start, range.end))[0];
    return {
      change: {
        id: `diff-${source}-${at}`,
        kind,
        beforeRanges,
        afterRanges,
        beforeBlocks: blocks(beforeUnits, beforeRanges),
        afterBlocks: blocks(afterUnits, afterRanges),
        beforePosition: beforeUnit ? { block: beforeUnit.paragraph, offset: beforeUnit.start } : null,
        afterPosition: afterUnit ? { block: afterUnit.paragraph, offset: afterUnit.start } : null,
      },
      patches: group,
    };
  });
  return { before: beforeDoc, after: afterDoc, beforeUnits, afterUnits, groups };
}

export function diffMergeChanges(
  before: unknown,
  after: unknown,
  registry: Registry,
  options?: StoredHtmlOptions,
): DiffMergePlan | null {
  return $guarded('diffMergeChanges', null, () => {
    const prepared = prepare(before, after, registry, options);
    if (!prepared) return null;
    return {
      before: $toJson(prepared.before),
      after: $toJson(prepared.after),
      changes: prepared.groups.map((group) => group.change),
    };
  });
}

export function applyDiffMerge(
  before: unknown,
  after: unknown,
  changeId: string,
  registry: Registry,
  options?: StoredHtmlOptions,
): unknown[] | null {
  return $guarded('applyDiffMerge', null, () => {
    const prepared = prepare(before, after, registry, options);
    const group = prepared?.groups.find((candidate) => candidate.change.id === changeId);
    if (!prepared || !group) return null;
    let result = [...prepared.afterUnits];
    for (const patch of [...group.patches].reverse()) {
      result = [
        ...result.slice(0, patch.after.start),
        ...prepared.beforeUnits.slice(patch.before.start, patch.before.end),
        ...result.slice(patch.after.end),
      ];
    }
    return $toJson(joinMergeUnits(result, registry));
  });
}
