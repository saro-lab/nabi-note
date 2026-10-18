import { diffSeq } from '../diff/myers.js';
import { $guarded } from '../schema/json.js';
import type { NabiDoc } from '../schema/types.js';
import type { Registry, StoredHtmlOptions } from '../wing/index.js';
import { normalizeMergeInput } from './input.js';
import { joinMergeUnits, mergeUnitKey, splitMergeUnits, type MergeUnit } from './units.js';

export type MergeOptions = StoredHtmlOptions;

export interface MergeConflict {
  readonly id: string;
  readonly base: readonly MergeUnit[];
  readonly local: readonly MergeUnit[];
  readonly incoming: readonly MergeUnit[];
  readonly baseStart: number;
  readonly baseEnd: number;
  readonly incomingStart: number;
  readonly incomingEnd: number;
  readonly resultStart: number;
  readonly resultEnd: number;
  readonly reason: 'overlap' | 'ambiguous';
}

export interface DocMerge {
  readonly base: NabiDoc;
  readonly local: NabiDoc;
  readonly incoming: NabiDoc;
  readonly result: NabiDoc;
  readonly conflicts: readonly MergeConflict[];
}

interface Change {
  readonly start: number;
  readonly end: number;
  readonly units: readonly MergeUnit[];
  readonly side: 'local' | 'incoming';
  from: number;
  to: number;
}

function changes(base: readonly MergeUnit[], side: readonly MergeUnit[], name: Change['side']): Change[] {
  const out: Change[] = [];
  let current: { start: number; end: number; units: MergeUnit[] } | undefined;
  const flush = (): void => {
    if (current) {
      const removed = current.end - current.start;
      if (removed > 1 && (current.units.length === 0 || current.units.length === removed)) {
        for (let index = 0; index < removed; index += 1) {
          const start = current.start + index;
          out.push({
            start,
            end: start + 1,
            units: current.units.slice(index, index + 1),
            side: name,
            from: start,
            to: start + 1,
          });
        }
      } else out.push({ ...current, side: name, from: current.start, to: current.end });
    }
    current = undefined;
  };
  const baseKeys = base.map(mergeUnitKey);
  const sideKeys = side.map(mergeUnitKey);
  for (const run of diffSeq(baseKeys, sideKeys)) {
    if (run.op === 'eq') {
      flush();
      continue;
    }
    current ??= { start: run.a, end: run.a, units: [] };
    if (run.op === 'del') current.end = run.a + run.n;
    else current.units.push(...side.slice(run.b, run.b + run.n));
  }
  flush();
  for (const change of out) {
    const count = change.end - change.start;
    if (count !== change.units.length) continue;
    for (let offset = 0; offset < count; offset += 1) {
      const before = base[change.start + offset]!;
      const after = change.units[offset]!;
      const beforeAttrs = Object.entries(before.node.a ?? {}).sort();
      const afterAttrs = Object.entries(after.node.a ?? {}).sort();
      if (JSON.stringify(beforeAttrs) === JSON.stringify(afterAttrs)) continue;
      let from = change.start + offset;
      let to = from + 1;
      while (from > 0 && base[from - 1]!.paragraph === before.paragraph) from -= 1;
      while (to < base.length && base[to]!.paragraph === before.paragraph) to += 1;
      change.from = Math.min(change.from, from);
      change.to = Math.max(change.to, to);
    }
  }
  const positions = new Map<string, number[]>();
  baseKeys.forEach((key, index) => {
    const found = positions.get(key) ?? [];
    found.push(index);
    positions.set(key, found);
  });
  for (const change of out) {
    for (let index = change.start; index < change.end; index += 1) {
      const repeated = positions.get(baseKeys[index]!)!;
      if (repeated.length > 1) {
        change.from = Math.min(change.from, repeated[0]!);
        change.to = Math.max(change.to, repeated[repeated.length - 1]! + 1);
      }
      for (const target of out) {
        if (target === change || !target.units.some((unit) => mergeUnitKey(unit) === baseKeys[index])) continue;
        const from = Math.min(change.from, target.from);
        const to = Math.max(change.to, target.to);
        change.from = target.from = from;
        change.to = target.to = to;
      }
    }
  }
  return out;
}

