// 표 wing — 064 의 표 버그 다섯(3·4·5·6·7)이 구조적으로 안 나는 표.
//   구조: 래퍼문단 > table > tr > td > 문단 하나(엔터 = 라인). 정렬·폭 attr 없음.
//   repair: 들쭉 행·span 초과를 빈 칸으로 채워 직사각형 — cocoon 이 위임 호출.
//   키: tab/shiftTab 칸 이동. Shift+방향키는 아예 안 받는다 — mount 가 브라우저에 돌려준다.
//   병합: 토글 하나 — 잡은 사각형을 하나로, 병합 칸에서 다시 누르면 풀린다. 캐럿은 언제나 실재 자리로.
//   제목: 행·열 토글 + currentValue 눌림. 칸의 제목 표식은 불리언 attr `th` 다.
import { BR, P, isElement, type AttrValue, type ElementNode, type NabiNode } from '../../schema/index.js';
import { holderLength, nodeAt, replaceAt, holders, type EditEnv, type Position } from '../../doc/index.js';
import { caretAt, isCollapsed, ordered, type Selection } from '../../caret/index.js';
import type { Command, CommandOutcome } from '../../editor/index.js';
import type { HtmlBuilder, ParseElement } from '../../html/index.js';
import type { KeyIntent, OnKey, Wing } from '../../wing/index.js';
import { insertLump } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import {
  SPAN_COL,
  SPAN_ROW,
  boxBetween,
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

// 칸의 제목 표식 — 값 1 뿐인 불리언. `br` 예약어와 헷갈릴 이름(hr 류)을 피해 HTML 의 th 를 그대로 쓴다.
export const TH = 'th';

// 보는 쪽(nabi-note/viewer)의 열 정렬을 켜는 표식 — 값이 1 뿐인 불리언이다.
// **어느 열을 어느 방향으로 정렬했는지는 저장하지 않는다** — 그것은 읽는 사람의 일이고 문서의
// 것이 아니다. 문서에 남는 것은 "이 표는 정렬해도 된다" 한 마디뿐이다.
export const SORTABLE = 'sort';

const emptyParagraph = (): ElementNode => ({ w: P, ch: [] });
const emptyCell = (): ElementNode => ({ w: 'td', ch: [emptyParagraph()] });
// 제목 칸 — 표식만 다른 같은 칸이다(칸의 이름은 언제나 td 고, 제목은 attr 하나가 말한다).
const headerCell = (): ElementNode => ({ w: 'td', a: { [TH]: 1 }, ch: [emptyParagraph()] });

function rebuilt(node: ElementNode, ch: readonly NabiNode[]): ElementNode {
  return {
    w: node.w,
    ch,
...(node.a ? { a: node.a } : {}),
...(node._id !== undefined ? { _id: node._id } : {}),
  };
}

// --- 칸 속 = 문단 하나 (repair) ---------------------------------------------------------------

// 속이 이미 "문단 하나 + 깨끗한 인라인"인가 — 매 커맨드 cocoon 위에서 공짜여야 하므로
// 참일 때는 손대지 않는다 (구조 공유).
function cleanInline(node: NabiNode): boolean {
  if (typeof node === 'string') return true;
  if (!isElement(node)) return false;
  if (node.w === BR) return node.ch.length === 0;
  if (node.w === P) return false; // 문단 속 문단 — 칸에서는 라인으로 눌러야 한다
  if (node.ch.length === 0) return false; // 속 빈 엘리먼트(물건 류) — 인라인 자리가 아니다
  return node.ch.every(cleanInline);
}

function cleanCell(cell: ElementNode): boolean {
  if (cell.ch.length !== 1) return false;
  const only = cell.ch[0];
  return isElement(only) && only.w === P && only.ch.every(cleanInline);
}

// 속 어딘가에 문단이 사는가 — 마크(인라인)와 블록 껍데기(행·칸·중첩 표)를 가르는 판정.
function hasParagraphInside(node: ElementNode): boolean {
  return node.ch.some((child) => isElement(child) && (child.w === P || hasParagraphInside(child)));
}

// 블록들을 라인으로 눌러 한 문단의 인라인으로 만든다 — 옛 규칙("칸은 글줄") 그대로.
// 마크는 남기고, 블록 껍데기(문단·래퍼·중첩 표)는 벗기며 경계마다 라인을 한 칸 둔다.
function pressInline(nodes: readonly NabiNode[], out: NabiNode[], sep: { pending: boolean }): void {
  const flush = (): void => {
    if (sep.pending && out.length > 0) out.push({ w: BR, ch: [] });
    sep.pending = false;
  };
  for (const node of nodes) {
    if (typeof node === 'string') {
      if (node === '') continue;
      flush();
      out.push(node);
      continue;
    }
    if (!isElement(node)) continue;
    if (node.w === BR) {
      flush();
      out.push({ w: BR, ch: [] });
      continue;
    }
    if (node.w === P || hasParagraphInside(node)) {
      // 블록 껍데기(문단·래퍼·중첩 표의 행과 칸) — 벗기고, 앞뒤 경계를 라인으로 남긴다.
      const before = out.length;
      sep.pending = out.length > 0;
      pressInline(node.ch, out, sep);
      sep.pending = out.length > before || sep.pending;
      continue;
    }
    if (node.ch.length === 0) continue; // 물건·빈 마크 — 칸의 인라인 자리에 못 선다
    flush();
    out.push(node); // 마크 — 속까지 깨끗한 인라인이다
  }
}

export function repairCell(cell: ElementNode): ElementNode {
  if (cleanCell(cell)) return cell;
  const inline: NabiNode[] = [];
  pressInline(cell.ch, inline, { pending: false });
  const first = cell.ch[0];
  const paragraph: ElementNode =
    isElement(first) && first.w === P
      ? rebuilt(first, inline)
      : { w: P, ch: inline };
  return rebuilt(cell, [paragraph]);
}

// --- 표 repair — 행 아닌 자식 감싸기· span 조임· 직사각형화 --------------------------

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

export function repairTable(table: ElementNode): ElementNode {
  // 1) 행 아닌 블록 자식 — 행 하나(칸 하나)로 감싼다. 글은 남는다.
  let wrappedAny = false;
  const rowsOnly = table.ch.map((child) => {
    if (isElement(child) && child.w === 'tr') return child;
    wrappedAny = true;
    const pressed: NabiNode[] = [];
    pressInline([child], pressed, { pending: false });
    if (pressed.length === 0) return null;
    return { w: 'tr', ch: [{ w: 'td', ch: [{ w: P, ch: pressed }] }] } as ElementNode;
  });
  const base = wrappedAny
    ? rebuilt(table, rowsOnly.filter((child): child is ElementNode => child !== null))
    : table;

  // 2) 행이 하나도 없으면 1×1 로 세운다 — 캐럿의 집.
  const hasRow = base.ch.some((child) => isElement(child) && child.w === 'tr');
  const seeded = hasRow ? base : rebuilt(base, [{ w: 'tr', ch: [emptyCell()] }]);

  // 3) span 조임 → 4) 직사각형화 — 행마다 모자란 만큼 빈 칸을 꼬리에 채운다.
  const clamped = clampSpans(seeded);
  const grid = cellGrid(clamped);
  const columns = Math.max(1, grid.columns);
  let padded = false;
  let r = -1;
  const ch = clamped.ch.map((child) => {
    if (!isElement(child) || child.w !== 'tr') return child;
    r += 1;
    let covered = 0;
    for (let c = 0; c < columns; c += 1) if (cellCovering(grid, r, c)) covered += 1;
    const missing = columns - covered;
    if (missing <= 0) return child;
    padded = true;
    return rebuilt(child, [...child.ch,...Array.from({ length: missing }, emptyCell)]);
  });
  return padded ? rebuilt(clamped, ch) : clamped;
}

// --- 캐럿 자리의 칸 찾기 -----------------------------------------------------------------------

interface CellCtx {
  readonly tablePath: readonly number[];
  readonly table: ElementNode;
  readonly grid: TableGrid;
  readonly cell: GridCell;
}

function cellCtxOf(doc: readonly ElementNode[], pos: Position): CellCtx | null {
  for (let depth = pos.path.length; depth >= 1; depth -= 1) {
    const at = pos.path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (!node || node.w !== 'table') continue;
    const trIndex = pos.path[depth];
    const tdIndex = pos.path[depth + 1];
    if (trIndex === undefined || tdIndex === undefined) return null;
    const grid = cellGrid(node);
    const cell = grid.cells.find((item) => item.trIndex === trIndex && item.tdIndex === tdIndex);
    if (!cell) return null;
    return { tablePath: at, table: node, grid, cell };
  }
  return null;
}

// 칸의 문단 첫 자리 — repair 가 "칸 = 문단 하나"를 보장하므로 문단 인덱스는 0 이다.
function caretInCell(tablePath: readonly number[], cell: GridCell, offset = 0): Position {
  return { path: [...tablePath, cell.trIndex, cell.tdIndex, 0], offset };
}

// 격자 행 번호 → table.ch 의 tr 인덱스.
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

// --- 행·열 넣고 빼기 (순수 — 표 노드만 다룬다) -------------------------------------------------

// 격자 행 `line` 자리에 새 행을 넣는다 (line === rows 면 꼬리).
function insertRowAt(table: ElementNode, line: number): ElementNode {
  const grid = cellGrid(table);
  const columns = Math.max(1, grid.columns);

  // 줄을 가로지르는 병합 칸은 한 칸 더 자란다 — 그 열들에는 새 칸이 안 선다.
  const spanning = grid.cells.filter((item) => item.row < line && item.row + item.rowSpan - 1 >= line);
  // mapCells 는 격자를 새로 지으므로 GridCell 이 아니라 칸 노드 참조로 맞춘다.
  const spanningCells = new Set(spanning.map((item) => item.cell));
  const widened =
    spanning.length === 0
      ? table
      : mapCells(table, (item) =>
          spanningCells.has(item.cell) ? withSpans(item.cell, item.colSpan, item.rowSpan + 1) : item.cell,
);

  const coveredCols = new Set<number>();
  for (const item of spanning) {
    for (let c = item.column; c < item.column + item.colSpan; c += 1) coveredCols.add(c);
  }
  const fresh: ElementNode[] = [];
  for (let c = 0; c < columns; c += 1) if (!coveredCols.has(c)) fresh.push(emptyCell());
  const row: ElementNode = { w: 'tr', ch: fresh };

  const anchorTr = line < grid.rows ? trIndexOfRow(widened, line) : null;
  const at = anchorTr ?? widened.ch.length;
  return rebuilt(widened, [...widened.ch.slice(0, at), row,...widened.ch.slice(at)]);
}

// 격자 열 `line` 자리에 새 열을 넣는다 (line === columns 면 오른끝).
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

  const coveredRows = new Set<number>();
  for (const item of spanning) {
    for (let r = item.row; r < item.row + item.rowSpan; r += 1) coveredRows.add(r);
  }
  let next = widened;
  for (let r = 0; r < grid.rows; r += 1) {
    if (coveredRows.has(r)) continue;
    const trIndex = trIndexOfRow(next, r);
    if (trIndex === null) continue;
    // 제목 줄에는 제목 칸이 선다 — 새 표는 첫 행이 늘 제목이라(084 ③), 여기서 빈 칸을 넣으면
    // 열을 하나 더할 때마다 제목 줄에 구멍이 뚫린다. 줄이 통째로 제목일 때만 따라간다.
    //
    // **행 추가 쪽에는 같은 규칙을 안 건다**: 제목 행 하나뿐인 표에서는 모든 열이 "통째로 제목"
    // 이라, 그 아래 새 행까지 제목이 되어 버린다 (마지막 칸의 Tab 이 바로 그 자리다).
    next = insertCellInRow(next, trIndex, line, headerLine(grid, 'row', r) ? headerCell() : emptyCell());
  }
  return next;
}

