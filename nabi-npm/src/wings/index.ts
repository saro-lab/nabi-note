// wings 층의 문 — 기본 wing 전부와 그 묶음(defaultWings), 고르기 빌더(wings)가 여기서 나간다.
// 글 계열(08) + 표(10) + 물건·도구(11)를 합친 완전 묶음이다.
import type { Wing } from '../wing/index.js';
import { $catalogWings } from './builder.js';

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
export { tableWings } from './table/index.js';
export * from './extra.js';
// wing 고르기 빌더 (087) — `wings().all().drop('upload').use('tf', { values: [...] })`.
export { wingNames, wings } from './builder.js';
export type { WingName, WingUseOptions, WingsBuilder } from './builder.js';

// 기본 묶음 전체 — `createNabiWith(defaultWings)` 하나로 에디터가 선다.
// 목록의 원본은 빌더의 차례표(builder.ts 의 CATALOG) **한 자리**다 — 여기 한 번 더 적으면
// `.all()` 과 이 배열이 갈리고, 이름 유니온(WingName)도 딴 데를 보게 된다.
export const defaultWings: readonly Wing[] = $catalogWings;
