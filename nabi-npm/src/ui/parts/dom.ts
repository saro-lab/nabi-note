// ui의 어떤 파일도 전역 document를 안 쓴다 — 손잡이는 늘 건네받은 요소에서 나와, 편집기가 둘이거나 iframe 안이어도 같은 코드가 돈다. focus({preventScroll:true})도 여기서만 부른다.
// No file in ui touches the global document — handles always come from the passed-in element, so the same code works with two editors on a page or inside an iframe. focus({preventScroll:true}) is also only called here.

export interface UiHost {
  readonly owner: Document;
  readonly view: (Window & typeof globalThis) | null;
}

export function hostOf(el: Element): UiHost {
  const owner = el.ownerDocument;
  return { owner, view: owner.defaultView };
}

// 요소 하나 — 클래스와 표식까지 한 번에. `undefined` 표식은 안 붙는다.
// Builds one element with its class and attrs in one shot; an `undefined` attr is simply skipped.
export function make(
  owner: Document,
  tag: string,
  className?: string,
  attrs?: Readonly<Record<string, string | undefined>>,
): HTMLElement {
  const el = owner.createElement(tag);
  if (className) el.className = className;
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value !== undefined) el.setAttribute(key, value);
  }
  return el;
}

// 포커스를 되돌리되 화면은 안 던진다 — focus의 기본은 그 요소로 스크롤하는 것인데, 그 계산은 레이아웃 뷰포트라 모바일 키보드를 못 본다.
// Restores focus without scrolling the page — focus's default behavior scrolls to the element using layout-viewport math, which doesn't account for the on-screen keyboard.
export function focusQuiet(el: HTMLElement | null | undefined): void {
  if (el?.isConnected) el.focus({ preventScroll: true });
}

// 표식 하나를 켜고 끈다 — `hidden` 처럼 값이 없는 표식의 한 벌.
// Toggles a valueless attribute on and off, like `hidden`.
export function flag(el: Element, name: string, on: boolean): void {
  if (on) el.setAttribute(name, '');
  else el.removeAttribute(name);
}

// 아이콘 껍데기는 wing/toolbar-html.ts로 옮겼다 — 서버가 툴바를 그리려면 ui 밖에 있어야 하고, 원래 DOM을 안 만지는 순수 함수였다. 여기서는 부르던 자리를 위해 다시 내보내기만 한다.
// The icon shell moved to wing/toolbar-html.ts — the server needs it outside of ui to render the toolbar, and it was already a pure, DOM-free function. Re-exported here for existing callers.
export { iconSvg } from '../../wing/toolbar-html.js';
