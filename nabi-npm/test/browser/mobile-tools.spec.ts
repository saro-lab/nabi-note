import { expect, test, type Page } from '@playwright/test';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

test.use({ hasTouch: true });

async function setup(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    document.documentElement.style.cssText = 'font-size:16px;scroll-padding-top:120px';
    document.body.style.cssText = 'margin:0;padding:0';
    document.body.innerHTML =
      '<div class="nabi" id="app"><div class="nabi-toolbar" id="chrome"><div id="toolbar"></div></div><div class="nabi-content" id="surface"></div></div>';
    const root = document.getElementById('app')!;
    const chrome = document.getElementById('chrome')!;
    const surface = document.getElementById('surface')!;
    const toolbar = document.getElementById('toolbar')!;
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      doc: Array.from({ length: 80 }, (_, index) => ({ w: 'p', ch: [`paragraph ${index}`] })),
    });
    api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
    api.mountSurface({ nabi, registry, root: surface });
    api.mountToolbar({ nabi, registry, root: toolbar, surface });
    api.mountSticky({ nabi, root, chrome, surface });
    surface.focus({ preventScroll: true });
    window.dispatchEvent(new PointerEvent('pointerdown'));
    window.scrollTo(0, 1600);
  }, entry);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1600);
  await expect.poll(() => page.locator('#chrome').evaluate((el) => el.getBoundingClientRect().y)).toBe(0);
}

test('opening mobile tools preserves page scroll with host scroll padding', async ({ page }) => {
  await setup(page);
  const trigger = (await page.locator('#toolbar [data-name="tools"]').boundingBox())!;
  await page.touchscreen.tap(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
  await expect(page.locator('.nabi-toolbox')).toBeVisible();
  await expect(page.locator('.nabi-toolbox button').first()).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(1600);
});

test('palette arrow navigation reveals its rows without scrolling the page', async ({ page }) => {
  await setup(page);
  const trigger = (await page.locator('#toolbar [data-name="tools"]').boundingBox())!;
  await page.touchscreen.tap(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
  const palette = page.locator('.nabi-toolbox-body');
  await palette.evaluate((el) => (el.style.maxHeight = '88px'));
  await page.keyboard.press('ArrowLeft');
  const last = palette.locator('button:visible').last();
  await expect(last).toBeFocused();
  const bounds = (await palette.boundingBox())!;
  const button = (await last.boundingBox())!;
  expect(button.y).toBeGreaterThanOrEqual(bounds.y);
  expect(button.y + button.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
  expect(await palette.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(1600);
});
