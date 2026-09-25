// 컨테이너 쿼리로 안 재는 까닭 — container-type이 fixed의 containing block을 바꿔, 그 안의 position:fixed 판이 화면이 아니라 툴바 상자 가운데에 선다. 그래서 폭은 JS로 재고 CSS는 클래스만 듣는다.
// Not measured via container queries — container-type turns the box into a containing block for position:fixed, so a fixed panel inside it would center on the toolbar, not the viewport. Width is measured in JS instead, and CSS only reacts to a class.

import { NARROW_REM } from '../style/tokens.js';

export const NARROW_CLASS = 'nabi-narrow';
export { NARROW_REM };

type Watcher = { observe(el: Element): void; disconnect(): void };

// 측정 요소가 CSS 길이와 상속을 그대로 따른다. source는 body로 옮겨진 패널도 원래 편집기를 재게 한다.
// The probe follows CSS lengths and inheritance; source keeps portaled panels tied to their original editor.
export function watchNarrow(el: HTMLElement, source: HTMLElement = el): () => void {
  const owner = el.ownerDocument;
  const view = owner.defaultView;
  const Observer = (view as unknown as { ResizeObserver?: new (fn: () => void) => Watcher } | null)?.ResizeObserver;
  if (!view || !Observer) return () => {};
  const probe = owner.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = `all: initial; position: fixed; left: 0; top: 0; width: var(--nabi-mobile-breakpoint, ${NARROW_REM}rem); height: 0; font-size: inherit; overflow: hidden; visibility: hidden; pointer-events: none;`;
  const apply = (): void => {
    const style = view.getComputedStyle(source);
    const width = parseFloat(style.width);
    const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const border = (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);
    const room = Number.isFinite(width)
      ? width + (style.boxSizing === 'border-box' ? -border : padding)
      : source.clientWidth;
    const threshold = parseFloat(view.getComputedStyle(probe).width);
    el.classList.toggle(NARROW_CLASS, Math.min(room, owner.documentElement.clientWidth) < threshold);
  };
  let frame = 0;
  const schedule = (): void => {
    if (frame) return;
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      apply();
    });
  };
  const watcher = new Observer(schedule);
  const stop = (): void => {
    watcher.disconnect();
    view.cancelAnimationFrame(frame);
    view.removeEventListener('resize', schedule);
    probe.remove();
    el.classList.remove(NARROW_CLASS);
  };
  try {
    source.append(probe);
    watcher.observe(source);
    watcher.observe(probe);
    view.addEventListener('resize', schedule);
    apply();
  } catch (error) {
    stop();
    throw error;
  }
  return stop;
}
