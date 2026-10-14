import { caretAt, type Selection } from '../src/caret/index.js';
import { diffDocs } from '../src/diff/index.js';
import { hostOf } from '../src/editor/index.js';
import { renderMarkdown } from '../src/io/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { renderStoredEditorHtml, renderStoredHtml } from '../src/ssr.js';
import { contextGroupsAt } from '../src/ui/groups.js';
import { $createNabiWith, makeRegistry } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { cutTableSelection, tableClipboardOf } from '../src/wings/table/clipboard.js';
import { CELL_COLORS } from '../src/wings/table/color.js';
import { cellGrid, tableWing } from '../src/wings/table/index.js';
import { done, eq, ok } from './net.js';
import { tinyHtml } from './tiny-html.js';

const registry = makeRegistry(defaultWings);
const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const cell = (text: string, a?: ElementNode['a']): ElementNode => ({ w: 'td', ...(a ? { a } : {}), ch: [p(text)] });
const table = (rows: readonly ElementNode[][], a?: ElementNode['a']): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ...(a ? { a } : {}), ch: rows.map((ch) => ({ w: 'tr', ch })) }],
});
const initial = (): NabiDoc => [
  table([
    [cell('a', { th: 1 }), cell('b', { th: 1 })],
    [cell('c'), cell('d')],
  ]),
  p('outside'),
];
const make = (doc: NabiDoc = initial()) => $createNabiWith(defaultWings, { doc, parseHtml: tinyHtml }).nabi;
const at = (row: number, column: number, top = 0) => ({ path: [top, 0, row, column, 0], offset: 0 });
const grid = (nabi: ReturnType<typeof make>) => cellGrid(hostOf(nabi).doc()[0]!.ch[0] as ElementNode);
const colors = (nabi: ReturnType<typeof make>) => grid(nabi).cells.map((item) => item.cell.a?.['bg'] ?? '');
const group = (nabi: ReturnType<typeof make>) =>
  contextGroupsAt(hostOf(nabi).doc(), nabi.getSelection(), registry, registry.env).find(
    (item) => item.wing.w === 'table',
  );

{
  const nabi = make();
  nabi.select(caretAt(at(1, 0)));
  const selection = nabi.getSelection();
  for (const bg of CELL_COLORS) {
    ok(`${bg}: apply`, nabi.applyCommand('setCellColor', { bg }));
    eq(`${bg}: current cell only`, colors(nabi), ['', '', bg, '']);
    eq(`${bg}: selection preserved`, nabi.getSelection(), selection);
    ok(`${bg}: repeated value is unchanged`, !nabi.applyCommand('setCellColor', { bg }));
  }
  ok('clear background', nabi.applyCommand('setCellColor', { bg: '' }));
  eq('clear removes attribute', grid(nabi).cells[2]!.cell.a, undefined);
  ok('clear twice is unchanged', !nabi.applyCommand('setCellColor', { bg: '' }));
  ok('undo clear', nabi.undo());
  eq('undo restores last color', colors(nabi)[2], 'orange');
  ok('redo clear', nabi.redo());
  const before = nabi.getJson();
  for (const bg of [undefined, null, false, 1, 'red', '#fff', 'YELLOW', 'yellow ', 'url(javascript:alert(1))'])
    ok(`invalid color ${String(bg)}`, !nabi.applyCommand('setCellColor', { bg }));
  eq('invalid input changes nothing', nabi.getJson(), before);
}

