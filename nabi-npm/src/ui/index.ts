// ui 층의 문 — 화면 도구가 여기서 나간다. 아래층(surface·wing·editor)은 이 층을 모른다.
//
// 나가는 것 셋으로 갈린다:
//   1. 순수 판정 — 눌림·노출·상황 줄 그룹·띠 산수·시트 접기. DOM 이 없어 그물에 그대로 잡힌다
//   2. 공통 부품 — 아이콘 버튼·settle·판·물어보기·덮개·바깥클릭. **각각 한 벌뿐이다**
//   3. mount 문 — 툴바·상황 줄·힌트·미리보기·스티키
export {
  aimNode,
  controlValueOf,
  hasToken,
  markNode,
  ownedAncestor,
  ownedAncestors,
  pressedOf,
  pressedValue,
  stackValue,
} from './press.js';
export type { Pressed, PressEnv } from './press.js';
export { admits, reachAt, visibleAt } from './visible.js';
export type { ReachAt } from './visible.js';
export { contextGroupsAt } from './groups.js';
export type { ContextGroup } from './groups.js';
export { BAND_MARGIN, bandFix, bandOf, isIos } from './band.js';
export type { Band, Rect } from './band.js';
export { CORE_CSS, collectSheets, injectSheets, sheetKey } from './css.js';

export { focusQuiet, hostOf, iconSvg, make } from './parts/dom.js';
export type { UiHost } from './parts/dom.js';
export { iconButton, setPressed } from './parts/button.js';
export type { IconButtonSpec } from './parts/button.js';
export { watchSettle } from './parts/settle.js';
export type { Settle, SettleOptions } from './parts/settle.js';
export { closeOnOutside } from './parts/outside.js';
export { openScrim } from './parts/scrim.js';
export type { Scrim, ScrimOptions } from './parts/scrim.js';
export { PANEL_EDGE, PANEL_GAP, edgeShift, openPanel, panelShift } from './parts/panel.js';
export type { Panel, PanelBox, PanelOptions } from './parts/panel.js';
export { openPrompt, promptValid } from './parts/prompt.js';
export type { PromptField, PromptOptions } from './parts/prompt.js';

export { TOAST_FADE_MS, mountToast, toastOrder, toastOverflow } from './toast.js';
export type { ToastMount, ToastMountOptions, ToastSlot } from './toast.js';
export { TOOLBAR_GROUPS, mountToolbar } from './toolbar.js';
export type { Toolbar, ToolbarButton, ToolbarOptions } from './toolbar.js';
export { mountContextToolbar } from './context.js';
export type { ContextGroupView, ContextToolbar, ContextToolbarOptions } from './context.js';
export { mountHints } from './hints.js';
export type { HintOptions, Hints } from './hints.js';
export {
  FULLSCREEN_CLASS,
  FULLSCREEN_ENTER_ICON,
  FULLSCREEN_EXIT_ICON,
  PREVIEW_ICON,
  isFullscreen,
  mountViewTools,
  openLightbox,
  openPreview,
  setFullscreen,
} from './overlay.js';
export type { LightboxOptions, Overlay, PreviewOptions, ViewTools, ViewToolsOptions } from './overlay.js';
export { KEYBOARD_BOTTOM_VAR, KEYBOARD_TOP_VAR, mountSticky } from './sticky.js';
export type { Sticky, StickyOptions } from './sticky.js';
export { mountUploadView } from './upload.js';
export type { UploadView, UploadViewOptions } from './upload.js';
export { BUTTERFLY_SVG } from './parts/butterfly.js';
export { DEFAULT_BANDWIDTH, createTicker } from './parts/ticker.js';
export type { Ticker, TickerOptions } from './parts/ticker.js';
export { PICKED_ATTR, mountPickedMark } from './picked.js';
export type { PickedMark, PickedMarkOptions } from './picked.js';
export { openHistoryPanel } from './history.js';
export type { HistoryPanelOptions } from './history.js';
