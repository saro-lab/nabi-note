import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

interface EditorState {
  readonly nabi: Nabi;
  readonly surface: HTMLElement;
}

async function setupEditor(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    document.body.innerHTML =
      '<div class="nabi"><div id="context" class="nabi-toolbar"></div><div id="surface" class="nabi-content"></div></div>' +
      '<button id="preview" style="position:fixed;bottom:8px;right:8px">Preview</button>';
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      locale: 'en',
      doc: [
        { w: 'p', ch: ['Body', { w: 'fn', a: { t: 'First note' }, ch: [] }] },
        ...Array.from({ length: 40 }, (_, i) => ({ w: 'p', ch: [`Paragraph ${i + 1}`] })),
      ],
    });
    api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
    const surface = document.getElementById('surface')!;
    api.mountSurface({ nabi, registry, root: surface });
    api.mountContextToolbar({ nabi, registry, surface, root: document.getElementById('context')!, locale: 'en' });
    (globalThis as unknown as { footnoteTest: EditorState }).footnoteTest = { nabi, surface };
    document.getElementById('preview')!.onclick = () =>
      api.openPreview({
        nabi,
        surface,
        locale: 'en',
        onBody: (body: HTMLElement) => {
          const attachment = viewer.attachViewer(body);
          return () => attachment.unmount();
        },
      });
  }, entry);
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const { nabi, surface } = (globalThis as unknown as { footnoteTest: EditorState }).footnoteTest;
    return {
      scroll: window.scrollY,
      previewScroll: document.querySelector('.nabi-preview')?.scrollTop ?? 0,
      url: location.href,
      document: nabi.getJson(),
      selection: nabi.getSelection(),
      sameSurface: document.getElementById('surface') === surface,
    };
  });
}

