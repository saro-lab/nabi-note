// settle 대기 — **하나**다. 옛 판은 문자 그대로 같은 코드가 두 벌이었다 (부검 §1-7).
//
// 두 가지 "가라앉음"을 한 부품이 든다. 뿌리가 같기 때문이다 — *움직이는 중에 잰 값은 곧 틀릴 값이다.*
//   고르는 중  — 드래그·Shift+화살표로 범위를 늘리는 동안. 줄 높이를 바꾸는 일은 기다린다
//   뷰포트     — 키보드가 오르내리는 동안. 띠 계산은 조용해진 뒤에 한다 (040 §3)
//
// 고르는 중의 판정에는 **타이머가 없다** — 몸짓을 끝낸 그 이벤트 안에서 바로 가라앉는다.
// 뷰포트는 그럴 수 없다(끝을 알리는 이벤트가 없다) — 거기만 조용한 시간을 센다.
import { AsyncMountScope } from '../../lifecycle.js';

const QUIET_MS = 300;
const MAX_TRIES = 4;
const EXTENDING = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

export interface Settle {
  // 지금 몸짓 중인가 — 참이면 레이아웃을 밀 일은 미룬다.
  busy(): boolean;
  // 가라앉는 순간 한 번. 답은 끊는 함수다.
  onSettle(fn: () => void): () => void;
  // 뷰포트가 조용해진 뒤 한 번 — 최대 네 번 다시 본다.
  afterViewport(fn: () => void): void;
  unmount(): void;
}

export interface SettleOptions {
  // 몸짓을 세는 자리 — 편집 표면이다. 툴바를 누른 것은 "고르는 중"이 아니다.
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
        // One listener must not strand the other settle listeners.
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
    else settled(); // 타이핑은 곧바로 앉아야 한다
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
            // The settled viewport has no remaining teardown to delegate.
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
          // A consumer failure must not escape the scheduled lifecycle.
        }
      };
      // 한 프레임 뒤에 첫 걸음 — 레이아웃이 끝난 다음이어야 제대로 잰다 (040 §"다시 열 때" 1).
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
