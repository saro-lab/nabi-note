import type { Selection } from '../../caret/index.js';
import { replaceAt } from '../../doc/index.js';
import type { Command } from '../../editor/index.js';
import type { LocaleText } from '../../locale/index.js';
import type { ElementNode, NabiDoc } from '../../schema/index.js';
import { BASE_LABEL, HIGHLIGHT_LABELS } from '../value-labels.js';
import { mapCells, type GridCell } from './grid.js';
import { cellCtxOf, selectionBox } from './selection.js';

export const CELL_COLORS: readonly string[] = ['yellow', 'green', 'cyan', 'pink', 'purple', 'orange'];

export function cellColor(value: unknown): string | undefined {
  return typeof value === 'string' && CELL_COLORS.includes(value) ? value : undefined;
}

export function withCellColor(cell: ElementNode, value: string | undefined): ElementNode {
  if (cell.a?.['bg'] === value) return cell;
  const a = { ...cell.a };
  if (value === undefined) delete a['bg'];
  else a['bg'] = value;
  const { a: _attrs, ...rest } = cell;
  return Object.keys(a).length > 0 ? { ...rest, a } : rest;
}

export function cellColorSelection(
  doc: NabiDoc,
  selection: Selection,
): { readonly table: ElementNode; readonly tablePath: readonly number[]; readonly cells: readonly GridCell[] } | null {
  const anchor = cellCtxOf(doc, selection.anchor);
  const focus = cellCtxOf(doc, selection.focus);
  if (!anchor || !focus || anchor.table !== focus.table) return null;
  const selected = selectionBox(doc, selection);
  return { table: focus.table, tablePath: focus.tablePath, cells: selected?.cells ?? [focus.cell] };
}

export const setCellColor: Command = (doc, selection, args) => {
  const raw = args['bg'];
  const color = cellColor(raw);
  if (raw !== '' && color === undefined) return null;
  const selected = cellColorSelection(doc, selection);
  if (!selected) return null;
  if (selected.cells.every((item) => item.cell.a?.['bg'] === color)) return null;
  const cells = new Set(selected.cells.map((item) => item.cell));
  const table = mapCells(selected.table, (item) =>
    cells.has(item.cell) ? withCellColor(item.cell, color) : item.cell,
  );
  return { doc: replaceAt(doc, selected.tablePath, [table]), selection };
};

export const CELL_COLOR_LABEL: LocaleText = {
  ko: '셀 배경색',
  en: 'Cell background',
  ja: 'セルの背景色',
  zh: '单元格背景色',
  de: 'Zellenhintergrund',
  fr: 'Fond de cellule',
  es: 'Fondo de celda',
  pt: 'Fundo da célula',
  ru: 'Фон ячейки',
  ar: 'خلفية الخلية',
  hi: 'सेल की पृष्ठभूमि',
  bn: 'ঘরের পটভূমি',
  ur: 'خانے کا پس منظر',
  id: 'Latar sel',
  fa: 'پس‌زمینهٔ سلول',
  mr: 'सेलची पार्श्वभूमी',
  vi: 'Nền ô',
  te: 'సెల్ నేపథ్యం',
  ha: 'Bayan tantanin jadawali',
  tr: 'Hücre arka planı',
  sw: 'Mandharinyuma ya seli',
  ta: 'கலத்தின் பின்னணி',
  th: 'พื้นหลังเซลล์',
  it: 'Sfondo della cella',
};

export const CELL_COLOR_CHOICES = [
  { value: '', label: BASE_LABEL, icon: 'clear-format-clear' },
  ...CELL_COLORS.map((value) => ({
    value,
    label: HIGHLIGHT_LABELS[value] ?? { en: value },
    swatch: `var(--nabi-cell-${value})`,
  })),
];
