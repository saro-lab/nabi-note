import { DisposerStack, HostElementLease } from '../lifecycle.js';
import type { Rect } from './band.js';
import { focusQuiet } from './parts/dom.js';

export interface DockViewportState {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly layoutHeight: number;
  readonly keyboardHeight: number;
  readonly lastKeyboardHeight: number;
  readonly keyboardOpen: boolean;
  readonly composing: boolean;
}

export interface DockViewportOptions {
  readonly surface: HTMLElement;
  readonly onChange?: (state: DockViewportState) => void;
}

export interface DockViewport {
  read(): DockViewportState;
  preparePanel(panel: HTMLElement): void;
  cancelPanel(): void;
  restore(): void;
  unmount(): void;
}

const positive = (value: number | undefined): number =>
  value !== undefined && Number.isFinite(value) ? Math.max(0, value) : 0;

export function visibleViewportRect(owner: Document): Rect {
  const view = owner.defaultView;
  const visual = view?.visualViewport;
  const height = positive(visual?.height ?? view?.innerHeight ?? owner.documentElement.clientHeight);
  const offset = positive(visual?.offsetTop);
  if (!offset || !owner.body) return { top: offset, bottom: offset + height };
  const probe = owner.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
  owner.body.append(probe);
  try {
    const top = probe.getBoundingClientRect().top + offset;
    return { top, bottom: top + height };
  } finally {
    probe.remove();
  }
}

