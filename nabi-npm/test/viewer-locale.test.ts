import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createLocale, LOCALES } from '../src/locale/index.js';
import { attachViewer } from '../src/viewer/index.js';

for (const language of LOCALES) {
  const dom = new JSDOM(
    '<!doctype html><article><pre><code>x</code></pre><table data-nabi-sortable><tr><th>Value</th></tr><tr><td>1</td></tr><tr><td>2</td></tr></table></article>',
    { url: 'https://example.test' },
  );
  const root = dom.window.document.querySelector('article')!;
  let reject = false;
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: {
      writeText: async () => {
        if (reject) throw new Error('denied');
      },
    },
  });
  const locale = createLocale(`${language}-XX`);
  const viewer = attachViewer(root, { locale });
  const copy = root.querySelector<HTMLButtonElement>('.nabi-code-copy')!;
  const sort = root.querySelector<HTMLButtonElement>('th button')!;
  const labels = new Set<string>();
  const check = (element: HTMLElement, english: string): void => {
    const label = element.getAttribute('aria-label') ?? '';
    assert.ok(label.trim(), `${language}: missing label`);
    if (language === 'en') assert.equal(label, english);
    else assert.notEqual(label, english, `${language}: English fallback`);
    labels.add(label);
  };
  check(copy, 'Copy code');
  copy.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(copy, 'Code copied');
  reject = true;
  copy.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(copy, 'Copy failed. Please try again.');
  check(sort, 'Sort: Original');
  sort.click();
  check(sort, 'Sort: Descending');
  sort.click();
  check(sort, 'Sort: Ascending');
  assert.equal(labels.size, 6, `${language}: distinct feedback and sorting labels`);
  const rows = [...root.querySelectorAll('tr')];
  locale.setLocale('en');
  assert.equal(sort.getAttribute('aria-label'), 'Sort: Ascending');
  assert.deepEqual([...root.querySelectorAll('tr')], rows);
  viewer.unmount();
  dom.window.close();
}

console.log('Viewer locale checks passed');
