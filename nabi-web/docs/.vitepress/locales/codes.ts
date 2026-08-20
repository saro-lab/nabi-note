// 언어 코드만 따로 사는 곳 — **사전(`index.ts`)을 물지 않는다.**
// 엣지 워커(`worker/index.ts`)가 로케일을 가리려면 이 목록이 필요한데, 사전을 물면 열네 말의
// 번역 전문(360KB 남짓)이 워커 번들에 통째로 딸려 온다. 목록만 여기 두면 워커는 이 한 줄만 문다.
// 언어를 늘리면 이 목록과 `index.ts` 의 사전 **둘 다** 고친다 — 한쪽만 고치면
// `index.ts` 의 `satisfies` 가 타입 검사에서 걸어 준다.
//
// Locale codes live apart from the dictionaries so the edge worker can import the list without
// dragging ~360KB of translations into its bundle. Adding a language means editing this list and
// the `messages` map in `index.ts`; the `satisfies` there fails the typecheck if they drift.
const CODES = ['en', 'ko', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ur', 'id'] as const

export type LocaleCode = (typeof CODES)[number]

export const localeCodes: LocaleCode[] = [...CODES]

export const DEFAULT_LOCALE: LocaleCode = 'en'
