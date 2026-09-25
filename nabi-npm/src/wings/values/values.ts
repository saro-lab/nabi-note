// 값 마크 넷 — 형광펜(hl)·글자색(tc)은 키가 c, 글자 크기(fs)·서체(tf)는 키가 v다(크기·서체는 마크지 문단 속성이 아니다).
// Four value marks — highlight/text-color use key `c`, size/typeface use `v` (size and typeface are marks, not paragraph attrs).
//
// 값 거절은 세 곳에서 — 커맨드는 목록 밖 값을 안 돌리고, 들여오기(claim)는 껍데기를 벗기고, 눌림 표시는 없는 값으로 본다.
// Rejection happens in three places — the command refuses out-of-list values, `claim` strips the tag on import, and currentValue reads it as unset.
import { isWrapper, runsOf, type Attrs, type NabiDoc } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import {
  comparePositions,
  holderLength,
  holders,
  nodeAt,
  setMark,
  sliceRuns,
  terminalOf,
  type EditEnv,
  type Position,
} from '../../doc/index.js';
import { isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { markSpanAt, valueMark, type Wing, type WingChoice } from '../../wing/index.js';
import type { MdBuilder } from '../../io/index.js';
import type { LocaleText } from '../../locale/index.js';

const HIGHLIGHT_NAME: LocaleText = {
  ko: '형광펜',
  en: 'Highlight',
  ja: '蛍光ペン',
  zh: '荧光笔',
  de: 'Textmarker',
  fr: 'Surligneur',
  es: 'Resaltador',
  pt: 'Realce',
  ru: 'Маркер',
  ar: 'تمييز',
  hi: 'हाइलाइट',
  bn: 'হাইলাইট',
  ur: 'نمایاں',
  id: 'Stabilo',
};
const TEXT_COLOR_NAME: LocaleText = {
  ko: '글자색',
  en: 'Text color',
  ja: '文字色',
  zh: '文字颜色',
  de: 'Textfarbe',
  fr: 'Couleur du texte',
  es: 'Color del texto',
  pt: 'Cor do texto',
  ru: 'Цвет текста',
  ar: 'لون النص',
  hi: 'टेक्स्ट का रंग',
  bn: 'লেখার রং',
  ur: 'متن کا رنگ',
  id: 'Warna teks',
};
const FONT_SIZE_NAME: LocaleText = {
  ko: '글자 크기',
  en: 'Text size',
  ja: '文字サイズ',
  zh: '文字大小',
  de: 'Schriftgröße',
  fr: 'Taille du texte',
  es: 'Tamaño del texto',
  pt: 'Tamanho da letra',
  ru: 'Размер текста',
  ar: 'حجم الخط',
  hi: 'टेक्स्ट का आकार',
  bn: 'অক্ষরের আকার',
  ur: 'حروف کا سائز',
  id: 'Ukuran huruf',
};
const TYPEFACE_NAME: LocaleText = {
  ko: '서체',
  en: 'Typeface',
  ja: '書体',
  zh: '字体',
  de: 'Schriftart',
  fr: 'Police',
  es: 'Tipografía',
  pt: 'Tipo de letra',
  ru: 'Гарнитура',
  ar: 'نوع الخط',
  hi: 'फ़ॉन्ट',
  bn: 'ফন্ট',
  ur: 'فونٹ',
  id: 'Jenis huruf',
};

export const HIGHLIGHT_COLORS: readonly string[] = ['yellow', 'green', 'cyan', 'pink', 'purple', 'orange'];
export const TEXT_COLORS: readonly string[] = ['green', 'coral', 'violet', 'amber', 'blue'];
export const FONT_SIZES: readonly string[] = ['xs', 'sm', 'lg', 'xl'];
export const TYPEFACES: readonly string[] = ['sans', 'serif', 'mono', 'cursive'];

// 범위의 글자 런 전부가 같은 값의 이 마크를 입었으면 그 값, 아니면 undefined — 토글의 판정이다.
// The value if every text run in the range carries this mark with the same value; undefined otherwise — this is the toggle's decision test.
function valueOver(
  doc: NabiDoc,
  start: Position,
  end: Position,
  w: string,
  key: string,
  env: EditEnv,
): string | undefined {
  const terminal = terminalOf(env);
  let found: string | undefined;
  let seen = false;
  for (const { path, node } of holders(doc, env)) {
    if (isWrapper(node, env)) continue; // 래퍼문단은 글이 없어 마크의 자리가 아니다
    const length = holderLength(node, env);
    if (comparePositions({ path, offset: length }, start) <= 0) continue;
    if (comparePositions({ path, offset: 0 }, end) >= 0) continue;
    const samePathAs = (p: Position): boolean => p.path.length === path.length && p.path.every((v, i) => v === path[i]);
    const from = samePathAs(start) ? start.offset : 0;
    const to = samePathAs(end) ? end.offset : length;
    if (from >= to) continue;
    for (const run of sliceRuns(runsOf(node, terminal), from, to)) {
      if (run.kind !== 'text') continue;
      const mark = run.marks.find((m) => m.w === w);
      const value = mark?.a?.[key];
      if (typeof value !== 'string') return undefined;
      if (!seen) {
        found = value;
        seen = true;
      } else if (found !== value) return undefined;
    }
  }
  return seen ? found : undefined;
}

// 접힌 캐럿의 겨눔이 여기서 둘로 갈린다 — 'mark'는 캐럿이 든 마크 하나(형광펜·글자색), 'paragraph'는 문단 전체(크기·서체).
// A collapsed caret's target splits two ways — 'mark' aims at just the enclosing mark (highlight/color), 'paragraph' at the whole paragraph (size/typeface).
//
// 어느 쪽이든 긁어서 고른 범위가 있으면 그 범위가 답 — 넓히는 것은 접혔을 때뿐이다.
// Either way, an actual selection always wins — widening the target only happens when the caret is collapsed.
type CollapsedScope = 'mark' | 'paragraph';

// 값 하나를 건다 — 목록 밖 값은 여기서 죽는다. 같은 값이면 벗고, 다른 값이면 교체다.
// Sets one value — an out-of-list value dies right here; the same value strips it, a different one replaces it.
function setValueCommand(w: string, key: string, values: readonly string[], scope: CollapsedScope = 'mark'): Command {
  const allowed = new Set(values);
  return (doc, sel, args, env) => {
    const value = args[key];
    if (typeof value !== 'string' || !allowed.has(value)) return null;

    let aimed = sel;
    if (isCollapsed(sel)) {
      if (scope === 'paragraph') {
        const holder = nodeAt(doc, sel.focus.path);
        // 글이 한 글자도 없는 문단은 걸 자리가 없어 예약이다 — 치는 순간 그 글자가 입는다.
        // An empty paragraph has nowhere to attach the mark, so it arms instead — the next typed character wears it.
        const length = holder ? holderLength(holder, env) : 0;
        if (length === 0) return { doc, selection: sel, arm: { w, a: { [key]: value }, ch: [] } };
        aimed = {
          anchor: { path: sel.focus.path, offset: 0 },
          focus: { path: sel.focus.path, offset: length },
        };
      } else {
        const span = markSpanAt(doc, sel.focus, w, env);
        if (!span) return { doc, selection: sel, arm: { w, a: { [key]: value }, ch: [] } };
        aimed = span.selection;
      }
    }

    const [start, end] = ordered(aimed);
    const current = valueOver(doc, start, end, w, key, env);
    const strip = args['toggleCurrent'] === true && isCollapsed(sel) ? current !== undefined : current === value;
    const a: Attrs | null = strip ? null : { [key]: value };
    const r = setMark(doc, { anchor: start, focus: end }, w, a, env);
    // 넓혀서 겨눴으면 캐럿을 그대로 둔다 — 한 번 바꿨다고 낱말·문단이 통째로 골라진 것처럼 보이면 안 된다.
    // If the target was widened from a collapsed caret, the caret stays put — one change shouldn't look like the whole word/paragraph got selected.
    if (aimed !== sel) {
      // 새 값이 이웃과 같아져 저장값에서 하나로 붙으면, 캐럿만 남길 때 다음 몸짓이 붙은 덩어리 전체로 번진다 — 그래서 붙었을 때만 범위를 남긴다.
      // If the new value matches a neighbor and merges in storage, leaving just a caret would let the next gesture spread across the whole merged run — so a range is kept only in that merge case.
      const after = strip ? null : markSpanAt(r.doc, sel.focus, w, env);
      const fused =
        after !== null &&
        (comparePositions(after.selection.anchor, start) < 0 || comparePositions(after.selection.focus, end) > 0);
      return { doc: r.doc, selection: fused ? { anchor: start, focus: end } : sel };
    }
    return { doc: r.doc, selection: { anchor: r.anchor ?? r.caret, focus: r.caret } };
  };
}

// 목록 밖 값을 단 태그는 마크가 아니다.
// A tag carrying an out-of-list value is rejected as an actual mark.
function rejectUnknown(tag: string, attr: string, values: readonly string[]): NonNullable<Wing['claim']> {
  const allowed = new Set(values);
  return (el, inner) => {
    if (el.tag !== tag) return null;
    const raw = el.attrs[attr];
    if (raw === undefined || raw === '' || allowed.has(raw)) return null; // 아는 값 — 기본 대응이 읽는다
    return inner(false); // 목록 밖 값 — 껍데기를 벗기고 글만 남긴다
  };
}

// 툴바 단추는 판을 안 띄운다 — 값 고르기는 상황 줄의 일이다. 단추는 기본값 하나를 바로 걸거나(이미 값이 있으면 벗긴다) 할 뿐이다.
// The toolbar button never opens a picker — choosing a value is the context toolbar's job; the button just applies (or strips) one default.
const TEXT_COLOR_ICON = 'values-text-color';

const HIGHLIGHT_ICON = 'values-highlight';

const FONT_SIZE_ICON = 'values-font-size';

const TYPEFACE_ICON = 'values-typeface';

// 화면 색은 시트가 준다(문서엔 이름만 산다) — 견본도 토큰 참조라, 칠해진 색과 견본이 언제나 같고 다크에서 함께 갈린다.
// The screen color lives in the stylesheet (only a name is stored) — swatches reference the same token, so text and swatch never drift, even across themes.
const HIGHLIGHT_SWATCH: Readonly<Record<string, string>> = Object.fromEntries(
  ['yellow', 'green', 'cyan', 'pink', 'purple', 'orange'].map((name) => [name, `var(--nabi-hl-${name})`]),
);
const TEXT_SWATCH: Readonly<Record<string, string>> = Object.fromEntries(
  ['green', 'coral', 'violet', 'amber', 'blue'].map((name) => [name, `var(--nabi-tc-${name})`]),
);
const HIGHLIGHT_LABELS: Readonly<Record<string, LocaleText>> = {
  yellow: {
    ko: '노랑',
    en: 'Yellow',
    ja: '黄色',
    zh: '黄色',
    de: 'Gelb',
    fr: 'Jaune',
    es: 'Amarillo',
    pt: 'Amarelo',
    ru: 'Жёлтый',
    ar: 'أصفر',
    hi: 'पीला',
    bn: 'হলুদ',
    ur: 'پیلا',
    id: 'Kuning',
  },
  green: {
    ko: '연두',
    en: 'Green',
    ja: '黄緑',
    zh: '绿色',
    de: 'Grün',
    fr: 'Vert',
    es: 'Verde',
    pt: 'Verde',
    ru: 'Зелёный',
    ar: 'أخضر',
    hi: 'हरा',
    bn: 'সবুজ',
    ur: 'سبز',
    id: 'Hijau',
  },
  cyan: {
    ko: '하늘',
    en: 'Cyan',
    ja: '水色',
    zh: '天蓝',
    de: 'Hellblau',
    fr: 'Cyan',
    es: 'Celeste',
    pt: 'Ciano',
    ru: 'Голубой',
    ar: 'سماوي',
    hi: 'आसमानी',
    bn: 'আকাশি',
    ur: 'آسمانی',
    id: 'Biru muda',
  },
  pink: {
    ko: '분홍',
    en: 'Pink',
    ja: 'ピンク',
    zh: '粉色',
    de: 'Rosa',
    fr: 'Rose',
    es: 'Rosa',
    pt: 'Rosa',
    ru: 'Розовый',
    ar: 'وردي',
    hi: 'गुलाबी',
    bn: 'গোলাপি',
    ur: 'گلابی',
    id: 'Merah muda',
  },
  purple: {
    ko: '보라',
    en: 'Purple',
    ja: '紫',
    zh: '紫色',
    de: 'Lila',
    fr: 'Violet',
    es: 'Morado',
    pt: 'Roxo',
    ru: 'Фиолетовый',
    ar: 'بنفسجي',
    hi: 'बैंगनी',
    bn: 'বেগুনি',
    ur: 'ارغوانی',
    id: 'Ungu',
  },
  orange: {
    ko: '주황',
    en: 'Orange',
    ja: 'オレンジ',
    zh: '橙色',
    de: 'Orange',
    fr: 'Orange',
    es: 'Naranja',
    pt: 'Laranja',
    ru: 'Оранжевый',
    ar: 'برتقالي',
    hi: 'नारंगी',
    bn: 'কমলা',
    ur: 'نارنجی',
    id: 'Oranye',
  },
};
const TEXT_LABELS: Readonly<Record<string, LocaleText>> = {
  green: {
    ko: '초록',
    en: 'Green',
    ja: '緑',
    zh: '绿色',
    de: 'Grün',
    fr: 'Vert',
    es: 'Verde',
    pt: 'Verde',
    ru: 'Зелёный',
    ar: 'أخضر',
    hi: 'हरा',
    bn: 'সবুজ',
    ur: 'سبز',
    id: 'Hijau',
  },
  coral: {
    ko: '코랄',
    en: 'Coral',
    ja: 'サンゴ色',
    zh: '珊瑚色',
    de: 'Koralle',
    fr: 'Corail',
    es: 'Coral',
    pt: 'Coral',
    ru: 'Коралловый',
    ar: 'مرجاني',
    hi: 'मूंगा',
    bn: 'প্রবাল',
    ur: 'مونگا',
    id: 'Koral',
  },
  violet: {
    ko: '보라',
    en: 'Violet',
    ja: '紫',
    zh: '紫色',
    de: 'Violett',
    fr: 'Violet',
    es: 'Violeta',
    pt: 'Violeta',
    ru: 'Фиолетовый',
    ar: 'بنفسجي',
    hi: 'बैंगनी',
    bn: 'বেগুনি',
    ur: 'بنفشی',
    id: 'Ungu',
  },
  // amber는 호박(琥珀)이지 금빛이 아니다 — ko/hi/bn/ur 넷이 잘못 옮겨져 있어 사이트 데모 본문의 검수된 번역으로 맞췄다.
  // Amber means the resin color, not gold — four locales (ko/hi/bn/ur) had it wrong, corrected against the site demo's reviewed translation.
  amber: {
    ko: '호박',
    en: 'Amber',
    ja: '琥珀色',
    zh: '琥珀色',
    de: 'Bernstein',
    fr: 'Ambre',
    es: 'Ámbar',
    pt: 'Âmbar',
    ru: 'Янтарный',
    ar: 'كهرماني',
    hi: 'अंबर',
    bn: 'অ্যাম্বার',
    ur: 'کہربائی',
    id: 'Ambar',
  },
  blue: {
    ko: '파랑',
    en: 'Blue',
    ja: '青',
    zh: '蓝色',
    de: 'Blau',
    fr: 'Bleu',
    es: 'Azul',
    pt: 'Azul',
    ru: 'Синий',
    ar: 'أزرق',
    hi: 'नीला',
    bn: 'নীল',
    ur: 'نیلا',
    id: 'Biru',
  },
};
const SIZE_LABELS: Readonly<Record<string, LocaleText>> = {
  xs: {
    ko: '아주 작게',
    en: 'Extra small',
    ja: '最小',
    zh: '特小',
    de: 'Sehr klein',
    fr: 'Très petit',
    es: 'Muy pequeño',
    pt: 'Muito pequeno',
    ru: 'Очень мелкий',
    ar: 'صغير جدًا',
    hi: 'बहुत छोटा',
    bn: 'খুব ছোট',
    ur: 'بہت چھوٹا',
    id: 'Sangat kecil',
  },
  sm: {
    ko: '작게',
    en: 'Small',
    ja: '小',
    zh: '小',
    de: 'Klein',
    fr: 'Petit',
    es: 'Pequeño',
    pt: 'Pequeno',
    ru: 'Мелкий',
    ar: 'صغير',
    hi: 'छोटा',
    bn: 'ছোট',
    ur: 'چھوٹا',
    id: 'Kecil',
  },
  lg: {
    ko: '크게',
    en: 'Large',
    ja: '大',
    zh: '大',
    de: 'Groß',
    fr: 'Grand',
    es: 'Grande',
    pt: 'Grande',
    ru: 'Крупный',
    ar: 'كبير',
    hi: 'बड़ा',
    bn: 'বড়',
    ur: 'بڑا',
    id: 'Besar',
  },
  xl: {
    ko: '아주 크게',
    en: 'Extra large',
    ja: '最大',
    zh: '特大',
    de: 'Sehr groß',
    fr: 'Très grand',
    es: 'Muy grande',
    pt: 'Muito grande',
    ru: 'Очень крупный',
    ar: 'كبير جدًا',
    hi: 'बहुत बड़ा',
    bn: 'খুব বড়',
    ur: 'بہت بڑا',
    id: 'Sangat besar',
  },
};
const FACE_LABELS: Readonly<Record<string, LocaleText>> = {
  sans: {
    ko: '산세리프',
    en: 'Sans serif',
    ja: 'ゴシック体',
    zh: '无衬线',
    de: 'Serifenlos',
    fr: 'Sans empattement',
    es: 'Sin serifa',
    pt: 'Sem serifa',
    ru: 'Без засечек',
    ar: 'غير مذيل',
    hi: 'सैन्स सेरिफ़',
    bn: 'সান্স সেরিফ',
    ur: 'سینس سیرف',
    id: 'Tanpa serif',
  },
  serif: {
    ko: '세리프',
    en: 'Serif',
    ja: '明朝体',
    zh: '衬线',
    de: 'Serif',
    fr: 'Avec empattement',
    es: 'Con serifa',
    pt: 'Com serifa',
    ru: 'С засечками',
    ar: 'مذيل',
    hi: 'सेरिफ़',
    bn: 'সেরিফ',
    ur: 'سیرف',
    id: 'Berserif',
  },
  mono: {
    ko: '고정폭',
    en: 'Monospace',
    ja: '等幅',
    zh: '等宽',
    de: 'Dicktengleich',
    fr: 'Chasse fixe',
    es: 'Monoespaciada',
    pt: 'Monoespaçada',
    ru: 'Моноширинный',
    ar: 'ثابت العرض',
    hi: 'मोनोस्पेस',
    bn: 'মনোস্পেস',
    ur: 'یکساں چوڑائی',
    id: 'Lebar tetap',
  },
  cursive: {
    ko: '필기체',
    en: 'Cursive',
    ja: '筆記体',
    zh: '手写体',
    de: 'Schreibschrift',
    fr: 'Cursive',
    es: 'Manuscrita',
    pt: 'Cursiva',
    ru: 'Рукописный',
    ar: 'خط اليد',
    hi: 'हस्तलेख',
    bn: 'হস্তলিপি',
    ur: 'رواں خط',
    id: 'Tulisan tangan',
  },
};

const swatchChoices = (
  values: readonly string[],
  swatches: Readonly<Record<string, string>>,
  names: Readonly<Record<string, LocaleText>>,
): readonly WingChoice[] =>
  values.map((value) => ({ value, swatch: swatches[value] ?? value, label: names[value] ?? { en: value } }));

const namedChoices = (values: readonly string[], names: Readonly<Record<string, LocaleText>>): readonly WingChoice[] =>
  values.map((value) => ({ value, label: names[value] ?? { en: value } }));

// 상황 줄 — 캐럿이 마크 안이면 지금 걸린 값이 보이고 거기서 바로 바뀐다. 색 둘은 견본 줄, 크기·서체
// 둘은 값이 순서를 갖기(작게→크게) 때문에 슬라이더 — 칸으로 늘어놓으면 줄을 넷씩 먹는다.
// The context bar shows the currently applied value when the caret sits in the mark, changed right there. The two colors get a swatch row; size and typeface get a slider since their values are ordered (small to large) — laid out as buttons instead, they'd eat four times the row space.

// 기본 칸 — 값 없음. 손잡이가 여기 앉으면 아무것도 안 걸린 것이고, 여기로 옮기면 벗는다.
// The default slot means no value — the handle resting here means nothing is applied, and moving it here strips the mark.
const BASE_LABEL: LocaleText = {
  ko: '기본',
  en: 'Default',
  ja: '既定',
  zh: '默认',
  de: 'Standard',
  fr: 'Par défaut',
  es: 'Predeterminado',
  pt: 'Padrão',
  ru: 'По умолчанию',
  ar: 'افتراضي',
  hi: 'डिफ़ॉल्ट',
  bn: 'ডিফল্ট',
  ur: 'طے شدہ',
  id: 'Bawaan',
};

// 순서가 있는 눈금 — 기본 칸이 가운데가 아니라 맨 앞이다: 목록이 작은 것부터 큰 것 순이라 그 앞이 "안 걸림"의 자리다.
// An ordered scale — the default slot sits at the front, not the middle, since the list runs small to large and "unset" belongs before the smallest.
const scale = (values: readonly string[], names: Readonly<Record<string, LocaleText>>): readonly WingChoice[] => [
  { value: '', label: BASE_LABEL },
  ...namedChoices(values, names),
];

// 형광펜·글자색이 같은 표식(data-color)을 태그로 갈라 쓴다. 색은 토큰이 준다 — 리터럴을 박으면 다크 테마에서 형광펜이 글자를 삼킨다.
// Highlight and text-color share the data-color attribute, split by tag. Colors come from tokens — a literal would break dark mode, letting highlight swallow the text.
const COLOR_CSS = `
.nabi-content mark[data-color="yellow"] { background: var(--nabi-hl-yellow); }
.nabi-content mark[data-color="green"] { background: var(--nabi-hl-green); }
.nabi-content mark[data-color="cyan"] { background: var(--nabi-hl-cyan); }
.nabi-content mark[data-color="pink"] { background: var(--nabi-hl-pink); }
.nabi-content mark[data-color="purple"] { background: var(--nabi-hl-purple); }
.nabi-content mark[data-color="orange"] { background: var(--nabi-hl-orange); }
.nabi-content mark { color: inherit; border-radius: var(--nabi-radius-xs); padding: 0 .1em; }
.nabi-content span[data-color="green"] { color: var(--nabi-tc-green); }
.nabi-content span[data-color="coral"] { color: var(--nabi-tc-coral); }
.nabi-content span[data-color="violet"] { color: var(--nabi-tc-violet); }
.nabi-content span[data-color="amber"] { color: var(--nabi-tc-amber); }
.nabi-content span[data-color="blue"] { color: var(--nabi-tc-blue); }
`;

const SIZE_CSS = `
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
`;

// 글꼴도 토큰이다 — 호스트가 자기 글꼴로 갈아 끼울 자리가 있어야 한다(웹폰트는 호스트 것이지 편집기 것이 아니다).
// Fonts are tokens too — a host must be able to swap in its own (a webfont belongs to the host, not the editor).
const FACE_CSS = `
.nabi-content [data-nabi-typeface="sans"] { font-family: var(--nabi-font, var(--nabi-font-fallback)); }
.nabi-content [data-nabi-typeface="serif"] { font-family: var(--nabi-font-serif, var(--nabi-font-serif-fallback)); }
.nabi-content [data-nabi-typeface="mono"] { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); }
/* 손글씨 얼굴은 x-높이가 낮아 같은 px로도 작아 보인다 — font-size-adjust로 보이는 크기만 한글 기준에 맞춰 재운다(저장값은 안 건드린다). */
/* The cursive face's low x-height makes it look smaller at the same px, so font-size-adjust corrects only the visual size, calibrated to Hangul, without touching the stored value. */
.nabi-content [data-nabi-typeface="cursive"] {
  font-family: var(--nabi-font-cursive, var(--nabi-font-cursive-fallback));
  font-size-adjust: var(--nabi-cursive-adjust, 0.4);
}

/* 고르는 칸도 자기가 가리키는 얼굴로 그린다 — 이름만 늘어놓으면 무엇을 고르는지 낱말 뜻으로만 전해진다. */
/* Each picker option renders in the face it names — otherwise the choice is conveyed only by the word's meaning, not by sight. */
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="sans"] { font-family: var(--nabi-font, var(--nabi-font-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="serif"] { font-family: var(--nabi-font-serif, var(--nabi-font-serif-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="mono"] { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="cursive"] {
  font-family: var(--nabi-font-cursive, var(--nabi-font-cursive-fallback));
  font-size-adjust: var(--nabi-cursive-adjust, 0.4);
}
`;

// 값 목록을 줄이는 문은 이 팩토리 넷뿐이다 — 좁히면 커맨드·들여오기·상황 줄이 한 몸으로 좁아진다(하나만 줄이면 플러그인이 그 틈으로 새어든다).
// These four factories are the only door for a host to narrow a value list — narrowing hits command, import, and toolbar together, so no single layer leaves a gap a plugin could exploit.

export interface ValueWingOptions {
  // 남길 값 — 전체 목록의 부분집합. 차례는 준 차례가 아니라 공식 차례다.
  readonly values?: readonly string[];
}

// 목록 밖 값은 그 자리에서 죽는다 — 조용히 거르면 사람은 자기가 준 값이 걸린 줄 안다.
// An out-of-list value dies right here — silently filtering would let someone believe their value took effect.
function narrowed(w: string, full: readonly string[], options: ValueWingOptions): readonly string[] {
  const given = options.values;
  if (given === undefined) return full;
  if (!Array.isArray(given)) {
    throw new Error(`'${w}' 의 values 는 배열이어야 한다: { values: ['${full[0]}'] }`);
  }
  const unknown = given.filter((value) => !full.includes(value));
  if (unknown.length > 0) {
    throw new Error(
      `'${w}' 가 모르는 값: ${unknown.map((value) => `'${String(value)}'`).join(', ')}. 받는 것: ${full.join('·')}`,
    );
  }
  if (given.length === 0) {
    throw new Error(`'${w}' 의 values 가 비었다 — wing 자체를 빼려면 빌더의 .drop('${w}') 이 그 문이다`);
  }
  return full.filter((value) => given.includes(value));
}

export function makeHighlightWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('hl', HIGHLIGHT_COLORS, options);
  // 기본색은 노랑이다 — 형광펜이라는 말이 먼저 뜻하는 색. 좁혀서 노랑이 빠졌으면 남은 첫 색이다.
  const first = values.includes('yellow') ? 'yellow' : (values[0] as string);
  const wing: Wing = {
    ...valueMark({
      w: 'hl',
      clearable: true,
      key: 'c',
      values,
      button: {
        group: 'color',
        shortcut: 'H',
        icon: HIGHLIGHT_ICON,
        label: HIGHLIGHT_NAME,
        action: { kind: 'command', command: 'setHighlight', args: { c: first, toggleCurrent: true } },
      },
      styles: COLOR_CSS,
    }),
    basic: true,
    commands: { setHighlight: setValueCommand('hl', 'c', values) },
    claim: rejectUnknown('mark', 'data-color', values),
    context: {
      title: HIGHLIGHT_NAME,
      controls: [
        {
          kind: 'select',
          name: 'color',
          command: 'setHighlight',
          argKey: 'c',
          attr: 'c',
          label: HIGHLIGHT_NAME,
          values: swatchChoices(values, HIGHLIGHT_SWATCH, HIGHLIGHT_LABELS),
        },
      ],
    },
  };
  $markBuiltinAttrOwner(wing, ['hl']);
  return wing;
}
export const highlightWing: Wing = makeHighlightWing();

