import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  createLocale,
  createNabiWith,
  defaultWings,
  makeTranslator,
  mountContextToolbar,
  mountHints,
  mountSurface,
  mountToolbar,
  mountViewTools,
  renderToolbarHtml,
  setFullscreen,
  simpleMark,
  toolbarSlots,
  type ContextToolbar,
  type Wing,
} from '../src/index.js';
import { hostOf } from '../src/editor/index.js';

const custom = simpleMark({
  w: 'exCompactTestMark',
  button: {
    name: 'apply',
    group: 'custom',
    label: { en: 'Custom review mark', ko: '사용자 검토 표시' },
    action: { kind: 'mark' },
  },
});
const customName = 'exCompactTestMark:apply';

interface FixtureOptions {
  readonly doc?: unknown;
  readonly wings?: readonly Wing[];
  readonly layout?: 'compact' | 'wrap';
  readonly quick?: readonly string[];
  readonly ssr?: boolean;
  readonly contextFirst?: boolean;
  readonly width?: number;
  readonly viewportWidth?: number;
}

function fixture(options: FixtureOptions = {}) {
  const dom = new JSDOM(
    '<!doctype html><div id="app" class="nabi"><div id="chrome" class="nabi-toolbar"><div id="toolbar"></div><div id="context"></div><div id="tools"></div></div><div id="surface" class="nabi-content"></div></div>',
    { url: 'https://example.test', pretendToBeVisual: true },
  );
  const owner = dom.window.document;
  let viewportWidth = options.viewportWidth ?? 390;
  Object.defineProperty(dom.window, 'innerWidth', { get: () => viewportWidth });
  Object.defineProperty(owner.documentElement, 'clientWidth', { get: () => viewportWidth });
  const el = (id: string): HTMLElement => owner.getElementById(id)!;
  const locale = createLocale('en');
  const calls: string[] = [];
  const editor = createNabiWith(options.wings ?? [...defaultWings, custom], {
    doc: options.doc ?? [{ w: 'p', ch: ['text'] }],
    locale,
    typingMergeMs: 0,
  });
  const surface = mountSurface({ ...editor, root: el('surface'), locale });
  const common = { ...editor, surface: el('surface'), locale };
  let width = options.width ?? 532;
  Object.defineProperty(el('toolbar'), 'clientWidth', { get: () => width });
  let context: ContextToolbar | undefined;
  const mountContext = (): ContextToolbar => {
    context ??= mountContextToolbar({ ...common, root: el('context') });
    return context;
  };
  if (options.contextFirst) mountContext();
  const presentation = {
    ...(options.layout ? { layout: options.layout } : {}),
    ...(options.quick ? { quick: options.quick } : {}),
  };
  if (options.ssr) el('toolbar').innerHTML = renderToolbarHtml({ registry: editor.registry, locale, ...presentation });
  const before = new Map(
    [...el('toolbar').querySelectorAll<HTMLButtonElement>('button[data-name]')].map((button) => [
      button.dataset.name!,
      button,
    ]),
  );
  const toolbar = mountToolbar({
    ...common,
    root: el('toolbar'),
    ...presentation,
    onHost: (wing) => calls.push(wing),
  });
  const view = mountViewTools({ ...common, root: el('app'), container: el('tools') });
  const menu = (): HTMLElement => {
    const trigger = el('toolbar').querySelector<HTMLButtonElement>('[data-name="tools"]');
    assert.ok(trigger, 'compact toolbar has an all-tools entry');
    trigger.click();
    const panel = owner.querySelector<HTMLElement>('.nabi-toolbox');
    assert.ok(panel, 'all-tools entry opens its toolbox');
    return panel;
  };
  return {
    dom,
    owner,
    el,
    locale,
    ...editor,
    toolbar,
    calls,
    before,
    mountContext,
    menu,
    setViewportWidth(next: number) {
      viewportWidth = next;
      toolbar.refresh();
    },
    setWidth(next: number) {
      width = next;
      toolbar.refresh();
    },
    dispose() {
      view.unmount();
      context?.unmount();
      toolbar.unmount();
      surface.unmount();
      dom.window.close();
    },
  };
}

function named(root: ParentNode, name: string): HTMLButtonElement {
  const button = [...root.querySelectorAll<HTMLButtonElement>('button[data-name]')].find(
    (item) => item.dataset.name === name,
  );
  assert.ok(button, `button ${name} exists`);
  return button;
}

