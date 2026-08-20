// 들여오기의 코어 — 태그 → 노드 역대응이다. **DOM 을 안 쓴다**: 엘리먼트 트리를
// 최소 부분집합(tag·attrs·children)으로만 보므로 서버·시험에서도 그대로 돈다.
// DOM 에서 이 모양으로 옮기는 어댑터는 `parse.ts` 한 곳이다 (거기가 DOM 이 허락된 유일한 자리).
//
// 여기서 하는 일은 **느슨한 나비트리**를 만드는 것까지다 — 감싸기·쪼개기·격자 복구·_id 는
// schema 의 cocoon 이 한다. 여기서 다시 구현하면 두 벌이 어긋난다.
import { cocoon } from '../schema/cocoon.js';
import type { SchemaEnv } from '../schema/env.js';
import { BR, P } from '../schema/reserved.js';
import type { AttrValue, Attrs, ElementNode, NabiDoc, NabiNode } from '../schema/types.js';
import { safeUrl, youtubeId } from './url.js';
import { language, name, span, text, width } from './values.js';

// --- 최소 엘리먼트 인터페이스 -----------------------------------------------------------------

export interface ParseText {
  readonly kind: 'text';
  readonly text: string;
}

// 태그 이름과 속성 이름은 소문자로 통일해서 넘어온다. 값 없는 속성(`open`)은 빈 글자열이다.
export interface ParseElement {
  readonly kind: 'element';
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
  readonly children: readonly ParseNode[];
}

export type ParseNode = ParseText | ParseElement;

export interface ImportOptions {
  readonly env: SchemaEnv;
  readonly allowLocalUrls?: boolean;
  // 07 이 wing 의 역방향 주장(claimsHtml·importAttrs)을 잇는 자리 — 먼저 물어보고
  // null 이면 아래의 기본 대응으로 떨어진다. `inner(block)` 은 이 엘리먼트의 속을 다시 읽는 문이다.
  readonly claim?: (el: ParseElement, inner: (block: boolean) => NabiNode[]) => NabiNode[] | null;
}

interface Cx {
  readonly allowLocal: boolean;
  readonly claim: ImportOptions['claim'];
  // 지금 리스트 안이면 항목이 무슨 타입인가 — `<li>` 하나가 세 가족을 나눠 쓰기 때문이다.
  readonly item: string;
}

// --- 태그 갈래 ------------------------------------------------------------------------------

// 문단이 되는 태그. `<div data-nabi-p>` 는 래퍼문단의 출력이고 `<p>` 는 글 문단이라 둘 다 문단이다.
const PARAGRAPH_TAGS: ReadonlySet<string> = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// 속까지 통째로 버리는 태그 — 껍데기만 벗기면 스크립트 본문이 글자로 되살아난다.
const DROP_TAGS: ReadonlySet<string> = new Set([
  'script', 'style', 'noscript', 'template', 'head', 'title', 'meta', 'link', 'base',
  'object', 'embed', 'applet', 'form', 'input', 'button', 'select', 'option', 'textarea',
  'svg', 'canvas', 'audio', 'video', 'source', 'track', 'param', 'frame', 'frameset', 'map', 'area',
]);

const HEADING = /^h([1-6])$/;

function hasClass(el: ParseElement, want: string): boolean {
  return (el.attrs['class'] ?? '').split(/\s+/).includes(want);
}

// 옷이지 구조가 아닌 껍데기 — 벗기고 속을 그 자리에 편다.
// 표의 횡스크롤 겉옷은 우리가 입힌 것이고, tbody 류는 브라우저가 끼워 넣는 것이다.
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

// 값이 없는 attr 는 아예 안 싣는다 — 빈 글자열도 값이라, 실어 두면 왕복에서 없던 속성이 생긴다.
function node(w: string, a: Record<string, AttrValue | undefined>, ch: readonly NabiNode[]): ElementNode {
  const attrs: Record<string, AttrValue> = {};
  for (const [key, value] of Object.entries(a)) {
    if (value !== undefined) attrs[key] = value;
  }
  return Object.keys(attrs).length > 0 ? { w, a: attrs as Attrs, ch } : { w, ch };
}

// 받침 걷기 — 혼자 선 라인 하나는 조립이 댄 받침이다(빈 문단·빈 칸). 되읽을 때 도로 빈 속이 된다.
function dropFiller(nodes: readonly NabiNode[]): NabiNode[] {
  if (nodes.length === 1) {
    const only = nodes[0];
    if (typeof only !== 'string' && only.w === BR) return [];
  }
  return [...nodes];
}

// --- 걷기 -----------------------------------------------------------------------------------

