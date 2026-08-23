// 캐럿이 서도 되는 띠 — old 040 §1 의 규칙을 그대로 번역한 **사각형 산수**다. DOM 이 없다.
//
//   캐럿은 "붙는 툴바의 아랫변"과 "키보드의 윗변" 사이에 있어야 한다.
//   안에 있으면 유효 — 아무것도 하지 않는다. 밖이면 그 안의 가장 가까운 자리로 옮긴다.
//
// 왜 여기서 재는가 (040 §2): 띠의 두 변은 브라우저가 모르는 것들이다 — 위는 우리가 그린 크롬
// 아래는 키보드다. 그래서 "보인다"의 판정을 브라우저에 맡길 수 없다.
// 자리를 **지정하지 않고 거리만 다룬다** — 040 §6.2 의 4라운드가 그 교훈이다.

export interface Rect {
  readonly top: number;
  readonly bottom: number;
}

export interface Band {
  readonly top: number;
  readonly bottom: number;
}

// 한 줄만큼의 여유 — 그 이상은 안 준다 (040 §3).
export const BAND_MARGIN = 28;

// 띠 하나 — 위는 max(창의 위, 크롬의 아랫변), 아래는 시각 뷰포트의 아래 변.
// "스티키인가"를 따로 안 묻는 것이 이 max 다 (040 §3.1): 붙어 있는 막대는 창 맨 위에 앉아
// 아랫변이 창의 위보다 아래라 이기고, 흘러간 막대는 져서 창의 위가 쓰인다.
export function bandOf(chromeBottom: number | null, viewport: Rect): Band {
  const top = chromeBottom === null ? viewport.top : Math.max(viewport.top, chromeBottom);
  return { top, bottom: viewport.bottom };
}

// 보정 거리 — 양수면 아래로, 음수면 위로 그만큼 구른다. 0 이면 **아무것도 안 한다**.
// 규칙의 절반이 이 0 이다: 이미 띠 안이면 화면은 가만있어야 한다.
export function bandFix(caret: Rect, band: Band, limit: number): number {
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  // 한 줄만큼 여유를 두되, 캐럿보다 큰 여유는 뜻이 없다.
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);

  // 띠보다 키가 큰 캐럿은 위쪽을 보여 준다 — 아래를 맞추면 글 시작이 잘린다 (040 §3 안전장치).
  if (caretHeight >= height) return clamp(caret.top - band.top, limit);

  if (caret.top < band.top + margin) return clamp(caret.top - (band.top + margin), limit);
  if (caret.bottom > band.bottom - margin) return clamp(caret.bottom - (band.bottom - margin), limit);
  return 0; // 띠 안 — 유효하다
}

// 편집 뒤의 한 걸음 — **위 변만 본다.** 캐럿이 붙는 크롬(또는 창의 위)에 잠겼으면 잠긴 만큼을,
// 아니면 0 을 답한다. 부호가 곧 갈래라 `bandFix` 를 그대로 부르고 음수만 통과시키면 된다.
//
// 아래 변(키보드)을 **일부러 안 본다.** 그쪽은 겨눔(`aim`)의 몫이고, 편집마다 아래 변까지 보면
// 사람이 굴려 내려 보던 자리를 글자 하나 칠 때마다 도로 끌어올린다. 편집이 만드는 사고는 늘
// 위쪽이다 — 문서가 줄어 캐럿이 화면 위로 밀려나거나, 붙은 툴바가 그 위를 덮거나.
export function revealFix(caret: Rect, band: Band, limit: number): number {
  const delta = bandFix(caret, band, limit);
  return delta < 0 ? delta : 0;
}

// 한 걸음으로는 못 끝내는 자리가 있다 — 그래서 몇 걸음까지 걷는가.
// 셋이면 넉넉하다: 첫 걸음이 붙는 크롬을 도로 세우고, 둘째가 그 크롬 밑에서 마저 밀고,
// 셋째는 크롬이 스티키를 벗어나 제자리로 내려앉은 드문 경우의 몫이다.
export const REVEAL_STEPS = 3;

