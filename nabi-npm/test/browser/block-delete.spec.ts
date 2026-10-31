import { expect, test, type Page } from '@playwright/test';
import type { ElementNode, Nabi, Selection } from '../../src/index.js';

const paragraph = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const image: ElementNode = { w: 'p', ch: [{ w: 'img', a: { src: '/delete-image.svg' }, ch: [] }] };
const caret = (path: readonly number[], offset = 0): Selection => ({
  anchor: { path, offset },
  focus: { path, offset },
});
const picked = (path: readonly number[]): Selection => ({
  anchor: { path, offset: 0 },
  focus: { path, offset: 1 },
});
const table = (cells: readonly ElementNode[][]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: [{ w: 'tr', ch: cells.map((ch) => ({ w: 'td', ch })) }] }],
});
const protectedBlocks: Record<string, ElementNode> = {
  table: table([[paragraph('Cell')]]),
  code: { w: 'p', ch: [{ w: 'code', ch: ['const answer = 42;'] }] },
  details: {
    w: 'p',
    ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['Title'] }, paragraph('Body')] }],
  },
  float: {
    w: 'p',
    ch: [{ w: 'float', a: { side: 'right', w: 40 }, ch: [paragraph('Float content')] }],
  },
};

async function select(page: Page, selection: Selection): Promise<void> {
  await page.evaluate((selection) => {
    document.getElementById('content')!.focus({ preventScroll: true });
    (globalThis as unknown as { nabi: Nabi }).nabi.select(selection);
  }, selection);
}

async function load(page: Page, doc: readonly ElementNode[], selection: Selection): Promise<void> {
  await page.evaluate((doc) => (globalThis as unknown as { nabi: Nabi }).nabi.setJson(doc), doc);
  await select(page, selection);
}

async function readDoc(page: Page): Promise<unknown> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getJson());
}

async function readSelection(page: Page): Promise<Selection> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection());
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.route('**/delete-image.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="teal"/></svg>',
    }),
  );
  await page.goto('/');
});

test('Delete removes the empty paragraph, moves the image up, and selects it before deletion', async ({ page }) => {
  const initial = [paragraph(), image, paragraph('Tail')];
  await load(page, initial, caret([0]));
  const renderedImage = page.locator('#content img');
  await expect(renderedImage).toBeVisible();
  await expect.poll(() => renderedImage.evaluate((node: HTMLImageElement) => node.complete)).toBe(true);
  const imageTop = () =>
    renderedImage.evaluate((node) => {
      const root = document.getElementById('content')!;
      return node.getBoundingClientRect().top - root.getBoundingClientRect().top;
    });
  const beforeTop = await imageTop();

  await page.keyboard.press('Delete');

  expect(await readDoc(page)).toEqual([image, paragraph('Tail')]);
  expect(await readSelection(page)).toEqual(picked([0]));
  await expect(renderedImage).toHaveAttribute('data-nabi-picked', '');
  await expect(page.locator('#content > [data-nabi-p]').first().locator('img')).toHaveCount(1);
  await expect.poll(imageTop).toBeLessThan(beforeTop - 10);

  await page.keyboard.press('Delete');
  expect(await readDoc(page)).toEqual([paragraph('Tail')]);
  await expect(renderedImage).toHaveCount(0);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual([image, paragraph('Tail')]);
  expect(await readSelection(page)).toEqual(picked([0]));
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(initial);
  expect(await readSelection(page)).toEqual(caret([0]));
});

