import assert from 'node:assert/strict';
import { caretAt, selectObject } from '../src/caret/index.js';
import { nodeAt, positionExists, type Position } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import { isElement, type ElementNode, type NabiDoc } from '../src/schema/index.js';
import { moveBlockOp, moveMediaOp } from '../src/surface/media-move.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const at = (path: readonly number[], offset = 0): Position => ({ path, offset });
const float = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch }],
});
const table = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  a: { a: 'r' },
  ch: [
    {
      w: 'table',
      a: { full: 1, sort: 1 },
      ch: [{ w: 'tr', ch: [{ w: 'td', a: { bg: 'yellow' }, ch }] }],
    },
  ],
});
const quote = (ch: readonly ElementNode[]): ElementNode => ({ w: 'p', ch: [{ w: 'quote', ch }] });
const list = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'ul', ch: [{ w: 'li', ch }] }],
});
const details = (ch: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['summary'] }, ...ch] }],
});
const code: ElementNode = {
  w: 'p',
  ch: [{ w: 'code', a: { lang: 'typescript' }, ch: ['  const x = 1;', { w: 'br', ch: [] }, '\tconsole.log(x);'] }],
};
const image: ElementNode = {
  w: 'p',
  a: { a: 'c' },
  ch: [{ w: 'img', a: { src: 'https://example.com/image.png', w: '40' }, ch: [] }],
};
const video: ElementNode = {
  w: 'p',
  ch: [{ w: 'youtube', a: { v: 'dQw4w9WgXcQ', w: '80' }, ch: [] }],
};
const ids = (node: ElementNode): readonly (string | undefined)[] => [
  node._id,
  ...node.ch.flatMap((child) => (isElement(child) ? ids(child) : [])),
];

function checkMove(
  doc: NabiDoc,
  source: readonly number[],
  target: Position,
  expected: NabiDoc,
  moved: readonly number[],
) {
  const { nabi, registry } = createNabiWith(defaultWings, { doc });
  const host = hostOf(nabi);
  const original = nabi.getJson();
  const sourceNode = nodeAt(host.doc(), source)!;
  const originalIds = ids(sourceNode);
  nabi.select(caretAt(at(source)));
  const selection = nabi.getSelection();
  let changes = 0;
  nabi.onChange((change) => {
    if (change.doc) changes += 1;
  });

  assert.equal(host.applyRaw(moveBlockOp(source, target), 'moveBlock'), true);
  assert.deepEqual(nabi.getJson(), expected);
  assert.deepEqual(nabi.getSelection(), selectObject(moved));
  assert.equal(positionExists(host.doc(), nabi.getSelection().focus, registry.env), true);
  assert.deepEqual(ids(nodeAt(host.doc(), moved)!), originalIds);
  assert.equal(changes, 1);
  assert.equal(nabi.undo(), true);
  assert.deepEqual(nabi.getJson(), original);
  assert.deepEqual(nabi.getSelection(), selection);
  assert.equal(nabi.undo(), false);
  assert.equal(nabi.redo(), true);
  assert.deepEqual(nabi.getJson(), expected);
}

const richTable = table([p('cell'), image, video]);
const richFloat = float([p('float'), richTable]);
const richDetails = details([p('body'), code, image]);
const richQuote = quote([p('quoted text'), code, image]);
const openDetails: ElementNode = {
  ...richDetails,
  ch: [{ ...(richDetails.ch[0] as ElementNode), a: { o: 1 } }],
};
for (const object of [richFloat, richTable, image, video, richDetails, openDetails, code, richQuote]) {
  checkMove([object, p('middle'), p('last')], [0], at([2], 1), [p('middle'), p('last'), object], [2]);
  checkMove([p('first'), p('middle'), object], [2], at([0]), [object, p('first'), p('middle')], [0]);
}

