// 그릇은 editor/toast.ts의 계약을 구현하는 몸이다 — hostOf(nabi).bindToast로 인스턴스에 스스로 선다. 호스트가 옵션 toast 콜백을 끼운 인스턴스에서는 이 그릇이 안 불려 DOM도 안 생긴다.
// This mount implements the contract declared in editor/toast.ts, attaching itself to the instance via hostOf(nabi).bindToast. On an instance where the host supplied its own `toast` option, this mount is never invoked and creates no DOM.
//
// 자리는 상황 줄과 무관한 툴바 아래 고정 지점이다 — 그래서 상황 줄 곁이 아니라 툴바 줄(.nabi-toolbar-row)에 절대 배치로 붙어, 상황 줄이 떴다 사라져도 안 움직인다.
// Its position is a fixed point below the toolbar, independent of the context toolbar — anchored to the toolbar row (`.nabi-toolbar-row`) rather than beside the context row, so it never moves as that row appears or disappears.
import { hostOf, type Nabi, type Toast } from '../editor/index.js';
import { MOTION_TOAST_MS } from '../style/tokens.js';
import { make } from './parts/dom.js';

// --- 순수 판정 — 차례와 걷어낼 것 (DOM 없이 그물에 잡힌다) -----------------------------------

// 판정에 필요한 둘뿐이다 — 넣은 차례(seq)와 걷히는 시각(ends).
// Only two things needed to decide order — insertion sequence (seq) and when it clears (ends).
export interface ToastSlot {
  readonly seq: number;
  readonly ends: number;
}

// 쌓임 차례(위→아래)는 넣은 차례가 아니라 남은 시간순이다 — 많이 남은 것이 위, 곧 사라질 것이 아래. 모두 같은 속도로 줄어드니 남은 시간순은 끝나는 시각순과 같다. 시간이 같으면 새것이 위다.
// Stacking order (top to bottom) is by time remaining, not insertion order — the longest-lived is on top, the soonest to vanish on bottom. Since all shrink at the same rate, "remaining time" and "end time" sort identically. Ties go to the newest.
export function toastOrder<T extends ToastSlot>(slots: readonly T[]): readonly T[] {
  return [...slots].sort((a, b) => b.ends - a.ends || b.seq - a.seq);
}

// 상한 초과분은 남은 시간이 가장 적은 것부터 걷는다 — 시간이 같으면 먼저 온 것부터(차례 규칙의 거울이라, 걷히는 쪽은 늘 맨 아래다).
// Overflow is trimmed starting from the least time remaining — ties go to whichever arrived first (the mirror of the stacking rule, so what's removed is always at the bottom).
export function toastOverflow<T extends ToastSlot>(slots: readonly T[], max: number): readonly T[] {
  if (slots.length <= Math.max(0, max)) return [];
  return [...slots].sort((a, b) => a.ends - b.ends || a.seq - b.seq).slice(0, slots.length - max);
}

// 옅어지기 시작하는 지점 — 남은 시간이 이만큼일 때부터 0까지 서서히. css.ts의 .nabi-toast transition 시간과 같아야 한다.
// Where fading begins — gradual from this much time remaining down to 0. Must match the `.nabi-toast` transition duration in css.ts.
export const TOAST_FADE_MS = MOTION_TOAST_MS;

// --- 그릇 -------------------------------------------------------------------------------------

export interface ToastMountOptions {
  readonly nabi: Nabi;
  // 그릇이 붙을 툴바 줄 — 시트(`.nabi-toasts`)가 이 상자의 아래에 고정한다.
  // The toolbar row this mount attaches to — the stylesheet (`.nabi-toasts`) pins itself below this box.
  readonly root: HTMLElement;
}

export interface ToastMount {
  // 이 그릇이 직접 그리는 문 — $bindToast로 걸리는 바로 그 함수다. 그물·데모가 쥘 수 있게 내놓는다.
  // The function this mount draws with directly — the same one wired via $bindToast, exposed so tests and demos can call it too.
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
  // The shelf is built on the first message and torn down once all are gone, so no empty box lingers.
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
    const live = Math.max(0, ms ?? hostOf(nabi).toastMs);
    const el = make(owner, 'div', 'nabi-toast', { 'data-level': level });
    // `\n`이 산다 — textContent + 시트의 pre-wrap. innerHTML이 아니므로 말이 마크업이 될 길이 없다.
    // `\n` survives via textContent plus the stylesheet's pre-wrap — never innerHTML, so the message can't become markup.
    el.textContent = message;

    // 남은 시간 TOAST_FADE_MS 지점부터 옅어져 0에서 걷힌다. 그보다 짧게 산 말은 바로 옅어지기 시작한다 — 사는 시간 전부가 곧 사라지는 시간이라 duration을 그만큼 줄인다.
    // Fading starts when TOAST_FADE_MS remains and finishes at 0. A message living shorter than that starts fading immediately, with its whole lifespan as the fade duration.
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
    // On overflow, whatever has the least time left is dropped first — if the one just added is shortest, it goes.
    for (const gone of toastOverflow(items, hostOf(nabi).toastMax)) drop(gone);
    if (!items.includes(item)) return;

    if (!shelf) {
      // 낭독은 조용히 — 알림이지 경보가 아니다. 새로 붙는 글을 읽는 것은 aria-live가 맡는다.
      // Announced quietly — a notice, not an alarm. aria-live handles reading out newly added text.
      shelf = make(owner, 'div', 'nabi-toasts', { role: 'status', 'aria-live': 'polite' });
      root.append(shelf);
    }
    // 새것만 제 자리에 끼운다 — 있는 것들을 다시 붙이면 옅어지던 transition이 끊긴다.
    // Only the new one is inserted in place — re-appending existing toasts would cut off their fade transition.
    const order = toastOrder(items);
    const below = order[order.indexOf(item) + 1];
    shelf.insertBefore(el, below ? below.el : null);

    // 클릭하면 즉시 걷힌다 — 읽었다는 뜻이라 남은 시간을 기다릴 까닭이 없다.
    // A click clears it immediately — that means it was read, so there's no reason to wait out the remaining time.
    el.addEventListener('click', () => drop(item));
  };

  const unbind = hostOf(nabi).bindToast(say);

  return {
    toast: say,
    unmount() {
      unbind();
      for (const item of [...items]) drop(item);
    },
  };
}