function pointer(f: ReturnType<typeof fixture>, button: HTMLButtonElement): void {
  button.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
}

{
  const f = fixture({ ssr: true });
  assert.ok(f.el('toolbar').querySelector('.nabi-compact-bar'));
  const slots = toolbarSlots(f.registry, makeTranslator(f.locale));
  assert.deepEqual(
    f.toolbar.buttons.map((button) => button.el.dataset.name),
    slots.map((slot) => slot.name),
    'the public button list still contains every declared command',
  );
  for (const slot of slots) {
    const button = f.toolbar.buttons.find((candidate) => candidate.el.dataset.name === slot.name)!;
    assert.equal(button.el, f.before.get(slot.name), `SSR preserves ${slot.name} button identity`);
  }
  for (const name of ['b', 'i', 'tc', 'fs']) {
    assert.ok(named(f.el('toolbar'), name).closest('.nabi-compact-bar'), `${name} is a default quick tool`);
  }
  assert.equal(f.el('toolbar').querySelector('.nabi-compact-bar [data-name="undo"]'), null);
  for (const name of ['preview', 'fullscreen']) {
    assert.ok(named(f.el('toolbar').querySelector('.nabi-compact-bar')!, name));
  }
  const hidden = f.toolbar.buttons.find((button) => button.el.dataset.name === customName)!;
  assert.equal(hidden.el.hidden, false, 'menu folding does not mark a valid command unavailable');
  assert.ok(hidden.el.closest('[hidden]'), 'a non-quick command is inside the folded command source');
  const focused = named(f.el('toolbar'), 'b');
  focused.focus();
  f.toolbar.refresh();
  assert.equal(f.owner.activeElement, focused, 'refresh preserves focus on the same visible quick control');
  const menu = f.menu();
  assert.equal(menu.querySelector('.nabi-toolbox-tabs'), null, 'all command groups are shown without category tabs');
  const available = new Set(
    [...menu.querySelectorAll<HTMLButtonElement>('.nabi-toolbox-group button[data-name]')].map(
      (button) => button.dataset.name!,
    ),
  );
  assert.deepEqual(
    [...available],
    f.toolbar.buttons.filter((button) => !button.el.hidden).map((button) => button.el.dataset.name!),
    'the palette contains exactly the available registered wing commands',
  );
  f.dispose();
}

{
  const f = fixture({ ssr: true, quick: [customName, 'missing-command', 'b'] });
  const bar = f.el('toolbar').querySelector('.nabi-compact-bar')!;
  const expected = [customName, 'b'];
  const quick = [...bar.querySelectorAll<HTMLButtonElement>('[data-name]')]
    .map((button) => button.dataset.name!)
    .filter((name) => expected.includes(name));
  assert.deepEqual(quick, expected, 'custom quick names use complete ToolbarSlot names in configured order');
  assert.equal(f.el('toolbar').querySelector('[data-name="missing-command"]'), null);
  f.nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 4 } });
  pointer(f, named(bar, customName));
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: [{ w: 'exCompactTestMark', ch: ['text'] }] }]);
  assert.equal(f.nabi.undo(), true);
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['text'] }]);
  f.dispose();
}

{
  const f = fixture({ width: 320, quick: ['missing-1', 'missing-2', 'missing-3', 'missing-4', 'missing-5', 'b', 'b'] });
  const bar = f.el('toolbar').querySelector('.nabi-compact-bar')!;
  assert.equal(
    bar.querySelectorAll('[data-name="b"]').length,
    1,
    'missing and repeated quick names do not consume slots',
  );
  f.dispose();
}

{
  const f = fixture({ quick: ['b'] });
  f.nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 3 } });
  const selection = f.nabi.getSelection();
  pointer(f, named(f.menu(), customName));
  assert.deepEqual(f.nabi.getSelection(), selection, 'opening and using all-tools preserves the document selection');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['t', { w: 'exCompactTestMark', ch: ['ex'] }, 't'] }]);
  assert.equal(f.nabi.undo(), true);
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['text'] }]);
  f.dispose();
}

