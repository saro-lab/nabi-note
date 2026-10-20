import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM();
Object.assign(globalThis, { DOMParser: dom.window.DOMParser });
import { createNabiWith, defaultWings, type ElementNode } from '../src/index.js';
import { hostOf } from '../src/editor/index.js';
import { reachAt, visibleAt } from '../src/ui/index.js';

const heading = (level: number): ElementNode => ({ w: 'p', a: { h: level, a: 'c' }, ch: [{ w: 'b', ch: ['Title'] }] });
const paragraph = (text: string): ElementNode => ({ w: 'p', ch: [text] });
const details = (child: ElementNode, open = false): ElementNode => ({
  w: 'p',
  ch: [{ w: 'details', ...(open ? { a: { o: 1 } } : {}), ch: [{ w: 'summary', ch: ['Summary'] }, child] }],
});
const table = (child: ElementNode): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [child] }] }] }],
});
for (const open of [false, true]) {
  for (const level of [1, 2, 3, 4, 5, 6]) {
    const { nabi } = createNabiWith(defaultWings, { doc: [heading(level), details(table(heading(level)), open)] });
    assert.equal((nabi.getHtml().match(new RegExp(`<h${level}`, 'g')) ?? []).length, 1);
    assert.match(nabi.getHtml(), /<p><b>Title<\/b><\/p>/);
    nabi.setHtml(
      `<h${level}>Outside</h${level}><details open><summary>Summary</summary><blockquote><h${level}><b>Inside</b></h${level}></blockquote></details>`,
    );
    assert.equal((nabi.getHtml().match(new RegExp(`<h${level}`, 'g')) ?? []).length, 1);
    assert.match(nabi.getHtml(), /<b>Inside<\/b>/);
  }
}
for (const [doc, path] of [
  [[details(paragraph('Text'), true)], [0, 0, 1]],
  [[details(table(paragraph('Text')), true)], [0, 0, 1, 0, 0, 0, 0]],
  [[table(details(paragraph('Text'), true))], [0, 0, 0, 0, 0, 0, 1]],
] as const) {
  const { nabi, registry } = createNabiWith(defaultWings, { doc });
  const pos = { path, offset: 1 };
  nabi.select({ anchor: pos, focus: pos });
  const before = nabi.getJson();
  const host = hostOf(nabi);
  assert.equal(
    visibleAt(reachAt(host.doc(), pos, registry, host.env, nabi.getSelection()), registry.wingOf('h')!),
    false,
  );
  assert.equal(nabi.applyCommand('setHeading', { value: 1 }), false, `heading blocked at ${path}`);
  assert.deepEqual(nabi.getJson(), before);
}
{
  const { nabi } = createNabiWith(defaultWings, { doc: [heading(1)], typingMergeMs: 0 });
  const before = nabi.getJson();
  nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } });
  assert.equal(nabi.applyCommand('toggleDetails'), true);
  assert.doesNotMatch(nabi.getHtml(), /<h[1-6]/);
  assert.equal(nabi.undo(), true);
  assert.deepEqual(nabi.getJson(), before);
}
dom.window.close();
console.log('details headings: JSON/HTML, nested tables, commands, toolbar availability and undo passed');
