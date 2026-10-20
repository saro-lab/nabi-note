import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

test('full width fills the container, preserves alignment, and can be undone', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson([{ w: 'p', ch: [] }]);
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
    nabi.applyCommand('insertTable', { rows: 2, cols: 2 });
  });
  const table = page.locator('#content table');
  const toggle = page.locator('#context [data-name="fullWidth"]');
  const widths = () =>
    table.evaluate((table) => ({
      table: table.getBoundingClientRect().width,
      scroll: table.parentElement!.getBoundingClientRect().width,
      wrapper: table.parentElement!.parentElement!.getBoundingClientRect().width,
    }));
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  const initial = await widths();
  expect(initial.table).toBeLessThan(initial.wrapper - 10);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(table).toHaveCSS('min-width', '100%');
  for (const value of ['l', 'c', 'r']) {
    await page.evaluate((value) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } });
      nabi.applyCommand('setAlign', { value });
    }, value);
    const wide = await widths();
    expect(Math.abs(wide.table - wide.wrapper)).toBeLessThanOrEqual(1);
    expect(Math.abs(wide.scroll - wide.wrapper)).toBeLessThanOrEqual(1);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const narrow = await widths();
  expect(Math.abs(narrow.table - narrow.wrapper)).toBeLessThanOrEqual(1);
  await toggle.click();
  await expect(table).not.toHaveAttribute('data-nabi-table-full');
  expect((await widths()).table).toBeLessThan((await widths()).wrapper - 10);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  await expect(table).toHaveAttribute('data-nabi-table-full', '');
  expect(Math.abs((await widths()).table - (await widths()).wrapper)).toBeLessThanOrEqual(1);
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const published = document.createElement('div');
    published.id = 'published';
    published.className = 'nabi-content';
    published.style.width = '300px';
    published.innerHTML = nabi.getHtml();
    document.body.append(published);
  });
  const published = page.locator('#published table');
  expect((await published.boundingBox())!.width).toBeCloseTo(300, 0);
  await published
    .locator('th')
    .first()
    .evaluate((cell) => {
      cell.textContent = 'x'.repeat(200);
    });
  const overflow = await published.evaluate((table) => ({
    table: table.getBoundingClientRect().width,
    scroll: table.parentElement!.clientWidth,
    overflow: getComputedStyle(table.parentElement!).overflowX,
  }));
  expect(overflow.table).toBeGreaterThan(overflow.scroll);
  expect(overflow.scroll).toBe(300);
  expect(overflow.overflow).toBe('auto');
});
