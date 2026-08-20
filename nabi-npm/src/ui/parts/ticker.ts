// 진행률 티커 — **시계가 둘**이다. 화면의 숫자는 이 티커가 몰고, 시한은 진짜 콜백이 되감는다.
//
// 왜 둘인가: ajax 의 진행 콜백은 촘촘히 안 온다. 작은 파일이나 버퍼링 프록시는 0% 다음 바로
// 100% 를 준다 — 그 숫자만 그리면 막대가 멈춰 있다가 튄다. 그래서 화면은 **회선을 짐작해서**
// 걷고, 진짜 콜백이 오면 그것으로 따라잡고 회선을 다시 잰다.
//
// **DOM 을 일부러 모른다** — 그물이 화면 없이 가짜 시계로 돌릴 수 있어야 하기 때문이다.
// 시계는 인자로 받는다(`now`·`schedule`).

// 진짜 콜백이 회선을 재기 전까지의 짐작 — 100Mbps.
export const DEFAULT_BANDWIDTH = 12_500_000;

// **완료 전에는 여기를 안 넘는다.** 도는 중에 100 이 떠 있는 것은 거짓말이다.
const CEILING = 99;

// 짐작을 접고 느려지는 지점과 그 배수 — 뒤로 갈수록 조심스러워진다.
const THRESHOLDS = [70, 80, 90] as const;
const SLOWDOWN = 4;

// 한 걸음의 최소 간격. 시트의 전환 시간과 같은 값이라야 전환이 서로를 안 자른다.
// 작은 파일의 바닥도 겸한다 — 이 걸음 99번이 아주 작은 파일의 최소 지속 시간 노릇을 한다.
const MIN_TICK_MS = 140;

// 완료 꼬리 — 숫자가 아무리 뒤처져 있어도 이 안에 100 까지 간다.
const FINISH_MS = 250;
const TAIL_TICK_MS = 25;

export interface TickerOptions {
  readonly size: number;
  // 초당 바이트. `0` 이면 티커를 끄고 진짜 콜백이 그대로 지나간다.
  readonly bandwidth?: number;
  onChange(percent: number): void;
  now?(): number;
  // 지연 실행 — 그물이 가짜 시계를 꽂는 자리다.
  schedule?(fn: () => void, ms: number): () => void;
}

export interface Ticker {
  // 진짜 콜백이 왔다 — 앞서 있으면 따라잡고, 회선을 다시 재고, 감속을 되돌린다.
  report(percent: number): void;
  // 끝났다 — 숫자를 100 까지 몰고 나서 끝난다.
  finish(): Promise<void>;
  stop(): void;
}

export function createTicker(options: TickerOptions): Ticker {
  const now = options.now ?? (() => Date.now());
  const schedule =
    options.schedule ??
    ((fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      return () => clearTimeout(id);
    });

  const bandwidth = options.bandwidth ?? DEFAULT_BANDWIDTH;
  const enabled = bandwidth > 0 && options.size > 0;

  let shown = 0;
  let sent = -1; // 진짜 콜백이 말한 마지막 값
  let stage = 0; // 몇 번째 감속 구간인가
  let reportedSinceStage = false;
  let stopped = false;
  let cancel: (() => void) | null = null;
  let releaseFinish: (() => void) | null = null;

  const startedAt = now();

  // 화면은 이 문으로만 움직인다 — **뒤로 가지 않는다**는 규칙을 여기 한 곳에서 지킨다.
  const show = (next: number): void => {
    const value = Math.max(shown, Math.min(100, Math.round(next)));
    if (value === shown) return;
    shown = value;
    options.onChange(shown);
  };

  // 한 걸음의 간격 — 회선 짐작으로 99까지 가는 시간을 나눈 값이고, 뒤 구간일수록 느리다.
  const stepMs = (): number => {
    const seconds = options.size / bandwidth;
    const base = Math.max(MIN_TICK_MS, (seconds * 1000) / CEILING);
    return base * SLOWDOWN ** stage;
  };

  const tick = (): void => {
    if (stopped || releaseFinish) return;
    // 감속 구간을 넘었는데 그 사이 진짜 콜백이 한 번도 안 왔으면 더 조심한다.
    const at = THRESHOLDS[stage];
    if (at !== undefined && shown >= at) {
      if (!reportedSinceStage) stage += 1;
      reportedSinceStage = false;
    }
    if (shown < CEILING) show(shown + 1);
    cancel = schedule(tick, stepMs());
  };

  if (enabled) cancel = schedule(tick, stepMs());

  return {
    report(percent) {
      if (stopped) return;
      const value = Math.max(0, Math.min(100, percent));
      if (value <= sent) return;
      sent = value;
      reportedSinceStage = true;
      // 진짜가 앞서면 따라잡는다. 진짜가 뒤처져 있으면 **끌어내리지 않는다** — 숫자는 안 되돌아간다.
      if (value > shown) show(Math.min(value, CEILING));
      // 회선을 다시 잰다: 지금까지 걸린 시간과 진짜 진행률로 남은 걸음의 속도를 고친다.
      const elapsed = now() - startedAt;
      if (elapsed > 0 && value > 0) stage = 0;
    },
    finish() {
      if (stopped) return Promise.resolve();
      cancel?.();
      cancel = null;
      return new Promise<void>((resolve) => {
        releaseFinish = resolve;
        // 남은 거리를 FINISH_MS 안에 나눠 걷는다 — 100 으로 튀지 않고 달려간다.
        const left = 100 - shown;
        if (left <= 0) {
          releaseFinish = null;
          resolve();
          return;
        }
        const steps = Math.max(1, Math.round(FINISH_MS / TAIL_TICK_MS));
        const per = left / steps;
        let done = 0;
        const run = (): void => {
          if (stopped) {
            releaseFinish = null;
            resolve();
            return;
          }
          done += 1;
          show(shown + per);
          if (done >= steps || shown >= 100) {
            show(100);
            releaseFinish = null;
            resolve();
            return;
          }
          cancel = schedule(run, TAIL_TICK_MS);
        };
        cancel = schedule(run, TAIL_TICK_MS);
      });
    },
    stop() {
      stopped = true;
      cancel?.();
      cancel = null;
      releaseFinish?.();
      releaseFinish = null;
    },
  };
}
