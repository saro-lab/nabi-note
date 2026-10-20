// 편집 화면의 각주 — 번호 매기기, 본문 밖 하단 목록, 번호 클릭으로 고치기 판 열기, 붙은 지우기는 먼저 고르기.
// Footnotes on the editing screen: numbering, the list below the body (outside contenteditable), opening the edit prompt on a number click, and selecting first on an adjacent delete.
// 번호는 DOM 순서로 매긴다 — 화면은 트리를 그린 것이라 순서가 같고, 문단 단위 다시 그리기·조합 뒤 전체 다시 그리기처럼 change 알림 없이 DOM이 바뀌는 길도 관찰자가 잡는다.
// Numbers follow DOM order, which matches the tree it was drawn from; an observer also catches DOM rewrites that arrive without a change event (per-paragraph redraws, full redraws after composition).
import { isCollapsed, ordered, sameSelection } from '../../caret/index.js';
import { nodeAt } from '../../doc/index.js';
import { hostOf } from '../../editor/index.js';
import { renderAppendixHtml } from '../../html/index.js';
import type { Attach } from '../../wing/index.js';
import { FN, footnoteAt, footnoteList, footnoteOffsets, footnoteSpots } from './model.js';

const MARKER = '[data-nabi-terminal][data-nabi-fn]';
const NUMBER_ATTR = 'data-nabi-n';
const PICKED_ATTR = 'data-nabi-picked';

