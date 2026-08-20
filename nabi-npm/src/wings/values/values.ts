// 값 마크 넷 — 형광펜(hl)·글자색(tc)은 키가 `c`, 글자 크기(fs)·서체(tf)는 키가 `v` 다 (:
// 크기·서체는 문단 속성이 아니라 마크다). 값 목록은 old 에서 이름만 번역해 왔다.
//
// 값 거절의 선이 셋이다: ① 커맨드 — 목록 밖 값은 아예 안 돈다 ② 들여오기(claim) — 목록 밖
// 값을 단 태그는 껍데기를 벗고 글만 남는다 ③ 눌림 표시(currentValue) — 목록 밖 값은 없는 값이다.
import { isWrapper, runsOf, type Attrs, type NabiDoc } from '../../schema/index.js';
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
import type { LocaleText } from '../../locale/index.js';

// wing 이름 넷 — old 사전 이식(14 로케일).
const HIGHLIGHT_NAME: LocaleText = { ko: '형광펜', en: 'Highlight', ja: '蛍光ペン', zh: '荧光笔', de: 'Textmarker', fr: 'Surligneur', es: 'Resaltador', pt: 'Realce', ru: 'Маркер', ar: 'تمييز', hi: 'हाइलाइट', bn: 'হাইলাইট', ur: 'نمایاں', id: 'Stabilo' };
const TEXT_COLOR_NAME: LocaleText = { ko: '글자색', en: 'Text color', ja: '文字色', zh: '文字颜色', de: 'Textfarbe', fr: 'Couleur du texte', es: 'Color del texto', pt: 'Cor do texto', ru: 'Цвет текста', ar: 'لون النص', hi: 'टेक्स्ट का रंग', bn: 'লেখার রং', ur: 'متن کا رنگ', id: 'Warna teks' };
const FONT_SIZE_NAME: LocaleText = { ko: '글자 크기', en: 'Text size', ja: '文字サイズ', zh: '文字大小', de: 'Schriftgröße', fr: 'Taille du texte', es: 'Tamaño del texto', pt: 'Tamanho da letra', ru: 'Размер текста', ar: 'حجم الخط', hi: 'टेक्स्ट का आकार', bn: 'অক্ষরের আকার', ur: 'حروف کا سائز', id: 'Ukuran huruf' };
const TYPEFACE_NAME: LocaleText = { ko: '서체', en: 'Typeface', ja: '書体', zh: '字体', de: 'Schriftart', fr: 'Police', es: 'Tipografía', pt: 'Tipo de letra', ru: 'Гарнитура', ar: 'نوع الخط', hi: 'फ़ॉन्ट', bn: 'ফন্ট', ur: 'فونٹ', id: 'Jenis huruf' };

// --- 값 목록 (old 번역 — 이름이 곧 저장값이고, 색은 시트가 준다) ------------------------------

export const HIGHLIGHT_COLORS: readonly string[] = ['yellow', 'green', 'cyan', 'pink', 'purple', 'orange'];
export const TEXT_COLORS: readonly string[] = ['green', 'coral', 'violet', 'amber', 'blue'];
export const FONT_SIZES: readonly string[] = ['xs', 'sm', 'lg', 'xl'];
export const TYPEFACES: readonly string[] = ['sans', 'serif', 'mono', 'cursive'];

// --- 범위가 이미 든 값 ------------------------------------------------------------------------

// 범위의 글자 런 전부가 같은 값의 이 마크를 입었으면 그 값 — 아니면 undefined.
// 토글의 판정이다: 같은 값이면 벗고, 다른 값(또는 섞였으면)이면 그 값으로 갈아입는다.
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
    const samePathAs = (p: Position): boolean =>
      p.path.length === path.length && p.path.every((v, i) => v === path[i]);
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

// --- 커맨드 ------------------------------------------------------------------------------------

