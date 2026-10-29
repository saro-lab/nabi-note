import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1050 });
  await page.goto('/float.html');
  await expect(page.locator('#content [data-nabi-float]')).toBeVisible();
});

test('editor and preview wrap; comparison keeps placement and clears following blocks', async ({ page }, info) => {
  const geometry = await page.evaluate(() => {
    const read = (selector: string) => {
      const root = document.querySelector<HTMLElement>(selector)!;
      const region = root.querySelector<HTMLElement>('[data-nabi-float]')!;
      const box = region.parentElement!;
      const row = box.closest('.nabi-diff-block');
      const next = (row ?? box).nextElementSibling!;
      const rect = box.getBoundingClientRect();
      const style = getComputedStyle(root);
      const available = root.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return {
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        available,
        next: next.getBoundingClientRect().top,
        float: getComputedStyle(box).float,
        outline: getComputedStyle(region).outlineStyle,
      };
    };
    return {
      editor: read('#content'),
      preview: read('#reader'),
      before: read('.nabi-diff-before .nabi-diff-doc'),
      after: read('.nabi-diff-after .nabi-diff-doc'),
    };
  });
  expect(geometry.editor.float).toBe('right');
  expect(geometry.editor.width).toBeLessThanOrEqual(geometry.editor.available * 0.4 + 1);
  expect(geometry.editor.next).toBeLessThan(geometry.editor.bottom);
  expect(geometry.editor.outline).toBe('dashed');
  expect(geometry.preview.outline).toBe('none');
  expect(geometry.preview.width).toBeCloseTo(geometry.editor.width, 0);
  expect(geometry.preview.next - geometry.preview.top).toBeCloseTo(geometry.editor.next - geometry.editor.top, 0);
  expect(geometry.before.float).toBe('left');
  expect(geometry.after.float).toBe('right');
  expect(geometry.before.next).toBeGreaterThanOrEqual(geometry.before.bottom);
  expect(geometry.after.next).toBeGreaterThanOrEqual(geometry.after.bottom);
  await page.locator('#content [data-nabi-float] > p').first().click();
  await expect(page.locator('#context').getByRole('slider')).toBeVisible();
  await page.screenshot({ path: info.outputPath('float-desktop.png') });
});

test('property controls edit side and all width steps, preserve focus and undo', async ({ page }) => {
  const region = page.locator('#content [data-nabi-float]');
  await region.locator('p').first().click();
  await page.locator('#context').getByRole('button', { name: '왼쪽', exact: true }).click();
  await expect(region).toHaveAttribute('data-nabi-float', 'left');
  const slider = page.locator('#context').getByRole('slider', { name: '최대 너비' });
  await slider.press('Home');
  await expect(region).toHaveAttribute('data-nabi-float-width', '20');
  for (const width of ['30', '40', '50']) {
    await slider.press('ArrowRight');
    await expect(region).toHaveAttribute('data-nabi-float-width', width);
    await expect(slider).toBeFocused();
  }
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  await expect(region).toHaveAttribute('data-nabi-float-width', '40');
  await page.locator('#context').getByRole('button', { name: '플로트 영역 해제' }).click();
  await expect(region).toHaveCount(0);
  await expect(page.locator('#content')).toContainText('방문 안내');
  await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo());
  await expect(region).toHaveCount(1);
});

