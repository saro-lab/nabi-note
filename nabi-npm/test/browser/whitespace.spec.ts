import { expect, test } from '@playwright/test';

test('leading paragraph spaces stay visible after HTML and JSON reloads', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi;
    const loaded = nabi.setHtml('<p> abc</p><p><b><i> def</i></b></p><h2> ghi</h2><p>   jkl</p>');
    const savedJson = nabi.getJson();
    const savedHtml = nabi.getHtml();
    const jsonLoaded = nabi.setJson(savedJson);
    const jsonMatches = JSON.stringify(nabi.getJson()) === JSON.stringify(savedJson);
    const htmlLoaded = nabi.setHtml(savedHtml);
    const published = document.createElement('div');
    published.className = 'nabi-content';
    published.innerHTML = nabi.getHtml();
    document.body.append(published);
    const widths = (root: Element) =>
      [...root.querySelectorAll('p, h2')].map((paragraph) => {
        const text = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT).nextNode();
        if (!text) return 0;
        const range = document.createRange();
        range.setStart(text, 0);
        range.setEnd(text, 1);
        return range.getBoundingClientRect().width;
      });
    const editorWidths = widths(document.querySelector('#content')!);
    const publishedWidths = widths(published);
    const text = [...published.children].map((p) => p.textContent?.replace(/\u00a0/g, ' '));
    published.remove();
    return { loaded, jsonLoaded, jsonMatches, htmlLoaded, editorWidths, publishedWidths, text };
  });
  expect(result.loaded && result.jsonLoaded && result.jsonMatches && result.htmlLoaded).toBe(true);
  expect(result.text).toEqual([' abc', ' def', ' ghi', '   jkl']);
  expect(result.editorWidths).toHaveLength(4);
  expect(result.publishedWidths).toHaveLength(4);
  for (const width of [...result.editorWidths, ...result.publishedWidths]) expect(width).toBeGreaterThan(0);
});
