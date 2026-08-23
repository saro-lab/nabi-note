// html 층의 문 — 조립(render)과 들여오기(parse)가 여기서 나간다.
// **이스케이프 함수는 여기 없다** — 밖에서 온 값이 HTML 이 되는 길은 render 안의 태그 문 하나뿐이고
// 그 문을 밖에 내주면 신뢰 경계가 두 곳이 된다 (06 규칙).
export { renderEditorHtml, renderHtml, renderParagraphHtml } from './render.js';
// 받침 br 의 표식 — "화면에만 사는 것" 의 이름은 이 층이 낸다(surface 가 손으로 다시 적지 않게).
export { DEFAULT_BUILDERS, FILLER_ATTR } from './builders.js';
export type { HtmlAttrs, HtmlBuilder, HtmlBuilders, HtmlContext, HtmlOptions } from './contract.js';
export { importDoc } from './import.js';
export type { ImportOptions, ParseElement, ParseNode, ParseText } from './import.js';
export { parseHtml, parseNodes } from './parse.js';
export { fragmentOf, pasteFragment, singleLumpOf } from './paste.js';
export { safeUrl } from './url.js';
