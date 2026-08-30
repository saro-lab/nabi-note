// 내장 형식의 이름과 아이콘 — 붙여넣기 판에 서는 얼굴이다.
//
// **이름은 영어 고정 대문자다.** 형식의 이름은 번역하는 낱말이 아니라 파일 확장자에 가깝다
// (`HTML`·`MARKDOWN`). 게다가 이 판에서 셋은 나란히 서서 눈으로 견주는 자리라, 말마다 길이가
// 달라지면 줄이 흔들린다. 판의 제목(`io.title`)만 열넷을 다 든다 — 거기가 뜻을 말하는 자리다.
//
// 아이콘 속(16×16 stroke path)만 여기 산다 — 껍데기(`iconSvg`)는 그리는 쪽의 것이고, 이 층은
// DOM 을 모른다. 무늬는 툴바 아이콘과 같은 결이다(채움 없음, 선 굵기는 아래 `MARK_STROKE` 하나).
//
// 넷은 **한 판에 나란히 선다.** 그래서 두 가지가 같아야 한다: 선 굵기 하나(`MARK_STROKE`)와
// 눈에 보이는 크기 — 넷 모두 16×16 안에서 대략 같은 상자(가로 2.2~13.8, 세로 3.4~12.6)를 채운다.
// 어느 하나만 작으면 그 칸만 멀리 있는 것처럼 보인다.

import { NABI_FILE_EXTENSION } from './file.js';

// 나비가 되읽는 html 의 확장자 — **`.html` 이 아니다**(주인 지시 2026-08-23: "html 이 아닌
// nhtml"). 저장은 이 이름으로 나가고, 여는 길은 `.html` 도 계속 받는다(밖에서 온 평범한 html).
// 그 대가와 이득은 `ailog/todo/260823_012_저장_판_다듬기.md` 에 적었다.
export const NHTML_FILE_EXTENSION = '.nhtml';

export const HTML_LABEL = 'HTML';
export const MARKDOWN_LABEL = 'MARKDOWN';
export const TEXT_LABEL = 'TEXT';
export const NABI_LABEL = 'NABI';

// 이 층의 아이콘이 함께 쓰는 선 굵기 — 그리는 쪽이 `iconSvg` 에 그대로 건넨다.
export const MARK_STROKE = 1.4;

// `</>` — 앵글브래킷 둘과 그 사이를 가르는 빗금.
export const HTML_ICON =
  '<path d="M5.8 4.6 2.4 8l3.4 3.4"/><path d="M10.2 4.6 13.6 8l-3.4 3.4"/><path d="M9.3 3.4 6.7 12.6"/>';

// `MD` 두 글자 — 다른 아이콘과 같은 선으로 그린 글자다. 마크다운의 "그림"은 어차피 관습이라,
// 확장자 두 글자가 테두리 안의 화살표보다 빨리 읽힌다.
export const MARKDOWN_ICON = '<path d="M2.2 12V4l2.5 3.6L7.2 4v8"/>' + '<path d="M9.3 12V4h1.7a2.7 4 0 0 1 0 8Z"/>';

// 글자 — 종이 테두리 없이 **글줄만**. 줄 길이가 다른 것이 곧 글이라는 말이다.
export const TEXT_ICON =
  '<path d="M2.6 3.9h10.8"/><path d="M2.6 6.6h10.8"/>' + '<path d="M2.6 9.3h8.2"/><path d="M2.6 12h5.4"/>';

// --- 저장 판의 그림 — **붙여넣기 판의 것을 그대로 쓴다** ---------------------------------------
//
// 한 라운드 앞에서는 "종이 위에 확장자를 적은" 그림 셋을 새로 그렸는데, 주인이 그것을 물렸다
// (2026-08-23): "html 이랑 md 는 붙여넣기 때 쓰던 svg 재활용", "nabi 는 og 에서 쓰이는 나비 마크
// 흑백". 그러니 이 층에 저장 판만의 그림은 **나비 마크 하나**뿐이고, 나머지 둘은 위의 것이다 —
// 한 형식은 한 얼굴로 다니고, 판이 달라도 같은 그림이 같은 것을 가리킨다.

// 나비 마크 — 저장소의 `assets/nabi-butterfly.svg`(파비콘·OG 카드의 그 마스터)를 16×16 아이콘
// 상자에 앉힌 것이다. 색은 하나(`currentColor`)뿐이고 날개의 톤 차이는 **불투명도**로만 난다:
// 색을 둘 쓰면 흑백이 아니게 되고, 톤까지 죽이면 실루엣 하나가 되어 겹친 날개가 사라진다.
//
// **크기는 눈으로 맞춘 값이다.** 이것만 칠(fill) 기반이라, 선 둘(`</>`·`MD`)과 같은 상자를 주면
// 이 칸만 새까맣게 무겁다. 그래서 32 격자를 0.44 로 줄여 가운데 앉혔다 — 실제로 덮는 넓이가
// 옆 둘과 비슷해지는 자리다. 원본 좌표·형태는 한 획도 안 고쳤다(마스터는 저 파일이다).
export const NABI_MARK =
  '<g transform="translate(1 1.7) scale(.44)" fill="currentColor" stroke="currentColor"' +
  ' stroke-width="1.8" stroke-linejoin="round">' +
  '<g transform="rotate(-8 16 16)">' +
  '<path d="M14.1 13.2 7.4 16.2 6.3 22.8 10.8 27.4 14.1 22.8z" opacity="0.82"/>' +
  '<path d="M17.9 13.2 24.6 16.2 25.7 22.8 21.2 27.4 17.9 22.8z" opacity="0.5"/>' +
  '<path d="M14.1 6.8 3 1.4 1.9 7.8 6.6 13.2 14.1 17.4z" opacity="1"/>' +
  '<path d="M17.9 6.8 29 1.4 30.1 7.8 25.4 13.2 17.9 17.4z" opacity="0.64"/>' +
  '</g></g>';

// 저장 형식 하나의 얼굴 — 확장자로 묻는다. 내장 셋만 답이 있고(나비·html·md), 호스트가 끼운
// 형식은 빈 글자다: 판이 그 칸의 그림 자리를 아예 안 만들어 이름 하나가 가운데 선다.
// **확장자로 묻는 까닭**은 필터 id 가 호스트의 것이기 때문이다 — 저장되는 파일의 꼬리는 안 속인다.
// `.nhtml` 은 나비가 되읽는 html 이고 밖에서 온 `.html` 도 같은 것이라, 둘이 한 얼굴을 쓴다.
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

// 나비 — 몸 하나에 날개 둘. 붙여넣기에는 안 서지만 판은 어떤 후보든 받는다.
export const NABI_ICON =
  '<path d="M8 4.2v7.6"/>' +
  '<path d="M8 6C6.4 3.3 2.9 2.9 2.2 4.8c-.7 1.9.6 4.5 3 6 1.4.9 2.5 1 2.8.4"/>' +
  '<path d="M8 6c1.6-2.7 5.1-3.1 5.8-1.2.7 1.9-.6 4.5-3 6-1.4.9-2.5 1-2.8.4"/>';
