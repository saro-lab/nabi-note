// 표 묶음 — defaultWings 병합은 코디네이터(wings/index.ts)가 한다.
// The table bundle — merging into defaultWings is the coordinator's job (wings/index.ts), not this file's.
import type { Wing } from '../../wing/index.js';
import { attachCellRange } from './attach.js';
import { tableWing as bare } from './table.js';

// 칸 드래그 칠은 선언형 부속으로 함께 선다 — 계약 밖 리스너는 금지다.
// Drag-to-select cell painting attaches as a declarative attach — no listeners outside the contract.
export const tableWing: Wing = { ...bare, attach: attachCellRange };

export const tableWings: readonly Wing[] = [tableWing];

export { CELL_SELECTED } from './attach.js';
export { TH, headerLineOf, repairCell, repairTable, selectionBox } from './table.js';
export {
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
} from './grid.js';
export type { GridBox, GridCell, TableGrid } from './grid.js';
