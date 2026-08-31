// 등록된 wing만 세우고(html 들여오기와 달리 미등록 문법은 원문 글자 그대로 남긴다), 나머지는 의도적 부분집합(중첩 인용·참조 링크·HTML 블록·엔티티·setext·각주 없음)이다.
// Only registered wings get built (unlike html import, unmatched syntax stays literal text); everything else is a deliberate subset (no nested quotes, reference links, HTML blocks, entities, setext, footnotes).
import { BR, P, type AttrValue, type Attrs, type ElementNode, type NabiNode } from '../../schema/index.js';
import { safeUrl } from '../../html/index.js';

export interface MdEnv {
  has(w: string): boolean;
  // 값 마크의 값까지 보는 자리 — `` `x` `` -> tf:mono (없으면 원문 그대로).
  // Checks the value too, for value marks — `` `x` `` maps to tf:mono, else stays literal.
  hasValue?(w: string, value: string): boolean;
  readonly allowLocalUrls?: boolean;
}

// 값 없는 attr는 안 싣는다 — html/import와 같은 규칙.
// Omits attrs with no value, same rule as html/import.
function node(w: string, a: Record<string, AttrValue | undefined>, ch: readonly NabiNode[]): ElementNode {
  const attrs: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (value !== undefined) attrs[key] = value;
  }
  return Object.keys(attrs).length > 0 ? { w, a: attrs as Attrs, ch } : { w, ch };
}

// --- 인라인 --------------------------------------------------------------------------------

// md 이스케이프가 듣는 글자 — 그 밖의 `\`는 글자 그대로다.
// Characters `\` actually escapes; any other backslash stays literal.
const PUNCT = /[\\`*_{}[\]()#+\-.!|~<>]/;

const unescape = (raw: string): string => raw.replace(/\\([\\`*_{}[\]()#+\-.!|~<>])/g, '$1');

// 값 마크라 값까지 물어야 한다.
// A value mark, so the value itself must be checked too.
const mono = (env: MdEnv): boolean => env.has('tf') && (env.hasValue?.('tf', 'mono') ?? true);

function ticks(text: string, at: number): number {
  let n = 0;
  while (text[at + n] === '`') n += 1;
  return n;
}

// 이스케이프·코드 조각은 건너뛰며 닫는 표식을 찾는다.
// Scans for the closing mark, skipping over escapes and inline code spans.
function closeAt(text: string, from: number, mark: string, word: boolean): number {
  let i = from;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '`') {
      const run = ticks(text, i);
      const close = text.indexOf('`'.repeat(run), i + run);
      i = close < 0 ? i + run : close + run;
      continue;
    }
    if (text.startsWith(mark, i)) {
      // 앞이 공백이면 닫는 표식이 아니다(`*a *b*`의 가운데 별).
      // A space before it means it's not a closer (the middle `*` in `*a *b*`).
      if (/\s/.test(text[i - 1] ?? ' ')) {
        i += 1;
        continue;
      }
      // 낱말 속 밑줄은 강조가 아니다(`snake_case_name`).
      // An underscore inside a word isn't emphasis (`snake_case_name`).
      if (word && /\w/.test(text[i + mark.length] ?? '')) {
        i += 1;
        continue;
      }
      return i;
    }
    i += 1;
  }
  return -1;
}

interface Link {
  readonly text: string;
  readonly url: string;
  readonly next: number;
}

// 대괄호·소괄호 짝을 세어 읽는다 — 제목(`"…"`)은 버린다.
// Reads by counting bracket/paren depth; a title (`"…"`) is discarded.
function linkAt(text: string, at: number): Link | null {
  let depth = 0;
  let i = at;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '\\') {
      i += 1;
      continue;
    }
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  if (depth !== 0 || text[i] !== ']' || text[i + 1] !== '(') return null;
  const label = text.slice(at + 1, i);

  let round = 1;
  let j = i + 2;
  for (; j < text.length; j += 1) {
    const ch = text[j];
    if (ch === '\\') {
      j += 1;
      continue;
    }
    if (ch === '(') round += 1;
    else if (ch === ')') {
      round -= 1;
      if (round === 0) break;
    }
  }
  if (round !== 0) return null;
  const inner = text.slice(i + 2, j).trim();
  return { text: label, url: unescape(inner.split(/\s+/)[0] ?? ''), next: j + 1 };
}

interface Mark {
  readonly w: string;
  readonly inner: string;
  readonly next: number;
}

