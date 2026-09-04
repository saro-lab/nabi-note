import type { LocaleCode } from '../locales/codes.ts'

// 서체 wing은 갈래만 고른다. 펜글씨는 로케일과 떼고, 본문 보조 글꼴만 현재 문자권별로 붙인다.
// The typeface wing picks only a genus. Handwriting is locale-independent; only body fallbacks follow the current script.
const FONT_GROUPS = {
  cursive: [
    'Caveat:wght@400..700',
    'Gaegu:wght@300;400;700',
    'Hachi+Maru+Pop',
    'Zhi+Mang+Xing',
    'Noto+Nastaliq+Urdu:wght@400..700',
    'Kalam:wght@400;700',
    'Atma:wght@300;400;500;600;700',
    'Gurajada',
    'Kavivanar',
    'Mali:wght@400;700',
  ],
  ko: ['Noto+Sans+KR:wght@400..700', 'Noto+Serif+KR:wght@400..700'],
  ja: ['Noto+Sans+JP:wght@400..700', 'Noto+Serif+JP:wght@400..700'],
  zh: ['Noto+Sans+SC:wght@400..700', 'Noto+Serif+SC:wght@400..700'],
  arabic: [
    'Noto+Sans+Arabic:wght@400..700',
    'Noto+Naskh+Arabic:wght@400..700',
  ],
  devanagari: [
    'Noto+Sans+Devanagari:wght@400..700',
    'Noto+Serif+Devanagari:wght@400..700',
  ],
  bengali: [
    'Noto+Sans+Bengali:wght@400..700',
    'Noto+Serif+Bengali:wght@400..700',
  ],
  telugu: ['Noto+Sans+Telugu:wght@400..700', 'Noto+Serif+Telugu:wght@400..700'],
  tamil: ['Noto+Sans+Tamil:wght@400..700', 'Noto+Serif+Tamil:wght@400..700'],
  thai: ['Noto+Sans+Thai:wght@400..700', 'Noto+Serif+Thai:wght@400..700'],
} as const

type FontGroup = keyof typeof FONT_GROUPS
type BodyFontGroup = Exclude<FontGroup, 'cursive'>

const LOCALE_FONT_GROUP = {
  en: null,
  ko: 'ko',
  ja: 'ja',
  zh: 'zh',
  de: null,
  fr: null,
  es: null,
  pt: null,
  ru: null,
  ar: 'arabic',
  hi: 'devanagari',
  bn: 'bengali',
  ur: 'arabic',
  id: null,
  fa: 'arabic',
  mr: 'devanagari',
  vi: null,
  te: 'telugu',
  ha: null,
  tr: null,
  sw: null,
  ta: 'tamil',
  th: 'thai',
  it: null,
} as const satisfies Record<LocaleCode, BodyFontGroup | null>

const LINK_ID_PREFIX = 'nabi-editor-fonts-'

// Google Fonts는 CSS 안에서 unicode-range로 다시 자른다. 여기서는 CSS 요청도 문자권별로 갈라 한 데모가 지원 언어 전체를 받지 않게 한다.
// Google Fonts splits files again with unicode-range. Splitting the CSS requests here keeps one demo from fetching every supported script's @font-face list.
function editorFontHref(group: FontGroup): string {
  return `https://fonts.googleapis.com/css2?${FONT_GROUPS[group]
    .map((family) => `family=${family}`)
    .join('&')}&display=swap`
}

function loadFontGroup(group: FontGroup): void {
  const id = `${LINK_ID_PREFIX}${group}`
  if (document.getElementById(id)) return

  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = editorFontHref(group)
  link.media = 'print'
  link.onload = () => {
    link.media = 'all'
    link.onload = null
  }
  document.head.append(link)
}

// 펜글씨 한 벌은 로케일과 상관없이 붙인다. 무거운 본문 보조 글꼴만 현재 페이지나 언어 칩의 문자권을 따른다.
// The handwriting sheet is locale-independent. Only the heavier body fallbacks follow the page or selected chip's script.
export function loadEditorFonts(locale: string): void {
  if (typeof document === 'undefined') return

  loadFontGroup('cursive')
  const bodyGroup = LOCALE_FONT_GROUP[locale as LocaleCode]
  if (bodyGroup) loadFontGroup(bodyGroup)
}
