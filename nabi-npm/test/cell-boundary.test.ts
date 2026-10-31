import assert from 'node:assert/strict';
import { caretAt, type Selection } from '../src/caret/index.js';
import { nodeAt, positionExists } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import { $toJson, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { makeSurfaceActions } from '../src/surface/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { cellGrid } from '../src/wings/table/grid.js';

const el = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w,
  ...(a ? { a } : {}),
  ch,
});
const p = (ch: readonly NabiNode[] = []) => el('p', ch);
const cell = (ch: readonly NabiNode[], a?: ElementNode['a']) => el('td', ch, a);
const table = (...cells: ElementNode[]) => p([el('table', [el('tr', cells)])]);
const image = () => p([el('img', [], { src: 'https://example.com/cell.png' })]);
const quote = (text: string) => p([el('quote', [p([text])])]);
const list = (...items: string[]) =>
  p([
    el(
      'ul',
      items.map((text) => el('li', [p([text])])),
    ),
  ]);
const at = (column = 0, paragraph = 0, offset = 0) => ({ path: [0, 0, 0, column, paragraph], offset });
const make = (doc: NabiDoc) => {
  const setup = createNabiWith(defaultWings, { doc });
  let clock = 10_000;
  return {
    ...setup,
    actions: makeSurfaceActions({ ...setup, now: () => clock }),
    tick: () => {
      clock += 100;
    },
  };
};
const contents = (doc: NabiDoc, column = 0) => $toJson(nodeAt(doc, [0, 0, 0, column])!.ch as NabiDoc);
const inCell = (selection: Selection, column = 0) =>
  selection.focus.path.slice(0, 4).join('/') === [0, 0, 0, column].join('/');

for (const blocks of [[p(['inside'])], [image()], [image(), p(['inside'])], [list('item')]]) {
  for (const direction of ['before', 'after'] as const) {
    const { nabi, actions } = make([p(['before']), table(cell(blocks)), p(['after'])]);
    const selection = caretAt(direction === 'before' ? { path: [0], offset: 6 } : { path: [2], offset: 0 });
    nabi.select(selection);
    const before = nabi.getJson();
    if (direction === 'before') actions.deleteForward();
    else actions.backspace();
    assert.deepEqual(nabi.getJson(), before, `${direction} paragraph preserves table with ${blocks[0]!.ch[0]}`);
    assert.deepEqual(nabi.getSelection(), { anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
  }
}

for (const direction of ['before', 'after'] as const) {
  const { nabi, actions } = make([image(), table(cell([image()])), image()]);
  const selection = caretAt(direction === 'before' ? { path: [0], offset: 1 } : { path: [2], offset: 0 });
  nabi.select(selection);
  const before = nabi.getJson();
  if (direction === 'before') actions.deleteForward();
  else actions.backspace();
  assert.deepEqual(nabi.getJson(), before, 'adjacent object boundaries preserve isolated contents');
  assert.deepEqual(nabi.getSelection(), { anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
}

{
  const { nabi, actions } = make([p(['before']), table(cell([image()])), p(['after'])]);
  nabi.select({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
  actions.deleteForward();
  assert.deepEqual(nabi.getJson(), [p(['before']), p(['after'])], 'explicit table selection can be deleted');
}

for (const direction of ['before', 'after'] as const) {
  const { nabi, actions } = make([p(['before']), image(), p(['after'])]);
  nabi.select(caretAt(direction === 'before' ? { path: [0], offset: 6 } : { path: [2], offset: 0 }));
  if (direction === 'before') actions.deleteForward();
  else actions.backspace();
  assert.deepEqual(nabi.getJson(), [p(['before']), image(), p(['after'])], 'adjacent image is preserved');
  assert.deepEqual(nabi.getSelection(), { anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
  if (direction === 'before') actions.deleteForward();
  else actions.backspace();
  assert.deepEqual(nabi.getJson(), [p(['before']), p(['after'])], 'selected image is deleted');
}

for (const direction of ['backward', 'forward'] as const) {
  const { nabi, actions } = make([table(cell([p(['ab']), p(['cd'])]), cell([p(['safe'])]))]);
  nabi.select(caretAt(direction === 'backward' ? at(0, 1, 0) : at(0, 0, 2)));
  if (direction === 'backward') actions.backspace();
  else actions.deleteForward();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['abcd'])], 'sibling paragraphs still merge inside cell');
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
  assert.deepEqual(nabi.getSelection(), caretAt(at(0, 0, 2)));
}

{
  const { nabi, actions } = make([table(cell([p(['ab']), image(), p(['cd'])]), cell([p(['safe'])]))]);
  nabi.select({ anchor: at(0, 1, 0), focus: at(0, 1, 1) });
  actions.backspace();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['ab']), p(['cd'])]);
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
  assert.equal(inCell(nabi.getSelection()), true);
}

{
  const { nabi, actions } = make([table(cell([p(['ab']), p(['cd']), p(['ef'])]), cell([p(['safe'])]))]);
  nabi.select({ anchor: at(0, 0, 1), focus: at(0, 2, 1) });
  actions.backspace();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['af'])]);
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
  assert.deepEqual(nabi.getSelection(), caretAt(at(0, 0, 1)));
}

