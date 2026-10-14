import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { caretAt, selectObject, type Selection } from '../src/caret/index.js';
import { nodeAt } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiNode } from '../src/schema/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { attachDetailsOpen } from '../src/wings/details/attach.js';

const el = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w,
  ...(a ? { a } : {}),
  ch,
});
const p = (ch: readonly NabiNode[]) => el('p', ch);
const details = () => p([el('details', [el('summary', ['title']), p(['body'])], { o: 1 })]);

for (const scope of ['cell', 'float'] as const) {
  for (const focus of ['body', 'summary', 'other'] as const) {
    const doc =
      scope === 'cell'
        ? [p([el('table', [el('tr', [el('td', [details()]), el('td', [details()])])])])]
        : [p([el('float', [details(), details()], { side: 'left', w: 40 })])];
    const { nabi, registry } = createNabiWith(defaultWings, { doc });
    const path = scope === 'cell' ? [0, 0, 0, 0, 0, 0] : [0, 0, 0, 0];
    const otherPath = scope === 'cell' ? [0, 0, 0, 1, 0, 0] : [0, 0, 1, 0];
    const selected: Selection = caretAt({
      path: focus === 'other' ? [...otherPath, 1] : [...path, focus === 'summary' ? 0 : 1],
      offset: 1,
    });
    nabi.select(selected);
    const original = nabi.getJson();
    const dom = new JSDOM(
      '<div id="surface"><details data-key="target" open><summary>title</summary><p>body</p></details></div>',
    );
    const root = dom.window.document.querySelector('#surface') as HTMLElement;
    const box = root.querySelector('details')!;
    const detach = attachDetailsOpen({
      root,
      nabi,
      doc: () => hostOf(nabi).doc(),
      env: registry.env,
      pathOfKey: (key) => (key === 'target' ? path : null),
      onDispose() {},
    });
    box.open = false;
    box.dispatchEvent(new dom.window.Event('toggle'));
    assert.equal(nodeAt(hostOf(nabi).doc(), path)?.a?.['o'], undefined, `${scope}/${focus}: clicked details closes`);
    assert.equal(nodeAt(hostOf(nabi).doc(), otherPath)?.a?.['o'], 1, `${scope}/${focus}: other details unchanged`);
    assert.deepEqual(nabi.getSelection(), focus === 'body' ? selectObject(path.slice(0, -1)) : selected);
    assert.equal(nabi.undo(), true);
    assert.deepEqual(nabi.getJson(), original, `${scope}/${focus}: one undo restores open state`);
    nabi.redo();
    const beforeOpen = nabi.getSelection();
    box.open = true;
    box.dispatchEvent(new dom.window.Event('toggle'));
    assert.equal(nodeAt(hostOf(nabi).doc(), path)?.a?.['o'], 1);
    assert.deepEqual(nabi.getSelection(), beforeOpen, `${scope}/${focus}: opening preserves selection`);
    detach();
    dom.window.close();
  }
}

console.log(
  'details boundaries: cell/float toggle targeting, hidden-body selection, outside selection and undo passed',
);