export const attachFootnotes: Attach = ({ root, nabi, doc, env, onDispose }) => {
  // 그물의 껍데기 root — 화면이 없으면 할 일이 없다.
  // A test-shell root; with no screen there is nothing to do.
  if (typeof root.querySelectorAll !== 'function' || !root.ownerDocument) return () => {};
  const owner = root.ownerDocument;
  let area: HTMLElement | null = null;
  let areaHtml = '';
  let picked: Element | null = null;
  let took = false;
  let mouseStart: { marker: Element; x: number; y: number } | null = null;

  const markers = (): Element[] => Array.from(root.querySelectorAll(MARKER));

  const renumber = (): void => {
    markers().forEach((el, i) => {
      const n = String(i + 1);
      if (el.getAttribute(NUMBER_ATTR) !== n) el.setAttribute(NUMBER_ATTR, n);
    });
  };

  const refreshPicked = (): void => {
    const current = doc();
    const hit = footnoteAt(current, nabi.getSelection(), env);
    let next: Element | null = null;
    if (hit) {
      const index = footnoteSpots(current, env).findIndex(
        (spot) => spot.offset === hit.offset && spot.path.every((value, i) => value === hit.path[i]),
      );
      next = index >= 0 ? (markers()[index] ?? null) : null;
    }
    if (picked === next) return;
    picked?.removeAttribute(PICKED_ATTR);
    picked = next;
    picked?.setAttribute(PICKED_ATTR, '');
  };

  const select = (index: number): boolean => {
    const spot = footnoteSpots(doc(), env)[index];
    if (!spot) return false;
    if (typeof root.focus === 'function') root.focus({ preventScroll: true });
    const selection = { anchor: spot, focus: { path: spot.path, offset: spot.offset + 1 } };
    return sameSelection(nabi.getSelection(), selection) || nabi.select(selection);
  };

  // 하단 번호 → 본문의 그 각주로 간다. 고치기 판은 열지 않는다(본문 번호를 눌러야 연다).
  // A number in the list jumps to that footnote in the body; it doesn't open the edit prompt (that takes the body number).
  const onAreaClick = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    const item = typeof target?.closest === 'function' ? target.closest('[data-nabi-fn-n]') : null;
    if (!item || !target?.closest('[data-nabi-fn-num]')) return;
    const index = Number(item.getAttribute('data-nabi-fn-n')) - 1;
    if (!Number.isInteger(index) || !select(index)) return;
    event.preventDefault();
    const reduce = owner.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    const marker = markers()[index] as HTMLElement | undefined;
    marker?.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  };

  // 하단 목록은 본문 contenteditable의 형제다 — 그 안에 두면 커서·입력·지우기를 따로 막아야 한다. 각주가 없으면 영역째 없앤다.
  // The list is a sibling of the body's contenteditable; inside it, caret entry, typing, and deletion would each need blocking. No footnotes, no area at all.
  const drawArea = (): void => {
    const html = renderAppendixHtml(doc(), { env, appendices: { [FN]: footnoteList } });
    if (html === '') {
      area?.remove();
      area = null;
      areaHtml = '';
      return;
    }
    if (!area) {
      area = owner.createElement('div');
      area.className = 'nabi-content nabi-footnote-area';
      area.addEventListener('click', onAreaClick);
    }
    if (root.nextSibling !== area) root.after(area);
    if (html !== areaHtml) {
      area.innerHTML = html;
      areaHtml = html;
    }
  };

  // 누르는 순간 각주를 통째로 고른다 — 첨부 링크와 같은 규칙이고, mouseup·click도 삼켜야 브라우저가 캐럿을 도로 놓지 않는다.
  // Pressing selects the whole footnote at once, the attachment-link rule; mouseup and click are swallowed too, or the browser replants the caret.
  const onMouseDown = (event: MouseEvent): void => {
    took = false;
    if (event.button > 0 || event.shiftKey) return;
    const target = event.target as Element | null;
    const marker = typeof target?.closest === 'function' ? target.closest(MARKER) : null;
    if (!marker || !root.contains(marker)) return;
    const index = markers().indexOf(marker);
    if (index < 0) return;
    event.preventDefault();
    took = select(index);
  };

  const onPointerDown = (event: PointerEvent): void => {
    mouseStart = null;
    if (event.pointerType === 'touch' || event.button !== 0 || event.shiftKey) return;
    const marker = (event.target as Element | null)?.closest?.(MARKER);
    if (marker && root.contains(marker)) mouseStart = { marker, x: event.clientX, y: event.clientY };
  };
  const onPointerCancel = (): void => {
    mouseStart = null;
  };
  const onSwallow = (event: MouseEvent): void => {
    // 바깥 클릭 저장이 누른 DOM을 바꿨으면 mouseup에서 새 번호를 이어 받는다.
    // Outside-click submission can replace the pressed DOM; resume on the new marker at mouseup.
    if (event.type === 'mouseup' && !took && mouseStart && !mouseStart.marker.isConnected) {
      const start = mouseStart;
      mouseStart = null;
      const marker = (event.target as Element | null)?.closest?.(MARKER);
      const index = marker ? markers().indexOf(marker) : -1;
      if (index >= 0 && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 10 && select(index)) {
        event.preventDefault();
        hostOf(nabi).requestContext(FN);
      }
      return;
    }
    if (!took) return;
    event.preventDefault();
    if (event.type !== 'click') return;
    took = false;
    mouseStart = null;
    // 고른 뒤 상황 줄이 다시 그려진 다음에 판이 열린다 — ui가 받는 자리를 걸어 두지 않았으면 고르기만 한다.
    // The prompt opens after the context row rebuilds for the new selection; with no ui receiver bound, this only selects.
    hostOf(nabi).requestContext(FN);
  };

  let touchStart: { id: number; x: number; y: number; time: number; marker: Element } | null = null;
  const clearTouch = (): void => {
    touchStart = null;
  };
  const onTouchStart = (event: TouchEvent): void => {
    clearTouch();
    const marker = (event.target as Element | null)?.closest?.(MARKER);
    const touch = event.touches[0];
    if (!marker || !root.contains(marker) || event.touches.length !== 1 || !touch) return;
    touchStart = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      time: event.timeStamp,
      marker,
    };
  };
  const matchesTouch = (touch: Touch): boolean =>
    touchStart !== null &&
    touch.identifier === touchStart.id &&
    Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) <= 10;
  const onTouchMove = (event: TouchEvent): void => {
    if (event.touches.length !== 1 || !matchesTouch(event.touches[0]!)) clearTouch();
  };
  const onTouchEnd = (event: TouchEvent): void => {
    const start = touchStart;
    const touch = event.changedTouches[0];
    const valid =
      start &&
      touch &&
      event.touches.length === 0 &&
      event.changedTouches.length === 1 &&
      matchesTouch(touch) &&
      event.timeStamp - start.time < 500;
    clearTouch();
    if (!valid || !start || !touch || !event.cancelable || event.defaultPrevented) return;
    const hit = owner.elementFromPoint(touch.clientX, touch.clientY);
    if (!hit || !start.marker.contains(hit)) return;
    const index = markers().indexOf(start.marker);
    if (index < 0) return;
    // 속성 줄이 생기며 번호가 움직이므로 합성 마우스 클릭 전에 탭을 마친다.
    // Finish the tap before synthetic mouse events can hit a marker shifted by the property row.
    event.preventDefault();
    took = false;
    if (select(index)) hostOf(nabi).requestContext(FN);
  };

  // 붙은 Backspace/Delete는 먼저 각주를 고르고 다음 입력이 지운다 — 내용이 본문에 안 보이는 물건이라 한 번에 잃지 않게 한다.
  // An adjacent Backspace/Delete first selects the footnote and the next press deletes it; its content isn't visible in the body, so it isn't lost in one stroke.
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) return;
    const at = ordered(sel)[0];
    const holder = nodeAt(doc(), at.path);
    if (!holder) return;
    const from = event.key === 'Backspace' ? at.offset - 1 : at.offset;
    if (!footnoteOffsets(holder, env).includes(from)) return;
    event.preventDefault();
    nabi.select({ anchor: { path: at.path, offset: from }, focus: { path: at.path, offset: from + 1 } });
  };

  const Observer = owner.defaultView?.MutationObserver;
  const observer = Observer
    ? new Observer(() => {
        renumber();
        refreshPicked();
      })
    : null;
  observer?.observe(root, { childList: true, subtree: true });
  onDispose(() => observer?.disconnect());

  const stop = nabi.onChange((change) => {
    if (change.doc) drawArea();
    renumber();
    refreshPicked();
  });
  onDispose(stop);
  owner.addEventListener('pointerdown', onPointerDown, true);
  owner.addEventListener('pointercancel', onPointerCancel, true);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('mouseup', onSwallow);
  root.addEventListener('click', onSwallow);
  root.addEventListener('touchstart', onTouchStart, { passive: true });
  root.addEventListener('touchmove', onTouchMove, { passive: true });
  root.addEventListener('touchend', onTouchEnd, { passive: false });
  root.addEventListener('touchcancel', clearTouch);
  // 캡처로 표면의 keydown보다 먼저 막는다 — 안 그러면 코어가 먼저 각주를 지운다.
  // Captured ahead of the surface's own keydown, or the core would delete the footnote first.
  root.addEventListener('keydown', onKeyDown, true);
  onDispose(() => {
    mouseStart = null;
    owner.removeEventListener('pointerdown', onPointerDown, true);
    owner.removeEventListener('pointercancel', onPointerCancel, true);
    clearTouch();
    root.removeEventListener('touchstart', onTouchStart);
    root.removeEventListener('touchmove', onTouchMove);
    root.removeEventListener('touchend', onTouchEnd);
    root.removeEventListener('touchcancel', clearTouch);
    root.removeEventListener('keydown', onKeyDown, true);
    root.removeEventListener('click', onSwallow);
    root.removeEventListener('mouseup', onSwallow);
    root.removeEventListener('mousedown', onMouseDown);
    picked?.removeAttribute(PICKED_ATTR);
    picked = null;
    area?.removeEventListener('click', onAreaClick);
    area?.remove();
    area = null;
  });

  drawArea();
  renumber();
  refreshPicked();
  return () => {};
};
