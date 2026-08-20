// 힌트 — Shift 를 두 번 두드리면 버튼마다 한 글자 배지가 뜨고, 그 글자를 누르면 그 버튼이 눌린다.
//
// 규칙 둘 (판정 19):
//   1. **버튼만 누른다** — fallback 이 없다. 툴바가 안 서 있으면 힌트도 없는 것이 맞다.
//      (옛 판은 버튼을 못 찾으면 커맨드를 직접 불렀고, 그래서 "안 보이는 버튼"이 눌렸다.)
//   2. 상황 줄 탐색은 **공식 API** 로 — mount 가 돌려준 목록을 본다. DOM 구조를 안 뒤진다.
//
// 배지는 요소를 새로 안 짓는다 — 크롬에 클래스 하나가 붙고, 시트가 `[data-hint]::before` 로 그린다.
import { focusQuiet } from './parts/dom.js';
import type { ContextToolbar } from './context.js';
import type { Toolbar } from './toolbar.js';

const TAP_MS = 350;
const HINTING = 'nabi-hinting';
const KBD = 'nabi-kbd';

export interface HintOptions {
  readonly toolbar: Toolbar;
  readonly context?: ContextToolbar;
  // 배지 클래스가 붙는 자리 — 툴바와 상황 줄을 함께 품은 크롬이 알맞다.
  readonly root: HTMLElement;
  readonly surface?: HTMLElement;
  readonly tapMs?: number;
}

