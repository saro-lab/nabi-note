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
import { fa } from './fa.ts'
import { mr } from './mr.ts'
import { vi } from './vi.ts'
import { te } from './te.ts'
import { ha } from './ha.ts'
import { tr } from './tr.ts'
import { sw } from './sw.ts'
import { ta } from './ta.ts'
import { th } from './th.ts'
import { it } from './it.ts'
import { DEFAULT_LOCALE, localeCodes, type LocaleCode } from './codes.ts'

// 언어 추가는 codes.ts 목록과 이 사전 둘 다 고친다 — satisfies가 어긋나면 타입 검사에서 걸린다.
// Adding a language means editing both codes.ts's list and this map; satisfies catches any drift.
export const messages = { en, ko, ja, zh, de, fr, es, pt, ru, ar, hi, bn, ur, id, fa, mr, vi, te, ha, tr, sw, ta, th, it } satisfies Record<
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
