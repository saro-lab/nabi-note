import assert from 'node:assert/strict';
import { selectObject } from '../src/caret/index.js';
import { nodeAt, positionExists, type Position } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { moveMediaOp } from '../src/surface/media-move.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const image: ElementNode = {
  w: 'p',
  a: { a: 'r' },
  ch: [{ w: 'img', a: { src: 'https://example.com/image.png', w: '40' }, ch: [] }],
};
const youtube: ElementNode = {
  w: 'p',
  a: { a: 'r' },
  ch: [{ w: 'youtube', a: { v: 'dQw4w9WgXcQ', w: '80' }, ch: [] }],
};
const at = (path: readonly number[], offset = 0): Position => ({ path, offset });
const float = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch }],
});
const quote = (ch: readonly ElementNode[]): ElementNode => ({ w: 'p', ch: [{ w: 'quote', ch }] });
const list = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'ul', ch: [{ w: 'li', ch }] }],
});
const table = (cells: readonly (readonly ElementNode[])[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: [{ w: 'tr', ch: cells.map((ch) => ({ w: 'td', ch })) }] }],
});

function checkMove(
  doc: NabiDoc,
  source: readonly number[],
  target: Position,
  expected: NabiDoc,
  moved: readonly number[],
) {
  const { nabi, registry } = createNabiWith(defaultWings, { doc });
  nabi.select(selectObject(source));
  const oldSelection = nabi.getSelection();
  const wrapperId = nodeAt(hostOf(nabi).doc(), source)?._id;
  const mediaId = nodeAt(hostOf(nabi).doc(), [...source, 0])?._id;
  let changes = 0;
  nabi.onChange((change) => {
    if (change.doc) changes += 1;
  });
  assert.equal(hostOf(nabi).applyRaw(moveMediaOp(source, target), 'moveMedia'), true);
  assert.deepEqual(nabi.getJson(), expected);
  assert.deepEqual(nabi.getSelection(), selectObject(moved));
  assert.equal(positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env), true);
  assert.equal(nodeAt(hostOf(nabi).doc(), moved)?._id, wrapperId);
  assert.equal(nodeAt(hostOf(nabi).doc(), [...moved, 0])?._id, mediaId);
  assert.equal(changes, 1);
  assert.equal(nabi.undo(), true);
  assert.deepEqual(nabi.getJson(), doc);
  assert.deepEqual(nabi.getSelection(), oldSelection);
  assert.equal(nabi.undo(), false);
  assert.equal(nabi.redo(), true);
  assert.deepEqual(nabi.getJson(), expected);
}

for (const media of [image, youtube]) {
  checkMove([media, p('middle'), p('last')], [0], at([2], 2), [p('middle'), p('last'), media], [2]);
  checkMove([p('first'), p('middle'), media], [2], at([0]), [media, p('first'), p('middle')], [0]);
  checkMove([media, p('middle'), p()], [0], at([2], 1), [p('middle'), p(), media], [2]);
  checkMove([p(), p('middle'), media], [2], at([0]), [media, p(), p('middle')], [0]);

  for (const [wrap, inner] of [
    [float, [0, 0]],
    [quote, [0, 0]],
    [list, [0, 0, 0]],
  ] as const) {
    checkMove(
      [wrap([p('first'), media, p('last')]), p('outside')],
      [...inner, 1],
      at([...inner, 0]),
      [wrap([media, p('first'), p('last')]), p('outside')],
      [...inner, 0],
    );
    checkMove([wrap([media]), p('outside')], [...inner, 0], at([1], 1), [wrap([p()]), p('outside'), media], [2]);
    checkMove(
      [media, wrap([p('inside')])],
      [0],
      at([1, ...inner.slice(1), 0], 2),
      [wrap([p('inside'), media])],
      [...inner, 1],
    );
  }

  checkMove(
    [table([[media], [p('cell')]]), p('outside')],
    [0, 0, 0, 0, 0],
    at([0, 0, 0, 1, 0], 2),
    [table([[p()], [p('cell'), media]]), p('outside')],
    [0, 0, 0, 1, 1],
  );
  checkMove(
    [media, float([table([[p('cell')]])])],
    [0],
    at([1, 0, 0, 0, 0, 0, 0]),
    [float([table([[media, p('cell')]])])],
    [0, 0, 0, 0, 0, 0, 0],
  );
  checkMove(
    [float([table([[media]])]), p('outside')],
    [0, 0, 0, 0, 0, 0, 0],
    at([1]),
    [float([table([[p()]])]), media, p('outside')],
    [1],
  );

  const invalidDoc: NabiDoc = [
    p('first'),
    media,
    p('last'),
    { w: 'p', ch: [{ w: 'code', ch: ['code'] }] },
    { w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['summary'] }, media] }] },
  ];
  for (const [source, target] of [
    [[1], at([1])],
    [[1], at([1], 1)],
    [[1], at([0], 1)],
    [[1], at([2])],
    [[0], at([2])],
    [[9], at([2])],
    [[1], at([9])],
    [[1], at([2], 99)],
    [[1], at([2], -1)],
    [[1], at([3, 0])],
    [[1], at([4, 0, 0])],
    [[4, 0, 1], at([4])],
  ] as const) {
    const { nabi } = createNabiWith(defaultWings, { doc: invalidDoc });
    const before = nabi.getJson();
    const selection = nabi.getSelection();
    assert.equal(hostOf(nabi).applyRaw(moveMediaOp(source, target), 'moveMedia'), false);
    assert.deepEqual(nabi.getJson(), before);
    assert.deepEqual(nabi.getSelection(), selection);
    assert.equal(nabi.undo(), false);
  }
}

checkMove([image, youtube, p('last')], [0], at([1], 1), [youtube, image, p('last')], [1]);
checkMove([image, youtube, p('last')], [1], at([0]), [youtube, image, p('last')], [0]);

{
  const { nabi } = createNabiWith(defaultWings, {
    doc: [{ w: 'p', ch: [{ w: 'hr', ch: [] }] }, p('destination')],
  });
  const before = nabi.getJson();
  assert.equal(hostOf(nabi).applyRaw(moveMediaOp([0], at([1], 1)), 'moveMedia'), false);
  assert.deepEqual(nabi.getJson(), before);
  assert.equal(nabi.undo(), false);
}

console.log('media move: passed');
