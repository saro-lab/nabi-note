import { $ownDataArray, $ownDataObject, $snapshotNodes } from '../schema/json.js';
import { $copyKnownTypes } from '../schema/env.js';
import { isElement, type NabiNode, type NabiDoc } from '../schema/index.js';
import type { EditEnv, Position } from '../doc/index.js';
import type { Selection } from '../caret/index.js';
import type { CommandArgs, CommandOutcome } from './commands.js';

export interface Snapshot {
  readonly doc: NabiDoc;
  readonly selection: Selection;
}

export interface CommandResultSnapshot {
  readonly doc: readonly NabiNode[];
  readonly selection: Selection;
  readonly arm?: CommandOutcome['arm'];
}

function snapshotPosition(value: unknown): Position | null {
  const raw = $ownDataObject(value);
  if (!raw) return null;
  const path = $ownDataArray(raw['path']?.value);
  const offset = raw['offset']?.value;
  if (!path || typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0) return null;
  const copied: number[] = [];
  for (const part of path) {
    if (typeof part !== 'number' || !Number.isInteger(part) || part < 0) return null;
    copied.push(part);
  }
  return Object.freeze({ path: Object.freeze(copied), offset });
}

export function snapshotSelection(value: unknown): Selection | null {
  const raw = $ownDataObject(value);
  if (!raw) return null;
  const anchor = snapshotPosition(raw['anchor']?.value);
  const focus = snapshotPosition(raw['focus']?.value);
  return anchor && focus ? Object.freeze({ anchor, focus }) : null;
}

export function frozenSelection(selection: Selection): Selection {
  const position = (value: Position): Position =>
    Object.freeze({ path: Object.freeze([...value.path]), offset: value.offset });
  return Object.freeze({ anchor: position(selection.anchor), focus: position(selection.focus) });
}

export function snapshotArgs(value: unknown): CommandArgs | null {
  const active = new WeakSet<object>();
  const copy = (item: unknown): unknown | typeof rejected => {
    if (
      item === null ||
      item === undefined ||
      typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean' ||
      typeof item === 'bigint'
    )
      return item;
    if (typeof item !== 'object') return rejected;
    if (active.has(item)) return rejected;
    active.add(item);
    try {
      const array = $ownDataArray(item);
      if (array) {
        const out: unknown[] = [];
        for (const value of array) {
          const next = copy(value);
          if (next === rejected) return rejected;
          out.push(next);
        }
        return Object.freeze(out);
      }
      const object = $ownDataObject(item);
      if (!object) return rejected;
      const out: Record<string, unknown> = {};
      for (const [key, descriptor] of Object.entries(object)) {
        const next = copy(descriptor.value);
        if (next === rejected) return rejected;
        out[key] = next;
      }
      return Object.freeze(out);
    } finally {
      active.delete(item);
    }
  };
  const copied = copy(value);
  return copied === rejected ? null : (copied as CommandArgs);
}

const rejected = Symbol('rejected command value');

type SetLike<T> = {
  readonly size: number;
  has(value: T): boolean;
  keys(): Iterator<T>;
};

function setValues<T>(source: SetLike<T>): T[] {
  const values: T[] = [];
  const iterator = source.keys();
  for (let step = iterator.next(); !step.done; step = iterator.next()) values.push(step.value);
  return values;
}

export class ReadonlySetView<T> implements ReadonlySet<T> {
  readonly #values: ReadonlySet<T>;

  constructor(values: ReadonlySet<T>) {
    this.#values = new Set(values);
    Object.freeze(this);
  }

