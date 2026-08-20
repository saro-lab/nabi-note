// 코드 code — 평문 문단 하나 고정이다: 엔터는 분할이 아니라 라인이고(인라인 홀더라
// doc 이 그렇게 라우팅한다), 속에는 마크가 없다. 마크 금지는 말이 아니라 repair 가 지킨다
// 어떤 길로 마크가 들어와도 cocoon 을 지나며 껍데기가 벗겨지고 글자만 남는다.
import { BR, P, isElement, isWrapper, type ElementNode, type NabiNode } from '../../schema/index.js';
import { DEFAULT_BUILDERS } from '../../html/index.js';
import { language } from '../../html/values.js';
import { caretAt, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { replaceAt } from '../../doc/index.js';
import { topNodeAt, type OnKey, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';
import { codeAttach } from './paint.js';

// 이름들 — old 사전 이식(14 로케일).
const CODE_NAME: LocaleText = { ko: '코드', en: 'Code', ja: 'コード', zh: '代码', de: 'Code', fr: 'Code', es: 'Código', pt: 'Código', ru: 'Код', ar: 'شيفرة', hi: 'कोड', bn: 'কোড', ur: 'کوڈ', id: 'Kode' };
const LANGUAGE_NAME: LocaleText = { ko: '언어', en: 'Language', ja: '言語', zh: '语言', de: 'Sprache', fr: 'Langage', es: 'Lenguaje', pt: 'Linguagem', ru: 'Язык', ar: 'اللغة', hi: 'भाषा', bn: 'ভাষা', ur: 'زبان', id: 'Bahasa' };
const LANGUAGE_CLEAR: LocaleText = { ko: '언어 없음', en: 'No language', ja: '言語なし', zh: '无语言', de: 'Keine Sprache', fr: 'Aucun langage', es: 'Sin lenguaje', pt: 'Sem linguagem', ru: 'Без языка', ar: 'بدون لغة', hi: 'कोई भाषा नहीं', bn: 'ভাষা নেই', ur: 'کوئی زبان نہیں', id: 'Tanpa bahasa' };

const CODE_ICON =
  '<g transform="translate(8 8) scale(1.2273) translate(-8 -8)" stroke-width="1.141">' +
  '<path d="M5.75 5.25 2.5 8l3.25 2.75M10.25 5.25 13.5 8l-3.25 2.75"/></g>';

// 상황 줄에 단추로 서는 언어들 — old 목록 그대로다. 이름은 하이라이터에 넘어가는 **값**이라
// 번역하지 않는다.
const COMMON_LANGUAGES: readonly string[] = [
  'javascript', 'typescript', 'jsx', 'tsx',
  'python', 'java', 'kotlin', 'swift',
  'c', 'cpp', 'csharp', 'go', 'rust',
  'php', 'ruby', 'sql',
  'html', 'xml', 'css', 'scss',
  'json', 'yaml', 'toml', 'markdown',
  'bash', 'powershell', 'dockerfile', 'diff',
];

const CODE_CSS = `
/* 갓 만들어진 빈 상자도 상자로 보여야 한다 — 속이 한 줄도 없으면 padding 만 남아 납작하게
   찌그러진다. 한 줄 높이를 바닥으로 둔다. */
.nabi-content pre {
  background: var(--nabi-soft); border-radius: var(--nabi-radius, 6px); padding:.7em.9em;
  overflow-x: auto; font-size:.9em; min-block-size: 1.6em; box-sizing: content-box;
}
/* 코드 상자의 글꼴도 **서체 갈래의 고정폭과 같은 토큰**을 쓴다 — 호스트가 그 하나를 덮으면
   서체 wing 의 '고정폭' 과 코드 상자가 함께 따라온다. 여기만 손으로 적으면 둘이 갈라진다. */
.nabi-content pre > code { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); white-space: pre-wrap; }
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
`;

// 언어 하나를 갈아 끼운다 — 빈 값이면 표식을 걷는다(언어 없음). 코드 상자를 안 만들고 안 없앤다.
const setCodeLanguage: Command = (doc, sel, args) => {
  const [start] = ordered(sel);
  const top = topNodeAt(doc, start.path);
  const box = top?.ch[0];
  if (!top || box === undefined || !isElement(box) || box.w !== 'code') return null;
  const lang = typeof args['lang'] === 'string' ? language(args['lang']) : undefined;
  if ((box.a?.['lang'] ?? undefined) === lang) return null; // 같은 값 — 무변화 침묵
  const next: ElementNode = {
    w: 'code',
...(lang !== undefined ? { a: { lang } } : {}),
    ch: box.ch,
...(box._id !== undefined ? { _id: box._id } : {}),
  };
  return { doc: replaceAt(doc, [start.path[0] as number, 0], [next]), selection: sel };
};

// 평문으로 펴기 — 마크는 껍데기를 벗고, 라인은 라인으로 남고, 이웃한 글자는 이어진다.
function plainChildren(nodes: readonly NabiNode[]): NabiNode[] {
  const out: NabiNode[] = [];
  const push = (node: NabiNode): void => {
    if (typeof node === 'string') {
      if (node === '') return;
      const last = out[out.length - 1];
      if (typeof last === 'string') {
        out[out.length - 1] = last + node;
        return;
      }
    }
    out.push(node);
  };
  for (const node of nodes) {
    if (typeof node === 'string') {
      push(node);
      continue;
    }
    if (node.w === BR) {
      push(node.ch.length === 0 ? node : { w: BR, ch: [] });
      continue;
    }
    for (const inner of plainChildren(node.ch)) push(inner);
  }
  return out;
}

function repairCode(node: ElementNode): ElementNode {
  const ch = plainChildren(node.ch);
  const lang = language(node.a?.['lang']);
  const keys = Object.keys(node.a ?? {});
  const sameCh = ch.length === node.ch.length && ch.every((child, i) => child === node.ch[i]);
  const sameAttrs = lang === node.a?.['lang'] ? keys.length === 1 : lang === undefined && keys.length === 0;
  if (sameCh && sameAttrs) return node;
  return {
    w: node.w,
...(lang !== undefined ? { a: { lang } } : {}),
    ch,
...(node._id !== undefined ? { _id: node._id } : {}),
  };
}

// 감싸기·풀기 — 블록 하나가 줄 하나이고, 풀면 줄 하나가 문단 하나다.
const toggleCode: Command = (doc, sel, args, env) => {
  const [start, end] = ordered(sel);
  const a = (start.path[0] ?? 0) as number;
  const b = (end.path[0] ?? a) as number;
  const covered = doc.slice(a, b + 1);
  if (covered.length === 0) return null;

  const boxIn = (block: ElementNode): ElementNode | null => {
    if (!isWrapper(block, env)) return null;
    const inner = block.ch[0];
    return isElement(inner) && inner.w === 'code' ? inner : null;
  };

  if (covered.every((block) => boxIn(block) !== null)) {
    const blocks: ElementNode[] = [];
    for (const block of covered) {
      const box = boxIn(block) as ElementNode;
      let line: NabiNode[] = [];
      for (const child of box.ch) {
        if (isElement(child) && child.w === BR) {
          blocks.push({ w: P, ch: line });
          line = [];
          continue;
        }
        line.push(child);
      }
      blocks.push({ w: P, ch: line });
    }
    const next = [...doc.slice(0, a),...blocks,...doc.slice(b + 1)];
    return { doc: next, selection: caretAt({ path: [a], offset: 0 }) };
  }

  const lines: NabiNode[] = [];
  covered.forEach((block, i) => {
    if (i > 0) lines.push({ w: BR, ch: [] });
    for (const piece of plainChildren(block.ch)) lines.push(piece);
  });
  const lang = typeof args['lang'] === 'string' ? language(args['lang']) : undefined;
  const box: ElementNode = { w: 'code',...(lang !== undefined ? { a: { lang } } : {}), ch: lines };
  const next = [...doc.slice(0, a), { w: P, ch: [box] } as ElementNode,...doc.slice(b + 1)];
  // 코드 상자 자신이 캐럿의 홀더다 (인라인 홀더 — 속은 글과 라인뿐이다).
  return { doc: next, selection: caretAt({ path: [a, 0], offset: 0 }) };
};

// --- 탭 — 들여쓰기·내어쓰기 --------------------------------------------------------------
//
// **코드 상자는 탭을 가져간다.** 코드에서 탭은 글자 사이를 옮겨 다니는 키가 아니라 줄의 깊이를
// 바꾸는 키다. 아무도 안 가져가면 코어가 스페이스 넷을 넣는데(surface/actions), 그 답은 글 문단의
// 답이지 코드의 답이 아니다 — 여러 줄을 잡고 한 번에 미는 일이 코드에서는 흔하다.
//
// 규칙은 흔한 코드 편집기의 것을 그대로 쓴다:
// 캐럿이 접혀 있으면 — 탭은 **그 자리에** 스페이스 넷을 넣는다(글자를 치는 것과 같다).
// 범위를 잡았으면 — 걸친 **줄 전부**의 앞에 넷을 붙인다.
// Shift+탭은 언제나 **줄 단위**다 — 걸친 줄마다 앞의 공백을 넷까지 걷는다.
//
// 셈은 글자로 한다. 코드 속은 평문 + 라인뿐이라(repairCode 가 지킨다) 라인을 개행 한 칸으로 펴면
// 오프셋과 글자 자리가 1:1 이 되고, 그러면 이 일이 문자열 하나 다루기가 된다.
const INDENT = '    ';

// 코드 속을 칸 배열로 — 글자 하나가 한 칸, 라인이 한 칸(개행)이다.
// UTF-16 단위로 쪼갠다: 칸 셈(`runLength`)이 `text.length` 라 코드 포인트로 쪼개면 어긋난다.
function codeCells(node: ElementNode): string[] {
  const out: string[] = [];
  for (const child of node.ch) {
    if (typeof child === 'string') out.push(...child.split(''));
    else if (isElement(child) && child.w === BR) out.push('\n');
  }
  return out;
}

// 칸 배열을 도로 자식으로 — 개행은 라인 노드가 되고 나머지는 이어 붙는다.
function codeChildren(cells: readonly string[]): NabiNode[] {
  const out: NabiNode[] = [];
  let buffer = '';
  for (const cell of cells) {
    if (cell === '\n') {
      if (buffer !== '') out.push(buffer);
      buffer = '';
      out.push({ w: BR, ch: [] });
      continue;
    }
    buffer += cell;
  }
  if (buffer !== '') out.push(buffer);
  return out;
}

// 각 줄이 시작하는 칸 — 0 과 개행 바로 뒤.
function lineStarts(cells: readonly string[]): number[] {
  const out = [0];
  for (let i = 0; i < cells.length; i += 1) if (cells[i] === '\n') out.push(i + 1);
  return out;
}

// `from`~`to` 에 걸친 줄들의 시작 자리. 접힌 캐럿이면 그 한 줄이다.
function touchedLines(cells: readonly string[], from: number, to: number): number[] {
  const starts = lineStarts(cells);
  return starts.filter((at, i) => {
    const next = starts[i + 1];
    const end = next === undefined ? cells.length : next - 1; // 개행은 그 줄의 것이 아니다
    return at <= to && end >= from;
  });
}

// 줄 앞의 공백을 넷까지 — 넷보다 적으면 있는 만큼만 걷는다.
function trimWidth(cells: readonly string[], at: number): number {
  let n = 0;
  while (n < INDENT.length && cells[at + n] === ' ') n += 1;
  return n;
}

const sameArray = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const onKey: OnKey = (intent, doc, sel, _env, owner) => {
  if (intent.key !== 'tab' && intent.key !== 'shiftTab') return null;
  if (owner.node.w !== 'code') return null;

  const cells = codeCells(owner.node);
  const [start, end] = ordered(sel);
  const inBox = (pos: { readonly path: readonly number[] }): boolean => sameArray(pos.path, owner.path);
  // 한쪽이라도 상자 밖이면 그 선택은 코드의 것이 아니다 — 코어에 돌려준다.
  if (!inBox(start) || !inBox(end)) return null;
  const collapsed = start.offset === end.offset;

  // 접힌 캐럿의 탭은 **그 자리에** 넣는다 — 줄 앞으로 밀지 않는다(글자를 치는 것과 같다).
  if (intent.key === 'tab' && collapsed) {
    const next = [...cells.slice(0, start.offset),...INDENT.split(''),...cells.slice(start.offset)];
    const at = { path: owner.path, offset: start.offset + INDENT.length };
    return { doc: replaceAt(doc, owner.path, [{...owner.node, ch: codeChildren(next) }]), selection: caretAt(at) };
  }

  const lines = touchedLines(cells, start.offset, end.offset);
  if (lines.length === 0) return null;

  // 줄마다 얼마나 넣고 뺄지 먼저 센다 — 자리 옮기기는 그 셈으로 한다(뒤에서부터 고쳐야 인덱스가 안 흔들린다).
  const width = new Map<number, number>();
  for (const at of lines) width.set(at, intent.key === 'tab' ? INDENT.length : -trimWidth(cells, at));
  const moved = [...width.values()].some((n) => n !== 0);
  if (!moved) return null; // 더 내어쓸 것이 없다 — 무변화 침묵

  const next = [...cells];
  for (const at of [...lines].reverse()) {
    const n = width.get(at) ?? 0;
    if (n > 0) next.splice(at, 0,...INDENT.split(''));
    else if (n < 0) next.splice(at, -n);
  }

  // 자리 옮기기 — 그 자리 **앞**에서 일어난 만큼 밀린다. 제 줄 안에서는 줄 시작 아래로 안 내려간다.
  const move = (offset: number): number => {
    let shift = 0;
    let own = 0;
    for (const at of lines) {
      const n = width.get(at) ?? 0;
      if (at < offset) shift += n;
      if (at <= offset) own = at + Math.max(0, n); // 이 자리가 속한 줄의 새 시작
    }
    return Math.max(own, offset + shift);
  };
  const from = { path: owner.path, offset: move(start.offset) };
  const to = { path: owner.path, offset: move(end.offset) };
  return {
    doc: replaceAt(doc, owner.path, [{...owner.node, ch: codeChildren(next) }]),
    selection: collapsed ? caretAt(from) : { anchor: from, focus: to },
  };
};

// ```lang 뒤의 스페이스·엔터 — 언어는 그대로 `lang` 이 된다.
const FENCE = /^```([\w+#.-]{1,24})?$/;
const fenceArgs = (m: RegExpMatchArray): { name: string; args?: Record<string, unknown> } => ({
  name: 'toggleCode',
...(m[1] ? { args: { lang: m[1] } } : {}),
});

export const codeWing: Wing = {
  w: 'code',
  place: 'container',
  holds: 'inline',
  toHtml: DEFAULT_BUILDERS['code'],
  repair: repairCode,
  onKey,
  currentValue: (node) => language(node.a?.['lang']),
  commands: { toggleCode, setCodeLanguage },
  // 상황 줄 — 언어를 고르는 자리다. 색칠은 언어를 알아야 도는데(모르면 평문이다), 이 줄이 그
  // 언어를 정하는 유일한 문이다.
  //
  // 셋으로 짜인다: ① 판 — 목록에 없는 언어를 손으로 친다 ② 지우기 — 언어 없음으로 되돌린다
  // ③ 흔한 언어 단추들 — 대부분은 여기서 한 번에 끝난다.
  // **언어 이름은 번역하지 않는다** — 하이라이터에 그대로 넘어가는 값이지 사람에게 하는 말이 아니다.
  context: {
    title: LANGUAGE_NAME,
    controls: [
      {
        kind: 'prompt',
        name: 'lang',
        command: 'setCodeLanguage',
        svg: CODE_ICON,
        label: LANGUAGE_NAME,
        fields: [{ name: 'lang', label: LANGUAGE_NAME, attr: 'lang', optional: true }],
      },
      {
        kind: 'button',
        name: 'clear',
        command: 'setCodeLanguage',
        args: { lang: '' },
        label: LANGUAGE_CLEAR,
        // 지울 것이 있을 때만 선다 — 없는 언어를 지우는 단추는 아무 말도 안 한다.
        visible: (node) => typeof node.a?.['lang'] === 'string' && node.a['lang'] !== '',
      },
...COMMON_LANGUAGES.map((lang) => ({
        kind: 'button' as const,
        name: lang,
        command: 'setCodeLanguage',
        args: { lang },
        label: { ko: lang, en: lang },
      })),
    ],
  },
  // 색칠은 표면 부속이다 (11) — 토큰은 화면 span 에만 살고 트리에는 안 남는다.
  attach: codeAttach,
  inputRules: [
    { trigger: 'space', pattern: FENCE, run: fenceArgs },
    { trigger: 'enter', pattern: FENCE, run: fenceArgs },
  ],
  button: {
    group: 'container',
    svg: CODE_ICON,
    label: CODE_NAME,
    action: { kind: 'command', command: 'toggleCode' },
  },
  styles: CODE_CSS,
};
