import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  createNabiWith,
  defaultWings,
  mountSurface,
  mountToolbar,
  type ToolbarOptions,
  type ToolbarPanelContext,
} from '../src/index.js';

function fixture(panels: ToolbarOptions['panels'], mobile: boolean, mode?: 'modal' | 'inline') {
  const dom = new JSDOM(
    '<!doctype html><div class="nabi"><div class="nabi-toolbar"><div id="toolbar"></div></div><div id="surface"></div></div>',
    { url: 'https://example.test', pretendToBeVisual: true },
  );
  const owner = dom.window.document;
  Object.defineProperty(dom.window, 'innerWidth', { value: mobile ? 390 : 1280 });
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
  const configured = mode
    ? (Object.fromEntries(
        Object.entries(panels ?? {}).map(([name, render]) => [name, { mode, render }]),
      ) as ToolbarOptions['panels'])
    : panels;
  const toolbar = mountToolbar({ ...editor, root, surface: surfaceRoot, panels: configured, quick: ['img'] });
  const press = (name = 'img') => toolbar.buttons.find((button) => button.el.dataset.name === name)!.press('pointer');
  surfaceRoot.focus();
  const point = { path: [1], offset: 6 };
  editor.nabi.select({ anchor: point, focus: point });
  return {
    ...editor,
    dom,
    owner,
    surfaceRoot,
    toolbar,
    press,
    compose() {
      surfaceRoot.dispatchEvent(new dom.window.CompositionEvent('compositionstart', { bubbles: true, data: '' }));
      const paragraph = surfaceRoot.querySelectorAll('p')[1]!;
      paragraph.textContent = 'target한';
      owner.getSelection()!.collapse(paragraph.firstChild, 7);
      surfaceRoot.dispatchEvent(
        new dom.window.InputEvent('input', {
          bubbles: true,
          inputType: 'insertCompositionText',
          data: '한',
          isComposing: true,
        }),
      );
    },
    dispose() {
      toolbar.unmount();
      surface.unmount();
      dom.window.close();
    },
  };
}

function search(context: ToolbarPanelContext): HTMLInputElement {
  const input = context.root.ownerDocument.createElement('input');
  context.root.append(input);
  input.focus();
  return input;
}

for (const mode of [undefined, 'modal', 'inline'] as const) {
  for (const mobile of [false, true]) {
    for (const composing of [false, true]) {
      let panel!: ToolbarPanelContext;
      let input!: HTMLInputElement;
      const f = fixture(
        {
          img(context) {
            panel = context;
            input = search(context);
          },
        },
        mobile,
        mode,
      );
      if (composing) f.compose();
      f.press();
      await Promise.resolve();
      assert.equal(f.owner.activeElement, input, 'opening and delayed composition settling preserve host input focus');
      const text = composing ? 'target한' : 'target';
      assert.ok(f.nabi.getHtml().includes(text), 'leaving the editor commits any visible composition');
      assert.equal(panel.run('insertImage', { src: '/picked.png' }), true, 'an unchanged valid selection can submit');
      const html = f.nabi.getHtml();
      assert.ok(html.indexOf(text) < html.indexOf('<img') && html.indexOf('<img') < html.indexOf('last'));
      assert.equal(panel.run('insertImage', { src: '/duplicate.png' }), false);
      f.dispose();
    }

    {
      let rendered = 0;
      const f = fixture(
        {
          img() {
            rendered += 1;
          },
        },
        mobile,
        mode,
      );
      f.compose();
      const stop = f.nabi.onChange((change) => {
        if (change.doc) f.toolbar.unmount();
      });
      f.press();
      assert.equal(rendered, 0, 'unmounting during blur prevents a later host render');
      assert.equal(f.owner.querySelector('.nabi-custom-panel'), null, 'the pending panel does not survive unmount');
      stop();
      f.dispose();
    }

    {
      let first!: ToolbarPanelContext;
      let next!: ToolbarPanelContext;
      let nextInput!: HTMLInputElement;
      let cleaned = 0;
      const f = fixture(
        {
          img(context) {
            first = context;
            search(context);
            return () => {
              cleaned += 1;
              f.press('youtube');
            };
          },
          youtube(context) {
            next = context;
            nextInput = search(context);
          },
        },
        mobile,
        mode,
      );
      f.press();
      first.close();
      await Promise.resolve();
      assert.equal(cleaned, 1);
      assert.equal(
        f.owner.activeElement,
        nextInput,
        'the old panel finishes restoring focus before cleanup opens another',
      );
      assert.equal(f.owner.querySelectorAll('.nabi-custom-panel').length, 1);
      f.toolbar.unmount();
      assert.equal(next.signal.aborted, true, 'the replacement panel remains owned by the toolbar');
      assert.equal(next.root.isConnected, false);
      f.dispose();
    }

    for (const action of ['toggle', 'other', 'run'] as const) {
      let panel!: ToolbarPanelContext;
      let reentered: boolean | undefined;
      let nestedOpened = 0;
      let cleaned = 0;
      const f = fixture(
        {
          img(context) {
            panel = context;
            search(context);
            return () => {
              cleaned += 1;
              reentered = f.press('youtube');
            };
          },
          youtube() {
            nestedOpened += 1;
          },
        },
        mobile,
        mode,
      );
      f.press();
      if (action === 'toggle') f.press();
      else if (action === 'other') f.press('a');
      else assert.equal(panel.run('insertImage', { src: '/picked.png' }), true);
      assert.equal(reentered, false, 'cleanup cannot override the explicit toolbar action that closed its panel');
      assert.equal(nestedOpened, 0);
      assert.equal(cleaned, 1);
      assert.equal(panel.signal.aborted, true);
      assert.equal(f.owner.querySelectorAll('.nabi-custom-panel').length, 0);
      if (action === 'other')
        assert.ok(f.owner.querySelector('.nabi-prompt'), 'the explicitly requested next tool opens');
      f.dispose();
    }
  }
}

console.log('toolbar panel selection, composition, and reentrant cleanup regressions passed');
