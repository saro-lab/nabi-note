import { caretAt, ordered } from '../../caret/index.js';
import { holderLength, nodeAt, replaceAt, splitParagraph } from '../../doc/index.js';
import { P, type ElementNode } from '../../schema/index.js';
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
  const rule: ElementNode = { w: 'hr', ch: [] };
  const holder = nodeAt(doc, start.path);
  const parentPath = start.path.slice(0, -1);
  const parent = nodeAt(doc, parentPath);
  if (holder?.w !== P || (parent && env.singleParagraph?.has(parent.w))) {
    const result = insertLump(doc, start, rule, env);
    return { doc: result.doc, selection: caretAt(result.caret) };
  }
  const length = holderLength(holder, env);
  const blocks =
    start.offset > 0 && start.offset < length
      ? [...splitParagraph([holder], { path: [0], offset: start.offset }, env).doc]
      : [holder];
  const index = start.offset === 0 ? 0 : 1;
  const wrapper = length === 0 ? { ...holder, ch: [rule] } : { w: P, ch: [rule] };
  blocks.splice(index, length === 0 ? 1 : 0, wrapper);
  const path = [...parentPath, start.path[start.path.length - 1]! + index];
  return { doc: replaceAt(doc, start.path, blocks), selection: caretAt({ path, offset: 1 }) };
};

export const dividerWing: Wing = {
  ...boxObject({
    w: 'hr',
    attrs: {},
    button: {
      group: 'structure',
      icon: 'hr-rule',
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
