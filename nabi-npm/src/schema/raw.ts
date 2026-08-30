import type { Attrs, AttrValue, NabiNode } from './types.js';

const POISON_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

export type DataDescriptors = Readonly<Record<string, PropertyDescriptor>>;

export function $ownDataObject(value: unknown): DataDescriptors | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) return null;
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return null;
  }
  const descriptors = Object.getOwnPropertyDescriptors(value) as unknown as Record<PropertyKey, PropertyDescriptor>;
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string' || POISON_KEYS.has(key)) return null;
    const descriptor = descriptors[key];
    if (!descriptor || !('value' in descriptor)) return null;
  }
  return descriptors as Record<string, PropertyDescriptor>;
}

export function $ownDataArray(value: unknown): readonly unknown[] | null {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return null;
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) return null;
  }
  const descriptors = Object.getOwnPropertyDescriptors(value) as unknown as Record<PropertyKey, PropertyDescriptor>;
  const length = descriptors['length'];
  if (!length || !('value' in length) || typeof length.value !== 'number') return null;
  const entries: { readonly index: number; readonly value: unknown }[] = [];
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string') return null;
    const descriptor = descriptors[key];
    if (!descriptor || !('value' in descriptor)) return null;
    if (key === 'length') continue;
    if (POISON_KEYS.has(key) || !/^(?:0|[1-9][0-9]*)$/.test(key)) return null;
    const index = Number(key);
    if (!Number.isSafeInteger(index) || index < 0 || index >= length.value) return null;
    entries.push({ index, value: descriptor.value });
  }
  if (entries.length !== length.value) return null;
  const out = new Array<unknown>(length.value);
  for (const entry of entries) out[entry.index] = entry.value;
  return out;
}

function readNode(
  value: unknown,
  active: WeakSet<object>,
  preserveIds: boolean,
  known?: Readonly<WeakMap<object, NabiNode>>,
): NabiNode | null {
  if (typeof value === 'string') return value;
  const original = known?.get(value as object);
  if (original) return original;
  const raw = $ownDataObject(value);
  if (!raw) return null;
  const w = raw['w']?.value;
  if (typeof w !== 'string' || w === '') return null;

  let attrs: Record<string, AttrValue> | undefined;
  const a = raw['a']?.value;
  if (a !== undefined) {
    const fields = $ownDataObject(a);
    if (!fields) return null;
    for (const [key, descriptor] of Object.entries(fields)) {
      if (key.startsWith('_')) continue;
      const item = descriptor.value;
      if (typeof item !== 'string' && typeof item !== 'number') return null;
      (attrs ??= {})[key] = item;
    }
  }

  const ch = raw['ch']?.value;
  const values = ch === undefined ? [] : $ownDataArray(ch);
  if (!values) return null;
  if (active.has(value as object)) return null;
  active.add(value as object);
  const kids: NabiNode[] = [];
  try {
    for (const item of values) {
      const kid = readNode(item, active, preserveIds, known);
      if (kid === null) return null;
      kids.push(kid);
    }
  } finally {
    active.delete(value as object);
  }

  const node: { w: string; a?: Attrs; ch: readonly NabiNode[]; _id?: string } = { w, ch: kids };
  if (attrs) node.a = attrs;
  if (preserveIds) {
    const id = raw['_id']?.value;
    if (id !== undefined && typeof id !== 'string') return null;
    if (typeof id === 'string') node._id = id;
  }
  return node;
}

export function $snapshotNodes(
  value: unknown,
  preserveIds = false,
  known?: Readonly<WeakMap<object, NabiNode>>,
): NabiNode[] | null {
  const values = $ownDataArray(value);
  if (!values) return null;
  const active = new WeakSet<object>();
  active.add(value as object);
  const nodes: NabiNode[] = [];
  try {
    for (const item of values) {
      const node = readNode(item, active, preserveIds, known);
      if (node === null) return null;
      nodes.push(node);
    }
  } finally {
    active.delete(value as object);
  }
  return nodes;
}

export interface CallbackTree {
  readonly nodes: readonly NabiNode[];
  readonly originals: Readonly<WeakMap<object, NabiNode>>;
}

export function $callbackTree(nodes: readonly NabiNode[]): CallbackTree {
  const originals = new WeakMap<object, NabiNode>();
  const copy = (node: NabiNode): NabiNode => {
    if (typeof node === 'string') return node;
    const ch = node.ch.map(copy);
    Object.freeze(ch);
    const attrs = node.a ? { ...node.a } : undefined;
    if (attrs) Object.freeze(attrs);
    const cloned: { w: string; a?: Attrs; ch: readonly NabiNode[]; _id?: string } = { w: node.w, ch };
    if (attrs) cloned.a = attrs;
    if (node._id !== undefined) cloned._id = node._id;
    originals.set(cloned, node);
    return Object.freeze(cloned);
  };
  const cloned = nodes.map(copy);
  Object.freeze(cloned);
  return { nodes: cloned, originals };
}
