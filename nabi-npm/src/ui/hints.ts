// 힌트는 버튼만 누른다 — fallback 없이(옛 판은 버튼을 못 찾으면 커맨드를 직접 불러 안 보이는 버튼이 눌렸다). 배지는 새 요소가 아니라 크롬 클래스 + `[data-hint]::before` 로 그린다.
// Hints only press real buttons, no fallback (the old version could invoke a command via a hidden button when it couldn't find one). The badge itself is a chrome class painted by `[data-hint]::before`, not a new element.
import { focusQuiet } from './parts/dom.js';
import { TAP_MS } from '../surface/actions.js';
import { acquireGestureRoot, activateGestureRoot, ownsActiveGestureRoot, ownsGestureRoot } from '../lifecycle.js';
import type { ContextToolbar } from './context.js';
import type { Toolbar } from './toolbar.js';

const HINTING = 'nabi-hinting';
const KBD = 'nabi-kbd';

export interface HintOptions {
  readonly toolbar: Toolbar;
  readonly context?: ContextToolbar;
  // 배지 클래스가 붙는 자리 — 툴바와 상황 줄을 함께 품은 크롬이 알맞다.
  // Where the badge class gets attached — the chrome holding both the toolbar and context row.
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
  (target as Node | null)?.nodeType === 1 &&
  ((target as Element).tagName === 'INPUT' || (target as Element).tagName === 'TEXTAREA');

// 이 편집기의 땅인가 — 표면과 크롬(툴바·상황 줄)이 한 섬이다. 한 장에 편집기가 둘 이상 있으면, 문서에 캡처로 붙는 힌트 리스너가 저마다 같은 키를 먹어 양쪽에서 같이 반응한다.
// Is this target inside this editor's island (surface + toolbar chrome)? With two or more editors on one page, hint listeners are document-captured, so an unscoped check would let every editor react to the same keystroke.
const inside = (root: Node, target: EventTarget | null): boolean =>
  target !== null &&
  typeof (target as Node).nodeType === 'number' &&
  (target === root || root.contains(target as Node));

export function mountHints(options: HintOptions): Hints {
  const owner = options.root.ownerDocument;
  const releaseRoot = acquireGestureRoot(options.root, options.surface ? [options.surface] : []);
  try {
    let releaseActive = (): void => {};
    // 두 번째 두드림까지 참아 주는 시간.
    // How long to wait for the second tap.
    const tapWindow = options.tapMs ?? TAP_MS;

    let active = false;
    let taps = 0;
    let lastTapAt = 0;
    let navAt = -1;
    let refocus = false;

    // 힌트 글자 → 그 버튼. 툴바가 돌려준 공식 목록에서만 짓는다.
    // Hint letter to its button, built only from the toolbar's official button list.
    const byCode = new Map<string, Toolbar['buttons'][number]>();
    for (const button of options.toolbar.buttons) {
      if (!button.shortcut) continue;
      const code =
        button.shortcut === '↑'
          ? 'ArrowUp'
          : button.shortcut === '↓'
            ? 'ArrowDown'
            : /[0-9]/.test(button.shortcut)
              ? `Digit${button.shortcut}`
              : `Key${button.shortcut}`;
      byCode.set(code, button);
    }

    const navButtons = (): readonly HTMLButtonElement[] => options.context?.buttons() ?? [];

    const paintNav = (): void => {
      const list = navButtons();
      list.forEach((el, i) => el.classList.toggle(KBD, i === navAt));
    };

    const show = (): void => {
      if (active) return;
      active = true;
      releaseActive();
      releaseActive = activateGestureRoot(options.root, options.surface ?? options.root, () => {
        refocus = false;
        hide();
      });
      navAt = -1;
      options.root.classList.add(HINTING);
      // 편집기에서 포커스를 떼어 놓는다 — IME가 물고 있으면 다음 글자가 조합으로 빨려 들어가 물리 키가 안 온다. 겨눔의 정본은 트리라 포커스가 떠도 안 사라진다.
      // Focus is deliberately moved off the editor — a live IME would swallow the next keystroke into composition. Selection lives in the tree, so it survives losing focus.
      if (owner.activeElement === options.surface && options.surface) {
        refocus = true;
        options.surface.blur();
      }
    };

    const hide = (): void => {
      if (!active) return;
      active = false;
      releaseActive();
      releaseActive = (): void => {};
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
      const at = groups.findIndex(
        (group) => current !== undefined && group.buttons.includes(current as HTMLButtonElement),
      );
      const next = groups[((at < 0 ? 0 : at) + delta + groups.length) % groups.length];
      const first = next?.buttons[0];
      if (!first) return;
      navAt = list.indexOf(first);
      paintNav();
    };

    // 이 키가 내 것인가 — 켜진 뒤에는(포커스를 일부러 뗐으므로) target이 문서 몸통이라도 내 것이다. 켜지기 전이라면 겨눔이 이 섬 안에 있을 때만 센다.
    // Whether this key belongs to this mount. Once active (focus was deliberately dropped), a body-shaped target still counts; before that, only a selection inside this island does.
    const mine = (target: EventTarget | null): boolean => {
      if (inside(options.root, target) || (options.surface !== undefined && inside(options.surface, target)))
        return ownsGestureRoot(options.root, target, options.surface ?? options.root);
      // 실제 남의 땅을 겨눈 target은 이 힌트 층보다 항상 앞선다 — active는 이 마운트가 일부러 블러한 뒤 남은 몸통 모양 target만 품는다.
      // An actual foreign target always wins over this mount's active hint layer — `active` only owns the body-shaped target left behind when this mount deliberately blurred its own surface.
      if (target === owner.body || target === owner.documentElement || target === owner)
        return active && ownsActiveGestureRoot(options.root, options.surface ?? options.root);
      if (target !== null && typeof (target as Node).nodeType === 'number') return false;
      return (
        active &&
        ownsActiveGestureRoot(options.root, options.surface ?? options.root) &&
        (options.surface === undefined || owner.activeElement === owner.body || owner.activeElement === null)
      );
    };

    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      // IME 철칙 — 조합 중에는 아무것도 안 센다.
      // IME rule — nothing counts while composing.
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
        // A third tap falls into the same branch — it just stays active (covers mobile caps-lock overlap).
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

      const hinted = byCode.get(key.code);
      if (hinted && !hinted.el.hidden && !key.metaKey && !key.ctrlKey && !key.altKey) {
        // 조합이 시작되기 전에 막는다 — 이 키는 글자가 아니라 몸짓이다.
        // Blocked before composition can start — this key is a gesture, not a character.
        event.preventDefault();
        hide();
        hinted.press();
        return;
      }

      // 상황 줄 걸음 — 공식 목록 위를 걷는다.
      // Context row navigation — walks the official button list.
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

      hide();
    };

    // 어딘가를 누르면 배지를 걷는다. 다만 남의 땅을 눌렀으면 겨눔을 도로 뺏지 않는다 — 옆 편집기로 가는 누름을 우리가 가로채면 안 된다.
    // Any pointer press hides the badges, but a press on foreign ground doesn't reclaim selection — we must not intercept a click headed for another editor.
    const onDown = (event: Event): void => {
      if (
        refocus &&
        !inside(options.root, event.target) &&
        !(options.surface !== undefined && inside(options.surface, event.target))
      ) {
        refocus = false;
      }
      hide();
    };

    owner.addEventListener('keydown', onKey, true);
    owner.addEventListener('pointerdown', onDown, true);
    const onFocus = (event: Event): void => {
      if (active && !mine(event.target)) {
        refocus = false;
        hide();
      }
    };
    owner.addEventListener('focusin', onFocus, true);

    return {
      active: () => active,
      hide,
      unmount() {
        hide();
        releaseRoot();
        owner.removeEventListener('keydown', onKey, true);
        owner.removeEventListener('pointerdown', onDown, true);
        owner.removeEventListener('focusin', onFocus, true);
      },
    };
  } catch (error) {
    try {
      releaseRoot();
    } catch {}
    throw error;
  }
}