for (const width of [1280, 390]) {
  test.describe(`footnote viewer at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });

    test('editor endnote numbers keep the scroll, selection, and document in place', async ({ page }) => {
      await setupEditor(page);
      const number = page.locator('.nabi-footnote-area [data-nabi-fn-num]');
      await number.scrollIntoViewIfNeeded();
      const before = await snapshot(page);
      expect(before.scroll).toBeGreaterThan(0);
      if (width === 390) await number.tap();
      else await number.click();
      expect(await snapshot(page)).toEqual(before);
      await expect(number).not.toHaveCSS('cursor', 'pointer');

      const marker = page.locator('#surface [data-nabi-fn]');
      if (width === 390) await marker.tap();
      else await marker.click();
      await expect(page.locator('.nabi-panel textarea')).toHaveValue('First note');
    });

    test('preview footnotes show their text without navigating in either direction', async ({ page }) => {
      await setupEditor(page);
      await page.locator('#preview').click();
      const preview = page.locator('.nabi-preview-body');
      const marker = preview.locator('sup[data-nabi-fn]');
      if (width === 390) await marker.tap();
      else await marker.click();
      const tip = preview.locator('.nabi-fn-tip');
      await expect(tip).toHaveText('[1] First note');
      await expect(tip.locator('button')).toHaveCount(0);
      const beforeBubbleClick = await snapshot(page);
      const bubbleNumber = tip.locator('[data-nabi-fn-num]');
      if (width === 390) await bubbleNumber.tap();
      else await bubbleNumber.click();
      expect(await snapshot(page)).toEqual(beforeBubbleClick);
      await expect(tip).toBeVisible();
      await expect(bubbleNumber).not.toHaveCSS('cursor', 'pointer');

      if (width === 390) await marker.tap();
      else await marker.click();
      await expect(tip).toHaveCount(0);
      const endnoteNumber = preview.locator('[data-nabi-footnotes] [data-nabi-fn-num]');
      await endnoteNumber.scrollIntoViewIfNeeded();
      const beforeListClick = await snapshot(page);
      expect(beforeListClick.previewScroll).toBeGreaterThan(0);
      if (width === 390) await endnoteNumber.tap();
      else await endnoteNumber.click();
      expect(await snapshot(page)).toEqual(beforeListClick);
      await expect(endnoteNumber).not.toHaveCSS('cursor', 'pointer');

      await marker.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      await expect(marker).not.toBeFocused();
      await page.locator('.nabi-preview .nabi-close').click();
      await expect(page.locator('.nabi-preview')).toHaveCount(0);
      const after = await snapshot(page);
      expect(after.document).toEqual(beforeListClick.document);
      expect(after.selection).toEqual(beforeListClick.selection);
      expect(after.sameSurface).toBe(true);
    });

    test('bubble numbers navigate to endnotes and keyboard dismissal restores the marker', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(async (entry) => {
        const api = await import(/* @vite-ignore */ entry);
        const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
        const { nabi } = api.createNabiWith(api.defaultWings, {
          doc: [
            { w: 'p', ch: ['Body', { w: 'fn', a: { t: 'First <note>' }, ch: [] }] },
            { w: 'p', ch: ['More', { w: 'fn', a: { t: 'Second note' }, ch: [] }] },
          ],
        });
        document.body.innerHTML = '<article id="notes" class="nabi-content"></article>';
        const root = document.getElementById('notes')!;
        root.innerHTML = nabi.getHtml();
        root.querySelector('section')!.style.marginTop = '1200px';
        viewer.attachViewer(root);
      }, entry);
      const marker = page.locator('#notes sup').nth(1);
      await marker.focus();
      await expect(page.locator('.nabi-fn-tip')).toHaveText('[2] Second note');
      await page.keyboard.press('Tab');
      await expect(page.locator('.nabi-fn-tip button')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.nabi-fn-tip')).toHaveCount(0);
      await expect(marker).toBeFocused();
      if (width === 390) await marker.tap();
      else await marker.click();
      const number = page.locator('.nabi-fn-tip button');
      if (width === 390) await number.tap();
      else await number.click();
      const endnote = page.locator('#notes [data-nabi-fn-n="2"]');
      await expect(endnote).toBeFocused();
      await expect(endnote).toBeInViewport();
      await expect(page.locator('.nabi-fn-tip')).toHaveCount(0);
    });

    for (const mode of ['published', 'preview']) {
      test(`${mode} bubbles keep compact sans text, even padding, and stable document spacing`, async ({ page }) => {
        await setupEditor(page);
        await page.evaluate(
          async ({ entry, mode }) => {
            const { nabi } = (globalThis as unknown as { footnoteTest: EditorState }).footnoteTest;
            nabi.setJson([
              { w: 'p', ch: ['Body', { w: 'fn', a: { t: 'Source https://example.com/a_(b).' }, ch: [] }] },
              { w: 'p', ch: ['End of body'] },
            ]);
            if (mode === 'published') {
              const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
              document.body.innerHTML = '<article id="notes" class="nabi-content"></article>';
              const root = document.getElementById('notes')!;
              root.innerHTML = nabi.getHtml();
              viewer.attachViewer(root);
            }
          },
          { entry, mode },
        );
        if (mode === 'preview') await page.locator('#preview').click();
        const root = page.locator(mode === 'preview' ? '.nabi-preview-body' : '#notes');
        await root.evaluate((element) => {
          const root = element as HTMLElement;
          root.style.fontSize = '20px';
          root.style.fontFamily = 'serif';
          root.style.setProperty('--nabi-font', 'Arial, sans-serif');
        });
        const layout = () =>
          root.evaluate((element) => {
            const list = element.querySelector<HTMLElement>('[data-nabi-footnotes]')!;
            const rect = list.getBoundingClientRect();
            const style = getComputedStyle(list);
            return {
              rootHeight: element.getBoundingClientRect().height,
              listTop: rect.top,
              listHeight: rect.height,
              marginTop: style.marginTop,
              paddingBottom: style.paddingBottom,
            };
          });
        const before = await layout();
        const marker = root.locator('sup[data-nabi-fn]');
        await marker.hover();
        const tip = root.locator('.nabi-fn-tip');
        await expect(tip).toBeVisible();
        expect(await layout()).toEqual(before);
        await expect(tip).toHaveCSS('font-family', 'Arial, sans-serif');
        await expect(tip).toHaveCSS('font-size', '15px');
        await expect(tip.locator('[data-nabi-fn-num]')).toHaveCSS('font-size', '15px');
        await expect(tip.locator('a')).toHaveCSS('font-size', '15px');
        await expect(tip.locator('a')).toHaveAttribute('href', 'https://example.com/a_(b)');
        await expect(root.locator('[data-nabi-footnotes] a')).toHaveAttribute('href', 'https://example.com/a_(b)');
        await expect(tip).toHaveText('[1] Source https://example.com/a_(b).');
        const padding = await tip.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
        });
        expect(parseFloat(padding[0]!)).toBeGreaterThan(0);
        expect(new Set(padding).size).toBe(1);
        await tip.hover();
        await expect(tip).toBeVisible();
        await root.locator('p').last().hover();
        await expect(tip).toHaveCount(0);
        expect(await layout()).toEqual(before);
        await marker.focus();
        await expect(tip).toBeVisible();
        expect(await layout()).toEqual(before);
        await page.keyboard.press('Tab');
        if (mode === 'published') {
          await expect(tip.locator('button')).toBeFocused();
          await page.keyboard.press('Tab');
        }
        await expect(tip.locator('a')).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        if (mode === 'published') {
          await expect(tip.locator('button')).toBeFocused();
          await page.keyboard.press('Shift+Tab');
        }
        await expect(marker).toBeFocused();
        if (mode === 'preview') {
          await marker.click();
          await marker.click();
        } else await page.keyboard.press('Escape');
        await expect(tip).toHaveCount(0);
        expect(await layout()).toEqual(before);
      });
    }
  });
}
