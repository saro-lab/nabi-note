// 나비가 방금 낸 조각인가 — 복사·잘라내기의 기억 하나와, 그것을 되돌아온 클립보드 html 과
// 맞대 보는 순수 판정.
//
// **기억은 전역이다.** 클립보드 자체가 전역이라서다: 편집기 A 에서 잘라 편집기 B 에 붙이는
// 걸음도, 한 번 잘라 열 번 붙이는 걸음도 같은 한 벌의 글자를 나눠 쓴다. 인스턴스마다 기억을
// 두면 그 두 걸음이 다 깨진다. 층도 이 자리를 허락한다 — 모듈 최상위 가변 상태를 막는
// 경계 그물의 목록(`schema`~`wings`)에 `surface` 는 안 든다.
//
// **기억은 소비되지 않는다.** 붙여넣기가 기억을 지우면 두 번째 붙여넣기부터 판이 뜬다.
// 지우는 것은 다음 복사·잘라내기뿐이고, 밖에서 새로 복사하면 되돌아오는 글자가 달라져
// 저절로 일반 흐름으로 간다.
//
// **왜 글자를 그대로 안 맞대나.** 우리가 DOM 에서 뜬 조각과 브라우저가 되돌려 주는
// `text/html` 은 같은 글자가 아니다: 크롬은 `<meta charset>` 과 `StartFragment`·`EndFragment`
// 주석을 두르고, 사파리는 `<html><body>` 를 씌우며, 둘 다 보이는 모양을 지키려고 조각에
// 없던 `style=` 을 덧입힐 때가 있다. 부분 선택이면 조상 태그(`<ul>`·`<table>`)까지 얹어 준다.
// 그래서 판정을 세 겹으로 눕힌다 — 아래 `sameClip`.
//
// **그래서 `style` 도 포장으로 센다.** 우리 조립은 인라인 `style` 을 한 글자도 안 낸다
// (`html/builders.ts`: "저장값은 무엇인가를 속성으로 말하고, 어떻게 보이는지는 시트가 말한다").
// 그러니 되돌아온 html 의 `style=` 은 100% 브라우저가 덧입힌 것이다. 이것이 없으면 마크가
// 하나라도 걸린 부분 선택(파일링크·형광펜)이 ①②를 다 어긋나 판이 떴다 (260823_008).

// 클립보드가 두르는 껍데기 — 값이 아니라 포장이다. 걷어 내고 본다.
const WRAPPERS: readonly RegExp[] = [
  /<!--[\s\S]*?-->/g, // StartFragment · EndFragment
  /<meta\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<style\b[^>]*>[\s\S]*?<\/style>/gi,
  /<\/?(?:html|head|body)(?:\s[^>]*)?>/gi,
  /\s+style="[^"]*"/gi,
  /\s+style='[^']*'/gi, // 사파리·일부 안드로이드가 홑따옴표를 쓴다
];

// 나비 편집기 DOM 의 지문 — `data-key`(=`_id`)는 문단 급 이상에 늘 붙는다(`html/render.ts`).
// 밖에서 온 html 이 이 표식을 들고 있을 일은 사실상 없다.
const NABI_MARK = /\sdata-key="/;

// 빈 태그의 닫는 빗금 — `<br/>` 와 `<br>` 는 같은 것이다. 우리 조립은 빗금을 적고
// (`html/render.ts`: XML·XHTML 도 읽는 한 표기) 브라우저의 직렬화는 안 적으므로, 이 하나가
// 남으면 우리가 실은 글자와 되돌아온 글자가 갈린다 — 빈 문단 하나를 함께 싣는 첨부 조각이
// 정확히 그 자리에 걸린다 (260823_010).
const SELF_CLOSE = /\s*\/>/g;

// 포장 걷기 + 공백 한 벌로 — 양쪽에 똑같이 걸므로 느슨해지는 만큼만 느슨해진다.
export function normalizeClipHtml(html: string): string {
  let out = html;
  for (const noise of WRAPPERS) out = out.replace(noise, '');
  return out.replace(SELF_CLOSE, '>').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

// 태그를 다 걷은 맨 글자 — 브라우저가 조각에 스타일을 덧입혔을 때 남는 마지막 잣대다.
export function clipText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 나비에서 온 html 인가 — 맨 글자 잣대가 홀로 서지 않게 받치는 짝이다.
export function fromNabi(html: string): boolean {
  return NABI_MARK.test(html);
}

// 맞대 볼 만한 알맹이가 있나 — 글자든 나비 표식이든 하나는 있어야 한다. 받침 `<br/>` 하나
// 같은 껍데기끼리 "품는다"로 걸려 엉뚱한 붙여넣기가 나는 것을 여기서 막는다.
function substantial(html: string): boolean {
  return clipText(html) !== '' || fromNabi(html);
}

// 기억과 같은 것이 돌아왔나 — 세 겹이다.
//
//  ① 포장을 걷으면 같다 — 가장 흔한 자리.
//  ② 한쪽이 다른 쪽을 **품는다** — 브라우저가 조상 태그를 얹어 줬거나(부분 선택), 거꾸로
//     되돌려 준 것이 우리 조각보다 좁을 때. 포함이면 같은 것으로 본다.
//  ③ 맨 글자가 같고 **되돌아온 것이 나비 표식을 들었다** — 스타일이 덧입혀져 ①·②가 어긋난
//     자리를 여기서 잡는다. 표식을 함께 요구하는 까닭은 밖에서 같은 글자를 복사했을 때
//     엉뚱하게 걸리지 않게 하기 위해서다.
export function sameClip(memory: string, html: string): boolean {
  if (memory === '' || html === '') return false;
  const a = normalizeClipHtml(memory);
  const b = normalizeClipHtml(html);
  if (!substantial(a) || !substantial(b)) return false;
  if (a === b || b.includes(a) || a.includes(b)) return true;
  const text = clipText(a);
  return text !== '' && text === clipText(b) && fromNabi(b);
}

// --- 전역 기억 ---------------------------------------------------------------------------------
let lastClip = '';

export function rememberClip(html: string): void {
  lastClip = html;
}

export function clipMemory(): string {
  return lastClip;
}

// 그물이 판 사이를 가르는 문 — 실기에서 부를 자리는 없다.
export function forgetClip(): void {
  lastClip = '';
}