export function makeTextColorWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('tc', TEXT_COLORS, options);
  const first = values.includes('green') ? 'green' : (values[0] as string);
  const wing: Wing = {
    ...valueMark({
      w: 'tc',
      clearable: true,
      key: 'c',
      values,
      button: {
        group: 'color',
        shortcut: 'C',
        icon: TEXT_COLOR_ICON,
        label: TEXT_COLOR_NAME,
        action: { kind: 'command', command: 'setTextColor', args: { c: first, toggleCurrent: true } },
      },
      styles: COLOR_CSS,
    }),
    basic: true,
    commands: { setTextColor: setValueCommand('tc', 'c', values) },
    claim: rejectUnknown('span', 'data-color', values),
    context: {
      title: TEXT_COLOR_NAME,
      controls: [
        {
          kind: 'select',
          name: 'color',
          command: 'setTextColor',
          argKey: 'c',
          attr: 'c',
          label: TEXT_COLOR_NAME,
          values: swatchChoices(values, TEXT_SWATCH, TEXT_LABELS),
        },
      ],
    },
  };
  $markBuiltinAttrOwner(wing, ['tc']);
  return wing;
}
export const textColorWing: Wing = makeTextColorWing();

export function makeFontSizeWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('fs', FONT_SIZES, options);
  // 눌러서 나오는 건 크게다 — 크기 단추를 눌러 글자가 작아지길 바라는 사람은 없다. 좁혀서 lg가 빠졌으면 남은 값 중 가장 큰 것.
  // Pressing the button always makes text bigger — nobody expects a size button to shrink text. If `lg` was narrowed out, the largest remaining value wins.
  const first = values.includes('lg') ? 'lg' : (values[values.length - 1] as string);
  const wing: Wing = {
    ...valueMark({
      w: 'fs',
      clearable: true,
      key: 'v',
      values,
      button: {
        group: 'font',
        icon: FONT_SIZE_ICON,
        label: FONT_SIZE_NAME,
        action: { kind: 'command', command: 'setFontSize', args: { v: first } },
      },
      styles: SIZE_CSS,
    }),
    basic: true,
    commands: { setFontSize: setValueCommand('fs', 'v', values, 'paragraph') },
    claim: rejectUnknown('span', 'data-nabi-size', values),
    context: {
      title: FONT_SIZE_NAME,
      controls: [
        {
          kind: 'range',
          name: 'size',
          command: 'setFontSize',
          argKey: 'v',
          attr: 'v',
          label: FONT_SIZE_NAME,
          values: scale(values, SIZE_LABELS),
          rest: '',
          readout: true,
        },
      ],
    },
  };
  $markBuiltinAttrOwner(wing, ['fs']);
  return wing;
}
export const fontSizeWing: Wing = makeFontSizeWing();

