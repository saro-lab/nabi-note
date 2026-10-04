// 코어 엔트리(nabi-note) — 호스트가 조립에 실제로 쓰는 것만 여기서 나간다. 기준은 이 이름이 호스트 조립 코드(demo/editor.ts)에 나오는가다.
// The core entry (nabi-note) exports only what a host actually uses to assemble; the bar is whether the name appears in host assembly code (demo/editor.ts is the model).
// 안쪽 전용(경계 스캐너·재그리기 계획·DOM 좌표 사상 등)은 뺐다 — `$`·`_` 이름이 곧 안쪽 표시다. 보는 쪽 런타임(표 정렬)은 `nabi-note/viewer`가 따로 맡는다.
// Internals (boundary scanning, repaint planning, DOM coordinate mapping, etc.) are excluded — a `$`/`_` name marks something internal by convention. The viewer runtime (table sorting) lives separately in `nabi-note/viewer`.

// --- 조립 (호스트가 제일 먼저 부르는 문) ------------------------------------------------------
export { createNabiWith, makeRegistry } from './wing/index.js';
export type { Registry, RegisteredRule } from './wing/index.js';

// --- wing — 기본 묶음·개별 wing·팩토리 -------------------------------------------------------
// wings 층의 문을 그대로 연다 — 기본 묶음·개별 wing·딸린 지식(색·크기 목록, 코드 토크나이저, .nabi 파일, 로컬 기록 저장소)까지 전부 호스트가 손대는 것들이다.
// Opens the wings layer's door as-is — the default bundle, individual wings, and their attached knowledge (color/size lists, the code tokenizer, .nabi file I/O, local-history storage) are all things a host touches.
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
// IO 필터 계약 — 호스트가 제 형식을 끼우는 문(`makeRegistry(wings, { ioFilters })`)의 모양이다.
export type {
  ClipFile,
  DocSource,
  IoFilter,
  MdBuilder,
  MdBuilders,
  MdContext,
  PasteCandidate,
  PasteData,
} from './io/index.js';

// --- 편집 표면 ---------------------------------------------------------------------------------
export { mountSurface } from './surface/index.js';
export type { EditSurfacePort, Surface, SurfaceActions, SurfaceOptions } from './surface/index.js';
// mount 부속 — 호스트 배선(전송 훅·저장소)이 있어야 사는 것들.
export {
  browserFileStore,
  browserHistoryStorage,
  mountFile,
  mountLocalHistory,
  mountUpload,
  readExtensions,
} from './surface/index.js';
export type {
  FileMount,
  FileMountOptions,
  HistoryMount,
  HistoryMountOptions,
  SaveFormat,
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
  openChoosePanel,
  openHistoryPanel,
  openLightbox,
  openPreview,
  openSavePanel,
  setFullscreen,
} from './ui/index.js';
export type {
  ContextGroupView,
  ContextToolbar,
  ChoosePanelOptions,
  ContextToolbarOptions,
  HintOptions,
  HistoryPanelOptions,
  Hints,
  LightboxOptions,
  Overlay,
  PickedMark,
  PickedMarkOptions,
  PreviewOptions,
  SavePanelOptions,
  Sticky,
  StickyOptions,
  Toolbar,
  ToolbarButton,
  ToolbarOptions,
  ToolbarPanelContext,
  ToolbarPanelRenderer,
  UploadView,
  UploadViewOptions,
  ViewTools,
  ViewToolsOptions,
} from './ui/index.js';
// 호스트가 직접 여는 것 둘 — 툴바의 `onHost` 를 받은 쪽이 판을 세울 때 쓴다(로컬 기록 류). `watchSettle` 은 툴바와 상황 줄이 몸짓 가라앉기를 나눠 쓰라고 밖에 둔다.
// Two things a host opens directly — used when a toolbar's `onHost` handler builds its own panel (local history, say); `watchSettle` is exposed so the toolbar and context bar can share gesture-settling.
export { openPanel, openPrompt, watchSettle } from './ui/index.js';
export type { Panel, PanelOptions, PromptField, PromptOptions, Settle, SettleOptions } from './ui/index.js';
// 시트 — 발행 CSS(`nabi-note/dist/nabi.css`)를 안 쓰고 런타임에 붙이는 호스트의 문.
export { CORE_CSS, collectSheets, injectSheets, sheetKey } from './ui/index.js';
// 툴바를 미리 그리는 문 — 서버(`nabi-note/ssr`)에도 같은 것이 있다 (096).
export { renderToolbarHtml, renderViewToolsHtml, toolbarSlots } from './wing/toolbar-html.js';
export type { ToolbarHtmlOptions, ToolbarSlot } from './wing/toolbar-html.js';

// --- 조립된 HTML (서버에서도 그대로 돈다) ------------------------------------------------
export { safeUrl } from './html/index.js';
// 저장본 문 — 나비트리 JSON 을 에디터·DOM 없이 (보기|편집기) HTML 로. 거절 규칙은 setJson과 같다. 댓글 목록·SSR이 registry 하나로 저장본 여럿을 그린다.
// The stored-doc door: renders NABI TREE JSON to (viewer|editor) HTML with no editor or DOM involved; rejection follows setJson's rule. A comment list or SSR renders many stored docs off one registry.
export { renderStoredEditorHtml, renderStoredHtml } from './wing/index.js';
export type { StoredHtmlOptions } from './wing/index.js';
export type { HtmlAttrs, HtmlBuilder, HtmlBuilders, HtmlContext } from './html/index.js';

// --- 계약 타입 (에디터·문서·좌표) --------------------------------------------------------------
export type { Nabi, NabiChange, NabiOptions } from './editor/index.js';
// 묻는 길 — 호스트가 createNabiWith(wings, { ask })로 자기 상자를 끼운다. 부분이라 끼운 칸만 이긴다: 안 끼운 confirm은 "아니오"(silentAsk와 같다), 안 끼운 message는 core toast(info)로 흐른다.
// A way to ask the person — a host plugs its own dialog via createNabiWith(wings, { ask }). It's partial, so only supplied fields take effect: an unset confirm answers "no" (like silentAsk), and an unset message flows to core's toast(info).
export { silentAsk } from './editor/index.js';
export type { Ask, ChooseOption } from './editor/index.js';
// 알리는 길 — 기본은 core의 toast 그릇이 툴바 아래에 선다. 제 알림 시스템이 있는 호스트는 { toast }로 표시만 갈아탄다 — 기본 그릇의 결은 toastMs·toastMax 옵션이다.
// A way to surface notifications — by default core's toast sits below the toolbar. A host with its own notification system swaps just the display via { toast }; the default sink's timing is set by the toastMs/toastMax options.
export type { Toast, ToastLevel } from './editor/index.js';
export type { Command, CommandArgs, CommandHand, CommandOutcome } from './editor/index.js';
export type { Selection } from './caret/index.js';
export type { EditEnv, Position } from './doc/index.js';
export { isElement, isText } from './schema/index.js';
export { BR, P } from './schema/index.js';
export type { Attrs, AttrValue, ElementNode, NabiDoc, NabiNode } from './schema/index.js';

// --- 말 ------------------------------------------------------------------------------------------
export {
  DICTIONARY,
  LOCALES,
  RTL_LOCALES,
  localeDirection,
  localeOf,
  makeTranslator,
  createLocale,
  translate,
} from './locale/index.js';
export type {
  Dictionary,
  LocaleText,
  Translator,
  LocaleController,
  LocaleInput,
  LocaleSource,
} from './locale/index.js';

export type { ViewToolsVisibility, ViewToolsHtmlOptions } from './wing/toolbar-html.js';
