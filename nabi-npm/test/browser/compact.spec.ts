import { expect, test, type Page } from '@playwright/test';
import type { ContextToolbar, LocaleController, Nabi, Toolbar } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

test.use({ viewport: { width: 390, height: 900 } });

interface BrowserState {
  readonly nabi: Nabi;
  readonly toolbar: Toolbar;
  readonly context: ContextToolbar;
  readonly hints: import('../../src/index.js').Hints;
  readonly locale: LocaleController;
  readonly original: readonly HTMLButtonElement[];
  readonly viewport?: EventTarget & {
    height: number;
    width: number;
    offsetTop: number;
    offsetLeft: number;
    scale: number;
  };
  dispose(): void;
}

async function setup(
  page: Page,
  options: { readonly width?: number; readonly quick?: readonly string[]; readonly mockViewport?: boolean } = {},
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    async ({ entry, width, quick, mockViewport }) => {
      const api = await import(/* @vite-ignore */ entry);
      document.documentElement.style.fontSize = '16px';
      document.body.style.cssText = 'margin:0; padding:0;';
      document.body.innerHTML = '<main id="compact-host"></main>';
      const viewport = mockViewport
        ? Object.assign(new EventTarget(), {
            height: window.innerHeight,
            width: window.innerWidth,
            offsetTop: 0,
            offsetLeft: 0,
            scale: 1,
            pageTop: 0,
            pageLeft: 0,
          })
        : undefined;
      if (viewport) Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
      const app = document.createElement('div');
      app.id = 'compact-editor';
      app.className = 'nabi';
      app.style.cssText = `width:${width}px;max-width:100%;border:0;padding:0;margin:0;`;
      app.innerHTML =
        '<div id="compact-chrome" class="nabi-toolbar"><div id="compact-toolbar"></div><div id="compact-context"></div><div id="compact-tools"></div></div><div id="compact-surface" class="nabi-content"></div>';
      document.getElementById('compact-host')!.append(app);
      const custom = api.simpleMark({
        w: 'exCompactBrowserMark',
        button: {
          name: 'apply',
          group: 'custom',
          label: { en: 'Custom browser mark', ko: '브라우저 사용자 표시' },
          action: { kind: 'mark' },
        },
      });
      const locale = api.createLocale('en');
      const { nabi, registry } = api.createNabiWith([...api.defaultWings, custom], {
        doc: [{ w: 'p', ch: ['one two three'] }],
        locale,
      });
      const stopCss = api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      const surfaceRoot = document.getElementById('compact-surface')!;
      const surface = api.mountSurface({ nabi, registry, root: surfaceRoot, locale });
      const common = { nabi, registry, locale, surface: surfaceRoot };
      const root = document.getElementById('compact-toolbar')!;
      root.innerHTML = api.renderToolbarHtml({ registry, locale, ...(quick ? { quick } : {}) });
      const original = [...root.querySelectorAll<HTMLButtonElement>('button[data-name]')];
      const toolbar = api.mountToolbar({ ...common, root, ...(quick ? { quick } : {}) });
      const view = api.mountViewTools({ ...common, root: app, container: document.getElementById('compact-tools')! });
      const context = api.mountContextToolbar({ ...common, root: document.getElementById('compact-context')! });
      const hints = api.mountHints({
        toolbar,
        context,
        root: document.getElementById('compact-chrome')!,
        surface: surfaceRoot,
      });
      (globalThis as unknown as { compactTest: BrowserState }).compactTest = {
        nabi,
        toolbar,
        context,
        hints,
        locale,
        original,
        viewport,
        dispose() {
          hints.unmount();
          view.unmount();
          context.unmount();
          toolbar.unmount();
          surface.unmount();
          stopCss();
        },
      };
    },
    { entry, width: options.width ?? 532, quick: options.quick, mockViewport: options.mockViewport },
  );
}

for (const width of [1280, 390]) {
  test(`object properties appear below the main toolbar and disappear for plain text at ${width}px`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page, { width: width === 1280 ? 1000 : 354 });
    const bar = page.locator('#compact-toolbar .nabi-compact-bar');
    const chrome = page.locator('#compact-chrome');
    const properties = page.locator('#compact-context');
    const main = page.locator('#compact-toolbar');
    await expect(properties).toBeHidden();
    const initialHeight = (await chrome.boundingBox())!.height;
    if (width < 576) expect(initialHeight).toBeCloseTo(36, 0);
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([
        { w: 'img', a: { src: '/nabi-note.svg', alt: 'sample' } },
        { w: 'p', ch: [{ w: 'fs', a: { v: 'lg' }, ch: ['formatted'] }] },
        { w: 'p', ch: ['plain'] },
      ]);
    });
    await expect(properties).toBeVisible();
    await expect(properties.locator('input[type="range"]')).toBeVisible();
    await expect(properties.locator('[data-name="view"]')).toBeVisible();
    if (width < 576) {
      await expect(bar.locator('.nabi-compact-quick')).toBeVisible();
      await expect(bar.locator('[data-name="tools"]')).toBeVisible();
    } else {
      await expect(main.locator('.nabi-strip')).toBeVisible();
      await expect(bar.locator('[data-name="tools"]')).toBeHidden();
    }
    await expect(chrome.locator('[data-name="context-tools"], [data-name="tools-back"]')).toHaveCount(0);
    await page
      .locator('#compact-editor')
      .screenshot({ path: `/private/tmp/nabi-properties-${browserName}-${width}.png` });
    const mainBox = (await main.boundingBox())!;
    const contextBox = (await properties.boundingBox())!;
    expect(contextBox.y).toBeGreaterThanOrEqual(mainBox.y + mainBox.height - 1);
    expect((await chrome.boundingBox())!.height).toBeGreaterThan(mainBox.height);
    expect((await page.locator('#compact-surface').boundingBox())!.y).toBeGreaterThanOrEqual(
      contextBox.y + contextBox.height,
    );
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.select({ anchor: { path: [1], offset: 2 }, focus: { path: [1], offset: 2 } });
    });
    await expect(properties).toBeVisible();
    await expect(properties.locator('[data-name="view"]')).toHaveCount(0);
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.select({ anchor: { path: [2], offset: 2 }, focus: { path: [2], offset: 2 } });
    });
    await expect(properties).toBeHidden();
    await expect.poll(async () => (await chrome.boundingBox())!.height).toBeCloseTo(initialHeight, 0);
  });
}

