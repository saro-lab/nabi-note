// 컨테이너 쿼리로 안 재는 까닭 — container-type이 fixed의 containing block을 바꿔, 그 안의 position:fixed 판이 화면이 아니라 툴바 상자 가운데에 선다. 그래서 폭은 JS로 재고 CSS는 클래스만 듣는다.
// Not measured via container queries — container-type turns the box into a containing block for position:fixed, so a fixed panel inside it would center on the toolbar, not the viewport. Width is measured in JS instead, and CSS only reacts to a class.

import { NARROW_REM } from '../style/tokens.js';

export const NARROW_CLASS = 'nabi-narrow';
export { NARROW_REM };

type Watcher = { observe(el: Element): void; disconnect(): void };

// 그릇의 폭을 지켜서 문턱 아래면 클래스를 단다 — 돌려준 함수는 unmount가 부른다. ResizeObserver가 없는 브라우저는 그냥 안 잰다(여러 줄로 접힐 뿐, 나머지는 그대로다).
// Watches the container's width and toggles the class below the threshold; the returned function is called on unmount. Without ResizeObserver, it simply doesn't measure — content just wraps to more lines.
export function watchNarrow(el: HTMLElement): () => void {
  const owner = el.ownerDocument;
  const view = owner.defaultView;
  const Observer = (view as unknown as { ResizeObserver?: new (fn: () => void) => Watcher } | null)?.ResizeObserver;
  if (!view || !Observer) return () => {};
  const apply = (): void => {
    // rem은 그때그때 읽는다 — 호스트가 뿌리 글자 크기를 바꾸면 문턱도 함께 옮겨 간다.
    // rem is read fresh each time, so if the host changes the root font size, the threshold moves with it.
    const rem = parseFloat(view.getComputedStyle(owner.documentElement).fontSize) || 16;
    el.classList.toggle(NARROW_CLASS, el.clientWidth <= NARROW_REM * rem);
  };
  const watcher = new Observer(apply);
  watcher.observe(el);
  apply();
  return () => {
    watcher.disconnect();
    el.classList.remove(NARROW_CLASS);
  };
}
