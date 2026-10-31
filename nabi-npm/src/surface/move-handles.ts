import { nodeAt } from '../doc/index.js';
import { hostOf, type Nabi } from '../editor/index.js';
import { isElement, isWrapper } from '../schema/index.js';
import type { Translator } from '../locale/index.js';
import type { Registry } from '../wing/index.js';
import { holderElOf, pathOfId } from './map.js';
import { moveBlockOp } from './media-move.js';
import { makeMovePreview } from './move-preview.js';
import type { makeMediaDrag } from './media-drag.js';

type Handle = { button: HTMLButtonElement; path: readonly number[]; element: HTMLElement };

export function mountMoveHandles(options: {
  nabi: Nabi;
  registry: Registry;
  root: HTMLElement;
  translator: Translator;
  drag: ReturnType<typeof makeMediaDrag>;
  canEdit(): boolean;
}): () => void {
  const { nabi, registry, root, translator, drag, canEdit } = options;
  const host = hostOf(nabi);
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const handles = new Map<string, Handle>();
  let frame = 0;
  let disposed = false;
  let preview: ReturnType<typeof makeMovePreview> | null = null;
  let gesture: {
    handle: Handle;
    pointer: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    moving: boolean;
  } | null = null;

  const update = (): void => {
    frame = 0;
    if (disposed || gesture) return;
    const active = owner.activeElement;
    const shell = root.closest('.nabi') ?? root;
    const visible =
      canEdit() &&
      root.isConnected &&
      (shell.contains(active) || [...handles.values()].some(({ button }) => button === active));
    const selection = nabi.getSelection();
    const wanted = new Set<string>();
    const style = view?.getComputedStyle(root);
    const placed: { left: number; top: number }[] = [];
    if (visible) {
      for (let depth = 1; depth <= selection.focus.path.length; depth += 1) {
        const path = selection.focus.path.slice(0, depth);
        if (!path.every((part, index) => selection.anchor.path[index] === part)) continue;
        const wrapper = nodeAt(host.doc(), path);
        const child = wrapper?.ch[0];
        if (!wrapper || !isWrapper(wrapper, host.env) || !isElement(child) || !wrapper._id || !child._id) continue;
        const container = ['float', 'table', 'details', 'code', 'quote'].includes(child.w);
        if (
          !container &&
          !(
            path.length === selection.focus.path.length &&
            selection.anchor.offset !== selection.focus.offset &&
            (child.w === 'img' || child.w === 'youtube')
          )
        )
          continue;
        const element = holderElOf(root, child._id);
        if (!element || !element.getClientRects().length) continue;
        const rect = element.getBoundingClientRect();
        const viewport = view?.visualViewport;
        const topEdge = viewport?.offsetTop ?? 0;
        const bottomEdge = topEdge + (viewport?.height ?? view?.innerHeight ?? 0);
        const rootRect = root.getBoundingClientRect();
        if (rect.top < Math.max(topEdge, rootRect.top) || rect.top >= Math.min(bottomEdge, rootRect.bottom)) continue;
        wanted.add(wrapper._id);
        let handle = handles.get(wrapper._id);
        if (!handle) {
          const button = owner.createElement('button');
          button.type = 'button';
          button.className = 'nabi-move-handle';
          button.dataset['nabiMove'] = child.w;
          button.setAttribute('aria-keyshortcuts', 'Alt+ArrowUp Alt+ArrowDown');
          button.innerHTML =
            '<svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true"><g fill="currentColor"><circle cx="6" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="18" cy="5" r="1.5"/><circle cx="6" cy="11" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="18" cy="11" r="1.5"/></g></svg>';
          handle = { button, path, element };
          handles.set(wrapper._id, handle);
          button.addEventListener('pointerdown', onDown);
          button.addEventListener('keydown', onKey);
          button.addEventListener('click', prevent);
          button.addEventListener('dragstart', prevent);
          button.addEventListener('contextmenu', prevent);
          owner.body.append(button);
        }
        handle.path = path;
        handle.element = element;
        const button = handle.button;
        const name = translator.pick(registry.wingOf(child.w)?.button?.label, child.w);
        const label = `${name}: ${translator.t('moveBlock')}`;
        button.setAttribute('aria-label', label);
        button.title = label;
        for (const token of [
          '--nabi-accent',
          '--nabi-bg',
          '--nabi-fg',
          '--nabi-line',
          '--nabi-font',
          '--nabi-font-fallback',
        ]) {
          button.style.setProperty(token, style?.getPropertyValue(token) ?? '');
        }
        const width = button.offsetWidth || 44;
        const height = button.offsetHeight || 28;
        let left = Math.max(
          rootRect.left,
          rect.left + Math.min(rect.width, rootRect.right - rect.left) / 2 - width / 2,
        );
        const top = Math.max(topEdge, rect.top - height + 4);
        while (placed.some((other) => Math.abs(other.top - top) < height && Math.abs(other.left - left) < width + 4)) {
          left += width + 4;
        }
        left = Math.max(
          viewport?.offsetLeft ?? 0,
          Math.min(left, (viewport?.offsetLeft ?? 0) + (viewport?.width ?? view?.innerWidth ?? 0) - width),
        );
        placed.push({ left, top });
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
        button.style.removeProperty('visibility');
      }
    }
    for (const [id, handle] of handles) {
      if (wanted.has(id)) continue;
      handle.button.remove();
      handles.delete(id);
    }
  };

  const schedule = (): void => {
    if (!disposed && !frame) frame = view?.requestAnimationFrame?.(update) ?? 0;
  };
  const prevent = (event: Event): void => event.preventDefault();
  const cancel = (): void => {
    const current = gesture;
    preview?.remove();
    preview = null;
    if (frame) view?.cancelAnimationFrame?.(frame);
    frame = 0;
    gesture = null;
    if (current) {
      current.handle.button.classList.remove('is-moving');
      if (current.handle.button.hasPointerCapture?.(current.pointer)) {
        current.handle.button.releasePointerCapture(current.pointer);
      }
      drag.end();
    }
    schedule();
  };

  const scroll = (): void => {
    frame = 0;
    const current = gesture;
    if (!current?.moving) return;
    if (!canEdit() || !drag.active()) {
      cancel();
      return;
    }
    const viewport = view?.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const bottom = top + (viewport?.height ?? view?.innerHeight ?? 0);
    const edge = 48;
    let scrolled = false;
    for (let element: HTMLElement | null = root; element; element = element.parentElement) {
      if (
        element.scrollHeight <= element.clientHeight ||
        !/(auto|scroll)/.test(view?.getComputedStyle(element).overflowY ?? '')
      )
        continue;
      const rect = element.getBoundingClientRect();
      const upper = Math.max(top, rect.top);
      const lower = Math.min(bottom, rect.bottom);
      const delta = current.y < upper + edge ? -12 : current.y > lower - edge ? 12 : 0;
      const before = element.scrollTop;
      if (delta) element.scrollTop += delta;
      if (element.scrollTop !== before) {
        scrolled = true;
        break;
      }
    }
    const delta = current.y < top + edge ? -12 : current.y > bottom - edge ? 12 : 0;
    if (delta && !scrolled) view?.scrollBy(0, delta);
    drag.overPointer(current.x, current.y);
    frame = view?.requestAnimationFrame?.(scroll) ?? 0;
  };

  function onDown(event: PointerEvent): void {
    if (gesture) {
      if (event.pointerId !== gesture.pointer) cancel();
      return;
    }
    if (event.button !== 0 || event.isPrimary === false || !canEdit()) return;
    const entry = [...handles.entries()].find(([, { button }]) => button === event.currentTarget);
    if (!entry) return;
    const [id, handle] = entry;
    const path = pathOfId(host.doc(), host.env, id);
    if (!path || !drag.beginPointer(path)) return;
    handle.path = path;
    event.preventDefault();
    gesture = {
      handle,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moving: false,
    };
    try {
      handle.button.setPointerCapture(event.pointerId);
    } catch {
      // 합성 이벤트에는 캡처할 활성 포인터가 없다.
      // Synthetic events have no active pointer to capture.
    }
  }
  const onMove = (event: PointerEvent): void => {
    const current = gesture;
    if (!current || current.pointer !== event.pointerId) return;
    event.preventDefault();
    current.x = event.clientX;
    current.y = event.clientY;
    if (!current.moving && Math.hypot(current.x - current.startX, current.y - current.startY) >= 6) {
      current.moving = true;
      preview = makeMovePreview(root, current.handle.element, current.startX, current.startY);
      current.handle.button.classList.add('is-moving');
      for (const { button } of handles.values()) button.style.visibility = 'hidden';
      if (frame) view?.cancelAnimationFrame?.(frame);
      frame = view?.requestAnimationFrame?.(scroll) ?? 0;
    }
    if (current.moving) {
      preview?.move(current.x, current.y);
      drag.overPointer(current.x, current.y);
    }
  };
  const onUp = (event: PointerEvent): void => {
    const current = gesture;
    if (!current || current.pointer !== event.pointerId) return;
    event.preventDefault();
    if (current.moving) drag.dropPointer(event.clientX, event.clientY);
    cancel();
    if (frame) view?.cancelAnimationFrame?.(frame);
    update();
  };
  const onCancel = (event: PointerEvent): void => {
    if (event.pointerId === gesture?.pointer) cancel();
  };
  const onOtherPointer = (event: PointerEvent): void => {
    if (gesture && event.pointerId !== gesture.pointer) cancel();
  };
  const onEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && gesture) {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
  };
  function onKey(event: KeyboardEvent): void {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || !canEdit()) return;
    const handle = [...handles.values()].find(({ button }) => button === event.currentTarget);
    if (!handle) return;
    event.preventDefault();
    const path = [...handle.path];
    const down = event.key === 'ArrowDown';
    path[path.length - 1] += down ? 1 : -1;
    if (host.applyRaw(moveBlockOp(handle.path, { path, offset: down ? 1 : 0 }), 'moveBlock')) {
      handle.button.focus({ preventScroll: true });
      if (frame) view?.cancelAnimationFrame?.(frame);
      update();
    }
  }

  const off = nabi.onChange((change) => {
    if (change.doc && gesture) cancel();
    schedule();
  });
  const offLocale = translator.onChange?.(schedule);
  const resize = view?.ResizeObserver ? new view.ResizeObserver(schedule) : null;
  for (let element: HTMLElement | null = root; element; element = element.parentElement) resize?.observe(element);
  owner.addEventListener('pointermove', onMove, { passive: false });
  owner.addEventListener('pointerup', onUp, { passive: false });
  owner.addEventListener('pointercancel', onCancel);
  owner.addEventListener('lostpointercapture', onCancel);
  owner.addEventListener('pointerdown', onOtherPointer, true);
  owner.addEventListener('keydown', onEscape, true);
  owner.addEventListener('focusin', schedule);
  owner.addEventListener('focusout', schedule);
  owner.addEventListener('scroll', schedule, true);
  root.addEventListener('load', schedule, true);
  view?.addEventListener('resize', schedule);
  view?.addEventListener('blur', cancel);
  view?.visualViewport?.addEventListener('resize', schedule);
  view?.visualViewport?.addEventListener('scroll', schedule);
  schedule();
  return () => {
    disposed = true;
    cancel();
    if (frame) view?.cancelAnimationFrame?.(frame);
    off();
    offLocale?.();
    resize?.disconnect();
    owner.removeEventListener('pointermove', onMove);
    owner.removeEventListener('pointerup', onUp);
    owner.removeEventListener('pointercancel', onCancel);
    owner.removeEventListener('lostpointercapture', onCancel);
    owner.removeEventListener('pointerdown', onOtherPointer, true);
    owner.removeEventListener('keydown', onEscape, true);
    owner.removeEventListener('focusin', schedule);
    owner.removeEventListener('focusout', schedule);
    owner.removeEventListener('scroll', schedule, true);
    root.removeEventListener('load', schedule, true);
    view?.removeEventListener('resize', schedule);
    view?.removeEventListener('blur', cancel);
    view?.visualViewport?.removeEventListener('resize', schedule);
    view?.visualViewport?.removeEventListener('scroll', schedule);
    for (const { button } of handles.values()) button.remove();
    handles.clear();
  };
}
