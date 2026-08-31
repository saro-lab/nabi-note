// 사전을 안 무는 이유 — 워커 번들에 360KB 번역 전체가 안 딸려오게 하려고다.
// Kept apart from the dictionaries so the edge worker's bundle doesn't drag in ~360KB of translations.
const CODES = [
  'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ur', 'id',
  'fa', 'mr', 'vi', 'te', 'ha', 'tr', 'sw', 'ta', 'th', 'it',
] as const

export type LocaleCode = (typeof CODES)[number]

export const localeCodes: LocaleCode[] = [...CODES]

export const DEFAULT_LOCALE: LocaleCode = 'en'
