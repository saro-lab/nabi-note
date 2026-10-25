import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountSurface } from '../src/index.js';

const href = 'https://nabi.saro.me/en/';

function fixture() {
  const dom = new JSDOM('<div id="editor"></div>', { pretendToBeVisual: true });
  const root = dom.window.document.getElementById('editor')!;
  const editor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [href] }] });
  const surface = mountSurface({ ...editor, root });
  const point = { path: [0], offset: href.length };
  editor.nabi.select({ anchor: point, focus: point });
  surface.actions.enter();
  editor.nabi.applyCommand('renameLink', { text: 'Nabi' });
  root.focus();
  return {
    ...editor,
    dom,
    root,
    surface,
    insert(text: string, inside = false, composing = false, wrapper?: string) {
      const owner = dom.window.document;
      const paragraph = root.querySelector('p')!;
      let target: Element = inside ? paragraph.querySelector('a')! : paragraph;
      if (wrapper) {
        const nested = owner.createElement(wrapper);
        target.append(nested);
        target = nested;
      }
      const node = owner.createTextNode('');
      target.append(node);
      owner.getSelection()!.collapse(node, 0);
      if (composing) root.dispatchEvent(new dom.window.CompositionEvent('compositionstart', { bubbles: true }));
      root.dispatchEvent(
        new dom.window.InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: composing ? 'insertCompositionText' : 'insertText',
          isComposing: composing,
          data: text,
        }),
      );
      node.data = text;
      owner.getSelection()!.collapse(node, text.length);
      root.dispatchEvent(
        new dom.window.InputEvent('input', {
          bubbles: true,
          inputType: composing ? 'insertCompositionText' : 'insertText',
          isComposing: composing,
          data: text,
        }),
      );
      if (composing)
        root.dispatchEvent(new dom.window.CompositionEvent('compositionend', { bubbles: true, data: text }));
    },
    dispose() {
      surface.unmount();
      dom.window.close();
    },
  };
}

for (const composing of [false, true]) {
  for (const command of ['deleteBackward', 'deleteForward', 'deleteRange']) {
    const f = fixture();
    f.insert(' 뒤쪽 글자', false, composing);
    const expected = [{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['Nabi'] }, ' 뒤쪽 글자'] }];
    assert.deepEqual(f.nabi.getJson(), expected, 'native input outside a renamed link stays outside its stored mark');
    f.nabi.select({
      anchor: { path: [0], offset: command === 'deleteBackward' ? 5 : 4 },
      focus: { path: [0], offset: command === 'deleteForward' ? 4 : 5 },
    });
    f.nabi.applyCommand(command);
    assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['Nabi'] }, '뒤쪽 글자'] }]);
    assert.equal(f.root.querySelector('a')!.textContent, 'Nabi');
    f.nabi.undo();
    assert.deepEqual(f.nabi.getJson(), expected);
    f.nabi.redo();
    assert.equal(f.root.querySelector('a')!.textContent, 'Nabi');
    f.dispose();
  }
}

{
  const f = fixture();
  f.insert('X', true);
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['NabiX'] }] }]);
  f.dispose();
}

{
  const f = fixture();
  f.nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } });
  f.insert('outside', false, false, 'b');
  assert.deepEqual(f.nabi.getJson(), [
    {
      w: 'p',
      ch: [
        { w: 'a', a: { href }, ch: ['Nabi'] },
        { w: 'b', ch: ['outside'] },
      ],
    },
  ]);
  f.dispose();
}

{
  const f = fixture();
  f.nabi.setJson([{ w: 'p', ch: [{ w: 'b', ch: [{ w: 'a', a: { href }, ch: ['Nabi'] }] }] }]);
  const point = { path: [0], offset: 4 };
  f.nabi.select({ anchor: point, focus: point });
  f.nabi.applyCommand('setMark', { w: 'b', a: null });
  f.insert('outside');
  assert.deepEqual(f.nabi.getJson(), [
    { w: 'p', ch: [{ w: 'b', ch: [{ w: 'a', a: { href }, ch: ['Nabi'] }] }, 'outside'] },
  ]);
  f.dispose();
}

{
  const f = fixture();
  f.nabi.applyCommand('setMark', { w: 'a', a: { href } });
  f.insert('linked');
  assert.deepEqual(f.nabi.getJson(), [{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['Nabilinked'] }] }]);
  f.dispose();
}
