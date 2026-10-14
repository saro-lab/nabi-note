import { BR, P, isElement, type AttrValue, type ElementNode, type NabiNode } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { nodeAt, replaceAt, holders, type EditEnv, type Position } from '../../doc/index.js';
import { caretAt, isCollapsed, ordered, type Selection } from '../../caret/index.js';
import type { Command, CommandOutcome } from '../../editor/index.js';
import type { HtmlBuilder, ParseElement } from '../../html/index.js';
import type { MdBuilder } from '../../io/index.js';
import type { KeyIntent, OnKey, Wing } from '../../wing/index.js';
import { insertLump } from '../../wing/index.js';
import { $setContextState } from '../../wing/context-state.js';
import { $setParagraphTargets } from '../../wing/paragraph-target.js';
import { tableParagraphTargets } from './paragraphs.js';
import { exitWrapper } from '../../wing/ops.js';
import type { LocaleText } from '../../locale/index.js';
import {
  $columnGapWidths,
  SPAN_COL,
  SPAN_ROW,
  cellCovering,
  cellGrid,
  cellsInBox,
  insertCellInRow,
  mapCells,
  spanOf,
  stepCell,
  withSpans,
  type GridBox,
  type GridCell,
  type TableGrid,
} from './grid.js';
import { emptyCell, emptyCells, headerCell } from './helpers.js';
import { cellBoundary, cellCtxOf, selectionBox, type CellCtx } from './selection.js';
import {
  CELL_COLOR_CHOICES,
  CELL_COLOR_LABEL,
  CELL_COLORS,
  cellColor,
  cellColorSelection,
  setCellColor,
  withCellColor,
} from './color.js';
export { selectionBox } from './selection.js';
export const TH = 'th';
export const SORTABLE = 'sort';
function rebuilt(node: ElementNode, ch: readonly NabiNode[]): ElementNode {
  return { w: node.w, ch, ...(node.a ? { a: node.a } : {}), ...(node._id !== undefined ? { _id: node._id } : {}) };
}

function cellContents(nodes: readonly NabiNode[], header: boolean): readonly NabiNode[] {
  const next = nodes.flatMap((node): NabiNode[] => {
    if (!isElement(node)) return [node];
    if (node.w === 'table' || node.w === 'tr' || node.w === 'td' || node.w === 'float') {
      return [...cellContents(node.ch, header)];
    }
    const only = node.ch.length === 1 ? node.ch[0] : undefined;
    if (node.w === P && isElement(only) && (only.w === 'table' || only.w === 'float')) {
      return [...cellContents(only.ch, header)];
    }
    const ch = cellContents(node.ch, header);
    const changed = ch !== node.ch ? rebuilt(node, ch) : node;
    if (!header || node.w !== P || node.a?.['h'] === undefined) return [changed];
    const a = { ...changed.a };
    delete a['h'];
    const { a: _attrs, ...rest } = changed;
    return [Object.keys(a).length > 0 ? { ...rest, a } : rest];
  });
  return next.length === nodes.length && next.every((node, i) => node === nodes[i]) ? nodes : next;
}

export function repairCell(cell: ElementNode): ElementNode {
  const colored = withCellColor(cell, cellColor(cell.a?.['bg']));
  const ch = cellContents(colored.ch, colored.a?.[TH] === 1);
  if (ch.length === 0) return rebuilt(colored, [{ w: P, ch: [] }]);
  return ch === colored.ch ? colored : rebuilt(colored, ch);
}

function clampSpans(table: ElementNode): ElementNode {
  const rows = table.ch.filter((child): child is ElementNode => isElement(child) && child.w === 'tr');
  let changed = false;
  const ch = table.ch.map((child) => {
    if (!isElement(child) || child.w !== 'tr') return child;
    const r = rows.indexOf(child);
    let rowChanged = false;
    const cells = child.ch.map((cell) => {
      if (!isElement(cell) || cell.w !== 'td') return cell;
      const colSpan = spanOf(cell.a?.[SPAN_COL]);
      const rowSpan = Math.min(spanOf(cell.a?.[SPAN_ROW]), rows.length - r);
      const rawCol = cell.a?.[SPAN_COL];
      const rawRow = cell.a?.[SPAN_ROW];
      const wantCol = colSpan > 1 ? String(colSpan) : undefined;
      const wantRow = rowSpan > 1 ? String(rowSpan) : undefined;
      if ((rawCol ?? undefined) === wantCol && (rawRow ?? undefined) === wantRow) return cell;
      rowChanged = true;
      return withSpans(cell, colSpan, rowSpan);
    });
    if (!rowChanged) return child;
    changed = true;
    return rebuilt(child, cells);
  });
  return changed ? rebuilt(table, ch) : table;
}

// 행 아닌 자식 감싸기, span 조임, 직사각형화 — 이 순서로 도는 표 repair.
// Table repair, in order: wrap non-row children, clamp spans, then pad to a rectangle.
export function repairTable(table: ElementNode): ElementNode {
  // 1) 행 아닌 블록 자식은 행 하나(칸 하나)로 감싼다 — 글은 남는다.
  let wrappedAny = false;
  const rowsOnly = table.ch.map((child) => {
    if (isElement(child) && child.w === 'tr') return child;
    wrappedAny = true;
    return { w: 'tr', ch: [repairCell({ w: 'td', ch: [child] })] } as ElementNode;
  });
  const base = wrappedAny
    ? rebuilt(
        table,
        rowsOnly.filter((child): child is ElementNode => child !== null),
      )
    : table;

  // 2) 행이 하나도 없으면 1×1로 세운다 — 캐럿의 집.
  const hasRow = base.ch.some((child) => isElement(child) && child.w === 'tr');
  const seeded = hasRow ? base : rebuilt(base, [{ w: 'tr', ch: [emptyCell()] }]);

  // 3, 4) span 조임과 직사각형화 — 행마다 모자란 만큼 빈 칸을 꼬리에 채운다.
  const clamped = clampSpans(seeded);
  const grid = cellGrid(clamped);
  const columns = Math.max(1, grid.columns);
  const gapsByRow = Array.from({ length: grid.rows }, (_unused, row) => $columnGapWidths(grid, row, columns));
  const gapWidth = gapsByRow.reduce((sum, gaps) => sum + gaps.reduce((rowSum, width) => rowSum + width, 0), 0);
  const expand = gapWidth <= grid.cells.length + grid.rows;
  let padded = false;
  let r = -1;
  const ch = clamped.ch.map((child) => {
    if (!isElement(child) || child.w !== 'tr') return child;
    r += 1;
    const gaps = gapsByRow[r] ?? [];
    if (gaps.length === 0) return child;
    padded = true;
    return rebuilt(child, [...child.ch, ...gaps.flatMap((width) => emptyCells(width, expand))]);
  });
  return padded ? rebuilt(clamped, ch) : clamped;
}

