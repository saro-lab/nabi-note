import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const nabi = (globalThis as unknown as { previewLinkTest: Nabi }).previewLinkTest;
    return { url: location.href, doc: nabi.getJson(), html: nabi.getHtml(), selection: nabi.getSelection() };
  });
}

for (const mode of ['document', 'history']) {
  test(`${mode} preview links open new pages without navigating or changing the editor`, async ({ page, context }) => {
    await page.goto('/');
    const destinations = [new URL('/preview-target', page.url()).href, 'https://example.com/preview-target'];
    for (const href of destinations) {
      await context.route(href, (route) =>
        route.fulfill({ contentType: 'text/html', body: '<title>Preview destination</title>' }),
      );
    }
    await page.evaluate(
      async ({ entry, mode, destinations }) => {
        const api = await import(/* @vite-ignore */ entry);
        document.body.innerHTML = '<div class="nabi"><div id="link-surface" class="nabi-content"></div></div>';
        const { nabi, registry } = api.createNabiWith(api.defaultWings, {
          allowLocalUrls: true,
          doc: destinations.map((href, index) => ({
            w: 'p',
            ch: [{ w: 'a', a: { href }, ch: [index === 0 ? 'Internal link' : 'External link'] }],
          })),
        });
        const surface = document.getElementById('link-surface')!;
        api.mountSurface({ nabi, registry, root: surface, allowLocalUrls: true });
        (globalThis as unknown as { previewLinkTest: Nabi }).previewLinkTest = nabi;
        if (mode === 'document') {
          api.openPreview({ nabi, surface });
          return;
        }
        const entries = new Map<string, string>();
        const history = api.mountLocalHistory({
          nabi,
          storage: {
            getItem: (key: string) => entries.get(key) ?? null,
            setItem: (key: string, value: string) => entries.set(key, value),
            removeItem: (key: string) => entries.delete(key),
          },
        });
        history.snapshot();
        history.unmount();
        api.openHistoryPanel({
          history,
          surface,
          render: (record: { body: string }) =>
            api.renderStoredHtml(JSON.parse(record.body), registry, { allowLocalUrls: true }) ?? '',
        });
      },
      { entry, mode, destinations },
    );
    if (mode === 'history') await page.locator('.nabi-history-tool').first().click();
    const preview = page.locator(mode === 'document' ? '.nabi-preview-body' : '.nabi-history-preview');
    await expect(preview).toBeVisible();
    const before = await snapshot(page);
    expect(before.html).not.toMatch(/target=|rel=/);
    for (const [index, href] of destinations.entries()) {
      const link = preview.locator('a').nth(index);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const opened = page.waitForEvent('popup');
      await link.click();
      const popup = await opened;
      await expect(popup).toHaveURL(href);
      await expect(popup).toHaveTitle('Preview destination');
      expect(await popup.evaluate(() => window.opener)).toBeNull();
      expect(await snapshot(page)).toEqual(before);
      await expect(preview).toBeVisible();
      await popup.close();
    }
    await page.keyboard.press('Escape');
    await expect(preview).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
  });
}
