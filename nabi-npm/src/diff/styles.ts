import { ICON_CSS } from '../style/icon-css.js';
// --- 시트 --------------------------------------------------------------------------------------
import { acquireStyleSheet } from '../lifecycle.js';
import { MOTION_PRESS_MS, Z_DIFF_FULLSCREEN } from '../style/tokens.js';

export function ensureCss(doc: Document): () => void {
  return acquireStyleSheet(doc, DIFF_CSS, { name: 'data-nabi-diff' });
}

// `--nabi-*` 토큰을 대체값과 함께 부른다 — 편집기 시트(`nabi.css`) 없이 홀로 설 때도 옷이 있다.
// References `--nabi-*` tokens with fallbacks, so this looks styled even standing alone without the editor stylesheet.
export const DIFF_CSS = `${ICON_CSS}

.nabi-diff {
  --nabi-motion-press: ${MOTION_PRESS_MS}ms;
  --nabi-z-diff-fullscreen: ${Z_DIFF_FULLSCREEN};
  --nabi-diff-del: rgb(217 59 59 / 12%);
  --nabi-diff-del-hard: rgb(217 59 59 / 30%);
  --nabi-diff-ins: rgb(22 163 74 / 12%);
  --nabi-diff-ins-hard: rgb(22 163 74 / 30%);
  --nabi-diff-move: rgb(59 111 224 / 12%);
  --nabi-diff-move-hard: rgb(59 111 224 / 30%);
  /* 커넥터 선 전용, 불투명이다 — 반투명이면 겹친 선이 진해져 여러 선으로 읽힌다. 블록 배경과 같은 혼합비라 패인 끝에서 색이 그대로 이어진다. */
  /* For connector lines only, kept opaque — translucent lines would darken where they overlap and read as multiple lines; the mix ratio matches the block background so color continues unbroken from the pane edge. */
  --nabi-diff-line-del: color-mix(in srgb, rgb(217 59 59) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(22 163 74) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-move: color-mix(in srgb, rgb(59 111 224) 12%, var(--nabi-bg, #fff));
  /* "있었을 자리" 2px 줄 전용 — 연한 선 색으로는 두 픽셀이 안 보여서 한 단계 진하게. */
  /* For the 2px "would-have-been" line only; the faint line color isn't visible at 2px, so this goes one shade darker. */
  --nabi-diff-mark-del: color-mix(in srgb, rgb(217 59 59) 30%, var(--nabi-bg, #fff));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(22 163 74) 30%, var(--nabi-bg, #fff));
  display: flex; flex-direction: column; gap: .375rem;
  color: var(--nabi-fg, #1b1b1f);
}
:where(html, body).dark .nabi-diff:not([data-nabi-theme="light"]),
.nabi-diff[data-nabi-theme="dark"] {
  /* 표준 토큰도 제 몸에 든다 — 이 층은 편집기(.nabi) 밖(body·홀로 선 자리)에 설 수 있어 상속이 안 닿는다. 대체값이 없으면 다크 페이지에서 패인만 흰색으로 남는다. */
  /* Also carries the standard tokens itself, since this layer can stand outside the editor (.nabi) where inheritance doesn't reach — without a fallback the pane stays white on a dark page. */
  color-scheme: dark;
  --nabi-fg: #e8e8ee; --nabi-bg: #16161a; --nabi-muted: #9a9aa6; --nabi-line: #2e2e36;
  --nabi-accent: #7ea2ff; --nabi-soft: rgb(255 255 255 / 7%);
  /* 다크의 기조색은 흰색 쪽으로 밝히고 채도를 뺀 파스텔이다 — 어두운 바탕에서 칠이 보이는 건 밝기 차라 알파도 올렸다. 이음선 혼합비는 블록 알파와 같아야 패인 끝에서 톤이 안 갈린다. */
  /* Dark-mode base colors are pastels, lightened toward white with saturation reduced; visibility on a dark background comes from brightness contrast, so alpha is raised too — the line mix ratio must match the block's or tones would split at the pane edge. */
  --nabi-diff-del: rgb(248 196 200 / 18%);
  --nabi-diff-del-hard: rgb(248 196 200 / 40%);
  --nabi-diff-ins: rgb(178 238 200 / 16%);
  --nabi-diff-ins-hard: rgb(178 238 200 / 36%);
  --nabi-diff-move: rgb(200 214 250 / 18%);
  --nabi-diff-move-hard: rgb(200 214 250 / 38%);
  --nabi-diff-line-del: color-mix(in srgb, rgb(248 196 200) 18%, var(--nabi-bg, #16161a));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(178 238 200) 16%, var(--nabi-bg, #16161a));
  --nabi-diff-line-move: color-mix(in srgb, rgb(200 214 250) 18%, var(--nabi-bg, #16161a));
  --nabi-diff-mark-del: color-mix(in srgb, rgb(248 196 200) 40%, var(--nabi-bg, #16161a));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(178 238 200) 36%, var(--nabi-bg, #16161a));
}
:where(html, body).light .nabi-diff:not([data-nabi-theme="dark"]),
.nabi-diff[data-nabi-theme="light"] {
  color-scheme: light;
  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-diff-del: rgb(217 59 59 / 12%);
  --nabi-diff-del-hard: rgb(217 59 59 / 30%);
  --nabi-diff-ins: rgb(22 163 74 / 12%);
  --nabi-diff-ins-hard: rgb(22 163 74 / 30%);
  --nabi-diff-move: rgb(59 111 224 / 12%);
  --nabi-diff-move-hard: rgb(59 111 224 / 30%);
  --nabi-diff-line-del: color-mix(in srgb, rgb(217 59 59) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(22 163 74) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-move: color-mix(in srgb, rgb(59 111 224) 12%, var(--nabi-bg, #fff));
  --nabi-diff-mark-del: color-mix(in srgb, rgb(217 59 59) 30%, var(--nabi-bg, #fff));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(22 163 74) 30%, var(--nabi-bg, #fff));
}

.nabi-diff-bar { display: flex; align-items: center; gap: .25rem; }
.nabi-diff-spacer { flex: 1; }
.nabi-diff-btn {
  appearance: none; border: 1px solid var(--nabi-line, #e2e2e8); border-radius: 0;
  background: transparent; color: inherit; cursor: pointer;
  block-size: 1.75rem; min-inline-size: 1.75rem; padding: 0 .375rem;
  display: inline-flex; align-items: center; justify-content: center;
  font: inherit; font-size: .8125rem;
}
.nabi-diff-btn:hover:not(:disabled) { color: var(--nabi-accent, #3b6fe0); }
.nabi-diff-btn:disabled { opacity: .4; cursor: default; }
.nabi-diff-btn[aria-pressed="true"] { color: var(--nabi-accent, #3b6fe0); }
.nabi-diff-btn:active:not(:disabled) { transform: translateY(2px); transition: transform var(--nabi-motion-press) ease-out; }
.nabi-diff-btn svg { inline-size: 1rem; block-size: 1rem; }
.nabi-diff-count {
  font-size: .75rem; color: var(--nabi-muted, #6b6b76);
  font-variant-numeric: tabular-nums; margin-inline-start: .25rem;
}

.nabi-diff-body {
  display: grid; grid-template-columns: minmax(0, 1fr) 1.75rem minmax(0, 1fr);
  border: 1px solid var(--nabi-line, #e2e2e8); background: var(--nabi-bg, #fff);
}
.nabi-diff-pane {
  position: relative; overflow: scroll;
  block-size: var(--nabi-diff-height, 30rem);
  background: var(--nabi-bg, #fff);
}
/* 스크롤바 상시 노출 — overflow:scroll 에 더해, 오버레이 스크롤바(macOS)도 고전 모드로 세운다. */
/* Keeps scrollbars always visible: on top of overflow:scroll, this also forces macOS overlay scrollbars into classic mode. */
.nabi-diff-pane::-webkit-scrollbar { inline-size: .625rem; block-size: .625rem; }
.nabi-diff-pane::-webkit-scrollbar-track { background: transparent; }
.nabi-diff-pane::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--nabi-fg, #1b1b1f) 26%, transparent);
  border-radius: .3125rem;
}
.nabi-diff-pane { scrollbar-width: thin; }
/* 좌우 여백이 없다 — 색 블록이 패인의 양 끝까지 닿아 거터의 이음선과 한 몸으로 이어진다. */
/* No inline padding, so the color blocks reach the pane's full width and read as one piece with the gutter's connector line. */
/* 폭은 패인 그대로다 — 옛 판의 inline-size: max-content 는 문단 줄바꿈을 죽여 문서가 패인 폭의 여러 배로 터지고 %폭 그림·영상도 기준을 잃었다. */
/* Width stays the pane's own — a prior inline-size: max-content killed paragraph wrapping, blowing the doc out to many times the pane's width and breaking percentage-width images/videos. */
.nabi-diff-doc { padding: .75rem 0; box-sizing: border-box; }

.nabi-diff-gutter { position: relative; overflow: hidden; background: var(--nabi-soft, rgb(0 0 0 / 4.5%)); }
.nabi-diff-gutter svg { position: absolute; inset: 0; display: block; }
/* 선은 소속 색 그대로다 — 지움(빨강)·추가(초록)·이동(파랑), changed 는 왼쪽 빨강에서 오른쪽 초록 그라디언트(fill은 마운트별 id를 물어 JS 인라인). 테두리(stroke)는 겹친 선 속에서 금을 그어 걷었다. */
/* Lines carry their own color — red for removed, green for added, blue for moved; changed lines gradient red-to-green (fill is set inline in JS since it references a per-mount id). Stroke is dropped since it drew a line through neighboring overlapping lines. */
.nabi-diff-line { stroke: none; }
.nabi-diff-line-removed { fill: var(--nabi-diff-line-del); }
.nabi-diff-line-added { fill: var(--nabi-diff-line-ins); }
.nabi-diff-line-moved { fill: var(--nabi-diff-line-move); }
.nabi-diff-stop-del { stop-color: var(--nabi-diff-line-del); }
.nabi-diff-stop-ins { stop-color: var(--nabi-diff-line-ins); }

/* 반대쪽 패인의 "있었을 자리" 한 줄 — 이음선과 같은 불투명 토큰이라 거터의 선이 이 줄로 이어져 보이고, 겹쳐도 한 줄로 보인다. */
/* The "would-have-been" line on the opposite pane; sharing the connector's opaque token makes the gutter line read as continuing into it, even when several overlap. */
.nabi-diff-mark { position: absolute; inset-inline: 0; block-size: 2px; pointer-events: none; }
.nabi-diff-mark-added { background: var(--nabi-diff-mark-ins); }
.nabi-diff-mark-removed { background: var(--nabi-diff-mark-del); }

/* 전체화면 판 — diff wing 의 단추가 여는 화면이다. 편집기 밖(body)에 서므로 색은 대체값과 다크 갈래를 제 몸에 든다. */
/* The fullscreen pane opened by the diff wing's button; it stands outside the editor (in body), so it carries its own color fallbacks and dark variant. */
.nabi-diff-screen {
  position: fixed; inset: 0; z-index: var(--nabi-z-diff-fullscreen, ${Z_DIFF_FULLSCREEN}); box-sizing: border-box;
  background: var(--nabi-bg, #fff); color: var(--nabi-fg, #1b1b1f);
  display: flex; flex-direction: column; gap: .5rem; padding: .75rem;
}
:where(html, body).dark .nabi-diff-screen:not([data-nabi-theme="light"]),
.nabi-diff-screen[data-nabi-theme="dark"] {
  background: var(--nabi-bg, #16161a); color: var(--nabi-fg, #e8e8ee);
  --nabi-line: #2e2e36; --nabi-soft: rgb(255 255 255 / 7%);
}
/* 판이 남은 높이를 다 먹는다 — 패인의 고정 높이(--nabi-diff-height)를 화면 채움으로 바꾼다. */
/* The pane fills all remaining height, replacing its fixed --nabi-diff-height with a screen-filling layout. */
.nabi-diff-screen-host { flex: 1; min-block-size: 0; }
.nabi-diff-screen-host .nabi-diff { block-size: 100%; }
.nabi-diff-screen-host .nabi-diff-body { flex: 1; min-block-size: 0; grid-template-rows: minmax(0, 1fr); }
.nabi-diff-screen-host .nabi-diff-pane { block-size: auto; }

.nabi-diff-block { padding: .125rem 0; }
/* 블록 껍데기가 문단의 직계 자리를 차지하므로 UA 기본 여백을 속에서 걷는다 — 문단 간격은 nabi.css 의 .nabi-content > * 가 껍데기에 그대로 준다. */
/* The block wrapper sits where a paragraph directly would, so the UA's default margin is stripped inside it; paragraph spacing still comes from nabi.css's .nabi-content > * applied to the wrapper. */
.nabi-diff-block > * { margin: 0; }
.nabi-diff-block[data-diff="removed"] { background: var(--nabi-diff-del); }
.nabi-diff-block[data-diff="added"] { background: var(--nabi-diff-ins); }
.nabi-diff-before .nabi-diff-block[data-diff="changed"] { background: var(--nabi-diff-del); }
.nabi-diff-after .nabi-diff-block[data-diff="changed"] { background: var(--nabi-diff-ins); }
.nabi-diff-block[data-diff="moved"] { background: var(--nabi-diff-move); }
.nabi-diff-block .nabi-diff-del { background: var(--nabi-diff-del-hard); }
.nabi-diff-block .nabi-diff-ins { background: var(--nabi-diff-ins-hard); }
.nabi-diff-focus { outline: 2px solid var(--nabi-accent, #3b6fe0); outline-offset: -2px; }

/* 접기 — 안 바뀐 구간은 숨고, 구간마다 첫 블록이 줄임 표시 한 줄로 남는다. */
/* Fold mode: unchanged spans hide, leaving each span's first block as a one-line ellipsis marker. */
.nabi-diff-only .nabi-diff-cut { display: none; }
.nabi-diff-only .nabi-diff-gap > * { display: none; }
.nabi-diff-only .nabi-diff-gap {
  background: var(--nabi-soft, rgb(0 0 0 / 4.5%));
  padding-block: 0;
}
.nabi-diff-only .nabi-diff-gap::before {
  content: "\\00b7 \\00b7 \\00b7";
  display: block; text-align: center;
  color: var(--nabi-muted, #6b6b76); font-size: .75rem; line-height: 1.5;
}
`;
