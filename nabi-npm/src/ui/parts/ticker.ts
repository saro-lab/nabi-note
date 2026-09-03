// 화면의 숫자는 이 티커가 몰고, 시한은 진짜 콜백이 되감는다 — ajax 진행 콜백은 촘촘히 안 와서 그 숫자만 그리면 막대가 멈췄다 튄다. 그래서 화면은 회선을 짐작해 걷고, 진짜 콜백이 오면 그것으로 따라잡는다.
// The displayed number is driven by this ticker; the real callback only corrects it — ajax progress events arrive in chunks, so rendering them directly would make the bar freeze then jump. This instead estimates bandwidth and catches up whenever a real callback arrives.
//
// DOM을 일부러 모른다 — 그물이 화면 없이 가짜 시계로 돌릴 수 있어야 하기 때문이다. 시계는 인자로 받는다(now·schedule).
// Deliberately DOM-free, so tests can drive it with a fake clock and no screen. The clock is injected (`now`, `schedule`).

// 진짜 콜백이 회선을 재기 전까지의 짐작 — 100Mbps.
// The assumed bandwidth until a real callback measures it — 100Mbps.
export const DEFAULT_BANDWIDTH = 12_500_000;

// 완료 전에는 여기를 안 넘는다 — 도는 중에 100이 떠 있는 것은 거짓말이다.
// Never crosses this before completion — showing 100 while still running would be a lie.
const CEILING = 99;

// 짐작을 접고 느려지는 지점과 그 배수 — 뒤로 갈수록 조심스러워진다.
// Where the estimate backs off and by how much — later stages grow more cautious.
const THRESHOLDS = [70, 80, 90] as const;
const SLOWDOWN = 4;

// 한 걸음의 최소 간격 — 시트의 전환 시간과 같은 값이라야 전환이 서로를 안 자른다. 작은 파일의 바닥도 겸한다(이 걸음 99번이 최소 지속 시간 노릇을 한다).
// The minimum step interval — must match the stylesheet's transition duration or transitions would cut each other off. This also sets a floor for small files, since 99 of these steps become their minimum duration.
const MIN_TICK_MS = 140;

// 완료 꼬리 — 숫자가 아무리 뒤처져 있어도 이 안에 100까지 간다.
// The finishing tail — however far behind the number is, it reaches 100 within this window.
const FINISH_MS = 250;
const TAIL_TICK_MS = 25;

export interface TickerOptions {
  readonly size: number;
  // 초당 바이트. `0` 이면 티커를 끄고 진짜 콜백이 그대로 지나간다.
  // Bytes per second; `0` disables the ticker and real callbacks pass straight through.
  readonly bandwidth?: number;
  onChange(percent: number): void;
  now?(): number;
  // 지연 실행 — 그물이 가짜 시계를 꽂는 자리다.
  // Deferred execution — where tests plug in a fake clock.
  schedule?(fn: () => void, ms: number): () => void;
}

export interface Ticker {
  // 진짜 콜백이 왔다 — 앞서 있으면 따라잡고, 회선을 다시 재고, 감속을 되돌린다.
  // A real callback arrived — catches up if ahead, re-estimates bandwidth, and resets the slowdown.
  report(percent: number): void;
  // 끝났다 — 숫자를 100까지 몰고 나서 끝난다.
  // Done — drives the number to 100 before resolving.
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
  // 진짜 콜백이 말한 마지막 값.
  // The last value a real callback reported.
  let sent = -1;
  // 몇 번째 감속 구간인가.
  // Which slowdown stage we're in.
  let stage = 0;
  let reportedSinceStage = false;
  let stopped = false;
  let cancel: (() => void) | null = null;
  let releaseFinish: (() => void) | null = null;
  let finishing: Promise<void> | null = null;

  const startedAt = now();

  // 화면은 이 문으로만 움직인다 — 뒤로 가지 않는다는 규칙을 여기 한 곳에서 지킨다.
  // The display only moves through this function — the never-go-backward rule lives in this one place.
  const show = (next: number): void => {
    const value = Math.max(shown, Math.min(100, Math.round(next)));
    if (value === shown) return;
    shown = value;
    options.onChange(shown);
  };

  // 한 걸음의 간격 — 회선 짐작으로 99까지 가는 시간을 나눈 값이고, 뒤 구간일수록 느리다.
  // The interval between steps — the estimated time to reach 99, divided up, growing slower in later stages.
  const stepMs = (): number => {
    const seconds = options.size / bandwidth;
    const base = Math.max(MIN_TICK_MS, (seconds * 1000) / CEILING);
    return base * SLOWDOWN ** stage;
  };

  const tick = (): void => {
    if (stopped || releaseFinish) return;
    // 감속 구간을 넘었는데 그 사이 진짜 콜백이 한 번도 안 왔으면 더 조심한다.
    // Crossing a slowdown threshold with no real callback in between grows more cautious.
    const at = THRESHOLDS[stage];
    if (at !== undefined && shown >= at) {
      if (!reportedSinceStage) stage += 1;
      reportedSinceStage = false;
    }
    if (shown < CEILING) show(shown + 1);
    if (stopped || releaseFinish) return;
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
      // 진짜가 앞서면 따라잡는다. 진짜가 뒤처져 있으면 끌어내리지 않는다 — 숫자는 안 되돌아간다.
      // Catches up when the real value is ahead; when it's behind, the display never drops back down.
      if (value > shown) show(Math.min(value, CEILING));
      // 회선을 다시 잰다 — 지금까지 걸린 시간과 진짜 진행률로 남은 걸음의 속도를 고친다.
      // Re-estimates bandwidth — the elapsed time plus the real percentage corrects the pace of the remaining steps.
      const elapsed = now() - startedAt;
      if (elapsed > 0 && value > 0) stage = 0;
    },
    finish() {
      if (stopped) return Promise.resolve();
      if (finishing) return finishing;
      cancel?.();
      cancel = null;
      finishing = new Promise<void>((resolve) => {
        releaseFinish = resolve;
        // 남은 거리를 FINISH_MS 안에 나눠 걷는다 — 100으로 튀지 않고 달려간다.
        // The remaining distance is divided across FINISH_MS — it runs to 100 instead of jumping there.
        const left = 100 - shown;
        if (left <= 0) {
          releaseFinish = null;
          finishing = null;
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
          if (stopped || finishing === null) return;
          if (done >= steps || shown >= 100) {
            show(100);
            releaseFinish = null;
            finishing = null;
            resolve();
            return;
          }
          cancel = schedule(run, TAIL_TICK_MS);
        };
        cancel = schedule(run, TAIL_TICK_MS);
      });
      return finishing;
    },
    stop() {
      stopped = true;
      cancel?.();
      cancel = null;
      releaseFinish?.();
      releaseFinish = null;
      finishing = null;
    },
  };
}
