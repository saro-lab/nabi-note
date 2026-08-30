// `.html` 한 장 — **자립형이다.** 보기 HTML(`getHtml()`)은 조각이라 `nabi.css` 를 건
// `.nabi-content` 안에서만 제 모양이 난다(`html/render.ts` 가 그렇게 못 박아 두었다). 그것을
// 그대로 파일로 내리면 서식 없는 벌거벗은 문서가 나오므로, 여기서 문서 껍데기와 시트를 얹는다.
//
// 담기는 것 다섯: doctype · charset · 제목 · 인라인 시트 · `.nabi-content` 로 감싼 조각.
// 바깥 파일을 안 건다 — 저장된 한 장은 인터넷 없이도, 나비 없이도 그대로 열린다.
//
// **순수 함수다.** 시트도 조각도 부르는 쪽이 이미 지어서 넘긴다(시트는 style 층, 조각은
// editor 의 getHtml) — 이 파일은 그 셋을 한 장으로 잇기만 한다.

export interface HtmlFileOptions {
  // `<title>` — 대개 확장자를 뗀 파일 이름이다.
  readonly title: string;
  // 인라인으로 실릴 시트들 — `collectSheets(registry)` 가 주는 그 목록.
  readonly sheets: readonly string[];
  // 본문 조각 — `nabi.getHtml()`.
  readonly body: string;
  readonly lang?: string;
  readonly dir?: 'ltr' | 'rtl';
}

// 글자 하나가 태그가 되지 않게 — 제목은 사람이 적은 이름이라 `<`·`&` 가 그대로 올 수 있다.
// **밖에 안 내놓는다**: HTML 이 되는 문은 조립기 안에 하나뿐이라는 규칙(html 층)이 여기서도 같다.
const escapeText = (raw: string): string => raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (raw: string): string => escapeText(raw).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const LANGUAGE_TAG = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/;

// 시트 속의 `</style` 은 그 자리에서 태그를 닫아 버린다 — CSS 로는 뜻이 없는 글이라 백슬래시
// 하나로 눕힌다. 우리 시트에는 없지만, 남의 wing 이 들고 온 시트가 지날 수 있는 문이다.
const guardSheet = (sheet: string): string => sheet.replace(/<\/(style)/gi, '<\\/$1');

export function writeHtmlFile(options: HtmlFileOptions): string {
  const attrs = [
    typeof options.lang === 'string' && LANGUAGE_TAG.test(options.lang) ? ` lang="${escapeAttr(options.lang)}"` : '',
    options.dir === 'ltr' || options.dir === 'rtl' ? ` dir="${options.dir}"` : '',
  ].join('');
  const style = options.sheets.map(guardSheet).join('\n');
  return [
    '<!doctype html>',
    `<html${attrs}>`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeText(options.title)}</title>`,
    '<style>',
    style,
    '</style>',
    '</head>',
    '<body>',
    '<div class="nabi-content">',
    options.body,
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
