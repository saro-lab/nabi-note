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

export interface ViewerOptions extends TableSortOptions, CodePaintOptions {}

// 답은 떼는 함수 하나 — 건 역순으로 전부 되돌린다. 뗀 뒤의 DOM 은 걸기 전과 같다.
export function attachViewer(root: HTMLElement, options: ViewerOptions = {}): () => void {
  const detachers = [attachTableSort(root, options), attachCodePaint(root, options)];
  return () => {
    for (const detach of [...detachers].reverse()) detach();
  };
}
