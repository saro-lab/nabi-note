// 스티키·모바일 — old 040 의 띠 규칙 번역이다. 산수는 `band.ts` 에 있고 여기는 **재는 일**만 한다.
// surface 가 아니라 ui 의 부속인 까닭: 띠의 위 변이 우리가 그린 크롬이고, 크롬은 ui 의 것이다.
//
// 하는 일 셋 (040 §3):
//   1. 두 변을 **매번 잰다** — 상황 줄은 떴다 사라지고 키보드도 그렇다. CSS 변수로 셈하지 않는다
//   2. **가라앉기를 기다린다** — 움직이는 중에 잰 값은 곧 틀릴 값이다 (settle 부품 한 벌)
//   3. iOS 는 **브라우저에게 돌려준다** — 아래 변을 얻을 수 없으므로 우리 셈을 아예 안 하고
//      선택을 뺐다 도로 넣어(`reAim`) WebKit 자신의 리빌을 부른다 (040 §3.2)
//
// 키보드 높이는 시트가 쓰라고 CSS 변수로도 내준다 — 붙는 크롬이 키보드에 밀린 만큼 되돌린다.
import { bandFix, bandOf, isIos, type Rect } from './band.js';
import { watchSettle, type Settle } from './parts/settle.js';

export const KEYBOARD_TOP_VAR = '--nabi-keyboard-top';
export const KEYBOARD_BOTTOM_VAR = '--nabi-keyboard-bottom';

export interface StickyOptions {
  // `.nabi` 뿌리 — CSS 변수가 여기 적힌다.
  readonly root: HTMLElement;
  // 편집 표면 — 캐럿 사각형을 여기서 잰다.
  readonly surface: HTMLElement;
  // 띠의 위 변을 이루는 붙는 크롬. 없으면 창의 위가 위 변이다.
  readonly chrome?: HTMLElement;
  readonly settle?: Settle;
  // iOS 갈래를 끈다 — 모든 플랫폼이 §1 의 띠 규칙 하나로 돈다 (040 의 "되돌리고 싶으면").
  readonly iosBranch?: boolean;
}

export interface Sticky {
  // 지금 캐럿을 띠 안으로 — 툴바 동작 뒤에 부르는 그 문 하나.
  aim(): void;
  unmount(): void;
}

export function mountSticky(options: StickyOptions): Sticky {
  const owner = options.root.ownerDocument;
  const view = owner.defaultView;
  const settle = options.settle ?? watchSettle(owner, { surface: options.surface });
  const ownSettle = options.settle === undefined;
  const ios =
    options.iosBranch !== false &&
    view !== null &&
    isIos(view.navigator.userAgent, view.navigator.platform ?? '', view.navigator.maxTouchPoints ?? 0);

  // --- 키보드 자리 → CSS 변수 -----------------------------------------------------------------
  // 0 이면 변수를 **지운다** — "키보드 없음"과 "높이 0 인 키보드"가 같은 상태여야 시트의 기본이 산다.
  const writeVar = (name: string, px: number): void => {
    const value = Math.round(px);
    if (value <= 0) options.root.style.removeProperty(name);
    else options.root.style.setProperty(name, `${value}px`);
  };

  const follow = (): void => {
    if (!view) return;
    const visual = view.visualViewport;
    const top = visual ? visual.offsetTop : 0;
    const bottom = visual ? Math.max(0, view.innerHeight - (visual.offsetTop + visual.height)) : 0;
    writeVar(KEYBOARD_TOP_VAR, top);
    writeVar(KEYBOARD_BOTTOM_VAR, bottom);
  };

  // --- 캐럿 사각형 ------------------------------------------------------------------------------
  const caretRect = (): Rect | null => {
    const selection = owner.getSelection?.();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const box = range.getBoundingClientRect();
    // 접힌 캐럿이 0×0 을 답하는 자리가 있다 — 그때는 든 요소의 사각형으로 갈음한다.
    if (box.height > 0) return { top: box.top, bottom: box.bottom };
    const node = range.startContainer;
    const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
    if (!el) return null;
    const fallback = el.getBoundingClientRect();
    return { top: fallback.top, bottom: fallback.bottom };
  };

  // 선택을 뺐다 도로 넣는다 — 진짜 선택 변경이고, 진짜 선택 변경이야말로 WebKit 이 자기 방식으로
  // 캐럿을 보여 주게 만든다 (040 §3.2). 우리는 자리를 하나도 안 정한다.
  const reAim = (): void => {
    const selection = owner.getSelection?.();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const measure = (): void => {
    if (!view) return;
    if (ios) {
      reAim();
      return;
    }
    const caret = caretRect();
    if (!caret) return;
    const visual = view.visualViewport;
    const viewport: Rect = visual
      ? { top: 0, bottom: visual.height }
      : { top: 0, bottom: view.innerHeight };
    const chromeBottom = options.chrome ? options.chrome.getBoundingClientRect().bottom : null;
    const delta = bandFix(caret, bandOf(chromeBottom, viewport), viewport.bottom - viewport.top);
    if (delta === 0) return; // 띠 안 — 화면은 가만있는다 (규칙의 절반이 이것이다)
    view.scrollBy({ top: delta, behavior: 'auto' });
  };

  const aim = (): void => {
    follow();
    settle.afterViewport(() => {
      follow();
      measure();
    });
  };

  // 편집기가 겨눔을 쥔 동안만 본다 — 안 쥔 편집기의 막대를 밀면 안 되고, 둘이면 서로 싸운다.
  let watching = false;
  const start = (): void => {
    if (watching) return;
    watching = true;
    follow();
    view?.visualViewport?.addEventListener('resize', follow);
    view?.visualViewport?.addEventListener('scroll', follow);
  };
  const stop = (): void => {
    if (!watching) return;
    watching = false;
    view?.visualViewport?.removeEventListener('resize', follow);
    view?.visualViewport?.removeEventListener('scroll', follow);
    writeVar(KEYBOARD_TOP_VAR, 0);
    writeVar(KEYBOARD_BOTTOM_VAR, 0);
  };

  options.surface.addEventListener('focus', start);
  options.surface.addEventListener('blur', stop);
  if (owner.activeElement === options.surface) start();

  return {
    aim,
    unmount() {
      stop();
      options.surface.removeEventListener('focus', start);
      options.surface.removeEventListener('blur', stop);
      if (ownSettle) settle.unmount();
    },
  };
}