// `block` 은 지금 자리가 블록 자리인가다 — 문단이 설 수 있는 자리인지, 글자 사이인지.
function importNodes(nodes: readonly ParseNode[], block: boolean, cx: Cx): NabiNode[] {
  const out: NabiNode[] = [];
  for (const item of expand(nodes)) {
    if (item.kind === 'text') {
      // 블록 자리의 공백뿐인 글자는 태그 사이의 들여쓰기다 — 문단으로 거두면 없던 빈 줄이 생긴다.
      if (block && item.text.trim() === '') continue;
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

// **이사 온 서식** — 서체(tf)와 글자 크기(fs)는 한때 문단 속성이었고 지금은 마크다 (plan 의
// 결정: 문단 하나에 하나씩만 걸리던 것이 글자 범위마다 걸린다). 그 시절에 저장된 문서는
// `<p data-nabi-typeface="serif">` 처럼 **블록에** 그 표식을 달고 있는데, 지금 규칙으로 읽으면
// 문단 속성 화이트리스트에 없어 **조용히 사라진다** — 실제로 그렇게 사라졌다.
//
// 그래서 블록에 걸린 것을 **그 속 전체를 덮는 마크 하나**로 옮긴다. 뜻이 그대로 옮겨지고
// (문단 전체 = 그 문단의 모든 글자), 한 번 읽고 나면 저장값은 새 모양이 된다.
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

// 문단 하나 — 제목 단계·정렬·드롭캡이 태그와 `data-nabi-*` 에서 되읽힌다.
// 속은 인라인으로 읽되 물건은 그대로 둔다 — 물건이 섞인 문단을 쪼개는 것은 cocoon 의 일이다.
function paragraphOf(el: ParseElement, cx: Cx): ElementNode {
  const a: Record<string, AttrValue> = {};
  const level = HEADING.exec(el.tag);
  if (level) a['h'] = Number(level[1]);
  const align = el.attrs['data-nabi-align'];
  if (align === 'l' || align === 'c' || align === 'r') a['a'] = align;
  if ('data-nabi-dropcap' in el.attrs) a['dc'] = 1;
  return node(P, a, dressMoved(el, dropFiller(inline(el, cx))));
}

// 체크 상태 — 우리 속성이거나, 출력 관례의 선두 체크박스다.
function checked(el: ParseElement): boolean {
  if (el.attrs['data-nabi-checked'] === 'true') return true;
  const first = expand(el.children).find((k) => k.kind === 'element');
  if (first === undefined || first.kind !== 'element') return false;
  return first.tag === 'input' && first.attrs['type'] === 'checkbox' && 'checked' in first.attrs;
}

// 평문 블록(코드)의 속 — 줄바꿈은 라인 노드가 된다. 마크는 여기서 전부 벗겨진다.
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

// 바깥 관례(`<code class="language-ts">`)에서 언어를 읽는다 — 붙여넣은 코드 상자도 언어가 따라온다.
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
  const claimed = cx.claim?.(el, (asBlock) => importNodes(el.children, asBlock, cx));
  if (claimed) return claimed;
  if (DROP_TAGS.has(el.tag)) return [];

  switch (el.tag) {
    // --- 단말 ---
    case 'br':
      return [{ w: BR, ch: [] }];
    case 'hr':
      return [{ w: 'hr', ch: [] }];
    case 'img': {
      const src = safeUrl(el.attrs['src'], cx.allowLocal);
      // 못 믿을 주소는 없는 것으로 친다 — 그림이 아니라 통로가 될 수 있다.
      if (src === null) return [];
      // `alt` 는 안 읽는다 — 대체 글이 없는 갈래다(옛 문서의 것도 여기서 떨어진다).
      return [node('img', { src, w: width(el.attrs['data-nabi-width']) }, [])];
    }
    case 'iframe': {
      const id = youtubeId(el.attrs['src']);
      // 유튜브가 아닌 임베드는 안 받는다 — 낯선 문서를 우리 문서 안에 세우지 않는다.
      if (id === null) return [];
      return [node('youtube', { v: id, w: width(el.attrs['data-nabi-width']) }, [])];
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
      // **가는 자리라 로컬 주소를 안 받는다** — 호스트가 미리보기 하나를 켜려고 연 것이
      // 링크에까지 열리면, `data:image/svg+xml` 을 문 `a` 가 문서에 박힌다.
      const href = safeUrl(el.attrs['href']);
      // 화이트리스트를 통과 못 한 주소(`javascript:` 류)는 링크가 아니라 평문이다.
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
    // 글자 사이에 선 문단 — 문단 속에 문단은 못 산다. 껍데기를 벗긴다.
    if (!block) return importNodes(el.children, false, cx);
    // 속에 또 문단이 있다면 이것은 문단이 아니라 묶음이다 (붙여넣은 `<div><p>…</p><p>…</p></div>`).
    if (expand(el.children).some((k) => k.kind === 'element' && PARAGRAPH_TAGS.has(k.tag))) {
      return importNodes(el.children, true, cx);
    }
    return [paragraphOf(el, cx)];
  }

  // 모르는 태그 — 껍데기를 벗기고 속만 편다. 낯선 태그가 문서에 서는 길이 없다.
  return importNodes(el.children, block, cx);
}

// --- 문 -------------------------------------------------------------------------------------

// 엘리먼트 트리 → 나비트리. 마지막 한 걸음(감싸기·쪼개기·_id)은 cocoon 이 맡는다.
export function importDoc(nodes: readonly ParseNode[], options: ImportOptions): NabiDoc {
  const cx: Cx = {
    allowLocal: options.allowLocalUrls === true,
    claim: options.claim,
    item: 'li',
  };
  return cocoon(importNodes(nodes, true, cx), options.env);
}
