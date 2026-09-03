// 미디어·통합 도구 재수출 — img/youtube/clearFormat은 등록만으로 돌고, upload/save/open/localHistory는 호스트 배선이 필요하다.
// Re-exports media and integration wings — img/youtube/clearFormat work by registration alone; the rest need host wiring.
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
// 색칠의 지식은 `code/` 층에 산다 — 나가는 이름은 그대로라 호스트는 자리가 옮겨간 줄 모른다.
// Highlighting logic lives in `code/` — the exported names are unchanged, so hosts never notice the move.
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
