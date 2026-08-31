// getHtml()의 보기 조각은 nabi.css를 건 .nabi-content 안에서만 제 모양이 나므로,
// 여기서 문서 껍데기(doctype·charset·제목·인라인 시트)를 얹어 인터넷·나비 없이도 열리는 한 장을 만든다.
// The view fragment from getHtml() only looks right inside a `.nabi-content` wearing nabi.css, so this wraps it with a full document shell (doctype/charset/title/inline sheet) that opens standalone, no internet or nabi required.
export interface HtmlFileOptions {
  readonly title: string;
  readonly sheets: readonly string[];
  readonly body: string;
  readonly lang?: string;
  readonly dir?: 'ltr' | 'rtl';
}

// 제목은 사람이 적은 이름이라 `<`·`&`가 그대로 올 수 있다 — 밖에 안 내놓는 내부 헬퍼다.
// Titles are free text and may contain `<`/`&` as-is; kept internal, not exported.
const escapeText = (raw: string): string => raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (raw: string): string => escapeText(raw).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const LANGUAGE_TAG = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/;

// 시트 속 `</style`가 그 자리에서 태그를 닫아 버리는 것을 막는다 — 남의 wing이 들고 온 시트가 지날 수 있는 문이다.
// Neutralizes a stray `</style` inside a sheet from closing the tag early; a door a third-party wing's sheet can pass through.
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
