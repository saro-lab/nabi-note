import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountPickedMark, mountSurface } from '../src/index.js';
import { hostOf } from '../src/editor/index.js';
import { nodeAt, type Position } from '../src/doc/index.js';
import type { ElementNode } from '../src/schema/index.js';
import { contextGroupsAt, pressedOf, reachAt, visibleAt } from '../src/ui/index.js';

const p = (text = 'text'): ElementNode => ({ w: 'p', ch: [text] });
const image = (): ElementNode => ({ w: 'p', ch: [{ w: 'img', a: { src: 'https://example.com/image.png' }, ch: [] }] });
const code = (): ElementNode => ({ w: 'p', ch: [{ w: 'code', ch: ['code'] }] });
const cell = (ch: readonly ElementNode[], th = false): ElementNode => ({
  w: 'td',
  ch,
  ...(th ? { a: { th: 1 } } : {}),
});
const table = (rows: readonly (readonly ElementNode[])[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: rows.map((cells) => ({ w: 'tr', ch: cells })) }],
});
const at = (path: readonly number[], offset = 0): Position => ({ path, offset });
const make = (doc: readonly ElementNode[]) => createNabiWith(defaultWings, { doc, typingMergeMs: 0 });
type Editor = ReturnType<typeof make>;
const select = ({ nabi }: Editor, anchor: Position, focus = anchor): void => {
  nabi.select({ anchor, focus });
  assert.deepEqual(nabi.getSelection(), { anchor, focus });
};
const attr = ({ nabi }: Editor, path: readonly number[], key = 'a') => nodeAt(hostOf(nabi).doc(), path)?.a?.[key];
const shown = ({ nabi, registry }: Editor, w: string): boolean => {
  const sel = nabi.getSelection();
  return visibleAt(reachAt(hostOf(nabi).doc(), sel.focus, registry, hostOf(nabi).env, sel), registry.wingOf(w)!);
};
const state = ({ nabi, registry }: Editor, w: string) =>
  pressedOf({ doc: hostOf(nabi).doc(), sel: nabi.getSelection(), env: hostOf(nabi).env, registry }, w);

{
  const editor = make([table([[cell([p('first'), image(), code()]), cell([p('other')])]])]);
  const text = [0, 0, 0, 0, 0];
  const picture = [0, 0, 0, 0, 1];
  select(editor, at(text, 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), true);
  assert.equal(attr(editor, text), 'c');
  assert.equal(attr(editor, [0]), undefined);
  assert.equal(attr(editor, [0, 0, 0, 1, 0]), undefined);
  assert.deepEqual(state(editor, 'align'), { on: true, value: 'c' });
  assert.equal(shown(editor, 'table'), false);
  assert.equal(shown(editor, 'float'), false);
  assert.equal(shown(editor, 'img'), true);
  assert.equal(editor.nabi.undo(), true);
  assert.equal(attr(editor, text), undefined);
  select(editor, at(picture), at(picture, 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'r' }), true);
  assert.equal(attr(editor, picture), 'r');
  assert.equal(shown(editor, 'h'), false);
  select(editor, at([0, 0, 0, 0, 2, 0], 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), false);
  assert.equal(shown(editor, 'align'), false);
}

{
  const editor = make([table([[cell([p('body')]), cell([p('header')], true)]])]);
  const body = [0, 0, 0, 0, 0];
  const header = [0, 0, 0, 1, 0];
  select(editor, at(body, 1));
  assert.equal(editor.nabi.applyCommand('setHeading', { value: 2 }), true);
  assert.equal(attr(editor, body, 'h'), 2);
  assert.deepEqual(state(editor, 'h'), { on: true, value: '2' });
  const host = hostOf(editor.nabi);
  const context = contextGroupsAt(host.doc(), editor.nabi.getSelection(), editor.registry, host.env);
  assert.equal(context.find((group) => group.wing.w === 'h')?.node, nodeAt(host.doc(), body));
  assert.equal(editor.nabi.applyCommand('toggleDropCap'), true);
  assert.equal(attr(editor, body, 'dc'), 1);
  select(editor, at(header, 1));
  assert.equal(shown(editor, 'h'), false);
  assert.equal(editor.nabi.applyCommand('setHeading', { value: 2 }), false);
  assert.equal(attr(editor, header, 'h'), undefined);
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), true);
  assert.equal(attr(editor, header), 'c');
}