// 격자 행 번호 → table.ch의 tr 인덱스.
// Maps a grid row number to its tr index in table.ch.
function trIndexOfRow(table: ElementNode, row: number): number | null {
  let r = -1;
  for (let i = 0; i < table.ch.length; i += 1) {
    const child = table.ch[i];
    if (isElement(child) && child.w === 'tr') {
      r += 1;
      if (r === row) return i;
    }
  }
  return null;
}

// 격자 행 `line` 자리에 새 행을 넣는다(line === rows면 꼬리).
// Inserts a new row at grid position `line` (line === rows means the tail).
function insertRowAt(table: ElementNode, line: number): ElementNode {
  const grid = cellGrid(table);
  const columns = Math.max(1, grid.columns);

  // 줄을 가로지르는 병합 칸은 한 칸 더 자란다 — 그 열들에는 새 칸이 안 선다.
  // A merged cell straddling this line grows by one — no new cell lands in its columns.
  const spanning = grid.cells.filter((item) => item.row < line && item.row + item.rowSpan - 1 >= line);
  // mapCells는 격자를 새로 짓기 때문에 GridCell이 아니라 칸 노드 참조로 맞춘다.
  const spanningCells = new Set(spanning.map((item) => item.cell));
  const widened =
    spanning.length === 0
      ? table
      : mapCells(table, (item) =>
          spanningCells.has(item.cell) ? withSpans(item.cell, item.colSpan, item.rowSpan + 1) : item.cell,
        );

  const ranges = spanning
    .map((item) => ({ start: item.column, end: item.column + item.colSpan }))
    .sort((a, b) => a.start - b.start);
  const gaps: number[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) gaps.push(range.start - cursor);
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < columns) gaps.push(columns - cursor);
  const fresh = gaps.flatMap((width) => emptyCells(width, true));
  const row: ElementNode = { w: 'tr', ch: fresh };

  const anchorTr = line < grid.rows ? trIndexOfRow(widened, line) : null;
  const at = anchorTr ?? widened.ch.length;
  return rebuilt(widened, [...widened.ch.slice(0, at), row, ...widened.ch.slice(at)]);
}

// 격자 열 `line` 자리에 새 열을 넣는다(line === columns면 오른끝).
// Inserts a new column at grid position `line` (line === columns means the right edge).
function insertColumnAt(table: ElementNode, line: number): ElementNode {
  const grid = cellGrid(table);
  const spanning = grid.cells.filter((item) => item.column < line && item.column + item.colSpan - 1 >= line);
  const spanningCells = new Set(spanning.map((item) => item.cell));
  const widened =
    spanning.length === 0
      ? table
      : mapCells(table, (item) =>
          spanningCells.has(item.cell) ? withSpans(item.cell, item.colSpan + 1, item.rowSpan) : item.cell,
        );

  const coveredRows = spanning
    .map((item) => ({ start: item.row, end: item.row + item.rowSpan }))
    .sort((a, b) => a.start - b.start);
  let rangeIndex = 0;
  let next = widened;
  for (let r = 0; r < grid.rows; r += 1) {
    while (coveredRows[rangeIndex] && (coveredRows[rangeIndex]?.end ?? 0) <= r) rangeIndex += 1;
    const range = coveredRows[rangeIndex];
    if (range && range.start <= r && r < range.end) continue;
    const trIndex = trIndexOfRow(next, r);
    if (trIndex === null) continue;
    // 통째로 제목인 줄에는 제목 칸이 따라 선다 — 안 그러면 열을 더할 때마다 제목 줄에 구멍이 뚫린다.
    // A row that's entirely header gets a header cell too — otherwise adding a column punches a hole in the header line.
    //
    // 행 추가 쪽엔 같은 규칙을 안 건다 — 제목 행 하나뿐인 표는 모든 열이 "통째로 제목"이라, 그 아래 새 행까지 제목이 되어 버린다.
    // Row insertion skips this rule — in a table with only a header row, every column reads as "entirely header," so a new row below it would wrongly inherit header status too.
    next = insertCellInRow(next, trIndex, line, headerLine(grid, 'row', r) ? headerCell() : emptyCell());
  }
  return next;
}

// 격자 행 `line`을 지운다 — 위에서 내려온 병합 칸은 한 칸 줄고, 행이 하나뿐이면 null(표 전체 삭제는 부르는 쪽 몫).
// Deletes grid row `line` — a merged cell spanning down from above shrinks by one; returns null if it's the only row (whole-table deletion is the caller's job).
function deleteRowAt(table: ElementNode, line: number): ElementNode | null {
  const grid = cellGrid(table);
  if (grid.rows <= 1) return null;

  const movers = grid.cells.filter((item) => item.row === line && item.rowSpan > 1).sort((a, b) => a.column - b.column);
  const t1 = mapCells(table, (item) => {
    if (item.row === line) return null; // 지워지는 줄에서 시작 — movers는 아래서 되심는다
    if (item.row < line && item.row + item.rowSpan - 1 >= line) {
      return withSpans(item.cell, item.colSpan, item.rowSpan - 1);
    }
    return item.cell;
  });

  const trIndex = trIndexOfRow(t1, line);
  if (trIndex === null) return null;
  let t2 = rebuilt(t1, [...t1.ch.slice(0, trIndex), ...t1.ch.slice(trIndex + 1)]);

  for (const item of movers) {
    const target = trIndexOfRow(t2, line);
    if (target === null) continue;
    t2 = insertCellInRow(t2, target, item.column, withSpans(item.cell, item.colSpan, item.rowSpan - 1));
  }
  return t2;
}

// 격자 열 `line`을 지운다 — 걸친 병합 칸은 한 칸 줄고, 열이 하나뿐이면 null.
// Deletes grid column `line` — a straddling merged cell shrinks by one; null if it's the only column.
function deleteColumnAt(table: ElementNode, line: number): ElementNode | null {
  const grid = cellGrid(table);
  if (grid.columns <= 1) return null;
  return mapCells(table, (item) => {
    const covers = item.column <= line && item.column + item.colSpan - 1 >= line;
    if (!covers) return item.cell;
    if (item.colSpan === 1) return null;
    return withSpans(item.cell, item.colSpan - 1, item.rowSpan);
  });
}

function mergeBox(table: ElementNode, grid: TableGrid, box: GridBox): ElementNode {
  const origin = cellCovering(grid, box.top, box.left);
  if (!origin) return table;
  const inside = cellsInBox(grid, box);
  const ch = inside.flatMap((item) => item.cell.ch);
  const merged = withSpans(repairCell(rebuilt(origin.cell, ch)), box.right - box.left + 1, box.bottom - box.top + 1);
  const insideCells = new Set(inside.map((item) => item.cell));
  return mapCells(table, (item) => {
    if (item.cell === origin.cell) return merged;
    return insideCells.has(item.cell) ? null : item.cell;
  });
}

