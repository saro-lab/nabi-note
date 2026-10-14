import { expect, test } from '@playwright/test';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

test('folding hides unchanged floats and attachments; zero changes shows the whole document', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const diff = await import(/* @vite-ignore */ entry.replace('/index.ts', '/diff/index.ts'));
    const registry = api.makeRegistry(api.defaultWings);
    api.injectSheets(document, api.collectSheets(registry));
    const paragraph = (text: string) => ({ w: 'p', ch: [text] });
    const float = (side: string, text: string) => ({
      w: 'p',
      ch: [{ w: 'float', a: { side, w: 40 }, ch: [paragraph(text)] }],
    });
    const before = [
      float('left', 'Float at the gap marker'),
      float('right', 'Float in the hidden region'),
      {
        w: 'p',
        ch: [{ w: 'a', a: { href: 'https://example.com/file.pdf', file: 'pdf' }, ch: ['Attachment'] }],
      },
      paragraph('Unchanged lead'),
      paragraph('Context before'),
      paragraph('Original paragraph'),
      paragraph('Context after'),
      paragraph('Unchanged tail'),
    ];
    const after = before.map((block, index) => (index === 5 ? paragraph('Original paragraph updated') : block));
    const root = document.createElement('div');
    root.id = 'fold-test';
    document.body.prepend(root);
    const mounted = diff.mountDiff({ root, registry, before, after });
    const unchanged = document.createElement('button');
    unchanged.id = 'compare-unchanged';
    unchanged.textContent = 'Compare unchanged';
    unchanged.addEventListener('click', () => mounted.update(before, before));
    root.after(unchanged);
  }, entry);

  const root = page.locator('#fold-test');
  const toggle = root.locator('[aria-pressed]');
  const pane = root.locator('.nabi-diff-after');
  const floats = pane.locator('[data-nabi-float]');
  const attachment = pane.locator('a[data-nabi-file]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(floats).toHaveCount(2);
  await expect(floats.nth(0)).toBeHidden();
  await expect(floats.nth(1)).toBeHidden();
  await expect(pane.locator('.nabi-diff-gap').first()).toBeVisible();
  await expect(pane.locator('.nabi-diff-cut').first()).toHaveCSS('display', 'none');
  await expect(attachment).toBeHidden();
  await expect(pane.getByText('Original paragraph updated', { exact: true })).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(floats.nth(0)).toBeVisible();
  await expect(floats.nth(1)).toBeVisible();
  await expect(attachment).toBeVisible();
  await toggle.click();
  await expect(floats.nth(0)).toBeHidden();
  await expect(floats.nth(1)).toBeHidden();
  await expect(attachment).toBeHidden();

  await page.locator('#compare-unchanged').click();
  await expect(root.locator('.nabi-diff-count')).toHaveText('0 / 0');
  await expect(toggle).toBeDisabled();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(floats.nth(0)).toBeVisible();
  await expect(floats.nth(1)).toBeVisible();
  await expect(attachment).toBeVisible();
  await expect(pane.getByText('Unchanged lead', { exact: true })).toBeVisible();
  await expect(pane.getByText('Unchanged tail', { exact: true })).toBeVisible();
});
