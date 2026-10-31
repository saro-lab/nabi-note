import assert from 'node:assert/strict';
import { caretAt } from '../src/caret/index.js';
import { positionExists } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiNode } from '../src/schema/index.js';
import { createNabiWith, makeRegistry, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';

const el = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w,
  ...(a ? { a } : {}),
  ch,
});
const p = (ch: readonly NabiNode[] = [], a?: ElementNode['a']) => el('p', ch, a);
const image = () => p([el('img', [], { src: 'https://example.com/image.png' })]);
const list = (...blocks: ElementNode[]) =>
  p([
    el(
      'ul',
      blocks.map((block) => el('li', [block])),
    ),
  ]);
const quote = (...blocks: ElementNode[]) => p([el('quote', blocks)]);
const selected = (path: readonly number[]) => ({ anchor: { path, offset: 0 }, focus: { path, offset: 1 } });
const protectedBlocks = [
  image(),
  p([el('hr')]),
  p([el('youtube', [], { v: 'dQw4w9WgXcQ' })]),
  p([el('code', ['const x = 1'], { lang: 'js' })]),
  p([el('code', ['const x = 1'])]),
  p([el('details', [el('summary', ['title']), p(['body'])])]),
  p([el('float', [p(['inside'])])]),
  p([el('table', [el('tr', [el('td', [p(['cell'])])])])]),
];

for (const block of protectedBlocks) {
  for (const backward of [false, true]) {
    for (const empty of [false, true]) {
      const text = empty ? p() : p(['text']);
      const setup = createNabiWith(defaultWings, { doc: backward ? [block, text] : [text, block] });
      const { nabi, registry } = setup;
      const before = nabi.getJson();
      const pos = { path: [backward ? 1 : 0], offset: backward || empty ? 0 : 4 };
      nabi.select(caretAt(pos));
      const command = backward ? 'deleteBackward' : 'deleteForward';
      assert.equal(nabi.applyCommand(command), true);
      const keptBlock = before[backward ? 0 : 1]!;
      const after = empty ? [keptBlock] : before;
      const path = [backward || empty ? 0 : 1];
      assert.deepEqual(nabi.getJson(), after);
      assert.deepEqual(nabi.getSelection(), selected(path));
      assert.equal(positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env), true);
      assert.equal(nabi.applyCommand(command), true);
      assert.deepEqual(nabi.getJson(), [text]);
      assert.equal(nabi.undo(), true);
      assert.deepEqual(nabi.getJson(), after);
      assert.deepEqual(nabi.getSelection(), selected(path));
      if (empty) {
        assert.equal(nabi.undo(), true);
        assert.deepEqual(nabi.getJson(), before);
        assert.deepEqual(nabi.getSelection(), caretAt(pos));
      } else {
        assert.equal(nabi.undo(), false, 'selecting a block does not create an undo entry');
      }
    }
  }
}

for (const makeBlock of [list, quote]) {
  for (const backward of [false, true]) {
    const block = makeBlock(p(['first']), p(['last']));
    const { nabi } = createNabiWith(defaultWings, { doc: backward ? [block, p()] : [p(), block] });
    const before = nabi.getJson();
    nabi.select(caretAt({ path: [backward ? 1 : 0], offset: 0 }));
    nabi.applyCommand(backward ? 'deleteBackward' : 'deleteForward');
    assert.deepEqual(nabi.getJson(), [before[backward ? 0 : 1]]);
    const path = makeBlock === list ? [0, 0, backward ? 1 : 0, 0] : [0, 0, backward ? 1 : 0];
    assert.deepEqual(nabi.getSelection(), caretAt({ path, offset: backward ? 4 : 0 }));
  }
}

{
  const { nabi } = createNabiWith(defaultWings, { doc: [p([], { a: 'c' }), p(['heading'], { h: 2 })] });
  nabi.applyCommand('deleteForward');
  assert.deepEqual(nabi.getJson(), [p(['heading'], { h: 2 })]);
  assert.deepEqual(nabi.getSelection(), caretAt({ path: [0], offset: 0 }));
}

for (const content of [[' '], [el('br')], [el('fn', [], { t: 'note' })]] as const) {
  const { nabi } = createNabiWith(defaultWings, { doc: [p(content), image()] });
  const before = nabi.getJson();
  nabi.select(caretAt({ path: [0], offset: 1 }));
  nabi.applyCommand('deleteForward');
  assert.deepEqual(nabi.getJson(), before, 'spaces, hard breaks and inline terminals are not empty');
  assert.deepEqual(nabi.getSelection(), selected([1]));
}