for (const [wrap, inner] of [
  [float, [0, 0]],
  [quote, [0, 0]],
  [list, [0, 0, 0]],
  [details, [0, 0]],
] as const) {
  const first = wrap === details ? 1 : 0;
  for (const object of [richTable, richDetails, code, richQuote]) {
    checkMove(
      [object, wrap([p('inside')])],
      [0],
      at([1, ...inner.slice(1), first], 1),
      [wrap([p('inside'), object])],
      [...inner, first + 1],
    );
    checkMove([wrap([object]), p('outside')], [...inner, first], at([1], 1), [wrap([p()]), p('outside'), object], [2]);
    checkMove(
      [wrap([p('inside'), object]), p('outside')],
      [...inner, first + 1],
      at([...inner, first]),
      [wrap([object, p('inside')]), p('outside')],
      [...inner, first],
    );
  }
}

for (const object of [richDetails, code, richQuote]) {
  checkMove(
    [object, table([p('inside')])],
    [0],
    at([1, 0, 0, 0, 0], 1),
    [table([p('inside'), object])],
    [0, 0, 0, 0, 1],
  );
  checkMove([table([object]), p('outside')], [0, 0, 0, 0, 0], at([1], 1), [table([p()]), p('outside'), object], [2]);
}

checkMove(
  [float([richTable]), float([p('target')])],
  [0, 0, 0],
  at([1, 0, 0]),
  [float([p()]), float([richTable, p('target')])],
  [1, 0, 0],
);

const headingTable = table([{ w: 'p', a: { h: 2 }, ch: ['heading'] }]);
const rejected: readonly [NabiDoc, readonly number[], Position][] = [
  [[richFloat, p('after')], [0], at([0, 0, 0])],
  [[richTable, p('after')], [0], at([0, 0, 0, 0, 0])],
  [[richFloat, float([p('target')])], [0], at([1, 0, 0])],
  [[richFloat, quote([p('target')])], [0], at([1, 0, 0])],
  [[richFloat, table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[richTable, table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[richTable, table([quote([p('target')])])], [0], at([1, 0, 0, 0, 0, 0, 0])],
  [[headingTable, details([p('target')])], [0], at([1, 0, 1])],
  [[richFloat, p('after')], [0], at([1])],
  [[p('before'), richTable], [1], at([0], 1)],
  [[richTable, p('after')], [0], at([1], 1.5)],
  [[p('source'), p('after')], [0], at([1], 1)],
  [[richDetails, p('after')], [0], at([0, 0, 1], 1)],
  [[richQuote, p('after')], [0], at([0, 0, 0], 1)],
  [[details([richTable]), table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[details([richFloat]), table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[details([richFloat]), float([p('target')])], [0], at([1, 0, 0])],
  [[quote([richTable]), table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[quote([richFloat]), table([p('target')])], [0], at([1, 0, 0, 0, 0])],
  [[quote([richFloat]), float([p('target')])], [0], at([1, 0, 0])],
  [[quote([headingTable]), details([p('target')])], [0], at([1, 0, 1])],
  [[richDetails, code], [0], at([1, 0])],
  [[richQuote, code], [0], at([1, 0])],
  [[code, richDetails], [0], at([1, 0, 0])],
];
for (const [index, [doc, source, target]] of rejected.entries()) {
  const { nabi } = createNabiWith(defaultWings, { doc });
  const before = nabi.getJson();
  const selection = nabi.getSelection();
  assert.equal(hostOf(nabi).applyRaw(moveBlockOp(source, target), 'moveBlock'), false, `rejected move ${index}`);
  assert.deepEqual(nabi.getJson(), before);
  assert.deepEqual(nabi.getSelection(), selection);
  assert.equal(nabi.undo(), false);
}

for (const object of [richFloat, richTable, richDetails, code, richQuote]) {
  const { nabi } = createNabiWith(defaultWings, { doc: [object, p('target')] });
  assert.equal(hostOf(nabi).applyRaw(moveMediaOp([0], at([1], 1)), 'moveMedia'), false);
}

console.log('block move: passed');
