// 말 하나를 고르는 규칙 — 이 파일이 규칙의 전부다.
//
//   요청 로케일 → en → 키
//
// 세 걸음뿐이고 중간에 다른 문이 없다. `ko-KR` 처럼 나라가 붙어 오면 앞의 언어(`ko`)만 본다
// 사전은 언어 단위로 산다. 자리표(`{name}`)는 넘긴 값으로 바꾸고, 못 채운 자리는 그대로 둔다
// (빈 칸으로 지우면 문장이 조용히 망가진다).
import { DICTIONARY, type Dictionary, type LocaleText } from './dict.js';

// 마지막 보루 — 이 언어에 없으면 여기를 본다. 여기에도 없으면 키가 나온다.
export const FALLBACK = 'en';

// `ko-KR`·`KO` → `ko`. 모양이 아니면 en 으로 떨어진다.
export function localeOf(raw: string | undefined | null): string {
  if (typeof raw !== 'string') return FALLBACK;
  const head = raw.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return /^[a-z]{2,3}$/.test(head) ? head : FALLBACK;
}

function fill(text: string, vars: Readonly<Record<string, string | number>> | undefined): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = vars[name];
    return value === undefined ? whole : String(value);
  });
}

// 폴백 규칙 하나 — 사전과 로케일 레코드가 같은 규칙을 지난다.
function pick(entry: LocaleText | undefined, locale: string): string | undefined {
  if (!entry) return undefined;
  return entry[locale] ?? entry[FALLBACK];
}

// 다국어 레코드 하나에서 말 고르기 — wing 의 `label` 이 이 길을 지난다.
export function fromRecord(entry: LocaleText | undefined, locale: string): string | undefined {
  return pick(entry, localeOf(locale));
}

export function translate(
  key: string,
  locale: string,
  dictionary: Dictionary = DICTIONARY,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const text = pick(dictionary[key], localeOf(locale));
  // 키 그 자체가 마지막 답이다 — 구멍이 화면에서 보인다.
  return fill(text ?? key, vars);
}

export interface Translator {
  readonly locale: string;
  // 말 하나 — 없으면 en, 그것도 없으면 키.
  t(key: string, vars?: Readonly<Record<string, string | number>>): string;
  // 다국어 레코드(버튼 label 류) 하나 — 없으면 fallbackKey 로 사전을 본다.
  pick(entry: LocaleText | undefined, fallbackKey: string): string;
}

// 번역기 하나 — 호스트가 자기 사전을 얹을 수 있다(같은 키는 얹은 쪽이 이긴다).
export function makeTranslator(rawLocale?: string, extra?: Dictionary): Translator {
  const locale = localeOf(rawLocale);
  const dictionary: Dictionary = extra ? { ...DICTIONARY, ...extra } : DICTIONARY;
  return {
    locale,
    t: (key, vars) => translate(key, locale, dictionary, vars),
    pick: (entry, fallbackKey) => fromRecord(entry, locale) ?? translate(fallbackKey, locale, dictionary),
  };
}