test('resizing wraps all live object properties while retaining main tools and focused controls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { width: 1000 });
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.setJson([{ w: 'img', a: { src: '/nabi-note.svg', alt: 'sample' } }]);
  });
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  const properties = page.locator('#compact-context');
  const wideHeight = (await properties.boundingBox())!.height;
  await properties.locator('[data-name="view"]').focus();
  for (const width of [240, 1000, 240]) {
    await page.locator('#compact-editor').evaluate((el, width) => {
      el.style.width = `${width}px`;
    }, width);
    await expect(properties.locator('input[type="range"]')).toBeVisible();
    await expect(properties.locator('[data-name="view"]')).toBeFocused();
    await expect(page.locator('#compact-toolbar .nabi-strip')).toBeVisible();
    await expect(bar.locator('[data-name="context-tools"]')).toHaveCount(0);
    const clipped = await page.evaluate(() => {
      const { context } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      const bounds = context.root.getBoundingClientRect();
      return context
        .groups()
        .flatMap((group) => [...group.el.children] as HTMLElement[])
        .some((el) => {
          const box = el.getBoundingClientRect();
          return (
            el.hidden ||
            box.width <= 0 ||
            box.left < bounds.left - 1 ||
            box.right > bounds.right + 1 ||
            box.bottom > bounds.bottom + 1
          );
        });
    });
    expect(clipped).toBe(false);
    if (width === 240) expect((await properties.boundingBox())!.height).toBeGreaterThan(wideHeight);
  }
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.locale.setLocale('ko');
  });
  await expect(properties.locator('[data-name="view"]')).toBeFocused();
  await expect(bar.locator('[data-name="tools"]')).toBeHidden();
  await expect(properties.locator('input[type="range"]')).toBeVisible();
  await expect(page.locator('#compact-toolbar .nabi-strip')).toBeVisible();
});

for (const width of [1280, 390]) {
  test(`property inputs retain focus after applying changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page, { width: width === 1280 ? 532 : 354, mockViewport: true });
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([{ w: 'img', a: { src: '/nabi-note.svg', w: '100' } }]);
    });
    const properties = page.locator('#compact-context');
    const slider = properties.locator('input[type="range"]');
    await slider.press('Home');
    await expect(slider).toHaveValue('0');
    await expect(slider).toBeFocused();
    await expect(page.locator('#compact-surface img')).toHaveAttribute('data-nabi-width', '30');
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://example.test/old' }, ch: ['link'] }] }]);
      nabi.select({ anchor: { path: [0], offset: 2 }, focus: { path: [0], offset: 2 } });
    });
    const href = properties.locator('input[data-name="href"]');
    await href.fill('https://example.test/new');
    await href.press('Enter');
    await expect(href).toBeFocused();
    await expect(href).toHaveValue('https://example.test/new');
    await expect(page.locator('#compact-surface a')).toHaveAttribute('href', 'https://example.test/new');
    const label = properties.locator('input[data-name="text"]');
    await label.fill('new link');
    await label.press('Enter');
    await expect(label).toBeFocused();
    await expect(page.locator('#compact-surface a')).toHaveText('new link');
    await expect(page.locator('#compact-surface')).not.toBeFocused();
  });
}

for (const width of [1280, 390]) {
  test(`visible tools expose a custom wing and preserve the selected range at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page, { quick: ['b'] });
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } });
      document.getElementById('compact-surface')!.focus();
    });
    if (width < 576) await page.locator('#compact-toolbar [data-name="tools"]').click();
    const panel = page.locator(width < 576 ? '.nabi-toolbox' : '#compact-toolbar .nabi-strip');
    await expect(panel).toBeVisible();
    const custom = panel.locator('[data-name="exCompactBrowserMark:apply"]');
    await expect(custom).toBeVisible();
    await custom.click();
    const result = await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      return { doc: nabi.getJson(), selection: nabi.getSelection(), undone: nabi.undo(), restored: nabi.getJson() };
    });
    expect(result.doc).toEqual([{ w: 'p', ch: ['one ', { w: 'exCompactBrowserMark', ch: ['two'] }, ' three'] }]);
    expect(result.selection).toEqual({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } });
    expect(result.undone).toBe(true);
    expect(result.restored).toEqual([{ w: 'p', ch: ['one two three'] }]);
  });
}

