// 공통 부품 — 문서 손잡이·요소 짓기·포커스. 옛 판이 네 벌씩 갖고 있던 것들의 **한 벌**이다.
//
// `ownerDocument` 통일: ui 의 어떤 파일도 전역 `document` 를 안 쓴다. 손잡이는 늘 건네받은
// 요소에서 나온다 — 한 페이지에 편집기가 둘이거나 iframe 안이어도 같은 코드가 돈다.
// `focus({preventScroll:true})` 도 여기 한 곳에서만 부른다 (040 §6.1 의 원인 A).

export interface UiHost {
  readonly owner: Document;
  readonly view: (Window & typeof globalThis) | null;
}

export function hostOf(el: Element): UiHost {
  const owner = el.ownerDocument;
  return { owner, view: owner.defaultView };
}

// 요소 하나 — 클래스와 표식까지 한 번에. `undefined` 표식은 안 붙는다.
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

// 포커스 되돌리기 — **화면을 던지지 않고**. 040 §6.1: `focus` 의 기본은 "그 요소로 스크롤"이고
// 그 계산은 레이아웃 뷰포트라 키보드를 못 본다. 갓 열린 입력 칸은 이 길을 안 탄다(키보드 뒤로 숨는다).
export function focusQuiet(el: HTMLElement | null | undefined): void {
  el?.focus({ preventScroll: true });
}

// 표식 하나를 켜고 끈다 — `hidden` 처럼 값이 없는 표식의 한 벌.
export function flag(el: Element, name: string, on: boolean): void {
  if (on) el.setAttribute(name, '');
  else el.removeAttribute(name);
}

// 16×16 아이콘 틀 — wing 이 들고 오는 것은 속(path)뿐이고 틀은 여기 하나다 (old 번역).
// 아이콘 껍데기는 **`wing/toolbar-html.ts` 로 옮겼다** — 서버가 툴바를 그리려면 ui 밖에 있어야
// 하고, 원래 DOM 을 안 만지는 순수 함수였다. 여기서는 부르던 자리를 위해 다시 내보내기만 한다.
export { iconSvg } from '../../wing/toolbar-html.js';
