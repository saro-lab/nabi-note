// `code/` 층 — 코드 색칠의 **지식**만 사는 자리다. wing 도 mount 도 여기 없다.
//
// **왜 제 층인가** (088): 색칠을 무는 이가 둘로 갈렸다.
//   · `wings/code`  — 편집 화면의 색칠(표면 부속 `attach`)
//   · `viewer`      — 발행된 정적 HTML 의 색칠(읽는 사람의 화면)
// 그 둘은 층 차례의 **양 끝**이라(wings 는 아래, viewer 는 맨 위) 한쪽에 두면 다른 쪽이
// 층을 거슬러 문다. 그래서 아무것도 안 부르는 맨 아래(`locale` 옆)에 따로 세웠다.
//
// 두 절반으로 갈려 있다 — 순수부(`tokens.ts`: 글자열 → 토막)와 DOM 부(`apply.ts`: 토막 →
// span, 그리고 그 반대). 갈라 두어서 무거운 절반을 언제든 옮길 수 있고, 순수부는 서버에서도 돈다.
export {
  CODE_TOKEN_ATTR,
  CODE_TOKEN_TYPES,
  dialectOf,
  tokenize,
  tokensFor,
  usableTokens,
} from './tokens.js';
export type { CodeDialect, CodeHighlighter, CodeToken } from './tokens.js';
export { applyTokens, codeSourceOf } from './apply.js';
export type { ApplyOptions } from './apply.js';
