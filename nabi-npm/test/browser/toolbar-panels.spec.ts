import { expect, test, type Locator, type Page } from '@playwright/test';
import type { Nabi, Toolbar, ToolbarPanelContext } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

interface PanelState {
  readonly nabi: Nabi;
  readonly toolbar: Toolbar;
  readonly originalImage: HTMLButtonElement;
  readonly events: string[];
  readonly results: boolean[];
  current: ToolbarPanelContext | null;
}

async function setup(page: Page, custom = true, mode?: 'modal' | 'inline'): Promise<void> {
  await page.route('**/owned.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="blue"/></svg>',
    }),
  );
  await page.goto('/');
  await page.evaluate(
    async ({ entry, custom, mode }) => {
      const api = await import(/* @vite-ignore */ entry);
      document.documentElement.style.fontSize = '16px';
      document.body.style.cssText = 'margin:0;padding:0;min-height:1200px';
      document.body.innerHTML =
        '<div id="panel-editor" class="nabi" style="width:960px;max-width:100%">' +
        '<div id="panel-chrome" class="nabi-toolbar"><div id="panel-toolbar"></div><div id="panel-context"></div><div id="panel-views"></div></div>' +
        '<div id="panel-surface" class="nabi-content"></div></div>' +
        '<button id="outside-panel" style="position:fixed;bottom:12px;right:12px">Outside</button>';
      const { nabi, registry } = api.createNabiWith(api.defaultWings, {
        locale: 'en',
        doc: [
          { w: 'p', ch: ['one two three'] },
          { w: 'p', ch: ['another paragraph'] },
        ],
      });
      api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      const surface = document.getElementById('panel-surface')!;
      const common = { nabi, registry, locale: 'en', surface };
      api.mountSurface({ ...common, root: surface });
      const root = document.getElementById('panel-toolbar')!;
      root.innerHTML = api.renderToolbarHtml({ registry, locale: 'en', quick: ['b'] });
      const originalImage = root.querySelector<HTMLButtonElement>('[data-name="img"]')!;
      const events: string[] = [];
      const results: boolean[] = [];
      let opened = 0;
      const render = (context: ToolbarPanelContext): (() => void) => {
        const id = ++opened;
        events.push(`open:${id}`);
        (globalThis as unknown as { panelTest: PanelState }).panelTest.current = context;
        const { root, signal } = context;
        root.dataset.testid = 'recent-images';
        root.style.cssText = 'width:300px;max-width:100%;display:grid;gap:8px;box-sizing:border-box';
        root.innerHTML =
          '<h3 style="margin:0;font:inherit">Recent images</h3>' +
          '<input aria-label="Search recent images" style="width:100%;height:32px;box-sizing:border-box;font-size:16px">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
          '<button data-testid="owned-image" type="button" tabindex="0" style="min-height:44px">Owned image</button>' +
          '<button data-testid="other-image" type="button" tabindex="0" style="min-height:44px">Other image</button></div>' +
          '<div data-testid="extra-results"></div>' +
          '<button data-testid="close-images" type="button" tabindex="0" style="min-height:28px">Close images</button>';
        root.querySelector('[data-testid="owned-image"]')!.addEventListener('click', () => {
          results.push(context.insertImage('/owned.svg', 'pointer'));
        });
        root.querySelector('[data-testid="other-image"]')!.addEventListener('click', () => {
          results.push(context.run('insertImage', { src: '/other.svg' }, 'pointer'));
        });
        root.querySelector('[data-testid="close-images"]')!.addEventListener('click', context.close);
        signal.addEventListener('abort', () => events.push(`abort:${id}`), { once: true });
        context.onDispose(() => events.push(`dispose:${id}`));
        root.querySelector('input')!.focus({ preventScroll: true });
        return () => events.push(`returned:${id}`);
      };
      const toolbar = api.mountToolbar({
        ...common,
        root,
        quick: ['b'],
        ...(custom ? { panels: { img: mode ? { mode, render } : render } } : {}),
      });
      api.mountContextToolbar({ ...common, root: document.getElementById('panel-context')! });
      api.mountViewTools({
        ...common,
        root: document.getElementById('panel-editor')!,
        container: document.getElementById('panel-views')!,
      });
      (globalThis as unknown as { panelTest: PanelState }).panelTest = {
        nabi,
        toolbar,
        originalImage,
        events,
        results,
        current: null,
      };
      surface.focus({ preventScroll: true });
      nabi.select({ anchor: { path: [0], offset: 3 }, focus: { path: [0], offset: 3 } });
    },
    { entry, custom, mode },
  );
}

async function activate(locator: Locator, mobile: boolean): Promise<void> {
  if (mobile) await locator.tap();
  else await locator.click();
}

