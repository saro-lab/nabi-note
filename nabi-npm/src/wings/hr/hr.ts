// 구분선 hr — 속도 속성도 없는 블록 단말이라 팩토리 선언 한 줄이 전부다. 빈 `attrs`가 곧 화이트리스트다.
// A divider — a leaf block with no attrs at all, so one factory declaration suffices; an empty `attrs` is the whitelist itself.
import { caretAt, ordered } from '../../caret/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import type { Command } from '../../editor/index.js';
import { boxObject, insertLump, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const DIVIDER_NAME: LocaleText = {
  ko: '구분선',
  en: 'Divider',
  ja: '区切り線',
  zh: '分隔线',
  de: 'Trennlinie',
  fr: 'Séparateur',
  es: 'Separador',
  pt: 'Separador',
  ru: 'Разделитель',
  ar: 'فاصل',
  hi: 'विभाजक',
  bn: 'বিভাজক',
  ur: 'خط فاصل',
  id: 'Pembatas',
};

const DIVIDER_CSS = `
.nabi-content hr { border: 0; border-block-start: 1px solid var(--nabi-line); margin-block: 1.2em; }
`;

const insertDivider: Command = (doc, sel, _args, env) => {
  const [start] = ordered(sel);
  const r = insertLump(doc, start, { w: 'hr', ch: [] }, env);
  return { doc: r.doc, selection: caretAt(r.caret) };
};

export const dividerWing: Wing = {
  ...boxObject({
    w: 'hr',
    attrs: {},
    button: {
      group: 'structure',
      svg: '<path d="M2 8h12"/>',
      label: DIVIDER_NAME,
      action: { kind: 'command', command: 'insertDivider' },
    },
    styles: DIVIDER_CSS,
  }),
  basic: true,
  // 별·밑줄도 읽지만 쓰는 것은 하이픈 셋으로 굳힌다 — 파서의 `^-{3,}$`와 같은 하나다.
  // Reads asterisks/underscores too, but always writes three hyphens — matches the parser's `^-{3,}$`.
  toMd: () => '---',
  commands: { insertDivider },
  inputRules: [{ trigger: 'enter', pattern: /^-{3,}$/, run: () => ({ name: 'insertDivider' }) }],
};

$markBuiltinAttrOwner(dividerWing, ['hr']);
