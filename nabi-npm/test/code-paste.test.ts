import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountSurface } from '../src/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { nodeAt } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { NABI_CLIPBOARD_MIME } from '../src/surface/clipboard.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const code = (text: string): ElementNode => ({
  w: 'p',
  ch: [
    {
      w: 'code',
      a: { lang: 'typescript' },
      ch: text.split('\n').flatMap((line, index) => [...(index ? [{ w: 'br', ch: [] }] : []), ...(line ? [line] : [])]),
    },
  ],
});
const envelope = (body: NabiDoc): string => JSON.stringify({ version: 1, body });

function fixture(doc: NabiDoc) {
  const dom = new JSDOM('<div id="surface"></div>', { pretendToBeVisual: true });
  globalThis.DOMParser = dom.window.DOMParser;
  const root = dom.window.document.getElementById('surface')!;
  const errors: unknown[] = [];
  const editor = createNabiWith(defaultWings, { doc, typingMergeMs: 0, onError: (error) => errors.push(error) });
  let choices = 0;
  let uploads = 0;
  let urls = 0;
  const stopAsk = hostOf(editor.nabi).bindChoose(() => (++choices, 0));
  const surface = mountSurface({
    ...editor,
    root,
    fileSink: () => uploads++,
    onPasteUrl: () => (++urls, 'title'),
  });
  root.focus();
  return {
    ...editor,
    root,
    paste(selection: Selection, plain = '', html = '', custom = '', files: File[] = []) {
      editor.nabi.select(selection);
      assert.deepEqual(editor.nabi.getSelection(), selection);
      const values = new Map([
        ['text/plain', plain],
        ['text/html', html],
        [NABI_CLIPBOARD_MIME, custom],
      ]);
      const event = new dom.window.Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', {
        value: { files, types: [...values.keys()], getData: (type: string) => values.get(type) ?? '' },
      });
      root.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
    },
    close() {
      assert.deepEqual(errors, []);
      assert.equal(choices, 0);
      assert.equal(uploads, 0);
      assert.equal(urls, 0);
      stopAsk();
      surface.unmount();
      dom.window.close();
      Reflect.deleteProperty(globalThis, 'DOMParser');
    },
  };
}

const scopes: readonly { path: readonly number[]; wrap: (block: ElementNode) => NabiDoc }[] = [
  { path: [0, 0], wrap: (block) => [block, p('outside')] },
  {
    path: [0, 0, 0, 0],
    wrap: (block) => [{ w: 'p', ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch: [block] }] }, p('outside')],
  },
  {
    path: [0, 0, 0, 0, 0, 0],
    wrap: (block) => [
      { w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [block] }] }] }] },
      p('outside'),
    ],
  },
];

for (const { path, wrap } of scopes) {
  for (const text of ['  x\r\n\t<y>\r\n\r\n', '```js\n**literal**\n```', 'https://example.com/source', '\n\n']) {
    const original = wrap(code('ABCD'));
    const editor = fixture(original);
    const identity = nodeAt(hostOf(editor.nabi).doc(), path)?._id;
    const selection = { anchor: { path, offset: 3 }, focus: { path, offset: 1 } };
    const normalized = text.replace(/\r\n?/g, '\n');
    editor.paste(selection, text, '<p><strong>wrong format</strong></p>', envelope([code('wrong source')]));
    assert.deepEqual(editor.nabi.getJson(), wrap(code(`A${normalized}D`)));
    assert.equal(nodeAt(hostOf(editor.nabi).doc(), path)?._id, identity);
    assert.deepEqual(editor.nabi.getSelection(), caretAt({ path, offset: normalized.length + 1 }));
    assert.equal(editor.nabi.undo(), true);
    assert.deepEqual(editor.nabi.getJson(), original);
    assert.deepEqual(editor.nabi.getSelection(), selection);
    assert.equal(editor.nabi.redo(), true);
    assert.equal(editor.nabi.applyCommand('insertText', { text: '!' }), true);
    assert.deepEqual(editor.nabi.getJson(), wrap(code(`A${normalized}!D`)));
    editor.close();
  }
}

for (const data of [
  {
    html: '',
    custom: envelope([{ w: 'p', ch: ['x', { w: 'fn', a: { t: 'note' }, ch: [] }, { w: 'b', ch: ['y'] }] }]),
    text: 'xy',
  },
  { html: '', custom: envelope([code('  first\n\nsecond\n')]), text: '  first\n\nsecond\n' },
  { html: '<pre><code>  first\n\nsecond\n</code></pre>', custom: '', text: '  first\n\nsecond\n' },
  {
    html: '<p><strong>first</strong></p><p></p><p><a href="https://example.com">second</a></p>',
    custom: '',
    text: 'first\n\nsecond',
  },
  { html: '<table><tr><td>first</td><td>second</td></tr></table>', custom: '', text: 'first\nsecond' },
]) {
  const editor = fixture([code('AB')]);
  editor.paste(caretAt({ path: [0, 0], offset: 1 }), '', data.html, data.custom);
  assert.deepEqual(editor.nabi.getJson(), [code(`A${data.text}B`)]);
  assert.deepEqual(editor.nabi.getSelection(), caretAt({ path: [0, 0], offset: data.text.length + 1 }));
  editor.close();
}

{
  const original = [code('AB')];
  const editor = fixture(original);
  const selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 2 } };
  editor.paste(selection, '', '<img src="https://example.com/image.png">');
  assert.deepEqual(editor.nabi.getJson(), original);
  assert.deepEqual(editor.nabi.getSelection(), selection);
  editor.paste(selection, '', '', '', [new File(['image'], 'image.png', { type: 'image/png' })]);
  assert.deepEqual(editor.nabi.getJson(), original);
  editor.close();
}

{
  const editor = fixture([p()]);
  editor.paste(
    caretAt({ path: [0], offset: 0 }),
    'source',
    '<pre><code>source</code></pre>',
    envelope([code('source')]),
  );
  assert.deepEqual(editor.nabi.getJson(), [code('source')]);
  editor.close();
}

console.log('code paste: plain text, rich fallback, nested scopes, caret, undo, and file rejection passed');