// 격자 행 `line` 을 지운다 — 줄에서 시작하는 병합 칸은 아랫줄로 옮겨 한 칸 줄고
// 위에서 내려온 병합 칸은 한 칸 준다. 행이 하나뿐이면 null (표 전체 삭제는 부르는 쪽 몫).
function deleteRowAt(table: ElementNode, line: number): ElementNode | null {
  const grid = cellGrid(table);
  if (grid.rows <= 1) return null;

  const movers = grid.cells
.filter((item) => item.row === line && item.rowSpan > 1)
.sort((a, b) => a.column - b.column);
  const t1 = mapCells(table, (item) => {
    if (item.row === line) return null; // 지워지는 줄에서 시작 — movers 는 아래서 되심는다
    if (item.row < line && item.row + item.rowSpan - 1 >= line) {
      return withSpans(item.cell, item.colSpan, item.rowSpan - 1);
    }
    return item.cell;
  });

  const trIndex = trIndexOfRow(t1, line);
  if (trIndex === null) return null;
  let t2 = rebuilt(t1, [...t1.ch.slice(0, trIndex),...t1.ch.slice(trIndex + 1)]);

  for (const item of movers) {
    const target = trIndexOfRow(t2, line);
    if (target === null) continue;
    t2 = insertCellInRow(t2, target, item.column, withSpans(item.cell, item.colSpan, item.rowSpan - 1));
  }
  return t2;
}

