// 그림·영상·구분선 클릭 선택을 눈으로 보여주는 화면 전용 표식이다 — 문서는 한 글자도 안 바뀐다("물건을 골랐다"는 별도 상태가 아니라 래퍼문단의 0~1 범위일 뿐이다). 인라인 첨부 링크는 래퍼문단이 없어 여기 안 걸리고, wings/link/attach가 같은 이름의 표식을 따로 얹는다.
// A display-only marker showing that an image, video, or divider was clicked — the document itself never changes ("picked" isn't separate state, just a wrapper paragraph's 0-1 range). Inline attachment links have no wrapper, so they're marked separately by wings/link/attach under the same attribute name.
import { isElement, isWrapper } from '../schema/index.js';
import { nodeAt } from '../doc/index.js';
import { ordered } from '../caret/index.js';
import { hostOf, type Nabi } from '../editor/index.js';

// 화면 전용 표식 — 출력에는 안 나간다(조립이 이 이름을 모른다).
// A display-only attribute — never appears in output, since rendering doesn't know this name.
export const PICKED_ATTR = 'data-nabi-picked';

export interface PickedMarkOptions {
  readonly nabi: Nabi;
  // 편집 표면 — 표식이 이 안의 엘리먼트에 얹힌다.
  // The edit surface — the marker is applied to elements within it.
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

  // 표는 래퍼문단 앞뒤의 캐럿에도 표식을 보여 준다.
  // Tables also show the marker for a caret at either wrapper boundary.
  const pickedKey = (): string | null => {
    const sel = nabi.getSelection();
    const [start, end] = ordered(sel);
    if (start.path.length !== end.path.length || start.path.some((value, index) => value !== end.path[index]))
      return null;

    const doc = hostOf(nabi).doc();
    const top = nodeAt(doc, start.path);
    if (!top || !isWrapper(top, hostOf(nabi).env)) return null;
    const lump = top.ch[0];
    if (!isElement(lump) || typeof lump._id !== 'string') return null;
    const whole = start.offset === 0 && end.offset === 1;
    const tableEdge = lump.w === 'table' && start.offset === end.offset && (start.offset === 0 || start.offset === 1);
    if (!whole && !tableEdge) return null;
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
  // A redraw wipes the attribute (it's screen-only state), so it's reapplied on every change.
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
