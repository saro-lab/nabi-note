import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const video = { w: 'p', a: { a: 'r' }, ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '60' }, ch: [] }] };
const paragraph = (text: string) => ({ w: 'p', ch: [text] });
const initial = [paragraph('First'), video, paragraph('Middle'), paragraph('Last')];
const videoSelector = '#content [data-nabi-p]:has(> iframe)';

async function readDoc(page: Page): Promise<unknown> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getJson());
}

async function setDoc(page: Page, doc: unknown): Promise<void> {
  await page.evaluate((doc) => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson(doc);
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  }, doc);
  await expect(page.locator('#content iframe')).toBeVisible();
}

async function dropVideo(page: Page, target: string, after: boolean): Promise<void> {
  await page.evaluate(
    ({ target, after }) => {
      const source = document.querySelector<HTMLElement>('#content [data-nabi-p]:has(> iframe)')!;
      const transfer = new DataTransfer();
      const options = { dataTransfer: transfer, bubbles: true, cancelable: true };
      source.dispatchEvent(new DragEvent('dragstart', options));
      const destination = document.querySelector<HTMLElement>(target)!;
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
  const source = page.locator(videoSelector);
  await source.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const rect = (await source.boundingBox())!;
  const start = { x: rect.x + rect.width / 2, y: rect.y + 8 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 12, start.y, { steps: 3 });
  const target = (await page.locator('#content > p').filter({ hasText: 'Last' }).boundingBox())!;
  await page.mouse.move(target.x + 16, target.y + target.height - 2, { steps: 12 });
  await page.mouse.move(target.x + 16, target.y + target.height - 2);
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<html><body style="margin:0"><button style="width:100vw;height:100vh" onclick="parent.postMessage(\'nabi-test-video-click\',\'*\')">Play video</button></body></html>',
    }),
  );
  await page.goto('/');
  await page.evaluate(() => {
    const state = globalThis as unknown as { videoClicks: number };
    state.videoClicks = 0;
    window.addEventListener('message', (event) => {
      if (event.data === 'nabi-test-video-click') state.videoClicks += 1;
    });
  });
  await setDoc(page, initial);
  await expect(page.frameLocator('#content iframe').getByRole('button', { name: 'Play video' })).toBeVisible();
});

for (const selected of [false, true]) {
  test(`native YouTube dragging from its grip works when selected=${selected}`, async ({ page }) => {
    if (selected) {
      await page.evaluate(() => {
        const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
        nabi.select({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
      });
    }
    const before = await readDoc(page);
    await expect(page.locator(videoSelector)).toHaveAttribute('draggable', 'true');
    await beginNativeDrag(page);
    await page.mouse.up();
    await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
    await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], video]);
    await expect(page.locator(videoSelector)).toHaveAttribute('data-nabi-align', 'r');
    await expect(page.locator('#content iframe')).toHaveAttribute('data-nabi-width', '60');
    await expect(page.locator('#content iframe')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk',
    );
    expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getSelection())).toEqual({
      anchor: { path: [3], offset: 0 },
      focus: { path: [3], offset: 1 },
    });
    await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
    expect(await readDoc(page)).toEqual(before);
    await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.redo());
    expect(await readDoc(page)).toEqual([initial[0], initial[2], initial[3], video]);
  });
}

test('first video click selects, the next reaches the player, and preview has no drag grip', async ({ page }) => {
  const frame = page.locator('#content iframe');
  await expect(page.frameLocator('#content iframe').getByRole('button', { name: 'Play video' })).toBeVisible();
  await page.locator(videoSelector).screenshot({ path: test.info().outputPath('youtube-grip.png') });
  const first = (await frame.boundingBox())!;
  await page.mouse.click(first.x + first.width / 2, first.y + first.height / 2);
  await expect(frame).toHaveAttribute('data-nabi-picked');
  expect(await page.evaluate(() => (globalThis as unknown as { videoClicks: number }).videoClicks)).toBe(0);
  const second = (await frame.boundingBox())!;
  await page.mouse.click(second.x + second.width / 2, second.y + second.height / 2);
  await expect.poll(() => page.evaluate(() => (globalThis as unknown as { videoClicks: number }).videoClicks)).toBe(1);
  const stored = await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getHtml());
  expect(stored).not.toContain('draggable');
  expect(stored).not.toContain('data-nabi-picked');
  expect(stored).not.toContain('nabi-media-drop');
  await page.locator('#toolbar').getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.locator('.nabi-preview-body');
  await expect(preview).toBeVisible();
  await expect(preview.locator('iframe')).toHaveCount(1);
  await expect(preview.locator('[draggable]')).toHaveCount(0);
  expect(
    await preview
      .locator('[data-nabi-p]:has(> iframe)')
      .evaluate((element) => getComputedStyle(element, '::before').content),
  ).toBe('none');
  await page.keyboard.press('Escape');
});

test('YouTube videos move into table cells and floats and back without losing their attributes', async ({ page }) => {
  const table = {
    w: 'p',
    ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [paragraph('Cell')] }] }] }],
  };
  const region = { w: 'p', ch: [{ w: 'float', a: { side: 'right', w: 40 }, ch: [paragraph('Float')] }] };
  await setDoc(page, [video, table, region, paragraph('Outside')]);
  const before = await readDoc(page);
  await dropVideo(page, '#content td > p', true);
  await expect(page.locator('#content td iframe')).toHaveCount(1);
  await expect(page.locator('#content td > p')).toHaveText('Cell');
  await dropVideo(page, '#content [data-nabi-float] > p', true);
  await expect(page.locator('#content td iframe')).toHaveCount(0);
  await expect(page.locator('#content [data-nabi-float] iframe')).toHaveCount(1);
  await dropVideo(page, '#content > p:last-child', true);
  expect(await readDoc(page)).toEqual([table, region, paragraph('Outside'), video]);
  await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.undo();
    nabi.undo();
    nabi.undo();
  });
  expect(await readDoc(page)).toEqual(before);
});

test('self drops and cancelled native YouTube drags leave the document unchanged', async ({ page }) => {
  const before = await readDoc(page);
  await dropVideo(page, videoSelector, false);
  expect(await readDoc(page)).toEqual(before);
  await beginNativeDrag(page);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  expect(await readDoc(page)).toEqual(before);
  await expect(page.locator('#content iframe')).toHaveCount(1);
});

test('document replacement during a video drag cancels movement and native source deletion', async ({ page }) => {
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    const source = document.querySelector<HTMLElement>('#content [data-nabi-p]:has(> iframe)')!;
    const transfer = new DataTransfer();
    const options = { dataTransfer: transfer, bubbles: true, cancelable: true };
    source.dispatchEvent(new DragEvent('dragstart', options));
    nabi.setJson([{ w: 'p', ch: ['Replacement'] }]);
    const deletion = new InputEvent('beforeinput', { inputType: 'deleteByDrag', bubbles: true, cancelable: true });
    document.getElementById('content')!.dispatchEvent(deletion);
    const destination = document.querySelector<HTMLElement>('#content > p')!;
    const rect = destination.getBoundingClientRect();
    destination.dispatchEvent(new DragEvent('drop', { ...options, clientX: rect.left + 8, clientY: rect.bottom - 2 }));
    source.dispatchEvent(new DragEvent('dragend', options));
    return { doc: nabi.getJson(), preventedDeletion: deletion.defaultPrevented };
  });
  expect(result.preventedDeletion).toBe(true);
  expect(result.doc).toEqual([paragraph('Replacement')]);
  await expect(page.locator('#content iframe, .nabi-media-drop')).toHaveCount(0);
});