{
  const editor = make([
    table([
      [cell([p('A')]), cell([p('B'), image()])],
      [cell([p('C')]), cell([p('D'), code(), p('E')])],
    ]),
  ]);
  select(editor, at([0, 0, 0, 1, 0]), at([0, 0, 1, 1, 2], 1));
  assert.equal(shown(editor, 'img'), false);
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'r' }), true);
  for (const path of [
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 2],
  ])
    assert.equal(attr(editor, path), 'r');
  for (const path of [[0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 1, 1]])
    assert.equal(attr(editor, path), undefined);
  assert.deepEqual(state(editor, 'align'), { on: true, value: 'r' });
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'r' }), true);
  assert.deepEqual(state(editor, 'align'), { on: false });
}

{
  const editor = make([table([[cell([p()])]]), p('outside')]);
  for (const offset of [0, 1]) {
    select(editor, at([0], offset));
    assert.equal(shown(editor, 'align'), true);
    assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), true);
    assert.equal(attr(editor, [0]), 'c');
    assert.equal(attr(editor, [0, 0, 0, 0, 0]), undefined);
    assert.deepEqual(state(editor, 'align'), { on: true, value: 'c' });
    assert.deepEqual(editor.nabi.getSelection(), { anchor: at([0], offset), focus: at([0], offset) });
    assert.equal(editor.nabi.undo(), true);
  }
  select(editor, at([0]), at([0], 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), true);
  assert.equal(attr(editor, [0]), 'c');
  assert.equal(shown(editor, 'align'), true);
  select(editor, at([0, 0, 0, 0, 0]), at([1], 2));
  const before = editor.nabi.getJson();
  for (const command of ['setAlign', 'setHeading', 'toggleDropCap'])
    assert.equal(editor.nabi.applyCommand(command, { value: command === 'setAlign' ? 'r' : 1 }), false);
  assert.deepEqual(editor.nabi.getJson(), before);
  assert.equal(shown(editor, 'align'), false);
  assert.equal(shown(editor, 'img'), false);
  select(editor, at([0]), at([1], 2));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'r' }), true);
  assert.equal(attr(editor, [0]), 'c');
  assert.equal(attr(editor, [1]), 'r');
}

{
  const editor = make([{ w: 'p', ch: [{ w: 'float', ch: [table([[cell([p()])]])] }] }]);
  select(editor, at([0, 0, 0]), at([0, 0, 0], 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'r' }), true);
  assert.equal(attr(editor, [0, 0, 0]), 'r');
}

{
  const editor = make([table([[cell([{ w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [p('item')] }] }] }])]])]);
  const path = [0, 0, 0, 0, 0, 0, 0, 0];
  select(editor, at(path, 1));
  assert.equal(editor.nabi.applyCommand('setAlign', { value: 'c' }), true);
  assert.equal(attr(editor, path), 'c');
  assert.equal(attr(editor, [0]), undefined);
  assert.equal(shown(editor, 'table'), false);
  assert.equal(shown(editor, 'float'), false);
  assert.equal(shown(editor, 'img'), true);
}

{
  const dom = new JSDOM('<div id="surface"></div>');
  const surface = dom.window.document.getElementById('surface')!;
  const editor = make([table([[cell([image()])]])]);
  const mounted = mountSurface({ ...editor, root: surface });
  const picked = mountPickedMark({ nabi: editor.nabi, surface });
  const path = [0, 0, 0, 0, 0];
  const saved = editor.nabi.getHtml();
  for (const offset of [0, 1]) {
    select(editor, at([0], offset));
    assert.equal(surface.querySelector('[data-nabi-picked]')?.tagName, 'TABLE');
    assert.equal(editor.nabi.getHtml(), saved);
    select(editor, at(path));
    assert.equal(surface.querySelector('[data-nabi-picked]'), null);
  }
  select(editor, at([0]), at([0], 1));
  assert.equal(surface.querySelector('[data-nabi-picked]')?.tagName, 'TABLE');
  select(editor, at(path), at(path, 1));
  assert.equal(surface.querySelector('[data-nabi-picked]')?.tagName, 'IMG');
  select(editor, at(path, 1));
  assert.equal(surface.querySelector('[data-nabi-picked]'), null);
  picked.unmount();
  mounted.unmount();
  dom.window.close();
}

console.log(
  'table paragraphs: scoped attrs, rectangular alignment, headers, object selection, visibility and picked images passed',
);