// **접힌 캐럿의 겨눔** — 값 마크 넷이 여기서 둘로 갈린다.
//
//   'mark'      형광펜·글자색 — 캐럿이 든 **그 마크가 덮은 글**이 겨눔이다. 마크 밖이면 걸 글자가
//               없으니 예약이다(다음에 칠 글자에 걸린다).
//   'paragraph' 글자 크기·서체 — **문단 전체**가 겨눔이다. 구조로는 마크(span)로 바뀌었지만
// 사람이 겪는 뜻은 그대로 "이 문단의 글자 크기"다. 낱말 하나만 커지는
//               것을 바라고 크기 단추를 누르는 사람은 없다 — 그건 긁어서 고를 때의 뜻이다.
//
// 어느 쪽이든 **긁어서 고른 범위가 있으면 그 범위가 답이다** — 넓히는 것은 접혔을 때뿐이다.
type CollapsedScope = 'mark' | 'paragraph';

// 값 하나를 건다 — 목록 밖 값은 여기서 죽는다(문서에 닿지 않는다). 같은 값이면 벗고, 다른 값이면 교체다.
function setValueCommand(
  w: string,
  key: string,
  values: readonly string[],
  scope: CollapsedScope = 'mark',
): Command {
  const allowed = new Set(values);
  return (doc, sel, args, env) => {
    const value = args[key];
    if (typeof value !== 'string' || !allowed.has(value)) return null;

    let aimed = sel;
    if (isCollapsed(sel)) {
      if (scope === 'paragraph') {
        const holder = nodeAt(doc, sel.focus.path);
        // 글이 한 글자도 없는 문단 — 걸 자리가 없으므로 예약이다(치는 순간 그 글자가 입는다).
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
    const strip = valueOver(doc, start, end, w, key, env) === value;
    const a: Attrs | null = strip ? null : { [key]: value };
    const r = setMark(doc, { anchor: start, focus: end }, w, a, env);
    // 넓혀서 겨눴으면 캐럿은 있던 자리에 그대로 둔다 — 한 번 바꿨다고 낱말·문단이 통째로 긁힌
    // 것처럼 보이면 안 된다. 긁어서 고른 것이면 그 범위가 답이다.
    if (aimed !== sel) {
      // **이어붙은 몸짓 하나만 예외다.** 새 값이 이웃 조각과 같아지면 둘은 저장값에서 하나로
      // 붙는다(같은 마크가 조각으로 남으면 왕복이 흔들리니 붙는 것이 옳다) — 그런데 붙고 나면
      // 문서에는 옛 경계가 없어, 캐럿만 남겨 두면 **다음 몸짓의 겨눔이 붙은 덩어리 전체**로
      // 넓어진다. 색을 고르다 이웃까지 물드는 "색 전이"가 그것이다. 사람이 바꾼 것은 캐럿이 든
      // 그 조각이지, 우연히 같은 색이 된 이웃이 아니다.
      //
      // 경계의 기억이 살 수 있는 자리는 셀렉션뿐이라(커맨드는 순수하고 문서는 이미 붙었다),
      // 붙었을 때만 겨눴던 조각을 범위로 남긴다 — 다음 몸짓은 그 범위를 그대로 겨누고, 눈에도
      // "네가 바꾼 것은 이만큼"이 보인다. 안 붙는 보통 몸짓은 위의 규칙 그대로 캐럿이다.
      const after = strip ? null : markSpanAt(r.doc, sel.focus, w, env);
      const fused =
        after !== null &&
        (comparePositions(after.selection.anchor, start) < 0 || comparePositions(after.selection.focus, end) > 0);
      return { doc: r.doc, selection: fused ? { anchor: start, focus: end } : sel };
    }
    return { doc: r.doc, selection: { anchor: r.anchor ?? r.caret, focus: r.caret } };
  };
}

// --- 들여오기 — 목록 밖 값을 단 태그는 마크가 아니다 -------------------------------------------

function rejectUnknown(tag: string, attr: string, values: readonly string[]): NonNullable<Wing['claim']> {
  const allowed = new Set(values);
  return (el, inner) => {
    if (el.tag !== tag) return null;
    const raw = el.attrs[attr];
    if (raw === undefined || raw === '' || allowed.has(raw)) return null; // 아는 값 — 기본 대응이 읽는다
    return inner(false); // 목록 밖 값 — 껍데기를 벗기고 글만 남긴다
  };
}

// 툴바 단추는 **판을 안 띄운다.** 값 고르기는 상황 줄의 일이다 (규칙: 컨텍스트 툴바로
// 통일) — 단추는 쓸 만한 기본값 하나를 바로 걸고, 같은 값이 다시 오면 벗는다(커맨드의 토글
// 규칙 그대로다). 여기서 차림표를 열면 값을 고르는 자리가 둘이 되고, 그 둘이 서로 다른 모양으로
// 같은 말을 한다.
// --- 버튼 선언 (12) ------------------------------------------------------------------------------
// 아이콘 속은 old 번역이고, 고를 값은 위의 목록 그대로다 — 목록이 두 곳에 살면 곧 갈린다.

const TEXT_COLOR_ICON =
  '<g transform="translate(8 8) scale(0.0125) translate(-480 420)" fill="currentColor" stroke="none">' +
  '<path d="M80 0v-160h800V0H80Zm140-280 210-560h100l210 560h-96l-50-144H368l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z"/></g>';

const HIGHLIGHT_ICON =
  '<g transform="translate(8 8) scale(0.0146) translate(-480 480)" fill="currentColor" stroke="none">' +
  '<path d="M280-320v-440q0-33 23.5-56.5T360-840q9 0 18 2t17 6l240 119q20 10 32.5 29.5T680-641v321H280Zm80-80h240v-241L360-760v360ZM160-120l22-65q8-25 29-40t47-15h444q26 0 47 15t29 40l22 65H160Z"/></g>';

const FONT_SIZE_ICON =
  '<g transform="translate(8 8) scale(1.0305) translate(-8.05 -8)" stroke-width="1.359">' +
  '<path d="M1.5 12.5 4.6 3.5h1.2l3.1 9M2.8 9.6h5"/><path d="M10.3 12.5 12 7.8h.9l1.7 4.7M11 10.9h2.7"/></g>';

const TYPEFACE_ICON =
  '<g transform="translate(8 8) scale(0.0218) translate(-480.5 479.4545)" fill="currentColor" stroke="none">' +
  '<path d="M338-241q16 0 23-10.5t9-24.5q2-10 3.5-20t3.5-22q2-11 4.5-24t5.5-30q23-5 45-8.5t43-5.5q23-3 45.5-4.5T564-394q5 24 10.5 43t11.5 36q8 23 17.5 38t23.5 26q14 11 30.5 12t28.5-9q9-7 9-21t-8-35q-5-11-8.5-22.5T670-350q-5-14-9-25.5t-7-22.5q13-1 23.5-4.5T695-412q7-6 10.5-14.5T709-445q0-11-4.5-18.5T691-476q-9-5-22.5-6.5t-30.5.5q-2-18-4-35.5t-5-35.5q-3-17-5.5-35t-7.5-35q-6-26-17-44.5T574-698q-13-11-28.5-16.5T511-720q-22 0-42 9t-40 27q-11 11-22 23.5T386-631q-8-6-14.5-8t-14.5-2q-11 0-18.5 6t-7.5 20q0 18-2 36t-6 36q-5 26-11 51.5T301-440q-11 2-19.5 5.5T267-427q-8 5-11.5 12.5T252-399q0 7 2 13t7 11q5 5 12 7.5t16 3.5q-1 12-1.5 22.5T287-321q0 21 3 36t9 25q6 10 15.5 14.5T338-241Zm71-223q6-23 14-44.5t18-44.5q16-37 34-59t32-22q11 0 19 17t13 51q3 20 5 43t4 43q-17 1-35 2.5t-35 3.5q-17 2-34.5 4.5T409-464Z"/></g>';

// 화면 색은 시트가 준다 — 문서에는 이름만 산다. **견본에 넘기는 것도 색 리터럴이 아니라 토큰
// 참조다**: 그래야 글에 칠해진 색과 견본의 색이 언제나 같은 값이고, 다크에서 함께 갈린다.
// 리터럴을 박으면 두 곳이 곧 어긋난다(글은 토큰을 보고 견본은 리터럴을 본다).
// 겸사겸사 이 문이 임의의 CSS 를 흘려 넣는 통로가 되지 않는다 — 토큰 이름 하나뿐이다.
const HIGHLIGHT_SWATCH: Readonly<Record<string, string>> = Object.fromEntries(
  ['yellow', 'green', 'cyan', 'pink', 'purple', 'orange'].map((name) => [name, `var(--nabi-hl-${name})`]),
);
const TEXT_SWATCH: Readonly<Record<string, string>> = Object.fromEntries(
  ['green', 'coral', 'violet', 'amber', 'blue'].map((name) => [name, `var(--nabi-tc-${name})`]),
);
// 값 이름 — old 사전 이식(14 로케일). 값 자체는 저장값이고 이름은 화면의 것이다.
const HIGHLIGHT_LABELS: Readonly<Record<string, LocaleText>> = {
  yellow: { ko: '노랑', en: 'Yellow', ja: '黄色', zh: '黄色', de: 'Gelb', fr: 'Jaune', es: 'Amarillo', pt: 'Amarelo', ru: 'Жёлтый', ar: 'أصفر', hi: 'पीला', bn: 'হলুদ', ur: 'پیلا', id: 'Kuning' },
  green: { ko: '연두', en: 'Green', ja: '黄緑', zh: '绿色', de: 'Grün', fr: 'Vert', es: 'Verde', pt: 'Verde', ru: 'Зелёный', ar: 'أخضر', hi: 'हरा', bn: 'সবুজ', ur: 'سبز', id: 'Hijau' },
  cyan: { ko: '하늘', en: 'Cyan', ja: '水色', zh: '天蓝', de: 'Hellblau', fr: 'Cyan', es: 'Celeste', pt: 'Ciano', ru: 'Голубой', ar: 'سماوي', hi: 'आसमानी', bn: 'আকাশি', ur: 'آسمانی', id: 'Biru muda' },
  pink: { ko: '분홍', en: 'Pink', ja: 'ピンク', zh: '粉色', de: 'Rosa', fr: 'Rose', es: 'Rosa', pt: 'Rosa', ru: 'Розовый', ar: 'وردي', hi: 'गुलाबी', bn: 'গোলাপি', ur: 'گلابی', id: 'Merah muda' },
  purple: { ko: '보라', en: 'Purple', ja: '紫', zh: '紫色', de: 'Lila', fr: 'Violet', es: 'Morado', pt: 'Roxo', ru: 'Фиолетовый', ar: 'بنفسجي', hi: 'बैंगनी', bn: 'বেগুনি', ur: 'ارغوانی', id: 'Ungu' },
  orange: { ko: '주황', en: 'Orange', ja: 'オレンジ', zh: '橙色', de: 'Orange', fr: 'Orange', es: 'Naranja', pt: 'Laranja', ru: 'Оранжевый', ar: 'برتقالي', hi: 'नारंगी', bn: 'কমলা', ur: 'نارنجی', id: 'Oranye' },
};
const TEXT_LABELS: Readonly<Record<string, LocaleText>> = {
  green: { ko: '초록', en: 'Green', ja: '緑', zh: '绿色', de: 'Grün', fr: 'Vert', es: 'Verde', pt: 'Verde', ru: 'Зелёный', ar: 'أخضر', hi: 'हरा', bn: 'সবুজ', ur: 'سبز', id: 'Hijau' },
  coral: { ko: '코랄', en: 'Coral', ja: 'サンゴ色', zh: '珊瑚色', de: 'Koralle', fr: 'Corail', es: 'Coral', pt: 'Coral', ru: 'Коралловый', ar: 'مرجاني', hi: 'मूंगा', bn: 'প্রবাল', ur: 'مونگا', id: 'Koral' },
  violet: { ko: '보라', en: 'Violet', ja: '紫', zh: '紫色', de: 'Violett', fr: 'Violet', es: 'Violeta', pt: 'Violeta', ru: 'Фиолетовый', ar: 'بنفسجي', hi: 'बैंगनी', bn: 'বেগুনি', ur: 'بنفشی', id: 'Ungu' },
  // amber 는 **호박(琥珀)** 이다 — 나무 진이 굳은 그 보석. 넷이 "금빛"으로 옮겨져 있었는데
  // (ko·hi·bn·ur), 금빛과 호박빛은 다른 색이고 애초에 다른 물건이다. 나머지 아홉은 처음부터
  // 호박을 가리켰고(琥珀色·Bernstein·Ambre·Янтарный·كهرماني…) 값도 그 편이다: #d97706.
  //
  // 고친 낱말은 **사이트의 데모 본문에서 가져왔다** — 주인이 검수한 그 글은 이미 셋 다 바르게
  // 옮겨 두고 있었다(hi अंबर · bn অ্যাম্বার · ur کہربائی). 같은 색을 두 자리에서 다른 말로
  // 부르면 그것이 다음 오역이 된다.
  amber: { ko: '호박', en: 'Amber', ja: '琥珀色', zh: '琥珀色', de: 'Bernstein', fr: 'Ambre', es: 'Ámbar', pt: 'Âmbar', ru: 'Янтарный', ar: 'كهرماني', hi: 'अंबर', bn: 'অ্যাম্বার', ur: 'کہربائی', id: 'Ambar' },
  blue: { ko: '파랑', en: 'Blue', ja: '青', zh: '蓝色', de: 'Blau', fr: 'Bleu', es: 'Azul', pt: 'Azul', ru: 'Синий', ar: 'أزرق', hi: 'नीला', bn: 'নীল', ur: 'نیلا', id: 'Biru' },
};
const SIZE_LABELS: Readonly<Record<string, LocaleText>> = {
  xs: { ko: '아주 작게', en: 'Extra small', ja: '最小', zh: '特小', de: 'Sehr klein', fr: 'Très petit', es: 'Muy pequeño', pt: 'Muito pequeno', ru: 'Очень мелкий', ar: 'صغير جدًا', hi: 'बहुत छोटा', bn: 'খুব ছোট', ur: 'بہت چھوٹا', id: 'Sangat kecil' },
  sm: { ko: '작게', en: 'Small', ja: '小', zh: '小', de: 'Klein', fr: 'Petit', es: 'Pequeño', pt: 'Pequeno', ru: 'Мелкий', ar: 'صغير', hi: 'छोटा', bn: 'ছোট', ur: 'چھوٹا', id: 'Kecil' },
  lg: { ko: '크게', en: 'Large', ja: '大', zh: '大', de: 'Groß', fr: 'Grand', es: 'Grande', pt: 'Grande', ru: 'Крупный', ar: 'كبير', hi: 'बड़ा', bn: 'বড়', ur: 'بڑا', id: 'Besar' },
  xl: { ko: '아주 크게', en: 'Extra large', ja: '最大', zh: '特大', de: 'Sehr groß', fr: 'Très grand', es: 'Muy grande', pt: 'Muito grande', ru: 'Очень крупный', ar: 'كبير جدًا', hi: 'बहुत बड़ा', bn: 'খুব বড়', ur: 'بہت بڑا', id: 'Sangat besar' },
};
const FACE_LABELS: Readonly<Record<string, LocaleText>> = {
  sans: { ko: '산세리프', en: 'Sans serif', ja: 'ゴシック体', zh: '无衬线', de: 'Serifenlos', fr: 'Sans empattement', es: 'Sin serifa', pt: 'Sem serifa', ru: 'Без засечек', ar: 'غير مذيل', hi: 'सैन्स सेरिफ़', bn: 'সান্স সেরিফ', ur: 'سینس سیرف', id: 'Tanpa serif' },
  serif: { ko: '세리프', en: 'Serif', ja: '明朝体', zh: '衬线', de: 'Serif', fr: 'Avec empattement', es: 'Con serifa', pt: 'Com serifa', ru: 'С засечками', ar: 'مذيل', hi: 'सेरिफ़', bn: 'সেরিফ', ur: 'سیرف', id: 'Berserif' },
  mono: { ko: '고정폭', en: 'Monospace', ja: '等幅', zh: '等宽', de: 'Dicktengleich', fr: 'Chasse fixe', es: 'Monoespaciada', pt: 'Monoespaçada', ru: 'Моноширинный', ar: 'ثابت العرض', hi: 'मोनोस्पेस', bn: 'মনোস্পেস', ur: 'یکساں چوڑائی', id: 'Lebar tetap' },
  cursive: { ko: '필기체', en: 'Cursive', ja: '筆記体', zh: '手写体', de: 'Schreibschrift', fr: 'Cursive', es: 'Manuscrita', pt: 'Cursiva', ru: 'Рукописный', ar: 'خط اليد', hi: 'हस्तलेख', bn: 'হস্তলিপি', ur: 'رواں خط', id: 'Tulisan tangan' },
};

const swatchChoices = (
  values: readonly string[],
  swatches: Readonly<Record<string, string>>,
  names: Readonly<Record<string, LocaleText>>,
): readonly WingChoice[] =>
  values.map((value) => ({ value, swatch: swatches[value] ?? value, label: names[value] ?? { en: value } }));

const namedChoices = (values: readonly string[], names: Readonly<Record<string, LocaleText>>): readonly WingChoice[] =>
  values.map((value) => ({ value, label: names[value] ?? { en: value } }));

// --- 상황 줄 (12) --------------------------------------------------------------------------------
// 네 wing 이 같은 자리에 선다: 캐럿이 그 마크 안이면 **지금 걸린 값**이 보이고 거기서 바로 바꾼다.
// 색 둘은 견본 줄(칸 대여섯이 한눈에 들어온다), 크기·서체 둘은 슬라이더다 — 값이 **순서를 갖기**
// 때문이다(작게→크게). 칸으로 늘어놓으면 줄을 넷씩 먹는데 슬라이더는 하나로 끝난다.

// 기본 칸 — 값 없음. 손잡이가 여기 앉으면 아무것도 안 걸린 것이고, 여기로 옮기면 벗는다.
const BASE_LABEL: LocaleText = { ko: '기본', en: 'Default', ja: '既定', zh: '默认', de: 'Standard', fr: 'Par défaut', es: 'Predeterminado', pt: 'Padrão', ru: 'По умолчанию', ar: 'افتراضي', hi: 'डिफ़ॉल्ट', bn: 'ডিফল্ট', ur: 'طے شدہ', id: 'Bawaan' };

// 순서가 있는 눈금 — 기본 칸이 **가운데**가 아니라 맨 앞이다: 목록이 작은 것부터 큰 것 순이라
// 그 앞이 "안 걸림" 의 자리다.
const scale = (values: readonly string[], names: Readonly<Record<string, LocaleText>>): readonly WingChoice[] => [
  { value: '', label: BASE_LABEL },
  ...namedChoices(values, names),
];

// 색 시트 — 형광펜과 글자색이 같은 표식(`data-color`)을 태그로 갈라 쓴다.
// 색은 **토큰이 준다**(코어 시트에 선언돼 있다) — 여기 리터럴을 박으면 다크에서 두 테마가 같은
// 색을 쓰게 되어, 어두운 바탕 위에서 형광펜이 글자를 삼킨다. 형광펜은 알파를 낮춘 색이라
// 글자색을 안 눌러도 된다: `color` 를 안 적어야 그 위의 글자색(tc)이 살아남는다.
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

// 글꼴도 토큰이다 — 호스트가 자기 글꼴로 갈아 끼울 자리가 있어야 한다(웹폰트는 호스트의 것이지
// 편집기의 것이 아니다). 표식 없는 글은 `--nabi-typeface-base` 를 입는다.
const FACE_CSS = `
.nabi-content [data-nabi-typeface="sans"] { font-family: var(--nabi-font, var(--nabi-font-fallback)); }
.nabi-content [data-nabi-typeface="serif"] { font-family: var(--nabi-font-serif, var(--nabi-font-serif-fallback)); }
.nabi-content [data-nabi-typeface="mono"] { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); }
/* 손글씨 얼굴은 x-높이가 낮아 **같은 px 로도 눈에는 작다.** \`font-size-adjust\` 는 글꼴을 px 가
   아니라 x-높이 기준으로 재우므로, 저장값의 크기를 안 건드리고 보이는 크기만 맞출 수 있다.

   기준은 라틴이 아니라 **한글**이다. x-높이는 라틴의 개념이라 그 값에 정직하게 맞추면(0.52)
   한글이 산세리프보다 3할 커진다 — 한글에는 x-높이가 없어 조정이 그대로 확대가 되기 때문이다.
   그래서 한글이 같아지는 값을 재어서 골랐다(같은 글줄의 한글 폭: 산세리프 97px, 흘림 100px).
   본문 글꼴이 다른 호스트는 토큰 하나로 다시 잰다. */
.nabi-content [data-nabi-typeface="cursive"] {
  font-family: var(--nabi-font-cursive, var(--nabi-font-cursive-fallback));
  font-size-adjust: var(--nabi-cursive-adjust, 0.4);
}

/* 고르는 칸도 **자기가 가리키는 얼굴로** 그린다 — 이름만 늘어놓으면 무엇을 고르는지가 글자가
   아니라 낱말 뜻으로만 전해진다. 흘림 칸은 같은 규칙으로 재운다: 안 재우면 그 칸만 유독 작아
   무엇을 고르는 자리인지 안 읽힌다. */
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="sans"] { font-family: var(--nabi-font, var(--nabi-font-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="serif"] { font-family: var(--nabi-font-serif, var(--nabi-font-serif-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="mono"] { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); }
.nabi-ctx-group[data-wing="tf"] .nabi-btn[data-value="cursive"] {
  font-family: var(--nabi-font-cursive, var(--nabi-font-cursive-fallback));
  font-size-adjust: var(--nabi-cursive-adjust, 0.4);
}
`;

// --- 값 좁히기 (087) — 팩토리가 계약의 원본이다 ---------------------------------------------------
// 호스트가 값 목록을 줄이는 문은 이 팩토리 넷뿐이다(빌더의 `.use('tf', { values })` 도 여기를
// 부른다 — 계약은 하나여야 한다). 좁힌 목록은 **계약 전체**에 걸린다: 커맨드(목록 밖 값은 안
// 돈다)·들여오기(claim 이 껍데기를 벗긴다)·상황 줄(칸이 줄어든다)이 한 몸으로 좁아진다 —
// 상황 줄만 줄이고 커맨드를 열어 두면 플러그인이 그 틈으로 목록 밖 값을 건다.

export interface ValueWingOptions {
  // 남길 값 — 전체 목록의 부분집합. 차례는 준 차례가 아니라 공식 차례다(차례는 부르는 차례가
  // 아니다 — 툴바 규칙과 같은 결).
  readonly values?: readonly string[];
}

// 목록 밖 값은 그 자리에서 죽는다 — 조용히 거르면 사람은 자기가 준 값이 걸린 줄 안다(087 §5).
// 던지는 말에 받는 목록을 싣는다: CDN 사용자에게는 이 말이 곧 문서다.
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

// --- wing 넷 ------------------------------------------------------------------------------------

export function makeHighlightWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('hl', HIGHLIGHT_COLORS, options);
  // 기본색은 노랑이다 — 형광펜이라는 말이 먼저 뜻하는 색. 좁혀서 노랑이 빠졌으면 남은 첫 색이다.
  const first = values.includes('yellow') ? 'yellow' : (values[0] as string);
  return {
    ...valueMark({
      w: 'hl',
      key: 'c',
      values,
      button: {
        group: 'color',
        shortcut: 'H',
        svg: HIGHLIGHT_ICON,
        label: HIGHLIGHT_NAME,
        action: { kind: 'command', command: 'setHighlight', args: { c: first } },
      },
      // 형광펜과 글자색이 시트 하나를 나눠 쓴다 — 같은 글이라 문서에는 한 번만 실린다.
      styles: COLOR_CSS,
    }),
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
}
export const highlightWing: Wing = makeHighlightWing();

export function makeTextColorWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('tc', TEXT_COLORS, options);
  const first = values.includes('green') ? 'green' : (values[0] as string);
  return {
    ...valueMark({
      w: 'tc',
      key: 'c',
      values,
      button: {
        group: 'color',
        shortcut: 'C',
        svg: TEXT_COLOR_ICON,
        label: TEXT_COLOR_NAME,
        action: { kind: 'command', command: 'setTextColor', args: { c: first } },
      },
      styles: COLOR_CSS,
    }),
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
}
export const textColorWing: Wing = makeTextColorWing();

export function makeFontSizeWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('fs', FONT_SIZES, options);
  // 눌러서 나오는 것은 **크게**다 — 눈금이 작은 것부터라 첫 칸을 걸면 글자가 작아지는데
  // 크기 단추를 눌러 글자가 작아지기를 바라는 사람은 없다. 좁혀서 lg 가 빠졌으면 남은 것 중
  // 가장 큰 값이다(목록이 작은 것부터 큰 것 순이라 마지막이 그 값이다).
  const first = values.includes('lg') ? 'lg' : (values[values.length - 1] as string);
  return {
    ...valueMark({
      w: 'fs',
      key: 'v',
      values,
      button: {
        group: 'font',
        svg: FONT_SIZE_ICON,
        label: FONT_SIZE_NAME,
        action: { kind: 'command', command: 'setFontSize', args: { v: first } },
      },
      styles: SIZE_CSS,
    }),
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
}
export const fontSizeWing: Wing = makeFontSizeWing();

export function makeTypefaceWing(options: ValueWingOptions = {}): Wing {
  const values = narrowed('tf', TYPEFACES, options);
  // 산세리프는 표식 없는 글이 이미 입고 있는 것이라, 눌러서 나오는 것은 그다음 얼굴이다 —
  // 세리프가 남았으면 세리프, 아니면 산세리프가 아닌 첫 얼굴, 산세리프뿐이면 그것이다.
  const first = values.includes('serif') ? 'serif' : (values.find((value) => value !== 'sans') ?? (values[0] as string));
  return {
    ...valueMark({
      w: 'tf',
      key: 'v',
      values,
      button: {
        group: 'font',
        svg: TYPEFACE_ICON,
        label: TYPEFACE_NAME,
        action: { kind: 'command', command: 'setTypeface', args: { v: first } },
      },
      styles: FACE_CSS,
    }),
    commands: { setTypeface: setValueCommand('tf', 'v', values, 'paragraph') },
    claim: rejectUnknown('span', 'data-nabi-typeface', values),
    context: {
      title: TYPEFACE_NAME,
      controls: [
        {
          // **칸 넷이다 — 슬라이더가 아니다.** 서체는 순서가 없다: 세리프가 고정폭보다 "크거나"
          // "작지" 않다. 눈금은 순서 있는 값의 모양이고(글자 크기가 그렇다), 순서 없는 값에 눈금을
          // 씌우면 없는 차례를 있는 것처럼 말하게 된다.
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
}
export const typefaceWing: Wing = makeTypefaceWing();

// 줄의 차례 — old 배치 그대로다: 글꼴(서체·크기)이 맨 앞에 서고, 색은 글자색이 형광펜보다 앞이다.
export const valueMarkWings: readonly Wing[] = [typefaceWing, fontSizeWing, textColorWing, highlightWing];