{
  const nabi = make();
  const selection = { anchor: { ...at(1, 1), offset: 1 }, focus: at(0, 0) };
  nabi.select(selection);
  const before = nabi.getJson();
  ok('backward rectangle apply', nabi.applyCommand('setCellColor', { bg: 'pink' }));
  eq('rectangle includes final cell', colors(nabi), ['pink', 'pink', 'pink', 'pink']);
  eq('rectangle selection preserved', nabi.getSelection(), selection);
  eq('uniform selection value', group(nabi)?.state?.values?.['cellColor'], 'pink');
  ok('one undo restores rectangle', nabi.undo());
  eq('undo restores document', nabi.getJson(), before);
  ok('redo rectangle', nabi.redo());
  nabi.select({ anchor: at(1, 0), focus: { ...at(1, 0), offset: 1 } });
  ok('text range colors whole cell', nabi.applyCommand('setCellColor', { bg: 'cyan' }));
  eq('only text range cell changed', colors(nabi), ['pink', 'pink', 'cyan', 'pink']);
  nabi.select(selection);
  eq('mixed colors have no current swatch', group(nabi)?.state?.values?.['cellColor'], undefined);
  ok('mixed value override remains present', Object.hasOwn(group(nabi)?.state?.values ?? {}, 'cellColor'));
}

{
  const nabi = make([table([[cell('a'), cell('b')]], { sort: 1 })]);
  nabi.select(caretAt(at(0, 1)));
  eq('sortable table still targets uncolored cell', group(nabi)?.node, grid(nabi).cells[1]?.cell);
  eq('default background is selected', group(nabi)?.state?.values?.['cellColor'], '');
  ok('resolver keeps actual node identity', group(nabi)?.node === grid(nabi).cells[1]?.cell);
  const clone = { ...tableWing };
  const clonedRegistry = makeRegistry(defaultWings.map((wing) => (wing.w === 'table' ? clone : wing)));
  eq(
    'resolver survives wing spread',
    contextGroupsAt(hostOf(nabi).doc(), nabi.getSelection(), clonedRegistry, clonedRegistry.env)[0]?.state?.values?.[
      'cellColor'
    ],
    '',
  );
}

{
  const nabi = make([...initial(), table([[cell('other')]])]);
  const selections: Selection[] = [
    caretAt({ path: [1], offset: 0 }),
    { anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } },
    { anchor: at(0, 0), focus: { path: [1], offset: 1 } },
    { anchor: { path: [1], offset: 1 }, focus: at(0, 0) },
    { anchor: at(0, 0), focus: at(0, 0, 2) },
  ];
  for (const selection of selections) {
    nabi.select(selection);
    const before = nabi.getJson();
    ok('non-cell selection rejected', !nabi.applyCommand('setCellColor', { bg: 'purple' }));
    eq('non-cell selection unchanged', nabi.getJson(), before);
    const context = group(nabi);
    ok('non-cell palette hidden', !context || context.state?.hidden?.includes('cellColor') === true);
  }
}

{
  const nabi = make([table([[cell('a', { bg: 'green', rowspan: '2' }), cell('b')], [cell('c')]])]);
  nabi.select({ anchor: at(0, 0), focus: at(0, 1) });
  ok('merged rectangle apply', nabi.applyCommand('setCellColor', { bg: 'yellow' }));
  eq('merged-cell expansion includes lower neighbor', colors(nabi), ['yellow', 'yellow', 'yellow']);
}

{
  const nabi = make([
    table([
      [cell('a', { th: 1, bg: 'green' }), cell('b', { bg: 'pink' })],
      [cell('c'), cell('d')],
    ]),
  ]);
  nabi.select({ anchor: at(0, 0), focus: at(1, 1) });
  ok('merge colored cells', nabi.applyCommand('mergeCells'));
  eq('merge keeps top-left color', colors(nabi), ['green']);
  ok('split colored cell', nabi.applyCommand('mergeCells'));
  eq('split inherits background', colors(nabi), ['green', 'green', 'green', 'green']);
  eq(
    'split preserves content in origin',
    cellGrid((nabi.getJson() as NabiDoc)[0]!.ch[0] as ElementNode).cells[0]?.cell.ch,
    [p('a'), p('b'), p('c'), p('d')],
  );
  ok('insert row', nabi.applyCommand('addRowBelow'));
  eq('new row uses default background', colors(nabi), ['green', 'green', '', '', 'green', 'green']);
  ok('insert column', nabi.applyCommand('addColumnRight'));
  eq('new column uses default background', colors(nabi), ['green', '', 'green', '', '', '', 'green', '', 'green']);
}

