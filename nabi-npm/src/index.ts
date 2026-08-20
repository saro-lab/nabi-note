// 코어 엔트리(`nabi-note`) — 호스트가 조립에 **실제로 쓰는 것만** 여기서 나간다.
//
// 기준 하나: 이 이름이 호스트의 조립 코드(`demo/editor.ts` 가 그 견본이다)에 나오는가.
// 나오지 않으면 안 내보낸다 — 그물은 소스를 직접 import 하므로(test/*.test.ts) 시험 때문에
// 공개할 것이 없다. 안쪽 것을 쓰고 싶은 사람은 `$`·`_` 이름을 보고 그것이 안쪽임을 안다
// (은닉 기계는 없다, 이름이 곧 표시다).
//
// 여기서 **일부러 뺀 것**: 경계 스캐너·재그리기 계획(planRedraw)·DOM 좌표 사상(map)
// 눌림/노출 판정(press·visible·groups)·띠 산수(band)·아이콘 부품(iconButton·make·iconSvg)
// 전부 층 안쪽의 일이고, 호스트가 부를 자리가 없다.
//
// 보는 쪽 런타임(표 정렬)은 이 엔트리에 없다 — `nabi-note/viewer` 가 그 자리다.

// --- 조립 (호스트가 제일 먼저 부르는 문) ------------------------------------------------------
export { createNabiWith, makeRegistry } from './wing/index.js';
export type { Registry, RegisteredRule } from './wing/index.js';

// --- wing — 기본 묶음·개별 wing·팩토리 -------------------------------------------------------
// wings 층의 문을 그대로 연다: 기본 묶음(defaultWings·extraWings)·개별 wing·wing 이 딸린
// 지식(색·크기 목록, 코드 토크나이저,.nabi 파일 읽고 쓰기, 로컬 기록 저장소)까지가 전부
// 호스트가 손대는 것들이다.
export * from './wings/index.js';
// 남의 wing 을 짓는 문 — 계약 넷을 선언으로 채운다.
export { boxObject, listFamily, simpleMark, valueMark } from './wing/index.js';
export type { BoxObjectSpec, ListFamilySpec, SimpleMarkSpec, ValueMarkSpec } from './wing/index.js';
// wing 커맨드가 트리를 만지는 공용 손잡이 — 물건 넣기·빼기·감싸기·꼭대기 찾기.
export { insertLump, removeLump, toggleWrap, topNodeAt } from './wing/index.js';
// 계약 타입 — 남의 wing 이 이 모양을 채운다.
export type {
  ArrowDir,
  Attach,
  AttachHost,
  ContextControl,
  InputRule,
  KeyIntent,
  KeyName,
  OnKey,
  OwnerAt,
  StructureDecl,
  Wing,
  WingAction,
  WingButton,
  WingChoice,
  WingContext,
  WingField,
  WingPlace,
} from './wing/index.js';

// --- 편집 표면 ---------------------------------------------------------------------------------
export { mountSurface } from './surface/index.js';
export type { EditSurfacePort, Surface, SurfaceActions, SurfaceOptions } from './surface/index.js';
// mount 부속 — 호스트 배선(전송 훅·저장소)이 있어야 사는 것들.
export { browserFileStore, browserHistoryStorage, mountFile, mountLocalHistory, mountUpload } from './surface/index.js';
export type {
  DroppedFile,
  FileMount,
  FileMountOptions,
  HistoryMount,
  HistoryMountOptions,
  UploadMount,
  UploadOptions,
  UploadTask,
  Uploader,
} from './surface/index.js';

