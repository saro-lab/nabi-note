import { expect, test } from '@playwright/test';

for (const format of ['custom', 'html', 'plain']) {
  for (const sample of [
    { text: ' abc', start: 0, end: 4 },
    { text: '   abc', start: 1, end: 6 },
    { text: ' abc', start: 0, end: 1 },
    { text: '   abc', start: 1, end: 2 },
    { text: 'abc   def', start: 0, end: 5 },
  ]) {
    test(`copy and paste preserves spaces via ${format}: ${JSON.stringify(sample)}`, async ({ page }) => {
      await page.goto('/');
      const result = await page.evaluate(
        ({ format, sample }) => {
          const nabi = (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi;
          nabi.setJson([{ w: 'p', ch: [sample.text] }]);
          const root = document.querySelector<HTMLElement>('#content')!;
          const text = root.querySelector('p')!.firstChild!;
          const range = document.createRange();
          range.setStart(text, sample.start);
          range.setEnd(text, sample.end);
          const selection = document.getSelection()!;
          selection.removeAllRanges();
          selection.addRange(range);
          const copied = new DataTransfer();
          root.dispatchEvent(new ClipboardEvent('copy', { clipboardData: copied, bubbles: true, cancelable: true }));
          const transfer = new DataTransfer();
          const types = format === 'custom' ? [...copied.types] : [format === 'html' ? 'text/html' : 'text/plain'];
          for (const type of types) transfer.setData(type, copied.getData(type));
          nabi.setJson([{ w: 'p', ch: [] }]);
          root.focus();
          nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
          root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
          return {
            html: copied.getData('text/html'),
            plain: copied.getData('text/plain'),
            text: root.textContent?.replace(/\u00a0/g, ' '),
          };
        },
        { format, sample },
      );
      expect(result.text, JSON.stringify(result)).toBe(sample.text.slice(sample.start, sample.end));
    });
  }
}

test('typed leading spaces survive HTML clipboard, storage, and preview', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi.setJson([{ w: 'p', ch: [] }]);
  });
  const surface = page.locator('#content');
  await surface.click();
  await page.keyboard.type(' abc');
  await page.keyboard.press('Enter');
  await page.keyboard.type('   def');
  const copied = await surface.evaluate((root) => {
    const range = document.createRange();
    range.selectNodeContents(root);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const data = new DataTransfer();
    root.dispatchEvent(new ClipboardEvent('copy', { clipboardData: data, bubbles: true, cancelable: true }));
    return data.getData('text/html');
  });
  const expected = [' abc', '   def'];
  const readParagraphs = () =>
    surface.locator('p').evaluateAll((nodes) => nodes.map((node) => node.textContent!.replace(/\u00a0/g, ' ')));
  expect(await readParagraphs()).toEqual(expected);
  await surface.evaluate((root, html) => {
    const nabi = (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi;
    nabi.setJson([{ w: 'p', ch: [] }]);
    (root as HTMLElement).focus();
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
    const data = new DataTransfer();
    data.setData('text/html', html);
    root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    const saved = nabi.getJson();
    nabi.setJson(saved);
    nabi.setHtml(nabi.getHtml());
  }, copied);
  expect(await readParagraphs()).toEqual(expected);
  await page.locator('#app [data-name="preview"]').click();
  const preview = page.locator('.nabi-preview-body');
  await expect(preview).toBeVisible();
  expect(
    await preview.locator('p').evaluateAll((nodes) => nodes.map((node) => node.textContent!.replace(/\u00a0/g, ' '))),
  ).toEqual(expected);
  const widths = await preview.locator('p').evaluateAll((nodes) =>
    nodes.map((node) => {
      const range = document.createRange();
      range.setStart(node.firstChild!, 0);
      range.setEnd(node.firstChild!, 1);
      return range.getBoundingClientRect().width;
    }),
  );
  for (const width of widths) expect(width).toBeGreaterThan(0);
});

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
