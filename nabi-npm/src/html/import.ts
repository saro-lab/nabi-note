// 태그->노드 역대응이지만 DOM 없이 tag/attrs/children 최소 부분집합만 보고(서버·시험에서도 돔), 감싸기·쪼개기·_id는 schema의 cocoon에 맡겨 여기선 느슨한 나비트리에서 멈춘다.
// Maps tags back to nodes on a minimal tag/attrs/children subset with no DOM (so it runs server-side and in tests too); wrapping/splitting/`_id` stay with schema's cocoon, stopping here at a loose nabi-tree.
import { cocoon } from '../schema/cocoon.js';
import type { SchemaEnv } from '../schema/env.js';
import { $guarded, $ownDataArray, $ownDataObject, $snapshotNodes } from '../schema/json.js';
import { BR, P } from '../schema/reserved.js';
import type { AttrValue, Attrs, ElementNode, NabiDoc, NabiNode } from '../schema/types.js';
import { safeUrl, youtubeId } from './url.js';
import { language, name, span, text, width } from './values.js';

// --- 최소 엘리먼트 인터페이스 -----------------------------------------------------------------

export interface ParseText {
  readonly kind: 'text';
  readonly text: string;
}

// 태그·속성 이름은 소문자로 통일해서 온다 — 값 없는 속성(open)은 빈 글자열이다.
// Tag and attribute names arrive lowercased; a valueless attribute (open) is an empty string.
export interface ParseElement {
  readonly kind: 'element';
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
  readonly children: readonly ParseNode[];
}

export type ParseNode = ParseText | ParseElement;

function snapshotParseNode(value: unknown, active: WeakSet<object>): ParseNode | null {
  const raw = $ownDataObject(value);
  if (!raw || active.has(value as object)) return null;
  const kind = raw['kind']?.value;
  active.add(value as object);
  try {
    if (kind === 'text') {
      const content = raw['text']?.value;
      return typeof content === 'string' ? { kind: 'text', text: content } : null;
    }
    if (kind !== 'element') return null;
    const tag = raw['tag']?.value;
    const attrs = $ownDataObject(raw['attrs']?.value);
    const childrenValue = raw['children']?.value;
    const children = $ownDataArray(childrenValue);
    if (typeof tag !== 'string' || !attrs || !children || active.has(childrenValue as object)) return null;
    const copiedAttrs: Record<string, string> = {};
    for (const [name, descriptor] of Object.entries(attrs)) {
      if (typeof descriptor.value !== 'string') return null;
      const normalized = name.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(copiedAttrs, normalized)) return null;
      copiedAttrs[normalized] = descriptor.value;
    }
    active.add(childrenValue as object);
    const copiedChildren: ParseNode[] = [];
    try {
      for (const child of children) {
        const copied = snapshotParseNode(child, active);
        if (!copied) return null;
        copiedChildren.push(copied);
      }
    } finally {
      active.delete(childrenValue as object);
    }
    return { kind: 'element', tag: tag.toLowerCase(), attrs: copiedAttrs, children: copiedChildren };
  } finally {
    active.delete(value as object);
  }
}

export function $snapshotParseNodes(value: unknown): ParseNode[] | null {
  const nodes = $ownDataArray(value);
  if (!nodes) return null;
  const active = new WeakSet<object>();
  active.add(value as object);
  const out: ParseNode[] = [];
  try {
    for (const node of nodes) {
      const copied = snapshotParseNode(node, active);
      if (!copied) return null;
      out.push(copied);
    }
  } finally {
    active.delete(value as object);
  }
  return out;
}

export interface ImportOptions {
  readonly env: SchemaEnv;
  readonly allowLocalUrls?: boolean;
  // wing의 역방향 주장을 먼저 물어보고, null이면 아래 기본 대응으로 떨어진다.
  // Asks a wing's reverse claim first; a null falls through to the default mapping below.
  readonly claim?: (el: ParseElement, inner: (block: boolean) => NabiNode[]) => NabiNode[] | null;
}

interface Cx {
  readonly allowLocal: boolean;
  readonly claim: ImportOptions['claim'];
  // 리스트 속 항목 타입 — `<li>` 하나를 세 갈래(ul/ol/tl)가 나눠 쓴다.
  // The item type inside a list — a bare `<li>` is shared by three families (ul/ol/tl).
  readonly item: string;
}

// --- 태그 갈래 ------------------------------------------------------------------------------

