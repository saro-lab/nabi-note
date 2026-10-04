import type { Nabi } from '../editor/index.js';
import type { Translator } from '../locale/index.js';
import { localeDirection } from '../locale/index.js';
import type { ContextGroupView } from './context.js';
import type { ToolbarButton } from './toolbar.js';
import type { Panel, PanelOptions } from './parts/panel.js';
import { make, focusQuiet } from './parts/dom.js';
import { iconButton, wireIconButton } from './parts/button.js';
import { mountToolboxKeyboard, registerToolbox } from './parts/toolbox-keyboard.js';
import { registerPanelHost } from './parts/panel-host.js';
import { mountTooltip } from './parts/tooltip.js';
import { Translations } from './parts/translation.js';
import { DisposerStack, HostElementLease } from '../lifecycle.js';
import { visibleViewportRect, watchDockViewport } from './dock.js';

interface ContextPort {
  root: HTMLElement;
  groups(): readonly ContextGroupView[];
  close?(): void;
}
interface Session {
  contexts: ContextPort[];
  toolbars: ContextOwner[];
  viewTools: ViewToolsPort[];
}
interface ViewToolsPort {
  container: HTMLElement;
  surface: HTMLElement;
  buttons: readonly HTMLButtonElement[];
}
interface ContextOwner {
  toolbar: CompactToolbar;
  connect(port: ContextPort | null): void;
}
const sessions = new WeakMap<Nabi, Session>();
function session(nabi: Nabi): Session {
  let item = sessions.get(nabi);
  if (!item) {
    item = { contexts: [], toolbars: [], viewTools: [] };
    sessions.set(nabi, item);
  }
  return item;
}
function connectContext(item: Session): void {
  const active = item.toolbars.at(-1);
  for (const owner of item.toolbars) if (owner !== active) owner.connect(null);
  active?.connect(item.contexts.at(-1) ?? null);
}
export function registerCompactContext(nabi: Nabi, port: ContextPort): () => void {
  const item = session(nabi);
  item.contexts.push(port);
  try {
    connectContext(item);
  } catch (error) {
    item.contexts.splice(item.contexts.indexOf(port), 1);
    connectContext(item);
    throw error;
  }
  return () => {
    const at = item.contexts.indexOf(port);
    if (at < 0) return;
    item.contexts.splice(at, 1);
    connectContext(item);
  };
}
export function refreshCompactContext(nabi: Nabi): void {
  sessions.get(nabi)?.toolbars.at(-1)?.toolbar.refresh();
}
export function compactKeepsFocus(nabi: Nabi): boolean {
  return sessions.get(nabi)?.toolbars.some((owner) => owner.toolbar.keepsFocus()) ?? false;
}
export function refreshCompactViewTools(nabi: Nabi): void {
  for (const owner of sessions.get(nabi)?.toolbars ?? []) owner.toolbar.refresh();
}
export function registerCompactViewTools(nabi: Nabi, port: ViewToolsPort): () => void {
  const item = session(nabi);
  item.viewTools.push(port);
  const release = (): void => {
    const at = item.viewTools.indexOf(port);
    if (at < 0) return;
    item.viewTools.splice(at, 1);
    refreshCompactViewTools(nabi);
  };
  try {
    refreshCompactViewTools(nabi);
  } catch (error) {
    release();
    throw error;
  }
  return release;
}

