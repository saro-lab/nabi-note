// 칸 범위의 표면 부속 — 드래그로 범위 세우기, 병합 상자 칠, Escape 해제 셋을 맡는다.
// The cell-range surface attach — handles drag-to-select, painting the merged selection box, and Escape to collapse it.
//
// 드래그를 직접 세우는 까닭 — Chrome은 표 안 드래그를 표 통째의 엘리먼트 선택으로 바꿔 버려 어느 칸에서 어느 칸까지인지가 안 남는다.
// Drag is handled by hand because Chrome collapses an in-table drag into a whole-table element selection, losing which cell it started and ended on.
import { isCollapsed } from '../../caret/index.js';
import type { Attach } from '../../wing/index.js';
import type { Position } from '../../doc/index.js';
import { selectionBox } from './selection.js';

// 편집 화면 전용 표식 — 트리·저장 HTML 어디에도 안 실린다(칠은 redraw마다 다시 선다).
// An editor-screen-only flag — never lands in the tree or saved HTML; repainted fresh on every redraw.
export const CELL_SELECTED = 'data-nabi-cell-selected';
// 상자가 선 표 — 그동안 브라우저의 글 선택을 지우는 손잡이다.
// Marks the table currently holding a box selection — used to suppress the browser's own text selection meanwhile.
export const CELL_BOXED = 'data-nabi-cell-boxed';

export const attachCellRange: Attach = ({ root, nabi, doc, pathOfKey }) => {
  let painted: Element[] = [];
  let boxedTable: Element | null = null;

  const clear = (): void => {
    for (const el of painted) el.removeAttribute(CELL_SELECTED);
    painted = [];
    boxedTable?.removeAttribute(CELL_BOXED);
    boxedTable = null;
  };

  // 지금 선택이 두 칸에 걸치면 그 사각형(병합이 걸치는 칸까지 넓힌 상자)을 칠한다.
  // If the current selection spans two cells, paints the rectangle grown to include any straddling merged cell.
  const paint = (): void => {
    clear();
    const boxed = selectionBox(doc(), nabi.getSelection());
    if (!boxed) return;
    for (const item of boxed.cells) {
      const id = item.cell._id;
      if (typeof id !== 'string') continue;
      const el = root.querySelector(`[data-key="${id}"]`);
      if (!el) continue;
      el.setAttribute(CELL_SELECTED, '1');
      painted.push(el);
    }
    // 표 전체에 표식 하나를 건다 — 칸에만 걸면 문서 순서상 상자 밖인데 사이에 낀 칸에 브라우저의 글 선택이 남는다.
    // Flags the whole table, not just individual cells — otherwise a cell caught between box cells in document order (but outside it) keeps the browser's own text selection visible.
    boxedTable = painted[0]?.closest('table') ?? null;
    boxedTable?.setAttribute(CELL_BOXED, '1');
  };

  // 이벤트가 난 자리의 칸 — 칸의 `_id`가 곧 DOM의 `data-key`다(칠할 때 쓰는 그 손잡이).
  // The cell an event fired on — a cell's `_id` is the DOM's `data-key`, the same handle painting uses.
  const cellKeyAt = (target: EventTarget | null): string | null => {
    const node = target as Node | null;
    const el = node?.nodeType === 1 ? (node as Element).closest('td, th') : null;
    if (!el || !root.contains(el)) return null;
    const key = el.getAttribute('data-key');
    return key === null || key === '' ? null : key;
  };

  // 칸 하나의 캐럿 자리 — 칸은 문단 하나만 품으므로(repair가 보장한다) 그 문단의 처음이다.
  // One cell's caret position — a cell holds exactly one paragraph (repair guarantees it), so this is that paragraph's start.
  const caretInCell = (key: string): Position | null => {
    const path = pathOfKey(key);
    return path ? { path: [...path, 0], offset: 0 } : null;
  };

  let fromKey: string | null = null;

  const onMouseDown = (ev: MouseEvent): void => {
    fromKey = ev.button === 0 ? cellKeyAt(ev.target) : null;
  };

  const onMouseMove = (ev: MouseEvent): void => {
    if (fromKey === null) return;
    // 단추를 놓은 채 지나가는 건 드래그가 아니다 — 창 밖에서 놓았을 때 여기로 돌아온다.
    // Passing through with the button already released isn't a drag — catches a mouseup that happened outside the window.
    if ((ev.buttons & 1) === 0) {
      fromKey = null;
      return;
    }
    const overKey = cellKeyAt(ev.target);
    if (overKey === null || overKey === fromKey) return;
    const anchor = caretInCell(fromKey);
    const focus = caretInCell(overKey);
    if (!anchor || !focus) return;
    // 브라우저 제 선택을 막는다 — 안 막으면 다음 몸짓이 우리가 세운 범위를 곧장 덮어 버린다.
    // Suppresses the browser's own selection — without this, its next gesture would immediately overwrite the range just set.
    ev.preventDefault();
    nabi.select({ anchor, focus });
  };

  const onMouseUp = (): void => {
    fromKey = null;
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key !== 'Escape' || painted.length === 0) return;
    // 상자가 서 있을 때의 Escape — 범위를 focus 칸의 캐럿으로 접는다(드래그로만 다시 선다).
    // Escape while a box is up collapses the range to a caret at the focus cell — only a new drag can re-establish it.
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) {
      ev.preventDefault();
      nabi.select({ anchor: sel.focus, focus: sel.focus });
    }
  };

  const off = nabi.onChange(() => paint());
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('mousemove', onMouseMove);
  // 놓는 것은 편집기 밖에서도 일어난다 — 표 밖으로 끌고 나가 놓으면 root는 그 말을 못 듣는다.
  // A mouseup can happen outside the editor entirely — dragging past the table and releasing there, root would never hear it.
  const owner = root.ownerDocument;
  owner.addEventListener('mouseup', onMouseUp);
  paint();

  return () => {
    owner.removeEventListener('mouseup', onMouseUp);
    root.removeEventListener('mousemove', onMouseMove);
    root.removeEventListener('mousedown', onMouseDown);
    root.removeEventListener('keydown', onKeyDown);
    off();
    clear();
  };
};
