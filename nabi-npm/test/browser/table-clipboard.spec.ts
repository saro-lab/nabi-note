import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson([
      {
        w: 'p',
        ch: [
          {
            w: 'table',
            ch: Array.from({ length: 5 }, (_, row) => ({
              w: 'tr',
              ch: Array.from({ length: 5 }, (_, column) => ({
                w: 'td',
                ch: [{ w: 'p', ch: [`R${row + 1}C${column + 1}`] }],
              })),
            })),
          },
        ],
      },
    ]);
    const root = document.querySelector<HTMLElement>('#content')!;
    root.focus();
  });
});

for (const format of ['custom', 'html', 'plain']) {
  test(`copies only the selected rectangle from a filled 5x5 table via ${format}`, async ({ page }) => {
    const result = await page.evaluate((format) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      const root = document.querySelector<HTMLElement>('#content')!;
      nabi.select({
        anchor: { path: [0, 0, 1, 1, 0], offset: 0 },
        focus: { path: [0, 0, 2, 2, 0], offset: 0 },
      });
      const selected = [...root.querySelectorAll('[data-nabi-cell-selected]')].map((cell) => cell.textContent);
      const copied = new DataTransfer();
      root.dispatchEvent(new ClipboardEvent('copy', { clipboardData: copied, bubbles: true, cancelable: true }));
      const transfer = new DataTransfer();
      const types = format === 'custom' ? [...copied.types] : [format === 'html' ? 'text/html' : 'text/plain'];
      for (const type of types) transfer.setData(type, copied.getData(type));
      nabi.setJson([{ w: 'p', ch: [] }]);
      root.focus();
      nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
      root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
      return {
        selected,
        pasted: root.textContent?.match(/R\dC\d/g) ?? [],
        rows: root.querySelectorAll('tr').length,
        cells: root.querySelectorAll('th, td').length,
      };
    }, format);
    expect(result.selected).toEqual(['R2C2', 'R2C3', 'R3C2', 'R3C3']);
    expect(result.pasted).toEqual(result.selected);
    if (format !== 'plain') {
      expect(result.rows).toBe(2);
      expect(result.cells).toBe(4);
    }
  });
}

test('dragged cell selection copies the highlighted cells', async ({ page }) => {
  const cells = page.locator('#content td');
  await cells.nth(12).scrollIntoViewIfNeeded();
  await cells.nth(6).click();
  const start = (await cells.nth(6).boundingBox())!;
  const end = (await cells.nth(12).boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('#content [data-nabi-cell-selected]')).toHaveText(['R2C2', 'R2C3', 'R3C2', 'R3C3']);
  const copied = await page.locator('#content').evaluate((root) => {
    const data = new DataTransfer();
    root.dispatchEvent(new ClipboardEvent('copy', { clipboardData: data, bubbles: true, cancelable: true }));
    const html = document.createElement('div');
    html.innerHTML = data.getData('text/html');
    return {
      plain: data.getData('text/plain'),
      cells: [...html.querySelectorAll('td')].map((cell) => cell.textContent),
    };
  });
  expect(copied.plain).toBe('R2C2\tR2C3\nR3C2\tR3C3');
  expect(copied.cells).toEqual(['R2C2', 'R2C3', 'R3C2', 'R3C3']);
});

test('cut adopts the live rectangle, preserves other cells and undoes in one step', async ({ page }) => {
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const root = document.querySelector<HTMLElement>('#content')!;
    const cells = root.querySelectorAll('td p');
    const before = [...cells].map((cell) => cell.textContent);
    document.getSelection()!.setBaseAndExtent(cells[12]!.firstChild!, 0, cells[6]!.firstChild!, 0);
    const data = new DataTransfer();
    root.dispatchEvent(new ClipboardEvent('cut', { clipboardData: data, bubbles: true, cancelable: true }));
    const after = [...root.querySelectorAll('td p')].map((cell) => cell.textContent?.replace(/\u200b/g, ''));
    const undone = nabi.undo();
    return {
      before,
      after,
      undone,
      restored: [...root.querySelectorAll('td p')].map((cell) => cell.textContent),
      plain: data.getData('text/plain'),
      custom: data.getData('application/vnd.nabi.tree+json'),
    };
  });
  expect(result.after).toEqual(result.before.map((text, index) => ([6, 7, 11, 12].includes(index) ? '' : text)));
  expect(result.plain).toBe('R2C2\tR2C3\nR3C2\tR3C3');
  expect(result.custom).not.toContain('_id');
  expect(result.undone).toBe(true);
  expect(result.restored).toEqual(result.before);
});

