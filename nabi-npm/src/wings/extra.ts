// 미디어와 통합 도구의 재수출 문. img·youtube·clearFormat은 등록만으로 동작하고,
// upload·save·open·localHistory는 호스트 배선을 surface mount에서 받는다.
// 공개 묶음과 catalog 순서는 `wings/index.ts`와 `builder.ts`가 정한다.
export { IMAGE_WIDTHS, imageWing, makeImageWing } from './img/img.js';
export type { ImageWingOptions } from './img/img.js';
export { BROKEN_ATTR, imageAttach } from './img/watch.js';
export { YOUTUBE_WIDTHS, youtubeWing } from './youtube/youtube.js';
export { acceptFiles, extensionOf, formatBytes, isImageFile, makeUploadWing, uploadWing } from './upload/upload.js';
export type { CommitOptions, UploadFile, UploadItem, UploadLimits, UploadReject } from './upload/upload.js';
export {
  NABI_FILE_EXTENSION,
  NABI_FILE_VERSION,
  NABI_VERSION,
  defaultFileName,
  fileWings,
  isNabiFile,
  openFileWing,
  readNabiFile,
  saveFileWing,
  today,
  writeNabiFile,
} from './file/file.js';
export type { FileStore, NabiFileBody, NabiFileText } from './file/file.js';
export {
  HISTORY_CREATED_GAP,
  HISTORY_KEY,
  HISTORY_LIMIT,
  clearHistory,
  exactTime,
  historyStorageAlive,
  historyView,
  localHistoryWing,
  readHistory,
  removeHistory,
  showsCreated,
  summarize,
  writeHistory,
} from './local-history/local-history.js';
export type { HistoryRecord, HistoryStorage, HistoryView } from './local-history/local-history.js';
export { CLEARED_ATTRS, CLEARED_MARKS, clearFormatWing } from './clear-format/clear-format.js';
// 색칠의 지식은 `code/` 층에 산다(088 — 보는 쪽 `viewer` 도 같은 것을 문다). 코어 엔트리에서
// 나가는 이름은 그대로다: 호스트가 보기엔 자리가 옮겨간 줄 모른다.
export {
  CODE_TOKEN_ATTR,
  CODE_TOKEN_TYPES,
  applyTokens,
  codeSourceOf,
  dialectOf,
  tokenize,
  tokensFor,
  usableTokens,
} from '../code/index.js';
export type { ApplyOptions, CodeDialect, CodeHighlighter, CodeToken } from '../code/index.js';
export { codeAttach, makeCodeAttach } from './code/paint.js';
export type { PaintOptions } from './code/paint.js';
