// 이 파일의 export는 순수 판정 / 공통 부품 / mount 문, 세 갈래로 묶여 있다 — 아래층(surface·wing·editor)은 이 파일을 모른다.
// Exports here are grouped in three bands — pure logic, shared parts, mount functions; lower layers (surface, wing, editor) never import this file.
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
export {
  BAND_MARGIN,
  KEYBOARD_STEPS,
  REVEAL_STEPS,
  bandFix,
  bandOf,
  isIos,
  placeWalk,
  revealFix,
  revealWalk,
  underWalk,
} from './band.js';
export type { Band, Rect } from './band.js';
export { CORE_CSS, collectSheets, injectSheets, sheetKey } from './css.js';
export type { SheetSource } from './css.js';

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
export { TOOLBAR_GROUPS, actionReaches, mountToolbar, ownsKey } from './toolbar.js';
export type { KeyBox, KeyScope, Toolbar, ToolbarButton, ToolbarOptions } from './toolbar.js';
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
export { CHOOSE_COLS, gridStep, initialChoice, openChoosePanel } from './choose.js';
export type { ChoosePanelOptions } from './choose.js';
export { openHistoryPanel } from './history.js';
export type { HistoryPanelOptions } from './history.js';
export { extensionFor, formatName, openSavePanel } from './save.js';
export type { SavePanelOptions } from './save.js';