// 격자 열 `line` 을 지운다 — 걸친 병합 칸은 한 칸 줄고, 열이 하나뿐이면 null.
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

// --- 병합 (토글 하나) -----------------------------------------------------------------

// 선택이 걸친 두 칸 — 같은 표 안일 때만.
function cellsOfSelection(doc: readonly ElementNode[], sel: Selection): { readonly ctx: CellCtx; readonly other: GridCell } | null {
  const [start, end] = ordered(sel);
  const a = cellCtxOf(doc, start);
  const b = cellCtxOf(doc, end);
  if (!a || !b) return null;
  if (a.tablePath.length !== b.tablePath.length || !a.tablePath.every((v, i) => v === b.tablePath[i])) return null;
  // 격자는 호출마다 새로 지어지므로 칸 노드 참조로 같음을 판정한다.
  if (a.cell.cell === b.cell.cell) return null;
  return { ctx: a, other: b.cell };
}

// 병합 상자의 칸들 — 화면 칠(부속)과 병합 커맨드가 같은 판정을 쓴다.
export function selectionBox(doc: readonly ElementNode[], sel: Selection): { readonly tablePath: readonly number[]; readonly box: GridBox; readonly cells: readonly GridCell[] } | null {
  const found = cellsOfSelection(doc, sel);
  if (!found) return null;
  const box = boxBetween(found.ctx.grid, found.ctx.cell, found.other);
  return { tablePath: found.ctx.tablePath, box, cells: cellsInBox(found.ctx.grid, box) };
}

// 상자의 칸들을 왼쪽 위 칸 하나로 — 글은 라인으로 이어 남는다.
function mergeBox(table: ElementNode, grid: TableGrid, box: GridBox): ElementNode {
  const origin = cellCovering(grid, box.top, box.left);
  if (!origin) return table;
  const inside = cellsInBox(grid, box);
  const inline: NabiNode[] = [];
  const sep = { pending: false };
  for (const item of inside) {
    const before = inline.length;
    pressInline(item.cell.ch, inline, sep);
    if (inline.length > before) sep.pending = true;
  }
  const originParagraph = origin.cell.ch[0];
  const paragraph: ElementNode =
    isElement(originParagraph) && originParagraph.w === P ? rebuilt(originParagraph, inline) : { w: P, ch: inline };
  const merged = withSpans(
    rebuilt(origin.cell, [paragraph]),
    box.right - box.left + 1,
    box.bottom - box.top + 1,
);
  const insideCells = new Set(inside.map((item) => item.cell));
  return mapCells(table, (item) => {
    if (item.cell === origin.cell) return merged;
    return insideCells.has(item.cell) ? null : item.cell;
  });
}

// 병합 칸 하나를 도로 편다 — 자기 자리는 1×1 이 되고, 먹혔던 자리마다 빈 칸이 선다.
function splitCell(table: ElementNode, target: GridCell): ElementNode {
  let next = mapCells(table, (item) => (item.cell === target.cell ? withSpans(item.cell, 1, 1) : item.cell));
  for (let r = target.row; r < target.row + target.rowSpan; r += 1) {
    for (let c = target.column; c < target.column + target.colSpan; c += 1) {
      if (r === target.row && c === target.column) continue;
      const trIndex = trIndexOfRow(next, r);
      if (trIndex === null) continue;
      next = insertCellInRow(next, trIndex, c, emptyCell());
    }
  }
  return next;
}

// --- 커맨드 ------------------------------------------------------------------------------------

// 표를 바꾼 뒤의 답 — 캐럿은 (row, column) 에서 가장 가까운 실재 칸의 문단 첫 자리다 (캐럿 실재성).
function settle(
  doc: readonly ElementNode[],
  tablePath: readonly number[],
  table: ElementNode,
  row: number,
  column: number,
): CommandOutcome {
  const next = replaceAt(doc, tablePath, [table]);
  const landed = nodeAt(next, tablePath);
  if (!landed) return { doc: next, selection: caretAt({ path: [tablePath[0] ?? 0], offset: 0 }) };
  const grid = cellGrid(landed);
  const r = Math.max(0, Math.min(row, grid.rows - 1));
  const c = Math.max(0, Math.min(column, grid.columns - 1));
  const cell = cellCovering(grid, r, c) ?? grid.cells[0];
  if (!cell) return { doc: next, selection: caretAt({ path: [tablePath[0] ?? 0], offset: 0 }) };
  return { doc: next, selection: caretAt(caretInCell(tablePath, cell)) };
}

// 래퍼문단(표)을 통째로 걷은 뒤의 답 — 마지막 행·열 삭제가 표 자체 삭제로 이어진다.
function removeWholeTable(doc: readonly ElementNode[], tablePath: readonly number[], env: EditEnv): CommandOutcome | null {
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
  (
    run: (ctx: CellCtx, doc: readonly ElementNode[], sel: Selection, env: EditEnv) => CommandOutcome | null,
): Command =>
  (doc, sel, _args, env) => {
    const ctx = cellCtxOf(doc, sel.focus);
    if (!ctx) return null;
    return run(ctx, doc, sel, env);
  };

const clampDim = (raw: unknown, fallback: number): number => {
  const n = typeof raw === 'number' ? Math.floor(raw) : Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 20);
};

