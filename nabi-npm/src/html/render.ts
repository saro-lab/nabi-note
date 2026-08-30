// 조립 — 나비트리가 HTML 글자열이 되는 유일한 자리다. DOM 어휘를 전혀 안 쓰므로 서버에서도
// 그대로 돌고(의 SSR 절반), 보기 HTML 과 화면 전용 부속을 단 편집기 HTML 이 **같은 조립**에서
// 나온다.
//
// **이스케이프는 여기 한 곳뿐이고 이 파일 밖으로 안 나간다** — 조립 함수(builders)는 `ctx.element`
// 로만 태그를 짓고, 속성 값은 그 문 안에서 반드시 이스케이프된다. 밖에서 온 값이 HTML 이 되는
// 길이 이 문 하나라, 신뢰 경계가 한 줄로 지켜진다.
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

function escapeTextRun(text: string, preserveEnd = false): string {
  const escaped = escapeText(text);
  return escaped.replace(/ +/g, (spaces, offset: number) => {
    const atEnd = preserveEnd && offset + spaces.length === escaped.length;
    if (spaces.length === 1) return atEnd ? '&nbsp;' : spaces;
    return Array.from(spaces, (_space, at) =>
      at % 2 === 0 || (atEnd && at === spaces.length - 1) ? '&nbsp;' : ' ',
    ).join('');
  });
}

function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- 태그 짓기 ------------------------------------------------------------------------------

// HTML 의 void 엘리먼트 — 자식을 못 갖고, 닫는 태그를 적는 것은 HTML 이 아니다.
// `/` 는 HTML5 에서 있어도 되고 XML·XHTML 에서는 있어야 하므로 `<br/>` 가 양쪽이 다 읽는 한 표기다.
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
  if (!TAG_NAME.test(tag)) return inner;
  const open = `<${tag}${attrsOf(attrs)}`;
  return VOID_TAGS.has(tag) ? `${open}/>` : `${open}>${inner}</${tag}>`;
}

// 화면 전용 받침 — 표식이 붙어 있어 캐럿 사상이 셈에서 건너뛴다.
const REAL_BR = '<br/>';
const FILLER_BR = `<br ${FILLER_ATTR}/>`;

// 홀더의 속 — 받침이 붙는 자리가 **둘**이다.
//
//  ① 아무것도 없으면 줄 상자 하나를 세운다(위의 그 규칙).
//  ② **끝이 라인이면 받침을 하나 더 세운다.** 브라우저는 블록 맨 끝의 `<br>` 를 줄바꿈으로
//     안 그린다 — 그래서 글 끝에서 Shift+Enter 를 처음 치면 트리에는 라인이 들어갔는데
//     화면은 그대로였다("첫 번이 무시된다"). 두 번째 라인부터 갑자기 두 줄이 내려갔다.
//
// 받침은 **화면의 사정**이라 저장·발행되는 값에는 안 나간다 — 그 갈림이 `job.keys` 다
// (편집기 DOM 을 그릴 때만 참). 표식이 붙어 있어 캐럿 사상이 셈에서 건너뛰므로, 이 br 하나가
// 트리의 라인 수를 바꾸지 않는다.

// ②의 판정은 **트리**로 한다. 옛 판은 조립된 글자열의 `endsWith('<br/>')` 였는데, 끝줄이
// 마크 속(insertLine 은 캐럿의 마크를 이어받아 br 을 그 안에 넣는다 — `<span>글<br/></span>`)
// 이면 `</span>` 으로 끝나 못 봤다: 서체·굵게가 걸린 문단에서 Shift+Enter 첫 타가 화면에서
// 무시되던 버그다(주인 신고 2026-08-25, ailog 260825_004). 마크만 파고든다 — 블록급
// (문단·물건·홀더)은 제가 제 받침을 챙기므로 여기서 서면 이중 받침이 된다(td 속 문단).
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

function renderDropCapText(text: string, preserveEnd: boolean, state: DropCapState): string {
  let start = -1;
  let end = -1;
  for (const part of GRAPHEMES.segment(text)) {
    if (start < 0 && SPACE.test(part.segment)) continue;
    if (start < 0) start = part.index;
    end = part.index + part.segment.length;
    if (!PUNCTUATION.test(part.segment)) break;
  }
  if (start < 0 || end < 0) return escapeTextRun(text, preserveEnd);

  state.pending = false;
  const before = escapeTextRun(text.slice(0, start));
  const letter = tagOf('span', escapeText(text.slice(start, end)), { 'data-nabi-dropcap-letter': '' });
  const after = escapeTextRun(text.slice(end), preserveEnd);
  return before + letter + after;
}

const ALIGNS: ReadonlySet<string> = new Set(['l', 'c', 'r']);