{
  const f = fixture({ quick: ['b'] });
  f.nabi.select({ anchor: { path: [0], offset: 2 }, focus: { path: [0], offset: 2 } });
  pointer(f, named(f.menu(), 'tc'));
  assert.equal(hostOf(f.nabi).armed.isArmed('tc'), false, 'menu proxies keep pointer semantics for a collapsed caret');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['text'] }]);
  f.el('surface').focus();
  const save = new f.dom.window.KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  f.el('surface').dispatchEvent(save);
  assert.deepEqual(f.calls, ['save'], 'a valid folded command keeps its accelerator');
  assert.equal(save.defaultPrevented, true);
  f.dispose();
}

{
  const f = fixture({ quick: ['b'] });
  f.el('surface').focus();
  f.nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 4 } });
  const hints = mountHints({ toolbar: f.toolbar, root: f.el('chrome'), surface: f.el('surface') });
  const key = (key: string, code: string): void => {
    (f.owner.activeElement ?? f.el('surface')).dispatchEvent(
      new f.dom.window.KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }),
    );
  };
  key('Shift', 'ShiftLeft');
  key('Shift', 'ShiftLeft');
  const panel = f.owner.querySelector<HTMLElement>('.nabi-toolbox')!;
  assert.equal(panel.hidden, false, 'double Shift opens the all-tools palette');
  assert.equal(hints.active(), true);
  assert.ok(panel.contains(f.owner.activeElement), 'palette entry moves focus into its commands');
  assert.equal(f.el('toolbar').querySelector('[data-hint]'), null, 'legacy letter badges are absent');
  key('i', 'KeyI');
  assert.equal(hostOf(f.nabi).armed.isArmed('i'), false, 'old letter hints cannot invoke folded commands');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['text'] }]);
  hints.hide();
  assert.equal(panel.hidden, true);
  assert.equal(hints.active(), false);
  assert.equal(f.owner.activeElement, f.el('surface'), 'closing returns focus to the editor');
  hints.unmount();
  f.dispose();
}

for (const contextFirst of [false, true]) {
  const f = fixture({ doc: [{ w: 'img', a: { src: '/image.png', alt: 'image' } }], contextFirst });
  const context = f.mountContext();
  const controls = context.buttons();
  assert.ok(controls.length > 0);
  const active = f.el('context');
  assert.ok(
    active.classList.contains('nabi-compact-context'),
    'context stays below the main row in either mount order',
  );
  assert.ok(
    controls.every((button) => active.contains(button)),
    'context keeps its live control nodes',
  );
  assert.equal(active.hidden, false);
  assert.equal(f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-quick')!.hidden, false);
  assert.equal(f.el('toolbar').querySelector('[data-name="context-tools"]'), null);
  assert.equal(f.el('toolbar').querySelector('[data-name="tools-back"]'), null);
  assert.ok(f.el('toolbar').querySelector('[data-name="tools"]'), 'all-tools remains reachable with properties');
  f.toolbar.unmount();
  assert.ok(
    controls.every((button) => active.contains(button)),
    'unmount preserves controls in their owner',
  );
  assert.equal(active.classList.contains('nabi-compact-context'), false);
  assert.equal(context.buttons().length, controls.length, 'standalone context survives compact toolbar teardown');
  f.dispose();
}

{
  const f = fixture({
    width: 1200,
    doc: [{ w: 'p', ch: [{ w: 'tf', a: { v: 'serif' }, ch: [{ w: 'fs', a: { v: 'lg' }, ch: ['text'] }] }] }],
  });
  f.nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  const context = f.mountContext();
  const groups = context.groups();
  const nodes = groups.flatMap((group) => [...group.el.children] as HTMLElement[]);
  const row = f.el('context');
  assert.ok(groups.length >= 2, 'nested formatting supplies multiple context groups');
  assert.ok(groups.every((group) => row.contains(group.el)));
  assert.ok(nodes.every((node) => !node.hidden));
  for (const width of [320, 1200, 320]) {
    f.setWidth(width);
    assert.equal(row.hidden, false, 'property controls appear automatically at every width');
    assert.ok(
      nodes.every((node) => row.contains(node) && !node.hidden),
      'resizing keeps every property visible',
    );
    assert.equal(f.el('toolbar').querySelector('[data-name="context-tools"]'), null);
    assert.equal(f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-quick')!.hidden, false);
  }
  f.locale.setLocale('ko');
  assert.ok(
    nodes.every((node) => row.contains(node) && !node.hidden),
    'locale repaint preserves visible controls',
  );
  const panel = f.menu();
  assert.equal(panel.hidden, false);
  assert.ok(
    nodes.every((node) => row.contains(node)),
    'opening Tools leaves object properties in their own row',
  );
  f.dispose();
}

{
  const f = fixture({
    width: 320,
    doc: [
      { w: 'img', a: { src: '/image.png', alt: 'image' } },
      { w: 'p', ch: [{ w: 'fs', a: { v: 'lg' }, ch: ['formatted'] }] },
      { w: 'p', ch: ['plain'] },
    ],
  });
  const context = f.mountContext();
  const row = f.el('context');
  const stale = context.buttons().find((button) => button.dataset.name === 'view');
  assert.ok(stale);
  assert.equal(row.hidden, false);
  assert.ok(row.contains(stale));
  f.nabi.select({ anchor: { path: [1], offset: 2 }, focus: { path: [1], offset: 2 } });
  assert.equal(row.hidden, false, 'switching to formatting immediately replaces the object controls');
  assert.equal(row.contains(stale), false);
  assert.ok(context.groups().length > 0);
  f.nabi.select({ anchor: { path: [2], offset: 2 }, focus: { path: [2], offset: 2 } });
  assert.equal(context.groups().length, 0);
  assert.equal(row.hidden, true, 'a plain-text selection removes the property row');
  assert.equal(f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-quick')!.hidden, false);
  f.nabi.setJson([{ w: 'p', ch: ['replacement'] }]);
  stale.click();
  assert.equal(f.owner.querySelector('.nabi-lightbox'), null, 'a stale control cannot act on an invalidated target');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['replacement'] }]);
  f.dispose();
}

