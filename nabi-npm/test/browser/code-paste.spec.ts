import { expect, test, type Page } from '@playwright/test';
import type { Nabi } from '../../src/index.js';
import type { ElementNode, NabiDoc } from '../../src/schema/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;
const customMime = 'application/vnd.nabi.tree+json';
const p = (text: string): ElementNode => ({ w: 'p', ch: [text] });
const code = (text: string): ElementNode => ({
  w: 'p',
  ch: [
    {
      w: 'code',
      a: { lang: 'typescript' },
      ch: text
        .split('\n')
        .flatMap((line, index) => [...(index === 0 ? [] : [{ w: 'br', ch: [] }]), ...(line === '' ? [] : [line])]),
    },
  ],
});
const documentOf = (text: string, nested = false): NabiDoc => [
  nested
    ? {
        w: 'p',
        ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [code(text)] }] }] }],
      }
    : code(text),
  p('outside'),
];

interface CodePasteState {
  nabi: Nabi;
  path: readonly number[];
}

async function setup(page: Page, text: string, nested = false): Promise<void> {
  await page.goto('/');
  await expect(page.locator('#content')).toHaveAttribute('contenteditable', 'true');
  await page.evaluate(
    async ({ entry, doc, path }) => {
      const api = await import(/* @vite-ignore */ entry);
      document.body.innerHTML = '<div class="nabi"><div id="code-surface" class="nabi-content"></div></div>';
      const { nabi, registry } = api.createNabiWith(api.defaultWings, { doc, typingMergeMs: 0, locale: 'en' });
      api.injectSheets(document, api.collectSheets(registry, api.CORE_CSS));
      const root = document.getElementById('code-surface')!;
      api.mountSurface({ nabi, registry, root });
      (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest = { nabi, path };
      root.focus();
      const point = { path, offset: 0 };
      nabi.select({ anchor: point, focus: point });
    },
    { entry, doc: documentOf(text, nested), path: nested ? [0, 0, 0, 0, 0, 0] : [0, 0] },
  );
}

async function currentDoc(page: Page): Promise<unknown[]> {
  return page.evaluate(() => (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest.nabi.getJson());
}

for (const nested of [false, true]) {
  test(`cut source lines paste back into one code box ${nested ? 'inside a cell' : 'at the root'}`, async ({
    page,
  }) => {
    const source = 'start()\n  first()\n\tsecond()\nend()';
    const cutText = '  first()\n\tsecond()';
    const afterCut = 'start()\n\nend()';
    await setup(page, source, nested);
    const result = await page.evaluate(() => {
      const { nabi, path } = (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest;
      const root = document.getElementById('code-surface')!;
      const code = root.querySelector('pre > code')!;
      const children = [...code.childNodes];
      const breaks = children.flatMap((child, index) => (child.nodeName === 'BR' ? [index] : []));
      document.getSelection()!.setBaseAndExtent(code, breaks[0]! + 1, code, breaks[2]!);
      const transfer = new DataTransfer();
      const cut = new ClipboardEvent('cut', { bubbles: true, cancelable: true, clipboardData: transfer });
      root.dispatchEvent(cut);
      const cutDoc = nabi.getJson();
      const point = { path, offset: 'start()\n'.length };
      nabi.select({ anchor: point, focus: point });
      const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer });
      root.dispatchEvent(paste);
      return {
        cutPrevented: cut.defaultPrevented,
        pastePrevented: paste.defaultPrevented,
        plain: transfer.getData('text/plain'),
        custom: transfer.getData('application/vnd.nabi.tree+json'),
        cutDoc,
        pastedDoc: nabi.getJson(),
        selection: nabi.getSelection(),
      };
    });
    expect(result.cutPrevented).toBe(true);
    expect(result.pastePrevented).toBe(true);
    expect(result.plain).toBe(cutText);
    expect(result.custom).toContain('"w":"code"');
    expect(result.cutDoc).toEqual(documentOf(afterCut, nested));
    expect(result.pastedDoc).toEqual(documentOf(source, nested));
    const point = { path: nested ? [0, 0, 0, 0, 0, 0] : [0, 0], offset: 'start()\n'.length + cutText.length };
    expect(result.selection).toEqual({ anchor: point, focus: point });
    await expect(page.locator('#code-surface pre')).toHaveCount(1);
    await expect(page.locator('#code-surface pre')).toHaveAttribute('data-nabi-lang', 'typescript');

    const history = await page.evaluate(() => {
      const { nabi } = (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest;
      const undoPaste = nabi.undo();
      const cutDoc = nabi.getJson();
      const undoCut = nabi.undo();
      const original = nabi.getJson();
      const redoCut = nabi.redo();
      const redoPaste = nabi.redo();
      return { undoPaste, cutDoc, undoCut, original, redoCut, redoPaste };
    });
    expect(history).toEqual({
      undoPaste: true,
      cutDoc: documentOf(afterCut, nested),
      undoCut: true,
      original: documentOf(source, nested),
      redoCut: true,
      redoPaste: true,
    });
    await page.keyboard.press('Enter');
    await page.keyboard.type('// next');
    expect(await currentDoc(page)).toEqual(documentOf('start()\n  first()\n\tsecond()\n// next\nend()', nested));
    await expect(page.locator('#code-surface pre')).toHaveCount(1);
  });
}

for (const plain of ['https://example.com/path', '# Heading\n\n**literal**\n  <b>x</b>\n\tlast']) {
  test(`code paste keeps plain source ${plain.startsWith('https:') ? 'URLs' : 'Markdown and HTML'} literal`, async ({
    page,
  }) => {
    await setup(page, 'prefix|suffix');
    const selection = await page.evaluate(
      ({ plain, customMime }) => {
        const { nabi, path } = (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest;
        const root = document.getElementById('code-surface')!;
        nabi.select({ anchor: { path, offset: 6 }, focus: { path, offset: 7 } });
        const transfer = new DataTransfer();
        transfer.setData('text/plain', plain);
        transfer.setData('text/html', '<p><strong>HTML content</strong></p>');
        transfer.setData(
          customMime,
          JSON.stringify({ version: 1, body: [{ w: 'p', ch: [{ w: 'code', ch: ['internal content'] }] }] }),
        );
        root.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
        return nabi.getSelection();
      },
      { plain, customMime },
    );
    expect(await currentDoc(page)).toEqual(documentOf(`prefix${plain}suffix`));
    const point = { path: [0, 0], offset: 6 + plain.length };
    expect(selection).toEqual({ anchor: point, focus: point });
    await expect(page.locator('#code-surface pre')).toHaveCount(1);
    await expect(page.locator('#code-surface a, #code-surface strong')).toHaveCount(0);
    await page.keyboard.type('!');
    expect(await currentDoc(page)).toEqual(documentOf(`prefix${plain}!suffix`));
  });
}

for (const format of ['html', 'custom']) {
  test(`code paste flattens ${format} when the clipboard has no plain text`, async ({ page }) => {
    await setup(page, 'AB');
    await page.evaluate(
      ({ format, customMime }) => {
        const { nabi, path } = (globalThis as unknown as { codePasteTest: CodePasteState }).codePasteTest;
        const point = { path, offset: 1 };
        nabi.select({ anchor: point, focus: point });
        const transfer = new DataTransfer();
        if (format === 'html') {
          transfer.setData('text/html', '<p><b>first</b><br>  second</p><p><i>third</i></p>');
        } else {
          transfer.setData(
            customMime,
            JSON.stringify({
              version: 1,
              body: [
                {
                  w: 'p',
                  ch: [{ w: 'code', a: { lang: 'python' }, ch: ['first', { w: 'br', ch: [] }, '  second'] }],
                },
                { w: 'p', ch: [{ w: 'b', ch: ['third'] }] },
              ],
            }),
          );
        }
        document
          .getElementById('code-surface')!
          .dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
      },
      { format, customMime },
    );
    expect(await currentDoc(page)).toEqual(documentOf('Afirst\n  second\nthirdB'));
    await expect(page.locator('#code-surface pre')).toHaveCount(1);
    await expect(page.locator('#code-surface pre')).toHaveAttribute('data-nabi-lang', 'typescript');
    await page.keyboard.type('!');
    expect(await currentDoc(page)).toEqual(documentOf('Afirst\n  second\nthird!B'));
  });
}