export function watchDockViewport(options: DockViewportOptions): DockViewport {
  const surface = options.surface;
  const onChange = options.onChange;
  const owner = surface.ownerDocument;
  const view = owner.defaultView;
  const visual = view?.visualViewport ?? null;
  const lifecycle = new DisposerStack();
  let disposed = false;
  let composing = false;
  let baselineHeight = 0;
  let baselineWidth = 0;
  let keyboardOpen = false;
  let lastKeyboardHeight = 0;
  let pendingPanel: HTMLElement | null = null;
  let panelLease: HostElementLease | null = null;
  let generation = 0;
  let closeTimer: number | null = null;
  let closeSettled = false;
  const cancelClose = (): void => {
    if (closeTimer !== null) view?.clearTimeout(closeTimer);
    closeTimer = null;
  };
  const afterKeyboardClose = (): void => {
    cancelClose();
    if (!view) return;
    closeTimer = view.setTimeout(() => {
      closeTimer = null;
      closeSettled = true;
      update();
    }, 180);
  };

  const snapshot = (): DockViewportState => {
    const scale = positive(visual?.scale) || 1;
    const width = positive(visual?.width ?? view?.innerWidth ?? owner.documentElement.clientWidth);
    const height = positive(visual?.height ?? view?.innerHeight ?? owner.documentElement.clientHeight);
    const layoutWidth = Math.max(
      positive(view?.innerWidth),
      positive(owner.documentElement.clientWidth),
      width * scale,
    );
    const layoutHeight = Math.max(
      positive(view?.innerHeight),
      positive(owner.documentElement.clientHeight),
      height * scale,
    );
    const resized = baselineWidth > 0 && Math.abs(layoutWidth - baselineWidth) > Math.max(40, baselineWidth * 0.15);
    if (!baselineHeight || resized) {
      baselineHeight = layoutHeight;
      if (resized) lastKeyboardHeight = 0;
    } else baselineHeight = Math.max(baselineHeight, layoutHeight);
    baselineWidth = layoutWidth;
    const active = owner.activeElement;
    const editing = active === surface || (active !== null && surface.contains(active));
    const touch = (view?.navigator.maxTouchPoints ?? 0) > 0 || view?.matchMedia?.('(pointer: coarse)').matches === true;
    const visibleHeight = height * scale;
    const directGap = Math.max(0, layoutHeight - visibleHeight);
    const resizedGap =
      touch && (editing || keyboardOpen || pendingPanel !== null) ? Math.max(0, baselineHeight - visibleHeight) : 0;
    const gap = Math.max(directGap, resizedGap);
    const wasOpen = keyboardOpen;
    const threshold = Math.max(120, baselineHeight * 0.15);
    keyboardOpen = gap >= threshold || (wasOpen && gap > 1 && !closeSettled && view !== null);
    if (keyboardOpen && gap < threshold) afterKeyboardClose();
    else cancelClose();
    closeSettled = false;
    const keyboardHeight = keyboardOpen ? Math.round(gap) : 0;
    if (keyboardOpen) lastKeyboardHeight = wasOpen ? Math.max(lastKeyboardHeight, keyboardHeight) : keyboardHeight;
    if (!keyboardOpen && !editing && pendingPanel === null) baselineHeight = layoutHeight;
    return Object.freeze({
      top: positive(visual?.offsetTop),
      left: positive(visual?.offsetLeft),
      width,
      height,
      layoutHeight: baselineHeight,
      keyboardHeight,
      lastKeyboardHeight,
      keyboardOpen,
      composing,
    });
  };

  let state = snapshot();
  const update = (): void => {
    if (disposed) return;
    const next = snapshot();
    if (
      Object.keys(next).every((key) => next[key as keyof DockViewportState] === state[key as keyof DockViewportState])
    )
      return;
    state = next;
    onChange?.(state);
  };

  const focusPanel = (): void => {
    if (disposed || composing || !pendingPanel?.isConnected) return;
    if (pendingPanel.closest('[hidden]')) {
      cancelPanel();
      return;
    }
    const panel = pendingPanel;
    panelLease?.dispose();
    panelLease = new HostElementLease(panel);
    if (!panel.hasAttribute('tabindex') && panel.tabIndex < 0) panelLease.attribute('tabindex', '-1');
    const active = owner.activeElement;
    if (active === surface || (active !== null && surface.contains(active))) (active as HTMLElement).blur();
    if (disposed || pendingPanel !== panel || composing) return;
    if (!panel.contains(owner.activeElement)) focusQuiet(panel);
    update();
  };
  const cancelPanel = (): void => {
    if (disposed) return;
    generation += 1;
    pendingPanel = null;
    panelLease?.dispose();
    panelLease = null;
    update();
  };

  const afterComposition = (): void => {
    const current = generation;
    queueMicrotask(() => {
      if (!disposed && generation === current && !composing) focusPanel();
    });
  };
  const compositionStart = (): void => {
    composing = true;
    update();
  };
  const compositionEnd = (): void => {
    composing = false;
    update();
    afterComposition();
  };
  const blur = (): void => {
    if (composing) {
      composing = false;
      afterComposition();
    }
    update();
  };
  const orientation = (): void => {
    baselineHeight = 0;
    baselineWidth = 0;
    lastKeyboardHeight = 0;
    update();
  };
  const listen = (target: EventTarget | null, name: string, listener: () => void): void => {
    if (!target) return;
    target.addEventListener(name, listener);
    lifecycle.add(() => target.removeEventListener(name, listener));
  };
  lifecycle.add(cancelClose);
  lifecycle.add(() => panelLease?.dispose());
  try {
    listen(visual, 'resize', update);
    listen(visual, 'scroll', update);
    listen(view, 'resize', update);
    listen(view, 'orientationchange', orientation);
    listen(view?.screen.orientation ?? null, 'change', orientation);
    listen(owner, 'focusin', update);
    listen(owner, 'focusout', update);
    listen(surface, 'compositionstart', compositionStart);
    listen(surface, 'compositionend', compositionEnd);
    listen(surface, 'blur', blur);
  } catch (error) {
    disposed = true;
    lifecycle.dispose();
    throw error;
  }
  return {
    read: () => state,
    preparePanel(panel) {
      if (disposed) return;
      if (panel.ownerDocument !== owner) throw new Error('Nabi dock panel belongs to another document');
      generation += 1;
      pendingPanel = panel;
      focusPanel();
    },
    cancelPanel,
    restore() {
      if (disposed) return;
      cancelPanel();
      focusQuiet(surface);
      update();
    },
    unmount() {
      if (disposed) return;
      disposed = true;
      generation += 1;
      pendingPanel = null;
      lifecycle.dispose();
    },
  };
}