for (const coordinates of ['layout', 'visual'] as const) {
  for (const occlusion of ['none', 'toolbar', 'keyboard'] as const) {
    const f = fixture({ doc: [{ w: 'p', a: { h: 1 }, ch: ['heading'] }] });
    f.mountContext();
    const offset = 200;
    const origin = coordinates === 'layout' ? offset : 0;
    const top = origin + (occlusion === 'toolbar' ? 80 : occlusion === 'keyboard' ? 450 : 300);
    const rect = (top: number, height: number): DOMRect => new f.dom.window.DOMRect(0, top, 100, height);
    const originalRect = f.dom.window.HTMLElement.prototype.getBoundingClientRect;
    f.dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
      return this.style.position === 'fixed' ? rect(origin - offset, 1) : originalRect.call(this);
    };
    f.el('chrome').getBoundingClientRect = () => rect(origin, 100);
    f.dom.window.Range.prototype.getBoundingClientRect = () => rect(top, 20);
    Object.defineProperty(f.dom.window, 'visualViewport', {
      value: { height: 462, offsetTop: offset },
      configurable: true,
    });
    const pushed: number[] = [];
    f.dom.window.scrollBy = (options: ScrollToOptions | number = {}) => {
      assert.equal(typeof options, 'object');
      pushed.push((options as ScrollToOptions).top ?? 0);
    };
    f.el('surface').focus();
    f.nabi.select({ anchor: { path: [0], offset: 2 }, focus: { path: [0], offset: 2 } });
    const button = named(f.el('context'), 'level:2');
    const down = new f.dom.window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
    button.dispatchEvent(down);
    assert.equal(down.defaultPrevented, true, 'pointer property controls retain the existing editor focus');
    pointer(f, button);
    assert.equal(f.owner.activeElement, f.el('surface'));
    assert.deepEqual(f.nabi.getJson(), [{ w: 'p', a: { h: 2 }, ch: ['heading'] }]);
    assert.deepEqual(
      pushed,
      occlusion === 'none' ? [] : [occlusion === 'toolbar' ? -40 : 28],
      `${coordinates} client coordinates only correct a caret covered by the ${occlusion}`,
    );
    f.dispose();
  }
}

