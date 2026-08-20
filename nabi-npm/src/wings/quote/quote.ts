// 인용 quote — 속은 문단 배열이다. 감싸기·풀기는 공용 부품 하나로 끝난다.
// `allows` 를 안 건다: 인용 속은 최상위와 같은 규칙이라 표·이미지도 래퍼문단을 입고 설 수 있다.
import { DEFAULT_BUILDERS } from '../../html/index.js';
import { caretAt } from '../../caret/index.js';
import { toggleWrap, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const QUOTE_NAME: LocaleText = { ko: '인용', en: 'Quote', ja: '引用', zh: '引用', de: 'Zitat', fr: 'Citation', es: 'Cita', pt: 'Citação', ru: 'Цитата', ar: 'اقتباس', hi: 'उद्धरण', bn: 'উদ্ধৃতি', ur: 'اقتباس', id: 'Kutipan' };

const QUOTE_ICON =
  '<g transform="translate(8 8) scale(1.0185) translate(-8.1 -8)" stroke-width="1.375">' +
  '<path d="M3.4 2.6v10.8"/><path d="M6.8 4.4h6M6.8 8h6M6.8 11.6h4"/></g>';

const QUOTE_CSS = `
.nabi-content blockquote {
  margin-inline: 0; padding-inline-start: 1em; border-inline-start: 3px solid var(--nabi-line);
  color: var(--nabi-muted);
}
`;

export const quoteWing: Wing = {
  w: 'quote',
  place: 'container',
  holds: 'blocks',
  toHtml: DEFAULT_BUILDERS['quote'],
  commands: {
    toggleQuote: (doc, sel, _args, env) => {
      const r = toggleWrap(doc, sel, 'quote', env);
      return { doc: r.doc, selection: caretAt(r.caret) };
    },
  },
  inputRules: [{ trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) }],
  button: {
    group: 'container',
    svg: QUOTE_ICON,
    label: QUOTE_NAME,
    action: { kind: 'command', command: 'toggleQuote' },
  },
  styles: QUOTE_CSS,
};
