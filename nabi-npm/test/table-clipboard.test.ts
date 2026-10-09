import assert from 'node:assert/strict';
import { createNabiWith, defaultWings } from '../src/index.js';
import { hostOf } from '../src/editor/index.js';
import { nodeAt } from '../src/doc/index.js';
import { $toJson, type ElementNode } from '../src/schema/index.js';
import { clipboardBodyOf } from '../src/surface/clipboard.js';
import { cutTableSelection, tableClipboardOf } from '../src/wings/table/clipboard.js';

const cell = (text: string, a?: ElementNode['a']): ElementNode => ({
  w: 'td',
  ...(a ? { a } : {}),
  ch: [{ w: 'p', ch: text ? [text] : [] }],
});
const row = (...ch: ElementNode[]): ElementNode => ({ w: 'tr', ch });
const paragraph = (table: ElementNode): ElementNode => ({ w: 'p', ch: [table] });
const at = (r: number, c: number) => ({ path: [0, 0, r, c, 0], offset: 0 });
const rows = Array.from({ length: 5 }, (_, r) =>
  row(...Array.from({ length: 5 }, (_, c) => cell(`R${r + 1}C${c + 1}`))),
);
const { nabi, registry } = createNabiWith(defaultWings, { doc: [paragraph({ w: 'table', ch: rows })] });
const doc = hostOf(nabi).doc();

for (let start = 0; start < 25; start += 1) {
  for (let end = 0; end < 25; end += 1) {
    if (start === end) continue;
    const r1 = Math.floor(start / 5);
    const c1 = start % 5;
    const r2 = Math.floor(end / 5);
    const c2 = end % 5;
    const selection = { anchor: at(r1, c1), focus: at(r2, c2) };
    const expected = rows
      .slice(Math.min(r1, r2), Math.max(r1, r2) + 1)
      .map((r) => row(...(r.ch.slice(Math.min(c1, c2), Math.max(c1, c2) + 1) as ElementNode[])));
    const clip = tableClipboardOf(doc, selection)!;
    assert.deepEqual($toJson(clipboardBodyOf(doc, selection, registry.env)), [paragraph({ w: 'table', ch: expected })]);
    const expectedText = expected
      .map((r) => r.ch.map((c) => ((c as ElementNode).ch[0] as ElementNode).ch[0]).join('\t'))
      .join('\n');
    assert.equal(clip.plain, expectedText);
  }
}

for (const rows of [
  [
    row(cell('left'), cell('merged', { rowspan: '2', colspan: '2' }), cell('right'), cell('outside')),
    row(cell('left2'), cell('bottom'), cell('outside2')),
  ],
  [
    row(cell('left'), cell('A', { rowspan: '2' }), cell('B', { rowspan: '2' }), cell('outside')),
    row(cell('left2'), cell('outside2')),
  ],
]) {
  const { nabi } = createNabiWith(defaultWings, { doc: [paragraph({ w: 'table', ch: rows })] });
  const doc = hostOf(nabi).doc();
  const selection = {
    anchor: at(0, 1),
    focus: rows[0]!.ch.length === 4 && rows[1]!.ch.length === 2 ? at(0, 2) : at(1, 1),
  };
  const clip = tableClipboardOf(doc, selection)!;
  const expected = [
    paragraph({
      w: 'table',
      ch: [row(...(rows[0]!.ch.slice(1, 3) as ElementNode[])), row(...(rows[1]!.ch.slice(1, -1) as ElementNode[]))],
    }),
  ];
  assert.deepEqual($toJson(clip.body), expected, 'merged cells retain spans and fully covered rows');
  const target = createNabiWith(defaultWings, { doc: $toJson(clip.body) });
  assert.deepEqual(target.nabi.getJson(), expected, 'normalization does not bring back unselected cells');
  assert.equal(clip.plain.includes('left'), false);
  assert.equal(clip.plain.includes('outside'), false);
}

const special = createNabiWith(defaultWings, {
  doc: [
    paragraph({
      w: 'table',
      ch: [
        row(
          cell('outside'),
          {
            w: 'td',
            a: { th: 1 },
            ch: [{ w: 'p', ch: ['  ', { w: 'b', ch: ['bold'] }, { w: 'br', ch: [] }, 'next'] }],
          },
          cell(''),
        ),
        row(cell('outside2'), cell('bottom'), cell('last')),
      ],
    }),
  ],
});
const selected = { anchor: at(0, 1), focus: at(1, 2) };
const clip = tableClipboardOf(hostOf(special.nabi).doc(), selected)!;
assert.equal(clip.plain, '  bold\nnext\t\nbottom\tlast');
assert.equal(nodeAt(clip.body, [0, 0, 0, 0])?.a?.th, 1);
assert.deepEqual(nodeAt(clip.body, [0, 0, 0, 0, 0])?.ch, nodeAt(hostOf(special.nabi).doc(), [0, 0, 0, 1, 0])?.ch);
const before = special.nabi.getJson();
special.nabi.select(selected);
assert.equal(hostOf(special.nabi).applyRaw(cutTableSelection, 'deleteRange'), true);
assert.equal(nodeAt(hostOf(special.nabi).doc(), [0, 0, 0, 0, 0])?.ch[0], 'outside');
for (const r of [0, 1])
  for (const c of [1, 2]) assert.deepEqual(nodeAt(hostOf(special.nabi).doc(), [0, 0, r, c, 0])?.ch, []);
assert.equal(special.nabi.undo(), true);
assert.deepEqual(special.nabi.getJson(), before);
assert.equal(tableClipboardOf(doc, { anchor: at(1, 1), focus: { ...at(1, 1), offset: 2 } }), null);
assert.equal(tableClipboardOf(doc, { anchor: at(1, 1), focus: { path: [0], offset: 1 } }), null);

console.log(
  'table clipboard: all 5x5 rectangles, reverse selections, merged/empty cells, formatting and cut undo passed',
);
