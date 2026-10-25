import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;
interface CodeState {
  nabi: Nabi;
  copied: string[];
}

async function setup(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    document.body.innerHTML =
      '<div class="nabi"><div id="surface" class="nabi-content"></div><article id="reader" class="nabi-content"></article></div><button id="outside">Outside</button>';
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      locale: 'en',
      doc: [
        {
          w: 'p',
          ch: [
            {
              w: 'code',
              a: { lang: 'typescript' },
              ch: ['  const x = 1;', { w: 'br', ch: [] }, 'console.log(x);', { w: 'br', ch: [] }],
            },
          ],
        },
      ],
    });
    api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
    const surface = document.getElementById('surface')!;
    api.mountSurface({ nabi, registry, root: surface });
    const reader = document.getElementById('reader')!;
    reader.innerHTML = nabi.getHtml();
    viewer.attachViewer(reader);
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => copied.push(text) },
    });
    (globalThis as unknown as { codeTest: CodeState }).codeTest = { nabi, copied };
  }, entry);
}

for (const scope of ['surface', 'reader']) {
  test(`${scope} shows its language and copies exact source on hover`, async ({ page }) => {
    await setup(page);
    const pre = page.locator(`#${scope} pre`);
    const button = pre.locator('.nabi-code-copy');
    await page.locator('#outside').focus();
    await page.mouse.move(0, 0);
    await expect(button).toHaveCSS('opacity', '0');
    const layout = await pre.evaluate((el) => {
      const style = getComputedStyle(el);
      const label = getComputedStyle(el, '::before');
      return {
        paddingTop: parseFloat(style.paddingTop),
        paddingRight: parseFloat(style.paddingRight),
        labelOpacity: label.opacity,
        labelRight: parseFloat(label.right),
        labelTop: parseFloat(label.top),
        labelFontSize: parseFloat(label.fontSize),
        height: el.getBoundingClientRect().height,
      };
    });
    expect(layout.paddingTop).toBeCloseTo(14.4);
    expect(layout.paddingRight).toBe(16);
    expect(layout.labelOpacity).toBe('0.7');
    expect(layout.labelRight).toBeCloseTo(11.2);
    expect(layout.labelTop).toBeCloseTo(6.4);
    expect(layout.labelFontSize).toBeCloseTo(11.2);
    await expect(pre.locator('code')).toHaveCSS('font-size', '12px');
    await expect(pre.locator('code')).toHaveCSS('font-family', /monospace/);
    expect(await pre.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('"typescript"');
    await pre.hover();
    await expect(button).toHaveCSS('opacity', '1');
    expect(await pre.evaluate((el) => getComputedStyle(el, '::before').opacity)).toBe('0');
    expect(await pre.evaluate((el) => el.getBoundingClientRect().height)).toBe(layout.height);
    const before = await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
      return { json: nabi.getJson(), selection: nabi.getSelection(), html: nabi.getHtml() };
    });
    await button.click();
    await expect(button).toHaveAttribute('data-copy-state', 'copied');
    expect(await page.evaluate(() => (globalThis as unknown as { codeTest: CodeState }).codeTest.copied)).toEqual([
      '  const x = 1;\nconsole.log(x);\n',
    ]);
    expect(
      await page.evaluate(() => {
        const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
        return { json: nabi.getJson(), selection: nabi.getSelection(), html: nabi.getHtml() };
      }),
    ).toEqual(before);
    await page.mouse.move(0, 0);
    await button.focus();
    await expect(button).toHaveCSS('opacity', '1');
    await page.keyboard.press('Enter');
    await expect
      .poll(() => page.evaluate(() => (globalThis as unknown as { codeTest: CodeState }).codeTest.copied.length))
      .toBe(2);
    expect(
      await page.evaluate(() => {
        const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
        return { json: nabi.getJson(), html: nabi.getHtml() };
      }),
    ).toEqual({ json: before.json, html: before.html });
    await page.keyboard.press('Tab');
    expect(await button.evaluate((el) => el === document.activeElement)).toBe(false);
    expect(
      await page.evaluate(() => (globalThis as unknown as { codeTest: CodeState }).codeTest.nabi.getJson()),
    ).toEqual(before.json);
  });
}

test('code controls do not alter typing, language changes, or native selection offsets', async ({ page }) => {
  await setup(page);
  await page.locator('#surface').focus();
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
    nabi.select({ anchor: { path: [0, 0], offset: 2 }, focus: { path: [0, 0], offset: 7 } });
  });
  await page.locator('#surface pre').hover();
  await page.locator('#surface .nabi-code-copy').click();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('const');
  await page.keyboard.type('let');
  await expect(page.locator('#surface pre > code')).toHaveText('  let x = 1;console.log(x);');
  await page.keyboard.press('Enter');
  await page.keyboard.type('next');
  expect(
    await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
      nabi.applyCommand('setCodeLanguage', { lang: 'python' });
      return nabi.getHtml();
    }),
  ).toContain('  let<br/>next x = 1;');
  await expect(page.locator('#surface pre')).toHaveAttribute('data-nabi-lang', 'python');
  await expect(page.locator('#surface .nabi-code-copy')).toHaveCount(1);
  await page.locator('#surface pre').hover();
  await page.locator('#surface .nabi-code-copy').click();
  expect(await page.evaluate(() => (globalThis as unknown as { codeTest: CodeState }).codeTest.copied.at(-1))).toBe(
    '  let\nnext x = 1;\nconsole.log(x);\n',
  );
});

test('empty code boxes keep typing inside their code content', async ({ page }) => {
  await setup(page);
  await page.evaluate(() => {
    const { nabi } = (globalThis as unknown as { codeTest: CodeState }).codeTest;
    nabi.setJson([{ w: 'p', ch: [{ w: 'code', ch: [] }] }]);
    nabi.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } });
  });
  await page.locator('#surface').focus();
  await page.keyboard.type('first');
  await page.keyboard.press('Enter');
  await page.keyboard.type('second');
  await page.locator('#surface pre').hover();
  await page.locator('#surface .nabi-code-copy').click();
  expect(await page.evaluate(() => (globalThis as unknown as { codeTest: CodeState }).codeTest.copied.at(-1))).toBe(
    'first\nsecond',
  );
  await expect(page.locator('#surface pre > code')).toHaveText('firstsecond');
});

test.describe('touch controls', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('copy stays available without hover', async ({ page }) => {
    await setup(page);
    await expect(page.locator('#reader .nabi-code-copy')).toHaveCSS('opacity', '1');
    await page.locator('#reader .nabi-code-copy').tap();
    await expect(page.locator('#reader .nabi-code-copy')).toHaveAttribute('data-copy-state', 'copied');
  });
});
