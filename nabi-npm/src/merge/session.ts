import { caretAt, docStart, normalizeSelection } from '../caret/index.js';
import { hostOf } from '../editor/host.js';
import type { Nabi, NabiOptions } from '../editor/nabi.js';
import type { LocaleInput } from '../locale/index.js';
import type { NabiDoc } from '../schema/types.js';
import { createNabiWith, makeRegistry, type Registry, type Wing } from '../wing/index.js';
import { diffSeq } from '../diff/myers.js';
import { mergeDocs, type DocMerge, type MergeConflict } from './model.js';
import { mergeUnitKey, replaceMergeRange, splitMergeUnits, type MergeUnit } from './units.js';

export type MergeResolution = 'base' | 'incoming' | 'current';
export type MergeSource = Exclude<MergeResolution, 'current'>;

export interface MergeChange {
  readonly id: string;
  readonly source: MergeSource;
  readonly revision: number;
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly resultStart: number;
  readonly resultEnd: number;
  readonly kind: 'insert' | 'delete' | 'replace';
  readonly conflictIds: readonly string[];
  readonly ambiguous: boolean;
}

export interface MergeConflictState extends MergeConflict {
  readonly status: 'unresolved' | MergeResolution;
  readonly ambiguous: boolean;
}

export interface MergeState {
  readonly revision: number;
  readonly conflicts: readonly MergeConflictState[];
  readonly unresolvedCount: number;
  readonly canApply: boolean;
  readonly canConfirm: boolean;
}

export interface MergeSessionOptions {
  readonly base: unknown;
  readonly local: unknown;
  readonly incoming: unknown;
  readonly wings: readonly Wing[] | { build(): readonly Wing[] };
  readonly locale?: LocaleInput;
  readonly allowLocalUrls?: boolean;
  readonly editorOptions?: Omit<NabiOptions, 'doc'>;
}

export interface MergeSession {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly model: DocMerge;
  getState(): MergeState;
  getChanges(source: MergeSource): readonly MergeChange[];
  applyChange(change: MergeChange): boolean;
  resolve(id: string, resolution: MergeResolution): boolean;
  onChange(listener: (state: MergeState) => void): () => void;
  hold(): () => void;
  dispose(): void;
}

interface ChangeRange {
  readonly start: number;
  readonly end: number;
  readonly nextStart: number;
  readonly nextEnd: number;
}

function changes(before: readonly string[], after: readonly string[]): ChangeRange[] {
  const ranges: ChangeRange[] = [];
  for (const run of diffSeq(before, after)) {
    if (run.op === 'eq') continue;
    const end = run.a + (run.op === 'del' ? run.n : 0);
    const nextEnd = run.b + (run.op === 'ins' ? run.n : 0);
    const last = ranges.at(-1);
    if (last && last.end === run.a && last.nextEnd === run.b) {
      ranges[ranges.length - 1] = { ...last, end, nextEnd };
    } else ranges.push({ start: run.a, end, nextStart: run.b, nextEnd });
  }
  return ranges;
}

function mapped(index: number, end: boolean, ranges: readonly ChangeRange[]): number {
  let shift = 0;
  for (const change of ranges) {
    if (index < change.start) break;
    if (index <= change.end) {
      if (change.start === change.end) return end ? change.nextStart : change.nextEnd;
      if (index === change.start) return change.nextStart;
      if (index === change.end) return change.nextEnd;
      return end ? change.nextEnd : change.nextStart;
    }
    shift = change.nextEnd - change.end;
  }
  return index + shift;
}

function freezeConflicts(conflicts: readonly MergeConflictState[]): readonly MergeConflictState[] {
  return Object.freeze(conflicts.map((conflict) => Object.freeze(conflict)));
}

function overlaps(start: number, end: number, otherStart: number, otherEnd: number): boolean {
  if (start === end && otherStart === otherEnd) return start === otherStart;
  if (start === end) return start > otherStart && start < otherEnd;
  if (otherStart === otherEnd) return otherStart > start && otherStart < end;
  return start < otherEnd && end > otherStart;
}

