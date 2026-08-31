// 정렬 wing의 w는 'align'이지만 attrKey는 'a' — 'a'는 링크 마크가 이미 노드 타입으로 쓴다.
// The align wing's w is 'align' but its attrKey is 'a' — 'a' itself is taken by the link mark's node type.
import { P, takesAlign, type AttrValue, type ElementNode, type NabiDoc } from '../../schema/index.js';
import {
  comparePositions,
  holderLength,
  holders,
  nodeAt,
  replaceAt,
  setParagraphAttr,
  type EditEnv,
} from '../../doc/index.js';
import { ordered, type Selection } from '../../caret/index.js';
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

// setParagraphAttr가 실제로 바꾸는 문단과 같은 목록이어야 토글 판정이 안 어긋난다.
// Must match exactly what setParagraphAttr touches, or the toggle check would desync from the apply.
function paragraphsIn(doc: NabiDoc, sel: Selection, env: EditEnv): ElementNode[] {
  const [start, end] = ordered(sel);
  const out: ElementNode[] = [];
  if (comparePositions(start, end) === 0) {
    const node = nodeAt(doc, start.path);
    if (node && node.w === P) out.push(node);
    return out;
  }
  for (const { path, node } of holders(doc, env)) {
    if (node.w !== P) continue;
    if (comparePositions({ path, offset: holderLength(node, env) }, start) < 0) continue;
    if (comparePositions({ path, offset: 0 }, end) > 0) continue;
    out.push(node);
  }
  return out;
}

// 첫 문단만 보고 토글하면 섞인 선택에서 뒤집힌다 — 전부 같은 값일 때만 해제한다.
// Toggling off only when every selected paragraph already matches avoids flipping mixed selections.
function toggledValue(now: readonly (AttrValue | undefined)[], value: AttrValue): AttrValue | null {
  return now.length > 0 && now.every((each) => each === value) ? null : value;
}

// 래퍼문단엔 정렬 말고 다른 속성이 못 얹히는 것은 doc 쪽이 지킨다(여기서 다시 안 막는다).
// doc already guarantees wrapper paragraphs take no attr but align, so this doesn't recheck it.
function attrCommand(key: string, parse: (raw: unknown) => AttrValue | null): Command {
  return (doc, sel, args, env) => {
    const raw = args['value'];
    let next: AttrValue | null = null;
    if (raw !== null) {
      const value = parse(raw);
      if (value === null) return null;
      next = toggledValue(
        paragraphsIn(doc, sel, env).map((node) => node.a?.[key]),
        value,
      );
    }
    const r = setParagraphAttr(doc, { anchor: sel.anchor, focus: sel.focus }, key, next, env);
    return { doc: r.doc, selection: { anchor: r.anchor ?? r.caret, focus: r.caret } };
  };
}

// --- 버튼 선언 (12) ------------------------------------------------------------------------------
// 셋이 시트 하나를 나눠 쓴다 — 옛 판은 wing마다 시트를 셌지만 이제 글자가 키라 한 번만 싣는다.
// The three wings share one stylesheet now, keyed by tag instead of once per wing as before.
const PARAGRAPH_CSS = `
.nabi-content h1 { font-size: 1.9em; }
.nabi-content h2 { font-size: 1.6em; }
.nabi-content h3 { font-size: 1.35em; }
.nabi-content h4 { font-size: 1.18em; }
.nabi-content h5 { font-size: 1.05em; }
.nabi-content h6 { font-size:.95em; color: var(--nabi-muted); }
.nabi-content h1,.nabi-content h2,.nabi-content h3,
.nabi-content h4,.nabi-content h5,.nabi-content h6 { font-weight: 650; line-height: 1.3; margin-block: 0; padding-block: 0 .4em; }
/* 제목 위의 숨은 **앞 블록이 든다** — 제목에 붙이면(padding-block-start) 그 띠가 제목의 몸이
   되고, 브라우저는 첫 줄 **위**의 점을 줄의 처음으로 셈한다(실측). 그러면 오른쪽을 눌렀는데
   캐럿이 왼쪽에 서는 그 일이 그대로 남는다. 앞 블록의 아래에 붙이면 마지막 줄 **아래**가 되어
   x 까지 풀린다 — 오른쪽을 누르면 앞 줄의 끝이다.
   값은 제목의 크기에서 나온다 (옛 .8em × 제목 font-size). 앞이 본문이면 본문 크기 = 상자
   크기라 옛 간격과 한 픽셀도 안 다르다.
   :has 가 없는 판에서는 이 줄만 안 걸린다 — 제목 위가 본문 사이만큼 좁아질 뿐 깨지지 않는다. */
.nabi-content > :has(+ h1) { padding-block-end: 1.52em; }
.nabi-content > :has(+ h2) { padding-block-end: 1.28em; }
.nabi-content > :has(+ h3) { padding-block-end: 1.08em; }
.nabi-content > :has(+ h4) { padding-block-end: .944em; }
.nabi-content > :has(+ h5) { padding-block-end: .84em; }
.nabi-content > :has(+ h6) { padding-block-end: .76em; }
/* 앞이 제목이면 **제 크기**로 잰다 — 위 여섯은 본문 크기를 재는 값이라, 큰 제목 뒤에 놓이면
   그만큼 부풀어 과해진다. 제목이 잇달아 오는 자리는 흔치 않고, 위 제목이 클수록 아래가 넓은
   것이 읽기에도 맞다. */
.nabi-content > :is(h1,h2,h3,h4,h5,h6):has(+ :is(h1,h2,h3,h4,h5,h6)) { padding-block-end: .8em; }
`;