// --- 화면 도구 ---------------------------------------------------------------------------------
export {
  FULLSCREEN_CLASS,
  TOOLBAR_GROUPS,
  isFullscreen,
  mountContextToolbar,
  mountHints,
  mountPickedMark,
  mountSticky,
  mountToolbar,
  mountUploadView,
  mountViewTools,
  openHistoryPanel,
  openLightbox,
  openPreview,
  setFullscreen,
} from './ui/index.js';
export type {
  ContextGroupView,
  ContextToolbar,
  ContextToolbarOptions,
  HintOptions,
  HistoryPanelOptions,
  Hints,
  LightboxOptions,
  Overlay,
  PickedMark,
  PickedMarkOptions,
  PreviewOptions,
  Sticky,
  StickyOptions,
  Toolbar,
  ToolbarButton,
  ToolbarOptions,
  UploadView,
  UploadViewOptions,
  ViewTools,
  ViewToolsOptions,
} from './ui/index.js';
// 호스트가 직접 여는 것 둘 — 툴바의 `onHost` 를 받은 쪽이 판을 세울 때 쓴다(로컬 기록 류)
// `watchSettle` 은 툴바와 상황 줄이 몸짓 가라앉기를 나눠 쓰라고 밖에 둔다.
export { openPanel, openPrompt, watchSettle } from './ui/index.js';
export type { Panel, PanelOptions, PromptField, PromptOptions, Settle, SettleOptions } from './ui/index.js';
// 시트 — 발행 CSS(`nabi-note/dist/nabi.css`)를 안 쓰고 런타임에 붙이는 호스트의 문.
export { CORE_CSS, collectSheets, injectSheets, sheetKey } from './ui/index.js';
// 툴바를 미리 그리는 문 — 서버(`nabi-note/ssr`)에도 같은 것이 있다 (096).
export { renderToolbarHtml, renderViewToolsHtml, toolbarSlots } from './wing/toolbar-html.js';
export type { ToolbarHtmlOptions, ToolbarSlot } from './wing/toolbar-html.js';

// --- 조립된 HTML (서버에서도 그대로 돈다) ------------------------------------------------
export { renderEditorHtml, renderHtml, safeUrl } from './html/index.js';
// 저장본 문 — 나비트리 JSON 을 에디터·DOM 없이 (보기|편집기) HTML 로. 거절 규칙은 setJson 과
// 같다(나비트리가 아니면 null). 댓글 목록·SSR 이 registry 하나로 저장본 여럿을 그린다 (090).
export { renderStoredEditorHtml, renderStoredHtml } from './wing/index.js';
export type { StoredHtmlOptions } from './wing/index.js';
// 들여오기 어댑터 — `createNabiWith(wings, { parseHtml: parseNodes })` 로 꽂으면 `setHtml` 이 산다.
// (브라우저 전용이다 — DOMParser 가 없는 곳에서는 부르지 않는다.)
export { parseNodes } from './html/index.js';
export type { HtmlAttrs, HtmlBuilder, HtmlBuilders, HtmlContext, HtmlOptions, ParseNode } from './html/index.js';

// --- 계약 타입 (에디터·문서·좌표) --------------------------------------------------------------
export type { Nabi, NabiChange, NabiOptions } from './editor/index.js';
// 묻는 길 — 호스트가 `createNabiWith(wings, { ask })` 로 자기 상자를 끼운다. 자기 대화상자를
// 가진 페이지는 제 디자인 한가운데에 브라우저의 회색 상자가 뜨는 것을 원하지 않고, 플러그인
// (인텔리제이·VS Code)에는 `window.confirm` 이라는 것이 아예 없다. 부분이라 끼운 칸만 이긴다:
// 안 끼운 `confirm` 은 아무것도 안 묻고 "아니오" 로 답하고(silentAsk 의 답과 같다), 안 끼운
// `message` 는 core 기본 toast(info) 로 흐른다 — 브라우저 confirm 을 쓰려면 그 어댑터도
// 호스트가 두 줄로 짓는다.
export { silentAsk } from './editor/index.js';
export type { Ask } from './editor/index.js';
// 알리는 길 — 기본은 core 의 toast 그릇이 툴바 아래에 선다(mountToolbar 가 함께 세운다).
// 제 알림 시스템이 있는 호스트는 `createNabiWith(wings, { toast })` 로 표시만 갈아탄다 —
// 기본 그릇의 결(시간·상한)은 `toastMs`·`toastMax` 옵션이다.
export type { Toast, ToastLevel } from './editor/index.js';
export type { Command, CommandArgs, CommandHand, CommandOutcome } from './editor/index.js';
export type { Selection } from './caret/index.js';
export type { EditEnv, Position } from './doc/index.js';
export { isElement, isText } from './schema/index.js';
export { BR, P } from './schema/index.js';
export type { Attrs, AttrValue, ElementNode, NabiDoc, NabiNode } from './schema/index.js';

// --- 말 ------------------------------------------------------------------------------------------
export { DICTIONARY, LOCALES, RTL_LOCALES, localeDirection, localeOf, makeTranslator, translate } from './locale/index.js';
export type { Dictionary, LocaleText, Translator } from './locale/index.js';