async function openImages(page: Page, mobile: boolean): Promise<void> {
  const tools = page.locator('#panel-toolbar [data-name="tools"]');
  if (await tools.isVisible()) {
    await activate(tools, mobile);
    await activate(page.locator('.nabi-toolbox-icons [data-name="img"]'), mobile);
  } else await activate(page.locator('#panel-toolbar .nabi-strip [data-name="img"]'), mobile);
}

async function events(page: Page): Promise<string[]> {
  return page.evaluate(() => (globalThis as unknown as { panelTest: PanelState }).panelTest.events);
}

for (const width of [1280, 390]) {
  const mobile = width === 390;
  test.describe(`custom toolbar panels at ${width}px`, () => {
    test.use({
      viewport: { width, height: 844 },
      hasTouch: true,
      ...(mobile
        ? {
            userAgent:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 Version/26.2 Mobile/15E148 Safari/604.1',
          }
        : {}),
    });

    test('the default image URL prompt remains available without a renderer', async ({ page }) => {
      await setup(page, false);
      await openImages(page, mobile);
      await expect(page.locator('.nabi-prompt input')).toBeVisible();
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await expect(page.locator('.nabi-scrim, [inert], [aria-modal="true"]')).toHaveCount(0);
      await page.locator('.nabi-prompt input').fill('/owned.svg');
      await activate(page.locator('.nabi-prompt button'), mobile);
      await expect(page.locator('#panel-surface img')).toHaveAttribute('src', '/owned.svg');
      await expect(page.locator('.nabi-prompt')).toHaveCount(0);
    });

    test('YouTube and link prompts leave the page interactive and dismiss on outside input', async ({ page }) => {
      await setup(page, false);
      await page.evaluate(() => {
        document.getElementById('outside-panel')!.addEventListener('click', () => {
          document.getElementById('outside-panel')!.textContent = 'Clicked';
        });
      });
      for (const name of ['youtube', 'a']) {
        const tools = page.locator('#panel-toolbar [data-name="tools"]');
        if (await tools.isVisible()) await activate(tools, mobile);
        await activate(page.locator(`#panel-toolbar [data-name="${name}"]:visible`), mobile);
        await expect(page.locator('.nabi-prompt input')).toBeFocused();
        await expect(page.locator('.nabi-scrim, [inert], [aria-modal="true"]')).toHaveCount(0);
        await activate(page.locator('#outside-panel'), mobile);
        await expect(page.locator('.nabi-prompt')).toHaveCount(0);
        await expect(page.locator('#outside-panel')).toHaveText('Clicked');
      }
    });

    test('code language properties use a plain panel while preview remains a full modal', async ({ page }) => {
      await setup(page, false);
      await page.evaluate(() => {
        const { nabi } = (globalThis as unknown as { panelTest: PanelState }).panelTest;
        nabi.applyCommand('toggleCode');
      });
      await activate(page.locator('#panel-context [data-name="lang"]'), mobile);
      const input = page.locator('.nabi-prompt input');
      await expect(input).toBeFocused();
      await expect(page.locator('.nabi-scrim, [inert], [aria-modal="true"]')).toHaveCount(0);
      await input.fill('typescript');
      await activate(page.locator('.nabi-prompt button'), mobile);
      await expect(page.locator('.nabi-prompt')).toHaveCount(0);
      await expect(page.locator('#panel-surface [data-nabi-lang="typescript"]')).toBeVisible();
      await activate(page.locator('[data-name="preview"]:visible'), mobile);
      await expect(page.locator('.nabi-scrim')).toBeVisible();
      await expect(page.locator('.nabi-scrim')).toHaveCSS('backdrop-filter', 'blur(3px)');
      await expect(page.locator('.nabi-preview')).toHaveAttribute('aria-modal', 'true');
      await page.keyboard.press('Escape');
      await expect(page.locator('.nabi-scrim')).toHaveCount(0);
    });

    test('inserts an image immediately without changing the opening selection', async ({ page }) => {
      await setup(page);
      await openImages(page, mobile);
      await activate(page.getByTestId('owned-image'), mobile);
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await expect(page.locator('#panel-surface img')).toHaveAttribute('src', '/owned.svg');
      const content = await page.evaluate(() => {
        const state = (globalThis as unknown as { panelTest: PanelState }).panelTest;
        return { html: state.nabi.getHtml(), results: state.results };
      });
      expect(content.results).toEqual([true]);
      expect(content.html.indexOf('one two three')).toBeLessThan(content.html.indexOf('/owned.svg'));
      expect(content.html.indexOf('/owned.svg')).toBeLessThan(content.html.indexOf('another paragraph'));
    });

    test('hydrates one custom panel, preserves search input, and inserts at its opening selection', async ({
      page,
    }) => {
      await setup(page);
      expect(
        await page.evaluate(() => {
          const state = (globalThis as unknown as { panelTest: PanelState }).panelTest;
          return state.originalImage === state.toolbar.buttons.find((button) => button.w === 'img')?.el;
        }),
      ).toBe(true);
      const initial = await page.locator('#panel-surface').innerHTML();
      await openImages(page, mobile);
      const panel = page.locator('.nabi-custom-panel');
      await expect(panel).toBeVisible();
      await expect(page.getByTestId('recent-images')).toHaveCount(1);
      await expect(page.locator('.nabi-prompt')).toHaveCount(0);
      const search = page.getByRole('textbox', { name: 'Search recent images' });
      await expect(search).toBeFocused();
      await search.pressSequentially('recent images b');
      await search.press('Control+b');
      await expect(search).toHaveValue('recent images b');
      await expect(page.locator('#panel-surface')).toHaveJSProperty('innerHTML', initial);
      await search.press('Tab');
      await expect(page.getByTestId('owned-image')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('other-image')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByTestId('owned-image')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(search).toBeFocused();
      await page.getByTestId('owned-image').focus();
      await page.keyboard.press('x');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Delete');
      await expect(page.locator('#panel-surface')).toHaveJSProperty('innerHTML', initial);
      await page.evaluate(() => {
        const { nabi } = (globalThis as unknown as { panelTest: PanelState }).panelTest;
        nabi.select({ anchor: { path: [1], offset: 7 }, focus: { path: [1], offset: 7 } });
      });
      await activate(page.getByTestId('owned-image'), mobile);
      await expect(panel).toHaveCount(0);
      await expect(page.locator('#panel-surface img')).toHaveAttribute('src', '/owned.svg');
      const content = await page.evaluate(() => {
        const state = (globalThis as unknown as { panelTest: PanelState }).panelTest;
        return { html: state.nabi.getHtml(), results: state.results };
      });
      expect(content.results).toEqual([true]);
      expect(content.html.indexOf('one')).toBeLessThan(content.html.indexOf('/owned.svg'));
      expect(content.html.indexOf('two three')).toBeLessThan(content.html.indexOf('/owned.svg'));
      expect(content.html.indexOf('/owned.svg')).toBeLessThan(content.html.indexOf('another paragraph'));
      expect(await events(page)).toEqual(['open:1', 'abort:1', 'returned:1', 'dispose:1']);
    });

    test('resizes for host content and keeps custom controls hit-testable', async ({ page }) => {
      await setup(page);
      await openImages(page, mobile);
      const frame = page.locator(mobile ? '.nabi-toolbox' : '.nabi-custom-panel');
      const before = (await frame.boundingBox())!;
      await page.getByTestId('extra-results').evaluate((element) => {
        element.style.height = '64px';
        element.textContent = 'More recent images are ready';
      });
      await expect.poll(async () => (await frame.boundingBox())!.height).toBeGreaterThan(before.height + 40);
      const bounds = (await frame.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(845);
      const hit = await page.getByTestId('close-images').evaluate((button) => {
        const box = button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
      });
      expect(hit).toBe(true);
      await activate(page.getByTestId('close-images'), mobile);
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      expect(await events(page)).toEqual(['open:1', 'abort:1', 'returned:1', 'dispose:1']);
    });

    test('closes and disposes on Escape, outside interaction, viewport transition, and unmount', async ({ page }) => {
      await setup(page);
      await openImages(page, mobile);
      await page.keyboard.press('Escape');
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await openImages(page, mobile);
      await activate(page.locator('#outside-panel'), mobile);
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await openImages(page, mobile);
      await page.setViewportSize({ width: mobile ? 1280 : 390, height: 844 });
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await openImages(page, mobile);
      await page.evaluate(() => (globalThis as unknown as { panelTest: PanelState }).panelTest.toolbar.unmount());
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      expect(await events(page)).toEqual(
        [1, 2, 3, 4].flatMap((id) => [`open:${id}`, `abort:${id}`, `returned:${id}`, `dispose:${id}`]),
      );
    });

    test('works inside fullscreen and Escape closes the panel before fullscreen', async ({ page }) => {
      await setup(page);
      await activate(page.locator('.nabi-compact-bar [data-name="fullscreen"]'), mobile);
      const editor = page.locator('#panel-editor');
      await expect(editor).toHaveClass(/is-fullscreen/);
      await openImages(page, mobile);
      await expect(page.getByRole('textbox', { name: 'Search recent images' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
      await expect(editor).toHaveClass(/is-fullscreen/);
      await page.locator('#panel-surface').press('Escape');
      await expect(editor).not.toHaveClass(/is-fullscreen/);
      expect(await events(page)).toEqual(['open:1', 'abort:1', 'returned:1', 'dispose:1']);
    });
  });
}

for (const mode of ['modal', 'inline'] as const) {
  for (const width of [1280, 390]) {
    test.describe(`${mode} image panel at ${width}px`, () => {
      test.use({ viewport: { width, height: 844 }, hasTouch: true });
      test('uses the requested frame, traps modal focus, and inserts through the callback', async ({ page }) => {
        await setup(page, true, mode);
        await openImages(page, width === 390);
        const panel = page.locator('.nabi-custom-panel');
        const modal = mode === 'modal' || width === 390;
        await expect(panel).toBeVisible();
        await expect(page.locator('.nabi-scrim')).toHaveCount(modal ? 1 : 0);
        await expect(page.locator('.nabi-prompt')).toHaveCount(0);
        const bounds = (await panel.boundingBox())!;
        if (mode === 'inline' && width === 390) {
          expect(bounds.x).toBe(0);
          expect(bounds.y).toBe(0);
          expect(bounds.width).toBe(width);
          expect(bounds.height).toBe(844);
          await expect(page.locator('.nabi-toolbox')).toBeHidden();
        } else if (mode === 'modal') {
          expect(bounds.x).toBeGreaterThan(0);
          expect(bounds.y).toBeGreaterThan(0);
          await expect(page.locator('.nabi-scrim')).toHaveCSS('backdrop-filter', 'none');
        } else {
          const button = (await page.locator('#panel-toolbar .nabi-strip [data-name="img"]').boundingBox())!;
          expect(bounds.y).toBeGreaterThanOrEqual(button.y + button.height);
        }
        if (modal) {
          await expect(panel).toHaveAttribute('aria-modal', 'true');
          await page.getByTestId('close-images').focus();
          await page.keyboard.press('Tab');
          await expect(page.getByRole('textbox', { name: 'Search recent images' })).toBeFocused();
          await page.keyboard.press('Shift+Tab');
          await expect(page.getByTestId('close-images')).toBeFocused();
        }
        await activate(page.getByTestId('owned-image'), width === 390);
        await expect(panel).toHaveCount(0);
        await expect(page.locator('#panel-surface img')).toHaveAttribute('src', '/owned.svg');
        await expect(page.locator('[inert]')).toHaveCount(0);
        expect(await events(page)).toEqual(['open:1', 'abort:1', 'returned:1', 'dispose:1']);
      });
      test('supports host close and Escape inside editor fullscreen', async ({ page }) => {
        await setup(page, true, mode);
        await openImages(page, width === 390);
        await activate(page.getByTestId('close-images'), width === 390);
        await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
        await activate(page.locator('.nabi-compact-bar [data-name="fullscreen"]'), width === 390);
        await openImages(page, width === 390);
        await page.keyboard.press('Escape');
        await expect(page.locator('.nabi-custom-panel')).toHaveCount(0);
        await expect(page.locator('#panel-editor')).toHaveClass(/is-fullscreen/);
        await expect(page.locator('[inert]')).toHaveCount(0);
      });
    });
  }
}

test('inline mode respects the viewport breakpoint in a narrow wrap toolbar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 844 });
  await setup(page, true, 'inline');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const state = (globalThis as unknown as { panelTest: PanelState }).panelTest;
    state.toolbar.unmount();
    const editor = document.getElementById('panel-editor')!;
    editor.style.width = '360px';
    const registry = api.createNabiWith(api.defaultWings).registry;
    const toolbar = api.mountToolbar({
      nabi: state.nabi,
      registry,
      root: document.getElementById('panel-toolbar')!,
      surface: document.getElementById('panel-surface')!,
      layout: 'wrap',
      panels: {
        img: {
          mode: 'inline',
          render(context: ToolbarPanelContext) {
            state.current = context;
          },
        },
      },
    });
    toolbar.buttons.find((button: { w: string }) => button.w === 'img')!.press();
    Object.assign(state, { toolbar });
  }, entry);
  const panel = page.locator('.nabi-custom-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('position', 'absolute');
  await expect(page.locator('.nabi-scrim')).toHaveCount(0);
  expect((await panel.boundingBox())!.height).toBeGreaterThan(100);
  await page.locator('#panel-editor').evaluate((editor) => {
    editor.style.setProperty('--nabi-mobile-breakpoint', '1400px');
  });
  await expect(panel).toHaveCount(0);
  await page.evaluate(() => {
    (globalThis as unknown as { panelTest: PanelState }).panelTest.toolbar.buttons
      .find((button) => button.w === 'img')!
      .press();
  });
  await expect(page.locator('.nabi-custom-fullscreen')).toBeVisible();
  expect((await panel.boundingBox())!.width).toBe(1280);
  await page.setViewportSize({ width: 1440, height: 844 });
  await expect(panel).toHaveCount(0);
  await expect(page.locator('[inert]')).toHaveCount(0);
});
