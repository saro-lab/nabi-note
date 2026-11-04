import { expect, test, type Locator } from '@playwright/test';
import type { ElementNode, Nabi } from '../../src/index.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const blocks: ElementNode[] = [
  { w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [p('cell')] }] }] },
  { w: 'details', ch: [{ w: 'summary', ch: ['Title'] }, p('Body')] },
  { w: 'hr', ch: [] },
];

async function trailingHeight(surface: Locator): Promise<number> {
  return surface.evaluate((root) => parseFloat(getComputedStyle(root, '::after').height) || 0);
}

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test('tapping below the last object creates one editable paragraph and undo restores the object', async ({ page }) => {
  await page.goto('/float.html');
  const surface = page.locator('#content');
  for (const block of blocks) {
    const start = [p('before'), { w: 'p', ch: [block] }];
    await page.evaluate((doc) => (window as unknown as { nabi: Nabi }).nabi.setJson(doc), start);
    await expect.poll(() => trailingHeight(surface)).toBeGreaterThanOrEqual(44);
    const state = () => page.evaluate(() => (window as unknown as { nabi: Nabi }).nabi.getJson());
    await expect(surface.locator(':scope > *')).toHaveCount(start.length);
    if (block.w === 'table') await surface.locator('td').tap();
    expect(await state()).toEqual(start);
    const last = surface.locator(':scope > [data-nabi-p]').last();
    await last.scrollIntoViewIfNeeded();
    const rect = (await last.boundingBox())!;
    await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height + 15);
    expect(await state()).toEqual([...start, p()]);
    await expect(surface).toBeFocused();
    expect(await trailingHeight(surface)).toBe(0);
    await page.keyboard.insertText('next');
    expect(await state()).toEqual([...start, p('next')]);
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Control+z');
    expect(await state()).toEqual(start);
  }
});

test('the background space follows the viewport breakpoint and only the final block', async ({ page }) => {
  await page.goto('/float.html');
  const surface = page.locator('#content');
  const doc = [p('first'), { w: 'p', ch: [{ w: 'hr', ch: [] }] }];
  await page.evaluate((doc) => (window as unknown as { nabi: Nabi }).nabi.setJson(doc), doc);
  await expect.poll(() => trailingHeight(surface)).toBeGreaterThanOrEqual(44);
  await page.locator('#app').evaluate((el) => el.style.setProperty('--nabi-mobile-breakpoint', '390px'));
  await expect.poll(() => trailingHeight(surface)).toBe(0);
  await page.locator('#app').evaluate((el) => el.style.setProperty('--nabi-mobile-breakpoint', '391px'));
  await expect.poll(() => trailingHeight(surface)).toBeGreaterThanOrEqual(44);
  await page.evaluate((doc) => (window as unknown as { nabi: Nabi }).nabi.setJson(doc), [...doc, p('last')]);
  expect(await trailingHeight(surface)).toBe(0);
});
