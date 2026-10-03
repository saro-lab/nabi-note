import { expect, test, type Page } from '@playwright/test';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

async function setup(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    document.documentElement.style.fontSize = '16px';
    document.body.innerHTML = '<div id="mobile-host"></div>';
    document.body.style.margin = '0';
    for (const id of ['a', 'b']) {
      const root = document.createElement('div');
      root.id = `mobile-${id}`;
      root.className = 'nabi';
      root.style.cssText = 'width:576px; border:0; padding:0;';
      root.innerHTML = '<div class="nabi-toolbar-row"></div><div class="nabi-context"></div>';
      document.getElementById('mobile-host')!.append(root);
      const { nabi, registry } = api.createNabiWith(api.defaultWings);
      api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      api.mountToolbar({ nabi, registry, root: root.querySelector('.nabi-toolbar-row') });
      api.mountContextToolbar({ nabi, registry, root: root.querySelector('.nabi-context') });
    }
  }, entry);
}

test('mobile mode starts strictly below 36rem, including fractional widths', async ({ page }) => {
  await setup(page);
  const root = page.locator('#mobile-a');
  const row = root.locator('.nabi-toolbar-row');
  await expect(row).not.toHaveClass(/nabi-narrow/);
  for (const [width, narrow] of [
    [575.75, true],
    [576, false],
    [577, false],
    [575, true],
  ] as const) {
    await root.evaluate((el, width) => {
      el.style.width = `${width}px`;
    }, width);
    if (narrow) await expect(row).toHaveClass(/nabi-narrow/);
    else await expect(row).not.toHaveClass(/nabi-narrow/);
  }
  await root.evaluate((el) => {
    el.style.width = '720px';
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });
  await expect(row).not.toHaveClass(/nabi-narrow/);
  await root.evaluate((el) => {
    el.style.width = '719.75px';
  });
  await expect(row).toHaveClass(/nabi-narrow/);
});

test('inherited CSS overrides update mounted editors independently', async ({ page }) => {
  await setup(page);
  const a = page.locator('#mobile-a .nabi-toolbar-row');
  const b = page.locator('#mobile-b .nabi-toolbar-row');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--nabi-mobile-breakpoint', '40rem');
  });
  await expect(a).toHaveClass(/nabi-narrow/);
  await expect(b).toHaveClass(/nabi-narrow/);
  await page.locator('#mobile-a').evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', '576px');
  });
  await expect(a).not.toHaveClass(/nabi-narrow/);
  await expect(b).toHaveClass(/nabi-narrow/);
  await page.locator('#mobile-a').evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', 'calc(36rem + 1px)');
  });
  await expect(a).toHaveClass(/nabi-narrow/);
  await page.locator('#mobile-a').evaluate((el) => {
    el.style.removeProperty('--nabi-mobile-breakpoint');
  });
  await page.evaluate(() => {
    document.documentElement.style.removeProperty('--nabi-mobile-breakpoint');
  });
  await expect(a).not.toHaveClass(/nabi-narrow/);
  await expect(b).not.toHaveClass(/nabi-narrow/);
  await page.addStyleTag({ content: '#mobile-host { --nabi-mobile-breakpoint: 40rem; }' });
  await expect(a).toHaveClass(/nabi-narrow/);
  await expect(b).toHaveClass(/nabi-narrow/);
});

test('viewport, open table picker, and context controls share the breakpoint', async ({ page }) => {
  await setup(page);
  const root = page.locator('#mobile-a');
  const row = root.locator('.nabi-toolbar-row');
  await root.locator('.nabi-compact-bar > [data-name="tools"]').click();
  await root.locator('.nabi-toolbox [data-name="table"]').click();
  const panel = root.locator('.nabi-panel');
  await expect(panel).toHaveClass(/nabi-hosted-panel/);
  await expect(panel).toHaveCSS('position', 'static');
  await expect(panel.locator('.nabi-cell:visible')).toHaveCount(64);
  await root.evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', '40rem');
  });
  await expect(row).toHaveClass(/nabi-narrow/);
  await expect(root.locator('.nabi-context')).toHaveClass(/nabi-narrow/);
  await expect(panel).toHaveCSS('position', 'static');
  await expect(panel.locator('.nabi-cell:visible')).toHaveCount(25);
  await root.evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', '36rem');
  });
  await expect(panel).toHaveClass(/nabi-hosted-panel/);
  await expect(panel).toHaveCSS('position', 'static');
  await expect(panel.locator('.nabi-cell:visible')).toHaveCount(64);
  await page.setViewportSize({ width: 575, height: 800 });
  await expect(row).toHaveClass(/nabi-narrow/);
  await expect(panel).toHaveCSS('position', 'static');
  await expect(panel.locator('.nabi-cell:visible')).toHaveCount(25);
  await page.setViewportSize({ width: 576, height: 800 });
  await expect(row).not.toHaveClass(/nabi-narrow/);
  await expect(panel).toHaveClass(/nabi-hosted-panel/);
  await expect(panel).toHaveCSS('position', 'static');
});

test('modal prompts keep the editor breakpoint after moving to body and clean up', async ({ page }) => {
  await setup(page);
  const root = page.locator('#mobile-a');
  const probeCount = await root.locator('span[aria-hidden="true"]').count();
  await page.evaluate(async (entry) => {
    const { openPrompt } = await import(/* @vite-ignore */ entry.replace('/index.ts', '/ui/parts/prompt.ts'));
    const anchor = document.createElement('button');
    anchor.textContent = 'Standalone prompt';
    document.getElementById('mobile-a')!.append(anchor);
    openPrompt(document, {
      anchor,
      fields: [{ name: 'url', label: 'URL' }],
      okLabel: 'OK',
      onSubmit: () => {},
    });
  }, entry);
  const prompt = page.locator('.nabi-scrim .nabi-prompt');
  await expect(prompt).toHaveCSS('flex-wrap', 'nowrap');
  await root.evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', '40rem');
  });
  await expect(prompt).toHaveClass(/nabi-narrow/);
  await expect(prompt).toHaveCSS('flex-wrap', 'wrap');
  await expect(prompt.locator('input')).toHaveCSS('font-size', '16px');
  await root.evaluate((el) => {
    el.style.setProperty('--nabi-mobile-breakpoint', '36rem');
  });
  await expect(prompt).not.toHaveClass(/nabi-narrow/);
  await expect(prompt).toHaveCSS('flex-wrap', 'nowrap');
  await prompt.locator('input').press('Escape');
  await expect(prompt).toHaveCount(0);
  await expect(root.locator('span[aria-hidden="true"]')).toHaveCount(probeCount);
});
