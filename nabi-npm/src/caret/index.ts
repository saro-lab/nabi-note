// caret 층의 문 — 선택·경계 정규화·걸음·예약 상태.
export {
  caretAt,
  isCollapsed,
  isObjectSelection,
  ordered,
  samePosition,
  sameSelection,
  selectObject,
  selectionExists,
} from './selection.js';
export type { Selection } from './selection.js';
export { marksAt } from './normalize.js';
export { docEnd, docStart, stepBackward, stepForward } from './step.js';
export { makeArmed } from './armed.js';
export type { ArmedState } from './armed.js';