{
  const f = fixture({ quick: [customName, 'b'], ssr: true });
  const source = f.toolbar.buttons.find((button) => button.el.dataset.name === customName)!;
  const before = { json: f.nabi.getJson(), selection: f.nabi.getSelection(), session: f.nabi.sessionId };
  f.menu();
  f.locale.setLocale('ko');
  assert.equal(f.toolbar.buttons.find((button) => button.el.dataset.name === customName)!.el, source.el);
  assert.equal(source.el.getAttribute('aria-label'), '사용자 검토 표시');
  assert.equal(
    named(f.owner.querySelector('.nabi-toolbox')!, customName).getAttribute('aria-label'),
    '사용자 검토 표시',
  );
  f.locale.setLocale('ar');
  assert.equal(f.el('toolbar').dir, 'rtl');
  assert.deepEqual({ json: f.nabi.getJson(), selection: f.nabi.getSelection(), session: f.nabi.sessionId }, before);
  const stale = named(f.owner.querySelector('.nabi-toolbox')!, customName);
  f.toolbar.unmount();
  stale.click();
  f.toolbar.refresh();
  assert.equal(f.owner.querySelector('.nabi-toolbox'), null);
  assert.equal(f.el('toolbar').querySelector('.nabi-compact-bar'), null);
  assert.deepEqual(f.nabi.getJson(), before.json, 'retained menu controls are inert after unmount');
  f.dispose();
}

{
  const f = fixture({ layout: 'wrap', ssr: true });
  assert.equal(f.el('toolbar').querySelector('.nabi-compact-bar'), null);
  assert.equal(f.el('toolbar').querySelector('[data-name="tools"]'), null);
  assert.ok(f.toolbar.buttons.every((button) => !button.el.closest('[hidden]') || button.el.hidden));
  for (const button of f.toolbar.buttons) assert.equal(button.el, f.before.get(button.el.dataset.name!));
  f.dispose();
}

{
  const f = fixture({ viewportWidth: 1280, width: 320, quick: ['b'], ssr: true });
  const context = f.mountContext();
  const strip = f.el('toolbar').querySelector<HTMLElement>('.nabi-strip')!;
  const quick = f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-quick')!;
  const sources = f.toolbar.buttons.map((button) => button.el);
  assert.equal(strip.hidden, false, 'desktop shows all tools even inside a narrow editor');
  assert.equal(quick.hidden, true);
  assert.equal(named(f.el('toolbar'), 'tools').hidden, true);
  assert.ok(sources.every((button) => strip.contains(button)));
  f.setViewportWidth(575);
  assert.equal(strip.hidden, true, 'mobile returns to the compact row below the breakpoint');
  assert.equal(quick.hidden, false);
  assert.equal(named(f.el('toolbar'), 'tools').hidden, false);
  f.setViewportWidth(576);
  assert.equal(strip.hidden, false, 'the breakpoint itself uses the complete toolbar');
  assert.equal(named(f.el('toolbar'), 'tools').hidden, true);
  assert.ok(sources.every((button) => strip.contains(button) && f.before.get(button.dataset.name!) === button));
  assert.equal(context.groups().length, 0);
  f.dispose();
}

{
  const f = fixture({ width: 320, ssr: true, quick: ['b'] });
  const strip = f.el('toolbar').querySelector<HTMLElement>('.nabi-strip')!;
  const bar = f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-bar')!;
  const sources = f.toolbar.buttons.map((button) => button.el);
  f.nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 3 } });
  const selection = f.nabi.getSelection();
  const panel = f.menu();
  named(bar, 'fullscreen').click();
  assert.equal(f.el('app').classList.contains('is-fullscreen'), true);
  assert.equal(f.el('chrome').classList.contains('nabi-expanded'), true);
  assert.equal(strip.hidden, false, 'fullscreen reveals the complete command strip even at narrow widths');
  assert.equal(panel.hidden, true, 'entering fullscreen closes the folded command palette');
  assert.ok(
    sources.every((button) => strip.contains(button)),
    'fullscreen reuses every original command button',
  );
  for (const button of sources) {
    assert.equal(button, f.before.get(button.dataset.name!));
    assert.ok(button.hidden || !button.closest('[hidden]'), `${button.dataset.name} is not folded`);
  }
  assert.equal(named(bar, 'tools').hidden, true);
  assert.equal(bar.querySelector('[data-name="context-tools"]'), null);
  assert.equal(bar.querySelector('[data-name="tools-back"]'), null);
  assert.equal(named(bar, 'fullscreen').closest('[hidden]'), null, 'fullscreen exit stays reachable');
  assert.equal(named(bar, 'preview').closest('[hidden]'), null, 'preview stays reachable');
  assert.deepEqual(f.nabi.getSelection(), selection, 'entering fullscreen preserves the document selection');
  pointer(f, named(strip, customName));
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['t', { w: 'exCompactTestMark', ch: ['ex'] }, 't'] }]);
  assert.equal(f.nabi.undo(), true);
  named(bar, 'fullscreen').click();
  assert.equal(f.el('chrome').classList.contains('nabi-expanded'), false);
  assert.equal(strip.hidden, true, 'exiting fullscreen restores the folded command source');
  assert.equal(named(bar, 'tools').hidden, false);
  assert.ok(named(bar, 'b').closest('.nabi-compact-quick'), 'exiting restores the configured quick commands');
  assert.deepEqual(f.nabi.getSelection(), selection, 'exiting fullscreen preserves the document selection');
  f.dispose();
}