export interface CompactToolbar {
  refresh(): void;
  keepsFocus(): boolean;
  close(restore?: boolean): void;
  unmount(): void;
}
interface CompactOptions {
  nabi: Nabi;
  root: HTMLElement;
  strip: HTMLElement;
  buttons: readonly ToolbarButton[];
  surface?: HTMLElement;
  translator: Translator;
  quick: readonly string[];
  onLayoutChange?(): void;
}
export function mountCompactToolbar(options: CompactOptions): CompactToolbar {
  const { nabi, root, strip, buttons, surface, translator: t } = options;
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const life = new DisposerStack();
  const copy = new Translations(t);
  const lease = new HostElementLease(root);
  const chrome = root.closest<HTMLElement>('.nabi-toolbar') ?? root;
  const shell = chrome.closest('.nabi');
  const chromeLease = new HostElementLease(chrome);
  const item = session(nabi);
  let context: ContextPort | null = null;
  let contextLease: HostElementLease | null = null;
  let contextTooltip: ReturnType<typeof mountTooltip> | null = null;
  let contextKeyboard: ReturnType<typeof mountToolboxKeyboard> | null = null;
  let releaseContextPanelHost: (() => void) | null = null;
  const origins = new Map(buttons.map((button) => [button.el, button.el.parentElement!]));
  const originGroups = new Map<HTMLElement, HTMLElement[]>();
  for (const [el, parent] of origins) originGroups.set(parent, [...(originGroups.get(parent) ?? []), el]);
  const bar = make(owner, 'div', 'nabi-compact-bar', { role: 'toolbar' });
  const quickRow = make(owner, 'div', 'nabi-compact-quick');
  const viewRow = make(owner, 'div', 'nabi-compact-view');
  const viewButtons = new Map<HTMLButtonElement, { el: HTMLButtonElement; dispose(): void }>();
  const tools =
    root.querySelector<HTMLButtonElement>(':scope > [data-name="tools"][data-nabi-compact]') ??
    iconButton(owner, { name: 'tools', label: t.t('tools'), text: '☷', press: open });
  const toolbox = make(owner, 'section', 'nabi-toolbox', { role: 'dialog', tabindex: '-1' });
  const body = make(owner, 'div', 'nabi-toolbox-body');
  const keyboard = mountToolboxKeyboard(body);
  const tooltip = mountTooltip(root);
  const probe = make(owner, 'span', 'nabi-compact-breakpoint', { 'aria-hidden': 'true' });
  probe.style.cssText =
    'position:absolute;width:var(--nabi-mobile-breakpoint,36rem);height:0;visibility:hidden;pointer-events:none';
  let dead = false;
  let painting = false;
  let expanded = false;
  let navigating = false;
  let expandedKeyboard: ReturnType<typeof mountToolboxKeyboard> | null = null;
  let releasePanelHost: (() => void) | null = null;
  let mode: 'all' | 'detail' | null = null;
  let detail: Panel | null = null;
  let detailOptions: PanelOptions | null = null;
  let controls = new DisposerStack();
  let mobile = false;
  let frame = 0;
  const hadStripHidden = strip.hidden;
  const viewport = surface ? watchDockViewport({ surface, onChange: () => schedule() }) : null;
  const unit = (): number => parseFloat(view?.getComputedStyle(owner.documentElement).fontSize ?? '') || 16;
  const isNarrow = (): boolean => {
    const threshold = parseFloat(view?.getComputedStyle(probe).width ?? '') || 36 * unit();
    return (owner.documentElement.clientWidth || view?.innerWidth || 1024) < threshold;
  };
  const sourceViewButtons = (): readonly HTMLButtonElement[] => {
    const ports = [...item.viewTools].reverse();
    return (
      ports.find((port) => chrome.contains(port.container))?.buttons ??
      ports.find((port) => surface && port.surface === surface)?.buttons ??
      []
    );
  };
  const length = (value: string | undefined, fallback = 0): number => {
    const number = parseFloat(value ?? '');
    if (!Number.isFinite(number)) return fallback;
    return value?.endsWith('rem') ? number * unit() : number;
  };
  const gapOf = (el: HTMLElement): number => length(view?.getComputedStyle(el).columnGap, 0.125 * unit());
  const widthOf = (el: HTMLElement): number => {
    const measured = el.getBoundingClientRect().width;
    if (measured > 0) return measured;
    if (el === viewRow) {
      const children = [...viewRow.children].filter((child) => !(child as HTMLElement).hidden) as HTMLElement[];
      return children.reduce((sum, child) => sum + widthOf(child), 0) + Math.max(0, children.length - 1) * gapOf(el);
    }
    const style = view?.getComputedStyle(el);
    return length(style?.width, length(style?.minInlineSize, 2 * unit()));
  };
  const rowRoom = (flexible: HTMLElement): number => {
    const style = view?.getComputedStyle(bar);
    const fixed = [...bar.children].filter(
      (child) => child !== flexible && !(child as HTMLElement).hidden,
    ) as HTMLElement[];
    return Math.max(
      0,
      (bar.clientWidth || root.clientWidth || 320) -
        length(style?.paddingLeft, 0.125 * unit()) -
        length(style?.paddingRight, 0.125 * unit()) -
        fixed.reduce((sum, child) => sum + widthOf(child), 0) -
        fixed.length * gapOf(bar),
    );
  };
  function arrange(parent: HTMLElement, children: readonly HTMLElement[]): void {
    const wanted = new Set(children);
    let previous: HTMLElement | null = null;
    for (const child of children) {
      let next: Element | null = previous ? previous.nextElementSibling : parent.firstElementChild;
      while (next && !wanted.has(next as HTMLElement)) next = next.nextElementSibling;
      if (next !== child) parent.insertBefore(child, next);
      previous = child;
    }
  }
  function restoreButtons(kept: ReadonlySet<HTMLElement>): void {
    for (const [parent, children] of originGroups)
      arrange(
        parent,
        children.filter((el) => !kept.has(el)),
      );
  }
  function syncViewButtons(): void {
    const sources = sourceViewButtons();
    for (const [source, button] of viewButtons) {
      if (sources.includes(source)) continue;
      button.dispose();
      button.el.remove();
      viewButtons.delete(source);
    }
    for (const source of sources) {
      let button = viewButtons.get(source);
      if (!button) {
        const el = source.cloneNode(true) as HTMLButtonElement;
        el.removeAttribute('id');
        el.removeAttribute('data-hint');
        button = {
          el,
          dispose: wireIconButton(el, () => {
            close(false);
            source.click();
          }),
        };
        viewButtons.set(source, button);
      }
      for (const name of [
        'class',
        'aria-label',
        'aria-pressed',
        'aria-expanded',
        'data-nabi-tip',
        'title',
        'disabled',
        'hidden',
      ]) {
        const value = source.getAttribute(name);
        if (value === null) button.el.removeAttribute(name);
        else if (button.el.getAttribute(name) !== value) button.el.setAttribute(name, value);
      }
      if (button.el.innerHTML !== source.innerHTML) button.el.innerHTML = source.innerHTML;
      if (button.el.parentElement !== viewRow) viewRow.append(button.el);
    }
    viewRow.hidden = sources.length === 0;
  }
  const labels = (): void => {
    tools.setAttribute('aria-label', t.t('tools'));
    tools.setAttribute('data-nabi-tip', t.t('twiceTail', { label: t.t('tools'), key: 'Shift' }));
    bar.setAttribute('aria-label', t.t('toolbar'));
    toolbox.setAttribute('aria-label', t.t('tools'));
    toolbox.dir = localeDirection(t.locale);
    tooltip.refresh();
    contextTooltip?.refresh();
  };
  function connect(port: ContextPort | null): void {
    if (dead) port = null;
    if (context === port) return;
    const closeContext = detailOptions !== null && context?.root.contains(detailOptions.anchor);
    releaseContextPanelHost?.();
    releaseContextPanelHost = null;
    contextTooltip?.unmount();
    contextTooltip = null;
    contextKeyboard?.unmount();
    contextKeyboard = null;
    contextLease?.dispose();
    context = port;
    contextLease = port ? new HostElementLease(port.root) : null;
    contextLease?.className('nabi-compact-context', true);
    if (port && !expanded) contextKeyboard = mountToolboxKeyboard(port.root);
    if (port && !root.contains(port.root)) {
      contextTooltip = mountTooltip(port.root);
      if (!expanded) releaseContextPanelHost = registerPanelHost(port.root, hostPanel);
    }
    if (closeContext && !dead) close(false);
    else refresh();
  }
  function closeDetail(): void {
    const was = detail;
    detail = null;
    detailOptions = null;
    was?.close();
  }
  function close(restore = false): void {
    if (dead) return;
    navigating = false;
    viewport?.cancelPanel();
    mode = null;
    closeDetail();
    controls.dispose();
    controls = new DisposerStack();
    body.replaceChildren();
    toolbox.hidden = true;
    tools.setAttribute('aria-expanded', 'false');
    refresh();
    if (restore) {
      if (viewport) viewport.restore();
      else focusQuiet(surface ?? tools);
    }
  }
  function proxy(button: ToolbarButton): HTMLButtonElement {
    const el = button.el.cloneNode(true) as HTMLButtonElement;
    el.hidden = false;
    el.removeAttribute('id');
    el.removeAttribute('data-hint');
    el.removeAttribute('data-nabi-quick');
    el.removeAttribute('title');
    controls.add(wireIconButton(el, (by) => button.press(by)));
    return el;
  }
  function renderMenu(): void {
    if (!mode || mode === 'detail') return;
    const visibleGroups = new Map<string, ToolbarButton[]>();
    for (const button of buttons) {
      if (!button.el.hidden) visibleGroups.set(button.group, [...(visibleGroups.get(button.group) ?? []), button]);
    }
    const visible = [...visibleGroups.values()].flat();
    const existing = [...body.querySelectorAll<HTMLButtonElement>('.nabi-toolbox-group > .nabi-btn')];
    if (
      body.querySelector('.nabi-toolbox-icons') &&
      existing.length === visible.length &&
      existing.every(
        (el, at) =>
          el.getAttribute('data-name') === visible[at]!.el.getAttribute('data-name') &&
          el.parentElement?.getAttribute('data-group') === visible[at]!.group,
      )
    ) {
      for (const [at, el] of existing.entries()) {
        const source = visible[at]!.el;
        for (const name of ['class', 'aria-label', 'aria-pressed', 'aria-expanded', 'data-nabi-tip', 'disabled']) {
          let value = source.getAttribute(name);
          if (name === 'class' && el.classList.contains('nabi-tap') && !source.classList.contains('nabi-tap'))
            value = `${value ?? ''} nabi-tap`;
          if (value === null) el.removeAttribute(name);
          else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
        }
        if (el.innerHTML !== source.innerHTML) el.innerHTML = source.innerHTML;
      }
      return;
    }
    tooltip.hide();
    contextTooltip?.hide();
    const focused = body.contains(owner.activeElement)
      ? (owner.activeElement as HTMLElement).getAttribute('data-name')
      : null;
    controls.dispose();
    controls = new DisposerStack();
    body.replaceChildren();
    const icons = make(owner, 'div', 'nabi-toolbox-icons');
    const groups = new Map<string, HTMLElement>();
    const groupFor = (name: string): HTMLElement => {
      let group = groups.get(name);
      if (!group) {
        group = make(owner, 'div', 'nabi-toolbox-group', { role: 'group', 'data-group': name });
        groups.set(name, group);
        icons.append(group);
      }
      return group;
    };
    for (const button of buttons) {
      if (!button.el.hidden) groupFor(button.group).append(proxy(button));
    }
    body.append(icons);
    if (focused)
      Array.from(body.querySelectorAll<HTMLElement>('[data-name]'))
        .find((el) => el.getAttribute('data-name') === focused)
        ?.focus({ preventScroll: true });
  }
  function open(): void {
    if (dead) return;
    if (expanded) {
      navigating = true;
      navigating = expandedKeyboard?.focusFirst() ?? false;
      return;
    }
    const state = viewport?.read();
    if (state?.composing) return;
    if (mode === 'all') {
      close(true);
      return;
    }
    closeDetail();
    mode = 'all';
    toolbox.hidden = false;
    tools.setAttribute('aria-expanded', 'true');
    renderMenu();
    labels();
    position();
    if (mobile && viewport) viewport.preparePanel(toolbox);
    if (!keyboard.focusFirst()) toolbox.focus({ preventScroll: true });
  }
  function hostPanel(settings: PanelOptions): Panel {
    viewport?.cancelPanel();
    closeDetail();
    controls.dispose();
    controls = new DisposerStack();
    body.replaceChildren();
    mode = 'detail';
    detailOptions = settings;
    const panel = make(owner, 'div', `nabi-panel nabi-hosted-panel ${settings.className ?? ''}`, {
      tabindex: '-1',
      'data-nabi-hosted': 'true',
    });
    const expanded = settings.anchor.getAttribute('aria-expanded');
    settings.anchor.setAttribute('aria-expanded', 'true');
    let closed = false;
    const instance: Panel = {
      root: panel,
      reposition: position,
      close: () => {
        if (closed) return;
        closed = true;
        viewport?.cancelPanel();
        panel.remove();
        if (expanded === null) settings.anchor.removeAttribute('aria-expanded');
        else settings.anchor.setAttribute('aria-expanded', expanded);
        settings.onClose?.();
        if (detail === instance) {
          detail = null;
          detailOptions = null;
          mode = null;
          toolbox.hidden = true;
          refresh();
          focusQuiet(settings.restore ?? tools);
        }
      },
    };
    detail = instance;
    body.append(panel);
    toolbox.hidden = false;
    labels();
    position();
    if (mobile && settings.className !== 'nabi-prompt' && viewport) viewport.preparePanel(panel);
    if (settings.className !== 'nabi-prompt')
      queueMicrotask(() => {
        if (!dead && detail === instance && !panel.contains(owner.activeElement)) keyboard.focusFirst();
      });
    return instance;
  }
  function refresh(): void {
    if (dead || painting) return;
    const focused = owner.activeElement as HTMLElement | null;
    const restore = focused && (chrome.contains(focused) || context?.root.contains(focused)) ? focused : null;
    const restoreFocus = (fallback: HTMLElement | undefined): void => {
      if (!restore || (owner.activeElement === restore && !restore.closest('[hidden]'))) return;
      const original = buttons.find(
        (button) => button.el.getAttribute('data-name') === restore.getAttribute('data-name'),
      )?.el;
      const target = [restore, original].find((el) => el?.isConnected && !el.closest('[hidden]'));
      focusQuiet(target ?? fallback);
    };
    painting = true;
    try {
      mobile = isNarrow();
      const nextExpanded = !mobile || (shell?.classList.contains('is-fullscreen') ?? false);
      if (expanded !== nextExpanded) {
        close(false);
        options.onLayoutChange?.();
        context?.close?.();
        expanded = nextExpanded;
        tooltip.hide();
        chromeLease.className('nabi-expanded', expanded);
        expandedKeyboard?.unmount();
        expandedKeyboard = expanded ? mountToolboxKeyboard(chrome) : null;
        contextKeyboard?.unmount();
        contextKeyboard = !expanded && context ? mountToolboxKeyboard(context.root) : null;
        releasePanelHost?.();
        releasePanelHost = expanded ? null : registerPanelHost(root, hostPanel);
        releaseContextPanelHost?.();
        releaseContextPanelHost =
          !expanded && context && !root.contains(context.root) ? registerPanelHost(context.root, hostPanel) : null;
      }
      syncViewButtons();
      strip.hidden = !expanded;
      tools.hidden = expanded;
      if (expanded) {
        restoreButtons(new Set());
        bar.hidden = false;
        quickRow.hidden = true;
        for (const parent of new Set(origins.values())) {
          parent.hidden = ![...parent.children].some((child) => !(child as HTMLElement).hidden);
        }
        labels();
        restoreFocus(surface);
        return;
      }
      quickRow.hidden = false;
      const quick = [...new Set(options.quick)]
        .map((name) => buttons.find((b) => b.el.getAttribute('data-name') === name && !b.el.hidden))
        .filter((button): button is ToolbarButton => button !== undefined);
      const room = rowRoom(quickRow);
      const kept: HTMLElement[] = [];
      let used = 0;
      for (const button of quick) {
        if (button.el.parentElement !== quickRow) quickRow.append(button.el);
        const width = widthOf(button.el);
        const needed = width + (used > 0 ? gapOf(quickRow) : 0);
        if (used + needed <= room) {
          used += needed;
          kept.push(button.el);
        }
      }
      restoreButtons(new Set(kept));
      arrange(quickRow, kept);
      if (mode && mode !== 'detail') renderMenu();
      labels();
      position();
      restoreFocus(tools);
    } finally {
      painting = false;
    }
  }
  function position(): void {
    if (dead || expanded) return;
    const state = viewport?.read();
    const visible = visibleViewportRect(owner);
    const room = visible.bottom - visible.top;
    const barHeight = 2.25 * unit();
    const isInput = mode === 'detail' && detailOptions?.className === 'nabi-prompt';
    bar.hidden = !!(mobile && isInput);
    const row = root.getBoundingClientRect();
    const anchor = chrome.getBoundingClientRect();
    toolbox.style.setProperty('--nabi-toolbox-top', `${anchor.bottom - row.top}px`);
    toolbox.style.setProperty('--nabi-toolbox-bottom', `${row.bottom - anchor.top}px`);
    const top = visible.top;
    if (mode && anchor.width > 0 && (anchor.bottom <= top || anchor.top >= top + room)) {
      close(false);
      return;
    }
    const below = Math.max(0, top + room - anchor.bottom - 8);
    const above = Math.max(0, anchor.top - top - 8);
    const flip = !(mobile && isInput) && below < 320 && above > below;
    const available = flip ? above : below;
    toolbox.classList.toggle('nabi-toolbox-mobile', mobile);
    const contentBoxes = Array.from(body.children, (child) => child.getBoundingClientRect());
    const contentHeight = contentBoxes.length
      ? Math.max(...contentBoxes.map((box) => box.bottom)) - Math.min(...contentBoxes.map((box) => box.top))
      : 0;
    const bodyStyle = view?.getComputedStyle(body);
    const bodyPadding = length(bodyStyle?.paddingTop) + length(bodyStyle?.paddingBottom);
    const toolboxStyle = view?.getComputedStyle(toolbox);
    const borderHeight = length(toolboxStyle?.borderTopWidth) + length(toolboxStyle?.borderBottomWidth);
    const panelHeight =
      mode && !isInput
        ? Math.min(
            contentHeight > 0 ? contentHeight + bodyPadding + borderHeight : 280,
            state?.lastKeyboardHeight || 280,
            Math.max(96, room - 3 * barHeight),
            available,
          )
        : 0;
    toolbox.classList.toggle('nabi-toolbox-input', mobile && isInput);
    toolbox.style.setProperty('--nabi-toolbox-height', `${panelHeight}px`);
    toolbox.classList.toggle('nabi-toolbox-inline', mobile && isInput);
    toolbox.classList.toggle('nabi-toolbox-above', flip);
    if (mode && !(mobile && isInput)) toolbox.style.maxHeight = `${available}px`;
    else toolbox.style.removeProperty('max-height');
  }
  const schedule = (): void => {
    if (!view || frame) return;
    if (typeof view.requestAnimationFrame !== 'function') {
      position();
      return;
    }
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      position();
    });
  };
  try {
    life.add(() => viewport?.unmount());
    life.add(() => keyboard.unmount());
    life.add(() => tooltip.unmount());
    life.add(
      registerToolbox(root, {
        open: () => {
          if (mode !== 'all') open();
          else keyboard.focusFirst();
        },
        close: (restore = true) => close(restore),
        active: () => navigating || mode !== null,
      }),
    );
    life.add(() => copy.dispose());
    life.add(() => lease.dispose());
    life.add(() => chromeLease.dispose());
    life.add(() => expandedKeyboard?.unmount());
    life.add(() => releasePanelHost?.());
    life.add(() => releaseContextPanelHost?.());
    life.add(() => contextTooltip?.unmount());
    life.add(() => contextKeyboard?.unmount());
    life.add(() => {
      for (const button of viewButtons.values()) button.dispose();
      viewButtons.clear();
    });
    lease.className('nabi-compact-row', true);
    chromeLease.className('nabi-compact', true);
    life.add(() => {
      contextLease?.dispose();
      for (const [el, parent] of origins) parent.append(el);
      strip.hidden = hadStripHidden;
    });
    strip.hidden = true;
    if (tools.hasAttribute('data-nabi-compact')) life.add(wireIconButton(tools, open));
    tools.setAttribute('data-nabi-compact', 'true');
    tools.classList.add('nabi-compact-tools');
    bar.append(tools, quickRow, viewRow);
    root.prepend(bar);
    root.append(probe, toolbox);
    toolbox.append(body);
    toolbox.hidden = true;
    life.add(() => {
      bar.remove();
      toolbox.remove();
      probe.remove();
    });
    releasePanelHost = registerPanelHost(root, hostPanel);
    const onOutside = (event: Event): void => {
      const target = event.target as Node | null;
      if (navigating && target && !chrome.contains(target)) navigating = false;
      if (mode && target && !root.contains(target) && !context?.root.contains(target)) close(false);
    };
    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      if (expanded) return;
      if (key.key === 'Escape' && root.contains(key.target as Node) && mode) {
        key.preventDefault();
        key.stopPropagation();
        close(true);
      }
    };
    owner.addEventListener('pointerdown', onOutside, true);
    owner.addEventListener('keydown', onKey, true);
    owner.addEventListener('focusin', schedule, true);
    view?.addEventListener('resize', refresh);
    view?.addEventListener('scroll', schedule, true);
    life.add(() => {
      owner.removeEventListener('pointerdown', onOutside, true);
      owner.removeEventListener('keydown', onKey, true);
      owner.removeEventListener('focusin', schedule, true);
      view?.removeEventListener('resize', refresh);
      view?.removeEventListener('scroll', schedule, true);
      if (frame) view?.cancelAnimationFrame?.(frame);
    });
    const Observer = view?.ResizeObserver;
    const observer = Observer ? new Observer(refresh) : null;
    observer?.observe(root);
    observer?.observe(probe);
    if (chrome !== root) observer?.observe(chrome);
    life.add(() => observer?.disconnect());
    const Mutation = view?.MutationObserver;
    const fullscreenObserver = Mutation
      ? new Mutation(() => {
          if (expanded !== (!isNarrow() || shell?.classList.contains('is-fullscreen'))) refresh();
        })
      : null;
    if (shell) fullscreenObserver?.observe(shell, { attributes: true, attributeFilter: ['class'] });
    life.add(() => fullscreenObserver?.disconnect());
    const result: CompactToolbar = {
      refresh,
      close,
      keepsFocus: () => navigating || (mode !== null && detailOptions?.className !== 'nabi-prompt'),
      unmount: () => {
        if (dead) return;
        close(false);
        dead = true;
        life.dispose();
      },
    };
    const binding: ContextOwner = { toolbar: result, connect };
    item.toolbars.push(binding);
    life.add(() => {
      const at = item.toolbars.indexOf(binding);
      if (at < 0) return;
      try {
        connect(null);
      } finally {
        item.toolbars.splice(at, 1);
        connectContext(item);
      }
    });
    connectContext(item);
    copy.add(() => {
      labels();
      if (mode && mode !== 'detail') renderMenu();
    });
    refresh();
    return result;
  } catch (error) {
    dead = true;
    life.dispose();
    throw error;
  }
}
