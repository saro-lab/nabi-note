import { expect, test } from '@playwright/test';

const previews: Readonly<Record<string, string>> = {
  en: 'Preview',
  zh: '预览',
  hi: 'पूर्वावलोकन',
  es: 'Vista previa',
  ar: 'معاينة',
  fr: 'Aperçu',
  bn: 'প্রিভিউ',
  pt: 'Pré-visualizar',
  ru: 'Предпросмотр',
  id: 'Pratinjau',
  ur: 'پیش منظر',
  de: 'Vorschau',
  ja: 'プレビュー',
  fa: 'پیش‌نمایش',
  mr: 'पूर्वावलोकन',
  vi: 'Xem trước',
  te: 'మునుజూపు',
  ha: 'Samfoti',
  tr: 'Önizleme',
  sw: 'Onyesho la awali',
  ta: 'முன்னோட்டம்',
  ko: '미리보기',
  th: 'แสดงตัวอย่าง',
  it: 'Anteprima',
};

const fakeMarkers =
  /translated|tradotto|traduit|traducido|übersetzt|번역됨|翻訳済み|已翻译|अनुवादित|مترجم|অনূদিত|traduzido|переведено|diterjemahkan|ترجمہ شدہ|ترجمه‌شده|đã dịch|అనువదించబడింది|an fassara|çevrildi|imetafsiriwa|மொழிபெயர்க்கப்பட்டது|แปลแล้ว/i;

test('all locale toolbars use real localized labels', async ({ page }) => {
  await page.goto('/');
  for (const [locale, preview] of Object.entries(previews)) {
    await page.locator(`#locales button[title="${locale}"]`).click();
    const labels = await page
      .locator('.nabi-toolbar .nabi-btn')
      .evaluateAll((buttons) =>
        buttons.map((button) => `${button.getAttribute('aria-label') ?? ''}\n${button.getAttribute('title') ?? ''}`),
      );
    expect(labels.length).toBeGreaterThan(60);
    expect(labels.some((label) => label.includes(preview))).toBe(true);
    expect(labels.some((label) => fakeMarkers.test(label))).toBe(false);
  }
});

test('demo locale changes preserve document, editor, DOM, selection, dirty state and undo/redo', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const state = globalThis as unknown as { nabi: import('../../src/index.js').Nabi; localeSnapshot: unknown };
    const nabi = state.nabi;
    nabi.setJson([{ w: 'p', ch: ['base'] }]);
    nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 4 } });
    nabi.applyCommand('insertText', { text: ' edited' });
    const snapshot = {
      nabi,
      json: JSON.stringify(nabi.getJson()),
      selection: JSON.stringify(nabi.getSelection()),
      dirty: nabi.isChanged(),
      session: nabi.sessionId,
      paragraph: document.querySelector('#content p'),
      button: document.querySelector('#toolbar button'),
      history: localStorage.getItem('nabi-note.history'),
      changes: 0,
    };
    nabi.onChange(() => {
      snapshot.changes += 1;
    });
    state.localeSnapshot = snapshot;
  });
  for (const locale of ['ko', 'ar', 'en']) await page.locator(`#locales button[title="${locale}"]`).click();
  const result = await page.evaluate(() => {
    const state = globalThis as unknown as {
      nabi: import('../../src/index.js').Nabi;
      localeSnapshot: {
        nabi: unknown;
        json: string;
        selection: string;
        dirty: boolean;
        session: string;
        paragraph: Node;
        button: Node;
        history: string;
        changes: number;
      };
    };
    const { nabi, localeSnapshot: before } = state;
    return {
      sameEditor: nabi === before.nabi,
      sameJson: JSON.stringify(nabi.getJson()) === before.json,
      sameSelection: JSON.stringify(nabi.getSelection()) === before.selection,
      dirty: nabi.isChanged(),
      wasDirty: before.dirty,
      sameSession: nabi.sessionId === before.session,
      sameParagraph: document.querySelector('#content p') === before.paragraph,
      sameButton: document.querySelector('#toolbar button') === before.button,
      sameHistory: localStorage.getItem('nabi-note.history') === before.history,
      changes: before.changes,
      undo: nabi.undo(),
      undoHtml: nabi.getHtml(),
    };
  });
  expect(result).toEqual({
    sameEditor: true,
    sameJson: true,
    sameSelection: true,
    dirty: true,
    wasDirty: true,
    sameSession: true,
    sameParagraph: true,
    sameButton: true,
    sameHistory: true,
    changes: 0,
    undo: true,
    undoHtml: '<p>base</p>',
  });
  await page.locator('#locales button[title="ja"]').click();
  expect(
    await page.evaluate(() => {
      const { nabi } = globalThis as unknown as { nabi: import('../../src/index.js').Nabi };
      return { redo: nabi.redo(), html: nabi.getHtml() };
    }),
  ).toEqual({ redo: true, html: '<p>base edited</p>' });
});

test('demo locale change during IME keeps the composing DOM and commits one undo step', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const { nabi, surface } = globalThis as unknown as {
      nabi: import('../../src/index.js').Nabi;
      surface: import('../../src/index.js').Surface;
    };
    const root = document.getElementById('content')!;
    nabi.setJson([{ w: 'p', ch: ['base'] }]);
    nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 4 } });
    surface.focus();
    root.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    const text = root.querySelector('p')!.firstChild!;
    text.textContent = 'base한';
    document.getSelection()!.setBaseAndExtent(text, 5, text, 5);
    root.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', data: '한', isComposing: true }),
    );
    document.querySelector<HTMLButtonElement>('#locales button[title="ko"]')!.click();
    const during = {
      text: root.textContent,
      sameNode: root.querySelector('p')!.firstChild === text,
      focused: document.activeElement === root,
      html: nabi.getHtml(),
    };
    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' }));
    const after = nabi.getHtml();
    const undo = nabi.undo();
    return { during, after, undo, undoHtml: nabi.getHtml() };
  });
  expect(result).toEqual({
    during: { text: 'base한', sameNode: true, focused: true, html: '<p>base</p>' },
    after: '<p>base한</p>',
    undo: true,
    undoHtml: '<p>base</p>',
  });
});

test('an open prompt keeps its draft, focus and range while its labels change', async ({ page }) => {
  await page.goto('/');
  await page.locator('#toolbar .nabi-compact-bar > [data-name="tools"]').click();
  await page.locator('#toolbar .nabi-toolbox [data-name="a"]').click();
  const input = page.locator('.nabi-prompt input').first();
  await input.fill('https://example.test/draft');
  await input.evaluate((el) => (el as HTMLInputElement).setSelectionRange(4, 12));
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('#locales button[title="ko"]')!.click());
  await expect(input).toHaveValue('https://example.test/draft');
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((el) => [(el as HTMLInputElement).selectionStart, (el as HTMLInputElement).selectionEnd]),
  ).toEqual([4, 12]);
  await expect(page.locator('.nabi-prompt .nabi-go')).toHaveText('확인');
});
