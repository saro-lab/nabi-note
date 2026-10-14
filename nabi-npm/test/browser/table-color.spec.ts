import { expect, test } from '@playwright/test';
import type { ElementNode, Nabi, Selection } from '../../src/index.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson([
      {
        w: 'p',
        ch: [
          {
            w: 'table',
            a: { sort: 1 },
            ch: [
              {
                w: 'tr',
                ch: [
                  { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Header'] }] },
                  { w: 'td', ch: [{ w: 'p', ch: ['Normal'] }] },
                ],
              },
            ],
          },
        ],
      },
      { w: 'p', ch: ['Outside'] },
    ]);
    document.querySelector<HTMLElement>('#content')!.focus();
    nabi.select({ anchor: { path: [0, 0, 0, 1, 0], offset: 0 }, focus: { path: [0, 0, 0, 1, 0], offset: 0 } });
  });
});

test('palette applies, preserves the range, distinguishes mixed values and clears', async ({ page }) => {
  const color = (value: string) => page.locator(`#context [data-name="cellColor:${value}"]`);
  await expect(color('')).toHaveAttribute('aria-pressed', 'true');
  await color('pink').click();
  await expect(page.locator('#content td')).toHaveAttribute('data-nabi-cell-color', 'pink');
  await expect(color('pink')).toHaveAttribute('aria-pressed', 'true');
  const selection: Selection = {
    anchor: { path: [0, 0, 0, 1, 0], offset: 0 },
    focus: { path: [0, 0, 0, 0, 0], offset: 0 },
  };
  await page.evaluate((selection) => (globalThis as unknown as { nabi: Nabi }).nabi.select(selection), selection);
  await expect(page.locator('#context [data-name^="cellColor:"][aria-pressed="true"]')).toHaveCount(0);
  await color('cyan').click();
  await expect(page.locator('#content [data-nabi-cell-color="cyan"]')).toHaveCount(2);
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection())).toEqual(selection);
  await expect(page.locator('#content [data-nabi-cell-selected]')).toHaveCount(2);
  await color('').click();
  await expect(page.locator('#content [data-nabi-cell-color]')).toHaveCount(0);
  await expect(color('')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo())).toBe(true);
  await expect(page.locator('#content [data-nabi-cell-color="cyan"]')).toHaveCount(2);
});

test('theme changes and selection keep pale cell backgrounds visible', async ({ page }) => {
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.select({ anchor: { path: [0, 0, 0, 0, 0], offset: 0 }, focus: { path: [0, 0, 0, 1, 0], offset: 0 } });
    nabi.applyCommand('setCellColor', { bg: 'yellow' });
  });
  for (const [theme, alpha] of [
    ['light', '0.14'],
    ['dark', '0.12'],
  ] as const) {
    await page.locator('#app').evaluate((root, theme) => root.setAttribute('data-nabi-theme', theme), theme);
    for (const cell of await page.locator('#content th, #content td').all()) {
      await expect(cell).toHaveCSS('background-color', `rgba(250, 204, 21, ${alpha})`);
      await expect(cell).toHaveCSS('outline-style', 'solid');
      await expect(cell).toHaveCSS('outline-width', '2px');
    }
  }
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.querySelector('#app')!.setAttribute('data-nabi-theme', 'light');
  });
  await expect(page.locator('#content td')).toHaveCSS('background-color', 'rgba(250, 204, 21, 0.14)');
  await page.locator('#context [data-name="cellColor:"]').click();
  const headerBackground = await page.locator('#content th').evaluate((cell) => getComputedStyle(cell).backgroundColor);
  expect(headerBackground).toMatch(/^rgba\(0, 0, 0, /);
  expect(Math.abs(Number(headerBackground.match(/[\d.]+(?=\))/)?.[0]) - 0.045)).toBeLessThanOrEqual(1 / 255);
  await expect(page.locator('#content td')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('object and cross-boundary selections hide the palette', async ({ page }) => {
  for (const selection of [
    { anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } },
    { anchor: { path: [1], offset: 1 }, focus: { path: [0, 0, 0, 1, 0], offset: 0 } },
  ]) {
    await page.evaluate((selection) => (globalThis as unknown as { nabi: Nabi }).nabi.select(selection), selection);
    await expect(page.locator('#context [data-name^="cellColor:"]')).toHaveCount(0);
  }
});

test.describe('narrow touch controls', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test('apply a color without losing the cell', async ({ page }) => {
    const color = page.locator('#context [data-name="cellColor:purple"]');
    await color.scrollIntoViewIfNeeded();
    await color.tap();
    await expect(page.locator('#content td')).toHaveAttribute('data-nabi-cell-color', 'purple');
    expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection().focus.path)).toEqual(
      [0, 0, 0, 1, 0],
    );
    const stored = (await page.evaluate(() =>
      (globalThis as unknown as { nabi: Nabi }).nabi.getJson(),
    )) as ElementNode[];
    expect(JSON.stringify(stored)).not.toContain('cellColor');
  });
});
