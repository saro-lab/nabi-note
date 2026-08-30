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

test('all 24 locale toolbars use real localized labels', async ({ page }) => {
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