// 편집 뒤의 걸음은 **한 번으로 안 끝날 수 있다.**
//
// 스티키의 **끝자락**에서 재면 붙는 크롬이 이미 화면 밖이라(`chromeBottom` 이 음수) 띠의 위 변이
// 창의 위(0)로 잡힌다. 그 값으로 밀면 셈은 맞는데 **미는 동안 크롬이 도로 화면에 선다** — 방금
// 창의 위에 세운 캐럿을 그 크롬이 다시 덮는다. 실측(260823_000 6차): 요청 −325, 실제 −324,
// 그러고도 53px 잠김. 굴린 값이 틀린 게 아니라 **잰 뒤에 띠가 달라진 것**이다.
//
// 그래서 민 뒤에 **다시 잰다.** 띠의 위 변은 밀 때마다 제자리로 다가갈 뿐 물러나지 않으므로
// 몇 걸음이면 멎는다. 못 움직였으면(굴릴 자리가 없으면) 그 자리에서 그만둔다 — 같은 값을 두 번
// 밀어 봐야 화면은 안 움직이고 셈만 돈다.
//
// 재기·굴리기를 인자로 받는 까닭은 이 파일이 DOM 을 안 들기 때문이다. 그물이 가짜 둘로 이
// 걸음걸이를 그대로 걷게 할 수 있다.
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
    // 나아지지 않는 걸음은 안 걷는다. 크롬이 스티키를 벗어나 **글과 함께 굴러가는** 자리가
    // 그것이다 — 캐럿과 크롬이 나란히 움직이니 아무리 밀어도 사이가 그대로다. 잠기지도 않은
    // 캐럿 때문에 화면을 끝없이 끌어올리면 안 된다.
    if (Math.abs(delta) >= last) break;
    last = Math.abs(delta);
    const moved = push(delta);
    total += moved;
    if (moved === 0) break;
  }
  return total;
}

// --- 키보드가 선 걸음 — 아래 변까지 본다 (260823_011) -------------------------------------------
//
// `revealFix` 는 **위 변만** 본다. 그것이 5차의 의도적인 선택이고 데스크톱에서는 옳다 — 편집이
// 만드는 사고는 늘 위쪽이고, 아래 변까지 보면 사람이 굴려 내려 둔 화면을 글자마다 뺏는다.
//
// 그런데 **키보드가 서면 아래 변이 진짜 벽이 된다.** 011 의 아이폰 실측이 그 자리다:
//
//   bar=165..353  caret=368..384  band=353..377   위잠김=-15  아래벗어남=+7  rev=0
//
// 캐럿은 툴바에 안 가렸다(여유 15). 다만 **보이는 창 아래로 7px 나갔다** — 키보드 뒤다. 위 변만
// 보는 눈에는 성한 자리라 걸음이 한 번도 안 굴렀다(`rev=0`). 밀 자리는 1074px 나 남아 있었다.
//
// 규칙(순서가 곧 규칙이다):
//   1. 캐럿이 붙는 크롬에 **정말 가렸으면**(`caret.top < band.top`) 위 변이 이긴다. 가림을 푸는
//      것이 먼저다 — 글자가 안 보이면 아래 여유는 뜻이 없다. 이때는 `revealFix` 를 그대로 쓴다.
//   2. 안 가렸으면 아래 변을 본다 — 아랫변이 보이는 창(=키보드 윗변) 아래로 나갔으면 그만큼과
//      한 줄 여유를 더해 민다.
//   3. **아래로 밀다가 크롬에 가리면 안 된다.** 가리기 전까지의 거리(`caret.top - band.top`)
//      까지만 민다. 그 거리가 0 이면 **아무것도 안 한다** — 띠가 캐럿보다 좁아 위로도 아래로도
//      못 맞추는 자리이고, 그때의 규칙이 **위 변 우선**이다(툴바에 안 가리는 것이 먼저).
//   4. 아래 변이 성하면 위 변의 여유만 본다 — 5차의 눈 그대로다.
function underFix(caret: Rect, band: Band, limit: number): number {
  if (caret.top < band.top) return revealFix(caret, band, limit); // 1
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);
  const over = caret.bottom - (band.bottom - margin);
  if (over <= 0) return revealFix(caret, band, limit); // 4
  const room = caret.top - band.top; // 3 — 크롬에 가리기 전까지 밀 수 있는 거리
  const safe = Math.min(over, Math.max(0, room));
  return safe > 0 ? clamp(safe, limit) : 0;
}

