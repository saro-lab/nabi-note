import type { LocaleText } from './dict.js';
import { catalogTranslation } from './translations.js';
const LOCALES = [
  'en',
  'zh',
  'hi',
  'es',
  'ar',
  'fr',
  'bn',
  'pt',
  'ru',
  'id',
  'ur',
  'de',
  'ja',
  'fa',
  'mr',
  'vi',
  'te',
  'ha',
  'tr',
  'sw',
  'ta',
  'ko',
  'th',
  'it',
];

const NEUTRAL =
  /^(?:H[1-6]|[0-9]+%|https:\/\/…|YouTube|javascript|typescript|jsx|tsx|python|java|kotlin|swift|c|cpp|csharp|go|rust|php|ruby|sql|html|xml|css|scss|json|yaml|toml|markdown|bash|powershell|dockerfile|diff|\{rows\} × \{cols\}|\{label\} \(⇧⇧ \{key\}\)|\{label\} \(\{key\} \{key\}\))$/;

export function completeLocaleText(value: LocaleText): LocaleText {
  const record = value as Record<string, string>;
  if (!record.en) return value;
  for (const locale of LOCALES) {
    if (record[locale]) continue;
    const translated = catalogTranslation(record.en, locale);
    if (translated) record[locale] = translated;
    else if (NEUTRAL.test(record.en)) record[locale] = record.en;
  }
  return value;
}

export function completeLocaleTree(root: unknown): void {
  const seen = new Set<object>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    const record = value as Record<string, unknown>;
    if (typeof record.en === 'string' && record.en.trim()) completeLocaleText(record as LocaleText);
    for (const child of Object.values(record)) visit(child);
  };
  visit(root);
}