test('viewport changes switch full and compact tools while preserving controls, focus and hit targets', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { width: 800, quick: ['b', 'i', 'u', 's', 'tc', 'hl', 'fs', 'tf', 'exCompactBrowserMark:apply'] });
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.setJson([{ w: 'img', a: { src: '/nabi-note.svg', w: '100' } }]);
    document.querySelector<HTMLInputElement>('#compact-context input[type="range"]')!.dataset.identity = 'original';
  });
  const toolbar = page.locator('#compact-toolbar');
  const bar = toolbar.locator('.nabi-compact-bar');
  const properties = page.locator('#compact-context');
  const slider = properties.locator('input[type="range"]');
  await slider.focus();
  for (const width of [1280, 576, 575, 390, 320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const strip = toolbar.locator('.nabi-strip');
    if (width >= 576) {
      await expect(strip).toBeVisible();
      await expect(bar.locator('[data-name="tools"]')).toBeHidden();
    } else {
      await expect(strip).toBeHidden();
      await expect(bar.locator('[data-name="tools"]')).toBeVisible();
      await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(36, 0);
    }
    await expect(slider).toBeFocused();
    await expect(slider).toHaveAttribute('data-identity', 'original');
    await expect(slider).toHaveCSS('height', '28px');
    await expect(properties).toBeVisible();
    await expect
      .poll(async () =>
        toolbar.evaluate((el) => {
          const frame = el.getBoundingClientRect();
          return [...el.querySelectorAll<HTMLButtonElement>('.nabi-btn')]
            .filter((button) => button.getClientRects().length > 0)
            .flatMap((button) => {
              const box = button.getBoundingClientRect();
              const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
              return box.left >= frame.left - 1 &&
                box.right <= frame.right + 1 &&
                box.width >= 31 &&
                Math.abs(box.height - 32) < 1 &&
                button.contains(hit)
                ? []
                : [
                    {
                      name: button.dataset.name,
                      height: box.height,
                      left: box.left,
                      right: box.right,
                      hit: hit?.className,
                    },
                  ];
            });
        }),
      )
      .toEqual([]);
  }
  const state = await page.evaluate(() => {
    const { toolbar, original } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    return {
      same: toolbar.buttons.every((button) => original.includes(button.el)),
      count: toolbar.buttons.length,
      unavailable: toolbar.buttons.filter((button) => button.el.hidden).map((button) => button.el.dataset.name),
    };
  });
  expect(state.same).toBe(true);
  expect(state.count).toBeGreaterThan(10);
  expect(state.unavailable).not.toContain('exCompactBrowserMark:apply');
  await toolbar.locator('.nabi-strip [data-name="exCompactBrowserMark:apply"]').focus();
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(bar.locator('[data-name="tools"]')).toBeFocused();
  await bar.locator('[data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox [data-name="exCompactBrowserMark:apply"]')).toBeVisible();
});

test('open toolbox updates locale and direction without replacing the document or source buttons', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page);
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const custom = page.locator('.nabi-toolbox [data-name="exCompactBrowserMark:apply"]');
  await expect(custom).toHaveAttribute('aria-label', 'Custom browser mark');
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.locale.setLocale('ko');
  });
  await expect(custom).toHaveAttribute('aria-label', '브라우저 사용자 표시');
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.locale.setLocale('ar');
  });
  await expect(page.locator('#compact-toolbar')).toHaveAttribute('dir', 'rtl');
  expect(
    await page.evaluate(() => {
      const { nabi, toolbar, original } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      return { doc: nabi.getJson(), same: toolbar.buttons.every((button) => original.includes(button.el)) };
    }),
  ).toEqual({ doc: [{ w: 'p', ch: ['one two three'] }], same: true });
  await custom.focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.nabi-toolbox')).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
});