// 병합 칸 하나를 도로 편다 — 자기 자리는 1×1이 되고, 먹혔던 자리마다 빈 칸이 선다.
// Unmerges one merged cell — it shrinks to 1×1, and an empty cell fills each spot it used to cover.
function splitCell(table: ElementNode, target: GridCell): ElementNode {
  let next = mapCells(table, (item) => (item.cell === target.cell ? withSpans(item.cell, 1, 1) : item.cell));
  for (let r = target.row; r < target.row + target.rowSpan; r += 1) {
    for (let c = target.column; c < target.column + target.colSpan; c += 1) {
      if (r === target.row && c === target.column) continue;
      const trIndex = trIndexOfRow(next, r);
      if (trIndex === null) continue;
      next = insertCellInRow(next, trIndex, c, withCellColor(emptyCell(), cellColor(target.cell.a?.['bg'])));
    }
  }
  return next;
}

// 표를 바꾼 뒤의 답 — 캐럿은 (row, column)에서 가장 가까운 실재 칸의 문단 첫 자리다.
// The outcome after changing a table — the caret lands at the paragraph start of whatever real cell is nearest (row, column).
function settle(
  doc: readonly ElementNode[],
  tablePath: readonly number[],
  table: ElementNode,
  row: number,
  column: number,
  env: EditEnv,
): CommandOutcome {
  const next = replaceAt(doc, tablePath, [table]);
  const landed = nodeAt(next, tablePath);
  if (!landed) return { doc: next, selection: caretAt({ path: [tablePath[0] ?? 0], offset: 0 }) };
  const grid = cellGrid(landed);
  const r = Math.max(0, Math.min(row, grid.rows - 1));
  const c = Math.max(0, Math.min(column, grid.columns - 1));
  const cell = cellCovering(grid, r, c) ?? grid.cells[0];
  if (!cell) return { doc: next, selection: caretAt({ path: [tablePath[0] ?? 0], offset: 0 }) };
  return { doc: next, selection: caretAt(cellBoundary(tablePath, cell, env)) };
}

// 래퍼문단(표)을 통째로 걷은 뒤의 답 — 마지막 행·열 삭제가 표 자체 삭제로 이어진다.
// The outcome after removing the whole wrapper (table) — deleting the last row or column cascades into deleting the table itself.
function removeWholeTable(
  doc: readonly ElementNode[],
  tablePath: readonly number[],
  env: EditEnv,
): CommandOutcome | null {
  const wrapperPath = tablePath.slice(0, -1);
  if (wrapperPath.length === 0) return null;
  const next = replaceAt(doc, wrapperPath, []);
  const top = Math.min(wrapperPath[0] as number, Math.max(0, next.length - 1));
  let landing: Position | null = null;
  for (const holder of holders(next, env)) {
    if ((holder.path[0] as number) <= top) landing = { path: holder.path, offset: 0 };
    else if (landing) break;
    else {
      landing = { path: holder.path, offset: 0 };
      break;
    }
  }
  return { doc: next, selection: caretAt(landing ?? { path: [0], offset: 0 }) };
}

const withCtx =
  (run: (ctx: CellCtx, doc: readonly ElementNode[], sel: Selection, env: EditEnv) => CommandOutcome | null): Command =>
  (doc, sel, _args, env) => {
    const anchor = cellCtxOf(doc, sel.anchor);
    const ctx = cellCtxOf(doc, sel.focus);
    if (!anchor || !ctx || anchor.table !== ctx.table) return null;
    return run(ctx, doc, sel, env);
  };

const clampDim = (raw: unknown, fallback: number): number => {
  const n = typeof raw === 'number' ? Math.floor(raw) : Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 20);
};