// `<div data-nabi-p>`는 래퍼문단의 출력이고 `<p>`는 글 문단이라 둘 다 문단이다.
// `<div data-nabi-p>` is a wrapper paragraph's output and `<p>` is a text paragraph — both count as a paragraph.
const PARAGRAPH_TAGS: ReadonlySet<string> = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// 껍데기만 벗기면 스크립트 본문이 글자로 되살아나므로 속까지 통째로 버린다.
// Content is dropped whole, not just unwrapped — peeling the shell alone would resurrect script bodies as text.
const DROP_TAGS: ReadonlySet<string> = new Set([
  'script',
  'style',
  'noscript',
  'template',
  'head',
  'title',
  'meta',
  'link',
  'base',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'option',
  'textarea',
  'svg',
  'math',
  'canvas',
  'audio',
  'video',
  'source',
  'track',
  'param',
  'frame',
  'frameset',
  'map',
  'area',
]);

const HEADING = /^h([1-6])$/;

function hasClass(el: ParseElement, want: string): boolean {
  return (el.attrs['class'] ?? '').split(/\s+/).includes(want);
}

// 구조가 아니라 옷인 껍데기(표의 횡스크롤 겉옷, 브라우저가 끼워 넣는 tbody 류) — 벗기고 속을 그 자리에 편다.
// A shell that's clothing, not structure (our table scroll wrapper, the browser's tbody) — unwrapped and its content spread in place.
function transparent(item: ParseNode): boolean {
  if (item.kind !== 'element') return false;
  if (item.tag === 'tbody' || item.tag === 'thead' || item.tag === 'tfoot') return true;
  return item.tag === 'div' && !('data-nabi-p' in item.attrs) && hasClass(item, 'nabi-scroll');
}

function expand(nodes: readonly ParseNode[]): ParseNode[] {
  const out: ParseNode[] = [];
  for (const item of nodes) {
    if (item.kind === 'element' && transparent(item)) out.push(...expand(item.children));
    else out.push(item);
  }
  return out;
}

// --- 조각 짓기 ------------------------------------------------------------------------------

// 값이 없는 attr는 안 싣는다 — 빈 글자열도 값이라, 실으면 왕복에서 없던 속성이 생긴다.
// An attr with no value is omitted — an empty string still counts as a value and would appear as a new attr on round-trip.
function node(w: string, a: Record<string, AttrValue | undefined>, ch: readonly NabiNode[]): ElementNode {
  const attrs: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (value !== undefined) attrs[key] = value;
  }
  return Object.keys(attrs).length > 0 ? { w, a: attrs as Attrs, ch } : { w, ch };
}

// 화면 받침(data-nabi-filler 표식 br)만 아래 단말 문에서 걷는다 — 표식 없는 br은 실제 줄이라 보존한다.
// Only a screen filler (br marked data-nabi-filler) is dropped downstream; an unmarked br is a real line and stays.
function dropFiller(nodes: readonly NabiNode[]): NabiNode[] {
  return [...nodes];
}

// --- 걷기 -----------------------------------------------------------------------------------

// block은 지금 자리가 문단이 설 수 있는 자리인지, 글자 사이인지를 말한다.
// `block` says whether this position can hold a paragraph, versus sitting between text.
function importNodes(nodes: readonly ParseNode[], block: boolean, cx: Cx): NabiNode[] {
  const out: NabiNode[] = [];
  for (const item of expand(nodes)) {
    if (item.kind === 'text') {
      // 태그 사이 HTML 공백은 거두되, NBSP처럼 너비를 보존하는 공백은 남긴다.
      // Drop inter-tag HTML whitespace, but keep width-preserving spaces such as NBSP.
      if (block && /^[\t\n\f\r ]*$/.test(item.text)) continue;
      if (item.text !== '') out.push(item.text);
      continue;
    }
    out.push(...importElement(item, block, cx));
  }
  return out;
}

function inline(el: ParseElement, cx: Cx): NabiNode[] {
  return importNodes(el.children, false, cx);
}

// 서체(tf)·글자크기(fs)는 한때 문단 속성이었다가 지금은 마크라, 옛 문서의 블록 표식을 속 전체를 덮는 마크 하나로 옮겨 살린다.
// Typeface (tf) and font-size (fs) used to be paragraph attrs and are marks now; an old document's block-level marker gets moved to one mark covering all its content, so it survives instead of silently vanishing.
const MOVED_MARKS: readonly (readonly [string, string, string])[] = [
  ['data-nabi-typeface', 'tf', 'v'],
  ['data-nabi-size', 'fs', 'v'],
];

function dressMoved(el: ParseElement, inner: NabiNode[]): NabiNode[] {
  let out = inner;
  for (const [attr, w, key] of MOVED_MARKS) {
    const value = name(el.attrs[attr]);
    if (value === undefined || out.length === 0) continue;
    out = [node(w, { [key]: value }, out)];
  }
  return out;
}