function markAt(text: string, at: number, env: MdEnv): Mark | null {
  const two = text.slice(at, at + 2);
  if (two === '**' || two === '__') {
    if (!env.has('b')) return null;
    if (two === '__' && /\w/.test(text[at - 1] ?? '')) return null;
    const close = closeAt(text, at + 2, two, two === '__');
    return close < 0 ? null : { w: 'b', inner: text.slice(at + 2, close), next: close + 2 };
  }
  if (two === '~~') {
    if (!env.has('s')) return null;
    const close = closeAt(text, at + 2, '~~', false);
    return close < 0 ? null : { w: 's', inner: text.slice(at + 2, close), next: close + 2 };
  }
  const one = text[at];
  if (one !== '*' && one !== '_') return null;
  if (!env.has('i')) return null;
  // 굵게 표식의 반쪽을 기울임으로 삼키지 않는다 — 굵게가 없는 어휘라면 둘 다 글자로 남는다.
  // Doesn't swallow half of a bold marker as italic; without bold registered, both stay literal.
  if (text[at + 1] === one || text[at - 1] === one) return null;
  if (one === '_' && /\w/.test(text[at - 1] ?? '')) return null;
  if (/\s/.test(text[at + 1] ?? ' ')) return null;
  const close = closeAt(text, at + 1, one, one === '_');
  return close < 0 ? null : { w: 'i', inner: text.slice(at + 1, close), next: close + 1 };
}

export function parseInline(text: string, env: MdEnv): NabiNode[] {
  const out: NabiNode[] = [];
  let buffer = '';
  const flush = (): void => {
    if (buffer !== '') out.push(buffer);
    buffer = '';
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i] as string;

    if (ch === '\\' && PUNCT.test(text[i + 1] ?? '')) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }

    if (ch === '`') {
      const run = ticks(text, i);
      const close = text.indexOf('`'.repeat(run), i + run);
      if (close >= 0) {
        const code = text.slice(i + run, close);
        if (mono(env)) {
          flush();
          out.push(node('tf', { v: 'mono' }, code === '' ? [] : [code]));
        } else buffer += text.slice(i, close + run);
        i = close + run;
        continue;
      }
    }

    if (ch === '!' && text[i + 1] === '[' && env.has('img')) {
      const link = linkAt(text, i + 1);
      // alt는 안 싣는다 — html 들여오기와 같은 답.
      // No alt text carried, matching the html-import behavior.
      const src = link ? safeUrl(link.url, env.allowLocalUrls === true) : null;
      if (link && src !== null) {
        flush();
        out.push(node('img', { src }, []));
        i = link.next;
        continue;
      }
    }

    if (ch === '[' && env.has('a')) {
      const link = linkAt(text, i);
      // 화이트리스트를 못 통과한 주소(javascript: 등)는 링크가 아니라 평문이다.
      // An address that fails the whitelist (e.g. javascript:) becomes plain text, not a link.
      const href = link ? safeUrl(link.url) : null;
      if (link && href !== null) {
        flush();
        out.push(node('a', { href }, parseInline(link.text, env)));
        i = link.next;
        continue;
      }
    }

    if (ch === '<' && env.has('a')) {
      const auto = /^<(https?:\/\/[^>\s]+)>/.exec(text.slice(i));
      const href = auto ? safeUrl(auto[1]) : null;
      if (auto && href !== null) {
        flush();
        out.push(node('a', { href }, [auto[1] as string]));
        i += auto[0].length;
        continue;
      }
    }

    const mark = markAt(text, i, env);
    if (mark) {
      flush();
      out.push(node(mark.w, {}, parseInline(mark.inner, env)));
      i = mark.next;
      continue;
    }

    // 한 토큰이 통째로 주소일 때만 — wings/link와 같은 규칙.
    // Only when the whole token is an address, matching wings/link's own rule.
    if (ch === 'h' && env.has('a') && !/[\w/.]/.test(text[i - 1] ?? '')) {
      const bare = /^https?:\/\/[^\s<>]+/.exec(text.slice(i));
      const raw = bare ? (bare[0] as string).replace(/[.,;:!?)\]}'"]+$/, '') : '';
      const href = raw === '' ? null : safeUrl(raw);
      if (href !== null) {
        flush();
        out.push(node('a', { href }, [raw]));
        i += raw.length;
        continue;
      }
    }

    buffer += ch;
    i += 1;
  }
  flush();
  return out;
}

// --- 블록 ----------------------------------------------------------------------------------

const FENCE_OPEN = /^ {0,3}(```+|~~~+)[ \t]*([\w+#.-]{1,24})?[ \t]*$/;
const FENCE_CLOSE = /^ {0,3}(```+|~~~+)[ \t]*$/;
const HR = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*))?$/;
const QUOTE = /^ {0,3}>/;
const PIPE_ROW = /^ {0,3}\|/;
const DELIM_ROW = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const TASK_ITEM = /^([ \t]*)[-*+][ \t]+\[([ xX])\](?:[ \t]+(.*))?$/;
const BULLET_ITEM = /^([ \t]*)[-*+](?:[ \t]+(.*))?$/;
const ORDERED_ITEM = /^([ \t]*)\d{1,9}[.)](?:[ \t]+(.*))?$/;

