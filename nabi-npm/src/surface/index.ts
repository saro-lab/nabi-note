// surface 층의 문 — 순수부(actions·autoformat·vessel·redraw·text·fragment, DOM 없이 테스트됨)와 DOM부(mount·map, 브라우저 이벤트 배선만)가 여기서 나간다
// The surface layer's entry point, exporting the pure part (actions/autoformat/vessel/redraw/text/fragment, testable without DOM) and the DOM part (mount/map, which only wires browser events)
export { makeSurfaceActions, TAP_MS } from './actions.js';
export type { ArrowDir, SurfaceActions, SurfaceActionsOptions } from './actions.js';
export { tryInputRule } from './autoformat.js';
export { canEscape, escapeVesselOp, vesselAt } from './vessel.js';
export type { VesselAt } from './vessel.js';
export { diffPlain, holderTextOf } from './text.js';
export type { TextChange } from './text.js';
export { insertFragmentOp } from './fragment.js';
export { ioFiltersOf, mdEnvOf } from './filters.js';
export type { FilterListOptions } from './filters.js';
// 복사·잘라내기가 클립보드에 직접 실을 글자를 짓는다(260823_008) — 첨부 하나는 문단으로 감싸고 빈 문단을 잇는다(260823_010)
// Builds the text copy/cut write to the clipboard directly (260823_008); a lone attachment is wrapped in a paragraph plus a trailing empty one (260823_010)
export {
  clipContextOf,
  clipboardBodyOf,
  clipHtmlOf,
  dressClipHtml,
  encodeClipboardBody,
  fileClipHtml,
  loadClipboard,
  loneFileLink,
  NABI_CLIPBOARD_MIME,
  wrapClipHtml,
} from './clipboard.js';
export type { ClipTarget } from './clipboard.js';
export { makePasteFlow, pickLabel } from './paste.js';
export type { PasteFlowOptions } from './paste.js';
export { planRedraw } from './redraw.js';
export type { RedrawOp } from './redraw.js';
export type { EditSurfacePort, ReadCaret } from './port.js';
export { domTextOf, fromDomPoint, holderElOf, pathOfId, toDomPoint, ZERO_WIDTH } from './map.js';
export type { DomPoint, MappedPoint } from './map.js';
export { mountSurface } from './mount.js';
export type { Surface, SurfaceOptions } from './mount.js';
// mount 부속(11) — 호스트 배선(전송 훅·저장소)이 있어야 사는 것만 여기 선다. 선언만으로 끝나는 부속(체크 띠·코드 색칠 등)은 wing의 attach로 산다
// Mount extras (11) live here only if they need host wiring (upload hook, storage); declaration-only extras (checklist styling, code highlighting) live in a wing's attach instead
export { mountUpload } from './parts/upload.js';
export type { StartedTask, UploadMount, UploadOptions, UploadTask, Uploader } from './parts/upload.js';
export { browserFileStore, mountFile, readExtensions } from './parts/file.js';
export type { FileMount, FileMountOptions, SaveFormat } from './parts/file.js';
export { browserHistoryStorage, mountLocalHistory } from './parts/history.js';
export type { HistoryMount, HistoryMountOptions } from './parts/history.js';
