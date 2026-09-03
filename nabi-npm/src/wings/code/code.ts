// 코드 code — 평문 문단 하나 고정. 엔터는 분할이 아니라 라인이고, 마크 금지는 repair가 지킨다(글자만 남긴다).
// The code box is one fixed plain-text paragraph; Enter adds a line, never a split, and repair strips any mark down to bare text.
import { BR, P, isElement, isWrapper, type ElementNode, type NabiNode } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { DEFAULT_BUILDERS } from '../../html/index.js';
import { language } from '../../html/values.js';
import { caretAt, isCollapsed, ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { replaceAt } from '../../doc/index.js';
import { blockOwnerAt, exitWrapper } from '../../wing/ops.js';
import { type OnKey, type Wing } from '../../wing/index.js';
import type { MdBuilder } from '../../io/index.js';
import type { LocaleText } from '../../locale/index.js';
import { codeAttach } from './paint.js';

const CODE_NAME: LocaleText = {
  ko: '코드',
  en: 'Code',
  ja: 'コード',
  zh: '代码',
  de: 'Code',
  fr: 'Code',
  es: 'Código',
  pt: 'Código',
  ru: 'Код',
  ar: 'شيفرة',
  hi: 'कोड',
  bn: 'কোড',
  ur: 'کوڈ',
  id: 'Kode',
};
const LANGUAGE_NAME: LocaleText = {
  ko: '언어',
  en: 'Language',
  ja: '言語',
  zh: '语言',
  de: 'Sprache',
  fr: 'Langage',
  es: 'Lenguaje',
  pt: 'Linguagem',
  ru: 'Язык',
  ar: 'اللغة',
  hi: 'भाषा',
  bn: 'ভাষা',
  ur: 'زبان',
  id: 'Bahasa',
};
const LANGUAGE_CLEAR: LocaleText = {
  ko: '언어 없음',
  en: 'No language',
  ja: '言語なし',
  zh: '无语言',
  de: 'Keine Sprache',
  fr: 'Aucun langage',
  es: 'Sin lenguaje',
  pt: 'Sem linguagem',
  ru: 'Без языка',
  ar: 'بدون لغة',
  hi: 'कोई भाषा नहीं',
  bn: 'ভাষা নেই',
  ur: 'کوئی زبان نہیں',
  id: 'Tanpa bahasa',
};

const CODE_ICON =
  '<g transform="translate(8 8) scale(1.2273) translate(-8 -8)" stroke-width="1.141">' +
  '<path d="M5.75 5.25 2.5 8l3.25 2.75M10.25 5.25 13.5 8l-3.25 2.75"/></g>';

// 상황 줄 단추로 서는 언어들 — 이름은 하이라이터에 넘어가는 값이라 번역하지 않는다.
// Languages shown as context-toolbar buttons — the names are values passed to the highlighter, never translated.
const COMMON_LANGUAGES: readonly string[] = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'kotlin',
  'swift',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'sql',
  'html',
  'xml',
  'css',
  'scss',
  'json',
  'yaml',
  'toml',
  'markdown',
  'bash',
  'powershell',
  'dockerfile',
  'diff',
];

const CODE_CSS = `
/* 빈 상자도 한 줄 높이를 바닥으로 둔다 — 안 그러면 padding만 남아 납작해진다. */
/* A freshly made empty box keeps a one-line floor height, or it flattens to just its padding. */
.nabi-content pre {
  background: var(--nabi-soft); border-radius: var(--nabi-radius, 6px); padding:.7em.9em;
  overflow-x: auto; font-size:.9em; min-block-size: 1.6em; box-sizing: content-box;
}
/* 서체 wing의 '고정폭' 토큰을 그대로 쓴다 — 여기만 따로 적으면 호스트가 덮어도 둘이 갈라진다. */
/* Reuses the typeface wing's monospace token, so a host override moves both together instead of splitting them. */
.nabi-content pre > code { font-family: var(--nabi-font-mono, var(--nabi-font-mono-fallback)); white-space: pre-wrap; }
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
`;

// 언어를 갈아 끼운다 — 빈 값이면 표식을 걷는다. 코드 상자 자체는 안 만들고 안 없앤다.
// Swaps the language tag, or clears it on an empty value; never creates or removes the code box itself.
const setCodeLanguage: Command = (doc, sel, args) => {
  const [start] = ordered(sel);
  const owner = blockOwnerAt(doc, start.path, 'code');
  const box = owner?.node;
  if (!owner || !box) return null;
  const lang = typeof args['lang'] === 'string' ? language(args['lang']) : undefined;
  if ((box.a?.['lang'] ?? undefined) === lang) return null; // 같은 값 — 무변화 침묵
  const next: ElementNode = {
    w: 'code',
    ...(lang !== undefined ? { a: { lang } } : {}),
    ch: box.ch,
    ...(box._id !== undefined ? { _id: box._id } : {}),
  };
  return { doc: replaceAt(doc, owner.path, [next]), selection: sel };
};

