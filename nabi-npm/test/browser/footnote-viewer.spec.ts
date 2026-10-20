import { expect, test } from '@playwright/test';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

for (const width of [1280, 390]) {
  test.describe(`footnote viewer at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });

    test('bubble numbers navigate to endnotes and keyboard dismissal restores the marker', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(async (entry) => {
        const api = await import(/* @vite-ignore */ entry);
        const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
        const { nabi } = api.createNabiWith(api.defaultWings, {
          doc: [
            { w: 'p', ch: ['Body', { w: 'fn', a: { t: 'First <note>' }, ch: [] }] },
            { w: 'p', ch: ['More', { w: 'fn', a: { t: 'Second note' }, ch: [] }] },
          ],
        });
        document.body.innerHTML = '<article id="notes" class="nabi-content"></article>';
        const root = document.getElementById('notes')!;
        root.innerHTML = nabi.getHtml();
        root.querySelector('section')!.style.marginTop = '1200px';
        viewer.attachViewer(root);
      }, entry);
      const marker = page.locator('#notes sup').nth(1);
      await marker.focus();
      await expect(page.locator('.nabi-fn-tip')).toHaveText('[2] Second note');
      await page.keyboard.press('Tab');
      await expect(page.locator('.nabi-fn-tip button')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.nabi-fn-tip')).toHaveCount(0);
      await expect(marker).toBeFocused();
      if (width === 390) await marker.tap();
      else await marker.click();
      const number = page.locator('.nabi-fn-tip button');
      if (width === 390) await number.tap();
      else await number.click();
      const endnote = page.locator('#notes [data-nabi-fn-n="2"]');
      await expect(endnote).toBeFocused();
      await expect(endnote).toBeInViewport();
      await expect(page.locator('.nabi-fn-tip')).toHaveCount(0);
    });
  });
}
