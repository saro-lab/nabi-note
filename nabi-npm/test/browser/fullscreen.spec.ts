import { expect, test } from '@playwright/test';

test('fullscreen keeps the paper width, fills the viewport, and restores layout on exit', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const root = page.locator('#app2');
  const surface = page.locator('#content2');
  const button = root.locator('[data-name="fullscreen"]');
  const before = (await surface.boundingBox())!;
  await button.click();
  await expect(root).toHaveClass(/is-fullscreen/);
  const paper = (await surface.boundingBox())!;
  expect(paper.width).toBeCloseTo(before.width, 1);
  expect(paper.x).toBeCloseTo((1280 - paper.width) / 2, 1);
  expect(paper.y + paper.height).toBeCloseTo(800, 1);
  await expect(surface).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(await root.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgb(255, 255, 255)');

  await page.setViewportSize({ width: 480, height: 800 });
  await expect(surface).toHaveCSS('width', '480px');
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(surface).toHaveCSS('width', `${before.width}px`);
  await surface.press('Escape');
  await expect(root).not.toHaveClass(/is-fullscreen/);
  await expect(surface).not.toHaveClass(/nabi-fullscreen-content/);
  await expect(surface).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect((await surface.boundingBox())!.height).toBeCloseTo(before.height, 1);
  expect(await surface.evaluate((el) => el.style.getPropertyValue('--nabi-fullscreen-content-width'))).toBe('');

  await page.setViewportSize({ width: 900, height: 800 });
  const resized = (await surface.boundingBox())!;
  await button.click();
  expect((await surface.boundingBox())!.width).toBeCloseTo(resized.width, 1);
});

test('fullscreen backgrounds inherit overrides and long paper scrolls in both themes', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('#app');
  const surface = page.locator('#content');
  await root.locator('[data-name="fullscreen"]').click();
  expect((await surface.boundingBox())!.height).toBeGreaterThan(800);
  await root.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(await root.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await expect(surface).toHaveCSS('background-color', 'rgb(22, 22, 26)');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--nabi-fullscreen-bg', '#ccddee');
    document.documentElement.style.setProperty('--nabi-fullscreen-content-bg', '#fff8ee');
  });
  await expect(root).toHaveCSS('background-color', 'rgb(204, 221, 238)');
  await expect(surface).toHaveCSS('background-color', 'rgb(255, 248, 238)');
  await root.evaluate((el) => {
    el.style.setProperty('--nabi-fullscreen-bg', '#334455');
    el.style.setProperty('--nabi-fullscreen-content-bg', '#222222');
  });
  await expect(root).toHaveCSS('background-color', 'rgb(51, 68, 85)');
  await expect(surface).toHaveCSS('background-color', 'rgb(34, 34, 34)');
});