{
  const nabi = make([table([[cell('a', { bg: 'cyan', rowspan: '2' }), cell('b')], [cell('c')]])]);
  nabi.select(caretAt(at(0, 1)));
  ok('insert through merged row', nabi.applyCommand('addRowBelow'));
  eq('extended merged cell keeps color', grid(nabi).cells[0]?.cell.a?.['bg'], 'cyan');
  eq('extended merged cell grows', grid(nabi).cells[0]?.rowSpan, 3);
}

{
  const nabi = make([table([[cell('a', { bg: 'pink', th: 1 }), cell('b', { bg: 'cyan' })]])]);
  nabi.select(caretAt(at(0, 0)));
  nabi.applyCommand('toggleHeaderRow');
  eq('header toggle preserves colors', colors(nabi), ['pink', 'cyan']);
  nabi.applyCommand('clearFormat');
  eq('clear format preserves cell color', colors(nabi), ['pink', 'cyan']);
  nabi.select({ anchor: at(0, 0), focus: at(0, 1) });
  const fragment = tableClipboardOf(hostOf(nabi).doc(), nabi.getSelection());
  ok('clipboard retains colors', JSON.stringify(fragment?.body).includes('"bg":"pink"'));
  const cut = cutTableSelection(hostOf(nabi).doc(), nabi.getSelection(), {}, registry.env);
  eq(
    'cut retains backgrounds',
    cellGrid(cut!.doc[0]!.ch[0] as ElementNode).cells.map((item) => item.cell.a?.['bg']),
    ['pink', 'cyan'],
  );
  eq(
    'cut removes content',
    cellGrid(cut!.doc[0]!.ch[0] as ElementNode).cells.map((item) => (item.cell.ch[0] as ElementNode).ch),
    [[], []],
  );
}

for (const bg of CELL_COLORS) {
  const nabi = make([table([[cell('a', { th: 1, bg }), cell('b', { bg })]])]);
  const json = nabi.getJson();
  const html = nabi.getHtml();
  ok(`${bg}: header HTML`, html.includes(`<th data-nabi-cell-color="${bg}">`));
  ok(`${bg}: normal HTML`, html.includes(`<td data-nabi-cell-color="${bg}">`));
  const reread = make();
  ok(`${bg}: HTML import`, reread.setHtml(html));
  eq(`${bg}: HTML roundtrip`, reread.getJson(), json);
  eq(`${bg}: SSR stored HTML`, renderStoredHtml(json, registry), html);
  eq(`${bg}: SSR editor HTML`, renderStoredEditorHtml(json, registry), nabi.getEditorHtml());
  ok(
    `${bg}: Markdown retains color`,
    renderMarkdown(json as NabiDoc, {
      env: registry.env,
      builders: registry.mdBuilders,
      html: { env: registry.env, builders: registry.builders },
    }).includes(`data-nabi-cell-color="${bg}"`),
  );
}

{
  const nabi = make([table([[cell('a', { bg: 'invalid' }), cell('b', { bg: 1 })]])]);
  eq('JSON repair strips unknown values', colors(nabi), ['', '']);
  nabi.setHtml(
    '<table><tr><th data-nabi-cell-color="red">a</th><td data-nabi-cell-color="yellow; color:red" style="background:red">b</td></tr></table>',
  );
  eq('HTML strips invalid colors and arbitrary CSS', colors(nabi), ['', '']);
  eq('header survives invalid color', grid(nabi).cells[0]?.cell.a?.['th'], 1);
  const plain = make();
  const json = plain.getJson();
  plain.select(caretAt(at(0, 0)));
  plain.applyCommand('setCellColor', { bg: 'orange' });
  const diff = diffDocs(json, plain.getJson(), registry);
  eq('color-only change detected', diff?.changes.length, 1);
  ok('diff retains color', diff?.after[0]?.html.includes('data-nabi-cell-color="orange"') === true);
  ok(
    'plain tables remain Markdown pipes',
    renderMarkdown(json as NabiDoc, {
      env: registry.env,
      builders: registry.mdBuilders,
      html: { env: registry.env, builders: registry.builders },
    }).includes('| --- |'),
  );
}

done('table-color');
