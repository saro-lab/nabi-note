// 병합 칸이 있는 표의 단일 출처 — 모든 좌표는 배치 계산에서 나온다 (old tree/grid 의 번역).
// `tr.ch` 를 열 번호로 세면 윗 행의 rowspan 이 자리를 먹는 순간 어긋난다.
import { isElement, type AttrValue, type ElementNode } from '../../schema/index.js';

export const SPAN_COL = 'colspan';
export const SPAN_ROW = 'rowspan';

// HTML 규격의 상한 — 격자 폭 폭주(패딩 폭탄)를 막는다. 브라우저도 이 값으로 조인다.
const MAX_SPAN = 1000;

// 왼쪽 위 모서리의 격자 좌표(row·column)와 문서상의 자리(trIndex·tdIndex) — 옛 판의
// 중복 필드(rowIndex/row 동값)는 안 가져오고, 경로를 지을 자리 둘만 남긴다.
export interface GridCell {
  readonly cell: ElementNode;
  // table.ch 에서 이 칸의 행(tr)이 서 있는 인덱스.
  readonly trIndex: number;
  // tr.ch 에서 이 칸(td)이 서 있는 인덱스.
  readonly tdIndex: number;
  readonly row: number;
  readonly column: number;
  readonly rowSpan: number;
  readonly colSpan: number;
}

export interface TableGrid {
  readonly rows: number;
  readonly columns: number;
  // 문서 순서(행 우선·왼쪽부터) — Tab 이동이 이 순서를 탄다.
  readonly cells: readonly GridCell[];
}

// 네 변 모두 포함 — right·bottom 도 안쪽이다.
export interface GridBox {
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

// 못 믿을 값(글자·0·음수)은 1, 폭주는 상한으로 조인다. 값은 문자열이 기본이지만 숫자도 받는다.
export function spanOf(value: AttrValue | undefined): number {
  const raw = typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.floor(raw), MAX_SPAN);
}

interface RowAt {
  readonly row: ElementNode;
  readonly trIndex: number;
}

function rowsOf(table: ElementNode): RowAt[] {
  const out: RowAt[] = [];
  table.ch.forEach((child, trIndex) => {
    if (isElement(child) && child.w === 'tr') out.push({ row: child, trIndex });
  });
  return out;
}

// 표준 배치 규칙 그대로 — 칸마다 그 행의 첫 빈 자리를 찾아 놓는다. 마지막 행을 넘는
// rowspan 은 읽는 시점에 조인다 — 격자는 언제나 실제 행 수 안에 있다.
export function cellGrid(table: ElementNode): TableGrid {
  const rows = rowsOf(table);
  const occupied = new Set<string>();
  const cells: GridCell[] = [];
  let columns = 0;

  rows.forEach(({ row, trIndex }, r) => {
    let column = 0;
    row.ch.forEach((child, tdIndex) => {
      if (!isElement(child) || child.w !== 'td') return;
      while (occupied.has(`${r}:${column}`)) column += 1;

      const colSpan = spanOf(child.a?.[SPAN_COL]);
      const rowSpan = Math.min(spanOf(child.a?.[SPAN_ROW]), rows.length - r);
      for (let dr = 0; dr < rowSpan; dr += 1) {
        for (let dc = 0; dc < colSpan; dc += 1) occupied.add(`${r + dr}:${column + dc}`);
      }

      cells.push({ cell: child, trIndex, tdIndex, row: r, column, rowSpan, colSpan });
      column += colSpan;
      columns = Math.max(columns, column);
    });
  });

  return { rows: rows.length, columns, cells };
}

// 병합에 먹힌 자리도 그 주인을 돌려준다.
export function cellCovering(grid: TableGrid, row: number, column: number): GridCell | null {
  return (
    grid.cells.find(
      (item) =>
        row >= item.row &&
        row < item.row + item.rowSpan &&
        column >= item.column &&
        column < item.column + item.colSpan,
    ) ?? null
  );
}

// 두 칸의 경계 상자에서 시작해, 걸치는 병합 칸이 다 들어올 때까지 넓힌다 — ㄱ자 상자가 안 나온다.
export function boxBetween(grid: TableGrid, first: GridCell, second: GridCell): GridBox {
  let top = Math.min(first.row, second.row);
  let left = Math.min(first.column, second.column);
  let bottom = Math.max(first.row + first.rowSpan - 1, second.row + second.rowSpan - 1);
  let right = Math.max(first.column + first.colSpan - 1, second.column + second.colSpan - 1);

  let changed = true;
  while (changed) {
    changed = false;
    for (const item of grid.cells) {
      const itemBottom = item.row + item.rowSpan - 1;
      const itemRight = item.column + item.colSpan - 1;
      const overlaps = item.row <= bottom && itemBottom >= top && item.column <= right && itemRight >= left;
      if (!overlaps) continue;
      if (item.row < top) {
        top = item.row;
        changed = true;
      }
      if (item.column < left) {
        left = item.column;
        changed = true;
      }
      if (itemBottom > bottom) {
        bottom = itemBottom;
        changed = true;
      }
      if (itemRight > right) {
        right = itemRight;
        changed = true;
      }
    }
  }
  return { top, left, bottom, right };
}

