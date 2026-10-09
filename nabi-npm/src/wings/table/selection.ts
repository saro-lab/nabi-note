import type { ElementNode } from '../../schema/index.js';
import { nodeAt, type Position } from '../../doc/index.js';
import { ordered, type Selection } from '../../caret/index.js';
import { boxBetween, cellGrid, cellsInBox, type GridBox, type GridCell, type TableGrid } from './grid.js';

export interface CellCtx {
  readonly tablePath: readonly number[];
  readonly table: ElementNode;
  readonly grid: TableGrid;
  readonly cell: GridCell;
}

export function cellCtxOf(doc: readonly ElementNode[], pos: Position): CellCtx | null {
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

// 선택이 걸친 두 칸 — 같은 표 안일 때만.
// The two cells a selection spans — only when both sit in the same table.
function cellsOfSelection(
  doc: readonly ElementNode[],
  sel: Selection,
): { readonly ctx: CellCtx; readonly other: GridCell } | null {
  const [start, end] = ordered(sel);
  const a = cellCtxOf(doc, start);
  const b = cellCtxOf(doc, end);
  if (!a || !b) return null;
  if (a.tablePath.length !== b.tablePath.length || !a.tablePath.every((v, i) => v === b.tablePath[i])) return null;
  // 격자는 호출마다 새로 지어지므로 칸 노드 참조로 같음을 판정한다.
  // The grid is rebuilt on every call, so equality is checked by cell node reference, not grid identity.
  if (a.cell.cell === b.cell.cell) return null;
  return { ctx: a, other: b.cell };
}

// 병합 상자의 칸들 — 화면 칠(부속)과 병합 커맨드가 같은 판정을 쓴다.
// The cells of a merge box — the on-screen paint (attach) and the merge command share this exact same test.
export function selectionBox(
  doc: readonly ElementNode[],
  sel: Selection,
): { readonly tablePath: readonly number[]; readonly box: GridBox; readonly cells: readonly GridCell[] } | null {
  const found = cellsOfSelection(doc, sel);
  if (!found) return null;
  const box = boxBetween(found.ctx.grid, found.ctx.cell, found.other);
  return { tablePath: found.ctx.tablePath, box, cells: cellsInBox(found.ctx.grid, box) };
}
