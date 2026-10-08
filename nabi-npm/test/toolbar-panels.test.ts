import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  createNabiWith,
  defaultWings,
  mountSurface,
  mountToolbar,
  renderToolbarHtml,
  type ToolbarOptions,
  type ToolbarPanelContext,
} from '../src/index.js';

function fixture(panels?: ToolbarOptions['panels'], mobile = false, ssr = false) {
  const dom = new JSDOM(
    '<!doctype html><div class="nabi"><div class="nabi-toolbar"><div id="toolbar"></div></div><div id="surface"></div></div><button id="outside">Outside</button>',
    { url: 'https://example.test', pretendToBeVisual: true },
  );
  const owner = dom.window.document;
  let width = mobile ? 390 : 1280;
  Object.defineProperty(dom.window, 'innerWidth', { get: () => width });
  Object.defineProperty(owner.documentElement, 'clientWidth', { get: () => width });
  const root = owner.getElementById('toolbar')!;
  const surfaceRoot = owner.getElementById('surface')!;
  Object.defineProperty(root, 'clientWidth', { value: 390 });
  const editor = createNabiWith(defaultWings, {
    doc: [
      { w: 'p', ch: ['first'] },
      { w: 'p', ch: ['target'] },
      { w: 'p', ch: ['last'] },
    ],
  });
  const surface = mountSurface({ ...editor, root: surfaceRoot });
  if (ssr) root.innerHTML = renderToolbarHtml({ registry: editor.registry });
  const original = root.querySelector('[data-name="img"]');
  const toolbar = mountToolbar({ ...editor, root, surface: surfaceRoot, ...(panels ? { panels } : {}) });
  const press = (name = 'img') => {
    const button = toolbar.buttons.find((button) => button.el.dataset.name === name);
    assert.ok(button, `registered toolbar button ${name}`);
    return button.press('pointer');
  };
  return {
    ...editor,
    dom,
    owner,
    root,
    surfaceRoot,
    original,
    toolbar,
    press,
    resize(next: number) {
      width = next;
      toolbar.refresh();
    },
    dispose() {
      toolbar.unmount();
      surface.unmount();
      dom.window.close();
    },
  };
}

{
  const f = fixture();
  f.press();
  assert.ok(f.owner.querySelector('.nabi-prompt input[data-name="src"]'), 'default URL prompt remains available');
  f.dispose();
}

for (const mobile of [false, true]) {
  let panel!: ToolbarPanelContext;
  let cleaned = 0;
  const f = fixture(
    {
      img(context) {
        panel = context;
        const button = context.root.ownerDocument.createElement('button');
        button.textContent = 'My image';
        context.root.append(button);
        return () => {
          cleaned += 1;
        };
      },
    },
    mobile,
    true,
  );
  assert.equal(f.toolbar.buttons.find((button) => button.w === 'img')!.el, f.original, 'SSR keeps its image button');
  const position = { path: [1], offset: 0 };
  f.nabi.select({ anchor: position, focus: position });
  assert.equal(f.press(), true);
  assert.ok(panel.root.isConnected, 'host receives a connected content root');
  assert.equal(panel.nabi, f.nabi);
  assert.equal(panel.signal.aborted, false);
  assert.equal(f.owner.querySelector('.nabi-prompt'), null, 'custom panel replaces the URL form');
  f.nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  assert.equal(panel.run('insertImage', { src: 'https://example.test/picked.png' }), true);
  const html = f.nabi.getHtml();
  assert.ok(
    html.indexOf('target') < html.indexOf('<img') && html.indexOf('<img') < html.indexOf('last'),
    `insertion uses the selection from opening: ${html}`,
  );
  assert.equal(panel.signal.aborted, true);
  assert.equal(panel.root.isConnected, false);
  assert.equal(cleaned, 1);
  const after = f.nabi.getJson();
  assert.equal(panel.run('insertImage', { src: '/late.png' }), false, 'late async completion cannot insert twice');
  assert.deepEqual(f.nabi.getJson(), after);
  panel.close();
  assert.equal(cleaned, 1);
  f.dispose();
}

for (const reason of ['toggle', 'other-tool', 'escape', 'outside', 'resize', 'unmount'] as const) {
  let panel!: ToolbarPanelContext;
  let cleaned = 0;
  const f = fixture({
    img(context) {
      panel = context;
      const button = context.root.ownerDocument.createElement('button');
      context.root.append(button);
      context.onDispose(() => {
        cleaned += 1;
      });
    },
  });
  f.press();
  if (reason === 'toggle') f.press();
  if (reason === 'other-tool') f.press('a');
  if (reason === 'escape')
    panel.root.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  if (reason === 'outside')
    f.owner.getElementById('outside')!.dispatchEvent(new f.dom.window.Event('pointerdown', { bubbles: true }));
  if (reason === 'resize') f.resize(390);
  if (reason === 'unmount') f.toolbar.unmount();
  assert.equal(panel.signal.aborted, true, `${reason} aborts the panel session`);
  assert.equal(cleaned, 1, `${reason} disposes the host UI once`);
  assert.equal(panel.run('insertImage', { src: '/late.png' }), false);
  f.dispose();
}

{
  let panel!: ToolbarPanelContext;
  const f = fixture({
    img(context) {
      panel = context;
    },
  });
  f.press();
  f.nabi.setJson([{ w: 'p', ch: ['replacement document'] }]);
  assert.equal(
    panel.run('insertImage', { src: '/stale.png' }),
    false,
    'a replaced document invalidates the saved selection',
  );
  assert.equal(f.nabi.getHtml().includes('<img'), false);
  f.dispose();
}

