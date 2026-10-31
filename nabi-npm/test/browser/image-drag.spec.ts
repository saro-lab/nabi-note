import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const image = { w: 'p', a: { a: 'r' }, ch: [{ w: 'img', a: { src: '/drag-image.svg', w: '40' }, ch: [] }] };
const paragraph = (text: string) => ({ w: 'p', ch: [text] });
const initial = [paragraph('First'), image, paragraph('Middle'), paragraph('Last')];
const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

interface DragTarget {
  nabi: Nabi;
  source: HTMLImageElement;
  transfer: DataTransfer;
}

async function readDoc(page: Page): Promise<unknown> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getJson());
}

async function setDoc(page: Page, doc: unknown): Promise<void> {
  await page.evaluate((doc) => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson(doc);
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  }, doc);
  await expect(page.locator('#content img')).toBeVisible();
}

async function dropImage(page: Page, target: string, after: boolean): Promise<void> {
  await page.evaluate(
    ({ target, after }) => {
      const source = document.querySelector<HTMLImageElement>('#content img')!;
      const destination = document.querySelector<HTMLElement>(target)!;
      const dataTransfer = new DataTransfer();
      const options = { dataTransfer, bubbles: true, cancelable: true };
      source.dispatchEvent(new DragEvent('dragstart', options));
      const rect = destination.getBoundingClientRect();
      const position = { clientX: rect.left + 8, clientY: after ? rect.bottom - 2 : rect.top + 2 };
      destination.dispatchEvent(new DragEvent('dragover', { ...options, ...position }));
      destination.dispatchEvent(new DragEvent('drop', { ...options, ...position }));
      source.dispatchEvent(new DragEvent('dragend', options));
    },
    { target, after },
  );
}

async function beginNativeDrag(page: Page): Promise<void> {
  const destination = page.locator('#content > p').filter({ hasText: 'Last' });
  await page.locator('#content img').scrollIntoViewIfNeeded();
  const source = (await page.locator('#content img').boundingBox())!;
  const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 10, start.y + 10, { steps: 3 });
  const target = (await destination.boundingBox())!;
  await page.mouse.move(target.x + 16, target.y + target.height - 2, { steps: 12 });
  await page.mouse.move(target.x + 16, target.y + target.height - 2);
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1050 });
  await page.route('**/drag-image.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="teal"/></svg>',
    }),
  );
  await page.goto('/');
  await setDoc(page, initial);
});

test('native image dragging moves its wrapper and keeps attributes, selection, and one undo step', async ({ page }) => {
  const before = await readDoc(page);
  await beginNativeDrag(page);
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], image]);
  await expect(page.locator('#content > [data-nabi-p]').last()).toHaveAttribute('data-nabi-align', 'r');
  await expect(page.locator('#content img')).toHaveAttribute('data-nabi-width', '40');
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection())).toEqual({
    anchor: { path: [3], offset: 0 },
    focus: { path: [3], offset: 1 },
  });
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(before);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.redo());
  expect(await readDoc(page)).toEqual([initial[0], initial[2], initial[3], image]);
});

test('dropping above a paragraph moves the image before it without splitting its text', async ({ page }) => {
  await dropImage(page, '#content > p:first-child', false);
  expect(await readDoc(page)).toEqual([image, initial[0], initial[2], initial[3]]);
});

for (const destination of ['self', 'same gap']) {
  test(`dropping onto ${destination} leaves the document unchanged`, async ({ page }) => {
    const before = await readDoc(page);
    await dropImage(page, destination === 'self' ? '#content img' : '#content > p:nth-child(3)', false);
    expect(await readDoc(page)).toEqual(before);
    await expect(page.locator('#content img')).toHaveCount(1);
  });
}