for (const makeBlock of [list, quote]) {
  for (const backward of [false, true]) {
    for (const empty of [false, true]) {
      for (const protectedBlock of [image(), protectedBlocks[3]!]) {
        const blocks = backward ? [p(['safe']), protectedBlock] : [protectedBlock, p(['safe'])];
        const block = makeBlock(...blocks);
        const text = empty ? p() : p(['text']);
        const { nabi } = createNabiWith(defaultWings, { doc: backward ? [block, text] : [text, block] });
        const before = nabi.getJson();
        nabi.select(caretAt({ path: [backward ? 1 : 0], offset: backward || empty ? 0 : 4 }));
        nabi.applyCommand(backward ? 'deleteBackward' : 'deleteForward');
        assert.deepEqual(nabi.getJson(), empty ? [before[backward ? 0 : 1]] : before);
        const blockIndex = backward || empty ? 0 : 1;
        const path = makeBlock === list ? [blockIndex, 0, backward ? 1 : 0, 0] : [blockIndex, 0, backward ? 1 : 0];
        assert.deepEqual(nabi.getSelection(), selected(path), 'a protected edge inside text flow is not skipped');
      }
    }
  }
}

for (const backward of [false, true]) {
  const { nabi } = createNabiWith(defaultWings, { doc: [image(), image()] });
  const before = nabi.getJson();
  nabi.select(caretAt({ path: [backward ? 1 : 0], offset: backward ? 0 : 1 }));
  nabi.applyCommand(backward ? 'deleteBackward' : 'deleteForward');
  assert.deepEqual(nabi.getJson(), before);
  assert.deepEqual(nabi.getSelection(), selected([backward ? 0 : 1]));
}

const custom: Wing = {
  w: 'exBox',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('div', children()),
};
for (const joinOnDelete of [undefined, false, true]) {
  const wing = { ...custom, ...(joinOnDelete === undefined ? {} : { joinOnDelete }) };
  const block = p([el('exBox', [p(['inside'])])]);
  const { nabi } = createNabiWith([wing], { doc: [p(['head']), block] });
  nabi.select(caretAt({ path: [0], offset: 4 }));
  nabi.applyCommand('deleteForward');
  assert.deepEqual(nabi.getJson(), joinOnDelete ? [p(['headinside'])] : [p(['head']), block]);
  assert.deepEqual(nabi.getSelection(), joinOnDelete ? caretAt({ path: [0], offset: 4 }) : selected([1]));
}
for (const wing of [
  { ...custom, joinOnDelete: 'yes' },
  { ...custom, place: 'void', holds: undefined, joinOnDelete: true },
] as unknown as Wing[]) {
  assert.throws(() => makeRegistry([wing]), /joinOnDelete/);
}

for (const backward of [false, true]) {
  const isolated: Wing = {
    ...custom,
    joinOnDelete: true,
    parts: { exCell: { holds: 'blocks', isolating: true } },
    partHtml: { exCell: (_node, children, ctx) => ctx.element('div', children()) },
  };
  const cell = el('exCell', [p(['isolated'])]);
  const children = backward ? [p(['outside']), cell] : [cell, p(['outside'])];
  const block = p([el('exBox', children)]);
  const { nabi } = createNabiWith([isolated], { doc: backward ? [block, p(['tail'])] : [p(['head']), block] });
  const before = nabi.getJson();
  nabi.select(caretAt({ path: [backward ? 1 : 0], offset: backward ? 0 : 4 }));
  nabi.applyCommand(backward ? 'deleteBackward' : 'deleteForward');
  assert.deepEqual(nabi.getJson(), before, 'joining never skips an isolated edge');
}

{
  let captured: ReadonlySet<string> | undefined;
  const { nabi } = createNabiWith([
    {
      ...custom,
      joinOnDelete: true,
      commands: {
        inspectBoundary: (_doc, _sel, _args, env) => {
          captured = env.joinOnDelete;
          return null;
        },
      },
    },
  ]);
  nabi.applyCommand('inspectBoundary');
  assert.equal(captured?.has('exBox'), true);
  assert.equal('add' in captured!, false);
}

console.log('block deletion contracts passed');
