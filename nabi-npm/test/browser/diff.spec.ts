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

test('previous content applies by logical line and keeps keyboard focus on the next action', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const diff = await import(/* @vite-ignore */ entry.replace('/index.ts', '/diff/index.ts'));
    const registry = api.makeRegistry(api.defaultWings);
    const br = { w: 'br', ch: [] };
    const before = [{ w: 'p', ch: ['Old first', br, 'Unchanged middle', br, 'Old last'] }];
    const after = [{ w: 'p', ch: ['New first', br, 'Unchanged middle', br, 'New last'] }];
    const root = document.createElement('div');
    root.id = 'merge-test';
    document.body.prepend(root);
    const mounted = diff.mountDiff({
      root,
      registry,
      before,
      after,
      locale: 'en',
      onMerge(proposal: { before: unknown; result: unknown; revision: number }) {
        if (mounted.update(proposal.before, proposal.result, proposal.revision)) {
          root.dataset['result'] = JSON.stringify(proposal.result);
        }
      },
    });
  }, entry);

  const root = page.locator('#merge-test');
  const buttons = root.locator('.nabi-diff-merge-action');
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toBeVisible();
  await expect(buttons.nth(1)).toBeVisible();
  const first = await buttons.nth(0).boundingBox();
  const last = await buttons.nth(1).boundingBox();
  expect(last!.y).toBeGreaterThan(first!.y + 20);
  await buttons.nth(0).focus();
  await page.keyboard.press('Enter');
  await expect(buttons).toHaveCount(1);
  await expect(buttons.first()).toBeFocused();
  await expect(root.locator('.nabi-diff-after')).toContainText('Old first');
  await expect(root.locator('.nabi-diff-after')).toContainText('New last');
  await page.keyboard.press('Enter');
  await expect(buttons).toHaveCount(0);
  await expect(root).toBeFocused();
  const result = await root.getAttribute('data-result');
  expect(result).toContain('Old last');
  expect(result).not.toContain('nabi-diff');
});
