import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  createNabiWith,
  defaultWings,
  mountContextToolbar,
  mountSurface,
  mountToolbar,
  type ContextToolbar,
  type Toolbar,
} from '../src/index.js';
import { compactKeepsFocus } from '../src/ui/compact.js';

function fixture(image = true, mobile = true) {
  const dom = new JSDOM('<!doctype html><main><div id="surface"></div><button id="outside">Outside</button></main>', {
    pretendToBeVisual: true,
    url: 'https://example.test',
  });
  const owner = dom.window.document;
  if (mobile) {
    Object.defineProperty(dom.window, 'innerWidth', { value: 390 });
    Object.defineProperty(owner.documentElement, 'clientWidth', { value: 390 });
  }
  const surfaceRoot = owner.getElementById('surface')!;
  const editor = createNabiWith(defaultWings, {
    doc: image ? [{ w: 'img', a: { src: '/image.png', alt: 'Image' } }] : [{ w: 'p', ch: ['text'] }],
  });
  const surface = mountSurface({ ...editor, root: surfaceRoot });
  const toolbars: Toolbar[] = [];
  const contexts: ContextToolbar[] = [];
  const root = (toolbar: boolean): HTMLElement => {
    const parent = owner.createElement('div');
    if (toolbar) parent.className = 'nabi-toolbar';
    const row = owner.createElement('div');
    if (toolbar) Object.defineProperty(row, 'clientWidth', { configurable: true, value: 320 });
    parent.append(row);
    owner.body.append(parent);
    return row;
  };
  const addToolbar = (row = root(true)): Toolbar => {
    const toolbar = mountToolbar({ ...editor, root: row, surface: surfaceRoot });
    toolbars.push(toolbar);
    return toolbar;
  };
  const addContext = (): ContextToolbar => {
    const context = mountContextToolbar({ ...editor, root: root(false), surface: surfaceRoot });
    contexts.push(context);
    return context;
  };
  return {
    ...editor,
    dom,
    owner,
    surfaceRoot,
    root,
    addToolbar,
    addContext,
    dispose() {
      for (const context of contexts) context.unmount();
      for (const toolbar of toolbars) toolbar.unmount();
      surface.unmount();
      dom.window.close();
    },
  };
}

function named(root: ParentNode, name: string): HTMLButtonElement {
  const button = root.querySelector<HTMLButtonElement>(`button[data-name="${name}"]`);
  assert.ok(button, `button ${name} exists`);
  return button;
}

function owns(toolbar: Toolbar, context: ContextToolbar): boolean {
  return (
    toolbar.root.classList.contains('nabi-compact-row') &&
    context.root.classList.contains('nabi-compact-context') &&
    context.groups().length > 0 &&
    context.groups().every((group) => context.root.contains(group.el))
  );
}

for (const contextFirst of [false, true]) {
  const f = fixture();
  const context = contextFirst ? f.addContext() : null;
  const first = f.addToolbar();
  const port = context ?? f.addContext();
  assert.ok(owns(first, port));
  const original = port.groups().map((group) => group.el);
  const second = f.addToolbar();
  assert.ok(owns(second, port), 'the last toolbar receives the existing context nodes');
  assert.equal(first.root.querySelector('.nabi-compact-context'), null);
  assert.equal(first.root.querySelector<HTMLElement>('.nabi-compact-quick')!.hidden, false);
  first.refresh();
  assert.ok(owns(second, port), 'an earlier toolbar refresh cannot reclaim the active context');
  named(first.root, 'tools').click();
  assert.equal(first.root.querySelector('[data-name="context-tools"]'), null);
  second.unmount();
  assert.ok(owns(first, port), 'the preceding toolbar keeps properties connected when the last toolbar closes');
  assert.equal(port.root.hidden, false, 'property controls remain visible without an entry button');
  assert.deepEqual(
    port.groups().map((group) => group.el),
    original,
    'ownership transfer preserves live nodes',
  );
  const stopped = second.root.innerHTML;
  second.unmount();
  port.refresh();
  assert.ok(owns(first, port));
  assert.equal(second.root.innerHTML, stopped, 'a closed toolbar receives no further context updates');
  f.dispose();
}

