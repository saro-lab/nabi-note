import { caretAt } from '../src/caret/index.js';
import { renderMarkdown } from '../src/io/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { renderStoredEditorHtml, renderStoredHtml } from '../src/ssr.js';
import { $createNabiWith, makeRegistry } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { tableWing } from '../src/wings/table/index.js';
import { done, eq, ok } from './net.js';
import { tinyHtml } from './tiny-html.js';

const registry = makeRegistry(defaultWings);
const initial = (full?: unknown): NabiDoc => [
  {
    w: 'p',
    a: { a: 'r' },
    ch: [
      {
        w: 'table',
        a: { sort: 1, ...(full !== undefined ? { full: full as number } : {}) },
        ch: [{ w: 'tr', ch: ['a', 'b'].map((text) => ({ w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: [text] }] })) }],
      },
    ],
  },
  { w: 'p', ch: ['outside'] },
];
const make = (doc = initial()) => $createNabiWith(defaultWings, { doc, parseHtml: tinyHtml }).nabi;
const table = (nabi: ReturnType<typeof make>) => (nabi.getJson() as NabiDoc)[0]!.ch[0] as ElementNode;
const first = { path: [0, 0, 0, 0, 0], offset: 0 };
const second = { path: [0, 0, 0, 1, 0], offset: 0 };

for (const selection of [
  caretAt(first),
  { anchor: first, focus: second },
  { anchor: second, focus: first },
  caretAt({ path: [0], offset: 0 }),
  caretAt({ path: [0], offset: 1 }),
  { anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } },
]) {
  const nabi = make();
  nabi.select(selection);
  const before = nabi.getJson();
  ok('enable full width', nabi.applyCommand('toggleTableFullWidth'));
  eq('stores full width alongside sorting', table(nabi).a, { sort: 1, full: 1 });
  eq('selection preserved', nabi.getSelection(), selection);
  eq('alignment preserved', (nabi.getJson() as NabiDoc)[0]!.a, { a: 'r' });
  eq('both table state tokens', tableWing.currentValue?.(table(nabi)), 'sort full');
  ok('undo width', nabi.undo());
  eq('undo restores document', nabi.getJson(), before);
  ok('redo width', nabi.redo());
  ok('disable width', nabi.applyCommand('toggleTableFullWidth'));
  eq('disable restores document', nabi.getJson(), before);
}

for (const selection of [
  caretAt({ path: [1], offset: 0 }),
  { anchor: first, focus: { path: [1], offset: 0 } },
  { anchor: { path: [0], offset: 0 }, focus: first },
]) {
  const nabi = make();
  nabi.select(selection);
  const before = nabi.getJson();
  ok('reject outside or crossing selection', !nabi.applyCommand('toggleTableFullWidth'));
  eq('rejection preserves document', nabi.getJson(), before);
}

for (const value of [0, 2, '1']) {
  eq('invalid width flag removed', table(make(initial(value))).a, { sort: 1 });
}

{
  const nabi = make(initial(1));
  const json = nabi.getJson();
  const html = nabi.getHtml();
  ok('stored HTML has width marker', html.includes('data-nabi-table-full'));
  eq('SSR HTML matches', renderStoredHtml(json, registry), html);
  eq('SSR editor HTML matches', renderStoredEditorHtml(json, registry), nabi.getEditorHtml());
  const loaded = make();
  ok('HTML import', loaded.setHtml(html));
  eq('HTML preserves width, sorting and alignment', loaded.getJson(), json);
  loaded.setJson(json);
  eq('JSON preserves width', loaded.getJson(), json);
  const md = renderMarkdown(json as NabiDoc, {
    env: registry.env,
    builders: registry.mdBuilders,
    html: { env: registry.env, builders: registry.builders },
  });
  ok('Markdown falls back to HTML preserving width', md.includes('data-nabi-table-full'));
  nabi.select(caretAt(first));
  ok('select table', nabi.applyCommand('selectTable'));
  ok('alignment still available', nabi.applyCommand('setAlign', { value: 'c' }));
  eq('alignment does not disable width', table(nabi).a?.['full'], 1);
  nabi.select(caretAt(first));
  ok('sorting still available', nabi.applyCommand('toggleSortable'));
  eq('sorting does not disable width', table(nabi).a, { full: 1 });
  const widthOnly = make();
  widthOnly.setHtml(nabi.getHtml());
  eq('HTML width without sorting', table(widthOnly).a, { full: 1 });
}

done('table full width');
