import { en } from './en.ts'
import { ko } from './ko.ts'
import { ja } from './ja.ts'
import { zh } from './zh.ts'
import { de } from './de.ts'
import { fr } from './fr.ts'
import { es } from './es.ts'
import { pt } from './pt.ts'
import { ru } from './ru.ts'
import { ar } from './ar.ts'
import { hi } from './hi.ts'
import { bn } from './bn.ts'
import { ur } from './ur.ts'
import { id } from './id.ts'
import { DEFAULT_LOCALE, localeCodes, type LocaleCode } from './codes.ts'

// 언어를 늘리는 자리는 둘이다 — `codes.ts` 의 목록과 여기의 사전. 언어 이름(`localeNames`)과
// VitePress 로케일은 그 둘에서 따라온다. `satisfies` 가 둘을 맞춰 보므로 한쪽에만 적으면
// 타입 검사에서 걸린다. 목록을 떼어 둔 까닭은 `codes.ts` 에 적어 두었다.
// Two places to add a language: the list in `codes.ts` and this map. `satisfies` keeps them in step.
export const messages = { en, ko, ja, zh, de, fr, es, pt, ru, ar, hi, bn, ur, id } satisfies Record<
  LocaleCode,
  unknown
>

export type Messages = typeof en
export type MessageKey = keyof Messages

export { DEFAULT_LOCALE, localeCodes, type LocaleCode }

export const localeNames = Object.fromEntries(
  localeCodes.map((code) => [code, messages[code].label]),
) as Record<LocaleCode, string>

export const vitepressLocales = {
  root: messages[DEFAULT_LOCALE],
  ...messages,
}
