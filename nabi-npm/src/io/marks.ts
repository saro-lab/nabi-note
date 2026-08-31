// 이름은 영어 고정 대문자다 — 번역하면 셋이 나란히 선 줄의 길이가 흔들린다. 아이콘 속(16x16 path)만 여기 살고,
// 넷 모두 같은 선 굵기(MARK_STROKE)와 눈에 보이는 크기를 맞춰 어느 하나만 멀어 보이지 않게 한다.
// Names are fixed English caps — translating would jitter the row where they stand side by side; icon paths (16x16) live here, all four sharing one stroke width (MARK_STROKE) and a matched visual size so none reads as farther away.

import { NABI_FILE_EXTENSION } from './file.js';

// `.html`이 아니라 `.nhtml`이다(주인 지시 2026-08-23) — 저장은 이 이름으로, 열기는 `.html`도 그대로 받는다.
// 자세한 대가와 이득은 ailog/todo/260823_012_저장_판_다듬기.md.
// Saves as `.nhtml`, not `.html` (owner's call, 2026-08-23); opening still accepts plain `.html` too. Tradeoffs recorded in ailog/todo/260823_012_저장_판_다듬기.md.
export const NHTML_FILE_EXTENSION = '.nhtml';

export const HTML_LABEL = 'HTML';
export const MARKDOWN_LABEL = 'MARKDOWN';
export const TEXT_LABEL = 'TEXT';
export const NABI_LABEL = 'NABI';

export const MARK_STROKE = 1.4;

export const HTML_ICON =
  '<path d="M5.8 4.6 2.4 8l3.4 3.4"/><path d="M10.2 4.6 13.6 8l-3.4 3.4"/><path d="M9.3 3.4 6.7 12.6"/>';

// MD 두 글자로 그린다 — 관습적인 화살표-테두리 그림보다 확장자 글자가 더 빨리 읽힌다.
// Drawn as the letters "MD" — reads faster than the conventional arrow-in-border icon.
export const MARKDOWN_ICON = '<path d="M2.2 12V4l2.5 3.6L7.2 4v8"/>' + '<path d="M9.3 12V4h1.7a2.7 4 0 0 1 0 8Z"/>';

// 종이 테두리 없이 글줄만 그린다 — 줄 길이가 들쭉날쭉한 것 자체가 "글"이라는 뜻이다.
// No paper border, just lines of varying length — the unevenness itself reads as text.
export const TEXT_ICON =
  '<path d="M2.6 3.9h10.8"/><path d="M2.6 6.6h10.8"/>' + '<path d="M2.6 9.3h8.2"/><path d="M2.6 12h5.4"/>';

// 저장 판 전용 그림은 나비 마크 하나뿐 — html·md는 붙여넣기 판의 그림을 그대로 재활용한다(주인 지시 2026-08-23).
// Only the nabi mark is exclusive to the save panel — html/md reuse the paste panel's icons as-is (owner's call, 2026-08-23).

// `assets/nabi-butterfly.svg`(파비콘·OG의 마스터)를 그대로 앉힌다. 색은 currentColor 하나뿐이고 날개 톤 차이는
// 불투명도로만 낸다 — 크기(scale .44)는 선 아이콘들과 시각적 무게를 맞추려고 눈대중으로 잡은 값이다.
// Places the master `assets/nabi-butterfly.svg` (favicon/OG) as-is: one currentColor, wing-tone variation via opacity alone; the .44 scale is eyeballed to match the stroke icons' visual weight.
export const NABI_MARK =
  '<g transform="translate(1 1.7) scale(.44)" fill="currentColor" stroke="currentColor"' +
  ' stroke-width="1.8" stroke-linejoin="round">' +
  '<g transform="rotate(-8 16 16)">' +
  '<path d="M14.1 13.2 7.4 16.2 6.3 22.8 10.8 27.4 14.1 22.8z" opacity="0.82"/>' +
  '<path d="M17.9 13.2 24.6 16.2 25.7 22.8 21.2 27.4 17.9 22.8z" opacity="0.5"/>' +
  '<path d="M14.1 6.8 3 1.4 1.9 7.8 6.6 13.2 14.1 17.4z" opacity="1"/>' +
  '<path d="M17.9 6.8 29 1.4 30.1 7.8 25.4 13.2 17.9 17.4z" opacity="0.64"/>' +
  '</g></g>';

// 확장자로 묻는다(필터 id는 호스트의 것이라 안 믿는다) — 내장 셋만 그림이 있고 호스트 형식은 빈 글자(이름만 가운데 선다).
// Keyed by extension, not filter id (that's the host's to name) — only the builtin three get an icon; a host format falls back to its label alone.
export function saveMark(extension: string): string {
  switch (extension.toLowerCase()) {
    case NABI_FILE_EXTENSION:
      return NABI_MARK;
    case NHTML_FILE_EXTENSION:
    case '.html':
      return HTML_ICON;
    case '.md':
      return MARKDOWN_ICON;
    default:
      return '';
  }
}

// 붙여넣기 후보로는 안 서지만(nabi 필터는 paste가 없다), 판 자체는 어떤 후보든 받는 범용 그림이다.
// Never offered as a paste candidate (the nabi filter has no paste), but usable as a generic icon anywhere the panel takes one.
export const NABI_ICON =
  '<path d="M8 4.2v7.6"/>' +
  '<path d="M8 6C6.4 3.3 2.9 2.9 2.2 4.8c-.7 1.9.6 4.5 3 6 1.4.9 2.5 1 2.8.4"/>' +
  '<path d="M8 6c1.6-2.7 5.1-3.1 5.8-1.2.7 1.9-.6 4.5-3 6-1.4.9-2.5 1-2.8.4"/>';