test('moving an image into a table cell and back preserves the table and cell text', async ({ page }) => {
  const table = {
    w: 'p',
    ch: [
      {
        w: 'table',
        ch: [
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [paragraph('Cell')] },
              { w: 'td', ch: [paragraph('Other')] },
            ],
          },
        ],
      },
    ],
  };
  await setDoc(page, [image, table, paragraph('Outside')]);
  const before = await readDoc(page);
  await dropImage(page, '#content td:first-child > p', true);
  await expect(page.locator('#content td:first-child > [data-nabi-p] > img')).toHaveCount(1);
  await expect(page.locator('#content > [data-nabi-p] > img')).toHaveCount(0);
  await expect(page.locator('#content td:first-child > p')).toHaveText('Cell');
  await expect(page.locator('#content td:last-child > p')).toHaveText('Other');
  await dropImage(page, '#content > p:last-child', true);
  await expect(page.locator('#content td img')).toHaveCount(0);
  expect(await readDoc(page)).toEqual([table, paragraph('Outside'), image]);
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.undo();
    nabi.undo();
  });
  expect(await readDoc(page)).toEqual(before);
});

test('moving into and out of a float uses its inner paragraph as the destination', async ({ page }) => {
  const region = { w: 'p', ch: [{ w: 'float', a: { side: 'right', w: 40 }, ch: [paragraph('Float text')] }] };
  await setDoc(page, [image, region, paragraph('Outside')]);
  const before = await readDoc(page);
  await dropImage(page, '#content [data-nabi-float] > p', true);
  await expect(page.locator('#content [data-nabi-float] > [data-nabi-p] > img')).toHaveCount(1);
  await expect(page.locator('#content > [data-nabi-p] > img')).toHaveCount(0);
  await dropImage(page, '#content > p:last-child', false);
  await expect(page.locator('#content [data-nabi-float] img')).toHaveCount(0);
  await expect(page.locator('#content > [data-nabi-p] > img')).toHaveCount(1);
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.undo();
    nabi.undo();
  });
  expect(await readDoc(page)).toEqual(before);
});

test('a drop inside code is rejected without losing or copying the source image', async ({ page }) => {
  await setDoc(page, [image, { w: 'p', ch: [{ w: 'code', ch: ['const value = 1;'] }] }, paragraph('Outside')]);
  const before = await readDoc(page);
  await dropImage(page, '#content pre code', true);
  expect(await readDoc(page)).toEqual(before);
  await expect(page.locator('#content img')).toHaveCount(1);
});

test('a document replacement during dragging cancels the move instead of pasting a stale copy', async ({ page }) => {
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const source = document.querySelector<HTMLImageElement>('#content img')!;
    const dataTransfer = new DataTransfer();
    const options = { dataTransfer, bubbles: true, cancelable: true };
    source.dispatchEvent(new DragEvent('dragstart', options));
    nabi.setJson([{ w: 'p', ch: ['Replaced document'] }]);
    const deletion = new InputEvent('beforeinput', { inputType: 'deleteByDrag', bubbles: true, cancelable: true });
    document.getElementById('content')!.dispatchEvent(deletion);
    const destination = document.querySelector<HTMLElement>('#content > p')!;
    const rect = destination.getBoundingClientRect();
    destination.dispatchEvent(new DragEvent('drop', { ...options, clientX: rect.left + 8, clientY: rect.bottom - 2 }));
    source.dispatchEvent(new DragEvent('dragend', options));
    return { doc: nabi.getJson(), preventedDeletion: deletion.defaultPrevented };
  });
  expect(result.preventedDeletion).toBe(true);
  expect(result.doc).toEqual([paragraph('Replaced document')]);
  await expect(page.locator('#content img')).toHaveCount(0);
});

