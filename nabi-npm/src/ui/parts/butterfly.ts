// 나비 마크 — 저장소의 `assets/nabi-butterfly.svg` 를 그대로 옮긴 사본이다. 모양의 출처는
// 그 파일이고, 이것은 시트 없는 모듈이 물 수 있는 형태다.
//
// **이건 아이콘이 아니라 그림이다.** 아이콘은 `iconSvg` 를 지나 `currentColor` 를 따라가는데
// 이 그림은 겹친 날개의 **투명도 차이**가 곧 내용이라 색을 눌러 버리면 단색 실루엣 하나가 된다.
// 그래서 아이콘 문으로 "고치지" 말 것.
//
// 쓰는 자리: 이 패키지가 자기를 가리키는 마크다. 한때 그림이 아닌 파일을 올릴 때의 자리표시자로도
// 썼는데 걷어냈다 — 그 그림은 올라가는 것이 무엇인지 말해 주지 못했고, 제 크기가 올라가는 것과
// 아무 상관이 없어 문단을 밀어냈다. 그 자리에는 이제 첨부 링크 모양의 상자가 선다.

// 날개 넷 — 아래 날개를 먼저 깔고 위 날개로 덮는다. 겹친 자리에서 톤이 갈려 층이 보인다.
const WINGS = (color: string): string =>
  `<g fill="${color}" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" transform="rotate(-8 16 16)">` +
  '<path d="M14.1 13.2 7.4 16.2 6.3 22.8 10.8 27.4 14.1 22.8z" opacity="0.78"/>' +
  '<path d="M17.9 13.2 24.6 16.2 25.7 22.8 21.2 27.4 17.9 22.8z" opacity="0.4"/>' +
  '<path d="M14.1 6.8 3 1.4 1.9 7.8 6.6 13.2 14.1 17.4z" opacity="1"/>' +
  '<path d="M17.9 6.8 29 1.4 30.1 7.8 25.4 13.2 17.9 17.4z" opacity="0.55"/>' +
  '</g>';

// 화면에 그대로 놓을 조각 — 크기와 색은 시트가 준다(`currentColor` 를 상속받는다).
export const BUTTERFLY_SVG = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">${WINGS('currentColor')}</svg>`;