const ITEM_OF: Readonly<Record<string, string>> = { ul: 'li', ol: 'oli', tl: 'tli' };

interface BlockCtx {
  readonly env: MdEnv;
  // 인용 속인가 — 중첩 인용은 부분집합 밖이라 안 한다.
  // Whether already inside a quote; nested quotes are outside this subset.
  readonly quote: boolean;
}

interface Block {
  readonly node: ElementNode;
  readonly next: number;
}

interface Item {
  readonly indent: number;
  readonly kind: string;
  readonly checked: boolean;
  readonly text: string;
}

// 탭 하나를 네 칸으로 센다.
// A tab counts as four columns.
const widthOf = (raw: string): number => raw.replace(/\t/g, '    ').length;

function itemAt(line: string, env: MdEnv): Item | null {
  if (HR.test(line)) return null;
  const task = TASK_ITEM.exec(line);
  // 체크가 글머리보다 먼저 판정된다 — `- [ ]`는 글머리 목록이 아니다.
  // Checked before bullet: `- [ ]` is a task item, not a bullet list.
  if (task && env.has('tl')) {
    return {
      indent: widthOf(task[1] ?? ''),
      kind: 'tl',
      checked: (task[2] ?? '').toLowerCase() === 'x',
      text: task[3] ?? '',
    };
  }
  const ordered = ORDERED_ITEM.exec(line);
  if (ordered && env.has('ol')) {
    return { indent: widthOf(ordered[1] ?? ''), kind: 'ol', checked: false, text: ordered[2] ?? '' };
  }
  const bullet = BULLET_ITEM.exec(line);
  if (bullet && env.has('ul')) {
    return { indent: widthOf(bullet[1] ?? ''), kind: 'ul', checked: false, text: bullet[2] ?? '' };
  }
  return null;
}

// 들여쓰기로 접는다 — 깊어지면 앞 항목의 자식이 된다.
// Folds by indent depth; a deeper item nests inside the preceding one.
function foldList(items: readonly Item[], from: number, env: MdEnv): { node: ElementNode; next: number } {
  const first = items[from] as Item;
  const kind = first.kind;
  const out: ElementNode[] = [];
  let i = from;
  while (i < items.length) {
    const item = items[i] as Item;
    if (item.indent < first.indent) break;
    if (item.indent > first.indent && out.length > 0) {
      const nested = foldList(items, i, env);
      const last = out[out.length - 1] as ElementNode;
      out[out.length - 1] = { ...last, ch: [...last.ch, nested.node] };
      i = nested.next;
      continue;
    }
    if (item.kind !== kind) break;
    out.push(node(ITEM_OF[kind] as string, item.checked ? { ck: 1 } : {}, [{ w: P, ch: parseInline(item.text, env) }]));
    i += 1;
  }
  return { node: { w: kind, ch: out }, next: i };
}

function listAt(lines: readonly string[], at: number, env: MdEnv): Block | null {
  const items: Item[] = [];
  let j = at;
  while (j < lines.length) {
    const item = itemAt(lines[j] as string, env);
    if (!item) break;
    items.push(item);
    j += 1;
  }
  if (items.length === 0) return null;
  const folded = foldList(items, 0, env);
  return { node: folded.node, next: at + folded.next };
}

// `\|`는 칸을 안 나눈다.
// An escaped `\|` doesn't split a cell.
function cellsOf(line: string): string[] {
  let raw = line.trim();
  if (raw.startsWith('|')) raw = raw.slice(1);
  if (raw.endsWith('|') && !raw.endsWith('\\|')) raw = raw.slice(0, -1);
  const out: string[] = [];
  let buffer = '';
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '\\' && raw[i + 1] === '|') {
      buffer += '|';
      i += 1;
      continue;
    }
    if (ch === '|') {
      out.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += ch;
  }
  out.push(buffer.trim());
  return out;
}

function tableAt(lines: readonly string[], at: number, env: MdEnv): Block {
  const head = cellsOf(lines[at] as string);
  const row = (cells: readonly string[], th: boolean): ElementNode => ({
    w: 'tr',
    ch: cells.map((cell) => node('td', th ? { th: 1 } : {}, [{ w: P, ch: parseInline(cell, env) }])),
  });
  const rows: ElementNode[] = [row(head, true)];
  let j = at + 2;
  while (j < lines.length && PIPE_ROW.test(lines[j] as string)) {
    const cells = cellsOf(lines[j] as string);
    // 표는 격자다 — 짧은 줄은 빈 칸으로 채운다.
    // A table is a grid; a short row is padded with empty cells.
    while (cells.length < head.length) cells.push('');
    rows.push(row(cells, false));
    j += 1;
  }
  return { node: { w: 'table', ch: rows }, next: j };
}

