// EditSurface 포트 — 편집 표면 구현이 갈아 끼워지는 문이다 (, 옛 RFC 003 §6).
// 지금 구현은 contenteditable(mount.ts) 하나이고, EditContext 가 서는 날 이 다섯 뒤로
// 새 구현이 들어온다 — 정책(actions·autoformat·vessel·redraw)은 한 줄도 안 바뀐다.
import type { Selection } from '../caret/index.js';

export interface ReadCaret {
  readonly selection: Selection;
  // 화면 캐럿이 문단 사이 같은 "표현 불가" 자리라 가장 가까운 자리로 교정됐다.
  readonly corrected: boolean;
}

export interface EditSurfacePort {
  focus(): void;
  // 화면 선택 → 트리 선택. 편집기 밖이면 null.
  readCaret(): ReadCaret | null;
  // 트리 선택 → 화면. 자기가 일으킬 selectionchange 는 구현이 스스로 삼킨다(쓰기 토큰).
  writeCaret(sel: Selection): void;
  // 브라우저가 DOM 을 직접 고친 순간의 구독 — 되맞추기의 신호.
  onInput(handler: () => void): () => void;
  caretRect(): { readonly top: number; readonly bottom: number; readonly left: number; readonly right: number } | null;
}
