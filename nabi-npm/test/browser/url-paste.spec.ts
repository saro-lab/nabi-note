import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;
const href = 'https://example.com/posts/1?a=2#top';

interface UrlPasteState {
  nabi: Nabi;
  resolve: (text: string) => void;
  args: readonly [string, boolean, string] | null;
  url: string;
}

test('pasting a whole URL creates a link immediately in the mounted editor', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#content')).toHaveAttribute('contenteditable', 'true');
  const immediate = await page.evaluate((href) => {
    const nabi = (globalThis as unknown as { nabi: Nabi }).nabi;
    nabi.setJson([{ w: 'p', ch: ['AB'] }]);
    const root = document.querySelector<HTMLElement>('#content')!;
    root.focus();
    const point = { path: [0], offset: 1 };
    nabi.select({ anchor: point, focus: point });
    const transfer = new DataTransfer();
    transfer.setData('text/plain', href);
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer });
    root.dispatchEvent(event);
    return { prevented: event.defaultPrevented, doc: nabi.getJson(), label: root.querySelector('a')?.textContent };
  }, href);
  expect(immediate).toEqual({
    prevented: true,
    doc: [{ w: 'p', ch: ['A', { w: 'a', a: { href }, ch: [href] }, 'B'] }],
    label: href,
  });
  await expect(page.locator('#content a')).toHaveAttribute('href', href);
  expect(await page.evaluate(() => (globalThis as unknown as { nabi: Nabi }).nabi.undo())).toBe(true);
  await expect(page.locator('#content p')).toHaveText('AB');
  await expect(page.locator('#content a')).toHaveCount(0);
});

test('an asynchronous URL label preserves native typing and the current caret', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    document.body.innerHTML = '<div class="nabi"><div id="url-content" class="nabi-content"></div></div>';
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      doc: [{ w: 'p', ch: ['AB'] }],
      typingMergeMs: 0,
    });
    const state: UrlPasteState = {
      nabi,
      resolve: () => {},
      args: null,
      url: `${location.origin}/posts/1?a=2#top`,
    };
    const pending = new Promise<string>((resolve) => {
      state.resolve = resolve;
    });
    const root = document.querySelector<HTMLElement>('#url-content')!;
    api.mountSurface({
      nabi,
      registry,
      root,
      onPasteUrl(url: string, isSameOrigin: boolean, path: string) {
        state.args = [url, isSameOrigin, path];
        return pending;
      },
    });
    (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest = state;
    root.focus();
    const point = { path: [0], offset: 1 };
    nabi.select({ anchor: point, focus: point });
  }, entry);

  const initial = await page.evaluate(() => {
    const state = (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest;
    const root = document.querySelector<HTMLElement>('#url-content')!;
    const transfer = new DataTransfer();
    transfer.setData('text/plain', state.url);
    root.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
    return { url: state.url, args: state.args, label: root.querySelector('a')?.textContent };
  });
  expect(initial.label).toBe(initial.url);
  expect(initial.args).toEqual([initial.url, true, '/posts/1?a=2#top']);

  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('#url-content')!;
    root.focus();
    const after = root.querySelector('p')!.lastChild!;
    document.getSelection()!.collapse(after, after.textContent!.length);
  });
  await page.keyboard.type('!');
  const originalDoc = [{ w: 'p', ch: ['A', { w: 'a', a: { href: initial.url }, ch: [initial.url] }, 'B!'] }];
  expect(
    await page.evaluate(() => (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest.nabi.getJson()),
  ).toEqual(originalDoc);
  await expect(page.locator('#url-content a')).toHaveText(initial.url);

  const label = 'Article title';
  await page.evaluate((label) => {
    (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest.resolve(label);
  }, label);
  await expect(page.locator('#url-content a')).toHaveText(label);
  const renamedDoc = [{ w: 'p', ch: ['A', { w: 'a', a: { href: initial.url }, ch: [label] }, 'B!'] }];
  const renamed = await page.evaluate(() => {
    const state = (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest;
    const selection = document.getSelection()!;
    return {
      doc: state.nabi.getJson(),
      selection: state.nabi.getSelection(),
      domText: selection.focusNode?.textContent,
      domOffset: selection.focusOffset,
    };
  });
  const point = { path: [0], offset: label.length + 3 };
  expect(renamed).toEqual({
    doc: renamedDoc,
    selection: { anchor: point, focus: point },
    domText: 'B!',
    domOffset: 2,
  });

  expect(
    await page.evaluate(() => (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest.nabi.undo()),
  ).toBe(true);
  expect(
    await page.evaluate(() => (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest.nabi.getJson()),
  ).toEqual(originalDoc);
  expect(
    await page.evaluate(() => (globalThis as unknown as { urlPasteTest: UrlPasteState }).urlPasteTest.nabi.redo()),
  ).toBe(true);
  await page.keyboard.type('?');
  await expect(page.locator('#url-content p')).toHaveText(`A${label}B!?`);
  await expect(page.locator('#url-content a')).toHaveText(label);
});