const HEADING_ICON = '<path d="M4 4.2V11.8M10.5 4.2V11.8M4 8h6.5"/>';
const ALIGN_ICONS: Readonly<Record<string, string>> = {
  l: '<path d="M2.5 3.5h11M2.5 6.75h7M2.5 10h11M2.5 13.25h7"/>',
  c: '<path d="M2.5 3.5h11M4.5 6.75h7M2.5 10h11M4.5 13.25h7"/>',
  r: '<path d="M2.5 3.5h11M6.5 6.75h7M2.5 10h11M6.5 13.25h7"/>',
};
const DROPCAP_ICON =
  '<g transform="translate(8 8) scale(1.25) translate(-8 -8)" stroke-width="1.12">' +
  '<path d="M2.75 12.4 5.3 3.6l2.55 8.8M3.75 10.1h3.1"/>' +
  '<path d="M10.28 4.4h2.97M10.28 8h2.97M10.28 11.6h2.97"/></g>';

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
    svg: HEADING_ICON,
    label: HEADING_NAME,
    // **판을 안 띄운다** — 단계 고르기는 상황 줄의 일이다(값 마크 넷과 같은 규율).
    // 누르면 제목 1 이 되고, 그때부터 상황 줄에 H1~H6 여섯 칸이 서서 거기서 옮긴다. 다시 누르면
    // 문단으로 내려온다(커맨드의 토글 규칙). 여기서 차림표를 열면 단계를 고르는 자리가 둘이 된다.
    action: { kind: 'command', command: 'setHeading', args: { value: 1 } },
  },
  // 상황 줄 — 제목이 걸린 문단에서 여섯 칸이 뜬다. 지금 단계가 눌려 보이고, 한 번 눌러 옮긴다.
  // 자기 단계를 다시 누르면 문단으로 내려온다(커맨드의 토글 규칙 그대로다).
  // 칸의 글자는 `H1`…`H6` 이라 낱말이 아니다 — 그래서 원말은 `tip` 이 든다.
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

// --- 정렬 (래퍼문단에도 허용되는 유일한 문단 속성) ---------------------------------

