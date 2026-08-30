// io 층의 문 — 필터 계약과 후보 수집, 그리고 md 부분집합 파서가 여기서 나간다.
// 이 층은 html 위 editor 아래에 선다: 다루는 값이 전부 schema·html·locale 의 것이고,
// 편집기도 표면도 안 문다. wing 계약이 `ioFilter`·`toMd` 를 무는 방향이 그래서 선다.
export type {
  ClipFile,
  DocSource,
  IoFilter,
  MdBuilder,
  MdBuilders,
  MdContext,
  PasteCandidate,
  PasteData,
} from './contract.js';
export { $assertIoFilter } from './contract.js';
export { collectCandidates, textCandidate } from './candidates.js';
export type { CollectOptions } from './candidates.js';
export { $isBuiltinHtmlFilter, makeBuiltinFilters } from './filters.js';
export type { BuiltinOptions } from './filters.js';
// 내장 형식의 얼굴 — 영어 고정 이름과 16×16 아이콘 속.
export {
  HTML_ICON,
  HTML_LABEL,
  MARK_STROKE,
  MARKDOWN_ICON,
  MARKDOWN_LABEL,
  NABI_ICON,
  NABI_LABEL,
  NABI_MARK,
  NHTML_FILE_EXTENSION,
  saveMark,
  TEXT_ICON,
  TEXT_LABEL,
} from './marks.js';
// `.html` 저장이 내는 자립형 한 장 — 시트도 조각도 밖에서 온다(순수 함수).
export { writeHtmlFile } from './html-file.js';
export type { HtmlFileOptions } from './html-file.js';
// `.nabi` 원형 — wings/file 에서 내려왔다. 공개 경로(`wings/file/file.ts`)는 재수출로 산다.
export {
  NABI_FILE_EXTENSION,
  NABI_FILE_VERSION,
  NABI_VERSION,
  defaultFileName,
  isNabiFile,
  readNabiFile,
  today,
  writeNabiFile,
} from './file.js';
export type { FileStore, NabiFileBody, NabiFileText } from './file.js';
export { parseInline, parseMarkdown } from './md/parse.js';
export type { MdEnv } from './md/parse.js';
export { escapeMd, renderMarkdown } from './md/render.js';
export type { MdOptions } from './md/render.js';
export { smellsMarkdown } from './md/sniff.js';