function sourceRange(conflict: MergeConflict, source: MergeSource): readonly [number, number] {
  return source === 'base' ? [conflict.baseStart, conflict.baseEnd] : [conflict.incomingStart, conflict.incomingEnd];
}

function paragraphRange(units: readonly MergeUnit[], index: number): readonly [number, number] {
  const paragraph = units[index]!.paragraph;
  let start = index;
  let end = index + 1;
  while (start > 0 && units[start - 1]!.paragraph === paragraph) start -= 1;
  while (end < units.length && units[end]!.paragraph === paragraph) end += 1;
  return [start, end];
}

function lineChanges(
  before: readonly MergeUnit[],
  after: readonly MergeUnit[],
  conflicts: readonly MergeConflictState[],
  source: MergeSource,
): ChangeRange[] {
  let lines: ChangeRange[] = [];
  const protectedRanges: ChangeRange[] = [];
  const beforeKeys = before.map(mergeUnitKey);
  const afterKeys = after.map(mergeUnitKey);
  const ranges: ChangeRange[] = [];
  let cursor = 0;
  let nextCursor = 0;
  let anchored = true;
  const append = (start: number, end: number, nextStart: number, nextEnd: number): void => {
    for (const range of changes(beforeKeys.slice(start, end), afterKeys.slice(nextStart, nextEnd))) {
      ranges.push({
        start: start + range.start,
        end: start + range.end,
        nextStart: nextStart + range.nextStart,
        nextEnd: nextStart + range.nextEnd,
      });
    }
  };
  for (const conflict of conflicts) {
    const [nextStart, nextEnd] = sourceRange(conflict, source);
    if (conflict.ambiguous || conflict.resultStart < cursor || nextStart < nextCursor) {
      anchored = false;
      break;
    }
    append(cursor, conflict.resultStart, nextCursor, nextStart);
    append(conflict.resultStart, conflict.resultEnd, nextStart, nextEnd);
    cursor = conflict.resultEnd;
    nextCursor = nextEnd;
  }
  if (anchored) append(cursor, before.length, nextCursor, after.length);
  else ranges.splice(0, ranges.length, ...changes(beforeKeys, afterKeys));
  for (const range of ranges) {
    const count = Math.max(range.end - range.start, range.nextEnd - range.nextStart);
    for (let index = 0; index < count; index += 1) {
      const start = Math.min(range.start + index, range.end);
      const end = Math.min(start + 1, range.end);
      const nextStart = Math.min(range.nextStart + index, range.nextEnd);
      const nextEnd = Math.min(nextStart + 1, range.nextEnd);
      lines.push({ start, end, nextStart, nextEnd });
      if (start === end || nextStart === nextEnd) continue;
      const previous = before[start]!;
      const next = after[nextStart]!;
      if (
        previous.node.w !== 'p' ||
        next.node.w !== 'p' ||
        JSON.stringify(Object.entries(previous.node.a ?? {}).sort()) ===
          JSON.stringify(Object.entries(next.node.a ?? {}).sort())
      )
        continue;
      const [from, to] = paragraphRange(before, start);
      const [nextFrom, nextTo] = paragraphRange(after, nextStart);
      protectedRanges.push({ start: from, end: to, nextStart: nextFrom, nextEnd: nextTo });
    }
  }
  for (const conflict of conflicts) {
    if (conflict.reason !== 'ambiguous') continue;
    const [nextStart, nextEnd] = sourceRange(conflict, source);
    protectedRanges.push({ start: conflict.resultStart, end: conflict.resultEnd, nextStart, nextEnd });
  }
  for (const protectedRange of protectedRanges) {
    let merged = protectedRange;
    const included = new Set<ChangeRange>();
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const line of lines) {
        if (included.has(line)) continue;
        if (
          !overlaps(line.start, line.end, merged.start, merged.end) &&
          !overlaps(line.nextStart, line.nextEnd, merged.nextStart, merged.nextEnd)
        )
          continue;
        included.add(line);
        merged = {
          start: Math.min(merged.start, line.start),
          end: Math.max(merged.end, line.end),
          nextStart: Math.min(merged.nextStart, line.nextStart),
          nextEnd: Math.max(merged.nextEnd, line.nextEnd),
        };
        expanded = true;
      }
    }
    if (included.size > 0) lines = [...lines.filter((line) => !included.has(line)), merged];
  }
  return lines.sort((a, b) => a.start - b.start || a.nextStart - b.nextStart);
}

