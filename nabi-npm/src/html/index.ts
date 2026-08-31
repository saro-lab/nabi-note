// 이스케이프 함수는 여기 없다 — 밖에서 온 값이 HTML이 되는 길은 render 안의 태그 문 하나뿐이라, 내주면 신뢰 경계가 둘이 된다.
// No raw-to-HTML conversion is exported here — render's tag-writer is the only door, and exposing it would split the trust boundary in two.
export { renderEditorHtml, renderHtml, renderParagraphHtml } from './render.js';
export { DEFAULT_BUILDERS, FILLER_ATTR } from './builders.js';
export type { HtmlAttrs, HtmlBuilder, HtmlBuilders, HtmlContext, HtmlOptions } from './contract.js';
export { importDoc } from './import.js';
export type { ImportOptions, ParseElement, ParseNode, ParseText } from './import.js';
export { parseHtml, parseNodes } from './parse.js';
export { fragmentOf, pasteFragment, singleLumpOf } from './paste.js';
export { safeUrl } from './url.js';
