import { ICON_CSS } from './icon-css.js';
import {
  MOTION_FAST_MS,
  MOTION_PRESS_MS,
  MOTION_PROGRESS_MS,
  MOTION_TOAST_MS,
  Z_DIALOG,
  Z_OVERLAY,
  Z_STICKY,
} from './tokens.js';

// 시트는 core 하나 + wing들의 모음이며, wing 이름이 아니라 실제 문자열 내용으로 중복을 없앤다.
// Sheets are core plus wing sheets, deduped by actual text content, not by wing name.
export interface SheetSource {
  readonly wings: readonly { readonly styles?: string }[];
}

// djb2 해시로 만든 짧은 지문 — 비밀이 아니라 "같은 글인가"를 구분하는 이름표다.
// A short djb2 hash, not a secret, just a fingerprint for "is this the same sheet text".
export function sheetKey(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = (((hash << 5) + hash) ^ text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

// core를 먼저 넣고 wing을 이어 붙이며, 여기서 이미 텍스트 단위로 중복을 접는다.
// Core sheet first, then wings; duplicates are deduped by text here before reaching the DOM.
export function collectSheets(source: SheetSource, core: string = CORE_CSS): readonly string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (text: string | undefined): void => {
    const sheet = text?.trim();
    if (!sheet || seen.has(sheet)) return;
    seen.add(sheet);
    out.push(sheet);
  };
  add(core);
  for (const wing of source.wings) add(wing.styles);
  return out;
}

// --- 코어 시트: 문단·래퍼·nabi-scroll·에디터 크롬. wing 생김새는 각 wing 시트가 맡는다. ---
// Core sheet: paragraph/wrapper/nabi-scroll/editor chrome; each wing's own look is its own sheet.
export const CORE_CSS = `${ICON_CSS}

/* 덮개(미리보기·라이트박스)는 body 의 자식이라 .nabi 상속이 안 닿아 토큰을 여기서도 선언한다
   Overlays (preview/lightbox) are children of body, not .nabi, so tokens are declared here too */
:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))) {
  color-scheme: light;

  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-on-accent: #fff; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-danger: #d93b3b; --nabi-on-danger: #fff;
  /* 코어는 --nabi-placeholder-color 를 정의하지 않고 대체값으로만 부른다 — 호스트가 항상 이긴다
     Core never defines --nabi-placeholder-color, only references it as a fallback so hosts always win */
  --nabi-placeholder-color-fallback: #6b6b76aa;

  --nabi-radius: 6px; --nabi-radius-sm: 4px; --nabi-radius-xs: 3px;
  /* 층 자신만 모서리를 갖는다 — 안의 상자는 각진 채로 둔다
     Only the layer itself is rounded; boxes inside it stay square */
  --nabi-layer-radius: .25rem;
  --nabi-grid-cell: 1.125rem;
  --nabi-control-size: 2rem;
  --nabi-touch-control-size: 2.75rem;
  --nabi-motion-press: ${MOTION_PRESS_MS}ms;
  --nabi-motion-fast: ${MOTION_FAST_MS}ms;
  --nabi-motion-progress: ${MOTION_PROGRESS_MS}ms;
  --nabi-motion-toast: ${MOTION_TOAST_MS}ms;
  --nabi-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  --nabi-scrim: rgb(12 14 18 / 72%);
  --nabi-z-sticky: ${Z_STICKY};
  --nabi-z-overlay: ${Z_OVERLAY};
  --nabi-z-dialog: ${Z_DIALOG};

  /* 코어는 --nabi-font* 를 정의하지 않고 대체값으로만 부른다 — 호스트가 항상 이긴다(글자별로
     훑으므로 라틴을 쥔 글꼴을 앞에, 진짜 Bold 글꼴을 이름으로 불러 가짜 굵게를 피하고, 이모지는 끝에 둔다)
     Core never defines --nabi-font*, only falls back to it; order favors Latin-safe and true-Bold fonts, emoji last */
  --nabi-font-fallback:
    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 한글 명조는 Bold 파일이 없는 갈래라 진짜 Bold 를 가진 나눔명조·Noto Serif KR 을 앞세운다
     Korean serif fonts lack a real Bold file, so true-Bold fonts are listed ahead of them */
  --nabi-font-serif-fallback:
    Georgia, Cambria, "Times New Roman", Times,
    "Nanum Myeongjo", "Noto Serif KR", AppleMyungjo, Batang,
    serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 한글은 monospace 뒤에 둔다 — 칸이 어긋나는 것보다 글자가 깨지는 게 더 나쁘다
     Korean fonts sit after monospace; misaligned columns beat broken glyphs */
  --nabi-font-mono-fallback:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Roboto Mono", "Noto Sans Mono",
    monospace, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR",
    "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 흘림체는 기본 지원이 가장 약하다 — 제대로 하려면 호스트가 웹폰트를 얹어야 한다
     Cursive has the weakest default support; a host needs its own webfont for it to look right */
  --nabi-font-cursive-fallback:
    "Segoe Script", "Bradley Hand", "Snell Roundhand", "Apple Chancery",
    Gungsuh, "Noto Sans KR", cursive;
  --nabi-typeface-base: var(--nabi-font, var(--nabi-font-fallback));

  /* 형광펜·글자색은 토큰이다 — 다크에서 알파를 낮춰야 글자가 안 묻힌다
     Highlight/text colors are tokens, not literals, so dark mode can lower alpha without washing text out */
  --nabi-hl-yellow: rgb(250 204 21 / 45%);
  --nabi-hl-green: rgb(74 222 128 / 45%);
  --nabi-hl-cyan: rgb(56 189 248 / 45%);
  --nabi-hl-pink: rgb(244 114 182 / 45%);
  --nabi-hl-purple: rgb(192 132 252 / 45%);
  --nabi-hl-orange: rgb(251 146 60 / 45%);
  --nabi-tc-green: #009e73;
  --nabi-tc-coral: #e05638;
  --nabi-tc-violet: #8b5cf6;
  --nabi-tc-amber: #d97706;
  --nabi-tc-blue: #0284c7;
}

/* 다크 판정은 호스트의 .dark 클래스나 data-nabi-theme로만 하고 시스템 prefers-color-scheme는 안 본다
   Dark mode is decided only by the host's .dark class or data-nabi-theme, never system prefers-color-scheme */
:where(html, body).dark :is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))):not([data-nabi-theme="light"]),
:is(.nabi, .nabi-scrim)[data-nabi-theme="dark"] {
  color-scheme: dark;
  --nabi-fg: #e8e8ee; --nabi-bg: #16161a; --nabi-muted: #9a9aa6; --nabi-line: #2e2e36;
  --nabi-accent: #7ea2ff; --nabi-on-accent: #16161a; --nabi-soft: rgb(255 255 255 / 7%);
  --nabi-danger: #f0616a; --nabi-on-danger: #1a0d0f;
  --nabi-placeholder-color-fallback: #9a9aa6aa;
  --nabi-shadow: 0 8px 24px rgb(0 0 0 / 50%);
  --nabi-scrim: rgb(0 0 0 / 78%);
  --nabi-hl-yellow: rgb(250 204 21 / 35%);
  --nabi-hl-green: rgb(74 222 128 / 35%);
  --nabi-hl-cyan: rgb(56 189 248 / 35%);
  --nabi-hl-pink: rgb(244 114 182 / 35%);
  --nabi-hl-purple: rgb(192 132 252 / 35%);
  --nabi-hl-orange: rgb(251 146 60 / 35%);
}
/* 라이트를 명시한 쪽이 바깥 다크를 이긴다 — 다크 규칙 뒤에 와야 되돌릴 수 있다
   An explicit light override beats an outer dark; it must come after the dark rule to win */
:where(html, body).light :is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))):not([data-nabi-theme="dark"]),
:is(.nabi, .nabi-scrim)[data-nabi-theme="light"] {
  color-scheme: light;
  /* --nabi-soft는 불투명 색이 아니라 알파값이다 — 편집기가 배경을 안 칠하므로 불투명이면 페이지에서 도려낸 듯 보인다
     --nabi-soft is an alpha value, not an opaque color, since the editor paints no background of its own */
  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-on-accent: #fff; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-danger: #d93b3b; --nabi-on-danger: #fff;
  --nabi-placeholder-color-fallback: #6b6b76aa;
  --nabi-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  --nabi-scrim: rgb(12 14 18 / 72%);
  --nabi-hl-yellow: rgb(250 204 21 / 45%);
  --nabi-hl-green: rgb(74 222 128 / 45%);
  --nabi-hl-cyan: rgb(56 189 248 / 45%);
  --nabi-hl-pink: rgb(244 114 182 / 45%);
  --nabi-hl-purple: rgb(192 132 252 / 45%);
  --nabi-hl-orange: rgb(251 146 60 / 45%);
}

/* 편집기는 배경을 투명으로 두어 페이지 배경이 그대로 비친다 — 페이지 위 카드가 아니라 페이지의 일부다
   The editor paints no background of its own so the page's background shows through; it's part of the page, not a card on it */
.nabi {
  color: var(--nabi-fg); background: transparent; font-family: var(--nabi-typeface-base);
  /* 업로드 층이 이 상자를 기준으로 절대 배치된다
     The upload layer positions itself relative to this box */
  position: relative;
  display: flex; flex-direction: column; min-height: 0;
}

/* 툴바 줄과 상황 줄을 하나로 묶어 sticky 시킨다 — 따로 붙이면 상황 줄이 뜰 때 글이 밀려 화면이 흔들린다
   Toolbar row and context row stick together as one block; sticking them separately shakes content when the context row appears */
.nabi-toolbar {
  position: sticky; z-index: var(--nabi-z-sticky);
  inset-block-start: calc(var(--nabi-sticky-top, 0px) + var(--nabi-keyboard-top, 0px));
  background: var(--nabi-bg);
  /* 세로 패딩은 크롬(이 자리)이 준다 — 도구 위치가 호스트마다 달라 줄에 두면 도구만 어긋난다
     Vertical padding lives on the chrome, not the toolbar row, since tool placement varies by host and would misalign otherwise */
  padding-block: .25rem;
}
/* 상황 줄이 있으면 아랫여백을 거둔다 — 상황 줄 배경이 이미 덩어리의 끝을 말하므로 겹치면 두 번 끝난다
   Drop the bottom padding when the context row is present; its own background already marks the block's end */
.nabi-toolbar:has(.nabi-context:not([hidden])) { padding-block-end: 0; }
/* flex 대신 float로 도구를 띄운다(flex면 좁아질 때 도구가 통째로 다음 줄로 밀린다); relative는 toast 선반의 닻이고, 패딩은 좌우만 준다(세로는 .nabi-toolbar 몫)
   Tools float right instead of flex (flex would wrap them as a block on narrow screens); relative anchors the toast shelf; padding is horizontal only, vertical space belongs to .nabi-toolbar */
.nabi-toolbar-row { padding: 0 .375rem; position: relative; }
.nabi-toolbar-row::after { content: ""; display: block; clear: both; }
/* position+z-index가 필요하다 — 없으면 뜬 도구가 위치 잡힌 부모 줄 아래로 깔려 실클릭이 안 먹힌다(프로그램 클릭은 안 걸려 멀쩡해 보였다)
   Needs position+z-index, or the floated tools sit below the positioned parent row and real clicks miss them (el.click() bypasses hit-testing, so it looked fine) */
.nabi-tools {
  float: inline-end; display: inline-flex; gap: .125rem; margin-inline-start: .75rem;
  position: relative; z-index: 1;
  /* .nabi-group과 같은 세로 패딩이어야 도구가 첫 줄 단추와 같은 높이에 선다
     Must match .nabi-group's vertical padding so tools align with the first row of buttons */
  padding-block: .1875rem;
}
/* 그룹 안에서도 줄바꿈이 일어난다 — 컨트롤이 많은 그룹이 좁은 화면에서 옆으로 안 뚫고 나가게 한다
   Groups wrap internally too, so a group with many controls doesn't overflow on narrow screens */
.nabi-group {
  display: inline-flex; vertical-align: middle; flex-wrap: wrap; align-items: center;
  gap: .125rem; padding: .1875rem; border-radius: var(--nabi-radius-sm);
  margin-inline-end: .75rem; min-inline-size: 0; position: relative;
}
.nabi-group[hidden] { display: none; }
/* 한 줄 모드의 스크롤 그릇 — 줄(.nabi-toolbar-row)이 아니라 이 안쪽 겹이 구르는 까닭은, 줄이 toast 선반의 닻이라 자신이 스크롤되면 선반이 잘리기 때문이다
   The scroll container for narrow mode is this inner wrapper, not .nabi-toolbar-row, because that row anchors the toast shelf and would clip it if it scrolled itself */
.nabi-strip { display: contents; }

.nabi-btn {
  appearance: none; border: 0; background: transparent; color: inherit; cursor: pointer;
  block-size: 1.875rem; min-inline-size: 1.875rem; padding: 0; font: inherit; font-size: .8125rem;
  border-radius: calc(var(--nabi-radius-sm) - .1875rem);
  display: inline-flex; align-items: center; justify-content: center; position: relative;
}
.nabi-btn:hover, .nabi-btn.nabi-kbd { color: var(--nabi-accent); }
/* mousedown을 삼켜 캐럿을 지키는 버튼(parts/button.ts)은 :active도 안 걸려 눌린 티가 안 난다 — 이 애니메이션이 그 응답을 대신한다
   Buttons that swallow mousedown to preserve the caret (parts/button.ts) never trigger :active, so this animation supplies the missing tap feedback */
@keyframes nabi-tap {
  0% { transform: translateY(0); }
  45% { transform: translateY(2px); }
  100% { transform: translateY(0); }
}
.nabi-tap { animation: nabi-tap 220ms ease-out; }
/* 움직임을 줄이라는 사람에게는 이동 폭만 줄이고 응답 자체는 남긴다
   For reduced-motion users, shrink the travel distance but keep the tap feedback itself */
@media (prefers-reduced-motion: reduce) {
  @keyframes nabi-tap {
    0% { transform: translateY(0); }
    45% { transform: translateY(1px); }
    100% { transform: translateY(0); }
  }
}
.nabi-btn.on, .nabi-btn.on:hover {
  color: var(--nabi-accent); background: var(--nabi-soft);
  box-shadow: inset 0 -2px var(--nabi-accent);
}
.nabi-btn[hidden] { display: none; }
/* display:inline-flex가 UA의 [hidden] 규칙을 이기므로 직접 꺼야 한다
   display:inline-flex overrides the UA [hidden] rule, so it must be turned off explicitly here too */
.nabi-group[hidden] { display: none; }
.nabi-btn:disabled { opacity: .4; cursor: default; }
.nabi-btn:active:not(:disabled), .nabi-close:active, .nabi-input:active,
.nabi-choose-row:active, .nabi-save-row:active {
  transform: translateY(2px); transition: transform var(--nabi-motion-press) ease-out;
}
.nabi-btn svg { inline-size: 1rem; block-size: 1rem; }
.nabi-btn.nabi-word { inline-size: auto; padding: 0 .5rem; }
/* 색 견본은 제 색이 내용이라 배경으로 눌림을 못 말한다 — 테두리는 선택을, 크기 변화는 hover를 맡는다
   A color swatch can't show state via background (it'd blend into its own color); border marks selection, size change marks hover */
.nabi-swatch {
  inline-size: 1.25rem; block-size: 1.25rem; min-inline-size: 0; border-radius: var(--nabi-radius-xs);
  border: 1px solid color-mix(in srgb, var(--nabi-line) 70%, transparent);
  transition: transform var(--nabi-motion-fast);
}
.nabi-swatch:hover { transform: scale(1.18); }
/* 눌린 견본은 .on의 배경 규칙을 덮고 테두리만 강조색으로 바꾼다
   A selected swatch overrides the .on background rule and only recolors its border */
.nabi-btn.nabi-swatch.on {
  background: inherit; border-color: var(--nabi-accent); border-width: 2px;
}
.nabi-ctx-group:has(.nabi-swatch) { gap: 5px; }

/* 툴팁은 ::after 하나만 쓴다(힌트 배지는 ::before라 안 겹친다). 가운데 정렬은 물리 속성(left)만 써야 한다 — 논리 속성(inset-inline-start)과 translate(-50%)를 섞으면 RTL에서 어긋난다
   Tooltip uses only ::after (hint badge is ::before, so they don't collide). Centering must use the physical 'left' property, not logical inset-inline-start, mixed with translate(-50%) breaks in RTL */
[data-nabi-tip]:hover::after {
  content: attr(data-nabi-tip); position: absolute; inset-block-start: 100%; left: 50%;
  transform: translate(-50%, 4px); background: var(--nabi-fg); color: var(--nabi-bg);
  font-size: 11px; line-height: 1.6; padding: 2px 6px; border-radius: 4px; white-space: nowrap;
  pointer-events: none; z-index: 2;
}
[data-nabi-tip][aria-expanded="true"]::after { content: none; }

/* 힌트 배지는 Shift 연타 동안만 뜬다
   The hint badge only shows while double-tapping Shift */
.nabi-hinting [data-hint]::before {
  content: attr(data-hint); position: absolute; inset-block-start: -2px; inset-inline-end: -2px;
  background: var(--nabi-accent); color: #fff; font-size: 9px; line-height: 1;
  padding: 2px 3px; border-radius: 3px; pointer-events: none; z-index: 3;
}

/* 피커 판 — 격자·차림표·주소 상자가 모두 이 판 위에 선다
   The picker panel hosts the grid, menu, and address box alike */
.nabi-panel {
  position: absolute; z-index: calc(var(--nabi-z-sticky) + 5); background: var(--nabi-bg);
  /* 모서리는 안 깎는다 — 떠 있음은 그림자가, 경계는 테두리 선이 말하므로 라운드까지 더하면 같은 말을 셋이 한다
     No border-radius; the shadow already signals elevation and the border already marks the edge, so rounding would be a third redundant signal */
  border: 1px solid var(--nabi-line); border-radius: 0; padding: .375rem;
  box-shadow: var(--nabi-shadow);
  /* focus ring을 끈다 — 판 자체가 tabindex로 포커스를 받아 UA 고리가 뜨면 판이 "고른 것"처럼 보인다(2026-08-19)
     Suppress the focus ring; the panel takes focus via tabindex and the UA ring would wrongly read as the panel itself being selected (2026-08-19) */
  outline: none;
  /* max-content가 없으면 절대 배치 상자가 남은 폭으로 눌려 칸 글자가 겹친다
     Without max-content, the absolutely positioned panel shrinks to available space and its cells overlap */
  inline-size: max-content; max-inline-size: min(92vw, 30rem);
}
.nabi-grid { display: grid; grid-template-columns: repeat(8, var(--nabi-grid-cell)); gap: .1875rem; }
/* 층 안의 상자는 각지다 — 모서리를 가진 것은 층 자신뿐이다
   Boxes inside the layer are square; only the layer itself is rounded */
.nabi-cell {
  inline-size: var(--nabi-grid-cell); block-size: var(--nabi-grid-cell); box-sizing: border-box;
  padding: 0; border: 1px solid var(--nabi-line); border-radius: 0;
  background: transparent; cursor: pointer;
}
/* 고른 칸은 테두리색이 아니라 면으로 채운다 — 칸이 많을 때 테두리 색만으로는 격자가 어지러웠다(2026-08-19)
   A selected cell fills with color instead of a border color; with many cells, border-only selection read as noisy (2026-08-19) */
.nabi-cell.on {
  border-color: transparent;
  background: color-mix(in srgb, var(--nabi-accent) 32%, var(--nabi-bg));
}
.nabi-readout {
  margin-block-start: .5rem; text-align: center; color: var(--nabi-muted);
  font-size: .75rem; font-variant-numeric: tabular-nums;
}
.nabi-menu { display: flex; flex-wrap: wrap; gap: 2px; max-inline-size: 200px; }
/* 값 하나(주소)만 받는 판이라 위아래로 안 쌓고 한 줄로 둔다
   A single-value (address) prompt stays one row instead of stacking */
.nabi-prompt { display: flex; align-items: center; gap: .375rem; }
.nabi-menu { gap: .1875rem; }
.nabi-prompt .nabi-input { inline-size: 16rem; }
/* 확인 단추는 .nabi-input과 같은 옷에 테두리 색만 다르다 — 꽉 찬 색 단추는 주소 칸보다 무거워 보였다(084 ⑧)
   The confirm button matches .nabi-input's look, differing only in border color; a solid-fill button drew more attention than the address field (084 ⑧) */
.nabi-go {
  flex: none; inline-size: auto; min-inline-size: 0; box-sizing: border-box;
  block-size: 1.75rem; padding: 0 .625rem; font: inherit; font-size: .8125rem; white-space: nowrap;
  background: var(--nabi-bg); color: var(--nabi-accent);
  border: 1px solid var(--nabi-accent); border-radius: 0;
}
/* .nabi-btn:hover가 이 자리를 덮으므로 여기서 다시 말한다
   .nabi-btn:hover would override this, so the hover tint is restated here */
.nabi-go:hover:not(:disabled) { background: color-mix(in srgb, var(--nabi-accent) 12%, transparent); }
/* 잠긴 확인은 색을 통째로 회색으로 내리고 배경은 안 채운다 — 옅게만 두면 강조 테두리가 남아 눌리는 것처럼 보이고, 회색 배경은 판에서 가장 무거워진다(2026-08-19)
   A disabled confirm recolors fully gray with no filled background; opacity alone would leave the accent border looking clickable, and a gray fill would outweigh everything else (2026-08-19) */
.nabi-go:disabled {
  opacity: 1; cursor: default;
  color: var(--nabi-muted); border-color: var(--nabi-line); background: var(--nabi-bg);
}
.nabi-field { display: flex; align-items: center; gap: 6px; }
.nabi-field > span { font-size: 11px; color: var(--nabi-muted); min-inline-size: 44px; }

.nabi-panel.nabi-narrow, .nabi-narrow .nabi-panel {
  position: fixed !important;
  inset-inline: 5vw !important;
  inset-block-start: var(--nabi-panel-mid, 50%) !important;
  transform: translateY(-50%);
  inline-size: auto; max-inline-size: 30rem; margin-inline: auto;
  max-block-size: 90vh;
  max-block-size: var(--nabi-panel-room, 90dvh);
  overflow: auto;
  box-shadow: var(--nabi-shadow), 0 0 0 100vmax var(--nabi-scrim);
}
.nabi-menu.nabi-narrow, .nabi-narrow .nabi-menu { max-inline-size: 100%; }
.nabi-panel.nabi-narrow:has(> .nabi-grid), .nabi-narrow .nabi-panel:has(> .nabi-grid) { inline-size: fit-content !important; margin-inline: auto; }
.nabi-prompt.nabi-narrow, .nabi-narrow .nabi-prompt { flex-wrap: wrap; }
.nabi-prompt.nabi-narrow .nabi-input, .nabi-narrow .nabi-prompt .nabi-input { inline-size: auto; flex: 1 1 8rem; }
/* 칸과 확인 단추는 같은 높이로 나란히 선다 — 한 줄로 읽히려면 키가 같아야 한다
   The field and confirm button share the same height, so they read as one row */
.nabi-input {
  flex: 1 1 auto; min-inline-size: 0; box-sizing: border-box;
  block-size: 1.75rem; font: inherit; font-size: .8125rem; padding: 0 .5rem; color: inherit;
  background: var(--nabi-bg); border: 1px solid var(--nabi-line); border-radius: 0;
}
/* 포커스는 있던 테두리에 색만 입힌다 — 색 견본과 같은 규칙으로, 고리를 더 안 그린다
   Focus recolors the existing border instead of adding an outline ring, the same rule as the color swatch */
.nabi-input:focus, .nabi-input:focus-visible { outline: none; border-color: var(--nabi-accent); }
.nabi-actions { display: flex; justify-content: flex-end; gap: 4px; }

/* 상황 줄은 캐럿이 든 것의 컨트롤 모음이며, 비면 사라진다. 옅은 배경 한 겹으로 툴바 줄과 갈라 놓는다(선이 아니라 면으로)
   The context row holds controls for whatever the caret is in and disappears when empty; a faint background, not a border line, separates it from the toolbar row */
.nabi-context {
  display: flex; flex-wrap: wrap; align-items: center;
  /* 세로 패딩은 안 준다(2026-08-24) — 높이는 min-block-size가 잡고 컨트롤은 가운데 정렬로 선다
     No vertical padding here (2026-08-24); min-block-size sets the height and controls center themselves */
  gap: 0 .75rem; padding: 0 .375rem; min-block-size: var(--nabi-control-size);
  background: var(--nabi-soft);
}
.nabi-context[hidden] { display: none; }
.nabi-ctx-group {
  display: flex; flex-wrap: wrap; align-items: center; gap: .1875rem;
  margin-inline-end: .75rem; min-inline-size: 0; position: relative;
}
/* 라벨이 없는 그룹(색 줄·눈금) 앞에 이름을 붙인다 — 글이라 누를 수 없다
   A text label for groups without their own text (color row, slider); it's text, not a control, so it isn't clickable */
.nabi-ctx-tag {
  font-size: .75rem; opacity: .62; white-space: nowrap;
  margin-inline-end: .125rem; user-select: none;
}
/* 상황 줄 컨트롤은 툴바 단추보다 한 치수 작다 — 덧붙는 줄이라 무게를 낮춘다
   Context-row controls are one size smaller than toolbar buttons, to keep this extra row visually lighter */
.nabi-context .nabi-btn { block-size: 1.625rem; min-inline-size: 1.625rem; }

@media (pointer: coarse) {
  .nabi-context { gap: .25rem .75rem; }
  /* 그룹 안에서도 줄바꿈이 일어나므로 그룹의 세로 gap이 접힌 줄 사이도 함께 벌린다(단추 40 + 틈 4 = 44)
     Groups wrap internally too, so the group's vertical gap also spaces wrapped rows (40px button + 4px gap = the 44px touch target) */
  .nabi-ctx-group { min-block-size: var(--nabi-touch-control-size); gap: .25rem .1875rem; }
  .nabi-context .nabi-btn { block-size: 2.5rem; min-inline-size: 2.5rem; }
  .nabi-context .nabi-range { block-size: 2.5rem; }
  /* 입력 칸 글자는 16px 아래로 안 내린다 — iOS 사파리가 16px 미만 폼 칸에 포커스가 들면 페이지를 확대해 rect 측정이 전부 어긋난다(2026-08-23)
     Input font stays at or above 16px; iOS Safari zooms the page on focusing a smaller form field, throwing off every rect measurement we rely on (2026-08-23) */
  .nabi-input { font-size: var(--nabi-touch-font-size, 16px); }
}

.nabi-context.nabi-narrow { gap: .25rem .75rem; }
.nabi-narrow .nabi-ctx-group { min-block-size: var(--nabi-touch-control-size); gap: .25rem .1875rem; }
.nabi-context.nabi-narrow .nabi-btn { block-size: 2.5rem; min-inline-size: 2.5rem; }
.nabi-context.nabi-narrow .nabi-range { block-size: 2.5rem; }
.nabi-narrow .nabi-input { font-size: var(--nabi-touch-font-size, 16px); }

.nabi-toolbar-row.nabi-narrow .nabi-strip {
  display: flex; flex-wrap: nowrap; align-items: center;
  overflow-x: auto; scrollbar-width: none;
  /* 스크롤 가능하다는 표식으로 넘친 가장자리에 그늘을 준다 — 끝까지 굴리면 바탕색 막이 그늘을 덮어 사라진다(2026-08-24, 굵기는 2026-08-26 조정)
     A shadow hints at more content past the overflowing edge; scrolling to the end covers it with a solid mask so it disappears (2026-08-24, thickness tuned 2026-08-26) */
  background:
    linear-gradient(to right, var(--nabi-bg) 1rem, transparent) left / 2rem 100%,
    linear-gradient(to left, var(--nabi-bg) 1rem, transparent) right / 2rem 100%,
    radial-gradient(farthest-side at 0 50%, color-mix(in srgb, var(--nabi-fg) 20%, transparent), transparent) left / .5rem 100%,
    radial-gradient(farthest-side at 100% 50%, color-mix(in srgb, var(--nabi-fg) 20%, transparent), transparent) right / .5rem 100%;
  background-repeat: no-repeat;
  background-attachment: local, local, scroll, scroll;
}
.nabi-toolbar-row.nabi-narrow .nabi-strip::-webkit-scrollbar { display: none; }
/* 시작 여백을 줄의 padding이 아니라 스크롤 그릇 안에 둔다(2026-08-24) — 밖에 두면 그늘이 그 여백 뒤에서 시작한다. 겹쳐 붙는 호스트의 바깥 줄도 :has로 함께 걷어야 겹으로 두 번 안 밀린다
   Start padding lives inside the scroll container, not the row's own padding (2026-08-24), or the shadow starts after that gap; the :has clause also strips the outer host-wrapped row's padding so it doesn't double up */
.nabi-toolbar-row.nabi-narrow,
.nabi-toolbar-row:has(> .nabi-toolbar-row.nabi-narrow) { padding-inline-start: 0; }
.nabi-toolbar-row.nabi-narrow .nabi-strip { padding-inline-start: .375rem; }
/* .nabi-tools는 그릇 밖이라 손을 안 댄다 — float로 오른쪽에 그대로 남는다
   .nabi-tools sits outside this container and is left untouched; it stays floated right as-is */
.nabi-context.nabi-narrow {
  flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;
  /* 같은 그늘 표식이지만 이 줄의 배경(--nabi-soft)은 반투명이라 막을 두 겹(불투명 --nabi-bg + --nabi-soft)으로 깔아야 그늘이 완전히 가려진다(2026-08-24)
     Same shadow hint, but this row's background (--nabi-soft) is translucent, so the mask needs two layers (opaque --nabi-bg under --nabi-soft) to fully cover the shadow (2026-08-24) */
  background:
    linear-gradient(to right, var(--nabi-soft) 1rem, transparent) left / 2rem 100%,
    linear-gradient(to right, var(--nabi-bg) 1rem, transparent) left / 2rem 100%,
    linear-gradient(to left, var(--nabi-soft) 1rem, transparent) right / 2rem 100%,
    linear-gradient(to left, var(--nabi-bg) 1rem, transparent) right / 2rem 100%,
    radial-gradient(farthest-side at 0 50%, color-mix(in srgb, var(--nabi-fg) 20%, transparent), transparent) left / .5rem 100%,
    radial-gradient(farthest-side at 100% 50%, color-mix(in srgb, var(--nabi-fg) 20%, transparent), transparent) right / .5rem 100%,
    var(--nabi-soft);
  background-repeat: no-repeat;
  background-attachment: local, local, local, local, scroll, scroll, scroll;
}
.nabi-context.nabi-narrow::-webkit-scrollbar { display: none; }
/* 그룹이 줄어들 수 있으면 스크롤 대신 단추가 짜부라진다 — flex: none으로 막는다
   Groups must not shrink, or nowrap flex crushes the buttons instead of scrolling; flex: none prevents it */
.nabi-narrow .nabi-group, .nabi-narrow .nabi-ctx-group { flex: none; flex-wrap: nowrap; }
/* 스크롤 그릇 안의 툴팁은 끈다 — 절대 배치가 그릇 밖으로 나가 잘리거나 세로 스크롤을 만든다
   Tooltips inside the scroll container are disabled; their absolute position would clip or force vertical scroll */
.nabi-toolbar-row.nabi-narrow .nabi-strip [data-nabi-tip]:hover::after,
.nabi-context.nabi-narrow [data-nabi-tip]:hover::after { content: none; }

/* 값이 순서를 갖는 컨트롤(글자 크기·서체·폭)의 손잡이 — 칸 여섯 개 대신 하나로 끝나 상황 줄이 한 줄로 남는다. accent-color로 브라우저 기본 모양을 그대로 쓴다(직접 그리면 브라우저마다 다른 가짜 부품이 필요하다)
   The handle for ordered-value controls (font size/typeface/width) collapses six cells into one, keeping the context row single-line; accent-color reuses the native slider look instead of a custom one that would differ per browser */
.nabi-range {
  inline-size: 6.5rem; margin: 0 .125rem; accent-color: var(--nabi-accent);
  cursor: pointer; vertical-align: middle;
}
.nabi-range:focus-visible { outline: 2px solid var(--nabi-accent); outline-offset: 2px; }
/* 손잡이가 선 값을 옆에 보여 준다 — 최소 폭을 줘 값이 바뀌어도 뒤의 것들이 안 밀린다
   Shows the current value beside the handle; a min-width keeps later items from shifting as the text changes */
.nabi-ctx-readout {
  font-size: .75rem; opacity: .62; min-inline-size: 3.5rem;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}

/* toast는 편집기가 흘리는 한 마디(ui/toast.ts가 세운다) — 툴바 아래 고정 지점에 절대 배치라 글을 안 민다
   A toast (raised by ui/toast.ts) sits at a fixed point below the toolbar and is absolutely positioned so it never shifts content */
.nabi-toasts {
  /* 가로 가운데는 물리 속성(left)으로 맞춘다 — 툴팁과 같은 RTL 이유다
     Horizontal centering uses the physical 'left' property, for the same RTL reason as the tooltip */
  position: absolute; inset-block-start: calc(100% + .375rem); left: 50%;
  transform: translateX(-50%);
  z-index: calc(var(--nabi-z-sticky) + 6);
  display: flex; flex-direction: column; align-items: center; gap: .375rem;
  inline-size: max-content; max-inline-size: min(92vw, 30rem);
  /* 선반 자신은 손이 안 닿는다 — 말 사이 틈을 눌러도 뒤의 글이 눌려야 한다
     The shelf itself ignores pointer events, so clicking between toasts still reaches content behind it */
  pointer-events: none;
}
.nabi-toast {
  pointer-events: auto; cursor: pointer; user-select: none;
  box-sizing: border-box; max-inline-size: 100%;
  padding: .375rem .75rem; font-size: .8125rem; line-height: 1.5;
  /* pre-wrap이라야 \n이 살아 여러 줄 안내가 한 덩어리로 안 뭉친다
     pre-wrap keeps literal \n breaks so multi-line messages don't collapse into one block */
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--nabi-fg); background: var(--nabi-bg);
  /* 급(level)의 색은 왼쪽 선 하나로만 말한다 — 상자를 칠하면 테마마다 글자 대비를 따로 정해야 한다
     Severity level is shown only by the left border color; filling the box would require separate text-contrast tuning per theme */
  border: 0; border-inline-start: 3px solid var(--nabi-accent);
  border-radius: 0; box-shadow: var(--nabi-shadow);
  /* 500ms는 ui/toast.ts의 TOAST_FADE_MS와 같아야 한다
     500ms must match TOAST_FADE_MS in ui/toast.ts */
  transition: opacity var(--nabi-motion-toast) linear;
}
.nabi-toast[data-level="warn"] { border-inline-start-color: var(--nabi-tc-amber); }
.nabi-toast[data-level="error"] { border-inline-start-color: var(--nabi-danger); }
.nabi-toast.is-fading { opacity: 0; }

/* 업로드 중인 것은 아직 문서 트리에 안 들어가지만 파일을 받던 그 자리(캐럿 블록 뒤)에 흐름 형제로 뜬다. 진행률은 --nabi-per 하나가 숫자·격자를 함께 몬다
   An in-progress upload isn't in the doc tree yet, but sits in flow right where the file was dropped (after the caret block); one --nabi-per variable drives both the number and the grid */

/* --nabi-per를 @property로 등록해야 transition이 보간된다(안 하면 뚝뚝 끊긴다); 퍼센트가 아니라 수인 까닭은 blur()가 길이를 받아서다
   --nabi-per must be registered via @property to interpolate smoothly; it's a plain number, not a percent, because blur() needs a length */
@property --nabi-per { syntax: "<number>"; inherits: true; initial-value: 0; }

.nabi-content nabi-upload {
  --nabi-per: 0;
  /* --nabi-span은 upload.ts의 TILE_SPAN과 같아야 한다 — 칸이 이 값을 상속한다
     --nabi-span must match TILE_SPAN in upload.ts; tiles inherit this value */
  --nabi-span: 25;
  --nabi-blur-max: 12px;
  /* 미리보기가 없을 때 쓰는 차오르는 마스크 — custom property 안 var()는 선언된 자리에서 치환되므로 --nabi-per를 가진 이 요소에서 조립해야 한다
     Fallback wipe mask for when no preview exists; a var() inside a custom property resolves where it's declared, so it must be assembled on this element, which owns --nabi-per */
  --nabi-wipe: linear-gradient(to right, #000 0 calc(var(--nabi-per) * 1%), rgb(0 0 0 / 25%) calc(var(--nabi-per) * 1% + 10%));

  transition: --nabi-per var(--nabi-motion-progress) linear;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-inline-size: 6rem; min-block-size: 6rem; max-inline-size: 100%;
  margin: 0 0 .65em;
  overflow: hidden;
  color: var(--nabi-muted); background: var(--nabi-soft);
  border: 1px dashed var(--nabi-line); border-radius: var(--nabi-radius);
  cursor: progress; user-select: none;
}
/* 완료 후 그림이 앉을 자리와 같은 폭·정렬(wing/ops의 LUMP_DEFAULT_WIDTH·ALIGN)이라 끝나는 순간 크기가 안 바뀐다
   Matches the width/alignment the finished image will use (LUMP_DEFAULT_WIDTH/ALIGN in wing/ops), so nothing resizes the moment the upload completes */
.nabi-content nabi-upload:has(img) {
  inline-size: 60%; max-inline-size: 60%; margin-inline: auto;
  /* border는 0으로 없앤다 — 투명해도 1px은 자리를 먹어 완성된 그림과 2px 어긋났다
     border is 0, not just transparent; even a transparent 1px border occupied space and mismatched the finished image by 2px */
  background: transparent; border: 0;
}
/* 격자가 붙는 순간이 곧 미리보기가 그려진 순간이다 — 그때부터 상자가 그림 크기에 맞춰진다
   The grid being present means the preview has rendered; only then can the box match the image size */
.nabi-content nabi-upload:has(img):has(nabi-grid) { min-inline-size: 0; min-block-size: 0; }

/* max가 아니라 inline-size로 상자를 꽉 채운다 — 완성된 그림도 data-nabi-width가 폭을 정해 주므로, max로 두면 작은 그림이 끝나는 순간 커져 보인다
   Fills the box with inline-size, not max-inline-size; the finished image also gets its width forced by data-nabi-width, so max would let a small image visibly grow when the upload completes */
.nabi-content nabi-upload > img {
  display: block; inline-size: 100%; block-size: auto; border-radius: var(--nabi-radius);
}
/* 파일(이미지 아님)은 첨부 링크와 같은 모양의 클립 상자다 — 한 줄 높이라 타일 대신 좌→우로 차오르는 띠로 진행률을 말한다
   A non-image file renders as the same clip-box shape as an attachment link; being one line tall, progress is a left-to-right filling bar instead of tiles */
.nabi-content nabi-upload[data-nabi-kind="file"] {
  /* link wing의 a[data-nabi-file]을 그대로 베낀 스타일이다 — 완료 후 같은 상자여야 줄이 안 바뀐다
     Copies link wing's a[data-nabi-file] styling exactly, so the placeholder and the finished link are the same box and nothing shifts on completion */
  display: inline-flex; align-items: center; gap: .35em;
  inline-size: auto; min-inline-size: 0; min-block-size: 0;
  padding: .1em .5em; margin: 0 0 .65em;
  border: 1px solid var(--nabi-line); border-radius: 4px; overflow: hidden;
  color: var(--nabi-accent); background: transparent;
  /* 왼쪽→오른쪽으로 차오르는 띠 — 경계를 흐리면 걸음이 뚝뚝 끊겨 보이지 않는다
     Fills left to right; a soft edge keeps the progress step from looking jerky */
  background-image: linear-gradient(
    to right,
    color-mix(in srgb, var(--nabi-accent) 24%, transparent) 0 calc(var(--nabi-per) * 1%),
    transparent calc(var(--nabi-per) * 1% + 1.5%)
  );
}
/* 클립 아이콘만 링크 ::before와 같은 크기로 줄인다 — 이름 글자까지 줄이면 완료 순간 커지며 줄 높이가 튄다
   Only the clip icon shrinks to match the link's ::before size; shrinking the label too would make it visibly grow (and shift line height) on completion */
.nabi-content nabi-upload[data-nabi-kind="file"] > .nabi-upload-clip { font-size: .9em; }
/* 확장자 배지는 첨부 링크의 것과 같은 스타일이다
   Extension badge matches the attachment link's own badge style */
.nabi-content nabi-upload[data-nabi-kind="file"]:not([data-nabi-label=""])::before {
  content: attr(data-nabi-label);
  order: 3; font-size: .75em; color: var(--nabi-muted); letter-spacing: .04em;
}
/* 이 상자엔 덮을 그림이 없어 숫자가 겹치지 않고 줄 끝에 선다
   No image to overlay here, so the percent number sits at the line's end instead of overlapping */
.nabi-content nabi-upload[data-nabi-kind="file"]::after {
  position: static; order: 4;
  font-size: .8em; color: var(--nabi-muted); text-shadow: none;
}

/* 진행률 숫자는 z-index로 명시해 위에 겹친다 — 칸의 backdrop-filter가 쌓임 맥락을 바꾸면 순서만으로는 묻힌다
   The percent number needs an explicit z-index; a tile's backdrop-filter creates a stacking context that would otherwise bury it */
.nabi-content nabi-upload::after {
  content: attr(data-nabi-per) "%";
  position: absolute; z-index: 1;
  font-size: 1.1em; font-weight: 700; font-variant-numeric: tabular-nums;
  color: #fff; text-shadow: 0 1px 3px rgb(0 0 0 / 85%);
}
/* 격자가 아직 없는 그림 상자에서는 숫자가 가운데를 혼자 안 쓰게 위로 비켜선다
   Before the grid appears, the number moves up so it isn't sitting alone dead center */
.nabi-content nabi-upload:has(img):not(:has(nabi-grid))::after { inset-block-start: .625rem; }

/* 열 수를 인라인 변수로 두는 까닭: 칸 순번을 매기려면 JS가 그 수를 알아야 하는데 auto-fill은 그걸 안 알려 준다
   Column count is an inline variable because JS needs to know it to number tiles, and auto-fill wouldn't expose it */
.nabi-content nabi-upload > nabi-grid {
  position: absolute; inset: 0; display: grid;
  grid-template-columns: repeat(var(--nabi-cols), 1fr);
  overflow: hidden; border-radius: var(--nabi-radius); pointer-events: none;
}
/* filter는 img가 아니라 칸에 건다 — img에 걸면 쌓임 맥락이 생겨 backdrop-filter가 자기 자신을 보게 된다
   The filter lives on the tile, not the img; filtering the img would create a stacking context and make backdrop-filter sample itself */
.nabi-content nabi-upload nabi-tile {
  --nabi-clear: clamp(0, (var(--nabi-per) - var(--nabi-t)) / var(--nabi-span), 1);
  -webkit-backdrop-filter: blur(calc((1 - var(--nabi-clear)) * var(--nabi-blur-max))) grayscale(calc(1 - var(--nabi-clear)));
  backdrop-filter: blur(calc((1 - var(--nabi-clear)) * var(--nabi-blur-max))) grayscale(calc(1 - var(--nabi-clear)));
}

/* 취소 단추는 상자 위에 겹쳐 앉는 작은 동그라미다
   The cancel control is a small circle overlaid on the upload box */
.nabi-content nabi-upload > .nabi-upload-stop {
  position: absolute; z-index: 2; inset-block-start: 4px; inset-inline-end: 4px;
  inline-size: 22px; block-size: 22px; padding: 0; border: 0; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  font: inherit; font-size: 14px; line-height: 1; cursor: pointer;
  color: var(--nabi-fg); background: color-mix(in srgb, var(--nabi-bg) 70%, transparent);
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}
/* 첨부 상자(파일)에서는 안 겹치고 줄 끝에 앉는다 — 한 줄 높이라 겹치면 글자를 가린다
   In the file (non-image) box, cancel sits at line's end instead of overlapping; being one line tall, overlap would hide the text */
.nabi-content nabi-upload[data-nabi-kind="file"] > .nabi-upload-stop {
  position: static; order: 5;
  inline-size: 1rem; block-size: 1rem; font-size: .75rem; background: none;
  -webkit-backdrop-filter: none; backdrop-filter: none;
}

/* backdrop-filter가 없는 브라우저에서는 격자가 안 그려지므로 미리보기 마스크가 그 자리를 대신한다
   Without backdrop-filter support the grid draws nothing, so the preview's own wipe mask takes over instead */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .nabi-content nabi-upload > img {
    -webkit-mask-image: var(--nabi-wipe); mask-image: var(--nabi-wipe);
    filter: grayscale(calc(1 - var(--nabi-per) / 100));
  }
}
/* 블러·흑백은 남기고 움직임(transition)만 뺀다 — 장식이 아니라 진행 표시라서다
   Reduced motion keeps the blur/grayscale and only drops the transition, since these convey progress, not decoration */
@media (prefers-reduced-motion: reduce) {
  .nabi-content nabi-upload { transition: none; }
}

/* 업로드 오류는 모두 toast로 나간다(084 ⑦) — 이곳에 따로 거절 문구 자리를 두지 않는다
   All upload errors go through toast (084 ⑦); there's deliberately no separate rejection-message slot here */

/* 업로드 중에는 커서를 progress로 바꿔 입력이 막혔음을 보인다
   Cursor becomes "progress" while uploading, signaling input is blocked */
.nabi-content.nabi-uploading { cursor: progress; }

/* 로컬 기록 판 — 목록·미리보기·지우기가 한 상자에 산다
   Local history panel: list, preview, and clear all live in one box */
.nabi-history { inline-size: min(46rem, 100%); max-block-size: 100%; display: flex; flex-direction: column; overflow: hidden; }
.nabi-history-head { padding: .75rem 4.5rem .5rem .9rem; }
.nabi-history-title { font-size: .95rem; font-weight: 650; }
/* 모서리 단추 둘은 머리줄이 아니라 절대 배치로 뜬다 — 미리보기 카드와 같은 자리다
   The two corner buttons float via absolute position, not inside the header row, matching the preview card's own layout */
.nabi-history-corner {
  position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; z-index: 1;
  display: inline-flex; gap: .125rem;
}
/* minmax(0, 1fr)로 기본 최소 폭(auto)을 0으로 내린다 — 안 그러면 긴 요약이 줄을 밀어 시각·도구가 상자 밖으로 나간다
   minmax(0, 1fr) overrides the default auto min-width; without it a long summary pushes the time/tool columns out of the box */
.nabi-history-list {
  overflow-y: auto; padding: 0 .5rem .5rem; display: grid; gap: .125rem;
  grid-template-columns: minmax(0, 1fr);
}
.nabi-history-empty { padding: 1.5rem; text-align: center; opacity: .62; font-size: .85rem; }
.nabi-history-row {
  display: flex; align-items: center; gap: .25rem; min-inline-size: 0;
  border-radius: var(--nabi-radius-sm); padding-inline-end: .25rem;
}
/* 줄무늬 배경 — 줄이 많아져도 눈이 한 줄을 잃지 않는다
   Zebra striping keeps the eye from losing its row as the list grows */
.nabi-history-row:nth-child(odd) { background: color-mix(in srgb, var(--nabi-fg) 4%, transparent); }
.nabi-history-row:hover { background: var(--nabi-soft); }
/* 요약이 남는 자리를 다 먹고 시각·도구는 flex: none으로 안 줄어든다 — min-inline-size: 0이 없으면 긴 요약이 그것들을 상자 밖으로 민다
   The summary takes remaining space while time/tools stay flex: none; without min-inline-size: 0 a long summary would push them out of the box */
.nabi-history-open {
  flex: 1; min-inline-size: 0; display: flex; align-items: baseline; gap: .75rem;
  padding: .5rem .6rem; border: 0; background: none; color: inherit; font: inherit;
  text-align: start; cursor: pointer; border-radius: var(--nabi-radius-sm);
}
.nabi-history-open:disabled { cursor: default; }
.nabi-history-summary {
  flex: 1; min-inline-size: 0; font-size: .85rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nabi-history-when { flex: none; text-align: end; font-size: .72rem; opacity: .62; line-height: 1.5; white-space: nowrap; }
/* 시각 이름표는 절대 배치라 기준 상자가 필요하다 — 없으면 판 전체 기준으로 엉뚱한 자리에 뜬다. 목록이 가로로 잘리므로 가운데 대신 줄 끝에 붙인다
   The time tooltip is absolutely positioned and needs an anchor box, or it floats relative to the whole panel; it's end-aligned, not centered, since the list clips horizontal overflow */
.nabi-history-time, .nabi-history-made { position: relative; }
.nabi-history-when [data-nabi-tip]:hover::after {
  inset-inline-start: auto; inset-inline-end: 0; transform: translateY(4px);
}
.nabi-history-here { color: var(--nabi-accent); opacity: 1; }
.nabi-history-tool { flex: none; block-size: 1.625rem; min-inline-size: 1.625rem; opacity: .62; }
.nabi-history-tool:hover { opacity: 1; }
.nabi-history-preview { padding: 1rem 1.25rem; }

/* 브라우저는 그림·iframe에 선택 하이라이트를 안 그리므로, 골랐다는 표시는 점선 테두리 하나로 우리가 대신한다(화면 전용, 출력에는 안 나간다)
   Browsers don't draw a selection highlight on images/iframes, so a dashed outline stands in for "selected" here (screen-only, never in output) */
.nabi-content [data-nabi-picked] {
  outline: 2px dashed var(--nabi-accent);
  outline-offset: 2px;
  border-radius: var(--nabi-radius-xs);
}
/* 글 선택도 강조색을 따른다 — 브라우저 기본 파랑은 다크에서 글자를 삼킨다
   Text selection also follows the accent color; the browser's default blue swallows text in dark mode */
.nabi-content[contenteditable] ::selection { background: color-mix(in srgb, var(--nabi-accent) 28%, transparent); }
/* 글이 든 물건(코드·접기·인용·표)을 통째로 고르면 안쪽 selection 칠을 걷어 테두리만 남긴다(뒤에 와야 순서로 이긴다)
   Selecting a text-bearing block (code/details/quote/table) whole strips its inner ::selection paint, leaving only the outline; must come after the previous rule to win on specificity ties */
.nabi-content [data-nabi-picked]::selection,
.nabi-content [data-nabi-picked] ::selection { background: transparent; }

/* scroll-margin은 블록마다 걸어 새 블록이 sticky 툴바 뒤에 가려 서지 않게 한다. --nabi-bar-height는 mountSticky가 재는 실측값이고, 없을 때의 3.5rem은 한 줄 툴바 어림값이라 두 줄+상황 줄에서는 크게 모자란다(011)
   scroll-margin lives on each block so a newly inserted one isn't hidden behind the sticky toolbar; --nabi-bar-height is measured by mountSticky, and the 3.5rem fallback (a one-row estimate) falls well short with two rows plus a context row (011) */
.nabi-content > * {
  scroll-margin-block-start: calc(var(--nabi-sticky-top, 0px) + var(--nabi-keyboard-top, 0px) + var(--nabi-bar-height, 3.5rem));
}

.nabi-content { padding: 12px 14px; line-height: 1.7; outline: none; overflow-wrap: break-word; }
/* .nabi-editing에만 최소 높이를 준다 — 전체선택 삭제 뒤 상자가 한 줄로 접히면 그 아래 페이지가 통째로 딸려 올라온다(2026-08-23). 발행·미리보기는 글 길이가 그대로 높이다
   Only .nabi-editing gets a min-height; without it, an emptied box collapsing to one line drags the whole page up (2026-08-23). Published/preview content stays sized to its own text */
.nabi-content.nabi-editing { min-block-size: var(--nabi-content-min-height, 12.5rem); }
/* 블록 사이 간격은 margin이 아니라 padding-block-end다 — margin이면 그 띠를 브라우저가 다음 블록의 0번 오프셋으로 셈해 클릭·드래그 위치가 어긋난다
   Spacing between blocks is padding-block-end, not margin; a margin gap gets counted by the browser as offset 0 of the next block, throwing off click/drag targeting there */
.nabi-content > * { margin: 0; padding-block-end: .6em; }
.nabi-content > :last-child { padding-block-end: 0; }
/* 빈 문단은 발행 HTML에서 자식이 없어 브라우저가 줄 높이를 안 만든다 — 시트에서 최소 높이를 세워 연속 빈 줄 수가 미리보기·발행에도 그대로 보이게 한다
   Empty paragraphs have no children in published HTML, so the browser gives them no line box; this min-height keeps consecutive blank lines visible in preview and publish alike */
.nabi-content :is(p, h1, h2, h3, h4, h5, h6):empty { min-block-size: 1lh; }
/* 빈 편집기 안내글은 편집 뿌리의 층 하나이지 블록 자신의 ::before가 아니다 — 그래야 정렬·제목·드롭캡 스타일이 안내글로 새지 않는다. 포커스가 들면 이 층을 없앤다: Android Chrome IME가 compositionstart 전에 가상 요소까지 포함한 빈 영역에서 조합 대상을 정해 첫 한글 음절을 깨뜨릴 수 있어서다. 절대 위치 + padding: inherit로 글자와 같은 자리에 선다
   The empty-editor placeholder is a layer on the editing root, not a block's own ::before, so alignment/heading/dropcap styles can't leak into it. It's removed on focus: Android Chrome's IME can pick a composition target from an empty contenteditable that still includes a pseudo-element, breaking the first Hangul syllable. Absolute position + padding: inherit keeps it aligned with real text */
.nabi-content.nabi-editing { position: relative; }
.nabi-content.nabi-editing:not(:focus):has(> :is(p, h1, h2, h3, h4, h5, h6):only-child > br:only-child)::before {
  content: var(--nabi-placeholder, "");
  position: absolute; inset-block-start: 0; inset-inline: 0;
  padding: inherit;
  text-align: start; white-space: pre-line;
  color: var(--nabi-placeholder-color, var(--nabi-placeholder-color-fallback, #6b6b76aa));
  pointer-events: none; user-select: none;
}
.nabi-content [data-nabi-align="l"] { text-align: start; }
.nabi-content [data-nabi-align="c"] { text-align: center; }
.nabi-content [data-nabi-align="r"] { text-align: end; }
/* 표·그림·영상은 상자라 text-align이 안 먹는다 — margin으로 옮긴다. 대체 요소(img/iframe)에 fit-content를 주면 찌그러지므로 폭은 안 건드린다
   Tables/images/video are boxes, not text, so text-align doesn't move them; margin does. Replaced elements (img/iframe) would distort under fit-content, so their width is left alone */
.nabi-content [data-nabi-align] > .nabi-scroll,
.nabi-content [data-nabi-align] > table { inline-size: fit-content; max-inline-size: 100%; }
.nabi-content [data-nabi-align] > :is(img, iframe) { display: block; }
.nabi-content [data-nabi-align="l"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: 0 auto; }
.nabi-content [data-nabi-align="c"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: auto; }
.nabi-content [data-nabi-align="r"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: auto 0; }
/* 드롭캡은 정확히 세 줄을 밀어낸다 — 상자 키(font-size×line-height)를 본문 줄높이로 나눈 값이 올림 3이 되도록 5.9em/line-height .83로 잡았다(정확히 5.1em으로 맞추면 반올림 오차로 네 줄째까지 밀린다). contenteditable 안에서는 실제 span으로 조립한다 — ::first-letter는 WebKit 캐럿/Selection을 한 글자 어긋나게 하고 Chromium 줄 이동을 깨뜨린다(둘 다 재현됨)
   The dropcap is sized (5.9em, line-height .83) so its box height divided by the body line-height rounds up to exactly 3 lines pushed (an exact 5.1em rounds a pixel over into a 4th line). Inside contenteditable it's built from a real span, not ::first-letter, since that pseudo-element misaligns WebKit's caret/Selection by one character and breaks Chromium's line navigation (both reproduced) */
.nabi-content:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  float: inline-start;
  font-size: 5.9em; line-height: .83;
  padding-inline-end: .095em; margin-inline-end: .04em;
}
.nabi-content [data-nabi-p] { display: block; }
/* 표는 겉옷(.nabi-scroll) 안에서 가로로 구른다 — fit-content로 표 폭만 감싸야 오른쪽 빈 자리를 눌러도 표를 누른 셈이 되지 않는다
   Tables scroll horizontally inside their wrapper; fit-content hugs just the table's width, or clicking the empty space to its right would count as clicking the table */
.nabi-scroll { overflow-x: auto; inline-size: fit-content; max-inline-size: 100%; }
/* 고른 표의 점선은 안쪽에 둔다 — 겉옷이 넘침을 잘라 바깥 고리는 한쪽 변만 남았다
   The selected table's outline goes inward; the wrapper clips overflow, so an outward outline showed only one edge */
.nabi-content .nabi-scroll > [data-nabi-picked] { outline-offset: -2px; }

/* 전체화면은 Fullscreen API가 아니라 클래스 하나다 — iframe 안에서도 동작한다
   Fullscreen is a plain class, not the Fullscreen API, so it also works inside an iframe */
.nabi.is-fullscreen {
  position: fixed; inset: 0; inset-block-end: var(--nabi-keyboard-bottom, 0px);
  z-index: var(--nabi-z-overlay); overflow: auto; background: var(--nabi-bg);
}

/* 덮개(미리보기·라이트박스 공용)에 옅은 블러를 준다 — 반투명 막만으로는 뒤 글자가 앞과 겹쳐 읽힌다
   The shared overlay (preview/lightbox) gets a light blur; a plain translucent scrim alone lets text behind it read through and collide with text in front */
.nabi-scrim {
  position: fixed; inset: 0; z-index: var(--nabi-z-dialog); display: flex; align-items: center;
  justify-content: center; padding: 4vmin; background: var(--nabi-scrim);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
/* 라운드를 크게 안 준다 — 막이 이미 페이지와 갈라놨는데 큰 라운드까지 더하면 위젯처럼 보인다. 실선 테두리는 남긴다(다크에서 카드·막 밝기가 가까워 그림자만으로 경계가 안 보인다)
   No large border-radius; the scrim already separates this from the page, and rounding it further would make it read as a widget. A thin border stays, since in dark mode the card and scrim are too close in brightness for the shadow alone to mark the edge */
.nabi-card {
  position: relative; background: var(--nabi-bg); color: var(--nabi-fg);
  border: 1px solid var(--nabi-line); border-radius: var(--nabi-radius-xs); box-shadow: var(--nabi-shadow);
  inline-size: var(--nabi-preview-width, 720px); max-inline-size: 100%; max-block-size: 100%;
  overflow: auto; outline: none;
}
.nabi-preview { min-block-size: min(50dvh, 100%); }
/* 반투명 동그라미 하나만 남긴다 — 제목 줄을 없애 카드 전체를 내용이 그대로 쓴다
   Just a translucent circle; removing the title row lets the content use the whole card */
.nabi-close {
  position: absolute; inset-block-start: 8px; inset-inline-end: 8px; inline-size: 32px; block-size: 32px;
  z-index: 1; border: 0; border-radius: 999px; color: inherit; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--nabi-bg) 65%, transparent);
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}
.nabi-close:hover { background: color-mix(in srgb, var(--nabi-soft) 85%, transparent); }
.nabi-lightbox { max-inline-size: 100%; max-block-size: 100%; object-fit: contain; outline: none; }
/* 미리보기 그림은 누르면 크게 열린다(overlay.ts의 body 클릭이 그 문) — 편집 중(.nabi-editing)에는 안 걸리므로 이 파일에서만 커서로 그 사실을 알린다
   Preview images open larger on click (via overlay.ts's body click handler); this doesn't apply while editing (.nabi-editing), so this cursor is the only place that signals it's clickable */
.nabi-preview-body img { cursor: pointer; }

/* 붙여넣기·저장 판은 한 규칙을 나눠 쓴다(ui/parts/grid.ts, 2026-08-23) — 나란히 선 카드 몇 장, 폭은 후보 수만큼만 상한을 준다(고정 폭이면 후보 둘일 때 절반이 빈다)
   The paste-choice and save panels share one ruleset (ui/parts/grid.ts, 2026-08-23): a row of cards whose width caps at however many candidates there are, since a fixed width would leave half the panel empty with only two */
.nabi-choose, .nabi-save { inline-size: fit-content; max-inline-size: min(24rem, 100%); padding: .9rem; }
.nabi-choose-title, .nabi-save-title {
  font-size: .9rem; font-weight: 650; margin-block-end: .8rem; text-align: center;
}
/* --nabi-grid-cols는 판을 세우는 쪽이 후보 수로 건네고, 방향키 걸음(gridStep)도 같은 값을 쓴다 — 보이는 격자와 겨눔의 격자가 하나다
   --nabi-grid-cols is passed in by whatever builds the panel based on candidate count, and keyboard step (gridStep) uses the same value, so the visible grid and the navigable grid stay one */
.nabi-choose-list, .nabi-save-list {
  display: grid; grid-template-columns: repeat(var(--nabi-grid-cols, 3), minmax(0, 5.25rem));
  justify-content: center; gap: .4rem;
}
/* 그림 없는 후보는 칸 자체를 안 만든다 — 이름 하나만 카드 가운데 선다
   A candidate with no icon skips that cell entirely, so its label alone sits centered */
.nabi-choose-row, .nabi-save-row {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4rem;
  min-inline-size: 0; min-block-size: 4.5rem; text-align: center; cursor: pointer;
  padding: .7rem .4rem; border: 1px solid transparent; border-radius: var(--nabi-radius-xs);
  background: none; color: inherit; font: inherit; font-size: .64rem; font-weight: 400;
  letter-spacing: .04em; line-height: 1.2; overflow-wrap: anywhere;
}
/* 이름은 굵게도 크게도 안 쓴다 — 그림이 말하고 이름은 거든다
   Labels stay unbold and small; the icon carries the meaning, the label just assists */
.nabi-choose-icon, .nabi-save-icon { display: flex; color: var(--nabi-muted); }
.nabi-choose-icon svg, .nabi-save-icon svg { inline-size: 24px; block-size: 24px; display: block; }
/* 겨눔 표식은 aria-selected 하나뿐(hover와 안 섞는다) — 테두리 색만 쓰고 배경은 안 채운다(2026-08-23), 표 칸 선택과 같은 토큰(--nabi-accent)이다
   Selection is marked only via aria-selected, never mixed with hover, and only by border color with no fill (2026-08-23) — the same --nabi-accent token used for table cell selection */
.nabi-choose-row[aria-selected="true"], .nabi-save-row[aria-selected="true"] {
  outline: none; border-color: var(--nabi-accent);
}

/* --- 저장 판만의 것: 이름 칸·확장자 표식·손실 안내 --- */
/* 이름 칸이 함께 서므로 폭 하한을 둔다 — 형식이 하나뿐인 호스트에서도 안 쪼그라든다
   A min-width keeps the name field from shrinking even when a host offers only one format */
.nabi-save { min-inline-size: min(18rem, 100%); }
/* 확장자 표식은 겨눈 칸을 따라 바뀐다 — 무엇으로 저장될지 이름 옆에서 바로 읽힌다
   The extension badge follows whichever format is selected, so what will be saved reads right next to the name */
.nabi-save-name { display: flex; align-items: center; gap: .375rem; margin-block-end: .6rem; }
.nabi-save-name .nabi-input { flex: 1 1 auto; min-inline-size: 0; }
/* 표식 폭은 --nabi-save-ext-len(가장 긴 확장자 글자 수)로 고정한다(2026-08-23) — 형식을 옮겨도 이름 칸 오른쪽 끝이 흔들리지 않는다
   The badge width is fixed to --nabi-save-ext-len, the longest extension's character count (2026-08-23), so switching formats doesn't shift the name field's right edge */
.nabi-save-ext {
  font-size: .85rem; color: var(--nabi-muted); white-space: nowrap;
  flex: 0 0 auto; inline-size: calc(var(--nabi-save-ext-len, 5) * 1ch); text-align: start;
}
/* 되돌릴 수 없다는 안내는 이름 아래 아주 작은 글씨다(2026-08-23) — 경고색은 안 쓴다, 막는 게 아니라 알리는 것이다
   The "can't undo" note sits as tiny text below the name (2026-08-23), without warning color, since it informs rather than blocks */
.nabi-save-note { font-size: .52rem; line-height: 1.1; color: var(--nabi-muted); margin-block-start: -.25rem; }
`;