function affectsConflict(change: ChangeRange, conflict: MergeConflictState, source: MergeSource): boolean {
  if (
    change.start !== change.end &&
    conflict.resultStart !== conflict.resultEnd &&
    overlaps(change.start, change.end, conflict.resultStart, conflict.resultEnd)
  )
    return true;
  const [start, end] = sourceRange(conflict, source);
  return (
    change.start <= conflict.resultEnd &&
    change.end >= conflict.resultStart &&
    overlaps(change.nextStart, change.nextEnd, start, end)
  );
}

function matchesChange(value: object, change: MergeChange): boolean {
  const properties = Object.getOwnPropertyDescriptors(value);
  for (const key of [
    'id',
    'source',
    'revision',
    'sourceStart',
    'sourceEnd',
    'resultStart',
    'resultEnd',
    'kind',
    'ambiguous',
  ] as const) {
    const descriptor = properties[key];
    if (!descriptor || !('value' in descriptor) || descriptor.value !== change[key]) return false;
  }
  const ids = properties.conflictIds;
  if (!ids || !('value' in ids) || !Array.isArray(ids.value)) return false;
  if (Object.getOwnPropertyDescriptor(ids.value, 'length')?.value !== change.conflictIds.length) return false;
  return change.conflictIds.every((id, index) => Object.getOwnPropertyDescriptor(ids.value, index)?.value === id);
}