function jobOf(options: HtmlOptions, keys: boolean): Job {
  return {
    env: options.env,
    // 맵을 넘겼으면 **그것이 전부다** — 기본 조립을 밑에 깔지 않는다.
    //
    // 깔면 등록이 뜻을 잃는다: wing 을 안 등록했는데도 그 타입이 태그로 그려져, "형광펜 wing 을
    // 껐다"가 화면에서 아무 일도 아닌 것이 된다(껍데기가 그대로 남는다). 등록된 목록이 곧 이
    // 문서가 아는 어휘이고, 모르는 타입은 껍데기를 벗고 속만 남는 것이 규칙이다.
    //
    // 기본 맵은 **맵을 안 넘겼을 때의 받침**이다 — html 층만 떼어 쓰는 자리(그물·SSR 조각)가
    // 문서를 그릴 수 있게.
    builders: options.builders ?? DEFAULT_BUILDERS,
    keys,
    allowLocal: options.allowLocalUrls === true,
  };
}

// data-key 가 붙는 자리 — 문단 급 이상(문단·물건·컨테이너)이다. 마크와 글자는 안 받는다:
// 재그리기·좌표의 단위가 문단이라 인라인에 키를 달 이유가 없다.
function isBlockGrade(w: string, env: SchemaEnv): boolean {
  return w === P || env.lumps.has(w) || env.blockHolders.has(w) || env.inlineHolders.has(w);
}

function contextFor(job: Job, node: ElementNode, block: boolean, preserveEnd: boolean): HtmlContext {
  const key: HtmlAttrs = job.keys && block && typeof node._id === 'string' ? { 'data-key': node._id } : {};
  return {
    element: (tag, inner, attrs) => tagOf(tag, inner, { ...key, ...attrs }),
    wrap: (tag, inner, attrs) => tagOf(tag, inner, attrs ?? {}),
    escape: (text) => escapeTextRun(text, preserveEnd),
    // 가는 자리는 언제나 엄격하다 — 호스트의 allowLocalUrls 가 여기까지 오지 않는다.
    url: (raw) => safeUrl(raw),
    // 가져오는 자리에서만 로컬 주소가 산다.
    src: (raw) => safeUrl(raw, job.allowLocal),
    filled: (inner) => bodyOf(inner, job, node.ch),
    keys: job.keys,
  };
}

function renderNode(node: NabiNode, job: Job, preserveEnd = false, dropCap?: DropCapState): string {
  if (!isElement(node)) {
    return dropCap?.pending === true ? renderDropCapText(node, preserveEnd, dropCap) : escapeTextRun(node, preserveEnd);
  }
  if (node.w === P) return renderParagraph(node, job);
  // 라인은 코어의 것이라 조립 맵을 안 거친다 — wing 이 예약어를 못 쓰기 때문이다.
  if (node.w === BR) {
    if (dropCap) dropCap.pending = false;
    return REAL_BR;
  }

  const block = isBlockGrade(node.w, job.env);
  const childEnd = block || preserveEnd;
  const children = (): string => renderChildren(node.ch, job, childEnd, dropCap);
  const builder = Object.prototype.hasOwnProperty.call(job.builders, node.w) ? job.builders[node.w] : undefined;
  // 조립을 아는 이가 없는 타입 — 껍데기를 벗기고 속만 남긴다. 낯선 태그가 문서로 새지 않는다.
  if (!builder) return children();
  return builder(node, children, contextFor(job, node, block, childEnd));
}

function renderChildren(nodes: readonly NabiNode[], job: Job, preserveEnd = false, dropCap?: DropCapState): string {
  let out = '';
  for (let i = 0; i < nodes.length; i += 1) {
    out += renderNode(nodes[i] as NabiNode, job, preserveEnd && i === nodes.length - 1, dropCap);
  }
  return out;
}

// 문단 — 코어의 것이라 조립 맵을 안 거친다. 태그를 정하는 것은 속성 셋뿐이다:
// 래퍼문단이면 `<div data-nabi-p>`(HTML 문법상 `<p>` 는 표·리스트를 못 품는다), 제목이면
// `<h1>`~`<h6>`, 그 밖에는 `<p>`. 정렬·드롭캡은 `data-nabi-*` 로 얹힌다.
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
  if (!wrapper && p.a?.['dc'] === 1) attrs['data-nabi-dropcap'] = '1';

  const dropCap = job.keys && attrs['data-nabi-dropcap'] === '1' ? { pending: true } : undefined;
  const inner = renderChildren(p.ch, job, true, dropCap);
  return tagOf(tag, bodyOf(inner, job, p.ch), attrs);
}

// --- 문 -------------------------------------------------------------------------------------

// 보기 HTML — 저장·발행되는 값. `nabi.css` 를 건 `.nabi-content` 안에서 그려진다.
export function renderHtml(doc: NabiDoc, options: HtmlOptions): string {
  return renderChildren(doc, jobOf(options, false));
}

// 편집기 HTML — 같은 조립에 `data-key`, 봉인, 실제 드롭캡 글자 같은 화면 부속을 더한다.
// Node 에서도 돈다(의 SSR 절반).
export function renderEditorHtml(doc: NabiDoc, options: HtmlOptions): string {
  return renderChildren(doc, jobOf(options, true));
}

// 문단 하나 — 부분 재그리기(surface)와 SSR 조각이 쓰는 같은 조립의 한 걸음.
export function renderParagraphHtml(p: ElementNode, options: HtmlOptions, editor = false): string {
  return renderNode(p, jobOf(options, editor));
}
