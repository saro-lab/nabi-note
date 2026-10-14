import assert from 'node:assert/strict';
import { caretAt } from '../src/caret/index.js';
import { hostOf } from '../src/editor/index.js';
import { nodeAt, positionExists } from '../src/doc/index.js';
import { renderMarkdown } from '../src/io/index.js';
import { $toJson, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { $createNabiWith, routeKey } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { cellGrid } from '../src/wings/table/grid.js';
import { cellBoundary } from '../src/wings/table/selection.js';
import { cutTableSelection, tableClipboardOf } from '../src/wings/table/clipboard.js';
import { tinyHtml } from './tiny-html.js';

const el = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w,
  ...(a ? { a } : {}),
  ch,
});
const p = (ch: readonly NabiNode[] = [], a?: ElementNode['a']) => el('p', ch, a);
const cell = (ch: readonly NabiNode[] = [], a?: ElementNode['a']) => el('td', ch, a);
const row = (...ch: ElementNode[]) => el('tr', ch);
const table = (...rows: ElementNode[]) => p([el('table', rows)]);
const image = () => p([el('img', [], { src: 'https://example.com/image.png', w: '60' })]);
const list = () => p([el('ul', [el('li', [p(['item'])])])]);
const at = (column = 0, paragraph = 0, offset = 0) => ({ path: [0, 0, 0, column, paragraph], offset });
const make = (doc: NabiDoc) => $createNabiWith(defaultWings, { doc, parseHtml: tinyHtml });
const children = (doc: NabiDoc, column = 0) => nodeAt(doc, [0, 0, 0, column])!.ch as NabiDoc;
const types = (nodes: readonly NabiNode[]): string[] =>
  nodes.flatMap((node) => (typeof node === 'string' ? [] : [node.w, ...types(node.ch)]));

{
  const rich = [
    p(['before']),
    image(),
    list(),
    p([el('quote', [p(['quote'])])]),
    p([el('code', ['a', el('br'), 'b'])]),
    p(['after']),
  ];
  const { nabi } = make([table(row(cell(rich)))]);
  const json = nabi.getJson() as NabiDoc;
  assert.equal(children(json).length, rich.length);
  assert.deepEqual(
    types(children(json)).filter((w) => ['img', 'ul', 'quote', 'code'].includes(w)),
    ['img', 'ul', 'quote', 'code'],
  );
  const html = nabi.getHtml();
  assert.equal(nabi.setHtml(html), true);
  assert.deepEqual(nabi.getJson(), json);
}

{
  const nested = p([
    el('quote', [table(row(cell([p(['nested']), image()]))), p([el('float', [list(), p(['floating'])])])]),
  ]);
  const { nabi } = make([table(row(cell([nested, p(['end'])])))]);
  const json = nabi.getJson() as NabiDoc;
  assert.equal(types(json).filter((w) => w === 'table').length, 1);
  assert.equal(types(json).includes('float'), false);
  assert.equal(types(json).includes('img'), true);
  assert.equal(types(json).includes('ul'), true);
  const output = nabi.getHtml();
  assert.ok(output.indexOf('nested') < output.indexOf('image.png'));
  assert.ok(output.indexOf('image.png') < output.indexOf('item'));
  assert.ok(output.indexOf('item') < output.indexOf('floating'));
  assert.ok(output.indexOf('floating') < output.indexOf('end'));
}

{
  const { nabi } = make([
    table(row(cell([p(['title'], { h: 2 }), p([el('quote', [p(['nested title'], { h: 3 })])])]))),
  ]);
  assert.ok(nabi.getHtml().includes('<h2'));
  nabi.select(caretAt(at()));
  assert.equal(nabi.applyCommand('toggleHeaderRow'), true);
  assert.equal(/<h[1-6]/.test(nabi.getHtml()), false);
  assert.ok(nabi.getHtml().includes('nested title'));
  assert.equal(nabi.applyCommand('toggleHeaderRow'), true);
  assert.equal(/<h[1-6]/.test(nabi.getHtml()), false);
}

for (const [command, args, expected] of [
  ['insertImage', { src: 'https://example.com/image.png' }, 'img'],
  ['toggleBulletList', {}, 'ul'],
  ['toggleQuote', {}, 'quote'],
  ['toggleCode', {}, 'code'],
  ['toggleDetails', {}, 'details'],
  ['insertDivider', {}, 'hr'],
] as const) {
  const { nabi, registry } = make([table(row(cell([p(['text'])]), cell([p(['untouched'])])))]);
  nabi.select(caretAt(at(0, 0, 2)));
  assert.equal(nabi.applyCommand(command, args), true, command);
  const doc = hostOf(nabi).doc();
  assert.equal(doc.length, 1, `${command} stays inside table`);
  assert.ok(types(children(doc)).includes(expected), `${command} inside current cell`);
  assert.deepEqual($toJson(children(doc, 1)), [p(['untouched'])]);
  assert.equal(positionExists(doc, nabi.getSelection().focus, registry.env), true);
}

