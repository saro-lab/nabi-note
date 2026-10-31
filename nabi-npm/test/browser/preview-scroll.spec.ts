import { expect, test, type Page } from '@playwright/test';
import type { ElementNode, Nabi, Selection } from '../../src/index.js';

const paragraph = (text: string): ElementNode => ({ w: 'p', ch: [text] });
const caret = (path: readonly number[], offset = 0): Selection => ({
  anchor: { path, offset },
  focus: { path, offset },
});
const paragraphs = (prefix: string, count = 90): ElementNode[] =>
  Array.from({ length: count }, (_, index) => paragraph(`${prefix} ${index}: text around the editing position.`));

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    return { doc: nabi.getJson(), selection: nabi.getSelection(), html: nabi.getHtml() };
  });
}

async function load(page: Page, doc: readonly ElementNode[], selection: Selection): Promise<void> {
  await page.evaluate(
    ({ doc, selection }) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      nabi.setJson(doc);
      document.querySelector<HTMLElement>('#content')!.focus({ preventScroll: true });
      nabi.select(selection);
    },
    { doc, selection },
  );
  await expect.poll(async () => (await snapshot(page)).selection).toEqual(selection);
}

async function expectCaretVisible(page: Page, text: string, nearThird = false): Promise<void> {
  const geometry = await page.locator('.nabi-preview').evaluate((card, text) => {
    const body = card.querySelector('.nabi-preview-body')!;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const offset = node.textContent?.indexOf(text) ?? -1;
      if (offset >= 0) {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + text.length);
        const rect = range.getBoundingClientRect();
        const frame = card.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          visibleTop: frame.top + card.clientTop,
          visibleBottom: frame.top + card.clientTop + card.clientHeight,
          third: frame.top + card.clientHeight / 3,
          scroll: card.scrollTop,
        };
      }
      node = walker.nextNode();
    }
    throw new Error(`Preview text not found: ${text}`);
  }, text);
  expect(geometry.scroll).toBeGreaterThan(0);
  expect(geometry.height).toBeGreaterThan(0);
  expect(geometry.top).toBeGreaterThanOrEqual(geometry.visibleTop - 1);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.visibleBottom + 1);
  if (nearThird) expect(Math.abs(geometry.top - geometry.third)).toBeLessThanOrEqual(2);
}

async function openAndCheck(page: Page, mobile: boolean, text: string) {
  const button = page.locator('#app [data-name="preview"]:visible');
  await button.scrollIntoViewIfNeeded();
  const before = await snapshot(page);
  expect(before.html).not.toMatch(/data-key=|data-nabi-filler|data-nabi-terminal|contenteditable=/);
  if (mobile) await button.tap();
  else await button.click();
  await expect(page.locator('.nabi-preview')).toBeVisible();
  await expect(
    page.locator(
      '.nabi-preview-body [data-key], .nabi-preview-body [data-nabi-terminal], .nabi-preview-body [data-nabi-filler]',
    ),
  ).toHaveCount(0);
  await expectCaretVisible(page, text);
  expect(await snapshot(page)).toEqual(before);
  return before;
}

async function closeAndCheck(page: Page, before: Awaited<ReturnType<typeof snapshot>>): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(page.locator('.nabi-preview')).toHaveCount(0);
  expect(await snapshot(page)).toEqual(before);
}

