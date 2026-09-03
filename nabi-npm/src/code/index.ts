// code 층 — 코드 색칠의 지식만 산다. wings/code(편집)와 viewer(발행)가 양 끝에서 함께 물어 층 차례의 맨 아래(locale 옆)에 둔다.
// The code layer holds only highlighting knowledge; wings/code (editor) and viewer (published) depend on it from opposite ends, so it sits at the very bottom of the layer order (next to locale).
export { CODE_TOKEN_ATTR, CODE_TOKEN_TYPES, dialectOf, tokenize, tokensFor, usableTokens } from './tokens.js';
export type { CodeDialect, CodeHighlighter, CodeToken } from './tokens.js';
export { applyTokens, codeSourceOf } from './apply.js';
export type { ApplyOptions } from './apply.js';