export function createMergeSession(options: MergeSessionOptions): MergeSession {
  const wings = 'build' in options.wings ? options.wings.build() : options.wings;
  const allowLocalUrls = options.allowLocalUrls ?? options.editorOptions?.allowLocalUrls;
  const locale = options.locale ?? options.editorOptions?.locale;
  const model = mergeDocs(options.base, options.local, options.incoming, makeRegistry(wings), { allowLocalUrls });
  if (!model) throw new TypeError('Invalid merge documents or incompatible document schema');
  const { nabi, registry } = createNabiWith(wings, {
    ...options.editorOptions,
    locale,
    allowLocalUrls,
    doc: model.result,
  });
  const host = hostOf(nabi);
  let conflicts = freezeConflicts(
    model.conflicts.map((conflict) => ({
      ...conflict,
      status: 'unresolved',
      ambiguous: false,
    })),
  );
  let revision = 0;
  let dead = false;
  let holds = 0;
  let lastDoc = host.doc();
  let lastConflicts = conflicts;
  const sourceUnits = {
    base: splitMergeUnits(model.base, registry),
    incoming: splitMergeUnits(model.incoming, registry),
  };
  let changeRevision = -1;
  const changeCache = new Map<MergeSource, readonly MergeChange[]>();
  const listeners = new Set<(state: MergeState) => void>();
  const getState = (): MergeState => {
    const unresolvedCount = conflicts.filter((conflict) => conflict.status === 'unresolved').length;
    const canApply = !dead && holds === 0 && host.lockedBy() === null;
    return Object.freeze({
      revision,
      conflicts,
      unresolvedCount,
      canApply,
      canConfirm: canApply && unresolvedCount === 0,
    });
  };
  const getChanges = (source: MergeSource): readonly MergeChange[] => {
    if (dead || (source !== 'base' && source !== 'incoming')) return Object.freeze([]);
    if (changeRevision !== revision) {
      changeCache.clear();
      changeRevision = revision;
    }
    const cached = changeCache.get(source);
    if (cached) return cached;
    const result = Object.freeze(
      lineChanges(splitMergeUnits(host.doc(), registry), sourceUnits[source], conflicts, source).map((range, index) => {
        const affected = conflicts.filter((conflict) => affectsConflict(range, conflict, source));
        return Object.freeze({
          id: `merge-change-${source}-${revision}-${index + 1}`,
          source,
          revision,
          sourceStart: range.nextStart,
          sourceEnd: range.nextEnd,
          resultStart: range.start,
          resultEnd: range.end,
          kind: range.start === range.end ? 'insert' : range.nextStart === range.nextEnd ? 'delete' : 'replace',
          conflictIds: Object.freeze(affected.map((conflict) => conflict.id)),
          ambiguous: affected.some((conflict) => conflict.ambiguous),
        } as const);
      }),
    );
    changeCache.set(source, result);
    return result;
  };
  const notify = (): void => {
    const state = getState();
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (error) {
        try {
          options.editorOptions?.onError?.(error);
        } catch {}
      }
    }
  };
  const remap = (before: NabiDoc, after: NabiDoc, edit?: ChangeRange): readonly MergeConflictState[] => {
    const beforeKeys = splitMergeUnits(before, registry).map(mergeUnitKey);
    const afterKeys = splitMergeUnits(after, registry).map(mergeUnitKey);
    const ranges = edit ? [edit] : changes(beforeKeys, afterKeys);
    if (ranges.length === 0) return conflicts;
    const counts = (keys: readonly string[]): Map<string, number> => {
      const result = new Map<string, number>();
      for (const key of keys) result.set(key, (result.get(key) ?? 0) + 1);
      return result;
    };
    const beforeCounts = counts(beforeKeys);
    const afterCounts = counts(afterKeys);
    const uncertain = new Set<string>();
    for (const range of ranges) {
      if (edit) continue;
      for (const key of [
        ...beforeKeys.slice(range.start, range.end),
        ...afterKeys.slice(range.nextStart, range.nextEnd),
      ]) {
        if ((beforeCounts.get(key) ?? 0) > 1 || (afterCounts.get(key) ?? 0) > 1) uncertain.add(key);
      }
    }
    const ambiguousSpans = [...uncertain]
      .map((key) => ({
        start: beforeKeys.indexOf(key),
        end: beforeKeys.lastIndexOf(key) + 1,
      }))
      .filter((span) => span.start >= 0);
    return freezeConflicts(
      conflicts.map((conflict) => ({
        ...conflict,
        resultStart: mapped(conflict.resultStart, false, ranges),
        resultEnd: mapped(conflict.resultEnd, conflict.resultStart !== conflict.resultEnd, ranges),
        ambiguous:
          conflict.ambiguous ||
          ambiguousSpans.some((span) => conflict.resultStart <= span.end && conflict.resultEnd >= span.start) ||
          ranges.some(
            (range) =>
              range.start < conflict.resultEnd &&
              range.end > conflict.resultStart &&
              (range.start < conflict.resultStart || range.end > conflict.resultEnd),
          ),
      })),
    );
  };
  const releaseHistory = host.bindHistory({
    capture: () => conflicts,
    restore: (state) => {
      conflicts = state as readonly MergeConflictState[];
    },
    change: remap,
  });
  const stop = nabi.onChange(() => {
    if (lastDoc === host.doc() && lastConflicts === conflicts) return;
    lastDoc = host.doc();
    lastConflicts = conflicts;
    revision += 1;
    notify();
  });
  return {
    nabi,
    registry,
    model,
    getState,
    getChanges,
    applyChange(value) {
      if (dead || holds > 0 || host.lockedBy() !== null || value === null || typeof value !== 'object') return false;
      try {
        const source = Object.getOwnPropertyDescriptor(value, 'source');
        if (!source || !('value' in source) || (source.value !== 'base' && source.value !== 'incoming')) return false;
        const change = getChanges(source.value).find((candidate) => matchesChange(value, candidate));
        if (!change || change.ambiguous) return false;
        const before = host.doc();
        const next = replaceMergeRange(
          before,
          change.resultStart,
          change.resultEnd,
          sourceUnits[change.source].slice(change.sourceStart, change.sourceEnd),
          registry,
        );
        const nextUnits = splitMergeUnits(next, registry);
        const delta = nextUnits.length - splitMergeUnits(before, registry).length;
        const nextEnd = change.resultEnd + delta;
        const nextConflicts = freezeConflicts(
          remap(before, next, {
            start: change.resultStart,
            end: change.resultEnd,
            nextStart: change.resultStart,
            nextEnd,
          }).map((conflict) => {
            const previous = conflicts.find((candidate) => candidate.id === conflict.id)!;
            const [sourceStart, sourceEnd] = sourceRange(conflict, change.source);
            if (!change.conflictIds.includes(conflict.id)) {
              if (
                change.resultStart === change.resultEnd &&
                previous.resultStart === change.resultStart &&
                previous.resultEnd === change.resultStart &&
                sourceEnd <= change.sourceStart
              )
                return { ...conflict, resultStart: change.resultStart, resultEnd: change.resultStart };
              return conflict;
            }
            const covered =
              change.resultStart <= previous.resultStart &&
              change.resultEnd >= previous.resultEnd &&
              change.sourceStart <= sourceStart &&
              change.sourceEnd >= sourceEnd;
            const resultStart = covered
              ? change.resultStart + sourceStart - change.sourceStart
              : Math.min(conflict.resultStart, change.resultStart);
            const resultEnd = covered
              ? change.resultStart + sourceEnd - change.sourceStart
              : Math.max(conflict.resultEnd, nextEnd);
            const fragment = nextUnits.slice(resultStart, resultEnd);
            const original = conflict[change.source];
            const complete =
              fragment.length === original.length &&
              fragment.every((unit, index) => mergeUnitKey(unit) === mergeUnitKey(original[index]!));
            return {
              ...conflict,
              resultStart: Math.min(resultStart, nextUnits.length),
              resultEnd: Math.min(resultEnd, nextUnits.length),
              status: complete ? change.source : conflict.status,
              ambiguous: covered && complete ? previous.ambiguous : conflict.ambiguous,
            };
          }),
        );
        return host.applyHistory(
          (_doc, selection, _args, env) => ({
            doc: next,
            selection:
              normalizeSelection(next, selection, env) ?? caretAt(docStart(next, env) ?? { path: [0], offset: 0 }),
          }),
          nextConflicts,
        );
      } catch (error) {
        try {
          options.editorOptions?.onError?.(error);
        } catch {}
        return false;
      }
    },
    resolve(id, resolution) {
      if (dead || holds > 0 || host.lockedBy() !== null) return false;
      if (!['base', 'incoming', 'current'].includes(resolution)) return false;
      const target = conflicts.find((conflict) => conflict.id === id);
      if (!target || (target.ambiguous && resolution !== 'current')) return false;
      if (target.status === resolution) return false;
      try {
        const before = host.doc();
        const next =
          resolution === 'current'
            ? before
            : replaceMergeRange(before, target.resultStart, target.resultEnd, target[resolution], registry);
        const length = splitMergeUnits(next, registry).length;
        const delta = length - splitMergeUnits(before, registry).length;
        const nextConflicts = freezeConflicts(
          remap(
            before,
            next,
            resolution === 'current'
              ? undefined
              : {
                  start: target.resultStart,
                  end: target.resultEnd,
                  nextStart: target.resultStart,
                  nextEnd: target.resultEnd + delta,
                },
          ).map((conflict) =>
            conflict.id === id
              ? {
                  ...conflict,
                  status: resolution,
                  resultStart: Math.min(target.resultStart, length),
                  resultEnd: Math.min(target.resultEnd + delta, length),
                }
              : conflict,
          ),
        );
        return host.applyHistory(
          (_doc, selection, _args, env) => ({
            doc: next,
            selection:
              normalizeSelection(next, selection, env) ?? caretAt(docStart(next, env) ?? { path: [0], offset: 0 }),
          }),
          nextConflicts,
        );
      } catch (error) {
        try {
          options.editorOptions?.onError?.(error);
        } catch {}
        return false;
      }
    },
    onChange(listener) {
      if (dead) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hold() {
      if (dead) return () => {};
      holds += 1;
      notify();
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        holds -= 1;
        if (!dead) notify();
      };
    },
    dispose() {
      if (dead) return;
      dead = true;
      stop();
      releaseHistory();
      listeners.clear();
    },
  };
}
