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
import { watchDockViewport } from './dock.js';

interface ContextPort {
  root: HTMLElement;
  groups(): readonly ContextGroupView[];
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
}
export function mountCompactToolbar(options: CompactOptions): CompactToolbar {
  const { nabi, root, strip, buttons, surface, translator: t } = options;
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const life = new DisposerStack();
  const copy = new Translations(t);
  const lease = new HostElementLease(root);
  const chrome = root.closest<HTMLElement>('.nabi-toolbar') ?? root;
  const chromeLease = new HostElementLease(chrome);
  const item = session(nabi);
  let context: ContextPort | null = null;
  let contextLease: HostElementLease | null = null;
  const origins = new Map(buttons.map((button) => [button.el, button.el.parentElement!]));
  const hiddenControls = new Map<HTMLElement, HTMLElement['hidden']>();
  const bar = make(owner, 'div', 'nabi-compact-bar', { role: 'toolbar' });
  const quickRow = make(owner, 'div', 'nabi-compact-quick');
  const contextRow = make(owner, 'div', 'nabi-compact-context');
  const viewRow = make(owner, 'div', 'nabi-compact-view');
  const viewButtons = new Map<HTMLButtonElement, { el: HTMLButtonElement; dispose(): void }>();
  const tools =
    root.querySelector<HTMLButtonElement>(':scope > [data-name="tools"][data-nabi-compact]') ??
    iconButton(owner, { name: 'tools', label: t.t('tools'), text: '☷', press: () => open('all') });
  const back = iconButton(owner, {
    name: 'tools-back',
    label: t.t('toolsBack'),
    text: '←',
    press: () => {
      suppressed = true;
      close(false);
      refresh();
      focusQuiet(surface);
    },
  });
  const more = iconButton(owner, {
    name: 'context-tools',
    label: t.t('toolsContext'),
    svg: '<path d="m4 6 4 4 4-4"/>',
    className: 'nabi-object-properties',
    press: () => open('context'),
  });
  more.setAttribute('aria-haspopup', 'dialog');
  const toolbox = make(owner, 'section', 'nabi-toolbox', { role: 'dialog', tabindex: '-1' });
  const body = make(owner, 'div', 'nabi-toolbox-body');
  const keyboard = mountToolboxKeyboard(body);
  const tooltip = mountTooltip(root);
  const placeholder = make(owner, 'div', 'nabi-dock-placeholder', { 'aria-hidden': 'true' });
  const probe = make(owner, 'span', 'nabi-compact-breakpoint', { 'aria-hidden': 'true' });
  probe.style.cssText =
    'position:absolute;width:var(--nabi-mobile-breakpoint,36rem);height:0;visibility:hidden;pointer-events:none';
  let dead = false;
  let painting = false;
  let mode: 'all' | 'context' | 'detail' | null = null;
  let suppressed = false;
  let signature = '';
  let detail: Panel | null = null;
  let detailOptions: PanelOptions | null = null;
  let controls = new DisposerStack();
  let mobile = false;
  let active = false;
  let frame = 0;
  const hadStripHidden = strip.hidden;
  const viewport = surface ? watchDockViewport({ surface, onChange: () => position() }) : null;
  const unit = (): number => parseFloat(view?.getComputedStyle(owner.documentElement).fontSize ?? '') || 16;
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
    return length(style?.width, length(style?.minInlineSize, 2.75 * unit()));
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
    for (const [node, key] of [
      [tools, 'tools'],
      [back, 'toolsBack'],
      [more, 'toolsContext'],
    ] as const) {
      node.setAttribute('aria-label', t.t(key));
      node.setAttribute('data-nabi-tip', t.t(key));
    }
    tools.setAttribute('data-nabi-tip', t.t('twiceTail', { label: t.t('tools'), key: 'Shift' }));
    bar.setAttribute('aria-label', t.t('toolbar'));
    more.setAttribute('aria-expanded', String(mode === 'context'));
    toolbox.setAttribute('aria-label', t.t(mode === 'context' ? 'toolsContext' : 'tools'));
    toolbox.dir = localeDirection(t.locale);
    tooltip.refresh();
  };
  function returnContext(): void {
    for (const [el, was] of hiddenControls) el.hidden = was;
    hiddenControls.clear();
    if (context) for (const group of context.groups()) context.root.append(group.el);
  }
  function connect(port: ContextPort | null): void {
    if (dead) port = null;
    if (context === port) return;
    const closeContext =
      mode === 'context' ||
      (detailOptions !== null && context?.groups().some((group) => group.el.contains(detailOptions!.anchor)));
    returnContext();
    contextLease?.dispose();
    context = port;
    contextLease = port ? new HostElementLease(port.root) : null;
    contextLease?.className('nabi-compact-source', true);
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
    viewport?.cancelPanel();
    mode = null;
    closeDetail();
    controls.dispose();
    controls = new DisposerStack();
    returnContext();
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
    tooltip.hide();
    const focused = body.contains(owner.activeElement)
      ? (owner.activeElement as HTMLElement).getAttribute('data-name')
      : null;
    controls.dispose();
    controls = new DisposerStack();
    returnContext();
    body.replaceChildren();
    if (mode === 'context') {
      for (const group of context?.groups() ?? []) body.append(group.el);
    } else {
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
    }
    if (focused)
      Array.from(body.querySelectorAll<HTMLElement>('[data-name]'))
        .find((el) => el.getAttribute('data-name') === focused)
        ?.focus({ preventScroll: true });
  }
  function open(next: 'all' | 'context'): void {
    if (dead) return;
    const state = viewport?.read();
    if (state?.composing) return;
    if (mode === next) {
      close(true);
      return;
    }
    closeDetail();
    mode = next;
    toolbox.hidden = false;
    tools.setAttribute('aria-expanded', 'true');
    renderMenu();
    labels();
    position();
    if (!keyboard.focusFirst()) toolbox.focus({ preventScroll: true });
    if (mobile && viewport) viewport.preparePanel(owner.activeElement as HTMLElement);
  }
  function hostPanel(settings: PanelOptions): Panel {
    viewport?.cancelPanel();
    closeDetail();
    returnContext();
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
    if (mobile && !settings.modal && viewport) viewport.preparePanel(panel);
    if (!settings.modal)
      queueMicrotask(() => {
        if (!dead && detail === instance) keyboard.focusFirst();
      });
    return instance;
  }
  function fitContext(groups: readonly ContextGroupView[], hide: boolean): boolean {
    const room = rowRoom(contextRow);
    let used = 0;
    let visibleGroups = 0;
    let overflow = false;
    for (const group of groups) {
      let visibleChildren = 0;
      for (const child of Array.from(group.el.children) as HTMLElement[]) {
        if (child.hidden || view?.getComputedStyle(child).display === 'none') continue;
        const style = view?.getComputedStyle(child);
        const width =
          (child.getBoundingClientRect().width || (child.classList.contains('nabi-range') ? 10 : 2.75) * unit()) +
          length(style?.marginLeft) +
          length(style?.marginRight);
        const gap = visibleChildren > 0 ? gapOf(group.el) : visibleGroups > 0 ? gapOf(contextRow) : 0;
        if (used + gap + width > room + 0.5) {
          overflow = true;
          if (hide) {
            hiddenControls.set(child, child.hidden);
            child.hidden = true;
          }
        } else {
          used += gap + width;
          visibleChildren += 1;
        }
      }
      if (visibleChildren > 0) visibleGroups += 1;
      else if (hide) {
        hiddenControls.set(group.el, group.el.hidden);
        group.el.hidden = true;
      }
    }
    return overflow;
  }
  function refresh(): void {
    if (dead || painting) return;
    const focused = owner.activeElement as HTMLElement | null;
    const restore =
      focused &&
      (quickRow.contains(focused) ||
        contextRow.contains(focused) ||
        viewRow.contains(focused) ||
        (mode === 'context' && body.contains(focused)))
        ? focused
        : null;
    painting = true;
    try {
      const port = context;
      returnContext();
      for (const [el, parent] of origins) parent.append(el);
      quickRow.replaceChildren();
      contextRow.replaceChildren();
      syncViewButtons();
      const views = port?.groups() ?? [];
      const nextSignature = views.map((group) => `${group.w}:${group.node._id ?? ''}`).join('|');
      if (nextSignature !== signature) {
        signature = nextSignature;
        suppressed = false;
      }
      const useContext = views.length > 0 && !suppressed;
      if (mode !== 'detail' || detailOptions?.modal !== true) bar.hidden = false;
      back.hidden = !useContext;
      more.hidden = true;
      contextRow.hidden = !useContext;
      quickRow.hidden = useContext;
      if (useContext) {
        contextRow.append(...views.map((group) => group.el));
        const overflow = fitContext(views, false);
        more.hidden = !overflow;
        if (!overflow && mode === 'context') {
          close(false);
          contextRow.append(...views.map((group) => group.el));
        }
        if (!mode) fitContext(views, true);
        else if (mode === 'detail') returnContext();
      } else {
        if (mode === 'context') close(false);
        const quick = [...new Set(options.quick)]
          .map((name) => buttons.find((b) => b.el.getAttribute('data-name') === name && !b.el.hidden))
          .filter((button): button is ToolbarButton => button !== undefined);
        const room = rowRoom(quickRow);
        let used = 0;
        for (const button of quick) {
          quickRow.append(button.el);
          const width = widthOf(button.el);
          const needed = width + (used > 0 ? gapOf(quickRow) : 0);
          if (used + needed <= room) used += needed;
          else origins.get(button.el)?.append(button.el);
        }
      }
      if (mode && mode !== 'detail') renderMenu();
      labels();
      position();
      if (restore && owner.activeElement !== restore)
        focusQuiet(restore.isConnected && !restore.closest('[hidden], .nabi-compact-source') ? restore : tools);
    } finally {
      painting = false;
    }
  }
  function position(): void {
    if (dead) return;
    const state = viewport?.read();
    const threshold = parseFloat(view?.getComputedStyle(probe).width ?? '') || 576;
    mobile = !!surface && (owner.documentElement.clientWidth || view?.innerWidth || 1024) < threshold;
    const focused = owner.activeElement;
    active = !!surface && (surface === focused || surface.contains(focused) || root.contains(focused) || !!mode);
    const rect = (surface ?? root).getBoundingClientRect();
    const room = state?.height ?? view?.innerHeight ?? 700;
    const barHeight = 3 * unit();
    const nextDocked = mobile && active && rect.width > 0;
    const isInput = mode === 'detail' && detailOptions?.modal === true;
    const pending = !!(mobile && mode && !isInput && state?.keyboardOpen);
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
      mode && !isInput && !pending
        ? Math.min(
            contentHeight > 0 ? contentHeight + bodyPadding + borderHeight : 280,
            state?.lastKeyboardHeight || 280,
            Math.max(96, room - 3 * barHeight),
          )
        : 0;
    toolbox.classList.toggle('nabi-toolbox-input', mobile && isInput);
    toolbox.classList.toggle('nabi-toolbox-waiting', pending);
    if (nextDocked) {
      const top = (state?.top ?? 0) + room - barHeight - panelHeight;
      const left = Math.max(state?.left ?? 0, rect.left);
      const right = Math.min(rect.right, (state?.left ?? 0) + (state?.width ?? view?.innerWidth ?? rect.width));
      const width = Math.max(0, right - left);
      chrome.setAttribute('data-nabi-docked', 'true');
      chrome.style.setProperty('--nabi-dock-top', `${Math.max(state?.top ?? 0, top)}px`);
      chrome.style.setProperty('--nabi-dock-left', `${left}px`);
      chrome.style.setProperty('--nabi-dock-width', `${width}px`);
      toolbox.style.setProperty('--nabi-toolbox-height', `${panelHeight}px`);
      placeholder.hidden = false;
      if (!placeholder.parentNode) chrome.before(placeholder);
    } else {
      chrome.removeAttribute('data-nabi-docked');
      for (const key of ['--nabi-dock-top', '--nabi-dock-left', '--nabi-dock-width']) chrome.style.removeProperty(key);
      placeholder.hidden = true;
    }
    bar.hidden = !!(mobile && isInput);
    toolbox.classList.toggle('nabi-toolbox-inline', mobile && isInput);
    const anchor = root.getBoundingClientRect();
    const below = Math.max(0, (state?.top ?? 0) + room - anchor.bottom - 8);
    const above = Math.max(0, anchor.top - (state?.top ?? 0) - 8);
    const flip = !mobile && below < 320 && above > below;
    toolbox.classList.toggle('nabi-toolbox-above', flip);
    if (mode && !pending && !(mobile && isInput))
      toolbox.style.maxHeight = `${Math.max(96, mobile ? room - 96 : flip ? above : below)}px`;
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
          if (mode !== 'all') open('all');
          else keyboard.focusFirst();
        },
        close: (restore = true) => close(restore),
        active: () => mode !== null,
      }),
    );
    life.add(() => copy.dispose());
    life.add(() => lease.dispose());
    life.add(() => chromeLease.dispose());
    life.add(() => {
      for (const button of viewButtons.values()) button.dispose();
      viewButtons.clear();
    });
    lease.className('nabi-compact-row', true);
    chromeLease.className('nabi-compact', true);
    life.add(() => {
      returnContext();
      contextLease?.dispose();
      for (const [el, parent] of origins) parent.append(el);
      strip.hidden = hadStripHidden;
    });
    strip.hidden = true;
    if (tools.hasAttribute('data-nabi-compact')) life.add(wireIconButton(tools, () => open('all')));
    tools.setAttribute('data-nabi-compact', 'true');
    tools.classList.add('nabi-compact-tools');
    bar.append(tools, more, back, quickRow, contextRow, viewRow);
    root.prepend(bar);
    root.append(probe, toolbox);
    toolbox.append(body);
    toolbox.hidden = true;
    placeholder.hidden = true;
    life.add(() => {
      bar.remove();
      toolbox.remove();
      probe.remove();
      placeholder.remove();
    });
    life.add(registerPanelHost(root, hostPanel));
    const onOutside = (event: Event): void => {
      const target = event.target as Node | null;
      if (mode && target && !root.contains(target) && !toolbox.contains(target)) close(false);
    };
    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      if (key.key === 'Escape' && root.contains(key.target as Node) && (mode || !back.hidden)) {
        key.preventDefault();
        key.stopPropagation();
        if (mode) close(true);
        else {
          suppressed = true;
          refresh();
          focusQuiet(surface);
        }
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
    life.add(() => observer?.disconnect());
    const result: CompactToolbar = {
      refresh,
      close,
      keepsFocus: () => mode !== null && detailOptions?.modal !== true,
      unmount: () => {
        if (dead) return;
        close(false);
        dead = true;
        life.dispose();
        chrome.removeAttribute('data-nabi-docked');
        for (const key of ['--nabi-dock-top', '--nabi-dock-left', '--nabi-dock-width'])
          chrome.style.removeProperty(key);
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
