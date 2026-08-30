const localeOrder = [
  'en', 'ko', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ur', 'id',
  'fa', 'mr', 'vi', 'te', 'ha', 'tr', 'sw', 'ta', 'th', 'it',
] as const

type LocaleCode = (typeof localeOrder)[number]
type TypefaceKind = 'sans' | 'serif' | 'mono' | 'cursive'

const labels: Record<LocaleCode, Record<TypefaceKind, string>> = {
  en: { sans: 'Sans serif', serif: 'Serif', mono: 'Monospace', cursive: 'Cursive' },
  ko: { sans: '산세리프', serif: '세리프', mono: '고정폭', cursive: '필기체' },
  ja: { sans: 'ゴシック体', serif: '明朝体', mono: '等幅', cursive: '筆記体' },
  zh: { sans: '无衬线', serif: '衬线', mono: '等宽', cursive: '手写体' },
  de: { sans: 'Serifenlos', serif: 'Serif', mono: 'Dicktengleich', cursive: 'Schreibschrift' },
  fr: { sans: 'Sans empattement', serif: 'Avec empattement', mono: 'Chasse fixe', cursive: 'Cursive' },
  es: { sans: 'Sin serifa', serif: 'Con serifa', mono: 'Monoespaciada', cursive: 'Cursiva' },
  pt: { sans: 'Sem serifa', serif: 'Com serifa', mono: 'Monoespaçada', cursive: 'Cursiva' },
  ru: { sans: 'Без засечек', serif: 'С засечками', mono: 'Моноширинный', cursive: 'Рукописный' },
  ar: { sans: 'بلا زخارف', serif: 'بزخارف', mono: 'ثابت العرض', cursive: 'خط اليد' },
  hi: { sans: 'सैन्स सेरिफ़', serif: 'सेरिफ़', mono: 'मोनोस्पेस', cursive: 'हस्तलिपि' },
  bn: { sans: 'স্যান্স সেরিফ', serif: 'সেরিফ', mono: 'মনোস্পেস', cursive: 'হস্তলিপি' },
  ur: { sans: 'سانس سیرف', serif: 'سیرف', mono: 'یکساں چوڑائی', cursive: 'رواں خط' },
  id: { sans: 'Tanpa serif', serif: 'Berserif', mono: 'Lebar tetap', cursive: 'Tulisan tangan' },
  fa: { sans: 'بدون سریف', serif: 'سریف', mono: 'تک‌فاصله', cursive: 'دست‌نویس' },
  mr: { sans: 'सॅन्स सेरिफ', serif: 'सेरिफ', mono: 'मोनोस्पेस', cursive: 'हस्ताक्षर' },
  vi: { sans: 'Không chân', serif: 'Có chân', mono: 'Đơn cách', cursive: 'Chữ viết tay' },
  te: { sans: 'శాన్స్ సెరిఫ్', serif: 'సెరిఫ్', mono: 'మోనోస్పేస్', cursive: 'చేతిరాత' },
  ha: { sans: 'Mara seref', serif: 'Mai seref', mono: 'Tazara ɗaya', cursive: 'Rubutun hannu' },
  tr: { sans: 'Sans serif', serif: 'Serif', mono: 'Eş aralıklı', cursive: 'El yazısı' },
  sw: { sans: 'Bila serif', serif: 'Yenye serif', mono: 'Nafasi moja', cursive: 'Mwandiko' },
  ta: { sans: 'சான்ஸ் செரிஃப்', serif: 'செரிஃப்', mono: 'ஒற்றையகலம்', cursive: 'கையெழுத்து' },
  th: { sans: 'ไร้เชิง', serif: 'มีเชิง', mono: 'ความกว้างคงที่', cursive: 'ลายมือ' },
  it: { sans: 'Senza grazie', serif: 'Con grazie', mono: 'Monospaziato', cursive: 'Corsivo' },
}

export function typefaceLine(locale: LocaleCode, kind: TypefaceKind): string {
  const start = localeOrder.indexOf(locale)
  const ordered = [...localeOrder.slice(start), ...localeOrder.slice(0, start)]
  const seen = new Set<string>()
  const result: string[] = []

  for (const code of ordered) {
    const label = labels[code][kind]
    const key = label.normalize('NFKC').toLocaleLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(label)
    }
  }

  return result.join(' · ')
}

export function withLocaleTypefaceLines(html: string, locale: LocaleCode): string {
  const block = (['sans', 'serif', 'mono', 'cursive'] as const)
    .map((kind) => `<p><span data-nabi-typeface="${kind}"><span data-nabi-size="lg">${typefaceLine(locale, kind)}</span></span></p><p></p>`)
    .join('')

  return html.replace(
    /<p><span data-nabi-typeface="sans"><span data-nabi-size="lg">[\s\S]*?<\/span><\/span><\/p><p><\/p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">[\s\S]*?<\/span><\/span><\/p><p><\/p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">[\s\S]*?<\/span><\/span><\/p><p><\/p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">[\s\S]*?<\/span><\/span><\/p><p><\/p>/,
    block,
  )
}

export function withLocaleTypefaceSample(html: string, locale: LocaleCode): string {
  return html.replace(
    /<p data-nabi-typeface="cursive">[\s\S]*?<\/p>/,
    `<p data-nabi-typeface="cursive">${typefaceLine(locale, 'cursive')}</p>`,
  )
}