// 마크는 벗기고, 라인은 라인으로 남기고, 이웃한 글자는 이어 붙인다.
// Strips every mark, keeps line breaks as line breaks, and merges adjacent text.
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

// 감싸기·풀기 — 감싸면 블록 하나가 줄 하나가 되고, 풀면 줄 하나가 문단 하나가 된다.
// Wrap/unwrap — wrapping turns each block into one line; unwrapping turns each line back into a paragraph.
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
    const next = [...doc.slice(0, a), ...blocks, ...doc.slice(b + 1)];
    return { doc: next, selection: caretAt({ path: [a], offset: 0 }) };
  }

  const lines: NabiNode[] = [];
  covered.forEach((block, i) => {
    if (i > 0) lines.push({ w: BR, ch: [] });
    for (const piece of plainChildren(block.ch)) lines.push(piece);
  });
  const lang = typeof args['lang'] === 'string' ? language(args['lang']) : undefined;
  const box: ElementNode = { w: 'code', ...(lang !== undefined ? { a: { lang } } : {}), ch: lines };
  const next = [...doc.slice(0, a), { w: P, ch: [box] } as ElementNode, ...doc.slice(b + 1)];
  // 코드 상자 자신이 캐럿의 홀더다 — 인라인 홀더, 속은 글과 라인뿐이다.
  // The code box is its own caret holder — an inline holder containing only text and line breaks.
  return { doc: next, selection: caretAt({ path: [a, 0], offset: 0 }) };
};

// 코드 상자는 탭을 가져간다 — 코드에서 탭은 줄의 깊이를 바꾸는 키지, 글자 사이를 옮기는 키가 아니다.
// The code box claims Tab — inside code it changes a line's indent depth, not caret position.
//
// 접힌 캐럿이면 그 자리에 스페이스 넷, 범위면 걸친 줄 전부의 앞에 넷을 붙인다. Shift+탭은 언제나 줄 단위다.
// A collapsed caret inserts four spaces right there; a range indents every touched line; Shift+Tab always works line-wise.
const INDENT = '    ';

// 글자 하나·라인 하나가 칸 하나 — UTF-16 단위로 쪼갠다(코드 포인트로 쪼개면 셈이 어긋난다).
// One cell per character or line break, split by UTF-16 unit — splitting by code point would misalign the count.
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

// 각 줄이 시작하는 칸 — 0과 개행 바로 뒤.
// The cell where each line starts — 0, and right after each line break.
function lineStarts(cells: readonly string[]): number[] {
  const out = [0];
  for (let i = 0; i < cells.length; i += 1) if (cells[i] === '\n') out.push(i + 1);
  return out;
}

// `from`~`to`에 걸친 줄들의 시작 자리 — 접힌 캐럿이면 그 한 줄뿐이다.
// The start of every line `from`-`to` touches; a collapsed caret touches just one.
function touchedLines(cells: readonly string[], from: number, to: number): number[] {
  const starts = lineStarts(cells);
  return starts.filter((at, i) => {
    const next = starts[i + 1];
    const end = next === undefined ? cells.length : next - 1; // 개행은 그 줄의 것이 아니다
    return at <= to && end >= from;
  });
}

// 줄 앞의 공백을 넷까지 걷는다 — 넷보다 적으면 있는 만큼만.
// Trims up to four leading spaces from a line; fewer than that, and it trims only what's there.
function trimWidth(cells: readonly string[], at: number): number {
  let n = 0;
  while (n < INDENT.length && cells[at + n] === ' ') n += 1;
  return n;
}

