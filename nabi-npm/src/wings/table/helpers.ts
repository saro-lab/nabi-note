export const TH = 'th';

// 보는 쪽(nabi-note/viewer)의 열 정렬을 켜는 표식 — 값이 1 뿐인 불리언이다.
// **어느 열을 어느 방향으로 정렬했는지는 저장하지 않는다** — 그것은 읽는 사람의 일이고 문서의
// 것이 아니다. 문서에 남는 것은 "이 표는 정렬해도 된다" 한 마디뿐이다.
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
// 제목 칸 — 표식만 다른 같은 칸이다(칸의 이름은 언제나 td 고, 제목은 attr 하나가 말한다).
export const headerCell = (): ElementNode => ({ w: 'td', a: { th: 1 }, ch: [emptyParagraph()] });
