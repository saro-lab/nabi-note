import { DisposerStack, HostElementLease } from '../lifecycle.js';
import { makeTranslator, localeDirection, type LocaleInput } from '../locale/index.js';
import { attachHeadingNumbers, headingElements, headingText } from '../style/headings.js';
import { bindOutlinePointer } from './outline-pointer.js';

export interface OutlineItem {
  readonly element: HTMLElement;
  readonly text: string;
  readonly level: 1 | 2;
  readonly number: number | null;
}

export interface OutlineState {
  readonly items: readonly OutlineItem[];
  readonly activeIndex: number;
  readonly available: boolean;
  readonly open: boolean;
}

export type OutlineCloseReason = 'selection' | 'outside' | 'escape' | 'empty';
export interface OutlineOptions {
  readonly trigger?: HTMLElement;
  readonly container?: HTMLElement;
  readonly anchor?: HTMLElement;
  readonly placement?: 'above' | 'beside' | 'css';
  readonly scrollContainer?: HTMLElement | Window | (() => HTMLElement | Window);
  readonly offset?: number | (() => number);
  readonly locale?: LocaleInput;
  readonly onChange?: (state: OutlineState) => void;
  readonly onAvailabilityChange?: (available: boolean) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: OutlineCloseReason) => void;
  readonly onError?: (error: unknown) => void;
}

export interface OutlineAttachment {
  readonly panel: HTMLElement;
  getState(): OutlineState;
  getItems(): readonly OutlineItem[];
  subscribe(listener: (state: OutlineState) => void): () => void;
  refresh(): void;
  goTo(index: number, behavior?: ScrollBehavior): boolean;
  setOpen(open: boolean): void;
  toggle(): void;
  unmount(): void;
}

const mounts = new WeakSet<HTMLElement>();
let sequence = 0;

export function mountOutline(root: HTMLElement, options: OutlineOptions = {}): OutlineAttachment {
  const lifecycle = new DisposerStack();
  try {
    return createOutline(root, options, lifecycle);
  } catch (error) {
    lifecycle.dispose();
    throw error;
  }
}

