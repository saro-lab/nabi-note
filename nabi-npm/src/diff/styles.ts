// --- 시트 --------------------------------------------------------------------------------------
import { acquireStyleSheet } from '../lifecycle.js';
import { MOTION_PRESS_MS, Z_DIFF_FULLSCREEN } from '../style/tokens.js';

export function ensureCss(doc: Document): () => void {
  return acquireStyleSheet(doc, DIFF_CSS, { name: 'data-nabi-diff' });
}

// `--nabi-*` 토큰을 대체값과 함께 부른다 — 편집기 시트(`nabi.css`) 없이 홀로 설 때도 옷이 있다.
// 다크 판정은 코어와 같은 두 길이다: 호스트의 `.dark` 클래스, 또는 `data-nabi-theme`.
export const DIFF_CSS = `
.nabi-diff {
  --nabi-motion-press: ${MOTION_PRESS_MS}ms;
  --nabi-z-diff-fullscreen: ${Z_DIFF_FULLSCREEN};
  --nabi-diff-del: rgb(217 59 59 / 12%);
  --nabi-diff-del-hard: rgb(217 59 59 / 30%);
  --nabi-diff-ins: rgb(22 163 74 / 12%);
  --nabi-diff-ins-hard: rgb(22 163 74 / 30%);
  --nabi-diff-move: rgb(59 111 224 / 12%);
  --nabi-diff-move-hard: rgb(59 111 224 / 30%);
  /* 커넥터 선 전용 — **불투명**이다. 반투명이면 같은 색 선이 겹친 자리가 진해져 여러 선으로
     읽힌다(주인 지시 2026-08-25: 겹쳐도 녹색은 녹색 하나, 빨강은 빨강 하나). 바탕에 미리
     섞어 두면 겹침이 안 보인다. 섞는 비율은 블록 배경(위 12%·14% 알파)과 **같은 값**이다 —
     블록의 연한 색이 패인 끝에서 선으로 그대로 이어진다(주인 지시: 그 연한 상태로 라인까지). */
  --nabi-diff-line-del: color-mix(in srgb, rgb(217 59 59) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(22 163 74) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-move: color-mix(in srgb, rgb(59 111 224) 12%, var(--nabi-bg, #fff));
  /* "있었을 자리" 2px 줄 전용 — 연한 선 색으로는 두 픽셀이 안 보여서 한 단계 진하게. */
  --nabi-diff-mark-del: color-mix(in srgb, rgb(217 59 59) 30%, var(--nabi-bg, #fff));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(22 163 74) 30%, var(--nabi-bg, #fff));
  display: flex; flex-direction: column; gap: .375rem;
  color: var(--nabi-fg, #1b1b1f);
}
:where(html, body).dark .nabi-diff:not([data-nabi-theme="light"]),
.nabi-diff[data-nabi-theme="dark"] {
  /* 표준 토큰도 제 몸에 든다 — 이 층은 편집기(.nabi) 밖(body·홀로 선 자리)에 설 수 있어
     상속이 안 닿는다(scrim 이 제 몸에 토큰을 드는 그 규칙). 실측 2026-08-26: 다크 페이지에서
     패인만 흰색으로 남았다 — 패인의 var(--nabi-bg, #fff) 가 대체값으로 떨어져서다. */
  color-scheme: dark;
  --nabi-fg: #e8e8ee; --nabi-bg: #16161a; --nabi-muted: #9a9aa6; --nabi-line: #2e2e36;
  --nabi-accent: #7ea2ff; --nabi-soft: rgb(255 255 255 / 7%);
  /* 다크의 기조색 — **흰색 쪽으로 밝히고 채도를 뺀** 파스텔이다(주인 지시 2026-08-26, 두 차례:
     "밝기 올리고 채도 빼기" → "더 흰색에 가깝게, 묻혀서 안 보인다"). 어두운 바탕에서 칠이
     보이는 것은 색상이 아니라 **밝기 차**라, 알파도 한 단계 올렸다. 이음선(line)의 혼합비는
     블록 알파와 같은 값이어야 한다 — 다르면 패인 끝에서 색이 이어지다 톤이 갈린다. */
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
.nabi-diff-pane::-webkit-scrollbar { inline-size: .625rem; block-size: .625rem; }
.nabi-diff-pane::-webkit-scrollbar-track { background: transparent; }
.nabi-diff-pane::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--nabi-fg, #1b1b1f) 26%, transparent);
  border-radius: .3125rem;
}
.nabi-diff-pane { scrollbar-width: thin; }
/* 좌우 여백이 없다 — 색 블록이 패인의 양 끝까지 닿아, 거터의 이음선과 한 몸으로 이어진다
   (주인 지시 2026-08-25: 좌우 패딩·앞 보더를 걷고 연한 색으로 라인까지 연결).
   폭은 패인 그대로다 — 옛 판의 \`inline-size: max-content\` 는 **문단의 줄바꿈을 죽여서**
   (max-content 는 글을 한 줄로 잰다) 문서가 패인의 여덟 배(실측 1855px/패인 223px)로 터졌고
   그림·영상의 % 폭 표식도 기준을 잃었다(주인 신고 2026-08-25). 패인 폭이 기준이면 글은
   줄바꿈하고, %는 살아나고, 넓은 표는 제 스크롤 겉옷(.nabi-scroll) 안에서 구른다. */
.nabi-diff-doc { padding: .75rem 0; box-sizing: border-box; }

.nabi-diff-gutter { position: relative; overflow: hidden; background: var(--nabi-soft, rgb(0 0 0 / 4.5%)); }
.nabi-diff-gutter svg { position: absolute; inset: 0; display: block; }
/* 선은 소속 색 그대로다 — 지움(빨강)·추가(초록)·이동(파랑), changed 는 왼쪽 빨강에서 오른쪽
   초록으로 가는 그라디언트(색 정지점만 여기, 마운트별 id 를 무는 fill 은 JS 인라인).
   테두리(stroke)는 걷었다 — 겹친 선 속에서 남의 몸 위로 금을 그어, "선 하나" 로 안 보인다. */
.nabi-diff-line { stroke: none; }
.nabi-diff-line-removed { fill: var(--nabi-diff-line-del); }
.nabi-diff-line-added { fill: var(--nabi-diff-line-ins); }
.nabi-diff-line-moved { fill: var(--nabi-diff-line-move); }
.nabi-diff-stop-del { stop-color: var(--nabi-diff-line-del); }
.nabi-diff-stop-ins { stop-color: var(--nabi-diff-line-ins); }

/* 반대쪽 패인의 "있었을 자리" 한 줄 — 추가는 왼쪽(before)에 초록, 지움은 오른쪽(after)에 빨강.
   이음선과 같은 불투명 토큰이라 거터의 선이 이 줄로 이어져 보이고, 같은 자리에 여러 개가
   겹쳐도(이웃한 추가 여럿) 한 줄로 보인다. */
.nabi-diff-mark { position: absolute; inset-inline: 0; block-size: 2px; pointer-events: none; }
.nabi-diff-mark-added { background: var(--nabi-diff-mark-ins); }
.nabi-diff-mark-removed { background: var(--nabi-diff-mark-del); }

/* 전체화면 판 — diff wing 의 단추가 여는 화면이다. 편집기 밖(body)에 서므로 색은 대체값과
   다크 갈래를 제 몸에 든다(맨 위 토큰 블록과 같은 규칙). */
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
.nabi-diff-screen-host { flex: 1; min-block-size: 0; }
.nabi-diff-screen-host .nabi-diff { block-size: 100%; }
.nabi-diff-screen-host .nabi-diff-body { flex: 1; min-block-size: 0; grid-template-rows: minmax(0, 1fr); }
.nabi-diff-screen-host .nabi-diff-pane { block-size: auto; }

.nabi-diff-block { padding: .125rem 0; }
/* 블록 껍데기가 문단의 직계 자리를 차지하므로 UA 기본 여백을 속에서 걷는다 —
   문단 사이 간격은 nabi.css 의 \`.nabi-content > *\` 가 껍데기에 그대로 준다. */
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