function blockAt(lines: readonly string[], at: number, cx: BlockCtx): Block | null {
  const line = lines[at] as string;
  const env = cx.env;

  const fence = FENCE_OPEN.exec(line);
  if (fence && env.has('code')) {
    const open = fence[1] as string;
    const body: string[] = [];
    let j = at + 1;
    while (j < lines.length) {
      const close = FENCE_CLOSE.exec(lines[j] as string);
      if (close && (close[1] as string)[0] === open[0] && (close[1] as string).length >= open.length) {
        j += 1;
        break;
      }
      body.push(lines[j] as string);
      j += 1;
    }
    // 코드 속은 평문과 br뿐이다 — 인라인 문법이 안 돈다.
    // Inside code it's plain text and br only; inline syntax never runs.
    const ch: NabiNode[] = [];
    body.forEach((text, index) => {
      if (index > 0) ch.push({ w: BR, ch: [] });
      if (text !== '') ch.push(text);
    });
    return { node: node('code', { lang: fence[2] }, ch), next: j };
  }

  if (env.has('hr') && HR.test(line)) return { node: { w: 'hr', ch: [] }, next: at + 1 };

  const heading = HEADING.exec(line);
  if (heading && env.has('h')) {
    const level = (heading[1] as string).length;
    // 닫는 `#`은 표식이지 글이 아니다.
    // A trailing `#` is a marker, not text.
    const text = (heading[2] ?? '').replace(/[ \t]+#+[ \t]*$/, '').trim();
    return { node: { w: P, a: { h: level }, ch: parseInline(text, env) }, next: at + 1 };
  }

  if (!cx.quote && env.has('quote') && QUOTE.test(line)) {
    const body: string[] = [];
    let j = at;
    while (j < lines.length && QUOTE.test(lines[j] as string)) {
      body.push((lines[j] as string).replace(/^ {0,3}> ?/, ''));
      j += 1;
    }
    return { node: { w: 'quote', ch: parseBlocks(body, { env, quote: true }) }, next: j };
  }

  if (env.has('table') && PIPE_ROW.test(line) && at + 1 < lines.length && DELIM_ROW.test(lines[at + 1] as string)) {
    return tableAt(lines, at, env);
  }

  return listAt(lines, at, env);
}

// 이어진 줄은 한 문단으로 잇고, 줄 끝의 공백 둘이나 `\`만 br이 된다.
// Consecutive lines join into one paragraph; only a trailing double-space or `\` becomes a br.
function paragraphOf(lines: readonly string[], env: MdEnv): ElementNode {
  const pieces: string[] = [];
  let current = '';
  for (const raw of lines) {
    let text = raw;
    let hard = false;
    if (/ {2,}$/.test(text)) hard = true;
    text = text.replace(/\s+$/, '');
    if (!hard && text.endsWith('\\')) {
      hard = true;
      text = text.slice(0, -1);
    }
    const piece = text.replace(/^\s+/, '');
    current = current === '' ? piece : `${current} ${piece}`;
    if (hard) {
      pieces.push(current);
      current = '';
    }
  }
  if (current !== '' || pieces.length === 0) pieces.push(current);

  const ch: NabiNode[] = [];
  pieces.forEach((piece, index) => {
    if (index > 0) ch.push({ w: BR, ch: [] });
    ch.push(...parseInline(piece, env));
  });
  return { w: P, ch };
}

function parseBlocks(lines: readonly string[], cx: BlockCtx): ElementNode[] {
  const out: ElementNode[] = [];
  let i = 0;
  while (i < lines.length) {
    if ((lines[i] as string).trim() === '') {
      i += 1;
      continue;
    }
    const block = blockAt(lines, i, cx);
    if (block) {
      out.push(block.node);
      i = block.next;
      continue;
    }
    const buffer: string[] = [];
    while (i < lines.length && (lines[i] as string).trim() !== '' && blockAt(lines, i, cx) === null) {
      buffer.push(lines[i] as string);
      i += 1;
    }
    out.push(paragraphOf(buffer, cx.env));
  }
  return out;
}

export function parseMarkdown(text: string, env: MdEnv): readonly ElementNode[] {
  return parseBlocks(text.replace(/\r\n?/g, '\n').split('\n'), { env, quote: false });
}
