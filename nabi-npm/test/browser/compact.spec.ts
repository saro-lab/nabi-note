import { expect, test, type Page } from '@playwright/test';
import type { ContextToolbar, LocaleController, Nabi, Toolbar } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

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

test('default quick and context modes keep one 48px bar in a narrow desktop editor', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page);
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  await expect(bar).toBeVisible();
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(48, 0);
  const initial = await page.locator('#compact-chrome').boundingBox();
  expect(initial!.height).toBeLessThanOrEqual(49);
  await expect(page.locator('#compact-chrome')).not.toHaveAttribute('data-nabi-docked', 'true');
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.setJson([
      {
        w: 'img',
        a: { src: '/nabi-note.svg', alt: 'sample' },
      },
    ]);
  });
  await expect(page.locator('#compact-toolbar .nabi-compact-context')).toBeVisible();
  await expect(page.locator('#compact-toolbar [data-name="tools"]')).toBeVisible();
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(48, 0);
  expect((await page.locator('#compact-chrome').boundingBox())!.height).toBeLessThanOrEqual(49);
});

test('object properties appears beside tools only for overflow and unfolds live controls after resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { width: 1000 });
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.setJson([{ w: 'img', a: { src: '/nabi-note.svg', alt: 'sample' } }]);
  });
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  const tools = bar.locator('[data-name="tools"]');
  const more = bar.locator('[data-name="context-tools"]');
  const panel = page.locator('.nabi-toolbox');
  await expect(more).toBeHidden();
  await expect(bar.locator('.nabi-compact-context input[type="range"]')).toBeVisible();
  await expect(bar.locator('.nabi-compact-context [data-name="view"]')).toBeVisible();
  await page.locator('#compact-editor').evaluate((el) => {
    el.style.width = '320px';
  });
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute('aria-label', 'Object properties');
  expect(await tools.evaluate((el) => el.nextElementSibling?.getAttribute('data-name'))).toBe('context-tools');
  const entryBounds = (await tools.boundingBox())!;
  const moreBounds = (await more.boundingBox())!;
  expect(moreBounds.x - entryBounds.x - entryBounds.width).toBeGreaterThanOrEqual(0);
  expect(moreBounds.x - entryBounds.x - entryBounds.width).toBeLessThanOrEqual(4);
  const folded = await page.evaluate(() => {
    const { context } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    return context
      .groups()
      .flatMap((group) => [...group.el.children])
      .some((node) => (node as HTMLElement).hidden);
  });
  expect(folded).toBe(true);
  await more.click();
  await expect(panel).toBeVisible();
  await expect(panel.locator('input[type="range"]')).toBeVisible();
  await expect(panel.locator('[data-name="view"]')).toBeVisible();
  await page.evaluate(() => {
    (globalThis as unknown as { compactTest: BrowserState }).compactTest.locale.setLocale('ko');
  });
  await expect(more).toHaveAttribute('aria-label', '객체 속성');
  await expect(panel.locator('input[type="range"]')).toBeVisible();
  await expect(panel.locator('[data-name="view"]')).toBeVisible();
  await panel.locator('[data-name="view"]').focus();
  await page.locator('#compact-editor').evaluate((el) => {
    el.style.width = '1000px';
  });
  await expect(more).toBeHidden();
  await expect(panel).toBeHidden();
  await expect(bar.locator('.nabi-compact-context input[type="range"]')).toBeVisible();
  await expect(bar.locator('.nabi-compact-context [data-name="view"]')).toBeVisible();
  await expect(bar.locator('.nabi-compact-context [data-name="view"]')).toBeFocused();
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(48, 0);
});

test('all-tools exposes a custom wing and its real click preserves the selected range', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { quick: ['b'] });
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 7 } });
    document.getElementById('compact-surface')!.focus();
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
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

