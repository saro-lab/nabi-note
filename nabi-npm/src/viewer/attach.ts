// 보는 쪽 런타임을 한 번에 거는 문 — 호스트에 남는 건 선언 한 줄뿐이다. 기능(열 정렬·코드 색칠 등)이 늘 때마다 호스트가 배선을 고쳐야 한다면 이미 세워진 페이지엔 새 기능이 영영 안 오므로, 늘어나는 자리를 여기 하나로 모은다. 미리보기 본문과 발행된 .nabi-content 둘 다 같은 문을 걸어야 미리보기가 발행과 갈리지 않는다
// The single door that wires up all reader-side runtime; a host only ever writes one declarative line. If the host had to rewire itself every time a feature (column sort, code highlighting, ...) was added, an already-deployed page would never get it, so growth happens in this one place instead. Both attachment points -- the preview body (from PreviewOptions.onBody) and the published page's .nabi-content -- must go through this same door, or the preview would drift from what's actually published
import { attachCodePaint, type CodePaintOptions } from './code-paint.js';
import { attachTableSort, type TableSortOptions } from './table-sort.js';
import { claimMountRoot } from '../lifecycle.js';

export interface ViewerOptions extends TableSortOptions, CodePaintOptions {}

export interface ViewerAttachment {
  // Host HTML이 바뀐 뒤 reader behavior를 새 내용에 다시 건다
  // Re-attaches reader behavior to new content after the host's HTML changes
  refresh(): void;
  // 건 역순으로 전부 되돌린다 — 뗀 뒤의 DOM은 viewer를 걸기 전과 같다
  // Undoes everything in reverse order; the DOM after unmount matches what it was before the viewer attached
  unmount(): void;
}

// 같은 root에는 reader behavior 하나만 선다 — refresh는 먼저 자기 흔적을 걷고 현재 host DOM에 다시 붙으므로, host가 새로 그린 published HTML도 받을 수 있다
// Only one reader behavior lives on a given root; refresh first removes its own traces, then reattaches to the current host DOM, so freshly re-rendered published HTML is picked up too
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
        // 한 리더 기능의 실패가 다른 기능의 host 기준선을 망치면 안 된다
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
    // 기능 콜백이 붙는 도중에 새 스냅샷을 또 요청할 수 있다 — 뒤이은 한 번의 패스가 그 변경을 반영하고, 그 안에서 또 요청이 와도 무한 반복을 막기 위해 접는다
    // A feature callback may ask for a fresh host snapshot while the current one is still being attached; one trailing pass sees that mutation, and further requests within it are folded to keep hostile callbacks finite
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
            // 설정 실패나 해제 요청을 그대로 보존한다
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
