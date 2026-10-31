import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const paragraph = (text: string) => ({ w: 'p', ch: [text] });
const table = {
  w: 'p',
  a: { a: 'c' },
  ch: [
    {
      w: 'table',
      a: { full: 1 },
      ch: [{ w: 'tr', ch: [{ w: 'td', a: { bg: 'cyan' }, ch: [paragraph('Cell text')] }] }],
    },
  ],
};
const region = {
  w: 'p',
  ch: [{ w: 'float', a: { side: 'right', w: 40 }, ch: [paragraph('Float text')] }],
};
const details = {
  w: 'p',
  ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['Details title'] }, paragraph('Details text')] }],
};
const code = {
  w: 'p',
  ch: [{ w: 'code', a: { lang: 'typescript' }, ch: ['  const x = 1;', { w: 'br', ch: [] }, 'console.log(x);'] }],
};
const quote = {
  w: 'p',
  ch: [
    {
      w: 'quote',
      ch: [paragraph('Quote text'), { w: 'p', ch: [{ w: 'b', ch: ['More quote text'] }] }],
    },
  ],
};
const image = { w: 'p', a: { a: 'r' }, ch: [{ w: 'img', a: { src: '/move-image.svg', w: '40' }, ch: [] }] };
const video = { w: 'p', a: { a: 'r' }, ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '60' }, ch: [] }] };
const handle = (kind: string) => `.nabi-move-handle[data-nabi-move="${kind}"]`;

async function readDoc(page: Page): Promise<unknown> {
  return page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getJson());
}

async function setDoc(page: Page, doc: unknown): Promise<void> {
  await page.waitForFunction(() => Boolean((globalThis as unknown as { nabi?: Nabi }).nabi));
  await page.evaluate((doc) => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson(doc);
    document.getElementById('content')!.focus({ preventScroll: true });
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  }, doc);
}

async function beginMouseMove(page: Page, kind: string, target = '#content > p:last-child') {
  const grip = page.locator(handle(kind));
  await expect(grip).toBeVisible();
  const source = (await grip.boundingBox())!;
  const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const destination = (await page.locator(target).boundingBox())!;
  const end = { x: destination.x + 12, y: destination.y + destination.height - 2 };
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await expect(page.locator('.nabi-move-handle:visible')).toHaveCount(0);
  return { start, end };
}

async function expectHandleAtBlock(page: Page, kind: string, selector: string) {
  const grip = page.locator(handle(kind));
  await expect(grip).toBeVisible();
  await expect
    .poll(async () => {
      const button = (await grip.boundingBox())!;
      const block = (await page.locator(selector).boundingBox())!;
      return Math.abs(button.y + button.height - block.y - 4);
    })
    .toBeLessThan(1);
}

async function expectMovePreview(page: Page, box: { x: number; y: number; width: number; height: number }) {
  const preview = page.locator('.nabi-move-preview');
  await expect(preview).toBeVisible();
  await expect(page.locator('.nabi-move-handle:visible')).toHaveCount(0);
  await expect(preview).toHaveCSS('opacity', '0.5');
  await expect(preview).toHaveCSS('position', 'fixed');
  await expect(preview).toHaveCSS('pointer-events', 'none');
  await expect(preview).toHaveAttribute('aria-hidden', 'true');
  expect(
    await preview.evaluate((element) => element.parentElement === document.body && element.hasAttribute('inert')),
  ).toBe(true);
  const actual = (await preview.boundingBox())!;
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(actual[key] - box[key])).toBeLessThan(1);
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1050 });
  await page.route('**/move-image.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="teal"/></svg>',
    }),
  );
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html><body>Video player</body></html>' }),
  );
  await page.goto('/');
});

