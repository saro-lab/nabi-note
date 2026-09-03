// 이것은 아이콘이 아니라 그림이다 — iconSvg를 거쳐 currentColor로 덮으면 겹친 날개의 투명도 차이(진짜 내용)가 단색 실루엣이 된다. 아이콘 문으로 "고치지" 말 것.
// This is art, not an icon — routing it through iconSvg's currentColor would flatten the overlapping wings' opacity differences (the actual content) into a single-color silhouette. Do not "fix" it via the icon path.

// 날개 넷 — 아래 날개를 먼저 깔고 위 날개로 덮는다. 겹친 자리에서 톤이 갈려 층이 보인다.
// Four wings, back ones laid first and covered by the front — the overlap's tone shift is what reads as depth.
const WINGS = (color: string): string =>
  `<g fill="${color}" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" transform="rotate(-8 16 16)">` +
  '<path d="M14.1 13.2 7.4 16.2 6.3 22.8 10.8 27.4 14.1 22.8z" opacity="0.78"/>' +
  '<path d="M17.9 13.2 24.6 16.2 25.7 22.8 21.2 27.4 17.9 22.8z" opacity="0.4"/>' +
  '<path d="M14.1 6.8 3 1.4 1.9 7.8 6.6 13.2 14.1 17.4z" opacity="1"/>' +
  '<path d="M17.9 6.8 29 1.4 30.1 7.8 25.4 13.2 17.9 17.4z" opacity="0.55"/>' +
  '</g>';

// 화면에 그대로 놓을 조각 — 크기와 색은 시트가 준다(currentColor를 상속받는다).
// A ready-to-place piece — sizing and color come from the stylesheet via inherited currentColor.
export const BUTTERFLY_SVG = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">${WINGS('currentColor')}</svg>`;