// md 조립은 서체 중 고정폭 하나뿐 — 나머지(형광펜·글자색·크기·세리프 등)는 md에 자리가 없어 html로 낸다.
// Only monospace typeface gets md output — everything else (highlight, color, size, other faces) has no md slot and falls back to html.
//
// 마크가 섞였거나 글 양끝에 백틱이 있으면 코드 표식을 못 세워 html로 낸다 — 되읽을 때 엉뚱한 자리에서 닫히기 때문이다.
// Mixed marks or backticks at either end block the code-span syntax entirely, falling back to html — otherwise re-parsing would close the span in the wrong place.
const monoMd: MdBuilder = (node, ctx) => {
  if (node.a?.['v'] !== 'mono') return ctx.html();
  let raw = '';
  for (const child of node.ch) {
    if (typeof child !== 'string') return ctx.html();
    raw += child;
  }
  if (raw.startsWith('`') || raw.endsWith('`')) return ctx.html();
  const longest = Math.max(0, ...[...raw.matchAll(/`+/g)].map((m) => m[0].length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}${raw}${fence}`;
};

export function makeTypefaceWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('tf', TYPEFACES, options);
  // 산세리프는 표식 없는 글이 이미 입고 있어, 눌러서 나오는 건 그다음 얼굴 — 세리프가 남았으면 세리프, 아니면 산세리프 아닌 첫 얼굴.
  // Sans is already the unmarked default, so the button applies the next face instead — serif if available, otherwise the first non-sans option.
  const first = values.includes('serif')
    ? 'serif'
    : (values.find((value) => value !== 'sans') ?? (values[0] as string));
  const wing: Wing = {
    ...valueMark({
      w: 'tf',
      clearable: true,
      key: 'v',
      values,
      button: {
        group: 'font',
        icon: TYPEFACE_ICON,
        label: TYPEFACE_NAME,
        action: { kind: 'command', command: 'setTypeface', args: { v: first } },
      },
      styles: FACE_CSS,
    }),
    basic: true,
    toMd: monoMd,
    commands: { setTypeface: setValueCommand('tf', 'v', values, 'paragraph') },
    claim: rejectUnknown('span', 'data-nabi-typeface', values),
    context: {
      title: TYPEFACE_NAME,
      controls: [
        {
          // 칸 넷이지 슬라이더가 아니다 — 서체엔 순서가 없다(세리프가 고정폭보다 크지도 작지도 않다), 슬라이더는 없는 순서를 있는 것처럼 말한다.
          // Four discrete options, not a slider — typefaces have no order (serif isn't "bigger" than mono), and a slider would falsely imply one.
          kind: 'select',
          name: 'face',
          command: 'setTypeface',
          argKey: 'v',
          attr: 'v',
          label: TYPEFACE_NAME,
          values: namedChoices(values, FACE_LABELS),
        },
      ],
    },
  };
  $markBuiltinAttrOwner(wing, ['tf']);
  return wing;
}
export const typefaceWing: Wing = makeTypefaceWing();

// 툴바에 서는 차례 — 글꼴(서체·크기)이 맨 앞, 색은 글자색이 형광펜보다 앞이다.
// Toolbar order — font (typeface, size) leads, then color with text-color before highlight.
export const valueMarkWings: readonly Wing[] = [typefaceWing, fontSizeWing, textColorWing, highlightWing];
