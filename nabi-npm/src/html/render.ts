// 조립 — 나비트리가 HTML이 되는 유일한 자리이자 이스케이프가 일어나는 유일한 곳이다(조립 함수는 ctx.element로만 태그를 짓는다) — 신뢰 경계가 한 줄로 지켜진다.
// Assembly — the only place a nabi-tree becomes HTML, and the only place escaping happens (builders write tags solely through ctx.element) — the trust boundary stays a single line.
import { isWrapper, type SchemaEnv } from '../schema/env.js';
import { BR, P } from '../schema/reserved.js';
import { isElement, type ElementNode, type NabiDoc, type NabiNode } from '../schema/types.js';
import { DEFAULT_BUILDERS, FILLER_ATTR } from './builders.js';
import type { HtmlAttrs, HtmlBuilders, HtmlContext, HtmlOptions } from './contract.js';
import { safeUrl } from './url.js';

// --- 이스케이프 (이 모듈 전용) ----------------------------------------------------------------

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeTextRun(text: string, preserveStart = false, preserveEnd = false): string {
  const escaped = escapeText(text);
  return escaped.replace(/ +/g, (spaces, offset: number) => {
    const atStart = preserveStart && offset === 0;
    const atEnd = preserveEnd && offset + spaces.length === escaped.length;
    if (spaces.length === 1) return atStart || atEnd ? '&nbsp;' : spaces;
    return Array.from(spaces, (_space, at) =>
      at % 2 === 0 || (atEnd && at === spaces.length - 1) ? '&nbsp;' : ' ',
    ).join('');
  });
}

function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- 태그 짓기 ------------------------------------------------------------------------------

// HTML의 void 엘리먼트 — 닫는 태그가 없다. `/`는 HTML5엔 선택이지만 XML/XHTML엔 필수라 `<br/>`가 양쪽에서 다 읽힌다.
// HTML void elements have no closing tag. The trailing `/` is optional in HTML5 but required in XML/XHTML, so `<br/>` reads correctly either way.
const VOID_TAGS: ReadonlySet<string> = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

// 태그·속성 이름은 값이 아니라 문법이라 이스케이프로 막을 수 없다 — 모양이 아니면 아예 안 적는다.
// Tag and attribute names are syntax, not values, so escaping can't guard them — anything the wrong shape is simply omitted.
const TAG_NAME = /^[a-z][a-z0-9]*$/;
const ATTR_NAME = /^[a-z][a-z0-9-]*$/;

function attrsOf(attrs: HtmlAttrs): string {
  let out = '';
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || !ATTR_NAME.test(name)) continue;
    out += value === '' ? ` ${name}` : ` ${name}="${escapeAttr(value)}"`;
  }
  return out;
}

function tagOf(tag: string, inner: string, attrs: HtmlAttrs): string {
  // 모양이 아닌 태그 이름은 껍데기를 버리고 속만 남긴다 — 낯선 조립 함수도 문법을 못 깬다.
  // A tag name of the wrong shape drops its wrapper and keeps only the content — even a rogue builder can't break the grammar.
  if (!TAG_NAME.test(tag)) return inner;
  const open = `<${tag}${attrsOf(attrs)}`;
  return VOID_TAGS.has(tag) ? `${open}/>` : `${open}>${inner}</${tag}>`;
}

// 화면 전용 받침 — 표식이 붙어 있어 캐럿 사상이 셈에서 건너뛴다.
// A screen-only filler — marked, so caret mapping skips it when counting.
const REAL_BR = '<br/>';
const FILLER_BR = `<br ${FILLER_ATTR}/>`;

// 받침이 필요한 자리 둘 — 속이 비면 줄 상자용, 끝이 라인이면 브라우저가 블록 끝 br을 안 그려서다. `job.keys`가 참일 때(편집기 DOM)만 나가 저장값엔 안 남는다.
// A filler is needed in two spots — an empty holder needs a line box, and a trailing line needs one because browsers don't render a block-final br. It only appears when `job.keys` is true (editor DOM), never in the stored value.

// 판정은 조립된 글자열이 아니라 트리로 한다 — 마크 속 br은 `</span>`으로 끝나 문자열 끝검사로는 못 잡는다. 마크만 파고들고, 블록급은 제 받침을 스스로 챙기므로 여기서 세면 이중이 된다.
// Judged from the tree, not the rendered string — a br inside a mark ends in `</span>`, so a string-end check would miss it. Recursion only follows marks; block-grade nodes handle their own filler, so counting them here would double up.
function trailingLine(nodes: readonly NabiNode[], env: SchemaEnv): boolean {
  const last = nodes[nodes.length - 1];
  if (last === undefined || !isElement(last)) return false;
  if (last.w === BR) return true;
  if (isBlockGrade(last.w, env)) return false;
  return trailingLine(last.ch, env);
}

