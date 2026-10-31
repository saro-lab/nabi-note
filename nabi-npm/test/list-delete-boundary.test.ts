import assert from 'node:assert/strict';
import { caretAt } from '../src/caret/index.js';
import { positionExists, type Position } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/index.js';
import { makeSurfaceActions } from '../src/surface/index.js';
import { createNabiWith, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';

const el = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w,
  ...(a ? { a } : {}),
  ch,
});
const p = (ch: readonly NabiNode[] = []) => el('p', ch);
const image = () => p([el('img', [], { src: 'https://example.com/image.png' })]);
const quote = (...blocks: ElementNode[]) => p([el('quote', blocks)]);
const families = [
  ['ul', 'li'],
  ['ol', 'oli'],
  ['tl', 'tli'],
] as const;
const list = (family: (typeof families)[number], ...items: readonly ElementNode[][]) =>
  p([
    el(
      family[0],
      items.map((blocks) => el(family[1], blocks)),
    ),
  ]);
const selected = (path: readonly number[]) => ({ anchor: { path, offset: 0 }, focus: { path, offset: 1 } });
const custom: Wing = {
  w: 'exBox',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
};
const flow: Wing = {
  w: 'exFlow',
  place: 'container',
  holds: 'blocks',
  joinOnDelete: true,
  parts: { exCell: { holds: 'blocks', isolating: true } },
  toHtml: (_node, children, ctx) => ctx.element('div', children()),
  partHtml: { exCell: (_node, children, ctx) => ctx.element('section', children()) },
};
const blocks = [
  image(),
  p([el('hr')]),
  p([el('youtube', [], { v: 'dQw4w9WgXcQ' })]),
  p([el('code', ['CODE'])]),
  p([el('details', [el('summary', ['title']), p(['body'])])]),
  p([el('float', [p(['inside'])])]),
  p([el('table', [el('tr', [el('td', [p(['cell'])])])])]),
  p([el('exBox', [p(['custom'])])]),
];
const make = (doc: NabiDoc, pos: Position) => {
  const setup = createNabiWith([...defaultWings, custom, flow], { doc });
  setup.nabi.select(caretAt(pos));
  return { ...setup, actions: makeSurfaceActions(setup) };
};

