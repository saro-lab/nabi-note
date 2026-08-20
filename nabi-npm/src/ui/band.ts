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
