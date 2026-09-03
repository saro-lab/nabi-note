// EditSurface 포트 — 편집 표면 구현을 갈아 끼우는 문이다(003 §6). 지금은 contenteditable(mount.ts) 하나뿐이고, EditContext가 서는 날 이 다섯 뒤로 새 구현이 들어와도 정책(actions·autoformat·vessel·redraw)은 안 바뀐다
// The EditSurface port lets the edit-surface implementation be swapped (003 §6); today there's only contenteditable (mount.ts), and a future EditContext implementation would slot in behind this interface without changing the policy layer (actions/autoformat/vessel/redraw)
import type { Selection } from '../caret/index.js';

export interface ReadCaret {
  readonly selection: Selection;
  // 화면 캐럿이 문단 사이 같은 "표현 불가" 자리라 가장 가까운 자리로 교정됐다
  // The screen caret was at a position the tree can't express (e.g. between paragraphs) and was corrected to the nearest one
  readonly corrected: boolean;
}

export interface EditSurfacePort {
  focus(): void;
  // 화면 선택 → 트리 선택 — 편집기 밖이면 null
  // Screen selection to tree selection; null if outside the editor
  readCaret(): ReadCaret | null;
  // 트리 선택 → 화면 — 자기가 일으킬 selectionchange는 구현이 스스로 삼킨다(쓰기 토큰)
  // Tree selection to screen; the implementation swallows the selectionchange event this write itself triggers (a write token)
  writeCaret(sel: Selection): void;
  // 브라우저가 DOM을 직접 고친 순간의 구독 — reconcile의 신호다
  // Subscribes to the moment the browser directly edits the DOM; the signal that drives reconcile
  onInput(handler: () => void): () => void;
  caretRect(): { readonly top: number; readonly bottom: number; readonly left: number; readonly right: number } | null;
}
