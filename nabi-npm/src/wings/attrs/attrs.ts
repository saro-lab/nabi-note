// 정렬 wing의 w는 'align'이지만 attrKey는 'a' — 'a'는 링크 마크가 이미 노드 타입으로 쓴다.
// The align wing's w is 'align' but its attrKey is 'a' — 'a' itself is taken by the link mark's node type.
import { type AttrValue, type ElementNode } from '../../schema/index.js';
import { nodeAt, replaceAt } from '../../doc/index.js';
import { paragraphTargets } from '../../wing/paragraph-target.js';
import type { Command } from '../../editor/index.js';
import type { InputRule, Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

const HEADING_NAME: LocaleText = {
  ko: '제목',
  en: 'Heading',
  ja: '見出し',
  zh: '标题',
  de: 'Überschrift',
  fr: 'Titre',
  es: 'Encabezado',
  pt: 'Título',
  ru: 'Заголовок',
  ar: 'عنوان',
  hi: 'शीर्षक',
  bn: 'শিরোনাম',
  ur: 'سرخی',
  id: 'Judul',
};
const DROPCAP_NAME: LocaleText = {
  ko: '드롭 캡',
  en: 'Drop cap',
  ja: 'ドロップキャップ',
  zh: '首字下沉',
  de: 'Initiale',
  fr: 'Lettrine',
  es: 'Letra capital',
  pt: 'Capitular',
  ru: 'Буквица',
  ar: 'حرف استهلالي',
  hi: 'ड्रॉप कैप',
  bn: 'ড্রপ ক্যাপ',
  ur: 'ڈراپ کیپ',
  id: 'Drop cap',
};
const ALIGN_LABELS: readonly LocaleText[] = [
  {
    ko: '왼쪽 정렬',
    en: 'Align left',
    ja: '左揃え',
    zh: '左对齐',
    de: 'Linksbündig',
    fr: 'Aligner à gauche',
    es: 'Alinear a la izquierda',
    pt: 'Alinhar à esquerda',
    ru: 'По левому краю',
    ar: 'محاذاة لليسار',
    hi: 'बाएँ संरेखित',
    bn: 'বাঁয়ে সারিবদ্ধ',
    ur: 'بائیں سیدھ',
    id: 'Rata kiri',
  },
  {
    ko: '가운데 정렬',
    en: 'Align center',
    ja: '中央揃え',
    zh: '居中对齐',
    de: 'Zentriert',
    fr: 'Centrer',
    es: 'Centrar',
    pt: 'Centralizar',
    ru: 'По центру',
    ar: 'توسيط',
    hi: 'बीच में संरेखित',
    bn: 'মাঝে সারিবদ্ধ',
    ur: 'درمیانی سیدھ',
    id: 'Rata tengah',
  },
  {
    ko: '오른쪽 정렬',
    en: 'Align right',
    ja: '右揃え',
    zh: '右对齐',
    de: 'Rechtsbündig',
    fr: 'Aligner à droite',
    es: 'Alinear a la derecha',
    pt: 'Alinhar à direita',
    ru: 'По правому краю',
    ar: 'محاذاة لليمين',
    hi: 'दाएँ संरेखित',
    bn: 'ডানে সারিবদ্ধ',
    ur: 'دائیں سیدھ',
    id: 'Rata kanan',
  },
];
// 열넷 로케일 x 여섯 레벨을 손으로 안 적고 함수 하나로 짓는다.
// Builds all locale x level strings from one function instead of writing them out by hand.
const headingLevel = (n: number): LocaleText => ({
  ko: `제목 ${n}`,
  en: `Heading ${n}`,
  ja: `見出し ${n}`,
  zh: `标题 ${n}`,
  de: `Überschrift ${n}`,
  fr: `Titre ${n}`,
  es: `Encabezado ${n}`,
  pt: `Título ${n}`,
  ru: `Заголовок ${n}`,
  ar: `عنوان ${n}`,
  hi: `शीर्षक ${n}`,
  bn: `শিরোনাম ${n}`,
  ur: `سرخی ${n}`,
  id: `Judul ${n}`,
});

const LEVELS: readonly AttrValue[] = [1, 2, 3, 4, 5, 6];
const ALIGNS: readonly AttrValue[] = ['l', 'c', 'r'];

// 첫 문단만 보고 토글하면 섞인 선택에서 뒤집힌다 — 전부 같은 값일 때만 해제한다.
// Toggling off only when every selected paragraph already matches avoids flipping mixed selections.
function toggledValue(now: readonly (AttrValue | undefined)[], value: AttrValue): AttrValue | null {
  return now.length > 0 && now.every((each) => each === value) ? null : value;
}

function attrCommand(key: string, parse: (raw: unknown) => AttrValue | null): Command {
  return (doc, sel, args, env) => {
    const raw = args['value'];
    const value = raw === null ? null : parse(raw);
    if (raw !== null && value === null) return null;
    const targets = paragraphTargets(doc, sel, key, env);
    if (targets.length === 0) return null;
    const next =
      value === null
        ? null
        : toggledValue(
            targets.map(({ node }) => node.a?.[key]),
            value,
          );
    let out = doc;
    for (const target of targets) {
      const current = nodeAt(out, target.path);
      if (!current || (current.a?.[key] ?? null) === next) continue;
      const a: Record<string, AttrValue> = { ...(current.a ?? {}) };
      if (next === null) delete a[key];
      else a[key] = next;
      const node: ElementNode = {
        w: current.w,
        ch: current.ch,
        ...(Object.keys(a).length > 0 ? { a } : {}),
        ...(current._id !== undefined ? { _id: current._id } : {}),
      };
      out = replaceAt(out, target.path, [node]);
    }
    return out === doc ? null : { doc: out, selection: sel };
  };
}

// 셋이 시트 하나를 나눠 쓴다 — 옛 판은 wing마다 시트를 셌지만 이제 글자가 키라 한 번만 싣는다.
// The three wings share one stylesheet now, keyed by tag instead of once per wing as before.
const PARAGRAPH_CSS = `
.nabi-content { counter-reset: nabi-h1; }
.nabi-content h1:where(:not(:empty):not(:has(> br:only-child)):not([data-nabi-heading-empty]):not(details *, [hidden], [hidden] *)) { counter-increment: nabi-h1; }
.nabi-content h1:where(:not(:empty):not(:has(> br:only-child)):not([data-nabi-heading-empty]):not(details *, [hidden], [hidden] *))::before { content: counter(nabi-h1) ". "; font-variant-numeric: tabular-nums; color: var(--nabi-muted); }
.nabi-content h1[data-nabi-outline-number]::before { content: attr(data-nabi-outline-number) ". "; }
.nabi-content h1[data-nabi-outline-number=""] { counter-increment: none; }
.nabi-content h1[data-nabi-outline-number=""]::before { content: none; }
.nabi-content h1 { font-size: 1.9em; }
.nabi-content h2 { font-size: 1.6em; }
.nabi-content h3 { font-size: 1.35em; }
.nabi-content h4 { font-size: 1.18em; }
.nabi-content h5 { font-size: 1.05em; }
.nabi-content h6 { font-size:.95em; color: var(--nabi-muted); }
.nabi-content h1,.nabi-content h2,.nabi-content h3,
.nabi-content h4,.nabi-content h5,.nabi-content h6 { font-weight: 650; line-height: 1.3; text-align: start; margin-block: 0; padding-block: 0 .4em; }
/* 제목 앞 간격은 제목이 아니라 앞 블록의 padding-block-end로 준다 — 제목 쪽에 주면 그 띠가 제목의
   몸이 되어, 브라우저가 줄 시작을 그 위의 점으로 세는 바람에 오른쪽을 눌러도 캐럿이 왼쪽에 선다.
   :has 미지원 브라우저에서는 이 줄만 안 걸려 간격이 좁아질 뿐 깨지지는 않는다. */
/* The gap before a heading is the preceding block's padding-block-end, not the heading's own —
   putting it on the heading itself would make that band part of the heading's line box, and the
   browser would count the line as starting above it, landing the caret on the left on a right click.
   Browsers without :has just skip this rule; the gap shrinks but nothing breaks. */
.nabi-content > :has(+ h1) { padding-block-end: 1.52em; }
.nabi-content > :has(+ h2) { padding-block-end: 1.28em; }
.nabi-content > :has(+ h3) { padding-block-end: 1.08em; }
.nabi-content > :has(+ h4) { padding-block-end: .944em; }
.nabi-content > :has(+ h5) { padding-block-end: .84em; }
.nabi-content > :has(+ h6) { padding-block-end: .76em; }
/* 앞이 제목이면 그 제목 자신의 크기로 잰다 — 본문 크기 기준인 위 여섯 줄을 그대로 쓰면 큰 제목
   뒤에서 간격이 과하게 부풀기 때문이다. */
/* When the preceding block is itself a heading, the gap scales to that heading's own size — reusing
   the body-text values above would overinflate the gap after a large heading. */
.nabi-content > :is(h1,h2,h3,h4,h5,h6):has(+ :is(h1,h2,h3,h4,h5,h6)) { padding-block-end: .8em; }
`;

const HEADING_ICON = 'attrs-heading';
const ALIGN_ICONS: Readonly<Record<string, string>> = {
  l: 'attrs-l',
  c: 'attrs-c',
  r: 'attrs-r',
} as const;
const DROPCAP_ICON = 'attrs-dropcap';

// --- 제목 h (1~6, wing 하나가 값 전부 — 눌림은 currentValue 로 답한다) -------------------------

const headingRules: readonly InputRule[] = LEVELS.map((level): InputRule => ({
  trigger: 'space',
  pattern: new RegExp(`^#{${level as number}}$`), // `#######`(7개)은 어느 레벨도 안 잡는다
  run: () => ({ name: 'setHeading', args: { value: level } }),
}));

export const headingWing: Wing = {
  w: 'h',
  place: 'attr',
  clearable: true,
  basic: true,
  attrKey: 'h',
  attrValues: LEVELS,
  currentValue: (node) => {
    const h = node.a?.['h'];
    return typeof h === 'number' && Number.isInteger(h) && h >= 1 && h <= 6 ? String(h) : undefined;
  },
  commands: {
    setHeading: attrCommand('h', (raw) =>
      typeof raw === 'number' && Number.isInteger(raw) && raw >= 1 && raw <= 6 ? raw : null,
    ),
  },
  inputRules: headingRules,
  button: {
    group: 'heading',
    icon: HEADING_ICON,
    label: HEADING_NAME,
    // 판을 안 띄운다 — 누르면 곧장 제목 1이 되고, 단계 고르기는 그 뒤 상황 줄의 일이다.
    // No popup — pressing goes straight to Heading 1; picking a level from there is the context bar's job.
    action: { kind: 'command', command: 'setHeading', args: { value: 1 } },
  },
  // 상황 줄 — 제목 문단에서 여섯 칸이 뜨고, 칸 글자는 `H1`…`H6`이라 원말은 `tip`이 대신 든다.
  // Context bar — six slots appear on a heading paragraph; since the labels are just `H1`-`H6`, the full name lives in `tip`.
  context: {
    title: HEADING_NAME,
    controls: [
      {
        kind: 'select',
        name: 'level',
        command: 'setHeading',
        argKey: 'value',
        label: HEADING_NAME,
        // 보이는 글자(`H1`)는 줄임말이다 — 낭독과 이름표는 칸마다 자기 원말("제목 1")을 읽는다.
        values: LEVELS.map((level) => ({
          value: level as number,
          label: { ko: `H${level as number}`, en: `H${level as number}` },
          tip: headingLevel(level as number),
        })),
      },
    ],
  },
  styles: PARAGRAPH_CSS,
};

export const alignWing: Wing = {
  w: 'align',
  place: 'attr',
  clearable: true,
  basic: true,
  attrKey: 'a',
  attrValues: ALIGNS,
  currentValue: (node) => {
    const a = node.a?.['a'];
    return a === 'l' || a === 'c' || a === 'r' ? a : undefined;
  },
  commands: { setAlign: attrCommand('a', (raw) => (raw === 'l' || raw === 'c' || raw === 'r' ? raw : null)) },
  // 셋이 줄에 나란히 선다 — 차림표로 접으면 지금 어느 쪽인지가 줄에서 안 보이게 된다.
  // All three sit in the row rather than collapsing into a menu, which would hide the current state.
  buttons: ALIGNS.map((value, at) => ({
    group: 'align',
    name: String(value),
    value: value as string,
    icon: ALIGN_ICONS[value as string] as string,
    label: ALIGN_LABELS[at] as LocaleText,
    action: { kind: 'command' as const, command: 'setAlign', args: { value } },
  })),
  // 정렬에는 상황 줄이 없다 — 툴바가 유일한 문이다. 물건마다 상황 줄에 정렬 셋을 또 두면 같은 일을
  // 하는 자리가 여럿이 되어 서로 어긋나기 시작하므로, 하나의 규칙(`setAlign`)으로만 맞춘다.
  // Alignment has no context bar — the toolbar is its only door. Duplicating the align buttons into every object's own context bar would create several places doing the same job, drifting apart over time; routing everything through one command (`setAlign`) keeps it consistent.
  styles: PARAGRAPH_CSS,
};

// --- 드롭캡 (불리언 1 — 분할 시 첫 글자를 가진 쪽만 갖는다: doc 의 규칙) -----------------------

export const dropCapWing: Wing = {
  w: 'dc',
  place: 'attr',
  clearable: true,
  basic: true,
  attrKey: 'dc',
  attrValues: [1],
  currentValue: (node) => (node.a?.['dc'] === 1 ? '1' : undefined),
  commands: {
    // 값이 하나뿐이라 인자가 없어도 된다 — 누르면 걸리고 다시 누르면 풀린다.
    toggleDropCap: attrCommand('dc', (raw) => (raw === undefined || raw === 1 || raw === '1' ? 1 : null)),
  },
  button: {
    group: 'font',
    icon: DROPCAP_ICON,
    label: DROPCAP_NAME,
    action: { kind: 'command', command: 'toggleDropCap' },
  },
  // 드롭캡도 상황 줄이 없다 — 툴바 단추 하나가 이미 토글이라 또 두면 같은 일을 하는 자리가 둘이 된다.
  // Drop cap also has no context bar — the toolbar button already toggles it, so a duplicate there would just be a second way to say the same thing.
  styles: PARAGRAPH_CSS,
};

export const paragraphAttrWings: readonly Wing[] = [headingWing, alignWing, dropCapWing];
