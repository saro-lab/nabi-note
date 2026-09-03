// 두 가지 "가라앉음"을 한 부품이 든다 — 뿌리가 같다: 움직이는 중에 잰 값은 곧 틀릴 값이다. 고르는 중(드래그·Shift+화살표)은 몸짓이 끝나는 이벤트에서 바로 가라앉고, 뷰포트(키보드 오르내림)는 끝을 알리는 이벤트가 없어 조용한 시간을 잰다.
// One part covers two kinds of "settling," sharing the same root cause — a value measured mid-motion is already wrong. Selecting (drag, Shift+arrow) settles the instant its gesture ends; viewport (keyboard show/hide) has no end event, so it waits for a quiet period instead.
import { AsyncMountScope } from '../../lifecycle.js';

const QUIET_MS = 300;
const MAX_TRIES = 4;
const EXTENDING = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

export interface Settle {
  // 지금 몸짓 중인가 — 참이면 레이아웃을 밀 일은 미룬다.
  // Whether a gesture is in progress — while true, layout pushes are deferred.
  busy(): boolean;
  // 가라앉는 순간 한 번. 답은 끊는 함수다.
  // Fires once when things settle; returns an unsubscribe function.
  onSettle(fn: () => void): () => void;
  // 뷰포트가 조용해진 뒤 한 번 — 최대 네 번 다시 본다.
  // Fires once after the viewport goes quiet, rechecking up to four times.
  afterViewport(fn: () => void): void;
  unmount(): void;
}

export interface SettleOptions {
  // 몸짓을 세는 자리 — 편집 표면이다. 툴바를 누른 것은 "고르는 중"이 아니다.
  // Where gestures are counted — the edit surface; pressing the toolbar doesn't count as "selecting."
  readonly surface?: HTMLElement;
  readonly quietMs?: number;
}

export function watchSettle(owner: Document, options: SettleOptions = {}): Settle {
  const view = owner.defaultView;
  const visual = view?.visualViewport ?? null;
  const quiet = options.quietMs ?? QUIET_MS;
  const listeners = new Set<() => void>();
  const source = options.surface ?? owner;
  const lifetime = new AsyncMountScope();

  let choosing = false;
  let movedAt = 0;
  let timer: number | null = null;
  let frame: number | null = null;

  const settled = (): void => {
    if (!choosing) return;
    choosing = false;
    for (const fn of [...listeners]) {
      try {
        fn();
      } catch {
        // 리스너 하나의 실패가 나머지 settle 리스너를 막으면 안 된다.
        // One listener's failure must not strand the other settle listeners.
      }
    }
  };
  const start = (): void => {
    choosing = true;
  };

  const onPointerDown = (): void => start();
  const onPointerMove = (event: Event): void => {
    if ((event as PointerEvent).buttons === 0) settled();
  };
  const onKeyDown = (event: Event): void => {
    const key = event as KeyboardEvent;
    if (key.shiftKey && EXTENDING.has(key.key)) start();
    // 타이핑은 곧바로 앉아야 한다.
    // Typing must settle immediately.
    else settled();
  };
  const onKeyUp = (event: Event): void => {
    const key = event as KeyboardEvent;
    if (key.key === 'Shift' || EXTENDING.has(key.key)) settled();
  };
  const onViewport = (): void => {
    movedAt = Date.now();
  };

  source.addEventListener('pointerdown', onPointerDown);
  source.addEventListener('keydown', onKeyDown);
  source.addEventListener('keyup', onKeyUp);
  owner.addEventListener('pointerup', settled);
  owner.addEventListener('pointercancel', settled);
  owner.addEventListener('pointermove', onPointerMove);
  visual?.addEventListener('resize', onViewport);
  visual?.addEventListener('scroll', onViewport);

  const clear = (): void => {
    if (timer !== null && view) view.clearTimeout(timer);
    if (frame !== null && view) view.cancelAnimationFrame?.(frame);
    timer = null;
    frame = null;
  };

  return {
    busy: () => choosing,
    onSettle(fn) {
      if (lifetime.disposed) return () => undefined;
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    afterViewport(fn) {
      if (lifetime.disposed) return;
      clear();
      const generation = lifetime.next();
      if (!view) {
        if (lifetime.active(generation)) {
          try {
            fn();
          } catch {
            // 뷰포트가 이미 가라앉은 뒤라 넘길 뒷정리가 남아 있지 않다.
            // The viewport has already settled, so there's no remaining teardown to delegate this failure to.
          }
        }
        return;
      }
      let tries = 0;
      const look = (): void => {
        timer = null;
        if (!lifetime.active(generation)) return;
        const since = Date.now() - movedAt;
        if (since < quiet && tries < MAX_TRIES) {
          tries += 1;
          timer = view.setTimeout(look, quiet - since);
          return;
        }
        try {
          fn();
        } catch {
          // 부르는 쪽의 실패가 이 예약된 생명주기 밖으로 새면 안 된다.
          // A consumer's failure must not escape this scheduled lifecycle.
        }
      };
      // 한 프레임 뒤에 첫 걸음 — 레이아웃이 끝난 다음이어야 제대로 잰다.
      // The first check runs a frame later — layout must finish first for the measurement to be accurate.
      const kick = (): void => {
        frame = null;
        if (!lifetime.active(generation)) return;
        timer = view.setTimeout(look, movedAt === 0 ? 0 : quiet);
      };
      if (view.requestAnimationFrame) frame = view.requestAnimationFrame(kick);
      else kick();
    },
    unmount() {
      lifetime.dispose();
      clear();
      listeners.clear();
      source.removeEventListener('pointerdown', onPointerDown);
      source.removeEventListener('keydown', onKeyDown);
      source.removeEventListener('keyup', onKeyUp);
      owner.removeEventListener('pointerup', settled);
      owner.removeEventListener('pointercancel', settled);
      owner.removeEventListener('pointermove', onPointerMove);
      visual?.removeEventListener('resize', onViewport);
      visual?.removeEventListener('scroll', onViewport);
    },
  };
}