{
  const f = fixture();
  const first = f.addToolbar();
  const second = f.addToolbar();
  const context = f.addContext();
  first.unmount();
  assert.ok(owns(second, context), 'removing an inactive toolbar preserves the active owner');
  assert.ok(context.root.classList.contains('nabi-compact-context'));
  first.refresh();
  context.refresh();
  assert.ok(owns(second, context));
  second.unmount();
  assert.ok(context.groups().every((group) => context.root.contains(group.el)));
  assert.equal(context.root.classList.contains('nabi-compact-context'), false);
  f.dispose();
}

for (const removeInactive of [false, true]) {
  const f = fixture();
  const toolbar = f.addToolbar();
  const first = f.addContext();
  const firstGroups = first.groups().map((group) => group.el);
  const second = f.addContext();
  assert.ok(owns(toolbar, second));
  assert.ok(
    firstGroups.every((group) => first.root.contains(group)),
    'a displaced context keeps its own nodes',
  );
  assert.equal(first.root.classList.contains('nabi-compact-context'), false);
  first.refresh();
  assert.ok(owns(toolbar, second), 'inactive context updates do not change ownership');
  if (removeInactive) {
    first.unmount();
    assert.ok(owns(toolbar, second), 'removing an inactive context leaves the active context connected');
  } else {
    second.unmount();
    assert.ok(owns(toolbar, first), 'the preceding context reconnects after the last one unmounts');
    const stopped = second.root.innerHTML;
    first.refresh();
    assert.equal(second.root.innerHTML, stopped);
  }
  f.dispose();
}

{
  const f = fixture();
  const first = f.addToolbar();
  const context = f.addContext();
  const row = f.root(true);
  let fail = true;
  Object.defineProperty(row, 'clientWidth', {
    get() {
      if (fail) {
        fail = false;
        throw new Error('compact width failure');
      }
      return 532;
    },
  });
  assert.throws(() => f.addToolbar(row), /compact width failure/);
  assert.ok(owns(first, context), 'a failed new toolbar restores the previous context owner');
  assert.equal(row.querySelector('.nabi-ctx-group'), null);
  f.dispose();
}

{
  const f = fixture(false, true);
  const first = f.addToolbar();
  const second = f.addToolbar();
  named(first.root, 'tools').click();
  assert.equal(compactKeepsFocus(f.nabi), true, 'an earlier toolbar panel still keeps the keyboard closed');
  second.unmount();
  assert.equal(compactKeepsFocus(f.nabi), true);
  first.unmount();
  assert.equal(compactKeepsFocus(f.nabi), false);
  f.dispose();
}

{
  const f = fixture(false, true);
  const toolbar = f.addToolbar();
  named(toolbar.root, 'tools').click();
  f.owner.getElementById('outside')!.dispatchEvent(new f.dom.window.Event('pointerdown', { bubbles: true }));
  assert.equal(toolbar.root.querySelector<HTMLElement>('.nabi-toolbox')!.hidden, true);
  f.surfaceRoot.focus();
  f.surfaceRoot.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart'));
  f.surfaceRoot.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  assert.equal(f.owner.activeElement, f.surfaceRoot, 'closing tools cancels later IME focus into the hidden panel');
  named(toolbar.root, 'tools').click();
  named(toolbar.root.querySelector('.nabi-toolbox')!, 'a').click();
  const input = toolbar.root.querySelector<HTMLInputElement>('.nabi-prompt input')!;
  assert.ok(input);
  assert.equal(f.owner.activeElement, input);
  f.surfaceRoot.dispatchEvent(new f.dom.window.CompositionEvent('compositionend'));
  await Promise.resolve();
  assert.equal(f.owner.activeElement, input, 'opening a prompt cancels the preceding menu focus request');
  f.dispose();
}

console.log('compact ownership regressions passed');
