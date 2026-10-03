import { focusQuiet } from './parts/dom.js';
import { mountToolboxKeyboard, toolboxFor } from './parts/toolbox-keyboard.js';
import { TAP_MS } from '../surface/actions.js';
import {
  acquireGestureRoot,
  activateGestureRoot,
  DisposerStack,
  ownsActiveGestureRoot,
  ownsGestureRoot,
} from '../lifecycle.js';
import type { ContextToolbar } from './context.js';
import type { Toolbar } from './toolbar.js';

export interface HintOptions {
  readonly toolbar: Toolbar;
  readonly context?: ContextToolbar;
  // 키보드 접근 영역 — 툴바와 상황 줄을 함께 품은 크롬이 알맞다.
  // Keyboard access region, normally the chrome containing both toolbar rows.
  readonly root: HTMLElement;
  readonly surface?: HTMLElement;
  readonly tapMs?: number;
}

export interface Hints {
  active(): boolean;
  hide(): void;
  unmount(): void;
}

const inside = (root: Node, target: EventTarget | null): boolean =>
  target !== null &&
  typeof (target as Node).nodeType === 'number' &&
  (target === root || root.contains(target as Node));

const isTyping = (target: EventTarget | null, surface?: HTMLElement): boolean => {
  if ((target as Node | null)?.nodeType !== 1) return false;
  const el = target as Element;
  if (el.closest('input, textarea, select')) return true;
  const editable = el.closest('[contenteditable]');
  return (
    editable !== null && editable.getAttribute('contenteditable') !== 'false' && !(surface && inside(surface, target))
  );
};

export function mountHints(options: HintOptions): Hints {
  const owner = options.root.ownerDocument;
  const releaseRoot = acquireGestureRoot(options.root, options.surface ? [options.surface] : []);
  const lifecycle = new DisposerStack();
  lifecycle.add(releaseRoot);
  try {
    const toolbarRoot = options.toolbar.root;
    const keyboard = toolboxFor(toolbarRoot) ? null : mountToolboxKeyboard(options.root);
    lifecycle.add(() => keyboard?.unmount());
    const tapWindow = options.tapMs ?? TAP_MS;
    let dead = false;
    let fallback = false;
    let layer = false;
    let taps = 0;
    let lastTapAt = 0;
    let releaseActive = (): void => {};
    const active = (): boolean => !dead && (toolboxFor(toolbarRoot)?.active() ?? fallback);
    const releaseLayer = (): void => {
      releaseActive();
      releaseActive = (): void => {};
      layer = false;
    };
    lifecycle.add(releaseLayer);
    const hide = (restore: boolean): void => {
      taps = 0;
      releaseLayer();
      const toolbox = toolboxFor(toolbarRoot);
      if (toolbox?.active()) toolbox.close(restore);
      if (fallback) {
        fallback = false;
        if (restore) focusQuiet(options.surface);
      }
    };
    const show = (): void => {
      if (dead) return;
      if (!layer) {
        releaseActive = activateGestureRoot(options.root, options.surface ?? options.root, () => hide(false));
        layer = true;
      }
      const toolbox = toolboxFor(toolbarRoot);
      if (toolbox) toolbox.open();
      else {
        fallback = true;
        fallback = keyboard?.focusFirst() ?? false;
      }
      if (!active()) releaseLayer();
    };
    const mine = (target: EventTarget | null): boolean => {
      if (inside(options.root, target) || (options.surface !== undefined && inside(options.surface, target)))
        return ownsGestureRoot(options.root, target, options.surface ?? options.root);
      return (
        (target === owner.body || target === owner.documentElement || target === owner || target === null) &&
        active() &&
        ownsActiveGestureRoot(options.root, options.surface ?? options.root)
      );
    };
    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      if (layer && !active()) releaseLayer();
      if (
        key.defaultPrevented ||
        key.isComposing ||
        key.keyCode === 229 ||
        !mine(key.target) ||
        isTyping(key.target, options.surface)
      ) {
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
        if (taps >= 2) {
          taps = 0;
          key.preventDefault();
          show();
        }
        return;
      }
      taps = 0;
      if (key.key === 'Escape' && !key.metaKey && !key.ctrlKey && !key.altKey && active()) {
        key.preventDefault();
        key.stopPropagation();
        hide(true);
      }
    };
    const onDown = (event: Event): void => {
      taps = 0;
      if (active() && !inside(options.root, event.target)) hide(false);
      else if (layer && !active()) releaseLayer();
    };
    const onFocus = (event: Event): void => {
      if (active() && !mine(event.target)) hide(false);
      else if (layer && !active()) releaseLayer();
    };
    for (const [name, listener] of [
      ['keydown', onKey],
      ['pointerdown', onDown],
      ['focusin', onFocus],
    ] as const) {
      owner.addEventListener(name, listener, true);
      lifecycle.add(() => owner.removeEventListener(name, listener, true));
    }
    return {
      active,
      hide: () => {
        if (!dead) hide(true);
      },
      unmount() {
        if (dead) return;
        hide(false);
        dead = true;
        lifecycle.dispose();
      },
    };
  } catch (error) {
    lifecycle.dispose();
    throw error;
  }
}
