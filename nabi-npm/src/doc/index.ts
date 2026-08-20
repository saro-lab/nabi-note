// doc 층의 문 — 문단 배열 위의 순수 편집 연산 전부가 여기서 나간다.
export {
  comparePositions,
  holderLength,
  holders,
  isHolder,
  nodeAt,
  positionExists,
  replaceAt,
  siblingsAt,
  terminalOf,
} from './position.js';
export type { EditEnv, EditResult, HolderAt, Position } from './position.js';
export { fromRuns, holderRuns, sameMark, sliceRuns, stepAfter, stepBefore, withChildren } from './runs-edit.js';
export { insertLine, insertText } from './insert.js';
export { splitParagraph } from './split.js';
export { deleteBackward, deleteForward } from './remove.js';
export { deleteRange } from './range.js';
export type { DocRange } from './range.js';
export { setMark, setParagraphAttr, toggleMark } from './marks.js';
export { unwrapItem } from './list.js';
