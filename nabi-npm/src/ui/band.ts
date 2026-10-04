// 캐럿이 서 있어야 할 띠(붙는 툴바 아랫변 ~ 키보드 윗변)의 순수 사각형 산수 — DOM을 안 든다
// Pure rectangle math for the band the caret must stay in (sticky toolbar bottom to keyboard top); no DOM here

export interface Rect {
  readonly top: number;
  readonly bottom: number;
}

export interface Band {
  readonly top: number;
  readonly bottom: number;
}

export const BAND_MARGIN = 28;

// max(창 위, 크롬 아랫변)로 위 변을 잡으면 스티키 여부를 따로 안 물어도 된다 — 흘러간 막대는 자연히 진다
// Taking the top as max(window top, chrome bottom) means we never need to ask "is it sticky" — a scrolled-away bar loses automatically
export function bandOf(chromeBottom: number | null, viewport: Rect): Band {
  const top = chromeBottom === null ? viewport.top : Math.max(viewport.top, chromeBottom);
  return { top, bottom: viewport.bottom };
}

export function bandFix(caret: Rect, band: Band, limit: number): number {
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);

  // 띠보다 키 큰 캐럿은 위쪽을 보여준다 — 아래를 맞추면 글 시작이 잘린다
  // A caret taller than the band reveals its top; aligning the bottom would cut off the start of the text
  if (caretHeight >= height) return clamp(caret.top - band.top, limit);

  if (caret.top < band.top + margin) return clamp(caret.top - (band.top + margin), limit);
  if (caret.bottom > band.bottom - margin) return clamp(caret.bottom - (band.bottom - margin), limit);
  return 0;
}

// 편집 뒤에는 위 변만 본다 — 아래 변(키보드)까지 보면 편집마다 사람이 굴려 내린 화면을 도로 끌어올린다
// After an edit we only check the top edge; also checking the bottom (keyboard) would pull back a user's scroll on every keystroke
export function revealFix(caret: Rect, band: Band, limit: number): number {
  const delta = bandFix(caret, band, limit);
  return delta < 0 ? delta : 0;
}

export const REVEAL_STEPS = 3;

// 스티키 끝자락에서 재면 크롬이 이미 화면 밖이라 위 변이 창 위(0)로 잡히지만, 미는 동안 크롬이 도로 서서 캐럿을 다시 덮는다 — 그래서 민 뒤 다시 잰다
// At the sticky edge the chrome is already offscreen so the band's top reads as the window top, but the chrome resettles mid-push and re-covers the caret — so we remeasure after each push
export function revealWalk(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
): number {
  let total = 0;
  let last = Number.POSITIVE_INFINITY;
  for (let step = 0; step < steps; step += 1) {
    const seen = look();
    if (seen === null) break;
    const delta = revealFix(seen.caret, seen.band, seen.limit);
    if (delta === 0) break;
    // 나아지지 않으면 멈춘다 — 크롬이 캐럿과 나란히 굴러가는 자리에서는 밀어도 사이가 그대로다
    // Stops if a step doesn't improve things; when the chrome scrolls alongside the caret, pushing never closes the gap
    if (Math.abs(delta) >= last) break;
    last = Math.abs(delta);
    const moved = push(delta);
    total += moved;
    if (moved === 0) break;
  }
  return total;
}

// 키보드가 서면 아래 변도 진짜 벽이 된다 — 위 변만 보면 캐럿이 키보드 뒤로 나가도 rev=0으로 놓친다
// Once the keyboard is up the bottom edge becomes a real wall too; checking only the top misses a caret that slipped behind the keyboard
// 순서: ①크롬에 가렸으면 위 변이 이긴다 ②아니면 아래 변을 맞춘다 ③단, 맞추다 크롬에 가리면 가리기 직전까지만 ④둘 다 성하면 위 변 여유만
// Order: (1) covered by chrome wins the top edge, (2) otherwise fix the bottom edge, (3) but never push far enough to hit the chrome, (4) if both are clear, just the top margin
function underFix(caret: Rect, band: Band, limit: number): number {
  if (caret.top < band.top) return revealFix(caret, band, limit); // 1
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);
  const over = caret.bottom - (band.bottom - margin);
  if (over <= 0) return revealFix(caret, band, limit); // 4
  // 3 — 크롬에 가리기 전까지 밀 수 있는 거리
  // 3 — distance we can push before hitting the chrome
  const room = caret.top - band.top;
  const safe = Math.min(over, Math.max(0, room));
  return safe > 0 ? clamp(safe, limit) : 0;
}

// underFix는 "안 가리면 그만"이라 겨우 들어온 자리에서 멎어 툴바 위에 빈자리가 남는다 — 이건 제자리(툴바가 창 맨 위에 붙었을 때의 띠)를 겨눠 그 빈자리를 걷어낸다. 위로는 안 민다
// underFix stops the instant the caret clears the edge, leaving empty space above the toolbar; this instead aims for the toolbar-pinned-to-top position to close that gap, and never pushes upward
function placeFix(caret: Rect, band: Band, limit: number): number {
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);
  const delta = caret.top - (band.top + margin);
  return delta > 0 ? clamp(delta, limit) : 0;
}

// revealWalk와 같은 몸(measure→push→remeasure, 멎는 조건도 동일)에 셈만 갈아 끼운다
// Same body as `revealWalk` (measure, push, remeasure, same stop conditions), just a different fix function plugged in
function walkWith(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
  fix: (caret: Rect, band: Band, limit: number) => number,
): number {
  let total = 0;
  let last = Number.POSITIVE_INFINITY;
  for (let step = 0; step < steps; step += 1) {
    const seen = look();
    if (seen === null) break;
    const delta = fix(seen.caret, seen.band, seen.limit);
    if (delta === 0) break;
    // 크롬이 우리가 민 만큼 되미는 자리가 있어 — 이 줄이 없으면 영원히 서로 밀어낸다
    // The chrome can push back by roughly what we just pushed — without this check the two would fight forever
    if (Math.abs(delta) >= last) break;
    last = Math.abs(delta);
    const moved = push(delta);
    total += moved;
    if (moved === 0) break;
  }
  return total;
}

export function underWalk(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
): number {
  return walkWith(steps, look, push, underFix);
}

export function placeWalk(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
): number {
  return walkWith(steps, look, push, placeFix);
}

// 키보드가 서 있는 동안은 창이 두세 번 더 움직여 3걸음으로는 모자랐다 — 5로 늘린다
// While the keyboard is up the window keeps moving for a few more frames, so 3 steps wasn't enough — raised to 5
export const KEYBOARD_STEPS = 5;

function clamp(delta: number, limit: number): number {
  const cap = Math.max(0, limit);
  if (delta > cap) return cap;
  if (delta < -cap) return -cap;
  return delta;
}

// 이 파일에서 유일하게 UA로 가르는 판정 — 뷰포트 자체가 거짓말해서 기능 탐지로는 못 가른다. 아이패드는 맥이라 자칭하므로 터치 포인트로 함께 센다
// The one UA sniff in this file — the viewport itself misreports, so feature detection can't tell; iPad claims to be a Mac, so touch points count it too
export function isIos(agent: string, platform: string, maxTouchPoints: number): boolean {
  if (/iPad|iPhone|iPod/.test(agent)) return true;
  return /Mac/.test(platform) && maxTouchPoints > 1;
}
