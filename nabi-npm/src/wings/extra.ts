// wings 2차의 문 — 물건 계열(img·youtube)과 도구 계열(upload·save·open
// localHistory·clearFormat)이 여기서 나간다. `defaultWings` 로의 병합은 코디네이터가 한다
// 이 파일은 묶음 하나만 내놓고 `wings/index.ts` 를 건드리지 않는다.
//
// 여기 든 wing 은 전부 **호스트가 배선을 더 해야 살아난다**: upload 는 uploader 훅
// save·open 은 저장소, localHistory 는 저장소 — 그 배선은 surface 의 mount 부속이 든다
// (`mountUpload`·`mountFile`·`mountLocalHistory`). 부속 없이 등록만 해도 죽지는 않는다:
// 커맨드가 조용히 아무 일도 안 할 뿐이다.
import type { Wing } from '../wing/index.js';
import { imageWing } from './img/img.js';
import { youtubeWing } from './youtube/youtube.js';
import { uploadWing } from './upload/upload.js';
import { openFileWing, saveFileWing } from './file/file.js';
import { localHistoryWing } from './local-history/local-history.js';
import { clearFormatWing } from './clear-format/clear-format.js';

export { IMAGE_WIDTHS, imageWing, makeImageWing } from './img/img.js';
export type { ImageWingOptions } from './img/img.js';
export { BROKEN_ATTR, imageAttach } from './img/watch.js';
export { YOUTUBE_WIDTHS, youtubeWing } from './youtube/youtube.js';
export {
  acceptFiles,
  extensionOf,
  formatBytes,
  isImageFile,
  makeUploadWing,
  uploadWing,
} from './upload/upload.js';
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
export { CODE_TOKEN_ATTR, CODE_TOKEN_TYPES, applyTokens, codeSourceOf, dialectOf, tokenize, tokensFor, usableTokens } from '../code/index.js';
export type { ApplyOptions, CodeDialect, CodeHighlighter, CodeToken } from '../code/index.js';
export { codeAttach, makeCodeAttach } from './code/paint.js';
export type { PaintOptions } from './code/paint.js';

// 2차 묶음 — `[...defaultWings,...extraWings]` 하나로 물건·도구까지 선다.
export const extraWings: readonly Wing[] = [
  imageWing,
  youtubeWing,
  uploadWing,
  saveFileWing,
  openFileWing,
  localHistoryWing,
  clearFormatWing,
];
