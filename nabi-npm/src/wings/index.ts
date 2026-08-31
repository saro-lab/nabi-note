// wings 층의 문 — 기본 wing 전부, 그 묶음(defaultWings), 고르기 빌더(wings)가 여기서 나간다.
// The wings layer's door — every built-in wing, their bundle (defaultWings), and the picker builder (wings) all export from here.
import type { Wing } from '../wing/index.js';
import { $catalogWings } from './builder.js';
import { completeLocaleTree } from '../locale/complete.js';
import { DICTIONARY } from '../locale/index.js';

export {
  boldWing,
  italicWing,
  simpleMarkWings,
  strikeWing,
  subscriptWing,
  superscriptWing,
  underlineWing,
} from './marks/marks.js';
export {
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
  TYPEFACES,
  fontSizeWing,
  highlightWing,
  makeFontSizeWing,
  makeHighlightWing,
  makeTextColorWing,
  makeTypefaceWing,
  textColorWing,
  typefaceWing,
  valueMarkWings,
} from './values/values.js';
export type { ValueWingOptions } from './values/values.js';
export { linkWing } from './link/link.js';
export { alignWing, dropCapWing, headingWing, paragraphAttrWings } from './attrs/attrs.js';
export { bulletListWing, listWings, orderedListWing, taskListWing } from './list/list.js';
export { quoteWing } from './quote/quote.js';
export { detailsWing } from './details/details.js';
export { codeWing } from './code/code.js';
export { dividerWing } from './hr/hr.js';
export { diffWing } from './diff/diff.js';
export { tableWings } from './table/index.js';
export * from './extra.js';
export { wingNames, wings } from './builder.js';
export type { WingName, WingUseOptions, WingsBuilder } from './builder.js';

// 기본 묶음 전체 — `createNabiWith(defaultWings)` 하나로 에디터가 선다. 원본은 builder.ts의 CATALOG 한 자리뿐이다.
// The full default bundle — `createNabiWith(defaultWings)` alone stands up an editor; its only source is builder.ts's CATALOG.
export const defaultWings: readonly Wing[] = $catalogWings;
completeLocaleTree(DICTIONARY);
completeLocaleTree(defaultWings);
