// style 층의 문 — 시트의 글과 접는 규칙이다. 맨 아래 말단이라 아무 층도 안 물고 어느 층이든 부를 수 있다. 붙이는 문(DOM)은 여기 없다 — ui/css.ts가 그 절반을 든다
// The style layer's entry point: sheet text and the folding rules. It's the bottommost layer, depending on nothing, so any layer can call it. DOM injection isn't here -- ui/css.ts holds that half
export { CORE_CSS, collectSheets, sheetKey } from './css.js';
export type { SheetSource } from './css.js';
