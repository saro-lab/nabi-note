import { expect, test } from '@playwright/test';

test('real DOM sinks reject active HTML in every browser engine', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const state = globalThis as typeof globalThis & {
      __nabiSentinel?: number;
      nabi: { setHtml(html: string): void };
    };
    state.__nabiSentinel = 0;
    state.nabi.setHtml(`
      <script>globalThis.__nabiSentinel += 1</script>
      <style>body{display:none}</style>
      <svg onload="globalThis.__nabiSentinel += 1"><foreignObject><script>globalThis.__nabiSentinel += 1</script></foreignObject></svg>
      <math><annotation-xml encoding="text/html"><script>globalThis.__nabiSentinel += 1</script></annotation-xml></math>
      <object data="javascript:globalThis.__nabiSentinel += 1"></object>
      <iframe srcdoc="<script>parent.__nabiSentinel += 1</script>"></iframe>
      <p onclick="globalThis.__nabiSentinel += 1"><a href="javascript:globalThis.__nabiSentinel += 1">safe text</a></p>
      <p><img src="javascript:globalThis.__nabiSentinel += 1" onerror="globalThis.__nabiSentinel += 1"></p>
    `);
  });

  await page.waitForTimeout(50);
  expect(
    await page.evaluate(() => (globalThis as typeof globalThis & { __nabiSentinel?: number }).__nabiSentinel),
  ).toBe(0);
  await expect(
    page.locator('#content script, #content style, #content svg, #content math, #content object, #content iframe'),
  ).toHaveCount(0);
  await expect(
    page.locator(
      '#content [onclick], #content [onerror], #content [href^="javascript:"], #content [src^="javascript:"]',
    ),
  ).toHaveCount(0);
  await expect(page.locator('#content')).toContainText('safe text');
});