// 완전히 든 칸들만 — 걸친 칸은 boxBetween 이 이미 안으로 넓혔다.
export function cellsInBox(grid: TableGrid, box: GridBox): readonly GridCell[] {
  return grid.cells.filter(
    (item) =>
      item.row >= box.top &&
      item.row + item.rowSpan - 1 <= box.bottom &&
      item.column >= box.left &&
      item.column + item.colSpan - 1 <= box.right,
  );
}

// 문서 순서의 한 칸 걸음 — Tab 이동. 끝을 넘으면 null 이다.
export function stepCell(grid: TableGrid, from: GridCell, step: 1 | -1): GridCell | null {
  const index = grid.cells.indexOf(from) + step;
  if (index < 0 || index >= grid.cells.length) return null;
  return grid.cells[index] ?? null;
}

// span 을 갈아 끼운 칸 — 기본값 1 은 안 적는다(저장값에 안 남긴다). 값은 문자열이다.
export function withSpans(cell: ElementNode, colSpan: number, rowSpan: number): ElementNode {
  const a: Record<string, AttrValue> = { ...(cell.a ?? {}) };
  delete a[SPAN_COL];
  delete a[SPAN_ROW];
  if (colSpan > 1) a[SPAN_COL] = String(colSpan);
  if (rowSpan > 1) a[SPAN_ROW] = String(rowSpan);
  const next: { w: string; a?: typeof a; ch: ElementNode['ch']; _id?: string } = { w: cell.w, ch: cell.ch };
  if (Object.keys(a).length > 0) next.a = a;
  if (cell._id !== undefined) next._id = cell._id;
  return next;
}

// 칸마다 도는 매퍼로 행들을 다시 짓는다 — 격자 기반 편집이 공유하는 모양. null = 그 칸이 빠진다.
// 빈 행을 걷는 것은 부르는 쪽의 판단이라 여기서 안 한다.
export function mapCells(
  table: ElementNode,
  map: (item: GridCell) => readonly ElementNode[] | ElementNode | null,
): ElementNode {
  const grid = cellGrid(table);
  const byTr = new Map<number, GridCell[]>();
  for (const item of grid.cells) {
    const bucket = byTr.get(item.trIndex);
    if (bucket) bucket.push(item);
    else byTr.set(item.trIndex, [item]);
  }

  const ch = table.ch.map((child, trIndex) => {
    if (!isElement(child) || child.w !== 'tr') return child;
    const items = byTr.get(trIndex) ?? [];
    const cells: ElementNode[] = [];
    for (const item of items) {
      const mapped = map(item);
      if (mapped === null) continue;
      if (Array.isArray(mapped)) cells.push(...(mapped as ElementNode[]));
      else cells.push(mapped as ElementNode);
    }
    return { w: child.w, ch: cells, ...(child.a ? { a: child.a } : {}), ...(child._id !== undefined ? { _id: child._id } : {}) };
  });
  return { w: table.w, ch, ...(table.a ? { a: table.a } : {}), ...(table._id !== undefined ? { _id: table._id } : {}) };
}

// 한 행의 격자 열 자리에 칸을 넣는다 — 그 행에서 `line` 이상에 시작하는 첫 칸 앞, 없으면 꼬리.
export function insertCellInRow(table: ElementNode, trIndex: number, line: number, fresh: ElementNode): ElementNode {
  const grid = cellGrid(table);
  const anchor = grid.cells
    .filter((item) => item.trIndex === trIndex && item.column >= line)
    .sort((a, b) => a.column - b.column)[0];

  const ch = table.ch.map((child, i) => {
    if (i !== trIndex || !isElement(child) || child.w !== 'tr') return child;
    const cells = [...child.ch];
    const at = anchor ? anchor.tdIndex : -1;
    if (at === -1) cells.push(fresh);
    else cells.splice(at, 0, fresh);
    return { w: child.w, ch: cells, ...(child.a ? { a: child.a } : {}), ...(child._id !== undefined ? { _id: child._id } : {}) };
  });
  return { w: table.w, ch, ...(table.a ? { a: table.a } : {}), ...(table._id !== undefined ? { _id: table._id } : {}) };
}