for (const contextFirst of [false, true]) {
  const f = fixture({ width: 320, doc: [{ w: 'img', a: { src: '/image.png', alt: 'image' } }], contextFirst });
  const context = f.mountContext();
  const groups = context.groups();
  const nodes = groups.flatMap((group) => [...group.el.children] as HTMLElement[]);
  assert.ok(
    nodes.every((node) => !node.closest('[hidden]')),
    'narrow compact mode shows all object properties',
  );
  const panel = f.menu();
  setFullscreen(f.el('app'), true);
  await Promise.resolve();
  assert.equal(f.el('chrome').classList.contains('nabi-expanded'), true, 'direct fullscreen changes are observed');
  assert.equal(panel.hidden, true);
  assert.equal(f.el('context').classList.contains('nabi-compact-context'), true);
  assert.ok(
    groups.every((group) => f.el('context').contains(group.el)),
    'fullscreen restores live context groups',
  );
  assert.ok(
    nodes.every((node) => !node.closest('[hidden]')),
    'all object properties are visible in fullscreen',
  );
  setFullscreen(f.el('app'), false);
  await Promise.resolve();
  assert.equal(f.el('chrome').classList.contains('nabi-expanded'), false);
  assert.ok(groups.every((group) => group.el.closest('.nabi-compact-context')));
  assert.ok(
    nodes.every((node) => !node.closest('[hidden]')),
    'exiting keeps every property visible below the compact row',
  );
  setFullscreen(f.el('app'), true);
  await Promise.resolve();
  f.toolbar.unmount();
  assert.equal(f.el('chrome').classList.contains('nabi-expanded'), false, 'unmount releases expanded chrome state');
  assert.equal(f.el('context').classList.contains('nabi-compact-context'), false);
  assert.ok(nodes.every((node) => f.el('context').contains(node) && !node.hidden));
  assert.equal(context.groups().length, groups.length, 'standalone object properties survive fullscreen teardown');
  setFullscreen(f.el('app'), false);
  await Promise.resolve();
  assert.equal(f.el('toolbar').querySelector('.nabi-compact-bar'), null, 'unmounted observers do not rebuild controls');
  f.dispose();
}

{
  const f = fixture({ quick: ['b'] });
  const hints = mountHints({ toolbar: f.toolbar, root: f.el('chrome'), surface: f.el('surface') });
  setFullscreen(f.el('app'), true);
  await Promise.resolve();
  f.el('surface').focus();
  const selection = f.nabi.getSelection();
  const key = (key: string, code: string): void => {
    f.owner.activeElement?.dispatchEvent(
      new f.dom.window.KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }),
    );
  };
  key('Shift', 'ShiftLeft');
  key('Shift', 'ShiftLeft');
  assert.equal(hints.active(), true, 'double Shift starts fullscreen toolbar navigation');
  assert.ok(f.el('chrome').contains(f.owner.activeElement));
  assert.equal(f.owner.activeElement?.closest('[hidden], .nabi-toolbox'), null, 'keyboard entry uses visible controls');
  assert.equal(f.el('toolbar').querySelector<HTMLElement>('.nabi-toolbox')!.hidden, true);
  const first = f.owner.activeElement;
  key('ArrowRight', 'ArrowRight');
  assert.notEqual(f.owner.activeElement, first, 'arrow keys navigate the expanded toolbar');
  hints.hide();
  assert.equal(hints.active(), false);
  assert.equal(f.owner.activeElement, f.el('surface'), 'closing fullscreen navigation restores editor focus');
  assert.deepEqual(f.nabi.getSelection(), selection);
  hints.unmount();
  f.dispose();
}

console.log(
  'compact toolbar: SSR, quick tools, complete menu, pointer/keyboard, context, fullscreen, locale and cleanup passed',
);