const commands: Readonly<Record<string, Command>> = {
  setCellColor,
  selectTable(doc, sel) {
    const anchor = cellCtxOf(doc, sel.anchor);
    const focus = cellCtxOf(doc, sel.focus);
    if (!anchor || !focus || anchor.table !== focus.table) return null;
    const path = focus.tablePath.slice(0, -1);
    return { doc, selection: { anchor: { path, offset: 0 }, focus: { path, offset: 1 } } };
  },
  // 표 하나를 캐럿 자리에 세운다(빈 문단이면 교체) — 새 표의 첫 행은 예외 없이 제목 행이다(생성 길에만 선다, 들여오기는 아니다).
  // Stands up a table at the caret (replacing an empty paragraph) — the first row is always a header row, but only on creation, never on import.
  insertTable(doc, sel, args, env) {
    if (cellCtxOf(doc, sel.anchor) || cellCtxOf(doc, sel.focus)) return null;
    const rows = clampDim(args['rows'], 3);
    const cols = clampDim(args['cols'], 3);
    const table: ElementNode = {
      w: 'table',
      ch: Array.from({ length: rows }, (_unused, r) => ({
        w: 'tr',
        ch: Array.from({ length: cols }, r === 0 ? headerCell : emptyCell),
      })),
    };
    const result = insertLump(doc, sel.focus, table, env);
    return { doc: result.doc, selection: caretAt({ path: [...result.caret.path, 0, 0, 0, 0], offset: 0 }) };
  },

  addRowAbove: withCtx((ctx, doc, _sel, env) =>
    settle(doc, ctx.tablePath, insertRowAt(ctx.table, ctx.cell.row), ctx.cell.row + 1, ctx.cell.column, env),
  ),
  addRowBelow: withCtx((ctx, doc, _sel, env) =>
    settle(
      doc,
      ctx.tablePath,
      insertRowAt(ctx.table, ctx.cell.row + ctx.cell.rowSpan),
      ctx.cell.row + ctx.cell.rowSpan,
      ctx.cell.column,
      env,
    ),
  ),
  addColumnLeft: withCtx((ctx, doc, _sel, env) =>
    settle(doc, ctx.tablePath, insertColumnAt(ctx.table, ctx.cell.column), ctx.cell.row, ctx.cell.column + 1, env),
  ),
  addColumnRight: withCtx((ctx, doc, _sel, env) =>
    settle(
      doc,
      ctx.tablePath,
      insertColumnAt(ctx.table, ctx.cell.column + ctx.cell.colSpan),
      ctx.cell.row,
      ctx.cell.column + ctx.cell.colSpan,
      env,
    ),
  ),
  deleteRow: withCtx((ctx, doc, _sel, env) => {
    const next = deleteRowAt(ctx.table, ctx.cell.row);
    if (next === null) return removeWholeTable(doc, ctx.tablePath, env);
    return settle(doc, ctx.tablePath, next, ctx.cell.row, ctx.cell.column, env);
  }),
  deleteColumn: withCtx((ctx, doc, _sel, env) => {
    const next = deleteColumnAt(ctx.table, ctx.cell.column);
    if (next === null) return removeWholeTable(doc, ctx.tablePath, env);
    return settle(doc, ctx.tablePath, next, ctx.cell.row, ctx.cell.column, env);
  }),

  // 병합 토글 하나 — 방향은 안 묻는다(사각형을 잡은 것으로 이미 다 말했다). 병합 칸에 서면 눌린 채로 보이고, 다시 누르면 풀린다.
  // One merge toggle, no direction asked (the dragged rectangle already says everything) — showing pressed on a merged cell, pressing again splits it.
  mergeCells(doc, sel, _args, env) {
    const boxed = selectionBox(doc, sel);
    if (boxed) {
      const ctx = cellCtxOf(doc, ordered(sel)[0]);
      if (!ctx) return null;
      return settle(doc, boxed.tablePath, mergeBox(ctx.table, ctx.grid, boxed.box), boxed.box.top, boxed.box.left, env);
    }
    if (!isCollapsed(sel)) return null;
    const ctx = cellCtxOf(doc, sel.focus);
    if (!ctx || (ctx.cell.colSpan === 1 && ctx.cell.rowSpan === 1)) return null;
    return settle(doc, ctx.tablePath, splitCell(ctx.table, ctx.cell), ctx.cell.row, ctx.cell.column, env);
  },

  // 제목 행·열 토글 — 줄의 칸 전부가 제목이면 벗고, 아니면 입힌다.
  toggleHeaderRow: withCtx((ctx, doc, sel) => toggleHeader(ctx, doc, sel, 'row')),
  toggleHeaderColumn: withCtx((ctx, doc, sel) => toggleHeader(ctx, doc, sel, 'column')),

  // 정렬 켜기/끄기 — 보는 쪽에서 제목 칸을 눌러 열을 정렬할 수 있게 하는 표식 하나. 없으면 attachTableSort가 안 붙는다.
  // Toggles the flag that lets the viewer sort by clicking a header cell — without it, attachTableSort never attaches.
  toggleSortable(doc, sel) {
    const ctx = cellCtxOf(doc, ordered(sel)[0]);
    const end = cellCtxOf(doc, ordered(sel)[1]);
    if (!ctx || !end || ctx.table !== end.table) return null;
    const on = ctx.table.a?.[SORTABLE] === 1;
    const a: Record<string, AttrValue> = { ...(ctx.table.a ?? {}) };
    if (on) delete a[SORTABLE];
    else a[SORTABLE] = 1;
    const next: ElementNode = {
      w: 'table',
      ch: ctx.table.ch,
      ...(Object.keys(a).length > 0 ? { a } : {}),
      ...(ctx.table._id !== undefined ? { _id: ctx.table._id } : {}),
    };
    return { doc: replaceAt(doc, ctx.tablePath, [next]), selection: sel };
  },

  // 표 삭제 — 래퍼문단째 걷고 그 자리에 빈 문단을 세운다.
  // Deletes the table — removes it wrapper and all, seating an empty paragraph in its place.
  deleteTable(doc, sel) {
    const [start] = ordered(sel);
    const ctx = cellCtxOf(doc, start);
    const end = cellCtxOf(doc, ordered(sel)[1]);
    if (!ctx || !end || ctx.table !== end.table) return null;
    const empty: ElementNode = { w: P, ch: [] };
    const path = ctx.tablePath.slice(0, -1);
    return { doc: replaceAt(doc, path, [empty]), selection: caretAt({ path, offset: 0 }) };
  },
};

function toggleHeader(
  ctx: CellCtx,
  doc: readonly ElementNode[],
  sel: Selection,
  axis: 'row' | 'column',
): CommandOutcome {
  const line = axis === 'row' ? ctx.cell.row : ctx.cell.column;
  const inLine = (item: GridCell): boolean =>
    axis === 'row'
      ? item.row <= line && line <= item.row + item.rowSpan - 1
      : item.column <= line && line <= item.column + item.colSpan - 1;
  const lineCells = ctx.grid.cells.filter(inLine);
  const all = lineCells.length > 0 && lineCells.every((item) => item.cell.a?.[TH] === 1);
  const next = mapCells(ctx.table, (item) => {
    if (!inLine(item)) return item.cell;
    const a: Record<string, AttrValue> = { ...(item.cell.a ?? {}) };
    if (all) delete a[TH];
    else a[TH] = 1;
    const cell: { w: string; a?: typeof a; ch: ElementNode['ch']; _id?: string } = { w: item.cell.w, ch: item.cell.ch };
    if (Object.keys(a).length > 0) cell.a = a;
    if (item.cell._id !== undefined) cell._id = item.cell._id;
    return cell;
  });
  const out = replaceAt(doc, ctx.tablePath, [next]);
  return { doc: out, selection: sel };
}

// 그 줄이 통째로 제목인가 — 눌림 표시·토글·열 추가가 이 한 판정을 나눠 쓴다.
// Whether a whole line is header — the shared test behind the pressed indicator, the toggle, and column insertion.
function headerLine(grid: TableGrid, axis: 'row' | 'column', line: number): boolean {
  const cells = grid.cells.filter((item) =>
    axis === 'row'
      ? item.row <= line && line <= item.row + item.rowSpan - 1
      : item.column <= line && line <= item.column + item.colSpan - 1,
  );
  return cells.length > 0 && cells.every((item) => item.cell.a?.[TH] === 1);
}

export function headerLineOf(
  ctx: { readonly grid: TableGrid; readonly cell: GridCell },
  axis: 'row' | 'column',
): boolean {
  return headerLine(ctx.grid, axis, axis === 'row' ? ctx.cell.row : ctx.cell.column);
}

function arrowStep(
  intent: KeyIntent,
  doc: readonly ElementNode[],
  sel: Selection,
  env: EditEnv,
): CommandOutcome | null {
  const ctx = cellCtxOf(doc, sel.focus);
  if (!ctx) return null;
  const dir = intent.dir;
  const back = dir === 'left' || dir === 'up';
  const edge = cellBoundary(ctx.tablePath, ctx.cell, env, !back);
  if (
    sel.focus.offset !== edge.offset ||
    sel.focus.path.length !== edge.path.length ||
    !sel.focus.path.every((value, index) => value === edge.path[index])
  )
    return null;

  if (dir === 'left' || dir === 'right') {
    const next = stepCell(ctx.grid, ctx.cell, back ? -1 : 1);
    if (!next) return null;
    return { doc, selection: caretAt(cellBoundary(ctx.tablePath, next, env, back)) };
  }
  const row = back ? ctx.cell.row - 1 : ctx.cell.row + ctx.cell.rowSpan;
  if (row < 0 || row >= ctx.grid.rows) return exitWrapper(doc, ctx.tablePath, back ? 'up' : 'down');
  const next = cellCovering(ctx.grid, row, ctx.cell.column);
  return next ? { doc, selection: caretAt(cellBoundary(ctx.tablePath, next, env)) } : null;
}