async function expectTooltip(page: Page, text: string) {
  const tooltip = page.locator('.nabi-tooltip[role="tooltip"]');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(text);
  const box = (await tooltip.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  return {
    viewport,
    ...box,
    right: box.x + box.width,
    bottom: box.y + box.height,
    minEdge: Math.min(box.x, box.y, viewport.width - box.x - box.width, viewport.height - box.y - box.height),
  };
}

for (const width of [1280, 390]) {
  test(`tooltips at ${width}px retain accelerators, gestures and swatch names and clean up interactions`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page, { width: width === 1280 ? 532 : 354 });
    const bar = page.locator('#compact-toolbar .nabi-compact-bar');
    const tooltip = page.locator('.nabi-tooltip[role="tooltip"]');
    const commands = page.locator(width < 576 ? '#compact-toolbar .nabi-compact-bar' : '#compact-toolbar .nabi-strip');
    const bold = commands.locator('[data-name="b"]');
    const boldLabel = await bold.getAttribute('aria-label');
    await bold.hover();
    await expectTooltip(page, `${boldLabel} (Ctrl/Cmd+B)`);
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-toolbar.png` });
    await page.mouse.move(width - 10, 600);
    await expect(tooltip).toHaveCount(0);

    const tools = bar.locator('[data-name="tools"]');
    if (width < 576) {
      await tools.hover();
      await expectTooltip(page, 'Tools (Shift Shift)');
      await tools.click();
      await expect(tooltip).toHaveCount(0);
    }
    const panel = page.locator('.nabi-toolbox');
    const all = width < 576 ? panel : commands;
    const clear = all.locator('[data-name="clearFormat"]');
    const clearLabel = await clear.getAttribute('aria-label');
    await clear.hover();
    await expectTooltip(page, `${clearLabel} (Esc Esc)`);
    await clear.click();
    await expect(tooltip).toHaveCount(0);
    if (width < 576) {
      await tools.click();
      await expect(panel).toBeHidden();
    }

    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([
        {
          w: 'p',
          ch: [
            {
              w: 'b',
              ch: [{ w: 'tc', a: { c: 'green' }, ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['one two three'] }] }],
            },
          ],
        },
      ]);
      nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    });
    const swatch = page.locator('#compact-context .nabi-swatch:not(.on)').first();
    await expect(swatch).toBeVisible();
    const swatchLabel = await swatch.getAttribute('aria-label');
    await swatch.hover();
    const swatchMetrics = await expectTooltip(page, swatchLabel!);
    console.log('tooltip metrics', JSON.stringify({ browserName, target: 'swatch', ...swatchMetrics }));
    await expect(swatch).not.toHaveClass(/\bon\b/);
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-colors.png` });
    await page.mouse.move(width - 1, 600);
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    for (const theme of ['light', 'dark']) {
      await page
        .locator('#compact-editor')
        .evaluate((root, theme) => root.setAttribute('data-nabi-theme', theme), theme);
      await page.screenshot({
        path: `/private/tmp/nabi-selection-${browserName}-${width}-${theme}.png`,
        clip: { x: 0, y: 0, width: width === 1280 ? 532 : 354, height: 400 },
      });
      if (width < 576) {
        await tools.click();
        await expect(panel.locator('[data-name="b"]')).toHaveAttribute('aria-pressed', 'true');
        await page.mouse.move(width - 1, 600);
        await page.screenshot({
          path: `/private/tmp/nabi-selection-${browserName}-${width}-${theme}-palette.png`,
          clip: { x: 0, y: 0, width: 354, height: 400 },
        });
        await tools.click();
      }
    }
    if (width < 576) await tools.click();
    const custom = all.locator('[data-name="exCompactBrowserMark:apply"]');
    await custom.hover();
    await expectTooltip(page, 'Custom browser mark');
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-palette.png` });
    await page.evaluate(() => {
      (globalThis as unknown as { compactTest: BrowserState }).compactTest.dispose();
    });
    await expect(tooltip).toHaveCount(0);
  });
}

test('the last palette row displays an unclipped tooltip outside its scrolling panel and within the viewport', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 280 });
  await setup(page, { width: 320 });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
  const body = panel.locator('.nabi-toolbox-body');
  await body.evaluate((el) => {
    el.style.maxHeight = '64px';
  });
  expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  const last = panel.locator('.nabi-toolbox-group > button').last();
  const label = await last.getAttribute('aria-label');
  await last.scrollIntoViewIfNeeded();
  expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.mouse.move(700, 220);
  await last.hover();
  const tooltip = page.locator('.nabi-tooltip[role="tooltip"]');
  await expectTooltip(page, label!);
  const tipBox = (await tooltip.boundingBox())!;
  const bodyBox = (await body.boundingBox())!;
  expect(tipBox.y).toBeGreaterThanOrEqual(bodyBox.y + bodyBox.height);
  expect(await tooltip.evaluate((el) => el.parentElement === document.body)).toBe(true);
  expect(await tooltip.evaluate((el) => !el.closest('.nabi-toolbox-body'))).toBe(true);
  await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-palette-scroll.png` });
  await page.mouse.move(700, 220);
  await expect(tooltip).toHaveCount(0);
});

test('unmount closes toolbox and permits a clean remount', async ({ page }) => {
  await setup(page);
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox')).toBeVisible();
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.dispose();
  });
  await expect(page.locator('.nabi-toolbox, [data-nabi-docked="true"]')).toHaveCount(0);
  await expect(page.locator('#compact-toolbar .nabi-compact-bar')).toHaveCount(0);
  await setup(page);
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox')).toHaveCount(1);
});

test('mobile top toolbar opens tools before the simulated keyboard closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354, mockViewport: true });
  await page.locator('#compact-surface').click();
  const chrome = page.locator('#compact-chrome');
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  await expect(chrome).toHaveCSS('position', 'sticky');
  await expect(chrome).not.toHaveAttribute('data-nabi-docked', 'true');
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 540;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => {
      const box = (await bar.boundingBox())!;
      return box.y;
    })
    .toBeCloseTo(0, 0);
  const before = await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } });
    return { doc: nabi.getJson(), selection: nabi.getSelection() };
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeVisible();
  await expect(page.locator('#compact-surface')).not.toBeFocused();
  await expect(panel.locator('button').first()).toBeFocused();
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 844;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect(panel).toBeVisible();
  const toolBox = (await panel.boundingBox())!;
  const commandBox = (await bar.boundingBox())!;
  expect(commandBox.height).toBeCloseTo(36, 0);
  expect(commandBox.y + commandBox.height).toBeCloseTo(toolBox.y, 0);
  expect(toolBox.y + toolBox.height).toBeLessThanOrEqual(845);
  expect(toolBox.height).toBeGreaterThan(0);
  await page.locator('#compact-toolbar .nabi-compact-bar > [data-name="tools"]').click();
  await expect(panel).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
  expect(
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      return { doc: nabi.getJson(), selection: nabi.getSelection() };
    }),
  ).toEqual(before);
});

