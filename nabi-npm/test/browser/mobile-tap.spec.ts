import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

type Target = 'quick' | 'palette' | 'swatch' | 'prompt';
interface TapEvent {
  readonly type: string;
  readonly [key: string]: unknown;
}
interface TapState {
  readonly nabi: Nabi;
  readonly events: TapEvent[];
}

async function setup(page: Page, target: Target): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    async ({ entry, target }) => {
      const api = await import(/* @vite-ignore */ entry);
      document.documentElement.style.fontSize = '16px';
      document.body.style.cssText = 'margin:0;padding:0;min-height:1200px';
      document.body.innerHTML =
        '<div id="tap-editor" class="nabi"><div id="tap-chrome" class="nabi-toolbar"><div id="tap-toolbar"></div><div id="tap-context"></div></div><div id="tap-surface" class="nabi-content"></div></div>';
      const doc =
        target === 'swatch'
          ? [{ w: 'p', ch: [{ w: 'tc', a: { c: 'green' }, ch: ['one two three'] }] }]
          : target === 'prompt'
            ? [{ w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['one two three'] }] }]
            : [{ w: 'p', ch: ['one two three'] }];
      const { nabi, registry } = api.createNabiWith(api.defaultWings, { doc });
      api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      const surface = document.getElementById('tap-surface')!;
      const common = { nabi, registry, surface };
      api.mountSurface({ ...common, root: surface });
      api.mountToolbar({ ...common, root: document.getElementById('tap-toolbar')! });
      api.mountContextToolbar({ ...common, root: document.getElementById('tap-context')! });
      api.mountSticky({
        nabi,
        root: document.getElementById('tap-editor')!,
        chrome: document.getElementById('tap-chrome')!,
        surface,
      });
      const events: TapEvent[] = [];
      const describe = (target: EventTarget | null): string | null => {
        const el = target instanceof Element ? target : null;
        return el?.closest<HTMLElement>('[data-name]')?.dataset.name ?? el?.id ?? el?.nodeName ?? null;
      };
      for (const type of [
        'pointerdown',
        'pointerup',
        'pointercancel',
        'touchstart',
        'touchend',
        'mousedown',
        'mouseup',
        'click',
        'focusin',
        'focusout',
        'selectionchange',
      ]) {
        document.addEventListener(type, (event) =>
          events.push({
            type,
            target: describe(event.target),
            active: describe(document.activeElement),
            prevented: event.defaultPrevented,
            selection: nabi.getSelection(),
            time: Math.round(performance.now()),
          }),
        );
      }
      for (const [name, emitter] of [
        ['window', window],
        ['viewport', window.visualViewport],
      ] as const) {
        emitter?.addEventListener('resize', () =>
          events.push({
            type: `${name}:resize`,
            height: window.innerHeight,
            visualHeight: window.visualViewport?.height,
            time: Math.round(performance.now()),
          }),
        );
      }
      nabi.onChange(() =>
        events.push({
          type: 'change',
          doc: nabi.getJson(),
          selection: nabi.getSelection(),
          time: Math.round(performance.now()),
        }),
      );
      (globalThis as unknown as { mobileTapTest: TapState }).mobileTapTest = { nabi, events };
      surface.focus({ preventScroll: true });
      const path = target === 'prompt' ? [0, 0] : [0];
      nabi.select({ anchor: { path, offset: 4 }, focus: { path, offset: 7 } });
    },
    { entry, target },
  );
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

async function tap(page: Page, selector: string): Promise<void> {
  const box = (await page.locator(selector).boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

const selectorFor = (target: Target): string =>
  ({
    quick: '#tap-toolbar .nabi-compact-quick [data-name="b"]',
    palette: '.nabi-toolbox [data-name="b"]',
    swatch: '#tap-context [data-name="color:coral"]',
    prompt: '#tap-context [data-name="lang"]',
  })[target];

async function applied(page: Page, target: Target): Promise<void> {
  if (target === 'prompt') await expect(page.locator('.nabi-prompt input')).toBeVisible();
  else if (target === 'swatch')
    await expect(page.locator('#tap-context [data-name="color:coral"]')).toHaveAttribute('aria-pressed', 'true');
  else await expect(page.locator('#tap-surface b')).toHaveText('two');
}

// 실제 iOS 선택 메뉴 대신 터치 이벤트 경로를 검증한다.
// This verifies touch dispatch, not the native iOS selection callout.
test.describe('iOS touch dispatch', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 Version/26.2 Mobile/15E148 Safari/604.1',
  });
  for (const target of ['quick', 'palette', 'swatch', 'prompt'] as const) {
    test(`the first touch applies ${target}`, async ({ page }) => {
      await setup(page, target);
      if (target === 'palette') await tap(page, '#tap-toolbar [data-name="tools"]');
      await tap(page, selectorFor(target));
      await test.info().attach('touch-events', {
        body: JSON.stringify(
          await page.evaluate(() => (globalThis as unknown as { mobileTapTest: TapState }).mobileTapTest.events),
          null,
          2,
        ),
        contentType: 'application/json',
      });
      await applied(page, target);
      const events = await page.evaluate(
        () => (globalThis as unknown as { mobileTapTest: TapState }).mobileTapTest.events,
      );
      expect(events.filter((event) => event.type === 'click')).toEqual([]);
      expect(events.some((event) => event.type === 'touchend' && event.prevented === true)).toBe(true);
    });
  }
});

for (const target of ['quick', 'palette'] as const) {
  test(`the first ${target} touch survives resize during its synthesized mouse event`, async ({ page }) => {
    await setup(page, target);
    if (target === 'palette') await tap(page, '#tap-toolbar [data-name="tools"]');
    await page.locator(selectorFor(target)).evaluate((button) => {
      button.addEventListener('mousedown', () => window.dispatchEvent(new Event('resize')), { once: true });
    });
    await tap(page, selectorFor(target));
    const firstApplied = await page
      .locator('#tap-surface')
      .evaluate((surface) => surface.querySelector('b')?.textContent === 'two');
    const firstEvents = await page.evaluate(
      () => (globalThis as unknown as { mobileTapTest: TapState }).mobileTapTest.events,
    );
    let secondApplied: boolean | undefined;
    if (!firstApplied) {
      await tap(page, selectorFor(target));
      secondApplied = await page
        .locator('#tap-surface')
        .evaluate((surface) => surface.querySelector('b')?.textContent === 'two');
    }
    await test
      .info()
      .attach('touch-events', { body: JSON.stringify(firstEvents, null, 2), contentType: 'application/json' });
    expect(firstApplied, `first tap applies ${target}; second tap result: ${secondApplied}`).toBe(true);
  });
}
