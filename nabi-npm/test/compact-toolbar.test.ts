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
}

function fixture(options: FixtureOptions = {}) {
  const dom = new JSDOM(
    '<!doctype html><div id="app" class="nabi"><div id="chrome" class="nabi-toolbar"><div id="toolbar"></div><div id="context"></div><div id="tools"></div></div><div id="surface" class="nabi-content"></div></div>',
    { url: 'https://example.test', pretendToBeVisual: true },
  );
  const owner = dom.window.document;
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
  const active = f.el('toolbar').querySelector('.nabi-compact-context');
  assert.ok(active, 'context registration switches the compact row in either mount order');
  assert.ok(
    controls.some((button) => active.contains(button)),
    'context reuses live control nodes',
  );
  assert.ok(f.el('toolbar').querySelector('[data-name="tools"]'), 'all-tools remains reachable in context mode');
  f.toolbar.unmount();
  assert.ok(
    controls.every((button) => f.el('context').contains(button)),
    'unmount returns context controls to their owner',
  );
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
  const row = f.el('toolbar').querySelector('.nabi-compact-context')!;
  const more = named(f.el('toolbar'), 'context-tools');
  assert.ok(groups.length >= 2, 'nested formatting supplies multiple context groups');
  assert.ok(
    groups.every((group) => row.contains(group.el)),
    'every fitting context group shares the row',
  );
  assert.ok(nodes.every((node) => !node.hidden));
  assert.equal(more.hidden, true, 'object properties is absent when every control fits');
  f.setWidth(320);
  assert.equal(more.hidden, false, 'object properties appears only when controls overflow');
  assert.equal(more.getAttribute('aria-label'), 'Object properties');
  assert.equal(named(f.el('toolbar'), 'tools').nextElementSibling, more, 'properties follows all-tools');
  assert.ok(
    nodes.some((node) => node.hidden),
    'the narrow row folds some controls',
  );
  more.click();
  const panel = f.el('toolbar').querySelector<HTMLElement>('.nabi-toolbox')!;
  assert.equal(panel.hidden, false);
  assert.ok(
    nodes.every((node) => panel.contains(node) && !node.hidden),
    'the panel restores every live control',
  );
  f.locale.setLocale('ko');
  assert.equal(more.getAttribute('aria-label'), '객체 속성');
  assert.ok(
    nodes.every((node) => panel.contains(node) && !node.hidden),
    'locale repaint preserves visible controls',
  );
  f.setWidth(1200);
  assert.equal(more.hidden, true, 'growing the editor removes the overflow entry while its panel is open');
  assert.equal(panel.hidden, true, 'an unnecessary context panel closes when every control fits');
  assert.ok(
    nodes.every((node) => row.contains(node) && !node.hidden),
    'resizing restores all fitting controls',
  );
  f.dispose();
}

{
  const f = fixture({ width: 320, doc: [{ w: 'img', a: { src: '/image.png', alt: 'image' } }] });
  const context = f.mountContext();
  const stale = context.buttons().find((button) => button.dataset.name === 'view');
  assert.ok(stale);
  const more = named(f.el('toolbar'), 'context-tools');
  assert.equal(more.hidden, false);
  more.click();
  const panel = f.el('toolbar').querySelector<HTMLElement>('.nabi-toolbox')!;
  assert.equal(panel.hidden, false);
  assert.ok(panel.contains(stale));
  f.nabi.setJson([{ w: 'p', ch: ['replacement'] }]);
  assert.equal(context.groups().length, 0);
  assert.equal(panel.hidden, true, 'removing the selected object closes its properties panel');
  assert.equal(more.hidden, true);
  assert.equal(f.el('toolbar').querySelector<HTMLElement>('.nabi-compact-quick')!.hidden, false);
  assert.equal(named(f.el('toolbar'), 'tools').getAttribute('aria-expanded'), 'false');
  stale.click();
  assert.equal(f.owner.querySelector('.nabi-lightbox'), null, 'a moved control cannot act on an invalidated target');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: ['replacement'] }]);
  f.dispose();
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

console.log('compact toolbar: SSR, quick tools, complete menu, pointer/keyboard, context, locale and cleanup passed');