test.describe('mobile touch panels', () => {
  test.use({ hasTouch: true });

  for (const offset of [0, 200]) {
    for (const properties of [false, true]) {
      test(`tools and automatic properties ${properties} stay together after deep scroll with viewport offset ${offset}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await setup(page, { width: 354, mockViewport: true });
        await page.evaluate(
          async ({ entry, properties, offset }) => {
            const api = await import(/* @vite-ignore */ entry);
            const state = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
            const app = document.getElementById('compact-editor')!;
            const chrome = document.getElementById('compact-chrome')!;
            const surface = document.getElementById('compact-surface')!;
            app.style.marginTop = '200px';
            const row = document.createElement('div');
            row.append(document.getElementById('compact-tools')!, document.getElementById('compact-toolbar')!);
            chrome.prepend(row);
            state.nabi.setJson([
              ...(properties ? [{ w: 'img', a: { src: '/nabi-note.svg', alt: 'sample' } }] : []),
              ...Array.from({ length: 60 }, (_, i) => ({ w: 'p', ch: [`paragraph ${i}`] })),
            ]);
            state.viewport!.offsetTop = offset;
            state.viewport!.height = offset ? 540 : 844;
            state.viewport!.dispatchEvent(new Event('resize'));
            const sticky = api.mountSticky({ nabi: state.nabi, root: app, surface, chrome });
            const dispose = state.dispose;
            state.dispose = () => {
              sticky.unmount();
              dispose();
            };
            surface.focus({ preventScroll: true });
          },
          { entry, properties, offset },
        );
        await page.evaluate(() => {
          window.dispatchEvent(new PointerEvent('pointerdown'));
          window.scrollTo(0, 1600);
        });
        const chrome = page.locator('#compact-chrome');
        const context = page.locator('#compact-context');
        const bar = page.locator('#compact-toolbar .nabi-compact-bar');
        await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(offset, 0);
        const before = await page.evaluate(() => window.scrollY);
        expect(before).toBe(1600);
        if (properties) {
          await expect(context).toBeVisible();
          const slider = context.locator('input[type="range"]');
          await slider.focus();
          await expect(slider).toBeFocused();
          expect(await page.evaluate(() => window.scrollY)).toBe(before);
          const bounds = (await context.boundingBox())!;
          const main = (await bar.boundingBox())!;
          expect(bounds.y).toBeGreaterThanOrEqual(main.y + main.height - 1);
          expect(bounds.y + bounds.height).toBeLessThanOrEqual(offset + (await chrome.boundingBox())!.height + 1);
        } else {
          await expect(context).toBeHidden();
        }
        const trigger = bar.locator('[data-name="tools"]');
        await trigger.tap();
        const panel = page.locator('.nabi-toolbox');
        await expect(panel).toBeVisible();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
        await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(offset, 0);
        const toolbarBox = (await chrome.boundingBox())!;
        const panelBox = (await panel.boundingBox())!;
        expect(panelBox.y).toBeCloseTo(toolbarBox.y + toolbarBox.height, 0);
        expect(panelBox.height).toBeGreaterThan(40);
        expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(844);
        expect(
          await panel
            .locator('button')
            .first()
            .evaluate((el) => {
              const box = el.getBoundingClientRect();
              return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
            }),
        ).toBe(true);
        if (offset) {
          for (const top of [120, 60, 0]) {
            await page.evaluate((top) => {
              const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
              viewport.offsetTop = top;
              viewport.height = 844 - top;
              viewport.dispatchEvent(new Event('resize'));
              viewport.dispatchEvent(new Event('scroll'));
            }, top);
            await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(top, 0);
            await expect(panel).toBeVisible();
            await expect.poll(async () => (await panel.boundingBox())!.y).toBeCloseTo(top + toolbarBox.height, 0);
            expect(await page.evaluate(() => window.scrollY)).toBe(before);
          }
        }
        for (let attempt = 0; attempt < 2; attempt += 1) {
          await trigger.tap();
          await expect(panel).toBeHidden();
          await page.evaluate(() => {
            window.dispatchEvent(new PointerEvent('pointerdown'));
            window.scrollTo(0, 1600);
          });
          await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(0, 0);
          await trigger.tap();
          await expect(panel).toBeVisible();
          expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
          expect((await panel.boundingBox())!.y).toBeCloseTo(toolbarBox.height, 0);
        }
        const samples = await page.evaluate(async () => {
          const samples: { top: number; bottom: number; scroll: number }[] = [];
          for (let frame = 0; frame < 30; frame += 1) {
            await new Promise(requestAnimationFrame);
            const box = document.querySelector('.nabi-toolbox')!.getBoundingClientRect();
            samples.push({ top: box.top, bottom: box.bottom, scroll: window.scrollY });
          }
          return samples;
        });
        for (const key of ['top', 'bottom', 'scroll'] as const) {
          const values = samples.map((sample) => sample[key]);
          expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
        }
      });
    }
  }

  test('tools remain usable while the viewport still reports an open keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page, { width: 354, mockViewport: true });
    await page.locator('#compact-surface').evaluate((surface) => surface.focus({ preventScroll: true }));
    await page.evaluate(() => {
      const { nabi, viewport } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 3 } });
      viewport!.height = 540;
      viewport!.dispatchEvent(new Event('resize'));
    });
    const trigger = page.locator('#compact-toolbar .nabi-compact-bar > [data-name="tools"]');
    await trigger.tap();
    const panel = page.locator('.nabi-toolbox');
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#compact-surface')).not.toBeFocused();
    expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await panel.locator('[data-name="b"]').tap();
    expect(
      await page.evaluate(() => (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.getJson()),
    ).toEqual([{ w: 'p', ch: [{ w: 'b', ch: ['one'] }, ' two three'] }]);
    await expect(panel).toBeVisible();
    await trigger.tap();
    await expect(panel).toBeHidden();
    await expect(page.locator('#compact-surface')).toBeFocused();
  });

  test('automatic property controls work while the viewport still reports an open keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page, { width: 354, mockViewport: true });
    await page.evaluate(() => {
      const { nabi, viewport } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([{ w: 'img', a: { src: '/nabi-note.svg', w: '100' } }]);
      document.getElementById('compact-surface')!.focus({ preventScroll: true });
      viewport!.height = 540;
      viewport!.dispatchEvent(new Event('resize'));
    });
    const properties = page.locator('#compact-context');
    const slider = properties.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    await slider.press('Home');
    await expect(slider).toHaveValue('0');
    await expect(slider).toBeFocused();
    await expect(page.locator('#compact-surface')).not.toBeFocused();
    await expect(page.locator('.nabi-toolbox')).toBeHidden();
    await expect(properties).toBeVisible();
  });
});

test('opening the mobile toolbox does not steal an active composition', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354, mockViewport: true });
  await page.locator('#compact-surface').click();
  await page.evaluate(() => {
    const surface = document.getElementById('compact-surface')!;
    surface.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox')).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
  await page.evaluate(() => {
    const surface = document.getElementById('compact-surface')!;
    surface.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' }));
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox')).toBeVisible();
});

test('mobile URL input replaces the command row at the top with the simulated keyboard open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354, mockViewport: true });
  await page.locator('#compact-surface').click();
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.select({
      anchor: { path: [0], offset: 4 },
      focus: { path: [0], offset: 7 },
    });
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await page.locator('.nabi-toolbox [data-name="a"]').click();
  const panel = page.locator('.nabi-toolbox');
  const input = panel.locator('.nabi-prompt input');
  await expect(input).toBeFocused();
  await expect(page.locator('#compact-toolbar .nabi-compact-bar')).toBeHidden();
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 540;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeCloseTo(36, 0);
  await expect
    .poll(async () => {
      const box = (await panel.boundingBox())!;
      return box.y;
    })
    .toBeCloseTo(0, 0);
  await expect(page.locator('.nabi-toolbox:visible')).toHaveCount(1);
  await input.fill('https://example.test');
  await input.press('Enter');
  await expect(panel).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
  expect(
    await page.evaluate(() => (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.getJson()),
  ).toEqual([{ w: 'p', ch: ['one ', { w: 'a', a: { href: 'https://example.test/' }, ch: ['two'] }, ' three'] }]);
});

for (const width of [390, 1280]) {
  test(`top toolbars stay inside their own editors at viewport width ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await setup(page, { width: 354 });
    await page.evaluate(async (entry) => {
      const api = await import(/* @vite-ignore */ entry);
      const app = document.getElementById('compact-editor')!;
      app.style.marginTop = '200px';
      document.getElementById('compact-surface')!.style.minHeight = '1200px';
      const second = document.createElement('div');
      second.className = 'nabi';
      second.id = 'second-editor';
      second.style.cssText = 'width:354px;max-width:100%;margin-top:200px';
      second.innerHTML =
        '<div id="second-chrome" class="nabi-toolbar"><div id="second-toolbar"></div></div><div id="second-surface" class="nabi-content" style="min-height:1200px"></div>';
      app.after(second);
      const spacer = document.createElement('div');
      spacer.style.height = '900px';
      second.after(spacer);
      const { nabi, registry } = api.createNabiWith(api.defaultWings, {
        doc: [{ w: 'p', ch: ['second editor'] }],
      });
      const surfaceRoot = document.getElementById('second-surface')!;
      const surface = api.mountSurface({ nabi, registry, root: surfaceRoot });
      const toolbar = api.mountToolbar({
        nabi,
        registry,
        root: document.getElementById('second-toolbar')!,
        surface: surfaceRoot,
      });
      const state = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      const dispose = state.dispose;
      state.dispose = () => {
        toolbar.unmount();
        surface.unmount();
        dispose();
      };
    }, entry);
    const chrome = page.locator('#compact-chrome');
    const surface = page.locator('#compact-surface');
    await surface.evaluate((el) => el.focus({ preventScroll: true }));
    await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(200, 0);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(async () => (await chrome.boundingBox())!.y).toBeCloseTo(0, 0);
    const pastFirst = await page.locator('#compact-editor').evaluate((el) => {
      return window.scrollY + el.getBoundingClientRect().bottom + 60;
    });
    await page.evaluate((top) => window.scrollTo(0, top), pastFirst);
    await expect(chrome).not.toBeInViewport();
    await expect(surface).toBeFocused();
    if (width < 576) {
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.locator('#compact-toolbar [data-name="tools"]').click();
      const panel = page.locator('#compact-toolbar .nabi-toolbox');
      await expect(panel).toBeVisible();
      await page.evaluate((top) => window.scrollTo(0, top), pastFirst);
      await expect(chrome).not.toBeInViewport();
      await expect(panel).toBeHidden();
    }
    await page.locator('#second-surface').evaluate((el) => el.focus({ preventScroll: true }));
    const second = page.locator('#second-editor');
    await second.evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top + 200));
    await expect.poll(async () => (await page.locator('#second-chrome').boundingBox())!.y).toBeCloseTo(0, 0);
    await expect(chrome).not.toBeInViewport();
    await second.evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().bottom + 60));
    await expect(page.locator('#second-chrome')).not.toBeInViewport();
    await expect(page.locator('[data-nabi-docked], .nabi-dock-placeholder')).toHaveCount(0);
  });
}

