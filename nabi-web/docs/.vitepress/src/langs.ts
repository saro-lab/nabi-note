import { computed, type ComputedRef } from 'vue'
import { useData } from 'vitepress'
import {
  DEFAULT_LOCALE,
  localeCodes,
  localeNames,
  messages,
  type LocaleCode,
  type MessageKey,
} from '../locales/index.ts'
import { shuffle } from './util.ts'

const LANG_COOKIE = 'lang'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const languageList = localeNames

function isLocaleCode(code: string): code is LocaleCode {
  return (localeCodes as string[]).includes(code)
}

export function languageRandom(): [LocaleCode, string][] {
  return shuffle(Object.entries(localeNames) as [LocaleCode, string][])
}

export function localeFromPath(path: string): LocaleCode {
  const code = path.split('/')[1] || ''
  return isLocaleCode(code) ? code : DEFAULT_LOCALE
}

export function translate(lang: string, key: string): string {
  const dict = (isLocaleCode(lang) ? messages[lang] : messages[DEFAULT_LOCALE]) as Record<string, string>
  const fallback = messages[DEFAULT_LOCALE] as Record<string, string>
  return dict[key] || fallback[key] || key
}

export function useTranslate(): { t: (key: MessageKey | string) => string } {
  const { lang } = useData()
  return { t: (key) => translate(lang.value, key as string) }
}

// Empty string at the root locale, so callers can concatenate without a special case
// 루트 로케일이면 빈 문자열이라 부르는 쪽이 그냥 이어 붙이면 된다
export function useRoot(): ComputedRef<string> {
  const { localeIndex } = useData()
  return computed(() => (localeIndex.value === 'root' ? '' : `/${localeIndex.value}`))
}

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}

// Cookie first, then the browser's languages, then the default
// 쿠키 → 브라우저 언어 → 기본값 순으로 고른다
function preferredLanguage(): LocaleCode {
  const saved = readCookie(LANG_COOKIE)
  if (isLocaleCode(saved)) {
    return saved
  }
  for (const tag of navigator.languages || [navigator.language]) {
    const code = (tag || '').split('-')[0]
    if (isLocaleCode(code)) {
      return code
    }
  }
  return DEFAULT_LOCALE
}

function getLanguage(): string {
  const code = location.pathname.split('/')[1] || ''
  return isLocaleCode(code) ? code : ''
}

function pathWithoutLanguage(): string {
  const segments = location.pathname.split('/')
  if (isLocaleCode(segments[1] || '')) {
    segments.splice(1, 1)
  }
  return segments.join('/') || '/'
}

// `force` means the user picked it, so it goes into history; auto-detection replaces instead
// `force` 는 사용자가 직접 고른 것이라 히스토리에 남기고, 자동 판별은 replace 한다
export function applyLanguage(force: string = ''): void {
  const lang = force || getLanguage() || preferredLanguage()
  writeCookie(LANG_COOKIE, lang)

  const rest = pathWithoutLanguage()
  const target = `/${lang}${rest === '/' ? '/' : rest}`
  if (location.pathname === target) {
    return
  }
  const url = target + location.search + location.hash
  if (force) {
    location.href = url
  } else {
    location.replace(url)
  }
}
