// 칸 범위의 표면 부속 — 셋을 맡는다: **드래그로 범위 세우기**, 그 범위에서 파생되는 그림(병합
// 상자 칠), Escape 해제. 계약 밖 리스너가 아니다 — wing 이 선언하고 mount 가 붙이는 attach 훅이다
//
// 드래그를 왜 우리가 세우는가: 브라우저에 맡겨 두었더니 표 안을 가로지르는 드래그가 **표 통째**로
// 왔다. Chrome 은 칸을 넘는 순간 선택을 표를 감싼 겉옷(`.nabi-scroll`) 위의 엘리먼트 범위로
// 바꿔 버리고, 그 점이 트리로 오면 "래퍼문단 안의 물건 하나" 가 된다 — 어느 칸에서 어느 칸까지인지가
// 그 답에는 아예 없다. 셈이 틀린 것이 아니라 **물어본 것과 다른 것을 답하는** 자리라, 여기서
// 칸으로 다시 묻는다: 누른 칸과 지금 지나는 칸, 그 둘이 곧 상자의 두 귀퉁이다.
import { isCollapsed } from '../../caret/index.js';
import type { Attach } from '../../wing/index.js';
import type { Position } from '../../doc/index.js';
import { selectionBox } from './table.js';

// 편집 화면 전용 표식 — 트리·저장 HTML 어디에도 안 실린다 (칠은 redraw 마다 다시 선다).
export const CELL_SELECTED = 'data-nabi-cell-selected';
// 상자가 선 표 — 그 동안 브라우저의 글 선택을 지우는 손잡이다.
export const CELL_BOXED = 'data-nabi-cell-boxed';

export const attachCellRange: Attach = ({ root, nabi, pathOfKey }) => {
  let painted: Element[] = [];
  let boxedTable: Element | null = null;

  const clear = (): void => {
    for (const el of painted) el.removeAttribute(CELL_SELECTED);
    painted = [];
    boxedTable?.removeAttribute(CELL_BOXED);
    boxedTable = null;
  };

  // 지금 선택이 두 칸에 걸치면 그 사각형(병합이 걸치는 칸까지 넓힌 상자)을 칠한다.
  const paint = (): void => {
    clear();
    const boxed = selectionBox(nabi.$doc(), nabi.getSelection());
    if (!boxed) return;
    for (const item of boxed.cells) {
      const id = item.cell._id;
      if (typeof id !== 'string') continue;
      const el = root.querySelector(`[data-key="${id}"]`);
      if (!el) continue;
      el.setAttribute(CELL_SELECTED, '1');
      painted.push(el);
    }
    // 상자가 선 동안 **표 전체**에 표식 하나 — 시트가 이것을 보고 브라우저의 글 선택을 지운다.
    //
    // 칸에만 걸면 모자란다: 선택은 첫 칸에서 끝 칸까지 **문서 순서로 이어져** 있어서, 상자 밖인데
    // 그 사이에 낀 칸(2×2 를 잡으면 첫 줄의 셋째 칸)에 브라우저의 파란 칠이 남는다. 상자는 칸
    // 단위이고 글 선택은 글자 단위라 두 경계가 어긋나 보인다 — 표 하나에 한 번 거는 것이 맞다.
    boxedTable = painted[0]?.closest('table') ?? null;
    boxedTable?.setAttribute(CELL_BOXED, '1');
  };

  // --- 드래그로 상자 세우기 ---------------------------------------------------------------------

  // 이벤트가 난 자리의 칸 — 칸의 `_id` 가 곧 DOM 의 `data-key` 다(칠할 때 쓰는 그 손잡이).
  const cellKeyAt = (target: EventTarget | null): string | null => {
    const el = target instanceof Element ? target.closest('td, th') : null;
    if (!el || !root.contains(el)) return null;
    const key = el.getAttribute('data-key');
    return key === null || key === '' ? null : key;
  };

  // 칸 하나의 캐럿 자리 — 칸은 문단 **하나**를 품는다(repair 가 보장한다). 그 문단의 처음이다.
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
    // 단추를 놓은 채 지나가는 것은 드래그가 아니다 — 창 밖에서 놓았을 때 여기로 돌아온다.
    if ((ev.buttons & 1) === 0) {
      fromKey = null;
      return;
    }
    const overKey = cellKeyAt(ev.target);
    if (overKey === null || overKey === fromKey) return;
    const anchor = caretInCell(fromKey);
    const focus = caretInCell(overKey);
    if (!anchor || !focus) return;
    // 브라우저의 제 선택을 막는다 — 안 막으면 우리가 세운 범위를 다음 몸짓이 곧장 덮는다.
    ev.preventDefault();
    nabi.select({ anchor, focus });
  };

  const onMouseUp = (): void => {
    fromKey = null;
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key !== 'Escape' || painted.length === 0) return;
    // 상자가 서 있을 때의 Escape — 범위를 focus 칸의 캐럿으로 접는다 (드래그로만 다시 선다).
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
  // 놓는 것은 편집기 밖에서도 일어난다 — 표 밖으로 끌고 나가 놓으면 root 는 그 말을 못 듣는다.
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