test('clicking an image selects it without starting a move', async ({ page }) => {
  const before = await readDoc(page);
  await page.locator('#content img').click();
  await expect
    .poll(() => page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection()))
    .toEqual({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
  expect(await readDoc(page)).toEqual(before);
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
});

test('Escape cancels a native image drag and leaves ordinary caret editing usable', async ({ page }) => {
  const before = await readDoc(page);
  await beginNativeDrag(page);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  expect(await readDoc(page)).toEqual(before);
  const first = page.locator('#content > p').filter({ hasText: 'First' });
  const rect = (await first.boundingBox())!;
  await first.click({ position: { x: rect.width - 8, y: rect.height / 2 } });
  await page.keyboard.type('!');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('X');
  await expect(first).toHaveText('FirstX!');
  expect(await readDoc(page)).toEqual([paragraph('FirstX!'), image, initial[2], initial[3]]);
});

test('dropping an image into another editor copies it and dragend keeps the destination selection', async ({
  page,
}) => {
  const sourceDoc = await readDoc(page);
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const wrapper = document.createElement('div');
    wrapper.className = 'nabi';
    wrapper.style.cssText = 'position:fixed;right:20px;bottom:20px;width:340px;z-index:2000;background:white';
    const root = document.createElement('div');
    root.id = 'drag-target-content';
    root.className = 'nabi-content';
    root.style.minHeight = '100px';
    wrapper.append(root);
    document.body.append(wrapper);
    const { nabi, registry } = api.createNabiWith(api.defaultWings, { doc: [{ w: 'p', ch: [] }] });
    api.mountSurface({ nabi, registry, root });
    const source = document.querySelector<HTMLImageElement>('#content img')!;
    const transfer = new DataTransfer();
    source.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    const destination = root.querySelector<HTMLElement>('p')!;
    const rect = destination.getBoundingClientRect();
    destination.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
        clientX: rect.left + 8,
        clientY: rect.top + rect.height / 2,
      }),
    );
    (globalThis as unknown as { dragTarget: DragTarget }).dragTarget = { nabi, source, transfer };
  }, entry);
  await expect(page.locator('#drag-target-content img')).toHaveCount(1);
  expect(await readDoc(page)).toEqual(sourceDoc);
  expect(
    await page.evaluate(() => (globalThis as unknown as { dragTarget: DragTarget }).dragTarget.nabi.getJson()),
  ).toEqual([image]);
  const selection = await page.evaluate(() => {
    const { nabi, source, transfer } = (globalThis as unknown as { dragTarget: DragTarget }).dragTarget;
    const before = nabi.getSelection();
    source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    const root = document.getElementById('drag-target-content')!;
    const dom = document.getSelection()!;
    return {
      before,
      after: nabi.getSelection(),
      focused: document.activeElement === root,
      contained: root.contains(dom.anchorNode),
    };
  });
  expect(selection.after).toEqual(selection.before);
  expect(selection.focused).toBe(true);
  expect(selection.contained).toBe(true);
});

test('a detached source dragend releases ordinary selection, paste, and external drop handling', async ({ page }) => {
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const source = document.querySelector<HTMLImageElement>('#content img')!;
    const transfer = new DataTransfer();
    source.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    nabi.setJson([{ w: 'p', ch: ['Replacement'] }]);
    source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  const target = page.locator('#content > p');
  const rect = (await target.boundingBox())!;
  await target.click({ position: { x: rect.width - 8, y: rect.height / 2 } });
  await page.keyboard.type('!');
  await expect(target).toHaveText('Replacement!');
  await page.evaluate(() => {
    const root = document.getElementById('content')!;
    const transfer = new DataTransfer();
    transfer.setData('text/plain', 'paste');
    root.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
  });
  await expect(target).toHaveText('Replacement!paste');
  await page.evaluate(() => {
    const paragraph = document.querySelector<HTMLElement>('#content > p')!;
    const rect = paragraph.getBoundingClientRect();
    const transfer = new DataTransfer();
    transfer.setData('text/plain', 'drop');
    paragraph.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
        clientX: rect.right - 8,
        clientY: rect.top + rect.height / 2,
      }),
    );
  });
  await expect(target).toHaveText('Replacement!pastedrop');
  await expect(page.locator('#content img, .nabi-media-drop')).toHaveCount(0);
});

test('dropping after an empty paragraph keeps that paragraph before the moved image', async ({ page }) => {
  const empty = { w: 'p', ch: [] };
  await setDoc(page, [initial[0], image, empty, initial[3]]);
  await dropImage(page, '#content > p:nth-child(3)', true);
  expect(await readDoc(page)).toEqual([initial[0], empty, image, initial[3]]);
});