{
  const { nabi } = make([table(row(cell([p(['a'])]), cell([p(['b'])])))]);
  nabi.select(caretAt(at()));
  const before = nabi.getJson();
  assert.equal(nabi.applyCommand('insertTable'), false);
  assert.deepEqual(nabi.getJson(), before);
  assert.equal(nabi.applyCommand('selectTable'), true);
  assert.deepEqual(nabi.getSelection(), { anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } });
}

{
  const { nabi, registry } = make([
    table(row(cell([p(['first']), image()], { bg: 'yellow' }), cell([list(), p(['last'])]))),
  ]);
  nabi.select({ anchor: at(), focus: at(1, 1, 4) });
  assert.equal(nabi.applyCommand('mergeCells'), true);
  assert.deepEqual(
    types(children(hostOf(nabi).doc())).filter((w) => w === 'img' || w === 'ul'),
    ['img', 'ul'],
  );
  assert.equal(children(hostOf(nabi).doc()).length, 4);
  assert.equal(positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env), true);
  assert.equal(nabi.applyCommand('mergeCells'), true);
  assert.equal(children(hostOf(nabi).doc()).length, 4);
  assert.deepEqual($toJson(children(hostOf(nabi).doc(), 1)), [p()]);
  assert.equal(nodeAt(hostOf(nabi).doc(), [0, 0, 0, 1])?.a?.['bg'], 'yellow');
}

{
  const { nabi, registry } = make([table(row(cell([p(['first']), p(['last'])]), cell([list(), image()])))]);
  const doc = hostOf(nabi).doc();
  const grid = cellGrid(nodeAt(doc, [0, 0])!);
  const first = cellBoundary([0, 0], grid.cells[1]!, registry.env);
  assert.deepEqual(first, { path: [0, 0, 0, 1, 0, 0, 0, 0], offset: 0 });
  assert.deepEqual(cellBoundary([0, 0], grid.cells[1]!, registry.env, true), at(1, 1, 1));
  assert.equal(routeKey({ key: 'arrow', dir: 'right' }, doc, caretAt(at(0, 0, 5)), registry.env, registry), null);
  assert.equal(routeKey({ key: 'arrow', dir: 'down' }, doc, caretAt(at(0, 0, 2)), registry.env, registry), null);
  assert.deepEqual(routeKey({ key: 'tab' }, doc, caretAt(at(0, 1, 4)), registry.env, registry)?.selection.focus, first);
  assert.deepEqual(
    routeKey({ key: 'arrow', dir: 'right' }, doc, caretAt(at(0, 1, 4)), registry.env, registry)?.selection.focus,
    first,
  );
  const listTab = routeKey({ key: 'tab' }, doc, caretAt(first), registry.env, registry);
  assert.deepEqual(listTab?.selection.focus, first);
}

{
  const { nabi, registry } = make([
    table(row(cell([p(['one']), image(), list()], { bg: 'green' }), cell([p(['two'])]))),
  ]);
  const selection = { anchor: at(), focus: at(1) };
  const doc = hostOf(nabi).doc();
  const clip = tableClipboardOf(doc, selection)!;
  assert.equal(clip.plain, 'one\nhttps://example.com/image.png\nitem\ttwo');
  const cut = cutTableSelection(doc, selection, {}, registry.env)!;
  assert.deepEqual($toJson(children(cut.doc)), [p()]);
  assert.deepEqual($toJson(children(cut.doc, 1)), [p()]);
  assert.equal(nodeAt(cut.doc, [0, 0, 0, 0])?.a?.['bg'], 'green');
}

{
  const { nabi, registry } = make([table(row(cell([p(['header'])], { th: 1 })), row(cell([p(['one']), p(['two'])])))]);
  const md = renderMarkdown(nabi.getJson() as NabiDoc, {
    env: registry.env,
    builders: registry.mdBuilders,
    html: { env: registry.env, builders: registry.builders },
  });
  assert.ok(md.includes('<table>'));
  assert.ok(md.includes('<p>one</p><p>two</p>'));
}

console.log(
  'table blocks: content preservation, nesting, headings, commands, merge, navigation, clipboard and Markdown passed',
);
