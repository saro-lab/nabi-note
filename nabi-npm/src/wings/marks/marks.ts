// 단순 마크 여섯 — b·i·u·s·sub·sup. 선언 말고는 코드가 없다.
// Six plain marks (b/i/u/s/sub/sup) — nothing but declarations, since the tag name already is the meaning.
//
// 커맨드를 따로 안 둔다 — 코어의 toggleMark가 이미 이 여섯의 문이고, 새 이름을 내면 접힌 캐럿의 armed 갈림이 끊긴다.
// No separate command — the core's toggleMark already owns all six, and a new name would break the collapsed-caret "armed" branch.
import { simpleMark, type Wing } from '../../wing/index.js';
import type { MdBuilder } from '../../io/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';

// md 표식으로 감싸는 마크는 셋뿐(굵게·기울임·취소선) — 밑줄·첨자는 md에 자리가 없어 toMd를 아예 안 달아 html로 떨어진다.
// Only three marks get an md wrapper (bold/italic/strike) — underline/subscript/superscript skip `toMd` entirely and fall back to html.
const wrapMd =
  (mark: string): MdBuilder =>
  (_node, ctx) =>
    `${mark}${ctx.children()}${mark}`;

const ICONS = {
  b: 'marks-b',
  i: 'marks-i',
  u: 'marks-u',
  s: 'marks-s',
  sub: 'marks-sub',
  sup: 'marks-sup',
} as const;

// 위·아래 첨자만 시트를 든다 — 나머지 넷은 브라우저 기본 태그 생김새 그대로가 맞다.
// Only sub/sup carry a stylesheet — the other four look right with the browser's default tag styling.
const SCRIPT_CSS = `
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
.nabi-content sub { vertical-align: sub; }
`;

export const boldWing: Wing = {
  ...simpleMark({
    w: 'b',
    clearable: true,
    button: {
      group: 'emphasis',
      accelerator: 'mod+b',
      shortcut: 'B',
      icon: ICONS.b,
      label: {
        ko: '굵게',
        en: 'Bold',
        ja: '太字',
        zh: '加粗',
        de: 'Fett',
        fr: 'Gras',
        es: 'Negrita',
        pt: 'Negrito',
        ru: 'Полужирный',
        ar: 'عريض',
        hi: 'बोल्ड',
        bn: 'গাঢ়',
        ur: 'جلی',
        id: 'Tebal',
      },
      action: { kind: 'mark' },
    },
  }),
  basic: true,
  toMd: wrapMd('**'),
};

export const italicWing: Wing = {
  ...simpleMark({
    w: 'i',
    clearable: true,
    button: {
      group: 'emphasis',
      accelerator: 'mod+i',
      shortcut: 'I',
      icon: ICONS.i,
      label: {
        ko: '기울임',
        en: 'Italic',
        ja: '斜体',
        zh: '斜体',
        de: 'Kursiv',
        fr: 'Italique',
        es: 'Cursiva',
        pt: 'Itálico',
        ru: 'Курсив',
        ar: 'مائل',
        hi: 'इटैलिक',
        bn: 'তির্যক',
        ur: 'ترچھا',
        id: 'Miring',
      },
      action: { kind: 'mark' },
    },
  }),
  basic: true,
  // 별 하나만 쓴다 — 밑줄(`_`)은 낱말 속에서 강조가 아니라 그냥 글자로도 쓰여 자리마다 답이 갈린다.
  // Uses a single asterisk — underscore is ambiguous mid-word (sometimes a literal character, not emphasis).
  toMd: wrapMd('*'),
};

export const underlineWing: Wing = {
  ...simpleMark({
    w: 'u',
    clearable: true,
    button: {
      group: 'emphasis',
      accelerator: 'mod+u',
      shortcut: 'U',
      icon: ICONS.u,
      label: {
        ko: '밑줄',
        en: 'Underline',
        ja: '下線',
        zh: '下划线',
        de: 'Unterstrichen',
        fr: 'Souligné',
        es: 'Subrayado',
        pt: 'Sublinhado',
        ru: 'Подчёркнутый',
        ar: 'تسطير',
        hi: 'रेखांकित',
        bn: 'আন্ডারলাইন',
        ur: 'خط کشیدہ',
        id: 'Garis bawah',
      },
      action: { kind: 'mark' },
    },
  }),
  basic: true,
};

export const strikeWing: Wing = {
  ...simpleMark({
    w: 's',
    clearable: true,
    button: {
      group: 'emphasis',
      shortcut: 'S',
      icon: ICONS.s,
      label: {
        ko: '취소선',
        en: 'Strikethrough',
        ja: '取り消し線',
        zh: '删除线',
        de: 'Durchgestrichen',
        fr: 'Barré',
        es: 'Tachado',
        pt: 'Tachado',
        ru: 'Зачёркнутый',
        ar: 'يتوسطه خط',
        hi: 'स्ट्राइकथ्रू',
        bn: 'স্ট্রাইকথ্রু',
        ur: 'خط زدہ',
        id: 'Coret',
      },
      action: { kind: 'mark' },
    },
  }),
  basic: true,
  toMd: wrapMd('~~'),
};

export const subscriptWing: Wing = {
  ...simpleMark({
    w: 'sub',
    clearable: true,
    button: {
      group: 'script',
      shortcut: '↓',
      icon: ICONS.sub,
      label: {
        ko: '아랫첨자',
        en: 'Subscript',
        ja: '下付き文字',
        zh: '下标',
        de: 'Tiefgestellt',
        fr: 'Indice',
        es: 'Subíndice',
        pt: 'Subscrito',
        ru: 'Подстрочный',
        ar: 'منخفض',
        hi: 'सबस्क्रिप्ट',
        bn: 'সাবস্ক্রিপ্ট',
        ur: 'زیریں',
        id: 'Subskrip',
      },
      action: { kind: 'mark' },
    },
    styles: SCRIPT_CSS,
  }),
  basic: true,
};

export const superscriptWing: Wing = {
  ...simpleMark({
    w: 'sup',
    clearable: true,
    button: {
      group: 'script',
      shortcut: '↑',
      icon: ICONS.sup,
      label: {
        ko: '윗첨자',
        en: 'Superscript',
        ja: '上付き文字',
        zh: '上标',
        de: 'Hochgestellt',
        fr: 'Exposant',
        es: 'Superíndice',
        pt: 'Sobrescrito',
        ru: 'Надстрочный',
        ar: 'مرتفع',
        hi: 'सुपरस्क्रिप्ट',
        bn: 'সুপারস্ক্রিপ্ট',
        ur: 'بالائی',
        id: 'Superskrip',
      },
      action: { kind: 'mark' },
    },
    // 첨자 둘이 시트 하나를 나눠 쓴다 — 문자열이 같으므로 문서에는 한 번만 실린다.
    // Both subscript and superscript share this one sheet — identical strings dedupe to a single copy in the document.
    styles: SCRIPT_CSS,
  }),
  basic: true,
};

// clearFormat이 겨눌 목록이자 등록 묶음 — 툴바는 이 등록 순서를 그대로 줄 순서로 쓴다.
// The clearFormat target list and registration bundle — the toolbar renders buttons in this same order.
export const simpleMarkWings: readonly Wing[] = [
  boldWing,
  italicWing,
  underlineWing,
  strikeWing,
  superscriptWing,
  subscriptWing,
];

for (const wing of simpleMarkWings) $markBuiltinAttrOwner(wing, [wing.w]);
