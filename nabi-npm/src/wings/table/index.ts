// 표 묶음 — defaultWings 병합은 코디네이터가 한다 (10 은 wings/index.ts 를 안 만진다).
import type { Wing } from '../../wing/index.js';
import { attachCellRange } from './attach.js';
import { tableWing as bare } from './table.js';

// 칸 드래그 칠은 선언형 부속으로 함께 선다 (계약 밖 리스너 금지).
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
