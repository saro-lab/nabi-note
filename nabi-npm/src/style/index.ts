// style 층의 문 — 시트의 글과 그것을 접는 규칙. **맨 아래 말단이다**: 아무 층도 안 문고,
// 어느 층이든 부를 수 있다. 붙이는 문(DOM)은 여기 없다 — `ui/css.ts` 가 그 절반을 든다.
export { CORE_CSS, collectSheets, sheetKey } from './css.js';
export type { SheetSource } from './css.js';