for (const width of [1280, 390]) {
  const mobile = width === 390;
  test.describe(`preview caret scrolling at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: mobile, reducedMotion: 'reduce' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#content')).toHaveAttribute('contenteditable', 'true');
    });

    for (const footnote of [false, true]) {
      test(`opens at the current paragraph${footnote ? ' with an appended footnote list' : ''}`, async ({ page }) => {
        const doc = paragraphs('Paragraph');
        if (footnote) {
          doc[0] = {
            w: 'p',
            ch: ['First paragraph', { w: 'fn', a: { t: 'A note at the end of the document.' }, ch: [] }],
          };
        }
        await load(page, doc, caret([60]));
        const before = await openAndCheck(page, mobile, 'Paragraph 60:');
        await expect(page.locator('.nabi-preview-body [data-nabi-footnotes]')).toHaveCount(footnote ? 1 : 0);
        await closeAndCheck(page, before);
      });
    }

    test('reveals a deep table cell inside the first document block', async ({ page }) => {
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [
            {
              w: 'table',
              ch: paragraphs('Table cell').map((row) => ({ w: 'tr', ch: [{ w: 'td', ch: [row] }] })),
            },
          ],
        },
        paragraph('After the table'),
      ];
      await load(page, doc, caret([0, 0, 60, 0, 0]));
      const before = await openAndCheck(page, mobile, 'Table cell 60:');
      await closeAndCheck(page, before);
    });

    test('reveals a deep list item inside the first document block', async ({ page }) => {
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [{ w: 'ul', ch: paragraphs('List item').map((item) => ({ w: 'li', ch: [item] })) }],
        },
        paragraph('After the list'),
      ];
      await load(page, doc, caret([0, 0, 60, 0]));
      const before = await openAndCheck(page, mobile, 'List item 60:');
      await closeAndCheck(page, before);
    });

    test('reveals the end of a tall table at its trailing wrapper boundary', async ({ page }) => {
      const rows = [...paragraphs('Table row', 70), paragraph('LAST TABLE CELL')];
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [{ w: 'table', ch: rows.map((row) => ({ w: 'tr', ch: [{ w: 'td', ch: [row] }] })) }],
        },
        paragraph('AFTER TABLE BOUNDARY'),
        ...paragraphs('Following paragraph'),
      ];
      await load(page, doc, caret([0], 1));
      const before = await openAndCheck(page, mobile, 'LAST TABLE CELL');
      await expectCaretVisible(page, 'AFTER TABLE BOUNDARY');
      await closeAndCheck(page, before);
    });

    test('uses the character offset inside a long first paragraph', async ({ page }) => {
      const prefix = 'Text before the current cursor position. '.repeat(350);
      const target = 'CURRENT CURSOR';
      const text = prefix + target + ' Text after the current cursor position.'.repeat(220);
      await load(page, [paragraph(text)], caret([0], prefix.length));
      const before = await openAndCheck(page, mobile, target);
      await closeAndCheck(page, before);
    });

    test('keeps the cursor offset after two-digit footnotes and bold text', async ({ page }) => {
      const prefix = 'Text before footnote references. '.repeat(220);
      const notes: ElementNode[] = Array.from({ length: 24 }, (_, index) => ({
        w: 'fn',
        a: { t: `Footnote ${index + 1}` },
        ch: [],
      }));
      const bold = ' Bold text before the current cursor. '.repeat(90);
      const target = 'FN_CURSOR';
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [prefix, ...notes, { w: 'b', ch: [bold] }, target + ' Text after the current cursor.'.repeat(220)],
        },
      ];
      await load(page, doc, caret([0], prefix.length + notes.length + bold.length));
      const before = await openAndCheck(page, mobile, target);
      await expect(page.locator('.nabi-preview-body sup[data-nabi-fn]').nth(9)).toHaveText('[10]');
      await expectCaretVisible(page, target, true);
      await closeAndCheck(page, before);
    });

    test('reveals the end of highlighted code without counting its copy button', async ({ page }) => {
      const lines = [
        ...Array.from({ length: 100 }, (_, index) => `const value_${index} = ${index};`),
        'const CODE_END_CURSOR = 100;',
      ];
      const source = lines.join('\n');
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [
            {
              w: 'code',
              a: { lang: 'javascript' },
              ch: lines.flatMap((line, index): (string | ElementNode)[] =>
                index === 0 ? [line] : [{ w: 'br', ch: [] }, line],
              ),
            },
          ],
        },
        ...paragraphs('After code'),
      ];
      await load(page, doc, caret([0, 0], source.length));
      const before = await openAndCheck(page, mobile, 'CODE_END_CURSOR');
      await expect(page.locator('.nabi-preview-body pre [data-nabi-token="keyword"]').first()).toHaveText('const');
      await expect(page.locator('.nabi-preview-body pre > .nabi-code-copy')).toHaveCount(1);
      expect(before.html).not.toMatch(/data-nabi-token|nabi-code-copy/);
      await closeAndCheck(page, before);
    });

    for (const backwards of [false, true]) {
      test(`follows the focus end of a ${backwards ? 'backward' : 'forward'} selection`, async ({ page }) => {
        const anchor = { path: [backwards ? 70 : 30], offset: 0 };
        const focus = { path: [backwards ? 30 : 70], offset: 0 };
        await load(page, paragraphs('Selected paragraph', 110), { anchor, focus });
        const before = await openAndCheck(page, mobile, `Selected paragraph ${focus.path[0]}:`);
        await closeAndCheck(page, before);
      });
    }

    test('opens a closed details ancestor only in the preview to reveal its cursor', async ({ page }) => {
      const doc: ElementNode[] = [
        {
          w: 'p',
          ch: [
            {
              w: 'details',
              a: { o: 0 },
              ch: [{ w: 'summary', ch: ['Closed section'] }, ...paragraphs('Hidden paragraph')],
            },
          ],
        },
        paragraph('After the details'),
      ];
      await load(page, doc, caret([0, 0, 61]));
      await expect(page.locator('#content details')).not.toHaveAttribute('open');
      const before = await openAndCheck(page, mobile, 'Hidden paragraph 60:');
      await expect(page.locator('.nabi-preview-body details')).toHaveAttribute('open');
      await expect(page.locator('#content details')).not.toHaveAttribute('open');
      await closeAndCheck(page, before);
      await expect(page.locator('#content details')).not.toHaveAttribute('open');
    });
  });
}
