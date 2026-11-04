import { expect, test, type Page } from '@playwright/test';
import type { ElementNode, Nabi, Selection } from '../../src/index.js';
import { pasteHtml } from './paste-html.js';

const paragraph = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const wrap = (block: ElementNode): ElementNode => ({ w: 'p', ch: [block] });
const table = wrap({ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [paragraph('CELL')] }] }] });
const image = wrap({ w: 'img', a: { src: '/test.svg' }, ch: [] });
const caret = (path: number[], offset: number, anchor = offset): Selection => ({
  anchor: { path, offset: anchor },
  focus: { path, offset },
});

const state = (page: Page) => page.evaluate(() => (window as unknown as { nabi: Nabi }).nabi.getJson());

async function load(page: Page, doc: ElementNode[], selection: Selection): Promise<void> {
  await page.evaluate(
    ({ doc, selection }) => {
      const { nabi } = window as unknown as { nabi: Nabi };
      nabi.setJson(doc);
      document.getElementById('content')!.focus();
      nabi.select(selection);
    },
    { doc, selection },
  );
}

test.beforeEach(async ({ page }) => {
  await page.route('**/test.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
    }),
  );
  await page.goto('/float.html');
});

test('a table exits one level inside a float, with one undo step per new paragraph', async ({ page }) => {
  const region = (ch: ElementNode[]) => wrap({ w: 'float', a: { side: 'right', w: 40 }, ch });
  await load(page, [region([table])], caret([0, 0, 0, 0, 0, 0, 0], 4));
  await page.keyboard.press('ArrowDown');
  expect(await state(page)).toEqual([region([table, paragraph()])]);
  await page.keyboard.press('ArrowDown');
  expect(await state(page)).toEqual([region([table, paragraph()]), paragraph()]);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Control+z');
  expect(await state(page)).toEqual([region([table, paragraph()])]);
  await page.keyboard.press('Control+z');
  expect(await state(page)).toEqual([region([table])]);
});

test('Down from the last visible line of a final table or open details creates a writable paragraph', async ({
  page,
}) => {
  const tail: ElementNode = { w: 'p', ch: ['last line', { w: 'fn', a: { t: 'note' }, ch: [] }] };
  const row: ElementNode = {
    w: 'tr',
    ch: [
      { w: 'td', ch: [tail] },
      { w: 'td', ch: [paragraph('other')] },
    ],
  };
  const blocks = [
    { block: wrap({ w: 'table', ch: [row] }), path: [0, 0, 0, 0, 0] },
    { block: wrap({ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['Title'] }, tail] }), path: [0, 0, 1] },
  ];
  for (const { block, path } of blocks) {
    for (const offset of [2, 'last line'.length]) {
      await load(page, [block], caret(path, offset));
      await page.keyboard.press('ArrowDown');
      expect(await state(page)).toEqual([block, paragraph()]);
      await page.keyboard.type('outside');
      expect(await state(page)).toEqual([block, paragraph('outside')]);
    }
  }
});

test('blocked sides, an existing neighbor, and a closed summary use the same direction', async ({ page }) => {
  const closed = wrap({ w: 'details', ch: [{ w: 'summary', ch: ['Title'] }, paragraph('Hidden')] });
  await load(page, [table, closed], caret([1, 0, 0], 3));
  await page.keyboard.press('ArrowUp');
  expect(await state(page)).toEqual([table, paragraph(), closed]);
  await page.keyboard.type('between');
  expect(await state(page)).toEqual([table, paragraph('between'), closed]);
  await load(page, [closed], caret([0, 0, 0], 3));
  await page.keyboard.press('ArrowDown');
  expect(await state(page)).toEqual([closed, paragraph()]);
  await load(page, [paragraph('before'), image], caret([1], 1, 0));
  await page.keyboard.press('ArrowUp');
  await page.keyboard.type('!');
  expect(await state(page)).toEqual([paragraph('before!'), image]);
});

test('visual lines inside a multi-line block take priority over exiting the block', async ({ page }) => {
  const text = 'word '.repeat(120).trim();
  const quote = wrap({ w: 'quote', ch: [paragraph(text)] });
  await load(page, [quote], caret([0, 0, 0], 5));
  await page.keyboard.press('ArrowDown');
  expect(await state(page)).toEqual([quote]);
  const focus = () => page.evaluate(() => (window as unknown as { nabi: Nabi }).nabi.getSelection().focus);
  await expect.poll(async () => (await focus()).offset).toBeGreaterThan(5);
  expect((await focus()).path).toEqual([0, 0, 0]);
  await load(page, [quote], caret([0, 0, 0], text.length - 2));
  await page.keyboard.press('ArrowDown');
  expect(await state(page)).toEqual([quote, paragraph()]);
});