// **정렬은 최상위 문단의 것이다.** 다른 문단 속성(제목·드롭캡)과 여기서 갈린다: 캐럿이 표의 칸
// 속이면 겨눔은 그 칸의 문단이 아니라 **표를 감싼 래퍼문단**이다. 안 그러면 "표를 가운데로" 가
// 칸 안의 글자만 가운데로 보내고, 표는 왼쪽에 그대로 남는다.
//
// 글 문단에서는 최상위가 곧 자기 자신이라 규칙이 하나로 끝난다 — 두 갈래를 안 만든다.
//
// **물건은 정렬을 마다할 수 있다** (`Wing.noAlign` — 코드 상자). 그 판정은 여기서 이름을
// 알아보는 것이 아니라 `takesAlign` 한 문이 답한다: 정렬 wing 은 어떤 물건이 마다했는지 모른다.
const setAlign: Command = (doc, sel, args, env) => {
  const raw = args['value'];
  const value = raw === 'l' || raw === 'c' || raw === 'r' ? raw : null;
  if (raw !== null && value === null) return null;

  // 겨눔은 선택이 걸친 **최상위 블록 전부**다. 여러 문단을 잡고 누르면 그 전부가 맞춰지고
  // 표 칸 속의 캐럿 하나는 그 표를 감싼 래퍼문단 하나가 된다(경로의 첫 칸이 곧 최상위다).
  const [start, end] = ordered(sel);
  const from = start.path[0];
  const to = end.path[0];
  if (from === undefined || to === undefined) return null;

  // 정렬을 마다한 물건의 래퍼문단은 겨눔에서 아예 빠진다 — 토글 셈에도 안 든다. 그 자리가
  // 셈에 들면 코드 상자 하나를 잡고 누를 때 "전부 그 값이 아니다" 가 되어 걸 것도 없이
  // 참을 답하고, 여럿을 잡았을 때는 옆 문단의 토글 방향까지 흔든다.
  const tops: { index: number; node: ElementNode }[] = [];
  for (let index = Math.min(from, to); index <= Math.max(from, to); index += 1) {
    const node = doc[index];
    if (node && node.w === P && takesAlign(node, env)) tops.push({ index, node });
  }
  if (tops.length === 0) return null; // 겨눌 문단이 없다 — 무변화 침묵

  const next =
    value === null
      ? null
      : toggledValue(
          tops.map((top) => top.node.a?.['a']),
          value,
        );

  let out = doc;
  let moved = false;
  for (const top of tops) {
    const now = top.node.a?.['a'] ?? null;
    if (now === next) continue; // 이미 그대로다
    const a: Record<string, AttrValue> = { ...(top.node.a ?? {}) };
    if (next === null) delete a['a'];
    else a['a'] = next;
    const node: ElementNode = {
      w: P,
      ch: top.node.ch,
      ...(Object.keys(a).length > 0 ? { a } : {}),
      ...(top.node._id !== undefined ? { _id: top.node._id } : {}),
    };
    out = replaceAt(out, [top.index], [node]);
    moved = true;
  }
  if (!moved) return null; // 아무것도 안 바뀐다 — 무변화 침묵
  return { doc: out, selection: sel };
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
  commands: { setAlign },
  // **셋이 줄에 나란히 선다 — 차림표로 접지 않는다.** 접으면 자리는 둘 아끼는 대신 지금 어느
  // 쪽으로 맞춰져 있는지가 줄에서 사라진다. 정렬은 자주 쓰고 **상태가 곧 답**이라 펼쳐 둔다.
  buttons: ALIGNS.map((value, at) => ({
    group: 'align',
    name: String(value),
    value: value as string,
    svg: ALIGN_ICONS[value as string] as string,
    label: ALIGN_LABELS[at] as LocaleText,
    action: { kind: 'command' as const, command: 'setAlign', args: { value } },
  })),
  // **정렬에는 상황 줄이 없다 — 툴바가 정렬의 유일한 문이다** (plan 의 결정, old 와 일부러 다름).
  //
  // 까닭: 정렬은 물건(표·그림·영상)에도 걸리는데 그 겨눔은 **래퍼문단**이다. 물건마다 자기 상황
  // 줄에 정렬 셋을 또 두면, 같은 일을 하는 자리가 넷(툴바 + 표 + 그림 + 영상)이 되고 넷이 조금씩
  // 어긋나기 시작한다. 툴바의 정렬 셋이 캐럿의 최상위 문단을 겨누므로(`setAlign`), 글이든 물건이든
  // **한 자리에서 한 규칙으로** 맞춰진다 — 상황 줄은 그 물건 고유의 것만 든다(폭·주소·대체 글).
  // 정렬의 생김새는 코어 시트가 이미 안다(`[data-nabi-align]`) — 문단 가족 시트를 그대로 나눠 쓴다.
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
    svg: DROPCAP_ICON,
    label: DROPCAP_NAME,
    action: { kind: 'command', command: 'toggleDropCap' },
  },
  // **드롭캡도 상황 줄이 없다** — 정렬과 같은 까닭이다(위 참고). 툴바 단추 하나가 이미 토글이고
  // 상황 줄에 또 두면 같은 일을 하는 자리가 둘이 된다. 걸린 문단에서 늘 눌린 칸 하나가 서는 것은
  // "끄기" 를 한 번 더 말하는 것일 뿐이다.
  styles: PARAGRAPH_CSS,
};

export const paragraphAttrWings: readonly Wing[] = [headingWing, alignWing, dropCapWing];
