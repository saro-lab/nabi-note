import { expect, test, type Page } from '@playwright/test';
import type { ElementNode, Nabi, Selection } from '../../src/index.js';

const paragraph = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const cell = (children: readonly ElementNode[], header = false): ElementNode => ({
  w: 'td',
  ch: children,
  ...(header ? { a: { th: 1 } } : {}),
});
const table = (rows: readonly (readonly ElementNode[])[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: rows.map((cells) => ({ w: 'tr', ch: cells })) }],
});
const caret = (path: readonly number[], offset = 0): Selection => ({
  anchor: { path, offset },
  focus: { path, offset },
});
const documentOf = (content: readonly ElementNode[] = [paragraph('AB')]): readonly ElementNode[] => [
  table([[cell(content), cell([paragraph('Next')])]]),
  paragraph('Outside'),
];

async function select(page: Page, selection: Selection): Promise<void> {
  await page.evaluate((selection) => {
    document.querySelector<HTMLElement>('#content')!.focus();
    (globalThis as unknown as { nabi: Nabi }).nabi.select(selection);
  }, selection);
}

async function load(page: Page, doc: readonly ElementNode[], selection = caret([0, 0, 0, 0, 0])): Promise<void> {
  await page.evaluate((doc) => (globalThis as unknown as { nabi: Nabi }).nabi.setJson(doc), doc);
  await select(page, selection);
}

async function focusPath(page: Page): Promise<readonly number[]> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection().focus.path);
}

async function attr(page: Page, path: readonly number[], key = 'a'): Promise<unknown> {
  return page.evaluate(
    ({ path, key }) => {
      let nodes = (globalThis as unknown as { nabi: Nabi }).nabi.getJson() as readonly ElementNode[];
      let node: ElementNode | undefined;
      for (const index of path) {
        node = nodes[index];
        nodes = (node?.ch ?? []) as readonly ElementNode[];
      }
      return node?.a?.[key];
    },
    { path, key },
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/');
  await load(page, documentOf());
});

test('Enter and Shift+Enter stay in the cell while Tab moves across cells and adds the next row', async ({ page }) => {
  await select(page, caret([0, 0, 0, 0, 0], 1));
  await page.keyboard.press('Enter');
  await expect(page.locator('#content td').first().locator(':scope > p')).toHaveText(['A', 'B']);
  expect(await focusPath(page)).toEqual([0, 0, 0, 0, 1]);
  await page.keyboard.type('X');
  await page.keyboard.press('Shift+Enter');
  await expect(page.locator('#content td').first().locator(':scope > p')).toHaveCount(2);
  await expect(page.locator('#content td').first().locator('br')).toHaveCount(1);
  expect((await focusPath(page)).slice(0, 4)).toEqual([0, 0, 0, 0]);
  await page.keyboard.press('Tab');
  expect(await focusPath(page)).toEqual([0, 0, 0, 1, 0]);
  await page.keyboard.press('Shift+Tab');
  expect((await focusPath(page)).slice(0, 4)).toEqual([0, 0, 0, 0]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#content tr')).toHaveCount(2);
  expect((await focusPath(page)).slice(0, 4)).toEqual([0, 0, 1, 0]);
  await expect(page.locator('#content > p').last()).toHaveText('Outside');
});

test('Tab and Shift+Tab keep list indentation and code indentation inside their cell', async ({ page }) => {
  const list: ElementNode = {
    w: 'p',
    ch: [
      {
        w: 'ul',
        ch: [
          { w: 'li', ch: [paragraph('First')] },
          { w: 'li', ch: [paragraph('Second')] },
        ],
      },
    ],
  };
  await load(page, documentOf([list]), caret([0, 0, 0, 0, 0, 0, 1, 0], 1));
  await page.keyboard.press('Tab');
  await expect(page.locator('#content td').first().locator('ul ul li')).toHaveCount(1);
  expect((await focusPath(page)).slice(0, 4)).toEqual([0, 0, 0, 0]);
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#content td').first().locator('ul ul')).toHaveCount(0);
  await expect(page.locator('#content td').first().locator('li')).toHaveCount(2);
  await load(page, documentOf([{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }]), caret([0, 0, 0, 0, 0, 0]));
  await page.keyboard.press('Tab');
  await expect
    .poll(() => page.locator('#content td pre').evaluate((node) => node.textContent?.replace(/\u00a0/g, ' ')))
    .toBe('    x');
  expect(await focusPath(page)).toEqual([0, 0, 0, 0, 0, 0]);
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#content td pre')).toHaveText('x');
  await expect(page.locator('#content tr')).toHaveCount(1);
});

test('toolbar inserts images and lists in the cell and selects the whole table for outer alignment', async ({
  page,
}) => {
  await expect(page.locator('#toolbar [data-name="table"]')).toBeHidden();
  await expect(page.locator('#toolbar [data-name="float"]')).toBeHidden();
  await page.locator('#toolbar [data-name="img"]').click();
  const source = page.locator('.nabi-prompt input[data-name="src"]');
  await source.fill('/nabi-note.svg');
  await source.press('Enter');
  const image = page.locator('#content td img');
  await expect(image).toHaveCount(1);
  await image.click();
  await expect(image).toHaveAttribute('data-nabi-picked', '');
  await page.locator('#toolbar [data-name="align:r"]').click();
  expect(await attr(page, [0, 0, 0, 0, 1])).toBe('r');
  expect(await attr(page, [0])).toBeUndefined();
  await select(page, caret([0, 0, 0, 0, 0], 1));
  await page.locator('#toolbar [data-name="align:c"]').click();
  await page.locator('#toolbar [data-name="ul"]').click();
  await expect(page.locator('#content td ul')).toHaveCount(1);
  await expect(page.locator('#content td ul')).toHaveText('AB');
  await expect(page.locator('#content td img')).toHaveCount(1);
  await expect(page.locator('#toolbar [data-name="table"]')).toBeHidden();
  await expect(page.locator('#toolbar [data-name="float"]')).toBeHidden();
  await page.locator('#context [data-name="selectTable"]').click();
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection())).toEqual({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  });
  await page.locator('#toolbar [data-name="align:r"]').click();
  expect(await attr(page, [0])).toBe('r');
  expect(await attr(page, [0, 0, 0, 0, 0, 0, 0, 0])).toBe('c');
  await expect(page.locator('#content > p').last()).toHaveText('Outside');
});