// 속은 인라인으로 읽되 물건은 그대로 둔다 — 물건이 섞인 문단을 쪼개는 것은 cocoon의 일이다.
// Content reads as inline while lumps pass through untouched; splitting a paragraph with a lump inside is cocoon's job.
function paragraphOf(el: ParseElement, cx: Cx): ElementNode {
  const a: Record<string, AttrValue> = {};
  const level = HEADING.exec(el.tag);
  if (level) a['h'] = Number(level[1]);
  const align = el.attrs['data-nabi-align'];
  if (align === 'l' || align === 'c' || align === 'r') a['a'] = align;
  if ('data-nabi-dropcap' in el.attrs) a['dc'] = 1;
  return node(P, a, dressMoved(el, dropFiller(inline(el, cx))));
}

// 우리 속성이거나, 출력 관례의 선두 체크박스다.
// Either our own attribute, or the leading checkbox our output convention emits.
function checked(el: ParseElement): boolean {
  if (el.attrs['data-nabi-checked'] === 'true') return true;
  const first = expand(el.children).find((k) => k.kind === 'element');
  if (first === undefined || first.kind !== 'element') return false;
  return first.tag === 'input' && first.attrs['type'] === 'checkbox' && 'checked' in first.attrs;
}

// 줄바꿈은 라인 노드가 되고, 마크는 여기서 전부 벗겨진다.
// Line breaks become br nodes; every mark is stripped away here.
function plainText(nodes: readonly ParseNode[]): string {
  let out = '';
  for (const item of nodes) {
    if (item.kind === 'text') out += item.text;
    else if (item.tag === 'br') out += '\n';
    else if (!DROP_TAGS.has(item.tag)) out += plainText(item.children);
  }
  return out;
}

function plainLines(source: string): NabiNode[] {
  const out: NabiNode[] = [];
  const lines = source.split('\n');
  lines.forEach((line, i) => {
    if (i > 0) out.push({ w: BR, ch: [] });
    if (line !== '') out.push(line);
  });
  return dropFiller(out);
}