for (const width of [390, 1280]) {
  test(`image move handle follows context-row expansion and collapse without content resizing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1050 });
    await setDoc(page, [paragraph('First'), image, paragraph('Last')]);
    await page.evaluate(() => {
      document.documentElement.style.setProperty('overflow-anchor', 'none');
      document.body.style.setProperty('overflow-anchor', 'none');
      const context = document.getElementById('context')!;
      context.style.height = '0px';
      context.style.minHeight = '0';
      context.style.paddingBlock = '0';
      context.style.overflow = 'hidden';
      const content = document.getElementById('content')!;
      content.style.height = '320px';
      content.style.minHeight = '0';
      document.getElementById('app')!.scrollIntoView({ block: 'center' });
    });
    await page.locator('#content img').click();
    await expect(page.locator(handle('img'))).toBeVisible();
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );

    const layout = () =>
      page.evaluate(() => {
        const content = document.getElementById('content')!.getBoundingClientRect();
        const image = document.querySelector<HTMLElement>('#content img')!.getBoundingClientRect();
        const grip = document
          .querySelector<HTMLElement>('.nabi-move-handle[data-nabi-move="img"]')!
          .getBoundingClientRect();
        return {
          top: content.top,
          width: content.width,
          height: content.height,
          overlap: grip.bottom - image.top,
          scroll: window.scrollY,
        };
      });
    await expect.poll(async () => Math.abs((await layout()).overlap - 4)).toBeLessThan(1);
    const before = await layout();

    await page.locator('#context').evaluate((element) => {
      (element as HTMLElement).style.height = '96px';
    });
    await expect.poll(async () => Math.abs((await layout()).overlap - 4)).toBeLessThan(1);
    const expanded = await layout();
    expect(expanded.top - before.top).toBeGreaterThan(90);
    expect(expanded.width).toBe(before.width);
    expect(expanded.height).toBe(before.height);
    expect(expanded.scroll).toBe(before.scroll);

    await page.locator('#context').evaluate((element) => {
      (element as HTMLElement).style.height = '0px';
    });
    await expect.poll(async () => Math.abs((await layout()).overlap - 4)).toBeLessThan(1);
    const collapsed = await layout();
    expect(Math.abs(collapsed.top - before.top)).toBeLessThan(1);
    expect(collapsed.width).toBe(before.width);
    expect(collapsed.height).toBe(before.height);
    expect(collapsed.scroll).toBe(before.scroll);
  });
}

for (const [kind, block, text, selector, content] of [
  ['float', region, '#content [data-nabi-float] > p', '#content [data-nabi-float]', 'Float text'],
  ['table', table, '#content td > p', '#content table', 'Cell text'],
  ['details', details, '#content details > p', '#content details', 'Details text'],
  ['code', code, '#content pre code', '#content pre', 'const x = 1;'],
  ['quote', quote, '#content blockquote > p:first-child', '#content blockquote', 'Quote text'],
] as const) {
  test(`${kind} caret exposes an external handle that moves the complete block in one undo step`, async ({ page }) => {
    const initial = [paragraph('First'), block, paragraph('Middle'), paragraph('Last')];
    await setDoc(page, initial);
    await page.locator(text).click();
    const before = await readDoc(page);
    await expect(page.locator(handle(kind))).toBeVisible();
    expect(await page.locator(handle(kind)).evaluate((button) => button.closest('[contenteditable]'))).toBeNull();
    await page.screenshot({ path: test.info().outputPath(`${kind}-handle-desktop.png`) });
    const source = (await page.locator(selector).boundingBox())!;
    const { start, end } = await beginMouseMove(page, kind);
    await expect(page.locator('.nabi-media-drop')).toBeVisible();
    const previewBox = { ...source, x: source.x + end.x - start.x, y: source.y + end.y - start.y };
    await expectMovePreview(page, previewBox);
    await expect(page.locator('.nabi-move-preview')).toContainText(content);
    await page.mouse.move(end.x + 24, end.y - 4);
    await expectMovePreview(page, { ...previewBox, x: previewBox.x + 24, y: previewBox.y - 4 });
    await page.screenshot({ path: test.info().outputPath(`${kind}-drag-desktop.png`) });
    expect(await readDoc(page)).toEqual(before);
    expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getHtml())).not.toContain(
      'nabi-move-preview',
    );
    await page.mouse.up();
    await expect(page.locator('.nabi-media-drop, .nabi-move-preview')).toHaveCount(0);
    await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
    await expectHandleAtBlock(page, kind, selector);
    const html = await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getHtml());
    expect(html).not.toContain('nabi-move-handle');
    expect(html).not.toContain('data-nabi-move');
    expect(html).not.toContain('nabi-media-drop');
    expect(html).not.toContain('nabi-move-preview');
    await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
    expect(await readDoc(page)).toEqual(before);
    await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.redo());
    expect(await readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
  });

  test(`${kind} handle follows the same block across consecutive moves`, async ({ page }) => {
    const initial = [paragraph('First'), block, paragraph('Middle'), paragraph('Last')];
    await setDoc(page, initial);
    await page.locator(text).click();
    await beginMouseMove(page, kind);
    await page.mouse.up();
    await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
    await beginMouseMove(page, kind, '#content > p:first-child');
    await page.mouse.up();
    await expect.poll(() => readDoc(page)).toEqual(initial);
  });

  test(`${kind} handle supports keyboard movement and restores the complete block on undo`, async ({ page }) => {
    const initial = [paragraph('First'), block, paragraph('Middle'), paragraph('Last')];
    await setDoc(page, initial);
    await page.locator(text).click();
    await page.locator(handle(kind)).focus();
    await page.locator(handle(kind)).press('Alt+ArrowDown');
    await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], block, initial[3]]);
    await expect(page.locator(handle(kind))).toBeFocused();
    await page.keyboard.press('Alt+ArrowDown');
    await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
    await expect(page.locator(handle(kind))).toBeFocused();
    await page.evaluate(() => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      nabi.undo();
      nabi.undo();
    });
    expect(await readDoc(page)).toEqual(initial);
  });
}

test('a closed details summary exposes a move handle without opening the body', async ({ page }) => {
  const closed = { w: 'p', ch: [{ w: 'details', ch: details.ch[0]!.ch }] };
  const initial = [paragraph('First'), closed, paragraph('Last')];
  await setDoc(page, initial);
  await page.evaluate(() => {
    (globalThis as unknown as { nabi: Nabi }).nabi.select({
      anchor: { path: [1, 0, 0], offset: 3 },
      focus: { path: [1, 0, 0], offset: 3 },
    });
  });
  await expect(page.locator(handle('details'))).toBeVisible();
  await beginMouseMove(page, 'details');
  await page.mouse.up();
  await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], closed]);
  await expect(page.locator('#content details')).not.toHaveAttribute('open');
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(initial);
});

test('a table inside a float exposes both handles and moving the table preserves the float text', async ({ page }) => {
  const nested = {
    w: 'p',
    ch: [{ w: 'float', a: { side: 'right', w: 40 }, ch: [table, paragraph('Float remainder')] }],
  };
  await setDoc(page, [paragraph('First'), nested, paragraph('Outside')]);
  await page.locator('#content td > p').click();
  await expect(page.locator(handle('table'))).toBeVisible();
  await expect(page.locator(handle('float'))).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('nested-handles-desktop.png') });
  const before = await readDoc(page);
  await beginMouseMove(page, 'table');
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
  await page.mouse.up();
  await expect(page.locator('#content [data-nabi-float] table')).toHaveCount(0);
  await expect(page.locator('#content [data-nabi-float] > p')).toHaveText('Float remainder');
  await expect(page.locator('#content > [data-nabi-p]:last-child table')).toHaveCount(1);
  await expectHandleAtBlock(page, 'table', '#content table');
  await expect(page.locator(handle('float'))).toHaveCount(0);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(before);
});

test('dragging over another table reorders whole tables without nesting or losing cells', async ({ page }) => {
  const other = {
    w: 'p',
    ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [paragraph('Other table')] }] }] }],
  };
  const initial = [paragraph('First'), table, other, paragraph('Last')];
  await setDoc(page, initial);
  await page.locator('#content td > p').first().click();
  await beginMouseMove(page, 'table', '#content > [data-nabi-p]:nth-child(3) td > p');
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
  await page.mouse.up();
  await expect.poll(() => readDoc(page)).toEqual([initial[0], other, table, initial[3]]);
  await expect(page.locator('#content td table')).toHaveCount(0);
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(initial);
});

for (const [kind, block, sourceText] of [
  ['code', code, '#content pre code'],
  ['quote', quote, '#content blockquote > p:first-child'],
] as const) {
  for (const after of [false, true]) {
    test(`dragging ${kind} onto another code box moves the whole source ${after ? 'after' : 'before'} it`, async ({
      page,
    }) => {
      const other = {
        w: 'p',
        ch: [{ w: 'code', a: { lang: 'python' }, ch: ['if True:', { w: 'br', ch: [] }, '    print("Other code")'] }],
      };
      const initial = [paragraph('First'), block, paragraph('Middle'), other, paragraph('Last')];
      await setDoc(page, initial);
      await page.locator(sourceText).first().click();
      const target = '#content > [data-nabi-p]:nth-child(4) pre';
      await beginMouseMove(page, kind, target);
      if (!after) {
        const destination = (await page.locator(target).boundingBox())!;
        await page.mouse.move(destination.x + 12, destination.y + 2);
      }
      await expect(page.locator('.nabi-media-drop')).toBeVisible();
      await page.mouse.up();
      await expect
        .poll(() => readDoc(page))
        .toEqual([initial[0], initial[2], ...(after ? [other, block] : [block, other]), initial[4]]);
      await expect(page.locator('#content pre')).toHaveCount(kind === 'code' ? 2 : 1);
      await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
      expect(await readDoc(page)).toEqual(initial);
    });
  }
}

test('a short handle click, self drop, and Escape keep the document unchanged', async ({ page }) => {
  await setDoc(page, [paragraph('First'), table, paragraph('Last')]);
  await page.locator('#content td > p').click();
  const before = await readDoc(page);
  const grip = (await page.locator(handle('table')).boundingBox())!;
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await expect(page.locator(handle('table'))).toBeVisible();
  await page.mouse.move(grip.x + grip.width / 2 + 3, grip.y + grip.height / 2);
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await page.mouse.up();
  expect(await readDoc(page)).toEqual(before);
  await beginMouseMove(page, 'table', '#content td > p');
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  await expect(page.locator('.nabi-move-preview')).toBeVisible();
  await page.mouse.up();
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await expectHandleAtBlock(page, 'table', '#content table');
  expect(await readDoc(page)).toEqual(before);
  await beginMouseMove(page, 'table');
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
  await expect(page.locator('.nabi-move-preview')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await expectHandleAtBlock(page, 'table', '#content table');
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  expect(await readDoc(page)).toEqual(before);
});

test('replacing the document during a handle drag cancels the stale move', async ({ page }) => {
  await setDoc(page, [paragraph('First'), table, paragraph('Last')]);
  await page.locator('#content td > p').click();
  await beginMouseMove(page, 'table');
  await expect(page.locator('.nabi-media-drop')).toBeVisible();
  await expect(page.locator('.nabi-move-preview')).toBeVisible();
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.setJson([{ w: 'p', ch: ['Replacement'] }]));
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop')).toHaveCount(0);
  expect(await readDoc(page)).toEqual([paragraph('Replacement')]);
});

test('dragging near an editor scroll edge scrolls that editor before the outer page', async ({ page }) => {
  const initial = [paragraph('First'), table, ...Array.from({ length: 20 }, (_, index) => paragraph(`Row ${index}`))];
  await setDoc(page, initial);
  await page.locator('#content').evaluate((element) => {
    const root = element as HTMLElement;
    root.style.height = '280px';
    root.style.minHeight = '0';
    root.style.overflowY = 'auto';
    root.scrollIntoView({ block: 'center' });
  });
  await page.locator('#content td > p').click();
  const grip = page.locator(handle('table'));
  await expect(grip).toBeVisible();
  const source = (await grip.boundingBox())!;
  const edge = (await page.locator('#content').boundingBox())!;
  const outerScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.x + 12, edge.y + edge.height - 12, { steps: 8 });
  await expect(grip).toBeHidden();
  await expect.poll(() => page.locator('#content').evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(outerScroll);
  await expect(page.locator('.nabi-move-preview')).toBeVisible();
  await expect(grip).toBeHidden();
  await page.mouse.up();
  await expect(page.locator('.nabi-media-drop, .nabi-move-preview')).toHaveCount(0);
  await expect(page.locator('#content table')).toHaveCount(1);
  expect(await readDoc(page)).not.toEqual(initial);
  await expectHandleAtBlock(page, 'table', '#content table');
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  expect(await readDoc(page)).toEqual(initial);
});

test('page scrolling during a drag keeps handles hidden and Escape restores the current position', async ({ page }) => {
  const initial = [
    ...Array.from({ length: 20 }, (_, index) => paragraph(`Before ${index}`)),
    table,
    ...Array.from({ length: 20 }, (_, index) => paragraph(`After ${index}`)),
  ];
  await setDoc(page, initial);
  await page.locator('#content td > p').click();
  await page.locator('#content table').evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expectHandleAtBlock(page, 'table', '#content table');
  const grip = page.locator(handle('table'));
  const source = (await grip.boundingBox())!;
  const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 20, start.y + 12);
  await expect(grip).toBeHidden();
  await expect(page.locator('.nabi-move-preview')).toBeVisible();
  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollBy(0, 80));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll);
  await expect(page.locator('.nabi-move-handle:visible')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
  await expectHandleAtBlock(page, 'table', '#content table');
  await page.mouse.up();
  expect(await readDoc(page)).toEqual(initial);
});

test.describe('touch handles', () => {
  test.use({ hasTouch: true });

  test('an interrupted touch drag removes the marker and keeps the image in place', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const initial = [paragraph('First'), image, paragraph('Last')];
    await setDoc(page, initial);
    await page.locator('#content img').tap();
    await expect(page.locator(handle('img'))).toBeVisible();
    await page.evaluate(() => {
      const grip = document.querySelector<HTMLElement>('.nabi-move-handle[data-nabi-move="img"]')!;
      const source = grip.getBoundingClientRect();
      const destination = document.querySelector<HTMLElement>('#content > p:last-child')!.getBoundingClientRect();
      const options = {
        bubbles: true,
        cancelable: true,
        pointerId: 42,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
      };
      grip.dispatchEvent(
        new PointerEvent('pointerdown', {
          ...options,
          buttons: 1,
          clientX: source.left + source.width / 2,
          clientY: source.top + source.height / 2,
        }),
      );
      grip.dispatchEvent(
        new PointerEvent('pointermove', {
          ...options,
          buttons: 1,
          clientX: destination.left + 12,
          clientY: destination.bottom - 2,
        }),
      );
    });
    await expect(page.locator('.nabi-media-drop')).toBeVisible();
    await expect(page.locator('.nabi-move-preview')).toBeVisible();
    await expect(page.locator(handle('img'))).toBeHidden();
    await page
      .locator(handle('img'))
      .dispatchEvent('pointercancel', { bubbles: true, pointerId: 42, pointerType: 'touch' });
    await expect(page.locator('.nabi-media-drop, .nabi-move-preview')).toHaveCount(0);
    await expectHandleAtBlock(page, 'img', '#content img');
    expect(await readDoc(page)).toEqual(initial);
  });

  for (const [kind, block, selector] of [
    ['img', image, '#content img'],
    ['youtube', video, '#content iframe'],
    ['details', details, '#content details'],
    ['code', code, '#content pre'],
    ['quote', quote, '#content blockquote'],
  ] as const) {
    test(`a selected ${kind} moves through its touch pointer handle and can be undone`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const initial = [paragraph('First'), block, paragraph('Middle'), paragraph('Last')];
      await setDoc(page, initial);
      await page.locator(selector).scrollIntoViewIfNeeded();
      const media = (await page.locator(selector).boundingBox())!;
      if (kind === 'details') await page.locator('#content details > p').tap();
      else await page.touchscreen.tap(media.x + media.width / 2, media.y + media.height / 2);
      await expect(page.locator(handle(kind))).toBeVisible();
      await page.screenshot({ path: test.info().outputPath(`${kind}-handle-mobile.png`) });
      const before = await readDoc(page);
      const movement = await page.evaluate(
        ({ kind, selector }) => {
          const grip = document.querySelector<HTMLElement>(`.nabi-move-handle[data-nabi-move="${kind}"]`)!;
          const source = grip.getBoundingClientRect();
          const destination = document.querySelector<HTMLElement>('#content > p:last-child')!.getBoundingClientRect();
          const media = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
          const start = { x: source.left + source.width / 2, y: source.top + source.height / 2 };
          const end = { x: destination.left + 12, y: destination.bottom - 2 };
          const options = {
            bubbles: true,
            cancelable: true,
            pointerId: 42,
            pointerType: 'touch',
            isPrimary: true,
            button: 0,
          };
          grip.dispatchEvent(
            new PointerEvent('pointerdown', {
              ...options,
              buttons: 1,
              clientX: start.x,
              clientY: start.y,
            }),
          );
          grip.dispatchEvent(
            new PointerEvent('pointermove', {
              ...options,
              buttons: 1,
              clientX: end.x,
              clientY: end.y,
            }),
          );
          return {
            end,
            box: {
              x: media.x + end.x - start.x,
              y: media.y + end.y - start.y,
              width: media.width,
              height: media.height,
            },
          };
        },
        { kind, selector },
      );
      await expectMovePreview(page, movement.box);
      expect(await readDoc(page)).toEqual(before);
      if (kind === 'youtube') {
        await expect(page.locator('.nabi-move-preview iframe')).toHaveCount(0);
        await expect(page.locator('iframe')).toHaveCount(1);
      } else if (kind === 'img') {
        await expect(page.locator('.nabi-move-preview img')).toHaveAttribute('src', '/move-image.svg');
      }
      await page.screenshot({ path: test.info().outputPath(`${kind}-drag-mobile.png`) });
      await page.locator(handle(kind)).dispatchEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        pointerId: 42,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
        buttons: 0,
        clientX: movement.end.x,
        clientY: movement.end.y,
      });
      await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
      await expect(page.locator('.nabi-media-drop, .nabi-move-preview')).toHaveCount(0);
      await expect(page.locator(handle(kind))).toBeVisible();
      await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
      expect(await readDoc(page)).toEqual(before);
    });

    test(`real Chromium touch dragging moves ${kind} without scrolling the page`, async ({
      page,
      context,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', 'Chromium CDP supplies native touch move events.');
      await page.setViewportSize({ width: 390, height: 844 });
      const initial = [paragraph('First'), block, paragraph('Middle'), paragraph('Last')];
      await setDoc(page, initial);
      await page.locator(selector).scrollIntoViewIfNeeded();
      const media = (await page.locator(selector).boundingBox())!;
      if (kind === 'details') await page.locator('#content details > p').tap();
      else await page.touchscreen.tap(media.x + media.width / 2, media.y + media.height / 2);
      const grip = page.locator(handle(kind));
      await expect(grip).toBeVisible();
      const source = (await grip.boundingBox())!;
      const destination = (await page.locator('#content > p:last-child').boundingBox())!;
      const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
      const end = { x: destination.x + 12, y: destination.y + destination.height - 2 };
      const scroll = await page.evaluate(() => window.scrollY);
      const session = await context.newCDPSession(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
      for (let step = 1; step <= 8; step += 1) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            { x: start.x + ((end.x - start.x) * step) / 8, y: start.y + ((end.y - start.y) * step) / 8, id: 1 },
          ],
        });
      }
      await expect(page.locator('.nabi-media-drop')).toBeVisible();
      await expect(page.locator('.nabi-move-preview')).toBeVisible();
      await expect(page.locator('.nabi-move-preview')).toHaveCSS('opacity', '0.5');
      await expect(grip).toBeHidden();
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await session.detach();
      await expect(page.locator('.nabi-move-preview')).toHaveCount(0);
      await expect.poll(() => readDoc(page)).toEqual([initial[0], initial[2], initial[3], block]);
      await expect(grip).toBeVisible();
      expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    });
  }
});
