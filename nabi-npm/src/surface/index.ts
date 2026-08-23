// surface 층의 문 — 정책(순수부)과 표면(DOM부)이 여기서 나간다.
// 순수부(actions·autoformat·vessel·redraw·text·fragment)는 DOM 없이 그물에 잡히고
// DOM부(mount·map)는 그것을 브라우저 이벤트에 배선만 한다.
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
// 나비가 방금 낸 조각인가 — 복사·잘라내기의 전역 기억과 그 순수 판정 (260823_007).
export { clipMemory, clipText, forgetClip, fromNabi, normalizeClipHtml, rememberClip, sameClip } from './clip.js';
// 복사·잘라내기가 클립보드에 **직접 싣는** 글자를 짓는 자리 (260823_008).
// 첨부 하나는 문단으로 감싸고 빈 문단을 잇는다 (260823_010).
export {
  clipContextOf,
  clipHtmlOf,
  dressClipHtml,
  fileClipHtml,
  loadClipboard,
  loneFileLink,
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
// mount 부속 (11) — 호스트 배선(전송 훅·저장소)이 있어야 사는 것들만 여기 선다.
// 선언만으로 끝나는 부속(체크 띠·코드 색칠·깨진 그림)은 wing 의 `attach` 로 산다.
export { mountUpload } from './parts/upload.js';
export type { StartedTask, UploadMount, UploadOptions, UploadTask, Uploader } from './parts/upload.js';
export { browserFileStore, mountFile, readExtensions } from './parts/file.js';
export type { FileMount, FileMountOptions, SaveFormat } from './parts/file.js';
export { browserHistoryStorage, mountLocalHistory } from './parts/history.js';
export type { HistoryMount, HistoryMountOptions } from './parts/history.js';