for (const nestedFirst of [false, true]) {
  const blocks = nestedFirst ? [quote('cd'), p(['ab'])] : [p(['ab']), quote('cd')];
  const { nabi, registry, actions } = make([table(cell(blocks, { bg: 'yellow' }))]);
  const plainPath = at(0, nestedFirst ? 1 : 0).path;
  const nestedPath = [...at(0, nestedFirst ? 0 : 1).path, 0, 0];
  nabi.select({
    anchor: { path: nestedFirst ? nestedPath : plainPath, offset: 0 },
    focus: { path: nestedFirst ? plainPath : nestedPath, offset: 2 },
  });
  actions.backspace();
  const doc = hostOf(nabi).doc();
  assert.deepEqual(contents(doc), [p()], 'clearing all cell blocks retains its empty paragraph');
  assert.equal(nodeAt(doc, [0, 0, 0, 0])?.a?.['bg'], 'yellow');
  assert.equal(inCell(nabi.getSelection()), true, 'caret stays inside the cleared cell');
  assert.equal(positionExists(doc, nabi.getSelection().focus, registry.env), true);
  nabi.applyCommand('insertText', { text: 'again' });
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['again'])]);
}

{
  const { nabi, actions, tick } = make([table(cell([p(['ab'])]), cell([p(['safe'])]))]);
  nabi.select(caretAt(at(0, 0, 1)));
  actions.enter();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['a']), p(['b'])]);
  assert.deepEqual(nabi.getSelection(), caretAt(at(0, 1, 0)));
  tick();
  actions.enter();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['a']), p(), p(['b'])]);
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
  assert.equal(inCell(nabi.getSelection()), true);
}

{
  const { nabi, actions } = make([table(cell([p(['ab'])]))]);
  nabi.select(caretAt(at(0, 0, 1)));
  actions.shiftEnter();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p(['a', el('br'), 'b'])]);
  assert.deepEqual(nabi.getSelection(), caretAt(at(0, 0, 2)));
}

{
  const { nabi, actions } = make([table(cell([list('ab')]), cell([p(['safe'])]))]);
  nabi.select(caretAt({ path: [...at().path, 0, 0, 0], offset: 1 }));
  actions.shiftEnter();
  assert.deepEqual(contents(hostOf(nabi).doc()), [p([el('ul', [el('li', [p(['a', el('br'), 'b'])])])])]);
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
}

for (const block of [p(['text']), quote('quote')]) {
  const { nabi, actions } = make([table(cell([block]), cell([p(['safe'])]))]);
  const path = block.ch[0] === 'text' ? at().path : [...at().path, 0, 0];
  nabi.select(caretAt({ path, offset: 1 }));
  const before = nabi.getJson();
  actions.tab(false);
  assert.deepEqual(nabi.getJson(), before);
  assert.deepEqual(nabi.getSelection(), caretAt(at(1)));
  actions.tab(true);
  assert.deepEqual(nabi.getSelection(), caretAt({ path, offset: 0 }));
}

{
  const { nabi, actions } = make([table(cell([list('one', 'two')]), cell([p(['safe'])]))]);
  const first = caretAt({ path: [...at().path, 0, 0, 0], offset: 0 });
  nabi.select(first);
  const before = nabi.getJson();
  actions.tab(false);
  assert.deepEqual(nabi.getJson(), before, 'first list item Tab is consumed without changing the cell');
  assert.deepEqual(nabi.getSelection(), first);
  nabi.select(caretAt({ path: [...at().path, 0, 1, 0], offset: 0 }));
  actions.tab(false);
  assert.equal(inCell(nabi.getSelection()), true);
  assert.equal(nodeAt(hostOf(nabi).doc(), [0, 0, 0, 0, 0, 0])?.ch.length, 1);
  assert.deepEqual(contents(hostOf(nabi).doc(), 1), [p(['safe'])]);
  actions.tab(true);
  assert.deepEqual(nabi.getJson(), before, 'list Shift+Tab reverses indentation inside its cell');
}

{
  const { nabi, actions } = make([table(cell([p(['left'])]), cell([p([el('code', ['code'])])]))]);
  const code = { path: [...at(1).path, 0], offset: 0 };
  nabi.select(caretAt(code));
  const before = nabi.getJson();
  actions.tab(true);
  assert.deepEqual(nabi.getJson(), before);
  assert.deepEqual(nabi.getSelection(), caretAt(code), 'unindented code Shift+Tab stays in its cell');
  actions.tab(false);
  assert.deepEqual(nodeAt(hostOf(nabi).doc(), code.path)?.ch, ['    code']);
  assert.equal(inCell(nabi.getSelection(), 1), true);
  actions.tab(true);
  assert.deepEqual(nabi.getJson(), before);
  assert.deepEqual(nabi.getSelection(), caretAt(code));
}

for (const backward of [false, true]) {
  for (const key of ['backspace', 'deleteForward'] as const) {
    const { nabi, registry, actions } = make([
      table(
        cell([p(['abc']), p(['tail'])], { bg: 'yellow' }),
        cell([p(['def']), p(['ghij'])], { bg: 'cyan' }),
        cell([p(['safe'])]),
      ),
    ]);
    const start = at(0, 0, 1);
    const end = at(1, 1, 2);
    nabi.select({ anchor: backward ? end : start, focus: backward ? start : end });
    actions[key]();
    const doc = hostOf(nabi).doc();
    assert.equal(cellGrid(nodeAt(doc, [0, 0])!).cells.length, 3);
    assert.deepEqual(contents(doc), [p(['a'])]);
    assert.deepEqual(contents(doc, 1), [p(), p(['ij'])]);
    assert.deepEqual(contents(doc, 2), [p(['safe'])]);
    assert.equal(nodeAt(doc, [0, 0, 0, 0])?.a?.['bg'], 'yellow');
    assert.equal(nodeAt(doc, [0, 0, 0, 1])?.a?.['bg'], 'cyan');
    assert.equal(positionExists(doc, nabi.getSelection().focus, registry.env), true);
    assert.deepEqual(nabi.getSelection(), caretAt(start));
  }
}

console.log('cell boundaries: surrounding deletion, local editing, Enter, Tab ownership and cross-cell ranges passed');
