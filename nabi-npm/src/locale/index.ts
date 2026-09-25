// locale 층의 문은 하나뿐이다 — 옛 판은 문이 셋이라 같은 말이 세 벌 살았다. 이 층은 의존 순서의 맨 아래(다른 층을 하나도 안 부른다)라 wing도 자기 버튼 이름을 다국어로 들 수 있고, 폴백은 요청 로케일→en→키 하나뿐이라 구멍이 나면 화면에서 바로 보인다.
// A single door out of the locale layer — the old version had three, so the same text lived in three copies. This layer sits at the very bottom of the dependency order (calling nothing else), which is why even a wing can hold its own multilingual button names; the one fallback rule is requested locale to en to the key itself, so a missing entry shows up on screen instead of vanishing quietly.
export { DICTIONARY, LOCALES, RTL_LOCALES, localeDirection } from './dict.js';
export type { Dictionary, LocaleText } from './dict.js';
export { FALLBACK, localeOf, makeTranslator, translate } from './translate.js';
export type { Translator } from './translate.js';
export { createLocale, localeValue } from './state.js';
export type { LocaleController, LocaleInput, LocaleSource } from './state.js';