test('resizing folds quick tools without horizontal overflow or losing command nodes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { width: 800, quick: ['b', 'i', 'u', 's', 'tc', 'hl', 'fs', 'tf', 'exCompactBrowserMark:apply'] });
  for (const width of [800, 532, 390, 320]) {
    await page.locator('#compact-editor').evaluate((el, width) => {
      el.style.width = `${width}px`;
    }, width);
    await expect.poll(async () => (await page.locator('#compact-editor').boundingBox())!.width).toBeCloseTo(width, 0);
    const bar = page.locator('#compact-toolbar .nabi-compact-bar');
    await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(48, 0);
    await expect
      .poll(async () =>
        bar.evaluate((el) => {
          const bounds = el.getBoundingClientRect();
          return [...el.querySelectorAll<HTMLButtonElement>('button')]
            .filter((button) => button.getClientRects().length > 0)
            .flatMap((button) => {
              const rect = button.getBoundingClientRect();
              return rect.left >= bounds.left - 1 &&
                rect.right <= bounds.right + 1 &&
                rect.width >= 43 &&
                rect.height >= 43
                ? []
                : [
                    {
                      name: button.dataset.name,
                      width: rect.width,
                      height: rect.height,
                      left: rect.left,
                      right: rect.right,
                      barLeft: bounds.left,
                      barRight: bounds.right,
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
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  await expect(page.locator('.nabi-toolbox [data-name="exCompactBrowserMark:apply"]')).toBeVisible();
});

test('open toolbox updates locale and direction without replacing the document or source buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
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
    const bold = bar.locator('[data-name="b"]');
    const boldLabel = await bold.getAttribute('aria-label');
    await bold.hover();
    await expectTooltip(page, `${boldLabel} (Ctrl/Cmd+B)`);
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-toolbar.png` });
    await page.mouse.move(width - 10, 600);
    await expect(tooltip).toHaveCount(0);

    const tools = bar.locator('[data-name="tools"]');
    await tools.hover();
    const toolsMetrics = await expectTooltip(page, 'Tools (Shift Shift)');
    console.log('tooltip metrics', JSON.stringify({ browserName, target: 'tools', ...toolsMetrics }));
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-tools.png` });
    await tools.click();
    await expect(tooltip).toHaveCount(0);
    const panel = page.locator('.nabi-toolbox');
    const clear = panel.locator('[data-name="clearFormat"]');
    const clearLabel = await clear.getAttribute('aria-label');
    await clear.hover();
    await expectTooltip(page, `${clearLabel} (Esc Esc)`);
    await clear.click();
    await expect(tooltip).toHaveCount(0);
    await tools.click();
    await expect(panel).toBeHidden();

    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
      nabi.setJson([
        { w: 'p', ch: [{ w: 'tc', a: { c: 'green' }, ch: [{ w: 'hl', a: { c: 'yellow' }, ch: ['one two three'] }] }] },
      ]);
      nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    });
    await bar.locator('[data-name="context-tools"]').click();
    const swatch = panel.locator('.nabi-swatch:not(.on)').first();
    await expect(swatch).toBeVisible();
    const swatchLabel = await swatch.getAttribute('aria-label');
    await swatch.hover();
    const swatchMetrics = await expectTooltip(page, swatchLabel!);
    console.log('tooltip metrics', JSON.stringify({ browserName, target: 'swatch', ...swatchMetrics }));
    await expect(swatch).not.toHaveClass(/\bon\b/);
    await page.screenshot({ path: `/private/tmp/nabi-tooltip-${browserName}-${width}-colors.png` });
    await tools.click();
    const custom = panel.locator('[data-name="exCompactBrowserMark:apply"]');
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
  await page.setViewportSize({ width: 800, height: 280 });
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

test('mobile dock waits for the simulated keyboard to close before replacing its space with tools', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, { width: 354, mockViewport: true });
  await page.locator('#compact-surface').click();
  const chrome = page.locator('#compact-chrome');
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  await expect(chrome).toHaveAttribute('data-nabi-docked', 'true');
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 540;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => {
      const box = (await bar.boundingBox())!;
      return box.y + box.height;
    })
    .toBeCloseTo(540, 0);
  const before = await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { compactTest: BrowserState }).compactTest;
    return { doc: nabi.getJson(), selection: nabi.getSelection() };
  });
  await page.locator('#compact-toolbar [data-name="tools"]').click();
  const panel = page.locator('.nabi-toolbox');
  await expect(panel).toBeHidden();
  await page.evaluate(() => {
    const viewport = (globalThis as unknown as { compactTest: BrowserState }).compactTest.viewport!;
    viewport.height = 844;
    viewport.dispatchEvent(new Event('resize'));
  });
  await expect(panel).toBeVisible();
  const toolBox = (await panel.boundingBox())!;
  const commandBox = (await bar.boundingBox())!;
  expect(commandBox.height).toBeCloseTo(48, 0);
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

test('mobile URL input replaces the command row and stays above the simulated keyboard', async ({ page }) => {
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
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeCloseTo(48, 0);
  await expect
    .poll(async () => {
      const box = (await panel.boundingBox())!;
      return box.y + box.height;
    })
    .toBeCloseTo(540, 0);
  await expect(page.locator('.nabi-toolbox:visible')).toHaveCount(1);
  await input.fill('https://example.test');
  await input.press('Enter');
  await expect(panel).toBeHidden();
  await expect(page.locator('#compact-surface')).toBeFocused();
  expect(
    await page.evaluate(() => (globalThis as unknown as { compactTest: BrowserState }).compactTest.nabi.getJson()),
  ).toEqual([{ w: 'p', ch: ['one ', { w: 'a', a: { href: 'https://example.test/' }, ch: ['two'] }, ' three'] }]);
});

test('larger root text keeps the compact row and targets proportional without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page, { width: 320 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });
  const bar = page.locator('#compact-toolbar .nabi-compact-bar');
  await expect.poll(async () => (await bar.boundingBox())!.height).toBeCloseTo(60, 0);
  await expect
    .poll(async () =>
      bar.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        return [...el.querySelectorAll<HTMLButtonElement>('button')]
          .filter((button) => button.getClientRects().length > 0)
          .every((button) => {
            const rect = button.getBoundingClientRect();
            return rect.height >= 54 && rect.width >= 54 && rect.right <= bounds.right + 1;
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

async function verticalTarget(page: Page, step: number): Promise<string> {
  return page.locator('.nabi-toolbox:visible').evaluate((panel, step) => {
    const buttons = [...panel.querySelectorAll<HTMLButtonElement>('.nabi-toolbox-group > button')].filter(
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
    return target.button.dataset.name!;
  }, step);
}

test('double Shift opens every icon group and Tab cycles group starts without letter shortcuts', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
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
  await page.setViewportSize({ width: 1280, height: 900 });
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
    const name = await verticalTarget(page, step);
    await page.keyboard.press(step < 0 ? 'ArrowUp' : 'ArrowDown');
    await expect(panel.locator(`[data-name="${name}"]`)).toBeFocused();
  }
});

for (const activation of ['Enter', 'Space']) {
  test(`keyboard palette ${activation} applies a custom command once to the saved selection`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
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
  await page.setViewportSize({ width: 1280, height: 900 });
  await setup(page);
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const root = document.createElement('section');
    root.className = 'nabi';
    root.style.cssText = 'position:absolute;top:0;left:650px;width:532px;';
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