{
  let panel!: ToolbarPanelContext;
  let cleaned = 0;
  let fail = true;
  const f = fixture({
    img(context) {
      panel = context;
      context.onDispose(() => {
        cleaned += 1;
      });
      if (fail) throw new Error('host UI failed');
    },
  });
  assert.throws(() => f.press(), /host UI failed/);
  assert.equal(panel.signal.aborted, true, 'a failed mount aborts any started request');
  assert.equal(panel.root.isConnected, false);
  assert.equal(cleaned, 1, 'registered cleanup rolls back a partially mounted UI');
  fail = false;
  f.press();
  assert.equal(panel.root.isConnected, true, 'the toolbar remains usable after a host error');
  f.dispose();
  assert.equal(cleaned, 2);
}

{
  let panel!: ToolbarPanelContext;
  let cleaned = 0;
  const f = fixture({
    img(context) {
      panel = context;
      context.close();
      return () => {
        cleaned += 1;
      };
    },
  });
  f.press();
  assert.equal(panel.signal.aborted, true);
  assert.equal(cleaned, 1, 'cleanup returned after a synchronous close still runs');
  f.dispose();
}

{
  let panel!: ToolbarPanelContext;
  const f = fixture(
    {
      img(context) {
        panel = context;
        const input = context.root.ownerDocument.createElement('input');
        const button = context.root.ownerDocument.createElement('button');
        context.root.append(input, button);
        input.focus();
      },
    },
    true,
  );
  f.press();
  await Promise.resolve();
  await Promise.resolve();
  const input = panel.root.querySelector('input')!;
  assert.equal(f.owner.activeElement, input, 'mobile auto-focus does not steal focus from a host search input');
  const before = f.nabi.getJson();
  const key = new f.dom.window.KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true });
  input.dispatchEvent(key);
  assert.equal(key.defaultPrevented, false, 'custom inputs retain their native editing shortcuts');
  assert.deepEqual(f.nabi.getJson(), before);
  assert.equal(panel.signal.aborted, false);
  f.dispose();
}

for (const mode of ['modal', 'inline'] as const) {
  for (const mobile of [false, true]) {
    let panel!: ToolbarPanelContext;
    let cleaned = 0;
    const f = fixture(
      {
        img: {
          mode,
          render(context) {
            panel = context;
            assert.equal(context.root.childElementCount, 0, 'host starts with an empty content root');
            return () => {
              cleaned += 1;
            };
          },
        },
      },
      mobile,
    );
    const point = { path: [1], offset: 0 };
    f.nabi.select({ anchor: point, focus: point });
    f.press();
    const modal = mode === 'modal' || mobile;
    assert.equal(!!f.owner.querySelector('.nabi-scrim'), modal);
    assert.equal(!!f.owner.querySelector('[aria-modal="true"]'), modal);
    assert.equal(!!f.owner.querySelector('.nabi-custom-fullscreen'), mode === 'inline' && mobile);
    assert.equal(f.surfaceRoot.closest('.nabi')!.hasAttribute('inert'), modal);
    assert.equal(f.owner.querySelector('.nabi-prompt'), null);
    assert.equal(panel.root.querySelector('button, input'), null);
    f.nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
    const { insertImage } = panel;
    assert.equal(insertImage('/selected.png', 'pointer'), true);
    const html = f.nabi.getHtml();
    assert.ok(html.indexOf('target') < html.indexOf('<img') && html.indexOf('<img') < html.indexOf('last'));
    assert.equal(cleaned, 1);
    assert.equal(panel.signal.aborted, true);
    assert.equal(insertImage('/duplicate.png'), false);
    assert.equal(f.owner.querySelector('.nabi-scrim, [inert]'), null);
    assert.equal(f.owner.activeElement, f.surfaceRoot);
    f.press();
    const { close } = panel;
    close();
    close();
    assert.equal(cleaned, 2);
    assert.equal(insertImage('/late.png'), false);
    f.press();
    f.nabi.setJson([{ w: 'p', ch: ['changed'] }]);
    assert.equal(panel.insertImage('/stale.png'), false);
    f.press();
    assert.equal(panel.insertImage('javascript:alert(1)'), false);
    assert.equal(f.nabi.getHtml().includes('<img'), false);
    f.dispose();
  }
}

for (const mode of ['modal', 'inline'] as const) {
  for (const reason of ['escape', 'outside', 'unmount', 'error'] as const) {
    let panel!: ToolbarPanelContext;
    let cleaned = 0;
    const f = fixture(
      {
        img: {
          mode,
          render(context) {
            panel = context;
            context.onDispose(() => {
              cleaned += 1;
            });
            if (reason === 'error') throw new Error('render failed');
          },
        },
      },
      true,
    );
    if (reason === 'error') assert.throws(() => f.press(), /render failed/);
    else {
      f.press();
      if (reason === 'escape')
        panel.root.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      if (reason === 'outside')
        f.owner.querySelector('.nabi-scrim')!.dispatchEvent(new f.dom.window.Event('pointerdown', { bubbles: true }));
      if (reason === 'unmount') f.toolbar.unmount();
    }
    assert.equal(panel.signal.aborted, true);
    assert.equal(cleaned, 1);
    assert.equal(f.owner.querySelector('.nabi-scrim, .nabi-custom-panel, [inert]'), null);
    assert.equal(panel.insertImage('/late.png'), false);
    f.dispose();
  }
}

console.log('toolbar panels: defaults, SSR, insertion, cancellation, rollback and host focus passed');
