import { cocoon } from '../schema/cocoon.js';
import { isWrapper } from '../schema/env.js';
import type { Attrs, ElementNode, NabiDoc, NabiNode } from '../schema/types.js';
import type { Registry } from '../wing/index.js';

export interface MergeUnit {
  readonly node: ElementNode;
  readonly boundary: 'br' | 'paragraph';
  readonly paragraph: number;
  readonly start: number;
  readonly end: number;
}

function attrsKey(attrs: Attrs | undefined): string {
  return JSON.stringify(Object.entries(attrs ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export function mergeNodeKey(node: NabiNode): string {
  const tree = (value: NabiNode): unknown =>
    typeof value === 'string'
      ? value
      : [value.w, Object.entries(value.a ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)), value.ch.map(tree)];
  return JSON.stringify(tree(node));
}

export function mergeUnitKey(unit: MergeUnit): string {
  return JSON.stringify([unit.boundary, mergeNodeKey(unit.node)]);
}

function withChildren(node: ElementNode, ch: readonly NabiNode[]): ElementNode {
  return node.a ? { w: node.w, a: { ...node.a }, ch } : { w: node.w, ch };
}

function splitLines(nodes: readonly NabiNode[]): NabiNode[][] {
  const lines: NabiNode[][] = [[]];
  for (const node of nodes) {
    if (typeof node === 'string' || node.w === 'br') {
      lines[lines.length - 1]!.push(node);
      if (typeof node !== 'string') lines.push([]);
      continue;
    }
    const inner = splitLines(node.ch);
    inner.forEach((ch, index) => {
      if (index > 0) lines.push([]);
      if (ch.length > 0 || inner.length === 1) lines[lines.length - 1]!.push(withChildren(node, ch));
    });
  }
  return lines;
}

function inlineLength(nodes: readonly NabiNode[], registry: Registry): number {
  return nodes.reduce(
    (length, node) =>
      length +
      (typeof node === 'string'
        ? node.length
        : node.w === 'br' || registry.env.voids.has(node.w) || (registry.env.inlineTerminals?.has(node.w) ?? false)
          ? 1
          : inlineLength(node.ch, registry)),
    0,
  );
}

export function splitMergeUnits(doc: NabiDoc, registry: Registry): MergeUnit[] {
  const units: MergeUnit[] = [];
  doc.forEach((node, paragraph) => {
    if (node.w !== 'p' || isWrapper(node, registry.env)) {
      units.push({ node, boundary: 'paragraph', paragraph, start: 0, end: 1 });
      return;
    }
    let start = 0;
    const lines = splitLines(node.ch);
    lines.forEach((ch, index) => {
      const end = start + inlineLength(ch, registry);
      units.push({
        node: withChildren(node, ch),
        boundary: index < lines.length - 1 ? 'br' : 'paragraph',
        paragraph,
        start,
        end,
      });
      start = end;
    });
  });
  return units;
}

function appendLines(before: readonly NabiNode[], after: readonly NabiNode[]): NabiNode[] {
  const last = before[before.length - 1];
  const first = after[0];
  if (
    typeof last === 'object' &&
    typeof first === 'object' &&
    last.w !== 'br' &&
    last.w === first.w &&
    attrsKey(last.a) === attrsKey(first.a)
  ) {
    return [...before.slice(0, -1), withChildren(last, appendLines(last.ch, first.ch)), ...after.slice(1)];
  }
  return [...before, ...after];
}

export function joinMergeUnits(units: readonly MergeUnit[], registry: Registry): NabiDoc {
  const doc: ElementNode[] = [];
  let previous: MergeUnit | undefined;
  for (const unit of units) {
    const last = doc[doc.length - 1];
    if (previous?.boundary === 'br' && last?.w === 'p' && unit.node.w === 'p' && !isWrapper(unit.node, registry.env)) {
      doc[doc.length - 1] = withChildren(last, appendLines(last.ch, unit.node.ch));
    } else {
      doc.push(unit.node);
    }
    previous = unit;
  }
  return cocoon(doc, registry.env);
}

export function replaceMergeRange(
  doc: NabiDoc,
  start: number,
  end: number,
  fragment: readonly MergeUnit[],
  registry: Registry,
): NabiDoc {
  const units = splitMergeUnits(doc, registry);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > units.length) {
    throw new RangeError('Invalid merge range');
  }
  const previous = units[start - 1];
  if (fragment.length === 0 && end > start && previous?.boundary === 'br' && units[end - 1]!.boundary === 'paragraph') {
    const trimBreak = (nodes: readonly NabiNode[]): readonly NabiNode[] => {
      const last = nodes.at(-1);
      if (typeof last !== 'object') return nodes;
      if (last.w === 'br') return nodes.slice(0, -1);
      const ch = trimBreak(last.ch);
      return ch.length > 0 ? [...nodes.slice(0, -1), withChildren(last, ch)] : nodes.slice(0, -1);
    };
    units[start - 1] = {
      ...previous,
      node: withChildren(previous.node, trimBreak(previous.node.ch)),
      boundary: 'paragraph',
    };
  }
  return joinMergeUnits([...units.slice(0, start), ...fragment, ...units.slice(end)], registry);
}
