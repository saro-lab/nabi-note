import { expect, test } from '@playwright/test';

const href = 'https://nabi.saro.me/en/';

for (const deletion of ['Backspace', 'Delete']) {
  test(`typing at a renamed link boundary stays plain after ${deletion}`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const nabi = (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi;
      nabi.setJson([{ w: 'p', ch: [] }]);
      document.querySelector<HTMLElement>('#content')!.focus();
    });
    await page.keyboard.type(href);
    await page.keyboard.press('Enter');
    const name = page.locator('#app input[data-name="text"]');
    await name.fill('Nabi');
    await name.press('Enter');
    await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>('#content')!;
      root.focus();
      const text = root.querySelector('a')!.firstChild!;
      document.getSelection()!.collapse(text, text.textContent!.length);
    });
    await page.keyboard.press('Escape');
    await page.keyboard.type(' other');
    expect(
      await page.evaluate(() => (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi.getJson()),
    ).toEqual([{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['Nabi'] }, ' other'] }]);
    await page.evaluate((deletion) => {
      const nabi = (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi;
      const point = { path: [0], offset: deletion === 'Backspace' ? 5 : 4 };
      nabi.select({ anchor: point, focus: point });
    }, deletion);
    await page.keyboard.press(deletion);
    await page.keyboard.press('Backspace');
    await page.keyboard.type('X');
    const expected = [{ w: 'p', ch: [{ w: 'a', a: { href }, ch: ['Nab'] }, 'Xother'] }];
    expect(
      await page.evaluate(() => (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi.getJson()),
    ).toEqual(expected);
    await expect(page.locator('#content a')).toHaveText('Nab');
    await page.keyboard.press('Delete');
    await expect(page.locator('#content a')).toHaveText('Nab');
    await expect(page.locator('#content p')).toHaveText('NabXther');
    await page.evaluate(() => (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi.undo());
    expect(
      await page.evaluate(() => (globalThis as unknown as { nabi: import('../../src/index.js').Nabi }).nabi.getJson()),
    ).toEqual(expected);
  });
}
