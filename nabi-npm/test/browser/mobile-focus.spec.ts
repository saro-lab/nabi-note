import { expect, test, type Page } from '@playwright/test';
import type { Nabi, Settle, Sticky } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

interface BrowserState {
  readonly nabi: Nabi;
  readonly sticky: Sticky;
  readonly settle: Settle;
  readonly viewport: EventTarget & {
    height: number;
    width: number;
    offsetTop: number;
    offsetLeft: number;
    scale: number;
  };
}

async function setup(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/mobile-focus.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><rect width="256" height="128" fill="skyblue"/></svg>',
    }),
  );
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    document.documentElement.style.fontSize = '16px';
    document.body.style.cssText = 'margin:0;padding:200px 0 0;';
    document.body.innerHTML =
      '<div id="mobile-editor" class="nabi"><div id="mobile-chrome" class="nabi-toolbar"><div id="mobile-toolbar"></div><div id="mobile-context"></div></div><div id="mobile-surface" class="nabi-content"></div></div>';
    const viewport = Object.assign(new EventTarget(), {
      height: 844,
      width: 390,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
      pageTop: 0,
      pageLeft: 0,
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      doc: [
        { w: 'p', ch: [''] },
        { w: 'img', a: { src: '/mobile-focus.svg', alt: 'sample' } },
        ...Array.from({ length: 60 }, (_, index) => ({
          w: 'p',
          ch: [`Paragraph ${index}: A long document keeps the tapped line in place when the keyboard opens.`],
        })),
      ],
    });
    api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
    const root = document.getElementById('mobile-editor')!;
    const surface = document.getElementById('mobile-surface')!;
    const chrome = document.getElementById('mobile-chrome')!;
    api.mountSurface({ nabi, registry, root: surface });
    const settle = api.watchSettle(document, { surface });
    api.mountToolbar({ nabi, registry, root: document.getElementById('mobile-toolbar')!, surface, settle });
    api.mountContextToolbar({ nabi, registry, root: document.getElementById('mobile-context')!, surface });
    const sticky = api.mountSticky({ nabi, root, surface, chrome, settle, iosBranch: false });
    (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest = { nabi, sticky, settle, viewport };
    await surface.querySelector('img')!.decode();
  }, entry);
}

test.describe('mobile long document focus', () => {
  test.use({ hasTouch: true });

  test('a small viewport resize after tapping does not move a visible caret', async ({ page }) => {
    await setup(page);
    const target = page.locator('#mobile-surface > p').filter({ hasText: 'Paragraph 35:' });
    await target.evaluate((el) => {
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 600);
    });
    await target.tap({ position: { x: 75, y: 14 } });
    const before = await page.evaluate(() => window.scrollY);
    await page.evaluate(async () => {
      const { viewport } = (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest;
      viewport.height = 804;
      viewport.dispatchEvent(new Event('resize'));
      await new Promise((resolve) => window.setTimeout(resolve, 450));
    });
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
  });

  for (const offset of [0, 200]) {
    test(`keyboard opening with viewport offset ${offset} keeps an already visible caret in place`, async ({
      page,
    }) => {
      await setup(page);
      const target = page.locator('#mobile-surface > p').filter({ hasText: 'Paragraph 35:' });
      await target.evaluate((el) => {
        window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 350);
      });
      await target.tap({ position: { x: 75, y: 14 } });
      const before = await page.evaluate(() => window.scrollY);
      await page.evaluate(async (offset) => {
        const { viewport } = (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest;
        viewport.offsetTop = offset;
        viewport.height = 444;
        viewport.dispatchEvent(new Event('resize'));
        await new Promise((resolve) => window.setTimeout(resolve, 450));
      }, offset);
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest.nabi.getSelection().focus
                .path,
          ),
        )
        .toEqual([37]);
    });
  }

  test('a text tap keeps the selected paragraph through keyboard opening', async ({ page }) => {
    await setup(page);
    const target = page.locator('#mobile-surface > p').filter({ hasText: 'Paragraph 35:' });
    await target.evaluate((el) => {
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 600);
    });
    const before = await page.evaluate(() => window.scrollY);
    await target.tap({ position: { x: 75, y: 14 } });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest.nabi.getSelection().focus.path,
        ),
      )
      .toEqual([37]);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
    await page.evaluate(() => {
      const { viewport } = (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest;
      viewport.height = 444;
      viewport.dispatchEvent(new Event('resize'));
    });
    await expect.poll(async () => (await target.boundingBox())!.y).toBeLessThan(440);
    await expect.poll(async () => (await target.boundingBox())!.y).toBeGreaterThanOrEqual(48);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (globalThis as unknown as { mobileFocusTest: BrowserState }).mobileFocusTest.nabi.getSelection().focus.path,
        ),
      )
      .toEqual([37]);
  });
});