test('mobile toolbox remains in the viewport when its editor starts near the bottom', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354 });
  await page.locator('#compact-editor').evaluate((el) => {
    el.style.marginTop = '650px';
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeVisible();
  const box = (await panel.boundingBox())!;
  const chrome = (await page.locator('#compact-chrome').boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(chrome.y + 1);
});

test('mobile panels stay open when a panned viewport uses visual-origin client coordinates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354, mockViewport: true });
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      const box = original.call(this);
      if (this.style.position === 'fixed' && this.style.top === '0px')
        return new DOMRect(box.x, -viewport.offsetTop, box.width, box.height);
      return box;
    };
    viewport.offsetTop = 200;
    viewport.dispatchEvent(new Event('scroll'));
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeVisible();
  expect((await panel.boundingBox())!.y).toBeCloseTo(36, 0);
  await page.locator('.nabi-toolbox [data-name="a"]').click();
  const input = panel.locator('.nabi-prompt input');
  await expect(input).toBeFocused();
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 540;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect(input).toBeFocused();
  await expect(panel).toBeVisible();
  expect((await panel.boundingBox())!.y).toBeCloseTo(0, 0);
});

test('larger root text keeps the compact row and targets proportional without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page, { width: 320 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(45, 0);
  await expect
    .poll(async () =>
      bar.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        return [...el.querySelectorAll<HTMLButtonElement>('button')]
          .filter((button) => button.getClientRects().length > 0)
          .every((button) => {
            const rect = button.getBoundingClientRect();
            return rect.height >= 39 && rect.width >= 39 && rect.right <= bounds.right + 1;
          });
      }),
    )
    .toBe(true);
});