test('narrow containers stack editor and reader but keep comparison floats', async ({ page }, info) => {
  await page.getByRole('button', { name: '좁은 본문', exact: true }).click();
  const box = page.locator('#content > [data-nabi-p]:has(> [data-nabi-float])');
  await expect(box).toHaveCSS('float', 'none');
  await expect(page.locator('#reader > [data-nabi-p]:has(> [data-nabi-float])')).toHaveCSS('float', 'none');
  await expect(page.locator('.nabi-diff-after [data-nabi-p]:has(> [data-nabi-float])')).toHaveCSS('float', 'right');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(box).toHaveCSS('float', 'none');
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.width);
  await page.screenshot({ path: info.outputPath('float-mobile.png') });
  await page.getByRole('button', { name: '어두운 테마' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.screenshot({ path: info.outputPath('float-mobile-dark.png') });
});

test('actual modal preview contains floats without edit decorations', async ({ page }) => {
  await page.getByRole('button', { name: '미리보기', exact: true }).click();
  const preview = page.locator('.nabi-preview-body');
  await expect(preview).toBeVisible();
  await expect(preview.locator('[data-nabi-float]')).toHaveCSS('outline-style', 'none');
  await expect(preview.locator('[data-nabi-p]:has(> [data-nabi-float])')).toHaveCSS('float', 'right');
  await page.keyboard.press('Escape');
  await expect(preview).toHaveCount(0);
});

test('HTML clipboard copy and paste keeps float content and placement', async ({ page }) => {
  const result = await page.evaluate(() => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.select({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 1 } });
    const surface = document.querySelector<HTMLElement>('#content')!;
    const data = new DataTransfer();
    surface.dispatchEvent(new ClipboardEvent('copy', { clipboardData: data, bubbles: true, cancelable: true }));
    const html = data.getData('text/html');
    nabi.setJson([{ w: 'p', ch: [] }]);
    nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
    surface.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    return { html, doc: nabi.getHtml() };
  });
  expect(result.html).toContain('data-nabi-float="right"');
  await expect(page.locator('#content [data-nabi-float]')).toHaveAttribute('data-nabi-float-width', '40');
  await expect(page.locator('#content [data-nabi-float]')).toContainText('방문 안내');
});

for (const entry of ['drop', 'paste', 'picker'] as const) {
  test(`${entry} keeps upload progress and the finished image inside the starting float`, async ({ page }) => {
    const region = page.locator('#content [data-nabi-float]');
    await region.locator(':scope > p').first().click();
    const before = await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.getJson());
    const image = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 80;
      const context = canvas.getContext('2d')!;
      context.fillStyle = 'blue';
      context.fillRect(0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png').split(',')[1]!;
    });
    const chooser =
      entry === 'picker'
        ? await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('#toolbar').getByRole('button', { name: '파일 업로드', exact: true }).click(),
          ]).then(([chooser]) => chooser)
        : null;
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    if (chooser) {
      await chooser.setFiles({ name: 'float-upload.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
    } else {
      await page.evaluate(
        ({ entry, image }) => {
          const root = document.querySelector<HTMLElement>('#content')!;
          const paragraph = root.querySelector<HTMLElement>('[data-nabi-float] > p')!;
          const transfer = new DataTransfer();
          const bytes = Uint8Array.from(atob(image), (char) => char.charCodeAt(0));
          transfer.items.add(new File([bytes], 'float-upload.png', { type: 'image/png' }));
          if (entry === 'paste') {
            root.dispatchEvent(
              new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }),
            );
          } else {
            const rect = paragraph.getBoundingClientRect();
            paragraph.dispatchEvent(
              new DragEvent('drop', {
                dataTransfer: transfer,
                clientX: rect.left + 10,
                clientY: rect.top + rect.height / 2,
                bubbles: true,
                cancelable: true,
              }),
            );
          }
        },
        { entry, image },
      );
    }
    const placeholder = region.locator(':scope > nabi-upload');
    await expect(placeholder).toBeVisible();
    await expect(page.locator('#content > nabi-upload')).toHaveCount(0);
    await expect(placeholder.locator('img')).toBeVisible();
    const placement = await placeholder.evaluate((box) => {
      const parent = box.parentElement!.getBoundingClientRect();
      const rect = box.getBoundingClientRect();
      return {
        previous: box.previousElementSibling?.textContent,
        contained: rect.left >= parent.left && rect.right <= parent.right + 1 && rect.bottom <= parent.bottom + 1,
      };
    });
    expect(placement).toEqual({ previous: '방문 안내', contained: true });
    await page.evaluate(() => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      nabi.select({ anchor: { path: [2], offset: 0 }, focus: { path: [2], offset: 0 } });
    });
    await page.clock.runFor(1_500);
    await expect(page.locator('#content nabi-upload')).toHaveCount(0);
    const finished = region.locator(':scope > [data-nabi-p] > img');
    await expect(finished).toBeVisible();
    expect(await finished.evaluate((img) => img.parentElement?.previousElementSibling?.textContent)).toBe('방문 안내');
    const result = await page.evaluate(() => {
      const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
      const selection = nabi.getSelection();
      const doc = nabi.getJson();
      nabi.undo();
      return { selection, doc, undone: nabi.getJson() };
    });
    expect((result.doc as unknown[]).slice(2)).toEqual((before as unknown[]).slice(2));
    expect(result.selection.focus.path.slice(0, 2)).toEqual([1, 0]);
    expect(result.undone).toEqual(before);
  });
}