function createOutline(root: HTMLElement, options: OutlineOptions, lifecycle: DisposerStack): OutlineAttachment {
  if (mounts.has(root)) throw new Error('An outline is already mounted on this root');
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  if (!view) throw new Error('An outline needs a document window');
  const container = options.container ?? root.parentElement ?? owner.body;
  if (container === root || root.contains(container))
    throw new Error('The outline container must be outside its document root');
  if (container.ownerDocument !== owner || (options.trigger?.ownerDocument && options.trigger.ownerDocument !== owner))
    throw new Error('The outline and its trigger must share a document');
  mounts.add(root);
  lifecycle.add(() => mounts.delete(root));
  const translator = makeTranslator(options.locale);
  const numberer = attachHeadingNumbers(root);
  lifecycle.add(() => numberer.unmount());
  const rootLease = new HostElementLease(root);
  lifecycle.add(() => rootLease.dispose());
  rootLease.attribute('data-nabi-outline-root', '');
  const panel = owner.createElement('div');
  panel.className = 'nabi-outline';
  panel.id = `nabi-outline-${++sequence}`;
  panel.setAttribute('role', 'dialog');
  panel.tabIndex = -1;
  panel.hidden = true;
  panel.dataset['state'] = 'closed';
  const edge = (direction: number): HTMLButtonElement => {
    const button = owner.createElement('button');
    button.type = 'button';
    button.className = 'nabi-outline-edge';
    button.dataset['nabiOutlineScroll'] = String(direction);
    button.textContent = direction < 0 ? '▴' : '▾';
    button.hidden = true;
    return button;
  };
  const up = edge(-1);
  const down = edge(1);
  const list = owner.createElement('ol');
  list.className = 'nabi-outline-list';
  panel.append(up, list, down);
  container.append(panel);
  lifecycle.add(() => panel.remove());
  const trigger = options.trigger;
  const triggerLease = trigger ? new HostElementLease(trigger) : undefined;
  lifecycle.add(() => triggerLease?.dispose());
  triggerLease?.attribute('aria-controls', panel.id);
  triggerLease?.attribute('aria-haspopup', 'dialog');
  triggerLease?.attribute('aria-expanded', 'false');
  let items: readonly OutlineItem[] = [];
  let activeIndex = -1;
  let navigationScroll: { target: HTMLElement | Window; top: number } | undefined;
  let open = false;
  let disposed = false;
  let frame = 0;
  let recollect = false;
  let transitionFrame = 0;
  let transitionTimer = 0;
  let transitionVersion = 0;
  let lastState: OutlineState | undefined;
  let pointer: ReturnType<typeof bindOutlinePointer> | undefined;
  const listeners = new Set<(state: OutlineState) => void>();
  lifecycle.add(() => {
    disposed = true;
    pointer?.unmount();
    view.cancelAnimationFrame(frame);
    view.cancelAnimationFrame(transitionFrame);
    view.clearTimeout(transitionTimer);
    transitionVersion += 1;
    if (panel.contains(owner.activeElement)) (owner.activeElement as HTMLElement).blur();
    listeners.clear();
  });
  const invoke = (callback: (() => void) | undefined): void => {
    try {
      callback?.();
    } catch (error) {
      try {
        options.onError?.(error);
      } catch {
        return;
      }
    }
  };
  const state = (): OutlineState => Object.freeze({ items, activeIndex, available: items.length > 0, open });
  const publish = (): void => {
    if (disposed) return;
    const next = state();
    const previous = lastState;
    if (previous?.items === next.items && previous.activeIndex === next.activeIndex && previous.open === next.open)
      return;
    lastState = next;
    invoke(() => options.onChange?.(next));
    if (lastState !== next || disposed) return;
    if (previous?.available !== next.available) invoke(() => options.onAvailabilityChange?.(next.available));
    if (lastState !== next || disposed) return;
    if (previous?.open !== next.open) invoke(() => options.onOpenChange?.(next.open));
    for (const listener of [...listeners]) {
      if (lastState !== next || disposed) break;
      invoke(() => listener(next));
    }
  };
  const scroller = (): HTMLElement | Window =>
    typeof options.scrollContainer === 'function' ? options.scrollContainer() : (options.scrollContainer ?? view);
  const offset = (): number => {
    const value = typeof options.offset === 'function' ? options.offset() : options.offset;
    return Math.max(0, value ?? (parseFloat(view.getComputedStyle(owner.documentElement).fontSize) || 16));
  };
  const isElement = (value: HTMLElement | Window): value is HTMLElement => 'nodeType' in value;
  const paintActive = (): void => {
    for (const button of list.querySelectorAll<HTMLElement>('[data-nabi-outline-index]')) {
      if (Number(button.dataset['nabiOutlineIndex']) === activeIndex) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    }
  };
  const reveal = (button: HTMLElement | null): void => {
    if (!button) return;
    const box = list.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.top < box.top) list.scrollTop -= box.top - item.top;
    else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom;
  };
  const revealActive = (): void => {
    if (open && !pointer?.isNavigating()) reveal(list.querySelector<HTMLElement>('[aria-current]'));
  };
  const overflow = (): void => {
    if (!open) return;
    const hasOverflow = list.scrollHeight > list.clientHeight + 1;
    up.hidden = down.hidden = !hasOverflow;
    up.setAttribute('aria-disabled', String(activeIndex <= 0));
    down.setAttribute('aria-disabled', String(activeIndex >= items.length - 1));
    panel.toggleAttribute('data-overflow', hasOverflow);
  };
  const position = (): void => {
    if (!open) return;
    const computed = view.getComputedStyle(root);
    panel.dir = computed.direction || localeDirection(translator.locale);
    for (const name of Array.from(computed)) {
      if (name.startsWith('--nabi-')) panel.style.setProperty(name, computed.getPropertyValue(name));
    }
    if (options.placement === 'css') {
      overflow();
      return;
    }
    const viewport = view.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? owner.documentElement.clientWidth;
    const height = viewport?.height ?? view.innerHeight;
    const rem = parseFloat(view.getComputedStyle(owner.documentElement).fontSize) || 16;
    const gap = rem * 0.5;
    panel.style.maxWidth = `${Math.max(0, width - gap * 2)}px`;
    const anchor = (options.anchor ?? trigger)?.getBoundingClientRect();
    let available = height - gap * 2;
    if (anchor && options.placement !== 'beside') available = anchor.top - top - gap * 2;
    if (available < rem * 5) available = height - gap * 2;
    panel.style.setProperty('--nabi-outline-available-height', `${Math.max(0, available)}px`);
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;
    let x = anchor ? (panel.dir === 'rtl' ? anchor.left : anchor.right - panelWidth) : left + width - panelWidth - gap;
    let y = anchor ? anchor.top - panelHeight - gap : top + height - panelHeight - gap;
    if (anchor && options.placement === 'beside') {
      x = panel.dir === 'rtl' ? anchor.left - panelWidth - gap : anchor.right + gap;
      y = anchor.top;
    }
    panel.style.left = `${Math.max(left + gap, Math.min(x, left + width - panelWidth - gap))}px`;
    panel.style.top = `${Math.max(top + gap, Math.min(y, top + height - panelHeight - gap))}px`;
    overflow();
  };
  const locate = (): void => {
    if (pointer?.isNavigating()) return;
    const scroll = scroller();
    const element = isElement(scroll) ? scroll : null;
    const scrollTop = element ? element.scrollTop : view.scrollY;
    if (navigationScroll?.target === scroll && Math.abs(navigationScroll.top - scrollTop) < 1) return;
    navigationScroll = undefined;
    const line = (element ? element.getBoundingClientRect().top + element.clientTop : 0) + offset();
    let active = -1;
    for (let index = 0; index < items.length; index += 1) {
      if (items[index]!.element.getBoundingClientRect().top <= line + 1) active = index;
    }
    const scrolling = element ?? owner.scrollingElement ?? owner.documentElement;
    const height = element ? element.clientHeight : view.innerHeight;
    if (scrollTop > 0 && scrollTop + height >= scrolling.scrollHeight - 2) active = items.length - 1;
    if (activeIndex !== active) {
      activeIndex = active;
      paintActive();
      revealActive();
    }
  };
  const goTo = (index: number, behavior: ScrollBehavior = 'smooth'): boolean => {
    const item = items[index];
    if (disposed || !item?.element.isConnected) return false;
    const scroll = scroller();
    const element = isElement(scroll) ? scroll : null;
    const top = Math.max(
      0,
      item.element.getBoundingClientRect().top -
        (element ? element.getBoundingClientRect().top + element.clientTop : 0) +
        (element ? element.scrollTop : view.scrollY) -
        offset(),
    );
    const motion = view.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior;
    scroll.scrollTo({ top, behavior: motion });
    navigationScroll =
      motion === 'instant' ? { target: scroll, top: element ? element.scrollTop : view.scrollY } : undefined;
    activeIndex = index;
    paintActive();
    overflow();
    publish();
    return true;
  };
  const step = (direction: number): boolean => {
    const next = Math.max(0, Math.min(items.length - 1, activeIndex + direction));
    if (next === activeIndex || !goTo(next, 'instant')) return false;
    reveal(list.querySelector<HTMLElement>('[aria-current]'));
    return true;
  };
  const transition = (opening: boolean): void => {
    const version = ++transitionVersion;
    view.cancelAnimationFrame(transitionFrame);
    view.clearTimeout(transitionTimer);
    panel.hidden = false;
    panel.inert = !opening;
    panel.dataset['state'] = opening ? 'opening' : 'closing';
    void panel.offsetHeight;
    transitionFrame = view.requestAnimationFrame(() => {
      transitionFrame = 0;
      if (disposed || version !== transitionVersion) return;
      if (opening) panel.dataset['state'] = 'open';
      const animations = panel
        .getAnimations()
        .filter((animation) => (animation.effect as KeyframeEffect | null)?.target === panel);
      const finish = (): void => {
        if (disposed || version !== transitionVersion) return;
        view.clearTimeout(transitionTimer);
        if (!opening) {
          panel.hidden = true;
          panel.dataset['state'] = 'closed';
        }
      };
      const duration = Math.max(
        0,
        ...animations.map((animation) => {
          const end = Number(animation.effect?.getComputedTiming().endTime);
          return Number.isFinite(end) ? end : 0;
        }),
      );
      transitionTimer = view.setTimeout(finish, duration + 50);
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(finish);
    });
  };
  const setOpen = (next: boolean): void => {
    if (disposed) return;
    next = next && items.length > 0;
    if (open === next) return;
    open = next;
    pointer?.unmount();
    pointer = undefined;
    triggerLease?.attribute('aria-expanded', String(open));
    transition(open);
    if (open) {
      position();
      pointer = bindOutlinePointer(
        panel,
        list,
        (index) => goTo(index, 'instant'),
        step,
        () => requestClose('selection'),
      );
      const current = list.querySelector<HTMLElement>('[aria-current]') ?? list.querySelector<HTMLElement>('button');
      current?.focus({ preventScroll: true });
      if (current) list.scrollTop = Math.max(0, current.offsetTop - list.offsetTop - list.clientHeight / 2);
      overflow();
    } else if (panel.contains(owner.activeElement)) {
      if (trigger?.isConnected && !trigger.hidden) trigger.focus({ preventScroll: true });
      else (owner.activeElement as HTMLElement | null)?.blur();
    }
    publish();
  };
  function requestClose(reason: OutlineCloseReason): void {
    pointer?.stop();
    invoke(() => options.onRequestClose?.(reason));
    if (reason === 'outside' && panel.contains(owner.activeElement)) (owner.activeElement as HTMLElement).blur();
    setOpen(false);
  }
  const render = (): void => {
    const focused = owner.activeElement as HTMLElement | null;
    const selected = focused?.closest<HTMLElement>('[data-nabi-outline-index]');
    const focusIndex = selected && list.contains(selected) ? Number(selected.dataset['nabiOutlineIndex']) : -1;
    pointer?.stop();
    list.replaceChildren(
      ...items.map((item, index) => {
        const row = owner.createElement('li');
        const button = owner.createElement('button');
        button.type = 'button';
        button.className = 'nabi-outline-item';
        button.dataset['nabiOutlineIndex'] = String(index);
        button.dataset['level'] = String(item.level);
        if (item.number !== null) {
          const number = owner.createElement('span');
          number.className = 'nabi-outline-number';
          number.dir = 'ltr';
          number.textContent = `${item.number}.`;
          button.append(number);
        }
        const label = owner.createElement('bdi');
        label.textContent = item.text;
        button.append(label);
        row.append(button);
        return row;
      }),
    );
    if (open && focusIndex >= 0) {
      const buttons = list.querySelectorAll<HTMLButtonElement>('button');
      (buttons[Math.min(focusIndex, buttons.length - 1)] ?? panel).focus({ preventScroll: true });
    }
  };
  const refresh = (): void => {
    if (disposed) return;
    let number = 0;
    const headings = headingElements(root);
    const next = headings.map((element): OutlineItem =>
      Object.freeze({
        element,
        text: headingText(element),
        level: element.tagName === 'H1' ? 1 : 2,
        number: element.tagName === 'H1' ? ++number : null,
      }),
    );
    numberer.update(headings);
    if (
      next.length !== items.length ||
      next.some((item, index) => {
        const previous = items[index];
        return (
          previous?.element !== item.element ||
          previous.text !== item.text ||
          previous.level !== item.level ||
          previous.number !== item.number
        );
      })
    ) {
      items = Object.freeze(next);
      navigationScroll = undefined;
      render();
    }
    locate();
    paintActive();
    revealActive();
    if (!items.length && open) requestClose('empty');
    position();
    publish();
  };
  const schedule = (collect = false): void => {
    if (disposed) return;
    recollect ||= collect;
    if (frame) return;
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      const collect = recollect;
      recollect = false;
      if (collect) refresh();
      else {
        locate();
        position();
        publish();
      }
    });
  };
  const onScroll = (): void => schedule();
  const onResize = (): void => schedule(true);
  const onClick = (event: MouseEvent): void => {
    if (!open || event.detail !== 0) return;
    const target = (event.target as Element).closest<HTMLElement>(
      '[data-nabi-outline-index], [data-nabi-outline-scroll]',
    );
    if (!target || !panel.contains(target)) return;
    if (target.dataset['nabiOutlineIndex'] !== undefined) {
      if (goTo(Number(target.dataset['nabiOutlineIndex']))) requestClose('selection');
    } else {
      if (target.getAttribute('aria-disabled') !== 'true') step(Number(target.dataset['nabiOutlineScroll']));
    }
  };
  const onKey = (event: KeyboardEvent): void => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      requestClose('escape');
      return;
    }
    if (!panel.contains(event.target as Node)) return;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('button'));
    let next: number | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      next = Math.max(0, Math.min(buttons.length - 1, activeIndex + direction));
    }
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      const button = buttons[next];
      button?.focus({ preventScroll: true });
      if (button) {
        reveal(button);
        goTo(next, 'instant');
      }
      overflow();
    }
  };
  const outside = (event: PointerEvent): void => {
    if (open && !event.composedPath().includes(panel) && !event.composedPath().includes(trigger as EventTarget))
      requestClose('outside');
  };
  const labels = (): void => {
    panel.setAttribute('aria-label', translator.t('outline'));
    up.setAttribute('aria-label', translator.t('outline.up'));
    down.setAttribute('aria-label', translator.t('outline.down'));
    schedule(true);
  };
  const mutation = new view.MutationObserver(() => schedule(true));
  lifecycle.add(() => mutation.disconnect());
  mutation.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['hidden', 'open', 'class', 'style', 'dir'],
  });
  let waitingForConnection = !root.isConnected;
  const environment = new view.MutationObserver(() => {
    if (waitingForConnection && root.isConnected) {
      waitingForConnection = false;
      environment.disconnect();
      observeAncestors();
    }
    schedule(true);
  });
  function observeAncestors(): void {
    for (let parent = root.parentElement; parent; parent = parent.parentElement)
      environment.observe(parent, { attributes: true, attributeFilter: ['hidden', 'class', 'style', 'dir'] });
  }
  lifecycle.add(() => environment.disconnect());
  observeAncestors();
  if (waitingForConnection) environment.observe(owner.documentElement, { childList: true, subtree: true });
  const resize = new view.ResizeObserver(onResize);
  lifecycle.add(() => resize.disconnect());
  for (const element of [root, panel, ...(trigger ? [trigger] : []), ...(options.anchor ? [options.anchor] : [])])
    resize.observe(element);
  const stopLocale = translator.onChange?.(labels);
  if (stopLocale) lifecycle.add(stopLocale);
  owner.addEventListener('scroll', onScroll, true);
  view.addEventListener('keydown', onKey, true);
  owner.addEventListener('pointerdown', outside);
  root.addEventListener('load', onResize, true);
  root.addEventListener('toggle', onResize, true);
  view.addEventListener('resize', onResize);
  view.visualViewport?.addEventListener('resize', onResize);
  view.visualViewport?.addEventListener('scroll', onScroll);
  panel.addEventListener('click', onClick);
  list.addEventListener('scroll', overflow);
  lifecycle.add(() => {
    owner.removeEventListener('scroll', onScroll, true);
    view.removeEventListener('keydown', onKey, true);
    owner.removeEventListener('pointerdown', outside);
    root.removeEventListener('load', onResize, true);
    root.removeEventListener('toggle', onResize, true);
    view.removeEventListener('resize', onResize);
    view.visualViewport?.removeEventListener('resize', onResize);
    view.visualViewport?.removeEventListener('scroll', onScroll);
    panel.removeEventListener('click', onClick);
    list.removeEventListener('scroll', overflow);
  });
  labels();
  refresh();
  return {
    panel,
    getState: state,
    getItems: () => items,
    refresh,
    goTo,
    setOpen,
    toggle: () => setOpen(!open),
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener);
      invoke(() => listener(state()));
      return () => {
        listeners.delete(listener);
      };
    },
    unmount: () => lifecycle.dispose(),
  };
}
