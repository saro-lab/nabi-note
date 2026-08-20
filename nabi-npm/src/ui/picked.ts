// 골라진 물건의 표시 — 그림·영상·구분선을 클릭했을 때 "이것이 골라졌다"를 눈으로 말한다.
//
// **브라우저가 이 일을 안 해 준다.** 그림·iframe 같은 대체 엘리먼트 위에는 네이티브 선택 하이라이트가
// 안 그려진다. 그래서 골랐는데 화면이 아무 말도 안 하는 자리가 생긴다 — 무엇을 고쳤는지 모른 채
// 상황 줄만 바뀐다.
//
// **문서는 한 글자도 안 바뀐다.** 화면 DOM 에 표식 하나를 얹었다 걷을 뿐이라, 되돌리기·저장·출력이
// 이 표식을 영영 못 본다(코드 색칠이 토큰을 화면에만 두는 것과 같은 규칙이다).
//
// 새 구조에서 "물건을 골랐다" 는 별도 상태가 아니다 — **래퍼문단의 0~1 범위**가 그 뜻이다
// 여기서는 그 범위를 읽어 표식으로 옮기기만 한다.
//
// **인라인 물건(첨부 링크)은 여기 안 온다** — 래퍼문단이 없어서 이 셈에 안 걸린다. 같은 이름의
// 표식을 wings/link/attach 가 제 손으로 얹는다(선택이 첨부 하나를 꼭 맞게 덮을 때). 시트는
// 이 이름 하나만 그리므로 두 길의 표시가 같은 결이 된다.
import { isElement, isWrapper } from '../schema/index.js';
import { nodeAt } from '../doc/index.js';
import { ordered } from '../caret/index.js';
import type { Nabi } from '../editor/index.js';

// 화면 전용 표식 — 출력에는 안 나간다(조립이 이 이름을 모른다).
export const PICKED_ATTR = 'data-nabi-picked';

export interface PickedMarkOptions {
  readonly nabi: Nabi;
  // 편집 표면 — 표식이 이 안의 엘리먼트에 얹힌다.
  readonly surface: HTMLElement;
}

export interface PickedMark {
  refresh(): void;
  unmount(): void;
}

export function mountPickedMark(options: PickedMarkOptions): PickedMark {
  const { nabi, surface } = options;
  let marked: Element | null = null;

  const clear = (): void => {
    marked?.removeAttribute(PICKED_ATTR);
    marked = null;
  };

  // 지금 골라진 물건의 키 — 래퍼문단을 **통째로** 덮은 선택일 때만 답한다. 캐럿이 모서리에
  // 붙어 있기만 한 것은 고른 것이 아니다(0~1 이 아니라 0~0 이거나 1~1 이다).
  const pickedKey = (): string | null => {
    const sel = nabi.getSelection();
    const [start, end] = ordered(sel);
    if (start.path.length !== 1 || end.path.length !== 1 || start.path[0] !== end.path[0]) return null;
    if (start.offset !== 0 || end.offset !== 1) return null;

    const doc = nabi.$doc();
    const top = nodeAt(doc, start.path);
    if (!top || !isWrapper(top, nabi.$env)) return null;
    const lump = top.ch[0];
    if (!isElement(lump) || typeof lump._id !== 'string') return null;
    return lump._id;
  };

  const refresh = (): void => {
    const key = pickedKey();
    if (key === null) {
      clear();
      return;
    }
    const el = surface.querySelector(`[data-key="${key.replace(/["\\]/g, '\\$&')}"]`);
    if (el === marked) return;
    clear();
    if (!el) return;
    el.setAttribute(PICKED_ATTR, '');
    marked = el;
  };

  // 재그리기가 표식을 지운다(속성은 화면에만 있다) — 그래서 바뀔 때마다 다시 얹는다.
  const stop = nabi.onChange(refresh);
  refresh();

  return {
    refresh,
    unmount() {
      stop();
      clear();
    },
  };
}