for (const key of ['Delete', 'Backspace'] as const) {
  test(`${key} beside text selects an image without changing the document`, async ({ page }) => {
    const initial = [paragraph('Before'), image, paragraph('After')];
    await load(page, initial, key === 'Delete' ? caret([0], 6) : caret([2]));
    await page.keyboard.press(key);
    expect(await readDoc(page)).toEqual(initial);
    expect(await readSelection(page)).toEqual(picked([1]));
    await expect(page.locator('#content img')).toHaveAttribute('data-nabi-picked', '');
    await page.keyboard.press(key);
    expect(await readDoc(page)).toEqual([paragraph('Before'), paragraph('After')]);
    await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
    expect(await readDoc(page)).toEqual(initial);
  });

  for (const [name, block] of Object.entries(protectedBlocks)) {
    test(`${key} protects the outer ${name} boundary and selects the whole block`, async ({ page }) => {
      for (const text of ['', 'Outside']) {
        await test.step(text ? 'nonempty paragraph' : 'empty paragraph', async () => {
          const before = key === 'Delete';
          const initial = before
            ? [paragraph(text), block, paragraph('Tail')]
            : [paragraph('Head'), block, paragraph(text)];
          await load(page, initial, before ? caret([0], text.length) : caret([2]));
          const normalized = (await readDoc(page)) as ElementNode[];
          const expected = text ? normalized : before ? normalized.slice(1) : normalized.slice(0, -1);
          const selectedIndex = !text && before ? 0 : 1;

          await page.keyboard.press(key);

          expect(await readDoc(page)).toEqual(expected);
          expect(await readSelection(page)).toEqual(picked([selectedIndex]));
          if (name === 'code') {
            await expect(page.locator('#content code [data-nabi-token]').first()).toBeVisible();
            expect(await page.evaluate(() => document.getSelection()!.isCollapsed)).toBe(false);
          }
          await page.keyboard.press(key);
          expect(await readDoc(page)).toEqual(expected.filter((_, index) => index !== selectedIndex));
        });
      }
    });
  }
}

for (const kind of ['ul', 'quote'] as const) {
  test(`Delete continues text flow into the next ${kind} without selecting the whole container`, async ({ page }) => {
    const wrap = (texts: string[]): ElementNode => ({
      w: 'p',
      ch: [
        { w: kind, ch: texts.map((text) => (kind === 'ul' ? { w: 'li', ch: [paragraph(text)] } : paragraph(text))) },
      ],
    });
    await load(page, [paragraph('Head'), wrap(['First', 'Second'])], caret([0], 4));
    await page.keyboard.press('Delete');
    expect(await readDoc(page)).toEqual([paragraph('HeadFirst'), wrap(['Second'])]);
    expect(await readSelection(page)).toEqual(caret([0], 4));
  });
}

test('Delete at a list-item boundary selects a nested code block before removing it', async ({ page }) => {
  const list = (secondItem: ElementNode[]): ElementNode => ({
    w: 'p',
    ch: [
      {
        w: 'ul',
        ch: [
          { w: 'li', ch: [paragraph('Head')] },
          { w: 'li', ch: secondItem },
        ],
      },
    ],
  });
  const baseline = [paragraph('Baseline')];
  const initial = [list([protectedBlocks.code, paragraph('Remaining')])];
  await load(page, baseline, caret([0]));
  await load(page, initial, caret([0, 0, 0, 0], 4));

  await page.keyboard.press('Delete');
  expect(await readDoc(page)).toEqual(initial);
  expect(await readSelection(page)).toEqual(picked([0, 0, 1, 0]));
  await expect(page.locator('#content code [data-nabi-token]').first()).toBeVisible();
  expect(await page.evaluate(() => document.getSelection()!.isCollapsed)).toBe(false);

  await page.keyboard.press('Delete');
  expect(await readDoc(page)).toEqual([list([paragraph('Remaining')])]);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(initial);
  expect(await readSelection(page)).toEqual(picked([0, 0, 1, 0]));
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(baseline);
});

test('deleting an empty paragraph and image inside a cell preserves neighboring cells and their boundaries', async ({
  page,
}) => {
  const documentOf = (content: ElementNode[]) => [table([content, [paragraph('Safe')]]), paragraph('Outside')];
  await load(page, documentOf([paragraph(), image, paragraph('Inside')]), caret([0, 0, 0, 0, 0]));
  await page.keyboard.press('Delete');
  expect(await readDoc(page)).toEqual(documentOf([image, paragraph('Inside')]));
  expect(await readSelection(page)).toEqual(picked([0, 0, 0, 0, 0]));
  await page.keyboard.press('Delete');
  const expected = documentOf([paragraph('Inside')]);
  expect(await readDoc(page)).toEqual(expected);
  await select(page, caret([0, 0, 0, 0, 0], 6));
  await page.keyboard.press('Delete');
  expect(await readDoc(page)).toEqual(expected);
  await select(page, caret([0, 0, 0, 1, 0]));
  await page.keyboard.press('Backspace');
  expect(await readDoc(page)).toEqual(expected);
  await expect(page.locator('#content td')).toHaveCount(2);
  await expect(page.locator('#content td').last()).toHaveText('Safe');
});