async function doubleShift(page: Page): Promise<void> {
  await page.keyboard.press('Shift');
  await page.keyboard.press('Shift');
}

const paletteButtons = '.nabi-toolbox-group > button:visible:not(:disabled)';

async function verticalTarget(page: Page, step: number, root = '.nabi-toolbox:visible'): Promise<number> {
  return page.locator(root).evaluate((panel, step) => {
    const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button')].filter(
      (button) => !button.disabled && button.getClientRects().length > 0,
    );
    const cells = buttons.map((button) => ({
      button,
      box: button.getBoundingClientRect(),
    }));
    const current = cells.find((cell) => cell.button === document.activeElement)!;
    const rows: (typeof cells)[] = [];
    for (const cell of [...cells].sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left)) {
      const row = rows.find((row) => Math.abs(row[0]!.box.top - cell.box.top) < 2);
      if (row) row.push(cell);
      else rows.push([cell]);
    }
    const at = rows.findIndex((row) => row.includes(current));
    const targetRow = rows[(at + step + rows.length) % rows.length]!;
    const x = current.box.left + current.box.width / 2;
    const target = [...targetRow].sort(
      (a, b) => Math.abs(a.box.left + a.box.width / 2 - x) - Math.abs(b.box.left + b.box.width / 2 - x),
    )[0]!;
    return buttons.indexOf(target.button);
  }, step);
}