function overlaps(a: { from: number; to: number }, b: { from: number; to: number }): boolean {
  if (a.from === a.to && b.from === b.to) return a.from === b.from;
  if (a.from === a.to) return a.from > b.from && a.from < b.to;
  if (b.from === b.to) return b.from > a.from && b.from < a.to;
  return a.from < b.to && b.from < a.to;
}

function applyRegion(base: readonly MergeUnit[], from: number, to: number, edits: readonly Change[]): MergeUnit[] {
  const result: MergeUnit[] = [];
  let cursor = from;
  for (const change of [...edits].sort((a, b) => a.start - b.start || a.end - b.end)) {
    result.push(...base.slice(cursor, change.start), ...change.units);
    cursor = change.end;
  }
  result.push(...base.slice(cursor, to));
  return result;
}

function sameUnits(a: readonly MergeUnit[], b: readonly MergeUnit[]): boolean {
  return a.length === b.length && a.every((unit, index) => mergeUnitKey(unit) === mergeUnitKey(b[index]!));
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function mergeDocs(
  base: unknown,
  local: unknown,
  incoming: unknown,
  registry: Registry,
  options?: MergeOptions,
): DocMerge | null {
  return $guarded('mergeDocs', null, () => {
    const baseDoc = normalizeMergeInput(base, registry, options);
    const localDoc = normalizeMergeInput(local, registry, options);
    const incomingDoc = normalizeMergeInput(incoming, registry, options);
    if (!baseDoc || !localDoc || !incomingDoc) return null;
    const baseUnits = splitMergeUnits(baseDoc, registry);
    const localUnits = splitMergeUnits(localDoc, registry);
    const incomingUnits = splitMergeUnits(incomingDoc, registry);
    const edits = [...changes(baseUnits, localUnits, 'local'), ...changes(baseUnits, incomingUnits, 'incoming')].sort(
      (a, b) => a.from - b.from || a.to - b.to,
    );
    const groups: { from: number; to: number; edits: Change[] }[] = [];
    for (const change of edits) {
      const last = groups[groups.length - 1];
      if (last && overlaps(last, change)) {
        last.from = Math.min(last.from, change.from);
        last.to = Math.max(last.to, change.to);
        last.edits.push(change);
      } else groups.push({ from: change.from, to: change.to, edits: [change] });
    }
    const result: MergeUnit[] = [];
    const conflicts: MergeConflict[] = [];
    let cursor = 0;
    let incomingCursor = 0;
    for (const group of groups) {
      result.push(...baseUnits.slice(cursor, group.from));
      incomingCursor += group.from - cursor;
      const left = group.edits.filter((edit) => edit.side === 'local');
      const right = group.edits.filter((edit) => edit.side === 'incoming');
      const localPart = applyRegion(baseUnits, group.from, group.to, left);
      const incomingPart = applyRegion(baseUnits, group.from, group.to, right);
      const selected = left.length === 0 ? incomingPart : localPart;
      if (left.length > 0 && right.length > 0 && !sameUnits(localPart, incomingPart)) {
        conflicts.push({
          id: `merge-${conflicts.length + 1}`,
          base: baseUnits.slice(group.from, group.to),
          local: localPart,
          incoming: incomingPart,
          baseStart: group.from,
          baseEnd: group.to,
          incomingStart: incomingCursor,
          incomingEnd: incomingCursor + incomingPart.length,
          resultStart: result.length,
          resultEnd: result.length + selected.length,
          reason: group.edits.some((edit) => edit.from !== edit.start || edit.to !== edit.end)
            ? 'ambiguous'
            : 'overlap',
        });
      }
      result.push(...selected);
      incomingCursor += incomingPart.length;
      cursor = group.to;
    }
    result.push(...baseUnits.slice(cursor));
    return freeze({
      base: baseDoc,
      local: localDoc,
      incoming: incomingDoc,
      result: joinMergeUnits(result, registry),
      conflicts,
    });
  });
}