test('failed clipboard writes leave the selected table contents intact', async ({ page }) => {
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const root = document.querySelector<HTMLElement>('#content')!;
    nabi.select({ anchor: { path: [0, 0, 1, 1, 0], offset: 0 }, focus: { path: [0, 0, 2, 2, 0], offset: 0 } });
    const before = nabi.getJson();
    const selection = nabi.getSelection();
    const event = new ClipboardEvent('cut', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: {
        setData() {
          throw new Error('unavailable');
        },
      },
    });
    root.dispatchEvent(event);
    return {
      before,
      after: nabi.getJson(),
      selection,
      afterSelection: nabi.getSelection(),
      prevented: event.defaultPrevented,
    };
  });
  expect(result.after).toEqual(result.before);
  expect(result.afterSelection).toEqual(result.selection);
  expect(result.prevented).toBe(true);
});

for (const format of ['custom', 'html', 'plain']) {
  test(`partial text in one cell still copies only that text via ${format}`, async ({ page }) => {
    const text = await page.evaluate((format) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      const root = document.querySelector<HTMLElement>('#content')!;
      const text = root.querySelectorAll('td p')[6]!.firstChild!;
      document.getSelection()!.setBaseAndExtent(text, 1, text, 3);
      const copied = new DataTransfer();
      root.dispatchEvent(new ClipboardEvent('copy', { clipboardData: copied, bubbles: true, cancelable: true }));
      const transfer = new DataTransfer();
      const type = format === 'custom' ? 'application/vnd.nabi.tree+json' : `text/${format}`;
      transfer.setData(type, copied.getData(type));
      nabi.setJson([{ w: 'p', ch: [] }]);
      nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
      root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
      return root.textContent;
    }, format);
    expect(text).toBe('2C');
  });
}

for (const offset of [0, 1]) {
  test(`cuts the outlined table at boundary ${offset} and pastes it inside a float`, async ({ page }) => {
    const result = await page.evaluate((offset) => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      const root = document.querySelector<HTMLElement>('#content')!;
      const original = nabi.getJson();
      const table = (original as readonly unknown[])[0];
      const floating = {
        w: 'p',
        ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch: [{ w: 'p', ch: [] }] }],
      };
      nabi.setJson([table, floating, { w: 'p', ch: ['outside'] }]);
      root.focus();
      nabi.select({ anchor: { path: [0], offset }, focus: { path: [0], offset } });
      const outlined = root.querySelector('table')?.hasAttribute('data-nabi-picked');
      const transfer = new DataTransfer();
      root.dispatchEvent(new ClipboardEvent('cut', { clipboardData: transfer, bubbles: true, cancelable: true }));
      const afterCut = nabi.getJson();
      const tablesAfterCut = root.querySelectorAll('table').length;
      nabi.select({ anchor: { path: [0, 0, 0], offset: 0 }, focus: { path: [0, 0, 0], offset: 0 } });
      root.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
      const afterPaste = nabi.getJson();
      const tablesInFloat = root.querySelectorAll('[data-nabi-float] table').length;
      nabi.undo();
      const undoPaste = nabi.getJson();
      nabi.undo();
      const undoCut = nabi.getJson();
      return { outlined, table, floating, tablesAfterCut, tablesInFloat, afterCut, afterPaste, undoPaste, undoCut };
    }, offset);
    expect(result.outlined).toBe(true);
    expect(result.tablesAfterCut).toBe(0);
    expect(result.tablesInFloat).toBe(1);
    expect(result.afterCut).toEqual([result.floating, { w: 'p', ch: ['outside'] }]);
    expect(result.afterPaste).toEqual([
      { w: 'p', ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch: [result.table] }] },
      { w: 'p', ch: ['outside'] },
    ]);
    expect(result.undoPaste).toEqual(result.afterCut);
    expect(result.undoCut).toEqual([result.table, result.floating, { w: 'p', ch: ['outside'] }]);
  });
}

test('the native cut shortcut cuts an outlined table with a collapsed caret', async ({ page }) => {
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    document.querySelector<HTMLElement>('#content')!.focus();
    nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  });
  await expect(page.locator('#content table')).toHaveAttribute('data-nabi-picked', '');
  await page.keyboard.press('ControlOrMeta+x');
  await expect(page.locator('#content table')).toHaveCount(0);
});