  get size(): number {
    return this.#values.size;
  }
  has(value: T): boolean {
    return this.#values.has(value);
  }
  entries(): SetIterator<[T, T]> {
    return this.#values.entries();
  }
  keys(): SetIterator<T> {
    return this.#values.keys();
  }
  values(): SetIterator<T> {
    return this.#values.values();
  }
  [Symbol.iterator](): SetIterator<T> {
    return this.#values[Symbol.iterator]();
  }
  forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: unknown): void {
    this.#values.forEach((value) => callbackfn.call(thisArg, value, value, this));
  }
  union<U>(other: SetLike<U>): Set<T | U> {
    return new Set<T | U>([...this.#values, ...setValues(other)]);
  }
  intersection<U>(other: SetLike<U>): Set<T & U> {
    const result = new Set<T & U>();
    for (const value of this.#values) {
      if (other.has(value as unknown as U)) result.add(value as T & U);
    }
    return result;
  }
  difference<U>(other: SetLike<U>): Set<T> {
    const result = new Set<T>();
    for (const value of this.#values) {
      if (!other.has(value as unknown as U)) result.add(value);
    }
    return result;
  }
  symmetricDifference<U>(other: SetLike<U>): Set<T | U> {
    const result = this.difference(other) as Set<T | U>;
    for (const value of setValues(other)) {
      if (!this.#values.has(value as unknown as T)) result.add(value);
    }
    return result;
  }
  isSubsetOf(other: SetLike<unknown>): boolean {
    for (const value of this.#values) if (!other.has(value)) return false;
    return true;
  }
  isSupersetOf(other: SetLike<unknown>): boolean {
    for (const value of setValues(other)) if (!this.#values.has(value as T)) return false;
    return true;
  }
  isDisjointFrom(other: SetLike<unknown>): boolean {
    for (const value of setValues(other)) if (this.#values.has(value as T)) return false;
    return true;
  }
}

export class ReadonlyMapView<K, V> implements ReadonlyMap<K, V> {
  readonly #values: ReadonlyMap<K, V>;

  constructor(values: ReadonlyMap<K, V>) {
    this.#values = new Map(values);
    Object.freeze(this);
  }

  get size(): number {
    return this.#values.size;
  }
  get(key: K): V | undefined {
    return this.#values.get(key);
  }
  has(key: K): boolean {
    return this.#values.has(key);
  }
  entries(): MapIterator<[K, V]> {
    return this.#values.entries();
  }
  keys(): MapIterator<K> {
    return this.#values.keys();
  }
  values(): MapIterator<V> {
    return this.#values.values();
  }
  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.#values[Symbol.iterator]();
  }
  forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown): void {
    this.#values.forEach((value, key) => callbackfn.call(thisArg, value, key, this));
  }
}

export function callbackEnv(env: EditEnv): EditEnv {
  const repairs = env.repair ? Object.freeze({ ...env.repair }) : undefined;
  const readonlyMap = (
    source: ReadonlyMap<string, ReadonlySet<string>> | undefined,
  ): ReadonlyMap<string, ReadonlySet<string>> | undefined =>
    source === undefined
      ? undefined
      : new ReadonlyMapView(new Map([...source].map(([key, values]) => [key, new ReadonlySetView(values)])));
  const attrSchemas = readonlyMap(env.attrSchemas);
  const boolAttrsByType = readonlyMap(env.boolAttrsByType);
  const view: EditEnv = {
    lumps: new ReadonlySetView(env.lumps),
    voids: new ReadonlySetView(env.voids),
    blockHolders: new ReadonlySetView(env.blockHolders),
    inlineHolders: new ReadonlySetView(env.inlineHolders),
    boolAttrs: new ReadonlySetView(env.boolAttrs),
    ...(attrSchemas ? { attrSchemas } : {}),
    ...(boolAttrsByType ? { boolAttrsByType } : {}),
    ...(env.clearableMarks ? { clearableMarks: new ReadonlySetView(env.clearableMarks) } : {}),
    ...(env.clearableAttrs ? { clearableAttrs: new ReadonlySetView(env.clearableAttrs) } : {}),
    ...(env.noAlign ? { noAlign: new ReadonlySetView(env.noAlign) } : {}),
    ...(repairs ? { repair: repairs } : {}),
    ...(env.singleParagraph ? { singleParagraph: new ReadonlySetView(env.singleParagraph) } : {}),
  };
  $copyKnownTypes(env, view);
  return Object.freeze(view);
}

export function snapshotCommandResult(
  value: unknown,
  current: NabiDoc,
  known: Readonly<WeakMap<object, NabiNode>>,
): CommandResultSnapshot | null {
  const raw = $ownDataObject(value);
  if (!raw) return null;
  const incoming = raw['doc']?.value;
  const nodes = $snapshotNodes(incoming, true, known);
  const selection = snapshotSelection(raw['selection']?.value);
  if (!nodes || !selection) return null;
  const copied =
    nodes.length === current.length && nodes.every((node, index) => node === current[index]) ? current : nodes;
  const armValue = raw['arm']?.value;
  if (armValue === undefined) return { doc: copied, selection };
  const armNodes = $snapshotNodes([armValue], true, known);
  const arm = armNodes?.[0];
  if (!arm || !isElement(arm)) return null;
  return { doc: copied, selection, arm };
}

export function callbackSelection(selection: Selection): Selection {
  return frozenSelection(selection);
}

// 인스턴스의 이름 — 유닉스 시각 + nonce. 정렬되는 이름표이지 비밀이 아니다.
// The instance's name: Unix time + a nonce. A sortable label, not a secret.
export function makeSessionId(): string {
  const random = globalThis.crypto?.getRandomValues?.(new Uint32Array(1))?.[0];
  const nonce = (random ?? Math.floor(Math.random() * 0xffffffff)).toString(36);
  return `${Date.now()}-${nonce}`;
}