const commands: Readonly<Record<string, Command>> = {
  // 표 하나를 캐럿 자리에 세운다 — 빈 문단이면 교체된다.
  //
  // **새 표의 첫 행은 예외 없이 제목 행이다** (084 ③). 행 수를 안 본다 — 한 행짜리 표도 그
  // 한 행이 제목이다: "몇 행부터 제목" 이라는 단서를 두면 행을 하나 더하는 순간 표의 뜻이
  // 말없이 바뀐다. 사람이 원하는 그림은 거의 언제나 "첫 줄은 이름, 아래는 값" 이고, 아닌
  // 표는 제목 행 토글로 벗기면 된다 — 없는 것을 입히는 것보다 입은 것을 벗기는 쪽이 쉽다.
  //
  // **생성 길에만 선다.** 이미 있는 문서·들여온 HTML 은 여기를 안 지나므로 손이 안 닿는다.
  insertTable(doc, sel, args, env) {
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
    const top = result.caret.path[0] as number;
    return { doc: result.doc, selection: caretAt({ path: [top, 0, 0, 0, 0], offset: 0 }) };
  },

  addRowAbove: withCtx((ctx, doc) =>
    settle(doc, ctx.tablePath, insertRowAt(ctx.table, ctx.cell.row), ctx.cell.row + 1, ctx.cell.column),
),
  addRowBelow: withCtx((ctx, doc) =>
    settle(
      doc,
      ctx.tablePath,
      insertRowAt(ctx.table, ctx.cell.row + ctx.cell.rowSpan),
      ctx.cell.row + ctx.cell.rowSpan,
      ctx.cell.column,
),
),
  addColumnLeft: withCtx((ctx, doc) =>
    settle(doc, ctx.tablePath, insertColumnAt(ctx.table, ctx.cell.column), ctx.cell.row, ctx.cell.column + 1),
),
  addColumnRight: withCtx((ctx, doc) =>
    settle(
      doc,
      ctx.tablePath,
      insertColumnAt(ctx.table, ctx.cell.column + ctx.cell.colSpan),
      ctx.cell.row,
      ctx.cell.column + ctx.cell.colSpan,
),
),
  deleteRow: withCtx((ctx, doc, _sel, env) => {
    const next = deleteRowAt(ctx.table, ctx.cell.row);
    if (next === null) return removeWholeTable(doc, ctx.tablePath, env);
    return settle(doc, ctx.tablePath, next, ctx.cell.row, ctx.cell.column);
  }),
  deleteColumn: withCtx((ctx, doc, _sel, env) => {
    const next = deleteColumnAt(ctx.table, ctx.cell.column);
    if (next === null) return removeWholeTable(doc, ctx.tablePath, env);
    return settle(doc, ctx.tablePath, next, ctx.cell.row, ctx.cell.column);
  }),

  // 병합 토글 **하나** — 이름이 하나이듯 뜻도 하나다: "이 칸들을 하나로".
  //
  // 방향으로 가르지 않는다(오른쪽·아래). 사람이 사각형을 잡아 보이는 것으로 이미 어디까지인지
  // 다 말했는데, 거기에 방향을 또 물으면 같은 것을 두 번 묻는 셈이다.
  //
  // **푸는 단추도 따로 없다.** 병합 칸에 캐럿이 서면 이 단추가 눌린 채로 보이고(`merged` 토큰)
  // 눌린 것을 다시 누르면 풀린다 — 켜고 끄는 것이 한 자리인 여느 토글과 같다. 풀 때 글은 전부
  // 첫 칸에 남고 먹혔던 자리마다 빈 칸이 다시 선다(`splitCell`).
  mergeCells(doc, sel, _args, _env) {
    const boxed = selectionBox(doc, sel);
    if (boxed) {
      const ctx = cellCtxOf(doc, ordered(sel)[0]);
      if (!ctx) return null;
      return settle(doc, boxed.tablePath, mergeBox(ctx.table, ctx.grid, boxed.box), boxed.box.top, boxed.box.left);
    }
    if (!isCollapsed(sel)) return null;
    const ctx = cellCtxOf(doc, sel.focus);
    if (!ctx || (ctx.cell.colSpan === 1 && ctx.cell.rowSpan === 1)) return null;
    return settle(doc, ctx.tablePath, splitCell(ctx.table, ctx.cell), ctx.cell.row, ctx.cell.column);
  },

  // 제목 행·열 — 토글이다: 줄의 칸 전부가 제목이면 벗고, 아니면 입힌다.
  toggleHeaderRow: withCtx((ctx, doc, sel) => toggleHeader(ctx, doc, sel, 'row')),
  toggleHeaderColumn: withCtx((ctx, doc, sel) => toggleHeader(ctx, doc, sel, 'column')),

  // 정렬 켜기/끄기 — 보는 쪽에서 제목 칸을 눌러 열을 정렬할 수 있게 하는 표식 하나다.
  // 이 표식이 없으면 `attachTableSort` 가 붙을 표가 없다(기본은 표식 달린 표만 붙는다).
  toggleSortable(doc, sel) {
    const ctx = cellCtxOf(doc, ordered(sel)[0]);
    if (!ctx) return null;
    const on = ctx.table.a?.[SORTABLE] === 1;
    const a: Record<string, AttrValue> = {...(ctx.table.a ?? {}) };
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

  // 표 삭제 — 래퍼문단째 걷고 그 자리에 빈 문단을 세운다(캐럿이 설 자리는 늘 있어야 한다).
  deleteTable(doc, sel) {
    const [start] = ordered(sel);
    const top = start.path[0];
    if (top === undefined) return null;
    const ctx = cellCtxOf(doc, start);
    if (!ctx) return null;
    const empty: ElementNode = { w: P, ch: [] };
    const caret: Position = { path: [top], offset: 0 };
    return { doc: replaceAt(doc, [top], [empty]), selection: caretAt(caret) };
  },
};

function toggleHeader(ctx: CellCtx, doc: readonly ElementNode[], sel: Selection, axis: 'row' | 'column'): CommandOutcome {
  const line = axis === 'row' ? ctx.cell.row : ctx.cell.column;
  const inLine = (item: GridCell): boolean =>
    axis === 'row'
      ? item.row <= line && line <= item.row + item.rowSpan - 1
      : item.column <= line && line <= item.column + item.colSpan - 1;
  const lineCells = ctx.grid.cells.filter(inLine);
  const all = lineCells.length > 0 && lineCells.every((item) => item.cell.a?.[TH] === 1);
  const next = mapCells(ctx.table, (item) => {
    if (!inLine(item)) return item.cell;
    const a: Record<string, AttrValue> = {...(item.cell.a ?? {}) };
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

// 그 줄이 통째로 제목인가 — 눌림 표시·토글·열 추가가 **한 판정**을 나눠 쓴다.
// 병합 칸은 자기가 덮은 줄 전부에 든 것으로 센다(줄에 걸치면 그 줄의 칸이다).
function headerLine(grid: TableGrid, axis: 'row' | 'column', line: number): boolean {
  const cells = grid.cells.filter((item) =>
    axis === 'row'
      ? item.row <= line && line <= item.row + item.rowSpan - 1
      : item.column <= line && line <= item.column + item.colSpan - 1,
);
  return cells.length > 0 && cells.every((item) => item.cell.a?.[TH] === 1);
}

export function headerLineOf(ctx: { readonly grid: TableGrid; readonly cell: GridCell }, axis: 'row' | 'column'): boolean {
  return headerLine(ctx.grid, axis, axis === 'row' ? ctx.cell.row : ctx.cell.column);
}

// --- 키 — tab/shiftTab 칸 이동 + 화살표 격자 걸음. Shift+방향키는 여기 안 온다. ---------

// 화살표는 **화면이 아니라 격자를 따라 움직인다.**
//
// 왜 브라우저에 못 맡기나: 브라우저의 화살표는 화면 좌표를 따라간다. 칸마다 폭이 다르고 병합
// 칸이 섞이면 위·아래 걸음이 같은 열에 안 떨어지고 옆 칸으로 샌다. 좌·우도 마찬가지로 칸 경계를
// 못 넘거나 표 밖으로 튕겨 나갔다. 격자는 우리가 이미 아는 것이므로(cellGrid), 걸음도 그 위에서
// 센다 — old 도 같은 까닭으로 같은 선택을 했다.
//
// 칸 **안**에서 갈 곳이 남아 있으면 우리 일이 아니다(null → 코어·브라우저의 글자 걸음). 칸의
// 끝에 닿았을 때만 옆 칸으로 넘긴다. 격자 밖으로 나가는 걸음도 우리 일이 아니다 — 표를 벗어나는
// 착지는 코어의 홀더 걸음이 안다.
function arrowStep(intent: KeyIntent, doc: readonly ElementNode[], sel: Selection, env: EditEnv): CommandOutcome | null {
  const ctx = cellCtxOf(doc, sel.focus);
  if (!ctx) return null;
  const dir = intent.dir;

  const lengthAt = (pos: Position): number => {
    const holder = nodeAt(doc, pos.path);
    return holder ? holderLength(holder, env) : 0;
  };

  if (dir === 'left' || dir === 'right') {
    const back = dir === 'left';
    // 칸 안에 아직 갈 자리가 있다 — 글자 걸음이지 칸 걸음이 아니다.
    if (back ? sel.focus.offset > 0 : sel.focus.offset < lengthAt(sel.focus)) return null;
    const next = stepCell(ctx.grid, ctx.cell, back ? -1 : 1);
    if (!next) return null; // 표의 첫(끝) 칸 — 표 밖으로 나가는 것은 코어의 걸음이다
    const head = caretInCell(ctx.tablePath, next);
    // 왼쪽으로 넘어가면 그 칸의 **끝**에 선다 — 넘어간 자리가 곧 다음에 지울 자리다.
    return { doc, selection: caretAt(back ? {...head, offset: lengthAt(head) } : head) };
  }

  // 위·아래 — 같은 열의 이웃 줄. 병합 칸은 자기가 덮은 줄 전체가 자기 자리라, 아래로는 덮은
  // 만큼 건너뛰어야 제 아래 줄에 닿는다.
  const row = dir === 'up' ? ctx.cell.row - 1 : ctx.cell.row + ctx.cell.rowSpan;
  if (row < 0 || row >= ctx.grid.rows) return null; // 표의 첫(끝) 줄 — 표 밖은 코어의 걸음
  const next = cellCovering(ctx.grid, row, ctx.cell.column);
  if (!next) return null;
  return { doc, selection: caretAt(caretInCell(ctx.tablePath, next)) };
}

const onKey: OnKey = (intent, doc, sel, env, owner) => {
  if (!isCollapsed(sel)) return null;
  if (owner.node.w !== 'td') return null;
  if (intent.key === 'arrow') return arrowStep(intent, doc, sel, env);
  if (intent.key !== 'tab' && intent.key !== 'shiftTab') return null; // 엔터=라인·삭제는 코어의 것

  const ctx = cellCtxOf(doc, sel.focus);
  if (!ctx) return null;

  if (intent.key === 'shiftTab') {
    const prev = stepCell(ctx.grid, ctx.cell, -1);
    if (!prev) return null; // 첫 칸 — pass (코어가 조용히 삼킨다)
    return { doc: doc, selection: caretAt(caretInCell(ctx.tablePath, prev)) };
  }

  const next = stepCell(ctx.grid, ctx.cell, 1);
  if (next) {
    return { doc: doc, selection: caretAt(caretInCell(ctx.tablePath, next)) };
  }
  // 마지막 칸의 Tab — 아래에 새 행을 만들고 그 첫 칸으로 (옛 판은 제자리 멈춤이었지만
  // 새 판에서 무변화 답은 코어의 "스페이스 넷"으로 떨어지므로 행 추가가 맞는 답이다).
  const grown = insertRowAt(ctx.table, ctx.grid.rows);
  return settle(doc, ctx.tablePath, grown, ctx.grid.rows, 0);
};

// --- 조립·들여오기 -----------------------------------------------------------------------------

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

// 제목 칸은 th 로 나간다 — 표식(attr)이 곧 태그다.
const tdHtml: HtmlBuilder = (node, children, ctx) =>
  ctx.element(node.a?.[TH] === 1 ? 'th' : 'td', ctx.filled(children()), {
    colspan: spanAttr(node.a?.[SPAN_COL]),
    rowspan: spanAttr(node.a?.[SPAN_ROW]),
  });

// 들여오기 — 기본 대응은 th 를 td 로만 누이므로, 제목 표식은 여기서 주장한다.
function claim(el: ParseElement, inner: (block: boolean) => NabiNode[]): NabiNode[] | null {
  // 정렬 표식을 단 표 — 표식만 되읽고 속은 기본 대응이 읽게 둔다.
  if (el.tag === 'table' && el.attrs['data-nabi-sortable'] !== undefined) {
    return [{ w: 'table', a: { [SORTABLE]: 1 }, ch: inner(true) }];
  }
  if (el.tag !== 'th') return null;
  const a: Record<string, AttrValue> = { [TH]: 1 };
  const colspan = spanAttr(el.attrs['colspan']);
  const rowspan = spanAttr(el.attrs['rowspan']);
  if (colspan) a[SPAN_COL] = colspan;
  if (rowspan) a[SPAN_ROW] = rowspan;
  return [{ w: 'td', a, ch: inner(true) }];
}

// --- wing --------------------------------------------------------------------------------------


// --- 버튼·상황 줄 선언 (12) ----------------------------------------------------------------------
// 아이콘 속은 old 번역이다. 눌림은 `currentValue` 가 답하는 상태 토큰('merged'·'th')으로 읽는다.

const TABLE_ICONS = {
  // 위아래 화살표 — 열 정렬의 표식. viewer 의 단추와 같은 뜻이다.
  sortable: '<path d="M5 6.5 8 3.5l3 3M5 9.5l3 3 3-3"/>',
  grid: '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5"/><path d="M1.75 6.5h12.5M6 6.5v6.75"/>',
  rowAbove: '<rect x="1.75" y="8" width="12.5" height="5.5" rx="1.2"/><path d="M8 2v4M6 4h4"/>',
  rowBelow: '<rect x="1.75" y="2.5" width="12.5" height="5.5" rx="1.2"/><path d="M8 10v4M6 12h4"/>',
  rowDelete: '<rect x="1.75" y="5.25" width="12.5" height="5.5" rx="1.2"/><path d="M5.5 8h5"/>',
  colLeft: '<rect x="8" y="1.75" width="5.5" height="12.5" rx="1.2"/><path d="M4 8h-2M3 6v4"/>',
  colRight: '<rect x="2.5" y="1.75" width="5.5" height="12.5" rx="1.2"/><path d="M12 8h2M13 6v4"/>',
  colDelete: '<rect x="5.25" y="1.75" width="5.5" height="12.5" rx="1.2"/><path d="M8 5.5v5"/>',
  headerRow:
    '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5"/><path d="M1.75 6.5h12.5"/>' +
    '<path d="M1.75 3.5h12.5" stroke-width="2.5"/>',
  headerColumn:
    '<rect x="2.75" y="1.75" width="10.5" height="12.5" rx="1.5"/><path d="M6.5 1.75v12.5"/>' +
    '<path d="M3.5 1.75v12.5" stroke-width="2.5"/>',
  merge:
    '<rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5"/>' +
    '<path d="M6.5 8H3.75M6.5 8 5.25 6.75M6.5 8 5.25 9.25M9.5 8h2.75M9.5 8l1.25-1.25M9.5 8l1.25 1.25"/>',
} as const;

// 이름들 — old 사전 이식(14 로케일).
const TABLE_NAME: LocaleText = { ko: '표', en: 'Table', ja: '表', zh: '表格', de: 'Tabelle', fr: 'Tableau', es: 'Tabla', pt: 'Tabela', ru: 'Таблица', ar: 'جدول', hi: 'तालिका', bn: 'টেবিল', ur: 'جدول', id: 'Tabel' };
const TABLE_TEXT: Readonly<Record<string, LocaleText>> = {
  rowAbove: { ko: '위에 행 추가', en: 'Insert row above', ja: '上に行を挿入', zh: '在上方插入行', de: 'Zeile darüber einfügen', fr: 'Insérer une ligne au-dessus', es: 'Insertar fila arriba', pt: 'Inserir linha acima', ru: 'Вставить строку выше', ar: 'إدراج صف أعلى', hi: 'ऊपर पंक्ति जोड़ें', bn: 'উপরে সারি যোগ করুন', ur: 'اوپر قطار شامل کریں', id: 'Sisipkan baris di atas' },
  rowBelow: { ko: '아래에 행 추가', en: 'Insert row below', ja: '下に行を挿入', zh: '在下方插入行', de: 'Zeile darunter einfügen', fr: 'Insérer une ligne en dessous', es: 'Insertar fila debajo', pt: 'Inserir linha abaixo', ru: 'Вставить строку ниже', ar: 'إدراج صف أسفل', hi: 'नीचे पंक्ति जोड़ें', bn: 'নিচে সারি যোগ করুন', ur: 'نیچے قطار شامل کریں', id: 'Sisipkan baris di bawah' },
  sortable: { ko: '정렬 켜기/끄기', en: 'Toggle sorting', ja: '並べ替えの切り替え', zh: '切换排序', de: 'Sortierung umschalten', fr: 'Activer le tri', es: 'Alternar ordenación', pt: 'Alternar ordenação', ru: 'Переключить сортировку', ar: 'تبديل الفرز', hi: 'क्रमबद्धता टॉगल करें', bn: 'সাজানো চালু/বন্ধ', ur: 'ترتیب آن/آف', id: 'Aktifkan pengurutan' },
  rowDelete: { ko: '행 삭제', en: 'Delete row', ja: '行を削除', zh: '删除行', de: 'Zeile löschen', fr: 'Supprimer la ligne', es: 'Eliminar fila', pt: 'Excluir linha', ru: 'Удалить строку', ar: 'حذف الصف', hi: 'पंक्ति हटाएँ', bn: 'সারি মুছুন', ur: 'قطار حذف کریں', id: 'Hapus baris' },
  colLeft: { ko: '왼쪽에 열 추가', en: 'Insert column left', ja: '左に列を挿入', zh: '在左侧插入列', de: 'Spalte links einfügen', fr: 'Insérer une colonne à gauche', es: 'Insertar columna a la izquierda', pt: 'Inserir coluna à esquerda', ru: 'Вставить столбец слева', ar: 'إدراج عمود على اليسار', hi: 'बाएँ स्तंभ जोड़ें', bn: 'বাঁয়ে কলাম যোগ করুন', ur: 'بائیں کالم شامل کریں', id: 'Sisipkan kolom di kiri' },
  colRight: { ko: '오른쪽에 열 추가', en: 'Insert column right', ja: '右に列を挿入', zh: '在右侧插入列', de: 'Spalte rechts einfügen', fr: 'Insérer une colonne à droite', es: 'Insertar columna a la derecha', pt: 'Inserir coluna à direita', ru: 'Вставить столбец справа', ar: 'إدراج عمود على اليمين', hi: 'दाएँ स्तंभ जोड़ें', bn: 'ডানে কলাম যোগ করুন', ur: 'دائیں کالم شامل کریں', id: 'Sisipkan kolom di kanan' },
  colDelete: { ko: '열 삭제', en: 'Delete column', ja: '列を削除', zh: '删除列', de: 'Spalte löschen', fr: 'Supprimer la colonne', es: 'Eliminar columna', pt: 'Excluir coluna', ru: 'Удалить столбец', ar: 'حذف العمود', hi: 'स्तंभ हटाएँ', bn: 'কলাম মুছুন', ur: 'کالم حذف کریں', id: 'Hapus kolom' },
  merge: { ko: '칸 병합', en: 'Merge cells', ja: 'セルを結合', zh: '合并单元格', de: 'Zellen verbinden', fr: 'Fusionner les cellules', es: 'Combinar celdas', pt: 'Mesclar células', ru: 'Объединить ячейки', ar: 'دمج الخلايا', hi: 'सेल मर्ज करें', bn: 'ঘর মার্জ করুন', ur: 'خانے ضم کریں', id: 'Gabungkan sel' },
  headerRow: { ko: '이 행을 제목으로', en: 'Header this row', ja: 'この行を見出しに', zh: '将此行设为标题行', de: 'Diese Zeile als Kopfzeile', fr: 'Cette ligne en en-tête', es: 'Esta fila como encabezado', pt: 'Esta linha como cabeçalho', ru: 'Сделать строку заголовком', ar: 'جعل هذا الصف رأسًا', hi: 'इस पंक्ति को शीर्षक बनाएँ', bn: 'এই সারিকে শিরোনাম করুন', ur: 'اس قطار کو سرخی بنائیں', id: 'Jadikan baris ini header' },
  headerColumn: { ko: '이 열을 제목으로', en: 'Header this column', ja: 'この列を見出しに', zh: '将此列设为标题列', de: 'Diese Spalte als Kopfspalte', fr: 'Cette colonne en en-tête', es: 'Esta columna como encabezado', pt: 'Esta coluna como cabeçalho', ru: 'Сделать столбец заголовком', ar: 'جعل هذا العمود رأسًا', hi: 'इस स्तंभ को शीर्षक बनाएँ', bn: 'এই কলামকে শিরোনাম করুন', ur: 'اس کالم کو سرخی بنائیں', id: 'Jadikan kolom ini header' },
};

const TABLE_CSS = `
/* **표는 자리를 꽉 채우지 않는다 — 쓴 만큼만 넓다.** 그래서 폭을 안 적는다: 표의 기본 자동
   배치가 속의 글에 맞춰 줄어들고, 좁아지면 칸 안에서 줄이 바뀐다. 여기에 \`100%\` 를 적으면
   칸 둘짜리 표가 화면을 가로질러 늘어나 빈 칸만 넓어진다.
   더 줄일 수 없을 만큼 넓어지면 겉옷(\`.nabi-scroll\`)이 가로로 구른다 — 페이지가 옆으로
   밀리는 것이 아니라 표 **안**에서 구르는 것이 규칙이다. */
.nabi-content table { border-collapse: collapse; }
/* 칸의 최소 폭 — **빈 표가 눌리는 표가 되게 하는 값이다.**
   이것이 없으면 갓 만든 3×3 이 62px 로 접힌다: 칸은 안쪽 여백 만큼(20px)이고 그 속 문단은
   폭이 0 이라, 캐럿이 설 자리가 없어 눌러도 아무 일이 안 난다("셀을 클릭하면 커서가 안 생김").
   글이 차면 칸은 이 값 위로 자라고, 더 못 줄일 만큼 넓어지면 겉옷이 가로로 구른다. */
.nabi-content th,.nabi-content td {
  border: 1px solid var(--nabi-line); padding:.35em.6em; vertical-align: top; text-align: start;
  min-inline-size: 4rem;
}
.nabi-content th { background: var(--nabi-soft); font-weight: 650; }

/* 드래그로 세운 칸 상자 — **화면 전용 표식이다**(트리에도 저장 HTML 에도 안 실린다).
   이 규칙이 없으면 상자는 서는데 보이지가 않는다: 표식만 붙고 아무도 안 그려서, 드래그로 칸을
   고르는 기능이 통째로 없어진 것처럼 보였다. */
.nabi-content :is(td, th)[data-nabi-cell-selected] {
  background: color-mix(in srgb, var(--nabi-accent) 14%, transparent);
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
/* 인라인 svg 에 width/height 속성이 없다 — 이 규칙이 없으면 기본값 300×150 으로 떨어진다. */
.nabi-content table .nabi-sort svg { inline-size: 100%; block-size: 100%; }
.nabi-content table .nabi-sort:hover { background: var(--nabi-soft); }
/* 정렬된 열만 강조색이다 — 농도는 아이콘이 말하고 색은 "이 열" 을 말한다. */
.nabi-content table .nabi-sort[data-nabi-sort-active] { color: var(--nabi-accent); }

/* --- 편집 화면의 정렬 표식 (084 ⑦) ---
   정렬 **동작**은 보는 쪽 런타임의 것이라 편집기에는 일부러 안 붙는다 — 글을 고치는 중에 행이
   저 혼자 자리를 바꾸면 캐럿이 어디 있었는지 알 수 없게 된다. 그래서 편집 화면에는 **표식**이
   선다: 글쓴이는 "이 표는 발행되면 정렬된다"를 화면에서 알아야 하고, 상황 줄의 눌린 단추 하나는
   캐럿이 그 표에 들어 있는 동안에만 보인다.
   그림은 보는 쪽의 '원본' 아이콘 그대로다(삼각형 둘, 흐리게) — 같은 뜻이니 같은 그림이어야
   한다. 자리도 같다: 칸의 오른쪽 가운데.
   **첫 행에만** 선다 — 붙는 쪽(attachTableSort)이 단추를 다는 자리가 첫 행의 칸들이다.
   병합이 보이는 표는 붙는 쪽이 거절하므로 표식도 서지 않는다 — 화면이 거짓말을 하면 안 된다.
   (편집 HTML 은 span 이 2 이상일 때만 colspan/rowspan 을 적는다 — 그래서 존재만 봐도 병합이다.)
   의사요소로 그린다: 문서에 없는 그림이라 트리에도 저장 HTML 에도 안 실리고, 누를 수도 없다. */
.nabi-content.nabi-editing table[data-nabi-sortable]:not(:has([colspan], [rowspan])) tr:first-child > :is(th, td) {
  position: relative; padding-inline-end: 1.75em;
}
.nabi-content.nabi-editing table[data-nabi-sortable]:not(:has([colspan], [rowspan])) tr:first-child > :is(th, td)::after {
  --nabi-sort-mark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 2.9 12 7.4H4Z'/%3E%3Cpath d='M8 13.1 4 8.6h8Z'/%3E%3C/svg%3E");
  content: ""; position: absolute; inset-inline-end:.25em; inset-block-start: 50%;
  transform: translateY(-50%); pointer-events: none;
  inline-size: 1.25em; block-size: 1.25em; opacity:.38;
  /* 색은 글자색을 따른다 — 마스크로 뚫어야 다크 모드에서도 삼각형이 글과 같은 색으로 산다
     (그림 파일에 색을 박으면 한쪽 모드에서 안 보인다). */
  background: currentColor;
  -webkit-mask: var(--nabi-sort-mark) center / contain no-repeat;
  mask: var(--nabi-sort-mark) center / contain no-repeat;
}

/* --- 표 만들기 격자 — 작은 화면에서는 5×5, 칸은 손가락 크기로 (084 ②) ---
   격자를 그리는 손은 툴바지만 **몇 칸이 서는지는 이 wing 의 선언**(button.action 의 max)이
   말한다. 그러니 화면이 좁을 때의 모양도 표의 것이라 여기 산다 — 코어 시트에는 데스크톱
   격자만 남고, 무게가 같으면 뒤에 붙는 wing 시트가 이긴다.
   판정을 JS 가 아니라 CSS 로 하는 까닭: 창을 돌리거나 줄이는 것을 따라간다. 판이 열려 있는
   동안 폭이 바뀌어도 다시 열 필요가 없다.
   폭 기준 40rem 은 "세로로 든 전화기와 좁힌 창" 까지다 — 태블릿·데스크톱은 8×8 그대로.
   **이 40rem 은 코어 시트(ui/css.ts)의 판 규칙과 같은 값이어야 한다** — 거기서 판이 버튼을
   놓고 화면 한가운데 90% 로 서는 그 지점이다. 둘이 어긋나면 격자는 5×5 인데 판은 아직 버튼에
   붙어 있는(또는 그 반대의) 어중간한 화면이 생긴다. */
@media (max-width: 40rem) {
  .nabi-grid {
    /* 칸 크기 토큰을 격자 자신에게 다시 매긴다 — 칸(.nabi-cell)이 상속으로 받으므로 코어 시트의
       규칙을 안 건드리고도 커진다. 2.75rem 은 손가락 표적 관례(44px)다. */
    --nabi-grid-cell: 2.75rem;
    gap: .25rem;
    /* !important 인 까닭 하나: 열 수를 툴바가 **인라인 style** 로 박는다. 인라인을 이기는 길은
       이것뿐이고, 여기서 안 이기면 남은 칸 스물다섯이 여덟 열로 흘러 5×5 가 깨진다. */
    grid-template-columns: repeat(5, var(--nabi-grid-cell)) !important;
  }
  /* 여섯째 열부터·여섯째 줄부터는 걷는다 — 여기 적힌 8 은 button.action 의 max 다(둘이 함께
     움직인다). display:none 이라 격자 배치에서도 빠져, 남는 것이 정확히 앞 5×5 다.
     더 큰 표가 필요하면 만든 뒤 행·열 추가로 늘린다 — 손가락으로 8×8 을 겨누는 것보다 쉽다. */
  .nabi-grid > .nabi-cell:nth-child(8n + 6),
  .nabi-grid > .nabi-cell:nth-child(8n + 7),
  .nabi-grid > .nabi-cell:nth-child(8n + 8),
  .nabi-grid > .nabi-cell:nth-child(n + 41) { display: none; }
}
`;

export const tableWing: Wing = {
  w: 'table',
  place: 'container',
  holds: 'blocks',
  allows: ['tr'],
  parts: {
    tr: { holds: 'blocks' },
    td: { holds: 'blocks', singleParagraph: true, boolAttrs: [TH] },
  },
  toHtml: tableHtml,
  partHtml: { tr: trHtml, td: tdHtml },
  claim,
  repair: repairTable,
  partRepair: { td: repairCell },
  onKey,
  commands,
  // 눌림 표시 — 이 wing 은 노드를 **여러 급** 소유하고(표·행·칸), 상태도 급마다 나뉘어 산다.
  //   칸: 'merged'(병합)·'th'(제목)  /  표: 'sort'(발행되면 열 정렬이 돈다)
  // 상황 줄과 눌림 판정은 급 하나가 아니라 **줄기 전부**의 토큰을 합쳐 읽으므로(ui/press 의
  // `stackValue`), 표가 여기서 제 몫을 답하면 칸의 토큰과 나란히 실린다 — 정렬 토글이 칸 안에
  // 서 있으면서도 표의 상태를 보여 주는 까닭이다.
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
    svg: TABLE_ICONS.grid,
    label: TABLE_NAME,
    // 격자 하나로 행·열을 함께 고른다 — 두 번 묻지 않는다.
    // 8 은 데스크톱의 수다. 작은 화면에서는 시트가 앞 5×5 만 남기고 칸을 키운다 — 이 수를
    // 고치면 시트의 nth-child(8n + …) 도 같이 고쳐야 한다 (둘이 한 몸이다).
    action: { kind: 'grid', command: 'insertTable', rowsKey: 'rows', colsKey: 'cols', max: 8 },
  },
  // 상황 줄 — 칸 하나에 걸린 손잡이 전부. 병합·제목은 **상태 토큰**으로 눌림을 읽는다 (10 판단).
  context: {
    title: TABLE_NAME,
    controls: [
      { kind: 'button', name: 'rowAbove', command: 'addRowAbove', svg: TABLE_ICONS.rowAbove, label: TABLE_TEXT.rowAbove },
      { kind: 'button', name: 'rowBelow', command: 'addRowBelow', svg: TABLE_ICONS.rowBelow, label: TABLE_TEXT.rowBelow },
      { kind: 'button', name: 'rowDelete', command: 'deleteRow', svg: TABLE_ICONS.rowDelete, label: TABLE_TEXT.rowDelete },
      { kind: 'button', name: 'colLeft', command: 'addColumnLeft', svg: TABLE_ICONS.colLeft, label: TABLE_TEXT.colLeft },
      { kind: 'button', name: 'colRight', command: 'addColumnRight', svg: TABLE_ICONS.colRight, label: TABLE_TEXT.colRight },
      { kind: 'button', name: 'colDelete', command: 'deleteColumn', svg: TABLE_ICONS.colDelete, label: TABLE_TEXT.colDelete },
      { kind: 'toggle', name: 'merge', command: 'mergeCells', token: 'merged', svg: TABLE_ICONS.merge, label: TABLE_TEXT.merge },
      { kind: 'toggle', name: 'headerRow', command: 'toggleHeaderRow', token: 'th', svg: TABLE_ICONS.headerRow, label: TABLE_TEXT.headerRow },
      { kind: 'toggle', name: 'headerColumn', command: 'toggleHeaderColumn', token: 'th', svg: TABLE_ICONS.headerColumn, label: TABLE_TEXT.headerColumn },
      // 정렬도 **토글**이다 — 표에 상태가 둘(켜짐·꺼짐)뿐이라 켜 놓은 것이 화면에 보여야 한다.
      // 이 토큰('sort')은 칸이 아니라 **표**가 답한다. 상황 줄이 조상 줄기의 토큰을 합쳐 읽으므로
      // (ui/press 의 `stackValue`) 칸 안에 선 단추가 표의 상태로 눌린다.
      { kind: 'toggle', name: 'sortable', command: 'toggleSortable', token: SORTABLE, svg: TABLE_ICONS.sortable, label: TABLE_TEXT.sortable },
      // **표 삭제 단추는 여기 없다** (084 ④). 줄 맨 끝에 두어도 손이 미끄러져 닿는 자리였고,
      // 표를 통째로 지우는 길은 이미 블록 선택 + 삭제로 나 있다 — 같은 일을 하는 문이 둘일
      // 필요가 없다. 커맨드(`deleteTable`) 는 남는다: 호스트가 제 화면에서 부를 길이다.
    ],
  },
  styles: TABLE_CSS,
};
