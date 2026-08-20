// locale 층의 문 — **하나뿐이다**. 옛 판은 문이 셋이었고(부검 §1-7), 그래서 같은 말이 세 벌
// 살았다. 여기서 나가는 것은 사전 하나와 그 사전을 읽는 함수 하나뿐이다.
//
// 이 층은 의존 순서의 **맨 아래**다 (test/boundaries 의 ORDER). 아무도 안 부르는 잎이 아니라
// "누구나 부를 수 있는" 바닥이라는 뜻이다 — wing 이 자기 버튼 이름을 다국어로 들 수 있는 것도
// 그 덕이다. 이 층은 다른 층을 하나도 안 부른다.
//
// 폴백 규칙도 **하나**다: 요청 로케일 → en → 키 그 자체. 키가 나오면 그것은 사전 구멍의 증거이고
// 화면에서 바로 눈에 띈다(빈 칸으로 조용히 사라지지 않는다).
export { DICTIONARY, LOCALES, RTL_LOCALES, localeDirection } from './dict.js';
export type { Dictionary, LocaleText } from './dict.js';
export { FALLBACK, localeOf, makeTranslator, translate } from './translate.js';
export type { Translator } from './translate.js';