export interface Hints {
  active(): boolean;
  hide(): void;
  unmount(): void;
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

// 이 편집기의 땅인가 — 표면과 크롬(툴바·상황 줄)이 한 섬이다.
//
// **한 장에 편집기가 둘 이상 설 수 있다.** 힌트는 문서에 캡처로 붙으므로 그냥 두면 편집기마다
// 달린 귀가 **같은 키를 저마다 한 번씩** 먹는다 — Shift 두 번에 배지가 양쪽에서 뜨고, 이어 친
// 글자가 양쪽 툴바의 단추를 눌러 표가 두 곳에 생기고 화면이 남의 편집기로 끌려간다.
const inside = (root: Node, target: EventTarget | null): boolean =>
  target instanceof Node && (target === root || root.contains(target));

export function mountHints(options: HintOptions): Hints {
  const owner = options.root.ownerDocument;
  // 두 번째 두드림까지 참아 주는 시간 — 이름이 window 면 전역을 가린다.
  const tapWindow = options.tapMs ?? TAP_MS;

  let active = false;
  let taps = 0;
  let lastTapAt = 0;
  let navAt = -1;
  let refocus = false;

  // 힌트 글자 → 그 버튼. 툴바가 돌려준 공식 목록에서만 짓는다.
  const byCode = new Map<string, () => void>();
  for (const button of options.toolbar.buttons) {
    if (!button.shortcut) continue;
    const code = /[0-9]/.test(button.shortcut) ? `Digit${button.shortcut}` : `Key${button.shortcut}`;
    byCode.set(code, () => {
      if (button.el.hidden) return; // 안 보이는 버튼은 눌리지 않는다
      button.press();
    });
  }

  const navButtons = (): readonly HTMLButtonElement[] => options.context?.buttons() ?? [];

  const paintNav = (): void => {
    const list = navButtons();
    list.forEach((el, i) => el.classList.toggle(KBD, i === navAt));
  };

  const show = (): void => {
    if (active) return;
    active = true;
    navAt = -1;
    options.root.classList.add(HINTING);
    // 편집기에서 포커스를 떼어 놓는다 — IME 가 물고 있으면 다음 글자가 조합으로 빨려 들어가
    // 물리 키가 안 온다. 겨눔의 정본은 트리라 포커스가 떠도 안 사라진다.
    if (owner.activeElement === options.surface && options.surface) {
      refocus = true;
      options.surface.blur();
    }
  };

  const hide = (): void => {
    if (!active) return;
    active = false;
    taps = 0;
    navAt = -1;
    options.root.classList.remove(HINTING);
    paintNav();
    if (refocus) {
      refocus = false;
      focusQuiet(options.surface);
    }
  };

  const step = (delta: number): void => {
    const list = navButtons();
    if (list.length === 0) return;
    const from = navAt < 0 ? (delta > 0 ? -1 : 0) : navAt;
    navAt = (from + delta + list.length) % list.length;
    paintNav();
  };

  const stepGroup = (delta: number): void => {
    const groups = (options.context?.groups() ?? []).filter((group) => group.buttons.length > 0);
    if (groups.length < 2) return;
    const list = navButtons();
    const current = navAt < 0 ? null : list[navAt];
    const at = groups.findIndex((group) => current !== undefined && group.buttons.includes(current as HTMLButtonElement));
    const next = groups[(((at < 0 ? 0 : at) + delta) + groups.length) % groups.length];
    const first = next?.buttons[0];
    if (!first) return;
    navAt = list.indexOf(first);
    paintNav();
  };

  // 이 키가 내 것인가. **켜져 있으면 내 것이다** — 켤 때 표면의 겨눔을 일부러 떼어 놓으므로
  // (IME 가 물면 다음 글자가 조합으로 빨려 든다) 그때부터 target 은 문서의 몸통이다. 켜지기
  // 전이라면 겨눔이 이 섬 안에 있을 때만 센다: 어느 편집기도 안 잡고 있는 Shift 두 번은
  // 누구의 것도 아니다(편집기가 둘이면 고를 근거가 없다).
  const mine = (target: EventTarget | null): boolean =>
    active ||
    inside(options.root, target) ||
    (options.surface !== undefined && inside(options.surface, target)) ||
    (options.surface !== undefined && owner.activeElement === options.surface);

  const onKey = (event: Event): void => {
    const key = event as KeyboardEvent;
    // IME 철칙 — 조합 중에는 아무것도 안 센다.
    if (key.isComposing || key.keyCode === 229) {
      taps = 0;
      return;
    }
    if (!mine(key.target)) {
      taps = 0;
      return;
    }
    if (isTyping(key.target)) {
      hide();
      taps = 0;
      return;
    }

    if (key.key === 'Shift') {
      if (key.repeat || key.metaKey || key.ctrlKey || key.altKey) {
        taps = 0;
        return;
      }
      const now = Date.now();
      taps = now - lastTapAt <= tapWindow ? taps + 1 : 1;
      lastTapAt = now;
      // 세 번째 두드림도 같은 갈래로 떨어진다 — 켜진 채로 있을 뿐이다(모바일 캡스락 겹침).
      if (taps >= 2) show();
      return;
    }

    taps = 0;
    if (!active) return;

    if (key.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }

    // 상황 줄 걸음 — 공식 목록 위를 걷는다.
    if (key.key === 'Tab' || key.key === 'ArrowRight' || key.key === 'ArrowLeft') {
      const back = key.key === 'ArrowLeft' || (key.key === 'Tab' && key.shiftKey);
      event.preventDefault();
      step(back ? -1 : 1);
      return;
    }
    if (key.key === 'ArrowDown' || key.key === 'ArrowUp') {
      event.preventDefault();
      stepGroup(key.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (key.key === 'Enter' && navAt >= 0) {
      const target = navButtons()[navAt];
      event.preventDefault();
      hide();
      target?.click();
      return;
    }

    const press = byCode.get(key.code);
    if (press && !key.metaKey && !key.ctrlKey && !key.altKey) {
      // 조합이 시작되기 전에 막는다 — 이 키는 글자가 아니라 몸짓이다.
      event.preventDefault();
      hide();
      press();
      return;
    }
    hide();
  };

  // 어딘가를 누르면 배지를 걷는다. 다만 **남의 땅을 눌렀으면 겨눔을 도로 뺏지 않는다**
  // 켤 때 떼어 둔 겨눔을 여기서 돌려주는데, 그 누름이 옆 편집기로 가는 길이면 우리가 가로챈다.
  const onDown = (event: Event): void => {
    if (refocus && !inside(options.root, event.target) && !(options.surface !== undefined && inside(options.surface, event.target))) {
      refocus = false;
    }
    hide();
  };

  owner.addEventListener('keydown', onKey, true);
  owner.addEventListener('pointerdown', onDown, true);

  return {
    active: () => active,
    hide,
    unmount() {
      hide();
      owner.removeEventListener('keydown', onKey, true);
      owner.removeEventListener('pointerdown', onDown, true);
    },
  };
}