const onKey: OnKey = (intent, doc, sel, env, owner) => {
  if (!isCollapsed(sel) || owner.node.w !== 'td') return null;
  if (intent.key === 'arrow') return arrowStep(intent, doc, sel, env);
  if (intent.key !== 'tab' && intent.key !== 'shiftTab') return null;
  const ctx = cellCtxOf(doc, sel.focus);
  if (!ctx) return null;
  const back = intent.key === 'shiftTab';
  const next = stepCell(ctx.grid, ctx.cell, back ? -1 : 1);
  if (next) return { doc, selection: caretAt(cellBoundary(ctx.tablePath, next, env)) };
  if (back) return null;
  return settle(doc, ctx.tablePath, insertRowAt(ctx.table, ctx.grid.rows), ctx.grid.rows, 0, env);
};

const spanAttr = (value: AttrValue | undefined): string | undefined => {
  const n = spanOf(value);
  return n > 1 ? String(n) : undefined;
};

const tableHtml: HtmlBuilder = (node, children, ctx) =>
  ctx.wrap(
    'div',
    ctx.element('table', children(), { 'data-nabi-sortable': node.a?.[SORTABLE] === 1 ? '' : undefined }),
    { class: 'nabi-scroll' },
  );

const trHtml: HtmlBuilder = (_node, children, ctx) => ctx.element('tr', children());

// 제목 칸은 th로 나간다 — 표식(attr)이 곧 태그다.
// A header cell renders as `th` — the attr flag becomes the tag itself.
const tdHtml: HtmlBuilder = (node, children, ctx) =>
  ctx.element(node.a?.[TH] === 1 ? 'th' : 'td', ctx.filled(children()), {
    colspan: spanAttr(node.a?.[SPAN_COL]),
    rowspan: spanAttr(node.a?.[SPAN_ROW]),
    'data-nabi-cell-color': cellColor(node.a?.['bg']),
  });

// 파이프 표는 md에서 격자 하나뿐이다 — 머리가 통째로 첫 줄, 병합 없음, 줄마다 칸 수 동일. 하나라도 어긋나면 html로 낸다.
// A pipe table in md handles exactly one shape — first row all-header, no merges, equal cell counts per row; any mismatch falls back to html entirely.
function pipeable(node: ElementNode): boolean {
  let cols = -1;
  for (let r = 0; r < node.ch.length; r += 1) {
    const row = node.ch[r];
    if (!isElement(row) || row.w !== 'tr') return false;
    if (cols < 0) cols = row.ch.length;
    else if (row.ch.length !== cols) return false;
    for (const cell of row.ch) {
      if (!isElement(cell) || cell.w !== 'td') return false;
      if (cellColor(cell.a?.['bg']) !== undefined) return false;
      const paragraph = cell.ch[0];
      if (cell.ch.length !== 1 || !isElement(paragraph) || paragraph.w !== P || paragraph.a !== undefined) return false;
      const inline = (node: NabiNode): boolean =>
        typeof node === 'string' ||
        (node.w !== P && node.w !== BR && node.w !== 'code' && node.ch.length > 0 && node.ch.every(inline));
      if (!paragraph.ch.every(inline)) return false;
      if (spanOf(cell.a?.[SPAN_COL]) > 1 || spanOf(cell.a?.[SPAN_ROW]) > 1) return false;
      if ((cell.a?.[TH] === 1) !== (r === 0)) return false;
    }
  }
  return cols > 0;
}

const tableMd: MdBuilder = (node, ctx) => {
  if (!pipeable(node)) return ctx.html();
  const rows = ctx.children('\n').split('\n');
  const cols = (node.ch[0] as ElementNode).ch.length;
  // 구분 줄 — 머리와 몸을 가르는 이 한 줄이 없으면 파이프 줄은 그냥 글이다.
  // The separator line — without it, pipe-delimited lines are read back as plain text, not a table.
  return [rows[0], `|${' --- |'.repeat(cols)}`, ...rows.slice(1)].join('\n');
};

const trMd: MdBuilder = (_node, ctx) => `| ${ctx.children(' | ')} |`;

// 칸 하나는 한 줄에 들어야 한다 — 줄바꿈은 칸이 아니라 표를 깬다.
// A cell must fit on one line — a line break wouldn't just break the cell, it'd break the whole table.
const tdMd: MdBuilder = (_node, ctx) => ctx.children(' ').replace(/\s+/g, ' ').trim();

// 들여오기 — 기본 대응은 th를 td로만 누이므로, 제목 표식은 여기서 주장한다.
// Import claim — the default mapping just flattens th to td, so the header flag must be asserted here instead.
function claim(el: ParseElement, inner: (block: boolean) => NabiNode[]): NabiNode[] | null {
  // 정렬 표식을 단 표 — 표식만 되읽고 속은 기본 대응이 읽게 둔다.
  if (el.tag === 'table' && el.attrs['data-nabi-sortable'] !== undefined) {
    return [{ w: 'table', a: { [SORTABLE]: 1 }, ch: inner(true) }];
  }
  if (el.tag !== 'th' && el.tag !== 'td') return null;
  const a: Record<string, AttrValue> = el.tag === 'th' ? { [TH]: 1 } : {};
  const bg = cellColor(el.attrs['data-nabi-cell-color']);
  if (bg !== undefined) a['bg'] = bg;
  const colspan = spanAttr(el.attrs['colspan']);
  const rowspan = spanAttr(el.attrs['rowspan']);
  if (colspan) a[SPAN_COL] = colspan;
  if (rowspan) a[SPAN_ROW] = rowspan;
  return [{ w: 'td', a, ch: inner(true) }];
}

// 눌림은 currentValue가 답하는 상태 토큰('merged'·'th')으로 읽는다.
// A pressed state is read from the token currentValue returns ('merged', 'th').
const TABLE_ICONS = {
  sortable: 'table-sortable',
  grid: 'table-grid',
  rowAbove: 'table-row-above',
  rowBelow: 'table-row-below',
  rowDelete: 'table-row-delete',
  colLeft: 'table-col-left',
  colRight: 'table-col-right',
  colDelete: 'table-col-delete',
  headerRow: 'table-header-row',
  headerColumn: 'table-header-column',
  merge: 'table-merge',
} as const;

