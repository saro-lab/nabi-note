// 보는 쪽 런타임을 **한 번에** 거는 문 — 호스트에 남는 것은 "무엇을 쓴다" 는 선언 한 줄이다.
//
// 왜 문이 하나여야 하는가: 읽는 사람이 발행된 페이지에서 겪는 것은 하나가 아니다(열 정렬·코드
// 색칠…). 그 목록이 늘 때마다 호스트가 제 배선을 한 줄씩 고쳐야 한다면, 늘어난 기능은 이미
// 세워진 페이지에는 영영 안 온다. 여기 한 자리에서 늘면 호스트는 그대로다.
//
// 걸 자리는 둘 다 같다 — 미리보기의 본문(`PreviewOptions.onBody` 가 넘겨주는 그 요소)이거나
// 발행된 페이지의 `.nabi-content` 다. 미리보기가 발행된 쪽과 다르면 안 되므로, 그 둘에 같은
// 문을 걸어야 한다는 것이 이 파일의 요점이다.
import { attachCodePaint, type CodePaintOptions } from './code-paint.js';
import { attachTableSort, type TableSortOptions } from './table-sort.js';
import { claimMountRoot } from '../lifecycle.js';

export interface ViewerOptions extends TableSortOptions, CodePaintOptions {}

export interface ViewerAttachment {
  // Host HTML 이 바뀐 뒤 reader behavior 를 새 내용에 다시 건다.
  refresh(): void;
  // 건 역순으로 전부 되돌린다. 뗀 뒤의 DOM 은 viewer를 걸기 전과 같다.
  unmount(): void;
}

// 같은 root에는 reader behavior 하나만 선다. refresh는 먼저 자기 흔적을 걷고 현재 host DOM에
// 다시 붙으므로, host가 새로 그린 published HTML도 명시적으로 받을 수 있다.
export function attachViewer(root: HTMLElement, options: ViewerOptions = {}): ViewerAttachment {
  const releaseRoot = claimMountRoot(root);

  let detachers: (() => void)[] = [];
  let disposed = false;
  let refreshing = false;
  let pending = false;
  let releaseDeferred = false;
  const clear = (): void => {
    const active = detachers;
    detachers = [];
    for (const detach of active.reverse()) {
      try {
        detach();
      } catch {
        // One reader feature must not strand another feature's host baseline.
      }
    }
  };
  const refresh = (): void => {
    if (disposed) return;
    if (refreshing) {
      pending = true;
      return;
    }
    // A feature callback may ask for a fresh host snapshot while the current one is
    // still being attached. One trailing pass sees that mutation; further requests
    // in that pass are deliberately folded to keep hostile callbacks finite.
    let reran = false;
    do {
      pending = false;
      refreshing = true;
      const next: (() => void)[] = [];
      const rollback = (): void => {
        for (const detach of next.reverse()) {
          try {
            detach();
          } catch {
            // Preserve the setup failure or disposal request.
          }
        }
      };
      try {
        clear();
        next.push(attachTableSort(root, options));
        next.push(attachCodePaint(root, options));
        if (disposed) {
          rollback();
          return;
        }
        detachers = next;
      } catch (error) {
        pending = false;
        rollback();
        throw error;
      } finally {
        refreshing = false;
        if (releaseDeferred) {
          releaseDeferred = false;
          releaseRoot();
        }
      }
      if (disposed || reran || !pending) return;
      reran = true;
    } while (true);
  };
  const attachment: ViewerAttachment = {
    refresh,
    unmount() {
      if (disposed) return;
      disposed = true;
      clear();
      if (refreshing) releaseDeferred = true;
      else releaseRoot();
    },
  };
  try {
    refresh();
  } catch (error) {
    disposed = true;
    releaseRoot();
    throw error;
  }
  return attachment;
}