for (const width of [1280, 390]) {
  test(`automatic properties support group and arrow navigation without editing the document at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page, { width: 320 });
    const before = await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([
        { w: 'p', ch: [{ w: 'tc', a: { c: 'green' }, ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['one two three'] }] }] },
      ]);
      document.getElementById('compact-surface')!.focus();
      nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } });
      return nabi.getJson();
    });
    const properties = page.locator('#compact-context');
    const navigationRoot = width < 576 ? '#compact-context' : '#compact-chrome';
    const buttons = page.locator(navigationRoot).locator('button:visible:not(:disabled)');
    const propertyButtons = properties.locator('.nabi-ctx-group > button:visible');
    const starts = await properties
      .locator('.nabi-ctx-group')
      .evaluateAll((groups) => groups.map((group) => group.querySelector<HTMLButtonElement>('button')!.dataset.name!));

    expect(starts.length).toBe(2);
    await propertyButtons.first().focus();
    await page.keyboard.press('Tab');
    await expect(properties.locator(`[data-name="${starts[1]}"]`)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(propertyButtons.first()).toBeFocused();
    await buttons.first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(buttons.last()).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(buttons.first()).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(buttons.nth(1)).toBeFocused();
    for (const step of [1, 1, -1]) {
      const target = await verticalTarget(page, step, navigationRoot);
      await page.keyboard.press(step > 0 ? 'ArrowDown' : 'ArrowUp');
      await expect(buttons.nth(target)).toBeFocused();
    }
    await propertyButtons.first().focus();
    for (const key of ['b', 'Backspace', 'Delete']) {
      await page.keyboard.press(key);
      expect(
        await page.evaluate(() => (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.getJson()),
        `${key} in properties does not edit the preserved selection`,
      ).toEqual(before);
    }
    await expect(page.locator('#compact-surface')).not.toBeFocused();
    await expect(page.locator('.nabi-toolbox')).toBeHidden();
  });
}

test('clicking the same property prompt control twice closes it and keeps the row available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page);
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.setJson([{ w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['const value = 1;'] }] }]);
    nabi.select({ anchor: { path: [0, 0], offset: 2 }, focus: { path: [0, 0], offset: 2 } });
  });
  const properties = page.locator('#compact-context');
  const trigger = properties.locator('[data-name="lang"]');
  const panel = page.locator('.nabi-toolbox');
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(panel.locator('.nabi-prompt input')).toHaveValue('ts');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.click();
  await expect(panel).toBeHidden();
  await expect(properties).toBeVisible();
  await expect(trigger).not.toHaveAttribute('aria-expanded', 'true');
  await trigger.click();
  await expect(panel.locator('.nabi-prompt input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(properties).toBeVisible();
});

test('double Shift opens every icon group and Tab cycles group starts without letter shortcuts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page);
  await page.locator('#compact-surface').click();
  await doubleShift(page);
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.nabi-toolbox-tabs, .nabi-toolbox-label, [data-hint]')).toHaveCount(0);
  const starts = await panel
    .locator('.nabi-toolbox-group')
    .evaluateAll((groups) =>
      groups
        .map(
          (group) =>
            [...group.querySelectorAll<HTMLButtonElement>('button')].find(
              (button) => !button.disabled && button.getClientRects().length > 0,
            )?.dataset.name,
        )
        .filter((name): name is string => !!name),
    );
  expect(starts.length).toBeGreaterThan(4);
  await expect(panel.locator(`[data-name="${starts[0]}"]`)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.locator(`[data-name="${starts[1]}"]`)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.locator(`[data-name="${starts[0]}"]`)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.locator(`[data-name="${starts.at(-1)}"]`)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.locator(`[data-name="${starts[0]}"]`)).toBeFocused();
  for (const key of ['b', 'Backspace', 'Delete']) {
    await page.keyboard.press(key);
    expect(
      await page.evaluate(() => (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.getJson()),
      `${key} in the palette does not edit the preserved document selection`,
    ).toEqual([{ w: 'p', ch: ['one two three'] }]);
  }
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
});

test('palette arrows wrap through commands and follow the nearest column of visual rows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page, { width: 320 });
  await page.locator('#compact-surface').click();
  await doubleShift(page);
  const panel = page.locator('.nabi-toolbox');
  const buttons = panel.locator(paletteButtons);
  const names = await buttons.evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.name!));
  await expect(buttons.first()).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(panel.locator(`[data-name="${names.at(-1)}"]`)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(buttons.first()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(panel.locator(`[data-name="${names[1]}"]`)).toBeFocused();
  for (const step of [-1, 1, 1, 1, -1]) {
    const target = await verticalTarget(page, step);
    await page.keyboard.press(step < 0 ? 'ArrowUp' : 'ArrowDown');
    await expect(buttons.nth(target)).toBeFocused();
  }
});

for (const activation of ['Enter', 'Space']) {
  test(`keyboard palette ${activation} applies a custom command once to the saved selection`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await setup(page);
    await page.locator('#compact-surface').click();
    await page.evaluate(() => {
      (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.select({
        anchor: { path: [0], offset: 4 },
        focus: { path: [0], offset: 7 },
      });
    });
    await doubleShift(page);
    const panel = page.locator('.nabi-toolbox');
    const groupAt = await panel
      .locator('.nabi-toolbox-group')
      .evaluateAll((groups) => groups.findIndex((group) => group.getAttribute('data-group') === 'custom'));
    expect(groupAt).toBeGreaterThanOrEqual(0);
    for (let index = 0; index < groupAt; index += 1) await page.keyboard.press('Tab');
    await expect(panel.locator('[data-name="exCompactBrowserMark:apply"]')).toBeFocused();
    await page.keyboard.press(activation);
    expect(
      await page.evaluate(() => {
        const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
        return { doc: nabi.getJson(), selection: nabi.getSelection(), undone: nabi.undo(), restored: nabi.getJson() };
      }),
    ).toEqual({
      doc: [{ w: 'p', ch: ['one ', { w: 'exCompactBrowserMark', ch: ['two'] }, ' three'] }],
      selection: { anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } },
      undone: true,
      restored: [{ w: 'p', ch: ['one two three'] }],
    });
  });
}

test('double Shift ignores active composition and prompt fields', async ({ page }) => {
  await setup(page);
  await page.locator('#compact-surface').click();
  await page.locator('#compact-surface').dispatchEvent('compositionstart');
  await doubleShift(page);
  await expect(page.locator('.nabi-toolbox')).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
  await page.locator('#compact-surface').dispatchEvent('compositionend', { data: '' });
  await doubleShift(page);
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeVisible();
  await panel.locator('[data-name="a"]').click();
  const input = panel.locator('.nabi-prompt input');
  await input.fill('https://example.test/draft');
  await doubleShift(page);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('https://example.test/draft');
  await expect(panel.locator('.nabi-toolbox-group')).toHaveCount(0);
});

test('double Shift routes between two editors without leaving another palette open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await setup(page);
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const root = document.createElement('section');
    root.className = 'nabi';
    root.style.cssText = 'position:relative;margin-top:300px;width:354px;';
    root.innerHTML =
      '<div id="second-chrome" class="nabi-toolbar"><div id="second-toolbar"></div></div><div id="second-surface" class="nabi-content"></div>';
    document.body.append(root);
    const surface = document.getElementById('second-surface')!;
    const editor = api.createNabiWith(api.defaultWings, { doc: [{ w: 'p', ch: ['second editor'] }] });
    api.mountSurface({ ...editor, root: surface });
    const toolbar = api.mountToolbar({ ...editor, surface, root: document.getElementById('second-toolbar')! });
    api.mountHints({ toolbar, surface, root: document.getElementById('second-chrome')! });
  }, entry);
  const first = page.locator('#compact-toolbar .nabi-toolbox');
  const second = page.locator('#second-toolbar .nabi-toolbox');
  await page.locator('#compact-surface').click();
  await doubleShift(page);
  await expect(first).toBeVisible();
  await expect(second).toBeHidden();
  await page.locator('#second-surface').click();
  await expect(first).toBeHidden();
  await doubleShift(page);
  await expect(second).toBeVisible();
  await expect(first).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#second-surface')).toBeFocused();
  await expect(second).toBeHidden();
  await page.locator('#compact-surface').click();
  await doubleShift(page);
  await expect(first).toBeVisible();
  await expect(second).toBeHidden();
});