const TABLE_NAME: LocaleText = {
  ko: '표',
  en: 'Table',
  ja: '表',
  zh: '表格',
  de: 'Tabelle',
  fr: 'Tableau',
  es: 'Tabla',
  pt: 'Tabela',
  ru: 'Таблица',
  ar: 'جدول',
  hi: 'तालिका',
  bn: 'টেবিল',
  ur: 'جدول',
  id: 'Tabel',
};
const TABLE_TEXT: Readonly<Record<string, LocaleText>> = {
  rowAbove: {
    ko: '위에 행 추가',
    en: 'Insert row above',
    ja: '上に行を挿入',
    zh: '在上方插入行',
    de: 'Zeile darüber einfügen',
    fr: 'Insérer une ligne au-dessus',
    es: 'Insertar fila arriba',
    pt: 'Inserir linha acima',
    ru: 'Вставить строку выше',
    ar: 'إدراج صف أعلى',
    hi: 'ऊपर पंक्ति जोड़ें',
    bn: 'উপরে সারি যোগ করুন',
    ur: 'اوپر قطار شامل کریں',
    id: 'Sisipkan baris di atas',
  },
  rowBelow: {
    ko: '아래에 행 추가',
    en: 'Insert row below',
    ja: '下に行を挿入',
    zh: '在下方插入行',
    de: 'Zeile darunter einfügen',
    fr: 'Insérer une ligne en dessous',
    es: 'Insertar fila debajo',
    pt: 'Inserir linha abaixo',
    ru: 'Вставить строку ниже',
    ar: 'إدراج صف أسفل',
    hi: 'नीचे पंक्ति जोड़ें',
    bn: 'নিচে সারি যোগ করুন',
    ur: 'نیچے قطار شامل کریں',
    id: 'Sisipkan baris di bawah',
  },
  sortable: {
    ko: '정렬 켜기/끄기',
    en: 'Toggle sorting',
    ja: '並べ替えの切り替え',
    zh: '切换排序',
    de: 'Sortierung umschalten',
    fr: 'Activer le tri',
    es: 'Alternar ordenación',
    pt: 'Alternar ordenação',
    ru: 'Переключить сортировку',
    ar: 'تبديل الفرز',
    hi: 'क्रमबद्धता टॉगल करें',
    bn: 'সাজানো চালু/বন্ধ',
    ur: 'ترتیب آن/آف',
    id: 'Aktifkan pengurutan',
  },
  rowDelete: {
    ko: '행 삭제',
    en: 'Delete row',
    ja: '行を削除',
    zh: '删除行',
    de: 'Zeile löschen',
    fr: 'Supprimer la ligne',
    es: 'Eliminar fila',
    pt: 'Excluir linha',
    ru: 'Удалить строку',
    ar: 'حذف الصف',
    hi: 'पंक्ति हटाएँ',
    bn: 'সারি মুছুন',
    ur: 'قطار حذف کریں',
    id: 'Hapus baris',
  },
  colLeft: {
    ko: '왼쪽에 열 추가',
    en: 'Insert column left',
    ja: '左に列を挿入',
    zh: '在左侧插入列',
    de: 'Spalte links einfügen',
    fr: 'Insérer une colonne à gauche',
    es: 'Insertar columna a la izquierda',
    pt: 'Inserir coluna à esquerda',
    ru: 'Вставить столбец слева',
    ar: 'إدراج عمود على اليسار',
    hi: 'बाएँ स्तंभ जोड़ें',
    bn: 'বাঁয়ে কলাম যোগ করুন',
    ur: 'بائیں کالم شامل کریں',
    id: 'Sisipkan kolom di kiri',
  },
  colRight: {
    ko: '오른쪽에 열 추가',
    en: 'Insert column right',
    ja: '右に列を挿入',
    zh: '在右侧插入列',
    de: 'Spalte rechts einfügen',
    fr: 'Insérer une colonne à droite',
    es: 'Insertar columna a la derecha',
    pt: 'Inserir coluna à direita',
    ru: 'Вставить столбец справа',
    ar: 'إدراج عمود على اليمين',
    hi: 'दाएँ स्तंभ जोड़ें',
    bn: 'ডানে কলাম যোগ করুন',
    ur: 'دائیں کالم شامل کریں',
    id: 'Sisipkan kolom di kanan',
  },
  colDelete: {
    ko: '열 삭제',
    en: 'Delete column',
    ja: '列を削除',
    zh: '删除列',
    de: 'Spalte löschen',
    fr: 'Supprimer la colonne',
    es: 'Eliminar columna',
    pt: 'Excluir coluna',
    ru: 'Удалить столбец',
    ar: 'حذف العمود',
    hi: 'स्तंभ हटाएँ',
    bn: 'কলাম মুছুন',
    ur: 'کالم حذف کریں',
    id: 'Hapus kolom',
  },
  merge: {
    ko: '칸 병합',
    en: 'Merge cells',
    ja: 'セルを結合',
    zh: '合并单元格',
    de: 'Zellen verbinden',
    fr: 'Fusionner les cellules',
    es: 'Combinar celdas',
    pt: 'Mesclar células',
    ru: 'Объединить ячейки',
    ar: 'دمج الخلايا',
    hi: 'सेल मर्ज करें',
    bn: 'ঘর মার্জ করুন',
    ur: 'خانے ضم کریں',
    id: 'Gabungkan sel',
  },
  headerRow: {
    ko: '이 행을 제목으로',
    en: 'Header this row',
    ja: 'この行を見出しに',
    zh: '将此行设为标题行',
    de: 'Diese Zeile als Kopfzeile',
    fr: 'Cette ligne en en-tête',
    es: 'Esta fila como encabezado',
    pt: 'Esta linha como cabeçalho',
    ru: 'Сделать строку заголовком',
    ar: 'جعل هذا الصف رأسًا',
    hi: 'इस पंक्ति को शीर्षक बनाएँ',
    bn: 'এই সারিকে শিরোনাম করুন',
    ur: 'اس قطار کو سرخی بنائیں',
    id: 'Jadikan baris ini header',
  },
  headerColumn: {
    ko: '이 열을 제목으로',
    en: 'Header this column',
    ja: 'この列を見出しに',
    zh: '将此列设为标题列',
    de: 'Diese Spalte als Kopfspalte',
    fr: 'Cette colonne en en-tête',
    es: 'Esta columna como encabezado',
    pt: 'Esta coluna como cabeçalho',
    ru: 'Сделать столбец заголовком',
    ar: 'جعل هذا العمود رأسًا',
    hi: 'इस स्तंभ को शीर्षक बनाएँ',
    bn: 'এই কলামকে শিরোনাম করুন',
    ur: 'اس کالم کو سرخی بنائیں',
    id: 'Jadikan kolom ini header',
  },
};