test('typing beside a selected object respects the focus side and reuses adjacent text', async ({ page }) => {
  await load(page, [image, table], caret([1], 0, 1));
  await page.keyboard.type('A');
  expect(await state(page)).toEqual([image, paragraph('A'), table]);
  await load(page, [image, paragraph('after')], caret([0], 1, 0));
  await page.keyboard.type('B');
  expect(await state(page)).toEqual([image, paragraph('Bafter')]);
});

test('the divider toolbar button splits the text at the caret', async ({ page }) => {
  await load(page, [paragraph('ABCD')], caret([0], 2));
  await page.locator('#toolbar [data-name="hr"]:visible').click();
  const divider = wrap({ w: 'hr', ch: [] });
  expect(await state(page)).toEqual([paragraph('AB'), divider, paragraph('CD')]);
  await page.keyboard.type('x');
  expect(await state(page)).toEqual([paragraph('AB'), divider, paragraph('xCD')]);
});

test('Enter and Shift+Enter open a paragraph beside a clicked divider', async ({ page }) => {
  const divider = wrap({ w: 'hr', ch: [] });
  const initial = [paragraph('before'), divider, paragraph('after')];
  for (const key of ['Enter', 'Shift+Enter']) {
    await load(page, initial, caret([0], 0));
    await page.locator('#content hr').click();
    await page.keyboard.press(key);
    expect(await state(page)).toEqual([initial[0], divider, paragraph(), initial[2]]);
    await page.keyboard.type('new');
    expect(await state(page)).toEqual([initial[0], divider, paragraph('new'), initial[2]]);
  }
});

test('pasting formatted HTML keeps an image between two independently editable paragraphs', async ({ page }) => {
  const bold = (text: string) => wrap({ w: 'b', ch: [text] });
  await load(page, [paragraph()], caret([0], 0));
  await page.locator('#content').evaluate(pasteHtml, '<p><strong>앞<img src="/test.svg">뒤</strong></p>');
  expect(await state(page)).toEqual([bold('앞'), image, bold('뒤')]);
  await page.keyboard.press('Control+z');
  expect(await state(page)).toEqual([paragraph()]);
});

test('a virtual keyboard line break preserves the focus side of a backward object selection', async ({ page }) => {
  for (const inputType of ['insertParagraph', 'insertLineBreak']) {
    await load(page, [image, table], caret([1], 0, 1));
    await page.evaluate((inputType) => {
      const root = document.getElementById('content')!;
      const wrapper = root.children[1]!;
      const range = new StaticRange({ startContainer: wrapper, startOffset: 0, endContainer: wrapper, endOffset: 1 });
      root.dispatchEvent(
        new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType, targetRanges: [range] }),
      );
    }, inputType);
    expect(await state(page)).toEqual([image, paragraph(), table]);
    await page.keyboard.press('Control+z');
    expect(await state(page)).toEqual([image, table]);
  }
});

test('composition with empty end data commits the staged text into the adjacent paragraph', async ({ page }) => {
  await load(page, [table, paragraph('tail')], caret([0], 1, 0));
  await page.evaluate(() => {
    const root = document.getElementById('content')!;
    root.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    const slot = window.getSelection()!.focusNode as Text;
    slot.appendData('한글');
    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' }));
  });
  expect(await state(page)).toEqual([table, paragraph('한글tail')]);
  await page.keyboard.press('Backspace');
  expect(await state(page)).toEqual([table, paragraph('한tail')]);
});

test('Hangul composition at either table edge preserves the table and backspaces text', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Native IME automation uses the Chromium protocol.');
  const input = await page.context().newCDPSession(page);
  for (const edge of [0, 1]) {
    for (const anchor of [edge, 1 - edge]) {
      await load(page, [table], caret([0], edge, anchor));
      await input.send('Input.imeSetComposition', { text: '한그', selectionStart: 2, selectionEnd: 2 });
      expect(await state(page)).toEqual([table]);
      await expect(page.locator('#content table')).toBeVisible();
      await input.send('Input.insertText', { text: '한글' });
      const expected = (text: string) => (edge ? [table, paragraph(text)] : [paragraph(text), table]);
      expect(await state(page)).toEqual(expected('한글'));
      await page.keyboard.press('Backspace');
      expect(await state(page)).toEqual(expected('한'));
      await page.keyboard.press('Control+z');
      expect(await state(page)).toEqual(expected('한글'));
      await page.keyboard.press('Control+z');
      expect(await state(page)).toEqual([table]);
    }
  }
  await load(page, [table], caret([0], 1, 0));
  await input.send('Input.imeSetComposition', { text: 'ㅎ', selectionStart: 1, selectionEnd: 1 });
  await input.send('Input.imeSetComposition', { text: '', selectionStart: 0, selectionEnd: 0 });
  expect(await state(page)).toEqual([table]);
  await expect(page.locator('#content table')).toBeVisible();
});
