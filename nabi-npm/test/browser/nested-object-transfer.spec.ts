import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const image = {
  w: 'p',
  a: { a: 'r' },
  ch: [{ w: 'img', a: { src: '/transfer-image.svg', w: '40' }, ch: [] }],
};
const p = (text = '') => ({ w: 'p', ch: text ? [text] : [] });
const cellAttrs = { th: 1, bg: 'yellow', colspan: '2', rowspan: '2' };
const makeDoc = (source: unknown[], target: unknown[]) => [
  {
    w: 'p',
    ch: [
      {
        w: 'float',
        a: { side: 'left', w: 50 },
        ch: [
          {
            w: 'p',
            ch: [
              {
                w: 'table',
                ch: [
                  {
                    w: 'tr',
                    ch: [
                      { w: 'td', ch: source },
                      { w: 'td', a: cellAttrs, ch: target },
                    ],
                  },
                  { w: 'tr', ch: [{ w: 'td', ch: [p('neighbor')] }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  p('outside'),
];
const initial = makeDoc([image], [p()]);
const targetPath = [0, 0, 0, 0, 0, 1, 0];

test.beforeEach(async ({ page }) => {
  await page.route('**/transfer-image.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="teal"/></svg>',
    }),
  );
  await page.goto('/');
  await page.evaluate((doc) => {
    (globalThis as unknown as { nabi: Nabi }).nabi.setJson(doc);
  }, initial);
  await expect(page.locator('#content img')).toBeVisible();
});

for (const action of ['copy', 'cut']) {
  for (const format of ['custom', 'html']) {
    test(`${action} selected nested image via ${format} pastes only that image into an empty cell`, async ({
      page,
    }) => {
      await page.locator('#content img').click();
      const result = await page.evaluate(
        ({ action, format, targetPath }) => {
          const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
          const root = document.getElementById('content')!;
          const data = new DataTransfer();
          root.dispatchEvent(new ClipboardEvent(action, { clipboardData: data, bubbles: true, cancelable: true }));
          const afterCopy = nabi.getJson();
          const custom = JSON.parse(data.getData('application/vnd.nabi.tree+json'));
          const html = data.getData('text/html');
          const transfer = new DataTransfer();
          const type = format === 'custom' ? 'application/vnd.nabi.tree+json' : 'text/html';
          transfer.setData(type, data.getData(type));
          nabi.select({ anchor: { path: targetPath, offset: 0 }, focus: { path: targetPath, offset: 0 } });
          root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
          const pasted = nabi.getJson();
          const undone = nabi.undo();
          const restored = nabi.getJson();
          if (action === 'cut') nabi.undo();
          return { custom, html, afterCopy, pasted, undone, restored, original: nabi.getJson() };
        },
        { action, format, targetPath },
      );
      expect(result.custom.body).toEqual([image]);
      expect(result.html).toContain('<img');
      expect(result.html).not.toMatch(/<table|<td|<th|data-nabi-float/);
      const source = action === 'cut' ? [p()] : [image];
      expect(result.afterCopy).toEqual(makeDoc(source, [p()]));
      expect(result.pasted).toEqual(makeDoc(source, [image]));
      expect(result.undone).toBe(true);
      expect(result.restored).toEqual(result.afterCopy);
      expect(result.original).toEqual(initial);
    });
  }
}

for (const after of [false, true]) {
  test(`native image drop ${after ? 'below' : 'above'} the empty cell replaces its placeholder`, async ({ page }) => {
    const result = await page.evaluate((after) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      const source = document.querySelector<HTMLImageElement>('#content img')!;
      const target = document.querySelector<HTMLElement>('#content th > p')!;
      const dataTransfer = new DataTransfer();
      const options = { dataTransfer, bubbles: true, cancelable: true };
      source.dispatchEvent(new DragEvent('dragstart', options));
      const rect = target.getBoundingClientRect();
      const position = { clientX: rect.left + 8, clientY: after ? rect.bottom - 2 : rect.top + 2 };
      target.dispatchEvent(new DragEvent('dragover', { ...options, ...position }));
      target.dispatchEvent(new DragEvent('drop', { ...options, ...position }));
      source.dispatchEvent(new DragEvent('dragend', options));
      const moved = nabi.getJson();
      const selection = nabi.getSelection();
      const undone = nabi.undo();
      return { moved, selection, undone, restored: nabi.getJson() };
    }, after);
    expect(result.moved).toEqual(makeDoc([p()], [image]));
    expect(result.selection).toEqual({
      anchor: { path: targetPath, offset: 0 },
      focus: { path: targetPath, offset: 1 },
    });
    expect(result.undone).toBe(true);
    expect(result.restored).toEqual(initial);
  });
}
