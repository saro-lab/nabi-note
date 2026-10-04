// 아이콘 버튼은 이 파일 하나에서 나온다 — 툴바·상황 줄·피커 칸·색 견본이 전부 같은 팩토리를 쓴다.
// Every icon button — toolbar, context row, picker cell, swatch — comes from this one factory.
//
// 네 가지가 늘 함께 붙는다(하나라도 빠지면 버그였다): type="button", aria-label(이름), data-nabi-tip(이름표), mousedown 막기(누를 때 캐럿 유지).
// Four things always travel together (missing any one was a real bug): type="button", aria-label (name), data-nabi-tip (visible tip), and swallowing mousedown (keeps the caret in place on press).
import type { CommandHand } from '../../editor/index.js';
import { make } from './dom.js';
import { iconHtml } from '../../style/icon.js';
import { isIos } from '../band.js';

export interface IconButtonSpec {
  // data-name — 힌트·시험이 버튼을 찾는 손잡이.
  // data-name — the handle hints and tests use to find this button.
  readonly name: string;
  // 아이콘 속(path들). 없으면 `text` 를 글자로 그린다.
  // The icon's inner paths; falls back to rendering `text` as a label when absent.
  readonly svg?: string;
  readonly icon?: string;
  readonly iconKey?: string;
  readonly text?: string;
  // 이미 번역된 말 — 이 층은 사전을 다시 안 뒤진다.
  // Already-translated text — this layer never consults the dictionary itself.
  readonly label: string;
  readonly className?: string;
  readonly strokeWidth?: number;
  // 색 견본 — 주면 배경으로 칠한다(글자·아이콘 대신).
  // A color swatch — when given, it paints the background instead of text or an icon.
  readonly swatch?: string;
  // 부른 손이 함께 온다 — 진짜 클릭·탭이면 'pointer', 겨눈 버튼의 Enter/Space나 el.click()이면 'keyboard'다.
  // The triggering hand comes along — 'pointer' for a real click/tap, 'keyboard' for Enter/Space on a focused button or el.click().
  readonly press: (by: CommandHand) => void;
}

export function iconButton(owner: Document, spec: IconButtonSpec): HTMLButtonElement {
  const classes = ['nabi-btn'];
  if (spec.swatch) classes.push('nabi-swatch');
  else if (!spec.svg && !spec.icon && spec.text) classes.push('nabi-word');
  if (spec.className) classes.push(spec.className);

  const button = make(owner, 'button', classes.join(' '), {
    type: 'button',
    'data-name': spec.name,
    'aria-label': spec.label,
    'data-nabi-tip': spec.label,
  }) as HTMLButtonElement;

  if (spec.swatch) button.style.setProperty('--nabi-swatch-color', spec.swatch);
  else if (spec.icon || spec.svg)
    button.innerHTML = iconHtml(spec.iconKey ?? spec.name, spec.icon, spec.svg, spec.strokeWidth);
  else button.textContent = spec.text ?? spec.label;

  wireIconButton(button, spec.press);
  return button;
}

// 이미 서 있는 단추에 배선만 건다 — 미리 그려 보낸 툴바를 이어받는 자리다. 만드는 쪽과 이어받는 쪽이 같은 한 줄을 쓰므로 둘의 동작이 갈릴 수 없다.
// Wires an already-rendered button — this is how a server-drawn toolbar gets hydrated. Both the creating and hydrating paths share this one function, so their behavior can't drift apart.
export function wireIconButton(button: HTMLElement, press: (by: CommandHand) => void): () => void {
  // 겨눔을 지키는 mousedown 억제가 브라우저 :active도 함께 죽여 눌린 티가 안 나므로, 누른 티(.nabi-tap)를 직접 낸다.
  // Suppressing mousedown to protect the caret also kills the browser's :active, so pressed feedback (.nabi-tap) is drawn manually instead.
  const releaseMouse = suppressMousedownTap(button);
  let releaseTouch = (): void => {};
  const onClick = (event: MouseEvent): void => {
    event.preventDefault();
    // 손 판정은 detail 하나다 — 키보드가 만든 클릭(Enter/Space·el.click())은 0이고 진짜 포인터는 1 이상이다.
    // The hand is decided by `detail` alone — a keyboard-made click (Enter/Space, el.click()) is 0, a real pointer is 1 or more.
    press(event.detail === 0 ? 'keyboard' : 'pointer');
  };
  try {
    releaseTouch = wireTouchTap(button, press);
    button.addEventListener('click', onClick);
  } catch (error) {
    releaseTouch();
    releaseMouse();
    throw error;
  }
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    releaseTouch();
    releaseMouse();
    button.removeEventListener('click', onClick);
  };
}