const TABLE_CSS = `
/* 표는 자리를 꽉 채우지 않는다 — 폭을 안 적어야 속 글에 맞춰 자동 배치가 줄어들고, 안 그러면 칸 둘짜리 표가 빈 칸만 늘어난다. */
/* A table never fills its space by default — leaving width unset lets it shrink to content; setting it explicitly would stretch a two-column table into empty space. */
.nabi-content table { border-collapse: collapse; }
/* 칸의 최소 폭 — 없으면 갓 만든 표가 폭 0으로 접혀 캐럿이 설 자리가 없어진다("셀을 클릭해도 커서가 안 생김"). */
/* A cell's minimum width — without it, a freshly created table collapses to zero width, leaving no room for a caret to land. */
.nabi-content th,.nabi-content td {
  border: 1px solid var(--nabi-line); padding:.35em.6em; vertical-align: top; text-align: start;
  min-inline-size: 4rem;
}
.nabi-content th { background: var(--nabi-soft); font-weight: 650; }
${CELL_COLORS.map((color) => `.nabi-content :is(td, th)[data-nabi-cell-color="${color}"] { background: var(--nabi-cell-${color}); }`).join('\n')}

/* 드래그로 세운 칸 상자는 화면 전용 표식이다(트리·저장 HTML엔 안 실린다) — 이 규칙 없이는 표식만 붙고 안 그려진다. */
/* The drag-selected cell box is a screen-only flag (never in the tree or saved HTML) — without this rule the flag attaches but nothing renders. */
.nabi-content :is(td, th)[data-nabi-cell-selected] {
  outline: 2px solid var(--nabi-accent); outline-offset: -2px;
}
/* 상자가 선 표에서는 브라우저의 글 선택을 지운다 — 두 겹으로 칠해지면 어디까지가 상자인지
   안 읽힌다. 상자는 칸 단위이고 글 선택은 글자 단위라, 경계가 서로 어긋나 보인다.
   **칸이 아니라 표에 건다**: 선택은 첫 칸에서 끝 칸까지 문서 순서로 이어져 있어서, 상자 밖인데
   그 사이에 낀 칸에도 파란 칠이 남는다. */
.nabi-content table[data-nabi-cell-boxed] ::selection,
.nabi-content table[data-nabi-cell-boxed]::selection { background: transparent; }
.nabi-content td > p,.nabi-content th > p { margin: 0; }

/* 정렬 단추 — 그리는 쪽은 보는 런타임(nabi-note/viewer)이지만 생김새는 표의 것이라 여기 산다.
   칸의 오른쪽 **가운데**에 선다: 위에 띄우면 제목이 두 줄인 열과 한 줄인 열의 높이가 달라 보인다.
   흐름에서 빼내(absolute) 제목의 줄바꿈에 안 끼어들고, 그만큼 칸의 끝 여백을 넓힌다. */
.nabi-content table :is(th, td):has(>.nabi-sort) { position: relative; padding-inline-end: 1.75em; }
.nabi-content table .nabi-sort {
  position: absolute; inset-inline-end:.25em; inset-block-start: 50%; transform: translateY(-50%);
  display: inline-flex; align-items: center; justify-content: center;
  inline-size: 1.25em; block-size: 1.25em; padding:.18em; border: 0;
  border-radius: var(--nabi-radius); background: transparent; color: inherit; cursor: pointer;
}
.nabi-content table .nabi-sort .nabi-icon { inline-size: 100%; block-size: 100%; }
.nabi-content table .nabi-sort:hover { background: var(--nabi-soft); }
.nabi-content table .nabi-sort[data-nabi-sort-active] { background: var(--nabi-soft); outline: 1px solid var(--nabi-accent); }

/* 편집 화면의 정렬 표식 — 정렬 동작 자체는 보는 쪽 런타임의 것이라 편집기에는 표식만 선다(행이 저 혼자 움직이면 캐럿을 잃는다). */
/* The editor shows only a sort indicator, never actual sorting — real sorting belongs to the viewer runtime, since a row moving on its own would lose the caret. */
/* 첫 행에만, 병합 없는 표에만 선다 — attachTableSort가 붙는 자리와 정확히 같아야 화면이 거짓말을 안 한다. */
/* Shown only on the first row of a merge-free table — must match exactly where attachTableSort attaches, or the screen would lie. */
.nabi-content.nabi-editing table[data-nabi-sortable]:not(:has([colspan], [rowspan])) tr:first-child > :is(th, td) {
  position: relative; padding-inline-end: 1.75em;
}
.nabi-content.nabi-editing table[data-nabi-sortable]:not(:has([colspan], [rowspan])) tr:first-child > :is(th, td)::after {
  content: ""; position: absolute; inset-inline-end:.25em; inset-block-start: 50%;
  transform: translateY(-50%); pointer-events: none;
  inline-size: 1.25em; block-size: 1.25em; opacity:.38;
  background: var(--nabi-icon-viewer-sort-original, var(--nabi-default-icon-sort-original)) center / contain no-repeat;
}

/* 표 만들기 격자는 작은 화면에서 5×5로 줄고 칸은 손가락 크기로 커진다 — 몇 칸이 서는지는 button.action의 max가 정한다. */
/* The table-creation grid shrinks to 5x5 on small screens with finger-sized cells — the cell count comes from button.action's max. */
.nabi-narrow .nabi-grid {
  --nabi-grid-cell: var(--nabi-touch-control-size, 2.75rem);
  gap: .25rem;
  grid-template-columns: repeat(5, var(--nabi-grid-cell)) !important;
}
/* 여섯째 열·줄부터 걷는다 — 여기 적힌 8은 button.action의 max와 함께 움직인다. */
/* Hides everything from the 6th column/row on — the 8 here must move in lockstep with button.action's max. */
.nabi-narrow .nabi-grid > .nabi-cell:nth-child(8n + 6),
.nabi-narrow .nabi-grid > .nabi-cell:nth-child(8n + 7),
.nabi-narrow .nabi-grid > .nabi-cell:nth-child(8n + 8),
.nabi-narrow .nabi-grid > .nabi-cell:nth-child(n + 41) { display: none; }

`;