// 자리 맞추기 — 캐럿 윗변을 **띠의 위 + 한 줄 여유에 놓는다.** 방향을 안 가린다(위로도 아래로도).
//
// `revealFix`·`underFix` 는 "안 가리면 그만" 이라 **겨우** 들어온 자리에서 멈춘다. 편집(타이핑)
// 문에서는 그것이 옳다 — 글자마다 화면이 크게 뛰면 못 쓴다. 그런데 **키보드가 서는 그 한 걸음**
// 에서는 모자라다. 011 6차 실측이 그 자리다:
//
//   창=0..377  bar=152..340  caret=355..371  아래벗어남=-6  →  OK 이지만 **툴바 위에 152px 이 빈다**
//
// 캐럿이 창에 6px 여유로 들어오자마자 멈춰, 그릇이 덜 올라온 채로 굳는다(주인: "툴바 포함 전체
// 스크롤이 약간 아래에서 시작함"). 그래서 그 문에서는 **띠 안 아무 데나**가 아니라 **제자리**를
// 겨눈다. 과녁으로 주는 띠는 `bandNow()` 의 `aim` — **툴바가 창 맨 위에 붙었을 때**의 띠다.
// 그러면 굴릴 자리가 있는 한 툴바가 창 맨 위로 올라오고 캐럿은 그 밑 한 줄 자리에 선다.
// 과녁은 **붙은 자리 기준**이다 — `bandNow()` 의 `aim` 이 `창.top + 툴바높이` 다. **지금 툴바가
// 어디 있든** 그 키만 쓰는 것이 요점이다(011 7차). 지금 자리를 기준으로 잡으면 사파리처럼
// `caret.top == bar.bottom + 15` 로 **이미 목표에 딱 맞은** 상태에서 멈춰, 툴바가 창 맨 위에
// 안 붙었는데도 123px 이 빈 채로 굳는다.
//
// **위로는 안 민다.** 캐럿이 이미 과녁보다 위면(윗부분을 보고 있으면) 아래로 끌어내리지 않는다 —
// "가려졌거나 창 밖일 때만 움직인다" 는 원칙을 여기서 깨면 안 된다. 가림과 창 밖은 `underWalk`
// 의 몫이고, 이 함수는 **빈자리를 걷어내는 일 하나**만 한다.
//
// 못 붙으면 갈 수 있는 데까지만 간다 — 캐럿 위 내용이 툴바 높이보다 짧으면 애초에 못 붙는다.
// 억지로 더 밀지 않고 `walkWith` 의 "못 움직이면 멎는다·나아지지 않으면 멎는다" 에 맡긴다.
function placeFix(caret: Rect, band: Band, limit: number): number {
  const height = Math.max(0, band.bottom - band.top);
  if (height <= 0) return 0;
  const caretHeight = Math.max(0, caret.bottom - caret.top);
  const margin = Math.min(BAND_MARGIN, caretHeight === 0 ? BAND_MARGIN : caretHeight);
  const delta = caret.top - (band.top + margin);
  return delta > 0 ? clamp(delta, limit) : 0;
}

// 걸음걸이의 몸 — `revealWalk` 와 **한 글자도 다르지 않고 셈만 갈아 끼운다.**
// 재고 → 밀고 → **다시 재는** 그 무늬: 못 움직이면 멎고, 나아지지 않으면 멎는다.
// `revealWalk` 자신은 이 몸을 안 쓴다 — 6차가 실측으로 검증한 그 함수의 몸을 한 줄도 안 비튼다.
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
    // 나아지지 않는 걸음은 안 걷는다. **우리가 밀면 크롬이 되미는** 자리가 있어(011 6차의
    // 안드로이드) 이 줄이 없으면 둘이 영영 싸운다.
    if (Math.abs(delta) >= last) break;
    last = Math.abs(delta);
    const moved = push(delta);
    total += moved;
    if (moved === 0) break;
  }
  return total;
}

// 키보드가 선 채로 **편집**이 열은 걸음 — 최소 넛지(아래 변까지 보되 "안 가리면 그만").
export function underWalk(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
): number {
  return walkWith(steps, look, push, underFix);
}

// 키보드/뷰포트가 열은 걸음 — **제자리로** 맞춘다.
export function placeWalk(
  steps: number,
  look: () => { readonly caret: Rect; readonly band: Band; readonly limit: number } | null,
  push: (delta: number) => number,
): number {
  return walkWith(steps, look, push, placeFix);
}

// 키보드가 선 걸음은 몇 걸음까지인가 — 셋으로는 모자랐다. 011 6차의 안드로이드 실측이 그 자리다:
// 우리가 −115 밀어 맞춘 뒤 **크롬이 창을 201 → 322 로 더 밀어** 다시 어긋났는데, `fixUp=-35` 를
// 알면서도 **걸음 수를 다 써 멈췄다.** 키보드가 서는 동안은 창이 두세 번 더 움직인다.
// 데스크톱·비키보드는 `REVEAL_STEPS`(3) 그대로다 — 거기서는 창이 안 움직인다.
export const KEYBOARD_STEPS = 5;

// 한 번의 보정은 창 하나를 넘지 않는다 (040 §3 안전장치).
function clamp(delta: number, limit: number): number {
  const cap = Math.max(0, limit);
  if (delta > cap) return cap;
  if (delta < -cap) return -cap;
  return delta;
}

// iOS 인가 — 040 §3.1 이 "이 파일에서 유일하게 사용자 에이전트로 가려내는 자리"라 부른 판정.
// 기능 탐지로는 못 가른다: 가려내려는 것이 없는 기능이 아니라 **거짓말하는 뷰포트**이고, 그
// 거짓말은 정직한 값과 똑같이 생겼다. 아이패드는 자기를 맥이라 말하므로 손가락으로 함께 센다.
export function isIos(agent: string, platform: string, maxTouchPoints: number): boolean {
  if (/iPad|iPhone|iPod/.test(agent)) return true;
  return /Mac/.test(platform) && maxTouchPoints > 1;
}
