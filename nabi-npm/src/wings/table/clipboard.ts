import { caretAt, type Selection } from '../../caret/index.js';
import { nodeAt, replaceAt } from '../../doc/index.js';
import type { Command } from '../../editor/index.js';
import { isElement, type ElementNode, type NabiDoc, type NabiNode } from '../../schema/index.js';
import { mapCells } from './grid.js';
import { selectionBox } from './selection.js';

function textOf(node: NabiNode): string {
  if (typeof node === 'string') return node;
  if (node.w === 'br') return '\n';
  return node.ch.map(textOf).join('');
}

export function tableClipboardOf(
  doc: NabiDoc,
  selection: Selection,
): { readonly body: readonly ElementNode[]; readonly plain: string } | null {
  const selected = selectionBox(doc, selection);
  if (!selected) return null;
  const table = nodeAt(doc, selected.tablePath);
  if (!table) return null;
  const cells = new Set(selected.cells.map((item) => item.cell));
  const rows: ElementNode[] = [];
  let row = -1;
  for (const child of table.ch) {
    if (!isElement(child) || child.w !== 'tr') continue;
    row += 1;
    if (row < selected.box.top || row > selected.box.bottom) continue;
    rows.push({ ...child, ch: child.ch.filter((cell) => isElement(cell) && cells.has(cell)) });
  }
  const wrapper = nodeAt(doc, selected.tablePath.slice(0, -1));
  return {
    body: [{ w: 'p', ...(wrapper?.a ? { a: wrapper.a } : {}), ch: [{ ...table, ch: rows }] }],
    plain: rows.map((item) => item.ch.map(textOf).join('\t')).join('\n'),
  };
}

export const cutTableSelection: Command = (doc, selection) => {
  const selected = selectionBox(doc, selection);
  if (!selected) return null;
  const table = nodeAt(doc, selected.tablePath);
  const first = selected.cells[0];
  if (!table || !first) return null;
  const cells = new Set(selected.cells.map((item) => item.cell));
  const cleared = mapCells(table, (item) => {
    if (!cells.has(item.cell)) return item.cell;
    return {
      ...item.cell,
      ch: item.cell.ch.map((paragraph) => (isElement(paragraph) ? { ...paragraph, ch: [] } : paragraph)),
    };
  });
  return {
    doc: replaceAt(doc, selected.tablePath, [cleared]),
    selection: caretAt({ path: [...selected.tablePath, first.trIndex, first.tdIndex, 0], offset: 0 }),
  };
};
