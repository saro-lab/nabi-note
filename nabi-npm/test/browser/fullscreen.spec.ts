import { expect, test, type Locator, type Page } from '@playwright/test';
import type { ContextToolbar, Nabi, Toolbar, Wing } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

interface FullscreenState {
  readonly nabi: Nabi;
  readonly toolbar: Toolbar;
  readonly context: ContextToolbar;
}

async function setupToolbar(page: Page, fontSizeMenu = false): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    async ({ entry, fontSizeMenu }) => {
      const api = await import(/* @vite-ignore */ entry);
      document.documentElement.style.fontSize = '16px';
      document.body.style.cssText = 'margin:0;padding:0;';
      document.body.innerHTML =
        '<div id="fullscreen-editor" class="nabi" style="width:532px;max-width:100%;border:0;padding:0;margin:0">' +
        '<div class="nabi-toolbar"><div id="fullscreen-toolbar"></div><div id="fullscreen-context"></div><div id="fullscreen-tools"></div></div>' +
        '<div id="fullscreen-surface" class="nabi-content"></div></div>';
      const wings = api.defaultWings.map((wing: Wing) =>
        fontSizeMenu && wing.w === 'fs'
          ? {
              ...wing,
              button: {
                ...wing.button,
                action: {
                  kind: 'menu',
                  command: 'setFontSize',
                  argKey: 'v',
                  values: [{ value: 'lg', label: { en: 'Large' } }],
                },
              },
            }
          : wing,
      );
      const { nabi, registry } = api.createNabiWith(wings, {
        locale: 'en',
        doc: [
          { w: 'img', a: { src: '/nabi-note.svg', w: '100' } },
          { w: 'p', ch: ['one two three'] },
          ...Array.from({ length: 40 }, (_, at) => ({ w: 'p', ch: [`Paragraph ${at + 1}`] })),
        ],
      });
      api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      const surface = document.getElementById('fullscreen-surface')!;
      const common = { nabi, registry, locale: 'en', surface };
      api.mountSurface({ ...common, root: surface });
      const toolbar = api.mountToolbar({ ...common, root: document.getElementById('fullscreen-toolbar')! });
      const context = api.mountContextToolbar({ ...common, root: document.getElementById('fullscreen-context')! });
      api.mountViewTools({
        ...common,
        root: document.getElementById('fullscreen-editor')!,
        container: document.getElementById('fullscreen-tools')!,
      });
      nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } });
      (globalThis as unknown as { fullscreenTest: FullscreenState }).fullscreenTest = { nabi, toolbar, context };
    },
    { entry, fontSizeMenu },
  );
}

async function enterFullscreen(root: Locator): Promise<void> {
  await root.locator('.nabi-compact-bar [data-name="fullscreen"]').click();
}

test('fullscreen keeps the paper width, fills the space between margins, and restores layout on exit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const root = page.locator('#app2');
  const surface = page.locator('#content2');
  const before = (await surface.boundingBox())!;
  await enterFullscreen(root);
  await expect(root).toHaveClass(/is-fullscreen/);
  const paper = (await surface.boundingBox())!;
  expect(paper.width).toBeCloseTo(before.width, 1);
  expect(paper.x).toBeCloseTo((1280 - paper.width) / 2, 1);
  const chrome = (await root.locator('.nabi-toolbar').boundingBox())!;
  expect(paper.y - chrome.y - chrome.height).toBeCloseTo(24, 1);
  expect(paper.y + paper.height).toBeCloseTo(800 - 24, 1);
  await expect(surface).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(await root.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgb(255, 255, 255)');

  await page.setViewportSize({ width: 480, height: 800 });
  await expect(surface).toHaveCSS('width', '480px');
  await expect(surface).toHaveCSS('margin-top', '0px');
  await expect(surface).toHaveCSS('margin-bottom', '0px');
  await expect(surface).toHaveCSS('box-shadow', 'none');
  const fullWidthPaper = (await surface.boundingBox())!;
  expect(fullWidthPaper.y + fullWidthPaper.height).toBeCloseTo(800, 1);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(surface).toHaveCSS('width', `${before.width}px`);
  await expect(surface).toHaveCSS('margin-top', '24px');
  await expect(surface).toHaveCSS('margin-bottom', '24px');
  await surface.press('Escape');
  await expect(root).not.toHaveClass(/is-fullscreen/);
  await expect(surface).not.toHaveClass(/nabi-fullscreen-content/);
  await expect(surface).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect((await surface.boundingBox())!.height).toBeCloseTo(before.height, 1);
  expect(await surface.evaluate((el) => el.style.getPropertyValue('--nabi-fullscreen-content-width'))).toBe('');

  await page.setViewportSize({ width: 900, height: 800 });
  const resized = (await surface.boundingBox())!;
  await enterFullscreen(root);
  expect((await surface.boundingBox())!.width).toBeCloseTo(resized.width, 1);

  await surface.press('Escape');
  await page.setViewportSize({ width: 480, height: 800 });
  await root.evaluate((el) => {
    const host = document.createElement('div');
    host.style.width = '320px';
    el.before(host);
    host.append(el);
  });
  expect((await surface.boundingBox())!.width).toBeCloseTo(320, 1);
  await enterFullscreen(root);
  await expect(surface).toHaveCSS('margin-top', '24px');
  await expect(surface).toHaveCSS('margin-bottom', '24px');
  const narrowPaper = (await surface.boundingBox())!;
  expect(narrowPaper.width).toBeCloseTo(320, 1);
  expect(narrowPaper.x).toBeCloseTo(80, 1);
  expect(narrowPaper.y + narrowPaper.height).toBeCloseTo(800 - 24, 1);
});