function bodyOf(inner: string, job: Job, nodes: readonly NabiNode[]): string {
  if (inner === '') return job.keys ? FILLER_BR : '';
  if (job.keys && trailingLine(nodes, job.env)) return inner + FILLER_BR;
  return inner;
}

// --- 조립 ------------------------------------------------------------------------------------

interface Job {
  readonly env: SchemaEnv;
  readonly builders: HtmlBuilders;
  readonly keys: boolean;
  readonly allowLocal: boolean;
}

interface DropCapState {
  pending: boolean;
}

const GRAPHEMES = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const SPACE = /^\s+$/u;
const PUNCTUATION = /^\p{P}+$/u;

function renderDropCapText(text: string, preserveStart: boolean, preserveEnd: boolean, state: DropCapState): string {
  let start = -1;
  let end = -1;
  for (const part of GRAPHEMES.segment(text)) {
    if (start < 0 && SPACE.test(part.segment)) continue;
    if (start < 0) start = part.index;
    end = part.index + part.segment.length;
    if (!PUNCTUATION.test(part.segment)) break;
  }
  if (start < 0 || end < 0) return escapeTextRun(text, preserveStart, preserveEnd);

  state.pending = false;
  const before = escapeTextRun(text.slice(0, start), preserveStart);
  const letter = tagOf('span', escapeText(text.slice(start, end)), { 'data-nabi-dropcap-letter': '' });
  const after = escapeTextRun(text.slice(end), false, preserveEnd);
  return before + letter + after;
}

const ALIGNS: ReadonlySet<string> = new Set(['l', 'c', 'r']);

function jobOf(options: HtmlOptions, keys: boolean): Job {
  return {
    env: options.env,
    // 맵을 넘기면 그것이 전부다 — 기본과 안 섞는다. 섞으면 wing을 껐다는 신호(맵에서 뺌)가 무시되고 기본 태그로 그려진다. 기본 맵은 맵을 안 넘긴 쪽(그물·SSR)만을 위한 받침이다.
    // Passing a builders map means that's all there is — it never merges with the default. Otherwise disabling a wing (removing it from the map) would be ignored and it'd still render via the default. The default map is only a fallback for callers that pass none at all (the bare html layer, SSR).
    builders: options.builders ?? DEFAULT_BUILDERS,
    keys,
    allowLocal: options.allowLocalUrls === true,
  };
}

// data-key는 문단급 이상(문단·물건·컨테이너)에만 붙는다 — 재그리기 단위가 문단이라 마크·글자엔 필요 없다.
// data-key applies only to paragraph-grade nodes (paragraph, lump, container) — repaint operates per paragraph, so marks and text never need one.
function isBlockGrade(w: string, env: SchemaEnv): boolean {
  return w === P || env.lumps.has(w) || env.blockHolders.has(w) || env.inlineHolders.has(w);
}

function contextFor(
  job: Job,
  node: ElementNode,
  block: boolean,
  preserveStart: boolean,
  preserveEnd: boolean,
): HtmlContext {
  const key: HtmlAttrs = job.keys && block && typeof node._id === 'string' ? { 'data-key': node._id } : {};
  return {
    element: (tag, inner, attrs) => tagOf(tag, inner, { ...key, ...attrs }),
    wrap: (tag, inner, attrs) => tagOf(tag, inner, attrs ?? {}),
    escape: (text) => escapeTextRun(text, preserveStart, preserveEnd),
    // 가는 자리는 언제나 엄격하다 — 호스트의 allowLocalUrls 가 여기까지 오지 않는다.
    // A navigation target is always strict — the host's allowLocalUrls never reaches this far.
    url: (raw) => safeUrl(raw),
    // 가져오는 자리에서만 로컬 주소가 산다.
    // Local addresses are allowed only for a fetch target.
    src: (raw) => safeUrl(raw, job.allowLocal),
    filled: (inner) => bodyOf(inner, job, node.ch),
    keys: job.keys,
  };
}