function wireTouchTap(button: HTMLElement, press: (by: CommandHand) => void): () => void {
  const owner = button.ownerDocument;
  const navigator = owner.defaultView?.navigator;
  if (!navigator || !isIos(navigator.userAgent, navigator.platform ?? '', navigator.maxTouchPoints ?? 0))
    return () => {};

  let start: { id: number; x: number; y: number; time: number } | null = null;
  const clear = (): void => {
    start = null;
  };
  const onStart = (event: TouchEvent): void => {
    clear();
    if (event.touches.length !== 1 || button.matches(':disabled, [aria-disabled="true"]')) return;
    const touch = event.touches[0]!;
    start = { id: touch.identifier, x: touch.clientX, y: touch.clientY, time: event.timeStamp };
  };
  const matches = (touch: Touch): boolean =>
    start !== null &&
    touch.identifier === start.id &&
    Math.hypot(touch.clientX - start.x, touch.clientY - start.y) <= 10;
  const onMove = (event: TouchEvent): void => {
    if (event.touches.length !== 1 || !matches(event.touches[0]!)) clear();
  };
  const onEnd = (event: TouchEvent): void => {
    const touch = event.changedTouches[0];
    const valid =
      start !== null &&
      event.touches.length === 0 &&
      event.changedTouches.length === 1 &&
      touch !== undefined &&
      matches(touch) &&
      event.timeStamp - start.time < 500;
    clear();
    if (!valid || !touch || !event.cancelable || event.defaultPrevented || !button.isConnected) return;
    if (button.matches(':disabled, [aria-disabled="true"]')) return;
    const hit = owner.elementFromPoint(touch.clientX, touch.clientY);
    if (!hit || !button.contains(hit)) return;
    // iOS 선택 메뉴가 합성 클릭을 삼킬 수 있어 완료된 탭을 직접 한 번 처리한다.
    // iOS selection menus can consume the synthetic click; cancel it and handle the completed tap once.
    event.preventDefault();
    tap(button);
    press('pointer');
  };
  const release = (): void => {
    clear();
    button.removeEventListener('touchstart', onStart);
    button.removeEventListener('touchmove', onMove);
    button.removeEventListener('touchend', onEnd);
    button.removeEventListener('touchcancel', clear);
  };
  try {
    button.addEventListener('touchstart', onStart, { passive: true });
    button.addEventListener('touchmove', onMove, { passive: true });
    button.addEventListener('touchend', onEnd, { passive: false });
    button.addEventListener('touchcancel', clear);
  } catch (error) {
    release();
    throw error;
  }
  return release;
}

export function suppressMousedownTap(element: HTMLElement): () => void {
  const onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    tap(element);
  };
  element.addEventListener('mousedown', onMouseDown);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    clearTap(element);
    element.removeEventListener('mousedown', onMouseDown);
  };
}

// 눌렀다 뗀 티 — 시트가 그리는 짧은 움직임(`.nabi-tap`). 애니메이션이 끝나면 스스로 걷힌다. 연타에도 매번 다시 시작해야 하므로 표식을 한 번 걷고 강제로 리플로를 태운 뒤 다시 단다.
// A brief "pressed" flash (`.nabi-tap`), drawn by the stylesheet and self-clearing when the animation ends. A rapid repeat needs the class removed and a reflow forced before re-adding it, or it won't restart.
const TAP_CLASS = 'nabi-tap';
// 시트의 220ms 애니메이션 + 여유.
// The sheet's 220ms animation, plus margin.
const TAP_MS = 260;
interface TapState {
  readonly done: () => void;
  readonly owner: Window & typeof globalThis;
  timer: number | null;
}
const tapStates = new WeakMap<HTMLElement, TapState>();

function clearTap(button: HTMLElement): void {
  const state = tapStates.get(button);
  if (!state) return;
  if (state.timer !== null) state.owner.clearTimeout(state.timer);
  button.removeEventListener('animationend', state.done);
  button.classList.remove(TAP_CLASS);
  tapStates.delete(button);
}

function tap(button: HTMLElement): void {
  clearTap(button);
  // 리플로를 강제한다 — 없으면 같은 애니메이션이 다시 안 돈다.
  // Forces a reflow — without it, the same animation can't restart.
  void button.offsetWidth;
  button.classList.add(TAP_CLASS);
  // 시계로도 걷는다 — animationend는 애니메이션이 아예 안 도는 자리(화면 밖, 움직임 끄기 시트를 안 건 호스트)에서는 오지 않는다.
  // A timer backs this up too — animationend never fires where the animation can't run at all (offscreen, or a host without the reduced-motion stylesheet).
  const owner = button.ownerDocument.defaultView;
  if (!owner) {
    button.classList.remove(TAP_CLASS);
    return;
  }
  const done = (): void => clearTap(button);
  const state: TapState = { done, owner, timer: null };
  tapStates.set(button, state);
  button.addEventListener('animationend', done, { once: true });
  state.timer = owner.setTimeout(done, TAP_MS);
}

// 눌림 표시 한 벌 — 클래스와 `aria-pressed` 가 늘 같이 간다(하나만 바꾸면 화면과 낭독이 갈린다).
// The pressed state travels as a pair — class and `aria-pressed` always move together, or the visuals and screen reader would disagree.
export function setPressed(button: HTMLElement, on: boolean): void {
  button.classList.toggle('on', on);
  button.setAttribute('aria-pressed', on ? 'true' : 'false');
}