for (const family of families) {
  for (const block of blocks) {
    for (const backward of [false, true]) {
      const doc = backward
        ? [list(family, [p(['before']), block], [p(['after'])])]
        : [list(family, [p(['before'])], [block, p(['after'])])];
      const pos = { path: [0, 0, backward ? 1 : 0, 0], offset: backward ? 0 : 6 };
      const { nabi, registry, actions } = make(doc, pos);
      const before = nabi.getJson();
      const path = backward ? [0, 0, 0, 1] : [0, 0, 1, 0];
      const press = () => (backward ? actions.backspace() : actions.deleteForward());
      press();
      assert.deepEqual(nabi.getJson(), before, 'item boundaries preserve protected blocks and text order');
      assert.deepEqual(nabi.getSelection(), selected(path));
      assert.equal(positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env), true);
      press();
      assert.deepEqual(nabi.getJson(), [list(family, [p(['before'])], [p(['after'])])]);
      assert.equal(nabi.undo(), true);
      assert.deepEqual(nabi.getJson(), before);
      assert.deepEqual(nabi.getSelection(), selected(path));
      assert.equal(
        nabi.undo(),
        false,
        `${family[0]}/${(block.ch[0] as ElementNode).w}/${backward ? 'backward' : 'forward'} selection alone does not add an undo entry`,
      );
    }
  }

  for (const backward of [false, true]) {
    const doc = [list(family, [p(['before']), image(), p(['after'])], [p(['last'])])];
    const pos = { path: [0, 0, 0, backward ? 2 : 0], offset: backward ? 0 : 6 };
    const { nabi, actions } = make(doc, pos);
    const before = nabi.getJson();
    if (backward) actions.backspace();
    else actions.deleteForward();
    assert.deepEqual(nabi.getJson(), before, 'same-item deletion does not skip the neighboring object');
    assert.deepEqual(nabi.getSelection(), selected([0, 0, 0, 1]));
  }

  for (const keep of [false, true]) {
    for (const backward of [false, true]) {
      const emptyItem = keep ? (backward ? [p(), p(['keep'])] : [p(['keep']), p()]) : [p()];
      const doc = backward ? [list(family, [image()], emptyItem)] : [list(family, emptyItem, [image()])];
      const pos = { path: [0, 0, backward ? 1 : 0, backward || !keep ? 0 : 1], offset: 0 };
      const { nabi, actions } = make(doc, pos);
      if (backward) actions.backspace();
      else actions.deleteForward();
      const retained = keep ? [p(['keep'])] : [p()];
      assert.deepEqual(nabi.getJson(), [
        backward ? list(family, [image()], retained) : list(family, retained, [image()]),
      ]);
      assert.deepEqual(nabi.getSelection(), selected([0, 0, backward ? 0 : 1, 0]));
    }
  }

  for (const keep of [false, true]) {
    const item = keep ? [p(['keep']), p()] : [p()];
    const { nabi, actions } = make([list(family, item), image()], {
      path: [0, 0, 0, keep ? 1 : 0],
      offset: 0,
    });
    actions.deleteForward();
    assert.deepEqual(nabi.getJson(), [list(family, keep ? [p(['keep'])] : [p()]), image()]);
    assert.deepEqual(nabi.getSelection(), selected([1]));
  }

  {
    const doc = [list(family, [p(['before'])]), list(family, [image(), p(['after'])])];
    const { nabi, actions } = make(doc, { path: [0, 0, 0, 0], offset: 6 });
    actions.deleteForward();
    assert.deepEqual(nabi.getJson(), doc, 'pulling from a following list first selects its leading object');
    assert.deepEqual(nabi.getSelection(), selected([1, 0, 0, 0]));
  }

  for (const backward of [false, true]) {
    const nested = backward ? quote(p(['inside']), image()) : quote(image(), p(['inside']));
    const doc = backward
      ? [list(family, [p(['before']), nested], [p(['after'])])]
      : [list(family, [p(['before'])], [nested, p(['after'])])];
    const { nabi, actions } = make(doc, {
      path: [0, 0, backward ? 1 : 0, 0],
      offset: backward ? 0 : 6,
    });
    if (backward) actions.backspace();
    else actions.deleteForward();
    assert.deepEqual(nabi.getJson(), doc, 'nested quote objects stop list joining');
    assert.deepEqual(nabi.getSelection(), selected(backward ? [0, 0, 0, 1, 0, 1] : [0, 0, 1, 0, 0, 0]));
  }

  for (const backward of [false, true]) {
    const isolated = el('exCell', [p(['isolated'])]);
    const nested = p([el('exFlow', backward ? [p(['outside']), isolated] : [isolated, p(['outside'])])]);
    const doc = backward ? [list(family, [nested], [p(['after'])])] : [list(family, [p(['before'])], [nested])];
    const pos = { path: [0, 0, backward ? 1 : 0, 0], offset: backward ? 0 : 6 };
    const { nabi, actions } = make(doc, pos);
    if (backward) actions.backspace();
    else actions.deleteForward();
    assert.deepEqual(nabi.getJson(), doc, 'list joining never skips isolated structural parts');
    assert.deepEqual(nabi.getSelection(), caretAt(pos));
  }

  {
    const doc = [list(family, [p(['before']), image()], [p(['after'])])];
    const { nabi, actions } = make(doc, { path: [0, 0, 0, 0], offset: 2 });
    actions.deleteForward();
    assert.deepEqual(nabi.getJson(), [list(family, [p(['beore']), image()], [p(['after'])])]);
  }
}

console.log('list deletion boundary checks passed');