export const tableWing: Wing = {
  w: 'table',
  place: 'container',
  basic: true,
  holds: 'blocks',
  allows: ['tr'],
  parts: {
    tr: { holds: 'blocks' },
    td: {
      holds: 'blocks',
      isolating: true,
      boolAttrs: [TH],
      scopedCommands: [
        'insertImage',
        'commitUpload',
        'insertYoutube',
        'insertDivider',
        'toggleQuote',
        'toggleDetails',
        'toggleCode',
        'toggleBulletList',
        'toggleOrderedList',
        'toggleTaskList',
      ],
    },
  },
  toHtml: tableHtml,
  partHtml: { tr: trHtml, td: tdHtml },
  toMd: tableMd,
  partMd: { tr: trMd, td: tdMd },
  claim,
  repair: repairTable,
  partRepair: { td: repairCell },
  onKey,
  commands,
  // 이 wing은 여러 급(표·행·칸)을 소유하고 상태도 급마다 나뉜다(칸: merged/th, 표: sort) — 상황 줄이 조상 줄기 전부의 토큰을 합쳐 읽어 칸 안 단추가 표의 상태를 보여줄 수 있다.
  // This wing owns several levels (table/row/cell), each with its own state (cell: merged/th, table: sort) — the context bar reads tokens up the whole ancestor chain, so a button inside a cell can still reflect the table's own state.
  currentValue: (node) => {
    if (node.w === 'table') return node.a?.[SORTABLE] === 1 ? SORTABLE : undefined;
    if (node.w !== 'td') return undefined;
    const tokens: string[] = [];
    if (spanOf(node.a?.[SPAN_COL]) > 1 || spanOf(node.a?.[SPAN_ROW]) > 1) tokens.push('merged');
    if (node.a?.[TH] === 1) tokens.push(TH);
    return tokens.length > 0 ? tokens.join(' ') : undefined;
  },
  button: {
    group: 'structure',
    shortcut: 'T',
    icon: TABLE_ICONS.grid,
    label: TABLE_NAME,
    // 격자 하나로 행·열을 함께 고른다 — 8은 데스크톱 수, 시트의 nth-child(8n+…)와 한 몸이라 같이 고쳐야 한다.
    // One grid picks rows and columns together; 8 is the desktop count, tied to the stylesheet's nth-child(8n+...) rule — change one, change both.
    action: { kind: 'grid', command: 'insertTable', rowsKey: 'rows', colsKey: 'cols', max: 8 },
  },
  // 상황 줄 — 칸 하나에 걸린 손잡이 전부. 병합·제목은 상태 토큰으로 눌림을 읽는다.
  // Context bar — every handle attached to one cell; merge/header read their pressed state from a state token.
  context: {
    title: TABLE_NAME,
    controls: [
      {
        kind: 'button',
        name: 'selectTable',
        command: 'selectTable',
        icon: TABLE_ICONS.grid,
        label: {
          ko: '표 전체 선택',
          en: 'Select table',
          zh: '选择整个表格',
          hi: 'पूरी तालिका चुनें',
          es: 'Seleccionar tabla',
          ar: 'تحديد الجدول',
          fr: 'Sélectionner le tableau',
          bn: 'পুরো সারণি নির্বাচন করুন',
          pt: 'Selecionar tabela',
          ru: 'Выбрать таблицу',
          id: 'Pilih tabel',
          ur: 'پورا جدول منتخب کریں',
          de: 'Tabelle auswählen',
          ja: '表全体を選択',
          fa: 'انتخاب جدول',
          mr: 'संपूर्ण तक्ता निवडा',
          vi: 'Chọn bảng',
          te: 'మొత్తం పట్టికను ఎంచుకోండి',
          ha: 'Zaɓi tebur',
          tr: 'Tabloyu seç',
          sw: 'Chagua jedwali',
          ta: 'முழு அட்டவணையையும் தேர்ந்தெடு',
          th: 'เลือกทั้งตาราง',
          it: 'Seleziona tabella',
        },
      },
      {
        kind: 'select',
        name: 'cellColor',
        command: 'setCellColor',
        argKey: 'bg',
        attr: 'bg',
        label: CELL_COLOR_LABEL,
        values: CELL_COLOR_CHOICES,
      },
      {
        kind: 'button',
        name: 'rowAbove',
        command: 'addRowAbove',
        icon: TABLE_ICONS.rowAbove,
        label: TABLE_TEXT.rowAbove,
      },
      {
        kind: 'button',
        name: 'rowBelow',
        command: 'addRowBelow',
        icon: TABLE_ICONS.rowBelow,
        label: TABLE_TEXT.rowBelow,
      },
      {
        kind: 'button',
        name: 'rowDelete',
        command: 'deleteRow',
        icon: TABLE_ICONS.rowDelete,
        label: TABLE_TEXT.rowDelete,
      },
      {
        kind: 'button',
        name: 'colLeft',
        command: 'addColumnLeft',
        icon: TABLE_ICONS.colLeft,
        label: TABLE_TEXT.colLeft,
      },
      {
        kind: 'button',
        name: 'colRight',
        command: 'addColumnRight',
        icon: TABLE_ICONS.colRight,
        label: TABLE_TEXT.colRight,
      },
      {
        kind: 'button',
        name: 'colDelete',
        command: 'deleteColumn',
        icon: TABLE_ICONS.colDelete,
        label: TABLE_TEXT.colDelete,
      },
      {
        kind: 'toggle',
        name: 'merge',
        command: 'mergeCells',
        token: 'merged',
        icon: TABLE_ICONS.merge,
        label: TABLE_TEXT.merge,
      },
      {
        kind: 'toggle',
        name: 'headerRow',
        command: 'toggleHeaderRow',
        token: 'th',
        icon: TABLE_ICONS.headerRow,
        label: TABLE_TEXT.headerRow,
      },
      {
        kind: 'toggle',
        name: 'headerColumn',
        command: 'toggleHeaderColumn',
        token: 'th',
        icon: TABLE_ICONS.headerColumn,
        label: TABLE_TEXT.headerColumn,
      },
      // 정렬도 토글이다 — 이 토큰('sort')은 칸이 아니라 표가 답하고, 상황 줄이 조상 줄기의 토큰을 합쳐 읽으므로 칸 안 단추가 표의 상태로 눌린다.
      // Sorting is a toggle too — the 'sort' token comes from the table, not the cell, and since the context bar reads tokens up the ancestor chain, a button inside a cell can still show the table's own pressed state.
      {
        kind: 'toggle',
        name: 'sortable',
        command: 'toggleSortable',
        token: SORTABLE,
        icon: TABLE_ICONS.sortable,
        label: TABLE_TEXT.sortable,
      },
      // 표 삭제 단추는 여기 없다 — 표를 통째로 지우는 길은 이미 블록 선택 + 삭제로 나 있어 같은 일을 하는 문이 둘일 필요가 없다.
      // No delete-table button here — whole-table deletion already works via block-select + delete, so a second door for the same job is unnecessary.
      // 커맨드(`deleteTable`)는 남는다 — 호스트가 제 화면에서 부를 길이다.
      // The `deleteTable` command still exists, for hosts to call from their own UI.
    ],
  },
  styles: TABLE_CSS,
};

$markBuiltinAttrOwner(tableWing, ['table', 'tr', 'td']);
$setParagraphTargets(tableWing, tableParagraphTargets);
$setContextState(tableWing, (doc, selection) => {
  const selected = cellColorSelection(doc, selection);
  if (!selected) return { hidden: ['cellColor', 'selectTable'] };
  const focus = cellCtxOf(doc, selection.focus);
  const first = selected.cells[0]?.cell.a?.['bg'];
  const common = selected.cells.every((item) => item.cell.a?.['bg'] === first);
  return {
    ...(focus ? { node: focus.cell.cell } : {}),
    values: { cellColor: common ? (cellColor(first) ?? '') : undefined },
  };
});