// `<code class="language-ts">` 관례에서 읽으므로 붙여넣은 코드 상자도 언어가 따라온다.
// Reads from the `<code class="language-ts">` convention, so a pasted code box keeps its language.
function languageOf(el: ParseElement): string | undefined {
  const own = language(el.attrs['data-nabi-lang']);
  if (own !== undefined) return own;
  for (const child of expand(el.children)) {
    if (child.kind !== 'element' || child.tag !== 'code') continue;
    const found = /(?:^|\s)language-([\w+#.-]+)/.exec(child.attrs['class'] ?? '');
    if (found) return language(found[1]);
  }
  return undefined;
}

function importElement(el: ParseElement, block: boolean, cx: Cx): NabiNode[] {
  if (DROP_TAGS.has(el.tag)) return [];
  if (el.tag === 'iframe') {
    if ('srcdoc' in el.attrs) return [];
    const id = youtubeId(el.attrs['src']);
    if (id === null) return [];
    return [node('youtube', { v: id, w: width(el.attrs['data-nabi-width']) }, [])];
  }
  const claimed = cx.claim?.(el, (asBlock) => importNodes(el.children, asBlock, cx));
  if (claimed) {
    const copied = $snapshotNodes(claimed);
    if (!copied) throw new TypeError('invalid custom HTML claim result');
    return copied;
  }

  switch (el.tag) {
    // --- 단말 ---
    case 'br':
      return 'data-nabi-filler' in el.attrs ? [] : [{ w: BR, ch: [] }];
    case 'hr':
      return [{ w: 'hr', ch: [] }];
    case 'img': {
      const src = safeUrl(el.attrs['src'], cx.allowLocal);
      // 못 믿을 주소는 없는 것으로 친다 — 그림이 아니라 통로가 될 수 있다.
      // An untrustworthy address is treated as none at all — it could be a channel, not a picture.
      if (src === null) return [];
      return [node('img', { src, w: width(el.attrs['data-nabi-width']) }, [])];
    }
    // --- 마크 여섯 ---
    case 'b':
    case 'strong':
      return [node('b', {}, inline(el, cx))];
    case 'i':
    case 'em':
      return [node('i', {}, inline(el, cx))];
    case 'u':
      return [node('u', {}, inline(el, cx))];
    case 's':
    case 'strike':
    case 'del':
      return [node('s', {}, inline(el, cx))];
    case 'sub':
      return [node('sub', {}, inline(el, cx))];
    case 'sup':
      return [node('sup', {}, inline(el, cx))];

    // --- 값 마크 넷 ---
    case 'mark':
      return [node('hl', { c: name(el.attrs['data-color']) }, inline(el, cx))];
    case 'span': {
      const color = name(el.attrs['data-color']);
      if (color !== undefined) return [node('tc', { c: color }, inline(el, cx))];
      const size = name(el.attrs['data-nabi-size']);
      if (size !== undefined) return [node('fs', { v: size }, inline(el, cx))];
      const face = name(el.attrs['data-nabi-typeface']);
      if (face !== undefined) return [node('tf', { v: face }, inline(el, cx))];
      // 표식 없는 span — 껍데기를 벗긴다.
      return importNodes(el.children, block, cx);
    }

    // --- 링크 ---
    case 'a': {
      // 가는 자리라 로컬 주소를 안 받는다 — 허용하면 `data:image/svg+xml`을 문 링크가 문서에 박힌다.
      // A navigation target never accepts local addresses — allowing one would let an `a` carrying `data:image/svg+xml` into the document.
      const href = safeUrl(el.attrs['href']);
      if (href === null) return importNodes(el.children, false, cx);
      return [node('a', { href, file: text(el.attrs['data-nabi-file']) }, inline(el, cx))];
    }

    // --- 표 ---
    case 'table':
      return [node('table', {}, importNodes(el.children, true, cx))];
    case 'tr':
      return [node('tr', {}, importNodes(el.children, true, cx))];
    case 'td':
    case 'th':
      return [
        node(
          'td',
          { colspan: span(el.attrs['colspan']), rowspan: span(el.attrs['rowspan']) },
          importNodes(el.children, true, cx),
        ),
      ];

    // --- 리스트 셋 ---
    case 'ul': {
      const task = el.attrs['data-nabi-list'] === 'task';
      const w = task ? 'tl' : 'ul';
      return [node(w, {}, importNodes(el.children, true, { ...cx, item: task ? 'tli' : 'li' }))];
    }
    case 'ol':
      return [node('ol', {}, importNodes(el.children, true, { ...cx, item: 'oli' }))];
    case 'li':
      return [
        node(
          cx.item,
          cx.item === 'tli' && checked(el) ? { ck: 1 } : {},
          importNodes(el.children, true, { ...cx, item: 'li' }),
        ),
      ];

    // --- 그릇 ---
    case 'blockquote':
      return [node('quote', {}, importNodes(el.children, true, cx))];
    case 'details':
      return [node('details', 'open' in el.attrs ? { o: 1 } : {}, importNodes(el.children, true, cx))];
    case 'summary':
      return [node('summary', {}, dropFiller(inline(el, cx)))];
    case 'pre': {
      const lang = languageOf(el);
      return [node('code', lang !== undefined ? { lang } : {}, plainLines(plainText(el.children)))];
    }

    default:
      break;
  }

  if (PARAGRAPH_TAGS.has(el.tag)) {
    // 문단 속엔 문단이 못 살므로, 글자 사이에 선 것은 껍데기를 벗긴다.
    // A paragraph can't live inside another, so one found between text is unwrapped.
    if (!block) return importNodes(el.children, false, cx);
    // 속에 또 문단이 있으면 이건 문단이 아니라 묶음이다(붙여넣은 `<div><p>…</p><p>…</p></div>`).
    // A paragraph tag holding more paragraphs is really a bundle, not one paragraph (a pasted `<div><p>…</p><p>…</p></div>`).
    if (expand(el.children).some((k) => k.kind === 'element' && PARAGRAPH_TAGS.has(k.tag))) {
      return importNodes(el.children, true, cx);
    }
    return [paragraphOf(el, cx)];
  }

  // 낯선 태그는 문서에 못 선다 — 껍데기를 벗기고 속만 편다.
  // An unknown tag never lands in the document — just its content, unwrapped.
  return importNodes(el.children, block, cx);
}

// --- 문 -------------------------------------------------------------------------------------

// 엘리먼트 트리 → 나비트리. 마지막 한 걸음(감싸기·쪼개기·_id)은 cocoon 이 맡는다.
export function $importDoc(nodes: unknown, options: ImportOptions): NabiDoc | null {
  return $guarded('importDoc', null, () => {
    const copied = $snapshotParseNodes(nodes);
    if (!copied) return null;
    const cx: Cx = {
      allowLocal: options.allowLocalUrls === true,
      claim: options.claim,
      item: 'li',
    };
    return cocoon(importNodes(copied, true, cx), options.env);
  });
}

export function importDoc(nodes: readonly ParseNode[], options: ImportOptions): NabiDoc {
  return $importDoc(nodes, options) ?? cocoon([], options.env);
}
