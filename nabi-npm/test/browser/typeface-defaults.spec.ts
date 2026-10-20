import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.body.style.fontFamily = 'serif';
    document.querySelector<HTMLElement>('#app')!.style.setProperty('--nabi-font', 'Arial, sans-serif');
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson([
      { w: 'p', ch: ['Outside'] },
      {
        w: 'p',
        ch: [
          {
            w: 'table',
            ch: [
              {
                w: 'tr',
                ch: [
                  { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Header'] }] },
                  { w: 'td', ch: [{ w: 'p', ch: ['Cell'] }] },
                ],
              },
            ],
          },
        ],
      },
    ]);
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  });
});

for (const base of ['serif', 'monospace', 'cursive']) {
  test(`${base} body keeps UI and unmarked table cells sans`, async ({ page }) => {
    await page.locator('#app').evaluate((root, base) => {
      (root as HTMLElement).style.setProperty('--nabi-typeface-base', base);
    }, base);
    await expect(page.locator('#content > p').first()).toHaveCSS('font-family', base);
    for (const selector of ['#toolbar', '#context', '#content th p', '#content td p']) {
      await expect(page.locator(selector)).toHaveCSS('font-family', 'Arial, sans-serif');
    }
    await page.locator('#toolbar [data-name="b"]').hover();
    await expect(page.locator('body > .nabi-tooltip')).toHaveCSS('font-family', 'Arial, sans-serif');
    await page.locator('#toolbar [data-name="img"]').click();
    await expect(page.locator('.nabi-panel .nabi-input')).toHaveCSS('font-family', 'Arial, sans-serif');
    await expect(page.locator('.nabi-panel .nabi-go')).toHaveCSS('font-family', 'Arial, sans-serif');
  });
}

test('explicit cell typeface survives HTML round trips and clearing returns to sans', async ({ page }) => {
  await page.locator('#app').evaluate((root) => {
    (root as HTMLElement).style.setProperty('--nabi-typeface-base', 'cursive');
  });
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const pos = { path: [1, 0, 0, 1, 0], offset: 0 };
    nabi.select({ anchor: pos, focus: pos });
    nabi.applyCommand('setTypeface', { v: 'serif' });
    const reader = document.createElement('article');
    reader.id = 'typeface-reader';
    reader.className = 'nabi-content';
    reader.style.cssText = 'font-family:cursive;--nabi-font:Arial,sans-serif';
    reader.innerHTML = nabi.getHtml();
    document.body.append(reader);
    nabi.setHtml(nabi.getHtml());
  });
  for (const root of ['#content', '#typeface-reader']) {
    await expect(page.locator(`${root} th p`)).toHaveCSS('font-family', 'Arial, sans-serif');
    await expect(page.locator(`${root} td [data-nabi-typeface="serif"]`)).toHaveCSS('font-family', /Georgia/);
  }
  await page.locator('#content td [data-nabi-typeface="serif"]').click();
  await page.locator('#context [data-wing="tf"] [data-value="serif"]').hover();
  await expect(page.locator('body > .nabi-tooltip')).toHaveCSS('font-family', 'Arial, sans-serif');
  await page.locator('#context [data-wing="tf"] [data-value="serif"]').click();
  await expect(page.locator('#content td [data-nabi-typeface]')).toHaveCount(0);
  await expect(page.locator('#content td p')).toHaveCSS('font-family', 'Arial, sans-serif');
});

test.describe('mobile panels', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('inline prompts and modal table picker keep sans over a serif host', async ({ page }) => {
    await page.locator('#app').evaluate((root) => {
      (root as HTMLElement).style.setProperty('--nabi-typeface-base', 'serif');
    });
    await page.locator('#toolbar [data-name="tools"]').tap();
    await page.locator('.nabi-toolbox-icons [data-name="img"]').tap();
    await expect(page.locator('.nabi-prompt .nabi-input')).toHaveCSS('font-family', 'Arial, sans-serif');
    await page.keyboard.press('Escape');
    await page.locator('#toolbar [data-name="tools"]').tap();
    await page.locator('.nabi-toolbox-icons [data-name="table"]').tap();
    await expect(page.locator('.nabi-scrim .nabi-readout')).toBeVisible();
    await expect(page.locator('.nabi-scrim .nabi-readout')).toHaveCSS('font-family', /sans-serif/);
  });
});
