import fc from 'fast-check';
import { localeDirection } from '../src/locale/index.js';
import { normalizedLocale } from '../src/locale/normalize.js';
import { done, eq, ok } from './net.js';

fc.assert(
  fc.property(fc.string(), (raw) => {
    const once = normalizedLocale(raw);
    return normalizedLocale(once) === once && once === once.toLowerCase() && !once.includes('_');
  }),
  { numRuns: 1_000 },
);
ok('locale normalization is idempotent for arbitrary strings', true);

fc.assert(
  fc.property(fc.constantFrom('ar', 'ur', 'fa'), fc.stringMatching(/^[A-Za-z]{0,8}$/), (locale, region) => {
    const tag = region === '' ? locale : `${locale}-${region}`;
    return localeDirection(tag) === 'rtl';
  }),
  { numRuns: 300 },
);
ok('RTL base locales stay RTL with arbitrary region tags', true);

fc.assert(
  fc.property(
    fc.constantFrom(
      'en',
      'zh',
      'hi',
      'es',
      'fr',
      'bn',
      'pt',
      'ru',
      'id',
      'de',
      'ja',
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
    ),
    (locale) => localeDirection(locale) === 'ltr',
  ),
  { numRuns: 300 },
);
eq('non-RTL supported locales stay LTR', true, true);

done('property');
