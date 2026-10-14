import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountPickedMark, mountSurface } from '../src/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { nodeAt, positionExists } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { NABI_CLIPBOARD_MIME } from '../src/surface/clipboard.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const table: ElementNode = {
  w: 'p',
  a: { a: 'r' },
  ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', a: { bg: 'yellow' }, ch: [p('cell')] }] }] }],
};
const float = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch }],
});
const at = (path: readonly number[], offset = 0) => ({ path, offset });
const rig = (doc: NabiDoc) => {
  const dom = new JSDOM('<div id="surface"></div>', { pretendToBeVisual: true });
  globalThis.DOMParser = dom.window.DOMParser;
  const root = dom.window.document.getElementById('surface')!;
  const editor = createNabiWith(defaultWings, { doc, typingMergeMs: 0 });
  const surface = mountSurface({ ...editor, root });
  const picked = mountPickedMark({ nabi: editor.nabi, surface: root });
  root.focus();
  return {
    ...editor,
    root,
    fire(type: 'copy' | 'cut' | 'paste', values = new Map<string, string>(), fail = false) {
      const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', {
        value: {
          files: [],
          types: [...values.keys()],
          getData: (type: string) => values.get(type) ?? '',
          setData(type: string, value: string) {
            if (fail) throw new Error('Clipboard write failed');
            values.set(type, value);
          },
        },
      });
      root.dispatchEvent(event);
      return { event, values };
    },
    close() {
      picked.unmount();
      surface.unmount();
      dom.window.close();
      Reflect.deleteProperty(globalThis, 'DOMParser');
    },
  };
};

for (const nested of [false, true]) {
  for (const offsets of [
    [0, 0],
    [1, 1],
    [0, 1],
    [1, 0],
  ] as const) {
    const siblings = [p('before'), table, p('after')];
    const original = nested ? [float(siblings), p('outside')] : siblings;
    const editor = rig(original);
    const path = nested ? [0, 0, 1] : [1];
    const selection = { anchor: at(path, offsets[0]), focus: at(path, offsets[1]) };
    editor.nabi.select(selection);
    assert.equal(editor.root.querySelector('[data-nabi-picked]')?.tagName, 'TABLE');
    const { event, values } = editor.fire('cut');
    assert.equal(event.defaultPrevented, true);
    assert.deepEqual(JSON.parse(values.get(NABI_CLIPBOARD_MIME)!).body, [table]);
    assert.equal(values.get('text/plain'), 'cell');
    assert.ok(values.get('text/html')?.includes('<table'));
    assert.ok(!values.get('text/html')?.includes('data-nabi-picked'));
    assert.deepEqual(
      editor.nabi.getJson(),
      nested ? [float([p('before'), p('after')]), p('outside')] : [p('before'), p('after')],
    );
    assert.equal(editor.nabi.undo(), true);
    assert.deepEqual(editor.nabi.getJson(), original);
    assert.deepEqual(editor.nabi.getSelection(), selection);
    editor.close();
  }
}

{
  const editor = rig([table, p('outside')]);
  const selection = caretAt(at([0], 1));
  editor.nabi.select(selection);
  const before = editor.nabi.getJson();
  const failed = editor.fire('cut', new Map(), true);
  assert.equal(failed.event.defaultPrevented, true);
  assert.deepEqual(editor.nabi.getJson(), before);
  assert.deepEqual(editor.nabi.getSelection(), selection);
  editor.nabi.select(caretAt(at([0, 0, 0, 0, 0])));
  assert.equal(editor.fire('cut').values.size, 0);
  assert.deepEqual(editor.nabi.getJson(), before);
  editor.close();
}

for (const nested of [false, true]) {
  const editor = rig(nested ? [float([table]), p('outside')] : [table]);
  editor.nabi.select(caretAt(at(nested ? [0, 0, 0] : [0])));
  editor.fire('cut');
  assert.deepEqual(editor.nabi.getJson(), nested ? [float([p()]), p('outside')] : [p()]);
  assert.equal(positionExists(hostOf(editor.nabi).doc(), editor.nabi.getSelection().focus, editor.registry.env), true);
  editor.close();
}

for (const format of [NABI_CLIPBOARD_MIME, 'text/html']) {
  for (const content of ['', 'AB']) {
    const original = [table, float([p(content)]), p('outside')];
    const editor = rig(original);
    editor.nabi.select(caretAt(at([0], 1)));
    const cut = editor.fire('cut');
    const source = new Map([[format, cut.values.get(format)!]]);
    editor.nabi.select(caretAt(at([0, 0, 0], content ? 1 : 0)));
    editor.fire('paste', source);
    assert.deepEqual(editor.nabi.getJson(), [float(content ? [p(content), table] : [table]), p('outside')]);
    assert.equal(
      positionExists(hostOf(editor.nabi).doc(), editor.nabi.getSelection().focus, editor.registry.env),
      true,
    );
    assert.deepEqual(editor.nabi.getSelection().focus.path.slice(0, 2), [0, 0]);
    assert.equal(editor.nabi.undo(), true);
    assert.deepEqual(editor.nabi.getJson(), [float([p(content)]), p('outside')]);
    assert.equal(editor.nabi.undo(), true);
    assert.deepEqual(editor.nabi.getJson(), original);
    editor.close();
  }
}

for (const [format, value, expected] of [
  ['text/plain', 'hello', [p('AhelloB')]],
  ['text/html', '<p>one</p><p>two</p>', [p('A'), p('one'), p('two'), p('B')]],
  ['text/html', '<img src="/image.png">', [p('AB'), { w: 'p', ch: [{ w: 'img', a: { src: '/image.png' }, ch: [] }] }]],
] as const) {
  const editor = rig([float([p('AB')]), p('outside')]);
  editor.nabi.select(caretAt(at([0, 0, 0], 1)));
  editor.fire('paste', new Map([[format, value]]));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(editor.nabi.getJson(), [float(expected), p('outside')]);
  editor.close();
}

for (const selection of [
  { anchor: at([0, 0, 0], 1), focus: at([0, 0, 0], 2) },
  { anchor: at([0, 0, 0], 1), focus: at([0, 0, 1], 1) },
] satisfies Selection[]) {
  const editor = rig([float([p('ABC'), p('DEF')]), p('outside')]);
  editor.nabi.select(selection);
  const original = editor.nabi.getJson();
  editor.fire('paste', new Map([[NABI_CLIPBOARD_MIME, JSON.stringify({ version: 1, body: [table] })]]));
  assert.deepEqual((editor.nabi.getJson() as NabiDoc).slice(1), [p('outside')]);
  assert.ok(JSON.stringify(nodeAt(editor.nabi.getJson() as NabiDoc, [0, 0])?.ch).includes('"w":"table"'));
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), original);
  editor.close();
}

console.log('table cut and float paste: wrapper removal, clipboard failure, undo and nested rich paste passed');
