import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DICTIONARY, LOCALES, type LocaleText } from '../src/locale/index.js';
import { defaultWings, wingNames } from '../src/wings/index.js';

const EXPECTED_LOCALES = [
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
const EXPECTED_WINGS = [
  'b',
  'i',
  'u',
  's',
  'sup',
  'sub',
  'tf',
  'fs',
  'tc',
  'hl',
  'a',
  'h',
  'align',
  'dc',
  'ul',
  'ol',
  'tl',
  'quote',
  'details',
  'code',
  'hr',
  'table',
  'img',
  'youtube',
  'upload',
  'save',
  'open',
  'localHistory',
  'diff',
  'clearFormat',
];
const CORE_KEYS = ['gridSize', 'diff.prev', 'diff.next', 'diff.onlyChanges', 'diff.region', 'diff.controls'];

const tokens = (value: string) => [...value.matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]).sort();
const found = new Map<string, LocaleText>();
const seen = new Set<object>();
function scan(value: unknown, path: string): void {
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);
  const record = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, 'en') && typeof record.en === 'string' && record.en.trim()) {
    found.set(path, record as LocaleText);
  }
  for (const [key, child] of Object.entries(record)) scan(child, `${path}.${key}`);
}
scan(DICTIONARY, 'DICTIONARY');
defaultWings.forEach((wing, index) => scan(wing, `defaultWings[${index}].${wing.w}`));

const missing: string[] = [];
const invalid: string[] = [];
const fake: string[] = [];
const fakeSuffixes = [
  '（已翻译）',
  '(अनुवादित)',
  '(traducido)',
  '(مترجم)',
  '(traduit)',
  '(অনূদিত)',
  '(traduzido)',
  '(переведено)',
  '(diterjemahkan)',
  '(ترجمہ شدہ)',
  '(übersetzt)',
  '（翻訳済み）',
  '(ترجمه‌شده)',
  '(đã dịch)',
  '(అనువదించబడింది)',
  '(an fassara)',
  '(çevrildi)',
  '(imetafsiriwa)',
  '(மொழிபெயர்க்கப்பட்டது)',
  '(번역됨)',
  '(แปลแล้ว)',
  '(tradotto)',
];
const neutralSource =
  /^(?:H[1-6]|[0-9]+%|https:\/\/…|YouTube|javascript|typescript|jsx|tsx|python|java|kotlin|swift|c|cpp|csharp|go|rust|php|ruby|sql|html|xml|css|scss|json|yaml|toml|markdown|bash|powershell|dockerfile|diff|\{rows\} × \{cols\}|\{label\} \(⇧⇧ \{key\}\)|\{label\} \(\{key\} \{key\}\))$/;
const allowedSourceEqual = new Set([
  'fr:OK',
  'pt:OK',
  'ru:OK',
  'id:OK',
  'de:OK',
  'ja:OK',
  'vi:OK',
  'it:OK',
  'de:Serif',
  'fr:Cursive',
  'es:Coral',
  'pt:Coral',
  'fr:Violet',
  'fr:Cyan',
  'fr:Orange',
  'de:Orange',
  'pt:Link',
  'de:Link',
  'id:Drop cap',
  'fr:Code',
  'de:Code',
  'fr:Image',
]);
const sourceFallback: string[] = [];
let checkedValues = 0;
for (const [path, text] of found) {
  const english = String(text.en);
  for (const locale of LOCALES) {
    checkedValues += 1;
    const value = text[locale];
    if (typeof value !== 'string' || !value.trim()) missing.push(`${path}:${locale}`);
    else if (value.includes('\uFFFD')) invalid.push(`${path}:${locale}:replacement-character`);
    if (typeof value === 'string' && fakeSuffixes.some((suffix) => value.includes(suffix)))
      fake.push(`${path}:${locale}`);
    if (
      locale !== 'en' &&
      typeof value === 'string' &&
      value === english &&
      !neutralSource.test(english) &&
      !allowedSourceEqual.has(`${locale}:${english}`)
    )
      sourceFallback.push(`${path}:${locale}`);
    if (typeof value === 'string' && tokens(value).join('\0') !== tokens(english).join('\0'))
      invalid.push(`${path}:${locale}:placeholders`);
  }
}

// 팩토리는 선택지를 지연 생성할 수 있다 — 이 자리는 그 타입 선언을 스코프 안에 붙잡아 둔다.
// Factories can create choices lazily; this guard keeps their typed declarations in scope.
const wingSource = readdirSync(join(process.cwd(), 'src/wings'), { recursive: true, encoding: 'utf8' }).filter((name) =>
  name.endsWith('.ts'),
);
const typedDeclarations = wingSource.reduce(
  (count, name) =>
    count + (readFileSync(join(process.cwd(), 'src/wings', name), 'utf8').match(/LocaleText/g)?.length ?? 0),
  0,
);
const diagnostics = `locale catalog: objects=${found.size} values=${checkedValues} missing=${missing.length} invalid=${invalid.length} sourceLocaleTextRefs=${typedDeclarations}`;
console.log(diagnostics);

const failures: string[] = [];
if (JSON.stringify([...LOCALES]) !== JSON.stringify(EXPECTED_LOCALES)) failures.push('locale-order');
if (JSON.stringify([...wingNames()]) !== JSON.stringify(EXPECTED_WINGS)) failures.push('catalog-wing-order');
if (
  JSON.stringify(defaultWings.map((wing) => wing.w)) !== JSON.stringify(EXPECTED_WINGS) ||
  defaultWings.length !== EXPECTED_WINGS.length
)
  failures.push('defaultWings-coverage');
if (typedDeclarations !== 62) failures.push(`source-LocaleText-coverage:${typedDeclarations}`);
for (const key of CORE_KEYS) if (!found.has(`DICTIONARY.${key}`)) failures.push(`core-key:${key}`);
if (missing.length || invalid.length || fake.length || sourceFallback.length) {
  failures.push(
    `locale-values missing=${missing.length} invalid=${invalid.length} fake=${fake.length} sourceFallback=${sourceFallback.length}`,
  );
}
if (failures.length)
  throw new Error(`${diagnostics}; failures=${failures.join('|')}; missingSample=${missing.slice(0, 8).join(',')}`);