test('pasting a nested table and float keeps their contents in the current cell without their wrappers', async ({
  page,
}) => {
  await load(page, documentOf([paragraph()]));
  await page.locator('#content').evaluate((root) => {
    const transfer = new DataTransfer();
    transfer.setData(
      'text/html',
      '<table><tbody><tr><td><p>Nested A</p></td><td><p>Nested B</p></td></tr></tbody></table>' +
        '<div data-nabi-float="right" data-nabi-float-width="40"><p>Float content</p></div>',
    );
    root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
  });
  await expect(page.locator('#content table')).toHaveCount(1);
  await expect(page.locator('#content td')).toHaveCount(2);
  await expect(page.locator('#content [data-nabi-float]')).toHaveCount(0);
  const target = page.locator('#content td').first();
  await expect(target).toContainText('Nested A');
  await expect(target).toContainText('Nested B');
  await expect(target).toContainText('Float content');
  expect((await focusPath(page)).slice(0, 4)).toEqual([0, 0, 0, 0]);
  await expect(page.locator('#content > p').last()).toHaveText('Outside');
});

test('header headings are hidden and rectangular alignment applies only to selected cells', async ({ page }) => {
  await load(page, [
    table([
      [cell([paragraph('Header')], true), cell([paragraph('B')])],
      [cell([paragraph('C')]), cell([paragraph('D'), paragraph('More')])],
    ]),
    paragraph('Outside'),
  ]);
  await expect(page.locator('#toolbar [data-name="h"]')).toBeHidden();
  await select(page, caret([0, 0, 1, 0, 0], 1));
  await expect(page.locator('#toolbar [data-name="h"]')).toBeVisible();
  await page.locator('#toolbar [data-name="h"]').click();
  await expect(page.locator('#content td h1')).toHaveText('C');
  await select(page, {
    anchor: { path: [0, 0, 0, 1, 0], offset: 0 },
    focus: { path: [0, 0, 1, 1, 1], offset: 1 },
  });
  await expect(page.locator('#content [data-nabi-cell-selected]')).toHaveCount(2);
  await expect(page.locator('#toolbar [data-name="img"]')).toBeHidden();
  await page.locator('#toolbar [data-name="align:r"]').click();
  for (const path of [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1],
  ])
    expect(await attr(page, path)).toBe('r');
  for (const path of [[0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]]) expect(await attr(page, path)).toBeUndefined();
  await expect(page.locator('#toolbar [data-name="align:r"]')).toHaveAttribute('aria-pressed', 'true');
});

test('native details toggles inside a cell update only that details block', async ({ page }) => {
  const details = (title: string): ElementNode => ({
    w: 'p',
    ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: [title] }, paragraph('Body')] }],
  });
  await load(page, [table([[cell([details('First')]), cell([details('Second')])]]), paragraph('Outside')]);
  const first = page.locator('#content details').first();
  await select(page, caret([0, 0, 0, 1, 0, 0, 1], 1));
  await first.locator('summary').click({ position: { x: 5, y: 10 } });
  await expect(first).not.toHaveAttribute('open');
  await expect.poll(() => attr(page, [0, 0, 0, 0, 0, 0], 'o')).toBeUndefined();
  expect(await attr(page, [0, 0, 0, 1, 0, 0], 'o')).toBe(1);
  expect(await focusPath(page)).not.toEqual([0]);
  await first.locator('summary').click({ position: { x: 5, y: 10 } });
  await expect.poll(() => attr(page, [0, 0, 0, 0, 0, 0], 'o')).toBe(1);
  await expect(page.locator('#content > p').last()).toHaveText('Outside');
});

test('table wrapper carets show the object outline without selecting cell content', async ({ page }) => {
  const tableElement = page.locator('#content table');
  for (const offset of [0, 1]) {
    const selection = caret([0], offset);
    await select(page, selection);
    await expect(tableElement).toHaveAttribute('data-nabi-picked', '');
    await expect(tableElement).toHaveCSS('outline-style', 'dashed');
    expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection())).toEqual(selection);
    await select(page, caret([0, 0, 0, 0, 0]));
    await expect(tableElement).not.toHaveAttribute('data-nabi-picked');
  }
  await select(page, caret([0], 1));
  await select(page, caret([1]));
  await expect(tableElement).not.toHaveAttribute('data-nabi-picked');
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getHtml())).not.toContain(
    'data-nabi-picked',
  );
});

test('main toolbar aligns the table at either wrapper caret boundary', async ({ page }) => {
  for (const [offset, value] of [
    [0, 'c'],
    [1, 'r'],
  ] as const) {
    await select(page, caret([0], offset));
    const button = page.locator(`#toolbar [data-name="align:${value}"]`);
    await expect(button).toBeVisible();
    await button.click();
    expect(await attr(page, [0])).toBe(value);
    expect(await attr(page, [0, 0, 0, 0, 0])).toBeUndefined();
    await expect(page.locator('#content table')).toHaveAttribute('data-nabi-picked', '');
  }
});