const sameArray = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const onKey: OnKey = (intent, doc, sel, _env, owner) => {
  if (owner.node.w !== 'code') return null;

  // 첫/마지막 구조적 줄(개행 기준)에 있으면 래퍼문단 밖으로 탈출 — 표처럼 화면 자동 줄바꿈은 안 본다.
  // Exits past the wrapper when the caret sits on the first/last structural (newline-based) line — ignores visual wrap, like table does.
  if (intent.key === 'arrow') {
    if (!isCollapsed(sel) || (intent.dir !== 'up' && intent.dir !== 'down')) return null;
    const cells = codeCells(owner.node);
    const starts = lineStarts(cells);
    const [line] = touchedLines(cells, sel.focus.offset, sel.focus.offset);
    const boundary = intent.dir === 'up' ? starts[0] : starts[starts.length - 1];
    if (line === undefined || line !== boundary) return null;
    return exitWrapper(doc, owner.path, intent.dir);
  }

  if (intent.key !== 'tab' && intent.key !== 'shiftTab') return null;

  const cells = codeCells(owner.node);
  const [start, end] = ordered(sel);
  const inBox = (pos: { readonly path: readonly number[] }): boolean => sameArray(pos.path, owner.path);
  // 한쪽이라도 상자 밖이면 코어에 돌려준다.
  // If either end of the selection sits outside the box, this key isn't code's to handle.
  if (!inBox(start) || !inBox(end)) return null;
  const collapsed = start.offset === end.offset;

  // 접힌 캐럿의 탭은 그 자리에 넣는다 — 줄 앞으로 밀지 않고, 글자를 치는 것과 같다.
  // A collapsed caret's Tab inserts right there, not at the line's start — like typing a character.
  if (intent.key === 'tab' && collapsed) {
    const next = [...cells.slice(0, start.offset), ...INDENT.split(''), ...cells.slice(start.offset)];
    const at = { path: owner.path, offset: start.offset + INDENT.length };
    return { doc: replaceAt(doc, owner.path, [{ ...owner.node, ch: codeChildren(next) }]), selection: caretAt(at) };
  }

  const lines = touchedLines(cells, start.offset, end.offset);
  if (lines.length === 0) return null;

  // 줄마다 넣고 뺄 폭을 먼저 센다 — 뒤에서부터 고쳐야 인덱스가 안 흔들린다.
  // Counts each line's width delta up front — edits apply back-to-front so indices don't shift mid-way.
  const width = new Map<number, number>();
  for (const at of lines) width.set(at, intent.key === 'tab' ? INDENT.length : -trimWidth(cells, at));
  const moved = [...width.values()].some((n) => n !== 0);
  if (!moved) return null; // 더 내어쓸 것이 없다 — 무변화 침묵

  const next = [...cells];
  for (const at of [...lines].reverse()) {
    const n = width.get(at) ?? 0;
    if (n > 0) next.splice(at, 0, ...INDENT.split(''));
    else if (n < 0) next.splice(at, -n);
  }

  // 그 자리 앞에서 일어난 변화만큼 밀리되, 제 줄 시작 아래로는 안 내려간다.
  // Shifts a position by whatever changed before it, but never below its own line's new start.
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
    doc: replaceAt(doc, owner.path, [{ ...owner.node, ch: codeChildren(next) }]),
    selection: collapsed ? caretAt(from) : { anchor: from, focus: to },
  };
};

// ```lang 뒤의 스페이스·엔터를 잡는다 — 언어는 그대로 `lang`이 된다.
// Matches a space/Enter right after ```lang — the language becomes the box's `lang` attr.
const FENCE = /^```([\w+#.-]{1,24})?$/;
const fenceArgs = (m: RegExpMatchArray): { name: string; args?: Record<string, unknown> } => ({
  name: 'toggleCode',
  ...(m[1] ? { args: { lang: m[1] } } : {}),
});

// 속은 이스케이프하지 않는다(코드는 글자 그대로다) — 울타리는 속 최장 줄머리 백틱보다 하나 길게 잡는다.
// Never escapes the body (code is verbatim) — the fence is one backtick longer than the longest run inside, so it can't close early.
const codeMd: MdBuilder = (node) => {
  let body = '';
  for (const child of node.ch) body += typeof child === 'string' ? child : '\n';
  const longest = Math.max(2, ...[...body.matchAll(/^`+/gm)].map((m) => (m[0] as string).length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}${language(node.a?.['lang']) ?? ''}\n${body}\n${fence}`;
};

export const codeWing: Wing = {
  w: 'code',
  place: 'container',
  basic: true,
  holds: 'inline',
  // 코드 상자는 정렬을 안 받는다 — 제 폭이 곧 줄의 폭이라 옮길 자리가 없고, 정렬은 들여쓰기를 망가뜨린다.
  // The code box rejects align — its width already fills the line, and align would break its meaningful indentation instead.
  noAlign: true,
  toHtml: DEFAULT_BUILDERS['code'],
  toMd: codeMd,
  repair: repairCode,
  onKey,
  currentValue: (node) => language(node.a?.['lang']),
  commands: { toggleCode, setCodeLanguage },
  // 언어를 정하는 유일한 문 — 직접 입력·지우기·흔한 언어 단추 셋으로 짜인다. 언어 이름은 번역하지 않는다.
  // The only place to set the language — free-text entry, a clear button, and common-language buttons; names stay untranslated (they're highlighter values).
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
        // 지울 언어가 있을 때만 선다.
        // Shows only when there's an actual language to clear.
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
  // 색칠은 표면 부속이다(11) — 토큰은 화면 span에만 살고 트리에는 안 남는다.
  // Highlighting lives in the surface layer (11) — tokens exist only as screen spans, never in the tree.
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

$markBuiltinAttrOwner(codeWing, ['code']);