function renderNode(
  node: NabiNode,
  job: Job,
  preserveStart = false,
  preserveEnd = false,
  dropCap?: DropCapState,
): string {
  if (!isElement(node)) {
    return dropCap?.pending === true
      ? renderDropCapText(node, preserveStart, preserveEnd, dropCap)
      : escapeTextRun(node, preserveStart, preserveEnd);
  }
  if (node.w === P) return renderParagraph(node, job);
  // 라인은 코어의 것이라 조립 맵을 안 거친다 — wing 이 예약어를 못 쓰기 때문이다.
  // A line is core, so it skips the builder map — a wing can never claim a reserved word.
  if (node.w === BR) {
    if (dropCap) dropCap.pending = false;
    return REAL_BR;
  }

  const block = isBlockGrade(node.w, job.env);
  const childStart = block || preserveStart;
  const childEnd = block || preserveEnd;
  const children = (): string => renderChildren(node.ch, job, childStart, childEnd, dropCap);
  const builder = Object.prototype.hasOwnProperty.call(job.builders, node.w) ? job.builders[node.w] : undefined;
  // 조립을 아는 이가 없는 타입 — 껍데기를 벗기고 속만 남긴다. 낯선 태그가 문서로 새지 않는다.
  // A type with no builder — its wrapper is dropped, keeping only content. An unknown tag never leaks into the document.
  if (!builder) return children();
  return builder(node, children, contextFor(job, node, block, childStart, childEnd));
}

function renderChildren(
  nodes: readonly NabiNode[],
  job: Job,
  preserveStart = false,
  preserveEnd = false,
  dropCap?: DropCapState,
): string {
  let out = '';
  for (let i = 0; i < nodes.length; i += 1) {
    out += renderNode(
      nodes[i] as NabiNode,
      job,
      preserveStart && i === 0,
      preserveEnd && i === nodes.length - 1,
      dropCap,
    );
  }
  return out;
}

// 문단도 코어 값이라 조립 맵을 안 거친다 — 래퍼문단은 `<div data-nabi-p>`다(HTML 문법상 `<p>`는 표·리스트를 못 품는다).
// A paragraph is core too, so it skips the builder map — a wrapper paragraph renders as `<div data-nabi-p>` since HTML forbids a `<p>` from containing a table or list.
function renderParagraph(p: ElementNode, job: Job): string {
  const wrapper = isWrapper(p, job.env);
  const attrs: Record<string, string | undefined> = {};
  if (job.keys && typeof p._id === 'string') attrs['data-key'] = p._id;

  let tag = 'p';
  if (wrapper) {
    tag = 'div';
    attrs['data-nabi-p'] = '';
  } else {
    const h = p.a?.['h'];
    if (typeof h === 'number' && Number.isInteger(h) && h >= 1 && h <= 6) tag = `h${h}`;
  }

  const align = p.a?.['a'];
  if (typeof align === 'string' && ALIGNS.has(align)) attrs['data-nabi-align'] = align;
  // 래퍼문단이 입는 문단 속성은 정렬뿐이다 — 드롭캡은 글의 첫 글자에 걸리는 것이다.
  // A wrapper paragraph only ever takes alignment — a dropcap attaches to the first letter of actual text.
  if (!wrapper && p.a?.['dc'] === 1) attrs['data-nabi-dropcap'] = '1';

  const dropCap = job.keys && attrs['data-nabi-dropcap'] === '1' ? { pending: true } : undefined;
  const inner = renderChildren(p.ch, job, true, true, dropCap);
  return tagOf(tag, bodyOf(inner, job, p.ch), attrs);
}

// --- 문 -------------------------------------------------------------------------------------

// 보기 HTML — 저장·발행되는 값. `nabi.css` 를 건 `.nabi-content` 안에서 그려진다.
// Display HTML — the stored/published value, meant to render inside a `.nabi-content` with `nabi.css` loaded.
export function renderHtml(doc: NabiDoc, options: HtmlOptions): string {
  return renderChildren(doc, jobOf(options, false));
}

// 편집기 HTML — 같은 조립에 data-key·화면 전용 부속을 더한다. DOM 어휘가 없어 Node에서도 돈다.
// Editor HTML — same assembly plus data-key and screen-only extras; no DOM vocabulary, so it runs in Node too.
export function renderEditorHtml(doc: NabiDoc, options: HtmlOptions): string {
  return renderChildren(doc, jobOf(options, true));
}

// 문단 하나 — 부분 재그리기(surface)와 SSR 조각이 쓰는 같은 조립의 한 걸음.
// One paragraph — the same assembly's single step, used by partial repaint (surface) and SSR fragments.
export function renderParagraphHtml(p: ElementNode, options: HtmlOptions, editor = false): string {
  return renderNode(p, jobOf(options, editor));
}
