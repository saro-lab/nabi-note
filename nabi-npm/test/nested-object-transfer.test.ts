import assert from 'node:assert/strict';
import { caretAt, selectObject } from '../src/caret/index.js';
import { nodeAt, positionExists } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import { createNabiWith, defaultWings } from '../src/index.js';
import { $toJson, type ElementNode, type NabiDoc } from '../src/schema/index.js';
import { clipboardBodyOf } from '../src/surface/clipboard.js';
import { insertFragmentOp } from '../src/surface/fragment.js';
import { moveBlockOp, moveMediaOp } from '../src/surface/media-move.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const object = (w: string, ch: ElementNode['ch'] = [], a?: ElementNode['a']): ElementNode => ({
  w: 'p',
  ch: [{ w, ...(a ? { a } : {}), ch }],
});
const image: ElementNode = {
  ...object('img', [], { src: 'https://example.com/image.png', w: '40' }),
  a: { a: 'r' },
};
const objects = [
  image,
  object('youtube', [], { v: 'dQw4w9WgXcQ', w: '80' }),
  object('code', ['  const a = 1;', { w: 'br', ch: [] }, '\treturn a;'], { lang: 'typescript' }),
  object('quote', [p('quoted'), image]),
  object('details', [{ w: 'summary', ch: ['summary'] }, p('body')], { o: 1 }),
];
const cellAttrs = { th: 1, bg: 'yellow', colspan: '2', rowspan: '2' };
const nested = (source: readonly ElementNode[], target: readonly ElementNode[]): NabiDoc => [
  object(
    'float',
    [
      object('table', [
        {
          w: 'tr',
          ch: [
            { w: 'td', ch: source },
            { w: 'td', a: cellAttrs, ch: target },
          ],
        },
        { w: 'tr', ch: [{ w: 'td', ch: [p('neighbor')] }] },
      ]),
    ],
    { side: 'left', w: 50 },
  ),
  p('outside'),
];
const sourcePath = [0, 0, 0, 0, 0, 0, 0];
const cellPath = [0, 0, 0, 0, 0, 1];
const targetPath = [...cellPath, 0];

for (const selected of objects) {
  const { nabi, registry } = createNabiWith(defaultWings, { doc: nested([selected], [p()]) });
  const doc = hostOf(nabi).doc();
  for (const path of [sourcePath, [0, 0, 0], [0]]) {
    const selection = selectObject(path);
    const expected = $toJson([nodeAt(doc, path)!]);
    assert.deepEqual($toJson(clipboardBodyOf(doc, selection, registry.env)), expected);
    assert.deepEqual(
      $toJson(clipboardBodyOf(doc, { anchor: selection.focus, focus: selection.anchor }, registry.env)),
      expected,
    );
  }
  assert.deepEqual(clipboardBodyOf(doc, caretAt({ path: sourcePath, offset: 0 }), registry.env), []);

  const moves = objects.indexOf(selected) < 2 ? [moveMediaOp, moveBlockOp] : [moveBlockOp];
  for (const offset of [0, 1]) {
    for (const move of moves) {
      const { nabi, registry } = createNabiWith(defaultWings, { doc: nested([selected], [p()]) });
      const host = hostOf(nabi);
      const before = nabi.getJson();
      nabi.select(selectObject(sourcePath));
      const selection = nabi.getSelection();
      const sourceId = nodeAt(host.doc(), sourcePath)!._id;
      const cellId = nodeAt(host.doc(), cellPath)!._id;
      let changes = 0;
      nabi.onChange((change) => {
        if (change.doc) changes += 1;
      });
      assert.equal(host.applyRaw(move(sourcePath, { path: targetPath, offset }), 'moveBlock'), true);
      assert.deepEqual(nabi.getJson(), nested([p()], [selected]));
      assert.equal(nodeAt(host.doc(), cellPath)!._id, cellId);
      assert.equal(nodeAt(host.doc(), targetPath)!._id, sourceId);
      assert.deepEqual(nabi.getSelection(), selectObject(targetPath));
      assert.equal(positionExists(host.doc(), nabi.getSelection().focus, registry.env), true);
      assert.equal(changes, 1);
      assert.equal(nabi.undo(), true);
      assert.deepEqual(nabi.getJson(), before);
      assert.deepEqual(nabi.getSelection(), selection);
      assert.equal(nabi.undo(), false);
      assert.equal(nabi.redo(), true);
      assert.deepEqual(nabi.getJson(), nested([p()], [selected]));
    }
  }
}

for (const target of [[p(' ')], [{ w: 'p', ch: [{ w: 'br', ch: [] }] } as ElementNode], [p(), p('keep')], [p(), p()]]) {
  for (const offset of [0, 1]) {
    const { nabi } = createNabiWith(defaultWings, { doc: nested([image], target) });
    assert.equal(hostOf(nabi).applyRaw(moveMediaOp(sourcePath, { path: targetPath, offset }), 'moveMedia'), true);
    const expected = offset ? [target[0], image, ...target.slice(1)] : [image, ...target];
    assert.deepEqual(nabi.getJson(), nested([p()], expected));
  }
}

for (const fragment of [[image], [p('pasted')], [p('first'), image, p('last')]]) {
  const { nabi } = createNabiWith(defaultWings, { doc: nested([p('source')], [p()]) });
  const before = nabi.getJson();
  nabi.select(caretAt({ path: targetPath, offset: 0 }));
  const cellId = nodeAt(hostOf(nabi).doc(), cellPath)!._id;
  assert.equal(hostOf(nabi).applyRaw(insertFragmentOp(fragment), 'insertFragment'), true);
  assert.deepEqual(nabi.getJson(), nested([p('source')], fragment));
  assert.equal(nodeAt(hostOf(nabi).doc(), cellPath)!._id, cellId);
  assert.equal(nabi.undo(), true);
  assert.deepEqual(nabi.getJson(), before);
}

for (const target of [p(' '), { w: 'p', ch: [{ w: 'br', ch: [] }] } as ElementNode]) {
  const { nabi } = createNabiWith(defaultWings, { doc: nested([p()], [target]) });
  nabi.select(caretAt({ path: targetPath, offset: 0 }));
  assert.equal(hostOf(nabi).applyRaw(insertFragmentOp([image]), 'insertFragment'), true);
  assert.deepEqual(nodeAt(hostOf(nabi).doc(), cellPath)?.ch.length, 2);
  assert.deepEqual($toJson([nodeAt(hostOf(nabi).doc(), [...cellPath, 0])!]), [target]);
}

console.log('nested object transfer: exact copy, empty-cell move/paste, cell attributes, whitespace, and undo passed');