test('fullscreen backgrounds inherit overrides and long paper scrolls in both themes', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('#app');
  const surface = page.locator('#content');
  await enterFullscreen(root);
  expect((await surface.boundingBox())!.height).toBeGreaterThan(800);
  await root.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  expect(await root.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  const tail = await root.evaluate((el) => {
    const paper = el.querySelector<HTMLElement>('.nabi-fullscreen-content')!;
    const frame = el.getBoundingClientRect();
    const sheet = paper.getBoundingClientRect();
    return {
      gap: frame.bottom - sheet.bottom,
      showsFrame: el.ownerDocument.elementFromPoint(sheet.left + sheet.width / 2, frame.bottom - 12) === el,
      background: getComputedStyle(el).backgroundColor,
      paperBackground: getComputedStyle(paper).backgroundColor,
    };
  });
  expect(Math.abs(tail.gap - 24)).toBeLessThanOrEqual(1);
  expect(tail.showsFrame).toBe(true);
  expect(tail.background).not.toBe(tail.paperBackground);
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

for (const width of [1280, 390]) {
  test(`fullscreen keeps all tools and selected object properties visible at the top at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await setupToolbar(page);
    const root = page.locator('#fullscreen-editor');
    const chrome = root.locator('.nabi-toolbar');
    const toolbar = page.locator('#fullscreen-toolbar');
    const context = page.locator('#fullscreen-context');
    const bar = toolbar.locator('.nabi-compact-bar');
    if (width < 576) await expect(bar.locator('[data-name="tools"]')).toBeVisible();
    else await expect(toolbar.locator('.nabi-strip')).toBeVisible();
    await enterFullscreen(root);
    await expect(chrome).toHaveClass(/nabi-expanded/);
    await expect(toolbar.locator('.nabi-strip')).toBeVisible();
    await expect(context).toBeVisible();
    await expect(bar.locator('[data-name="tools"]')).toBeHidden();
    await expect(bar.locator('[data-name="context-tools"]')).toHaveCount(0);
    await expect(context.locator('input[type="range"]')).toBeVisible();
    await expect(context.locator('[data-name="view"]')).toBeVisible();

    const tools = await page.evaluate(() => {
      const { toolbar, context } = (globalThis as unknown as { fullscreenTest: FullscreenState }).fullscreenTest;
      const chrome = document.querySelector('#fullscreen-editor .nabi-toolbar')!.getBoundingClientRect();
      const buttons = toolbar.buttons.filter((button) => !button.el.hidden).map((button) => button.el);
      const properties = context.groups().flatMap((group) => [...group.el.children] as HTMLElement[]);
      return {
        buttonCount: buttons.length,
        propertyCount: properties.length,
        clipped: [...buttons, ...properties]
          .filter((el) => {
            const box = el.getBoundingClientRect();
            return (
              box.width <= 0 ||
              box.height <= 0 ||
              box.left < chrome.left - 1 ||
              box.right > chrome.right + 1 ||
              box.top < chrome.top - 1 ||
              box.bottom > chrome.bottom + 1
            );
          })
          .map((el) => el.getAttribute('data-name') ?? el.className),
      };
    });
    expect(tools.buttonCount).toBeGreaterThan(10);
    expect(tools.propertyCount).toBeGreaterThan(1);
    expect(tools.clipped).toEqual([]);
    expect(await toolbar.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await context.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    const beforeScroll = (await chrome.boundingBox())!;
    expect(beforeScroll.y).toBeCloseTo(0, 1);
    const properties = (await context.boundingBox())!;
    const general = (await toolbar.boundingBox())!;
    expect(properties.y).toBeGreaterThanOrEqual(general.y + general.height - 1);
    if (width === 390) expect(general.height).toBeGreaterThan(36);

    await root.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await root.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(0, 1);
    expect((await chrome.boundingBox())!.height).toBeCloseTo(beforeScroll.height, 1);
    await expect(context.locator('input[type="range"]')).toBeInViewport();
    await expect(context.locator('[data-name="view"]')).toBeInViewport();

    await bar.locator('[data-name="fullscreen"]').click();
    await expect(root).not.toHaveClass(/is-fullscreen/);
    if (width < 576) {
      await expect(chrome).not.toHaveClass(/nabi-expanded/);
      await expect(toolbar.locator('.nabi-strip')).toBeHidden();
    } else {
      await expect(chrome).toHaveClass(/nabi-expanded/);
      await expect(toolbar.locator('.nabi-strip')).toBeVisible();
    }
    await expect(context).toBeVisible();
    await expect(context).toHaveClass(/nabi-compact-context/);
    await expect(context.locator('input[type="range"]')).toBeVisible();
    if (width < 576) {
      await expect(bar.locator('[data-name="tools"]')).toBeVisible();
      await expect(bar.locator('.nabi-compact-quick')).toBeVisible();
      await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(36, 1);
    } else {
      await expect(bar.locator('[data-name="tools"]')).toBeHidden();
    }
  });
}

test('fullscreen tools remain usable across object and text selections', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setupToolbar(page, true);
  const root = page.locator('#fullscreen-editor');
  const toolbar = page.locator('#fullscreen-toolbar');
  const context = page.locator('#fullscreen-context');
  const surface = page.locator('#fullscreen-surface');
  await enterFullscreen(root);
  await context.locator('input[type="range"]').press('Home');
  await expect(surface.locator('img').first()).toHaveAttribute('data-nabi-width', '30');
  await expect(toolbar.locator('.nabi-strip')).toBeVisible();
  await expect(context.locator('[data-name="view"]')).toBeVisible();

  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { fullscreenTest: FullscreenState }).fullscreenTest;
    nabi.select({ anchor: { path: [1], offset: 4 }, focus: { path: [1], offset: 7 } });
    document.getElementById('fullscreen-surface')!.focus();
  });
  await expect(context).toBeHidden();
  await toolbar.locator('.nabi-strip [data-name="b"]').click();
  await expect(surface.locator('b')).toHaveText('two');
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { fullscreenTest: FullscreenState }).fullscreenTest;
    nabi.select({ anchor: { path: [1], offset: 5 }, focus: { path: [1], offset: 5 } });
  });
  await expect(toolbar.locator('.nabi-strip [data-name="b"]')).toHaveAttribute('aria-pressed', 'true');
  await toolbar.locator('.nabi-strip [data-name="fs"]').click();
  const picker = page.locator('.nabi-panel:visible');
  await expect(picker).toBeVisible();
  await expect(picker.locator('button').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(root).toHaveClass(/is-fullscreen/);
  await toolbar.locator('.nabi-strip [data-name="table"]').click();
  await expect(picker.locator('.nabi-grid')).toBeVisible();
  await expect(picker).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(root).toHaveClass(/is-fullscreen/);

  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { fullscreenTest: FullscreenState }).fullscreenTest;
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 1 } });
  });
  await expect(context.locator('input[type="range"]')).toBeVisible();
  await expect(context.locator('input[type="range"]')).toHaveValue('0');
  await expect(toolbar.locator('.nabi-strip')).toBeVisible();
  await surface.press('Escape');
  await expect(root).not.toHaveClass(/is-fullscreen/);
  await expect(toolbar.locator('.nabi-strip')).toBeVisible();
  await expect(toolbar.locator('.nabi-compact-bar [data-name="tools"]')).toBeHidden();
});
