// 말 하나를 고르는 규칙은 이 파일이 전부다 — 요청 로케일→en→키, 세 걸음뿐이고 중간 문이 없다. `ko-KR`처럼 나라가 붙어도 언어(`ko`)만 보고, 자리표({name})는 못 채우면 그대로 남긴다(비우면 문장이 조용히 망가진다).
// This file is the whole rule for picking one piece of text — requested locale, then en, then the key, three steps with no side doors. A regional tag like `ko-KR` only looks at the language part (`ko`); an unfilled placeholder (`{name}`) is left as-is rather than blanked, since blanking would silently break the sentence.
import { DICTIONARY, type Dictionary, type LocaleText } from './dict.js';
import { FALLBACK_LOCALE, normalizedLocale } from './normalize.js';
import { localeValue, type LocaleInput } from './state.js';

// 마지막 보루 — 이 언어에 없으면 여기를 본다. 여기에도 없으면 키가 나온다.
// The last resort — checked when the requested language has no entry; if even this is missing, the key itself is shown.
export const FALLBACK = FALLBACK_LOCALE;

// `ko-KR`·`KO` → `ko`. 모양이 아니면 en 으로 떨어진다.
// `ko-KR`/`KO` normalize to `ko`; anything the wrong shape falls back to en.
export function localeOf(raw: string | undefined | null): string {
  return normalizedLocale(raw);
}

function fill(text: string, vars: Readonly<Record<string, string | number>> | undefined): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = vars[name];
    return value === undefined ? whole : String(value);
  });
}

// 폴백 규칙 하나 — 사전과 로케일 레코드가 같은 규칙을 지난다.
// One fallback rule shared by both the dictionary and locale records.
function pick(entry: LocaleText | undefined, locale: string): string | undefined {
  if (!entry) return undefined;
  return entry[locale] ?? entry[FALLBACK];
}

// 다국어 레코드 하나에서 말 고르기 — wing 의 `label` 이 이 길을 지난다.
// Picks text from one multilingual record — a wing's `label` goes through this path.
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
  // The key itself is the final answer — a gap becomes visible on screen.
  return fill(text ?? key, vars);
}

export interface Translator {
  readonly locale: string;
  onChange?(listener: () => void): () => void;
  // 말 하나 — 없으면 en, 그것도 없으면 키.
  // One piece of text — falls to en, then to the key.
  t(key: string, vars?: Readonly<Record<string, string | number>>): string;
  // 다국어 레코드(버튼 label 류) 하나 — 없으면 fallbackKey 로 사전을 본다.
  // One multilingual record (e.g. a button's label) — falls back to the dictionary via fallbackKey when absent.
  pick(entry: LocaleText | undefined, fallbackKey: string): string;
}

// 번역기 하나 — 호스트가 자기 사전을 얹을 수 있다(같은 키는 얹은 쪽이 이긴다).
// One translator — a host can layer in its own dictionary; on a key collision, the host's entry wins.
export function makeTranslator(rawLocale?: LocaleInput, extra?: Dictionary): Translator {
  const locale = (): string => localeOf(localeValue(rawLocale));
  const dictionary: Dictionary = extra ? { ...DICTIONARY, ...extra } : DICTIONARY;
  return {
    get locale() {
      return locale();
    },
    ...(rawLocale && typeof rawLocale === 'object'
      ? { onChange: (listener: () => void) => rawLocale.onChange(listener) }
      : {}),
    t: (key, vars) => translate(key, locale(), dictionary, vars),
    pick: (entry, fallbackKey) => fromRecord(entry, locale()) ?? translate(fallbackKey, locale(), dictionary),
  };
}
