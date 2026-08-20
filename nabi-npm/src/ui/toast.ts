// 기본 toast — core 가 들고 오는 알림 그릇 하나 (084 ①). 계약은 editor/toast.ts 에 있고
// 여기는 그 계약의 **몸**이다: 툴바가 이 mount 를 세우고, 그릇은 `nabi.$bindToast` 로
// 인스턴스에 스스로 선다. 호스트가 콜백(옵션 `toast`)을 끼운 인스턴스에서는 이 그릇이 한 번도
// 안 불려 DOM 도 안 생긴다 — 표시만 갈아탄다는 것이 그 말이다.
//
// 자리는 **툴바 아래쯤의 고정 지점**이다 — 상황 줄(컨텍스트 툴바)의 유무·작동과 무관하다
// (주인 답, 084 ask ②). 그래서 상황 줄 곁이 아니라 툴바 줄(`.nabi-toolbar-row`)에 절대 배치로
// 붙는다: 상황 줄이 떴다 사라져도 이 자리는 안 움직인다.
import type { Nabi, Toast } from '../editor/index.js';
import { make } from './parts/dom.js';

// --- 순수 판정 — 차례와 걷어낼 것 (DOM 없이 그물에 잡힌다) -----------------------------------

// 판정에 필요한 둘뿐이다 — 넣은 차례(seq)와 걷히는 시각(ends).
export interface ToastSlot {
  readonly seq: number;
  readonly ends: number;
}

// 쌓임 차례(위→아래) — 넣은 차례가 아니라 **남은 시간순**이다: 많이 남은 것이 위, 곧 사라질
// 것이 아래 (084 ask ① 해석 3). 모두 같은 속도로 줄어드니 "남은 시간순"은 끝나는 시각순과
// 같은 말이다 — 그래서 지금 시각이 인자에 없다. 시간이 같으면 새것이 위다: 같은 시간으로
// A→B→C 를 부르면 위에서부터 C/B/A 가 된다.
export function toastOrder<T extends ToastSlot>(slots: readonly T[]): readonly T[] {
  return [...slots].sort((a, b) => b.ends - a.ends || b.seq - a.seq);
}

// 상한 초과분 — **남은 시간이 가장 적은 것부터** 걷는다 (084 ask ① 해석 4). 시간이 같으면
// 먼저 온 것부터 — 차례 규칙("같으면 새것이 위")의 거울이라, 걷히는 쪽은 늘 맨 아래다.
export function toastOverflow<T extends ToastSlot>(slots: readonly T[], max: number): readonly T[] {
  if (slots.length <= Math.max(0, max)) return [];
  return [...slots].sort((a, b) => a.ends - b.ends || a.seq - b.seq).slice(0, slots.length - max);
}

// 옅어지기 시작하는 지점 — 남은 시간이 이만큼일 때부터 0 까지 서서히 (084 ask ① 해석 2).
// css.ts 의 `.nabi-toast` transition 시간과 같아야 한다.
export const TOAST_FADE_MS = 500;

// --- 그릇 -------------------------------------------------------------------------------------

export interface ToastMountOptions {
  readonly nabi: Nabi;
  // 그릇이 붙을 툴바 줄 — 시트(`.nabi-toasts`)가 이 상자의 아래에 고정한다.
  readonly root: HTMLElement;
}

export interface ToastMount {
  // 이 그릇이 직접 그리는 문 — $bindToast 로 걸리는 바로 그 함수다. 그물·데모가 쥘 수 있게 내놓는다.
  readonly toast: Toast;
  unmount(): void;
}

interface Item extends ToastSlot {
  readonly el: HTMLElement;
  readonly fade: ReturnType<typeof setTimeout>;
  readonly end: ReturnType<typeof setTimeout>;
}

export function mountToast(options: ToastMountOptions): ToastMount {
  const { nabi, root } = options;
  const owner = root.ownerDocument;
  // 선반은 첫 말이 올 때 세우고 다 걷히면 치운다 — 말이 없는 동안 빈 상자를 안 남긴다.
  let shelf: HTMLElement | null = null;
  let seq = 0;
  const items: Item[] = [];

  const drop = (item: Item): void => {
    const at = items.indexOf(item);
    if (at === -1) return;
    items.splice(at, 1);
    clearTimeout(item.fade);
    clearTimeout(item.end);
    item.el.remove();
    if (items.length === 0) {
      shelf?.remove();
      shelf = null;
    }
  };

  const say: Toast = (level, message, ms) => {
    const live = Math.max(0, ms ?? nabi.$toastMs);
    const el = make(owner, 'div', 'nabi-toast', { 'data-level': level });
    // `\n` 이 산다 — textContent + 시트의 pre-wrap. innerHTML 이 아니므로 말이 마크업이 될 길이 없다.
    el.textContent = message;

    // 남은 시간 TOAST_FADE_MS 지점부터 옅어져 0 에서 걷힌다. 그보다 짧게 산 말은 바로
    // 옅어지기 시작한다 — 사는 시간 전부가 곧 사라지는 시간이라 duration 을 그만큼 줄인다.
    const fadeAt = Math.max(0, live - TOAST_FADE_MS);
    if (live < TOAST_FADE_MS) el.style.transitionDuration = `${live}ms`;

    const item: Item = {
      seq: seq++,
      ends: Date.now() + live,
      el,
      fade: setTimeout(() => el.classList.add('is-fading'), fadeAt),
      end: setTimeout(() => drop(item), live),
    };
    items.push(item);

    // 넘치면 남은 시간이 가장 적은 것부터 걷는다 — 방금 넣은 것이 가장 짧으면 그것이 걷힌다.
    for (const gone of toastOverflow(items, nabi.$toastMax)) drop(gone);
    if (!items.includes(item)) return;

    if (!shelf) {
      // 낭독은 조용히 — 알림이지 경보가 아니다. 새로 붙는 글을 읽는 것은 aria-live 가 맡는다.
      shelf = make(owner, 'div', 'nabi-toasts', { role: 'status', 'aria-live': 'polite' });
      root.append(shelf);
    }
    // 새것만 제 자리에 끼운다 — 있는 것들을 다시 붙이면 옅어지던 transition 이 끊긴다.
    const order = toastOrder(items);
    const below = order[order.indexOf(item) + 1];
    shelf.insertBefore(el, below ? below.el : null);

    // 클릭하면 즉시 걷힌다 — 읽었다는 뜻이라 남은 시간을 기다릴 까닭이 없다.
    el.addEventListener('click', () => drop(item));
  };

  const unbind = nabi.$bindToast(say);

  return {
    toast: say,
    unmount() {
      unbind();
      for (const item of [...items]) drop(item);
    },
  };
}
