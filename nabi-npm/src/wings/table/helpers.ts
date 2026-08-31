export const TH = 'th';

// 보는 쪽(viewer)의 열 정렬을 켜는 표식 — 어느 열을 어느 방향으로는 저장 안 하고, "정렬해도 된다"만 남긴다.
// Flags a table as sortable for the viewer — never stores which column or direction, only that sorting is allowed at all.
export const SORTABLE = 'sort';

import { P, type ElementNode } from '../../schema/index.js';
import { $MAX_SPAN, withSpans } from './grid.js';
export const emptyParagraph = (): ElementNode => ({ w: P, ch: [] });
export const emptyCell = (): ElementNode => ({ w: 'td', ch: [emptyParagraph()] });
export const emptyCells = (width: number, expand = false): ElementNode[] => {
  if (width <= 0) return [];
  if (expand) return Array.from({ length: width }, emptyCell);
  const cells: ElementNode[] = [];
  let rest = width;
  while (rest > 0) {
    const span = Math.min(rest, $MAX_SPAN);
    cells.push(withSpans(emptyCell(), span, 1));
    rest -= span;
  }
  return cells;
};
// 제목 칸 — 표식만 다른 같은 칸(이름은 언제나 td고, 제목은 attr 하나가 말한다).
// A header cell is the same node with one extra flag — always `td`, "header" is just an attr.
export const headerCell = (): ElementNode => ({ w: 'td', a: { th: 1 }, ch: [emptyParagraph()] });
