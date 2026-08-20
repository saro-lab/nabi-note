// surface 층의 문 — 정책(순수부)과 표면(DOM부)이 여기서 나간다.
// 순수부(actions·autoformat·vessel·redraw·text·fragment)는 DOM 없이 그물에 잡히고
// DOM부(mount·map)는 그것을 브라우저 이벤트에 배선만 한다.
export { makeSurfaceActions } from './actions.js';
export type { ArrowDir, SurfaceActions, SurfaceActionsOptions } from './actions.js';
export { tryInputRule } from './autoformat.js';
export { canEscape, escapeVesselOp, vesselAt } from './vessel.js';
export type { VesselAt } from './vessel.js';
export { diffPlain, holderTextOf } from './text.js';
export type { TextChange } from './text.js';
export { insertFragmentOp } from './fragment.js';
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
export { browserFileStore, mountFile } from './parts/file.js';
export type { DroppedFile, FileMount, FileMountOptions } from './parts/file.js';
export { browserHistoryStorage, mountLocalHistory } from './parts/history.js';
export type { HistoryMount, HistoryMountOptions } from './parts/history.js';
