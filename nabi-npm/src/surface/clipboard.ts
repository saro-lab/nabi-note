// 복사·잘라내기가 클립보드에 실을 글자를 짓는다 — 007 이 세운 곁눈질(브라우저가 채우게 두고
// 우리는 한 벌 떠 두기)을 걷고, **우리가 직접 싣는** 자리다 (260823_008).
//
// **왜 우리가 싣나.** 봉해진 첨부(`a[data-nabi-file][contenteditable="false"]`)에는
// `user-select: none` 이 걸려 있고, 크롬은 그 서브트리를 클립보드에 **아예 안 싣는다** —
// 실측으로 잰 답이다: 데모에서 첨부를 골라 복사하면 `text/html` 은 조각 주석만 든 빈 껍데기(60자)로
// 오고 `text/plain` 은 빈 글자다. 앞서 실려 있던 글자마저 그 빈 것으로 덮인다. 그러니 판정
// 복사 출처를 추측하는 옛 판정을 아무리 넓혀도 붙일 것이 없다 — 실을 글자를 짓는 것이 유일한 길이었다.
//
// **덤으로 닫히는 것.** `cloneContents()` 는 조상을 안 든다 — `<h1>` 의 글자를 전부 골라
// 복사해도 "제목이었다" 가 클립보드에 없었다(옛 코어가 `input/copy.ts` 를 둔 그 까닭).
// 여기 `clipContextOf` 가 그 맥락을 되씌운다.
//
// 몸 셋 중 둘은 **글자 함수**다(`dressClipHtml`·`wrapClipHtml`) — DOM 없이 그물이 잡는다.
// DOM 을 보는 것은 조상을 훑는 `clipContextOf` 하나뿐이라 그것만 실기의 몫으로 남는다.
//
// **첨부(파일링크)만은 맥락 두르기가 아니라 문단 감싸기로 간다** (260823_010) — 아래
// `loneFileLink`·`fileClipHtml` 이 그 예외이고, 그 까닭은 그 자리에 적었다.
import { FILLER_ATTR } from '../html/index.js';
import {
  comparePositions,
  fromRuns,
  holderLength,
  holderRuns,
  isHolder,
  sliceRuns,
  terminalOf,
  type EditEnv,
} from '../doc/index.js';
import { ordered, type Selection } from '../caret/index.js';
import { isElement, isWrapper, type ElementNode, type NabiDoc, type NabiNode } from '../schema/index.js';

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const copyElement = (node: ElementNode, ch: readonly NabiNode[]): ElementNode => ({
  w: node.w,
  ...(node.a ? { a: node.a } : {}),
  ch,
});

export function clipboardBodyOf(doc: NabiDoc, selection: Selection, env: EditEnv): readonly ElementNode[] {
  const [start, end] = ordered(selection);
  if (comparePositions(start, end) === 0) return [];
  const terminal = terminalOf(env);

  const walk = (node: ElementNode, path: readonly number[]): ElementNode | null => {
    if (isHolder(node, env)) {
      const first = { path, offset: 0 };
      const last = { path, offset: holderLength(node, env) };
      if (comparePositions(end, first) <= 0 || comparePositions(start, last) >= 0) return null;
      if (!isWrapper(node, env)) {
        const from = samePath(start.path, path) ? start.offset : 0;
        const to = samePath(end.path, path) ? end.offset : last.offset;
        return copyElement(node, fromRuns(sliceRuns(holderRuns(node, terminal), from, to)));
      }
      if (comparePositions(start, first) <= 0 && comparePositions(end, last) >= 0) {
        return copyElement(node, node.ch);
      }
    }

    const ch: NabiNode[] = [];
    node.ch.forEach((child, index) => {
      if (!isElement(child)) return;
      const copied = walk(child, [...path, index]);
      if (copied) ch.push(copied);
    });
    return ch.length === 0 ? null : copyElement(node, ch);
  };

  const body: ElementNode[] = [];
  doc.forEach((node, index) => {
    const copied = walk(node, [index]);
    if (copied) body.push(copied);
  });
  return body;
}

// 화면에만 사는 표식 — 밖으로 나가는 글자에서는 걷는다.
//
//  - `contenteditable`·`draggable` — `html/builders.ts` 가 **편집기 HTML 에만** 다는 봉인.
//  - `data-nabi-picked` — `wings/link/attach.ts` 의 "지금 골라져 있다" 표시.
//  - `data-nabi-dropcap-letter` — 편집기에서만 첫 글자를 실제 상자로 그리는 표시.
//
// `data-key` 는 HTML fallback에 남겨도 해가 없다(들여오기가 모르는 속성은 조용히 흘린다).
const DISPLAY_ONLY = ['contenteditable', 'draggable', 'data-nabi-picked', 'data-nabi-dropcap-letter'];
const DISPLAY_ATTR = new RegExp(`\\s+(?:${DISPLAY_ONLY.join('|')})(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*))?`, 'gi');

// 태그 하나 — 속성 자리는 따옴표 안의 `>` 를 삼킨다. 우리 조립이 낸 HTML 만 읽으면 되므로
// 이만큼이면 넉넉하다(우리 조립 결과에만 적용하며 외부 HTML 판정에는 쓰지 않는다).
const TAG = /<(\/?)([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
const FILLER = new RegExp(`\\s${FILLER_ATTR}\\b`, 'i');
const DROP_CAP_SPAN =
  /<span\b(?=[^>]*\bdata-nabi-dropcap-letter(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?)[^>]*>([^<]*)<\/span>/gi;

// 표시 전용 걷기 — 밖으로 나가는 글자에서 화면의 사정을 지운다.
export function dressClipHtml(html: string): string {
  return html.replace(DROP_CAP_SPAN, '$1').replace(TAG, (all: string, slash: string, name: string, attrs: string) => {
    // 받침 br 은 **노드째** 걷는다. 속성만 걷으면 진짜 라인이 되어 없던 줄이 생긴다 —
    // `html/import.ts` 의 `dropFiller` 는 **혼자 선 br 하나**만 걷으므로 글 뒤에 붙은 받침은
    // 그대로 라인으로 살아난다.
    if (name.toLowerCase() === 'br' && FILLER.test(attrs)) return '';
    const kept = attrs.replace(DISPLAY_ATTR, '');
    return kept === attrs ? all : `<${slash}${name}${kept}>`;
  });
}

// --- 파일링크 예외 -------------------------------------------------------------------------------
//
// 첨부(파일링크)는 마크지만 **하나의 객체**다 — 주인의 확정 (2026-08-23):
//
// > "파일링크는 링크와 달리 object 객체로 인식하는 게 맞기 때문에 **예외적으로 빈 줄을 하나 더
// >  넣어줘.** 안 그러면 파일링크끼리 엉켜서 길어지는 이상한 현상이 일어나."
//
// 그 엉킴의 자리는 붙여넣기다. 첨부만 고르면 조각이 `<a>` 하나라, 들여오면 문단 하나짜리
// **인라인 조각**이 되고 `insertFragmentOp` 의 `spliceInline` 이 그것을 캐럿의 문단 **안**에
// 글줄로 잇는다(260823_008 이 세운 옳은 답이다 — 글에는). 그런데 첨부는 글이 아니라 물건이라,
// 첨부가 이미 선 줄 끝에 붙이면 배지 둘이 한 줄에 나란히 서서 **하나의 긴 첨부처럼** 보인다.
//
// 그래서 실을 때 모양을 바꾼다 — **문단 하나로 감싸고 빈 문단 하나를 뒤에 잇는다.**
//  - 감싸기가 조각을 문단 둘짜리로 만들어 `inlineFragment` 문을 못 지나게 한다 = 제 줄에 선다.
//  - 빈 문단이 **뒤**인 까닭: 붙인 뒤 캐럿이 그 빈 줄에 서서 바로 이어 쓸 수 있다. 앞에 두면
//    첨부 위에 빈 줄이 남고 캐럿은 여전히 첨부 뒤다.
//  - **첨부 하나만 정확히 골랐을 때의 예외다.** 글자와 섞어 긁은 선택은 사람이 "문장을 복사한
//    것"이라 그 자리에서 첨부만 제 줄로 튀어 나가면 안 된다 — 지금 동작(글줄로 잇기)이 맞다.
//
// 감싸는 문단은 **맨 `<p>`** 다 — 첨부가 살던 문단은 다른 글자를 든 남의 문단이라, 그 제목·정렬을
// 첨부 하나가 물고 나올 이유가 없다.
const FILE_OPEN = /^<a\s[^>]*>/i;
const FILE_ATTR = /\sdata-nabi-file="[^"]+"/i;

// 조각이 첨부 `a` **하나로 끝나는가** — 앞뒤에 글자 한 자도 없고 속에 또 다른 `a` 도 없다.
export function loneFileLink(html: string): boolean {
  const s = html.trim();
  const open = FILE_OPEN.exec(s)?.[0];
  if (open === undefined || !s.toLowerCase().endsWith('</a>')) return false;
  if ((s.match(/<a\b/gi) ?? []).length !== 1) return false;
  return FILE_ATTR.test(open);
}

// 첨부 하나를 클립보드에 실을 모양으로 — 문단으로 감싸고 빈 문단 하나를 잇는다.
// 빈 문단의 `<br/>` 는 조립의 빈 문단 표기 그대로다(`html/render.ts` 의 FILLER) — 들여오기의
// "혼자 선 br 하나 = 빈 것" 규칙이 그것을 도로 빈 문단으로 읽는다.
export function fileClipHtml(inner: string): string {
  return `<p>${inner.trim()}</p><p></p>`;
}

// 여는 태그 목록으로 조각을 두른다 — 목록은 **안쪽부터** 온다(`clipContextOf` 가 그 차례로 준다).
export function wrapClipHtml(inner: string, opens: readonly string[]): string {
  let out = inner;
  for (const open of opens) {
    const name = /^<([a-z][a-z0-9-]*)/i.exec(open)?.[1];
    if (name === undefined) continue;
    out = `${open}${out}</${name}>`;
  }
  return out;
}

// --- DOM 을 보는 자리 ---------------------------------------------------------------------------

const START_TO_START = 0;
const END_TO_END = 2;

// 이 블록의 글자를 범위가 **전부** 덮었나 — 끝의 받침 br 은 셈에서 뺀다(그것은 화면의 것이라
// 사람이 고를 수 없고, 그것 때문에 "다 골랐는데 안 덮었다" 가 되면 안 된다).
function coversAll(range: Range, el: Element): boolean {
  const owner = el.ownerDocument;
  if (!owner) return false;
  const whole = owner.createRange();
  whole.selectNodeContents(el);
  let end = el.childNodes.length;
  while (end > 0) {
    const last = el.childNodes[end - 1];
    if (last !== undefined && last.nodeType === 1 && (last as Element).hasAttribute(FILLER_ATTR)) end -= 1;
    else break;
  }
  whole.setEnd(el, end);
  return range.compareBoundaryPoints(START_TO_START, whole) <= 0 && range.compareBoundaryPoints(END_TO_END, whole) >= 0;
}

// 조각 위에 되씌울 조상들 — **안쪽부터 바깥쪽으로** 준다.
//
// 옛 코어의 규칙 셋(`AGENTS.md` §9.14)이 한 줄로 접힌다. `data-key` 가 그 갈림이기 때문이다 —
// 키는 문단 급 이상에만 붙으므로 키 없는 조상은 전부 마크다.
//
//  - **마크**(`b`·`a`·`mark`·`span` …) — **언제나** 씌운다. 굵게 안의 글자를 복사하면 굵게가 온다.
//  - **블록**(`data-key` 를 든 것: 문단·항목·칸·목록·표) — 그 속을 **전부 덮었을 때만** 씌운다.
//    반쯤 덮은 블록을 만나면 거기서 멈춘다(그 위의 `ul`·`table` 도 안 씌운다) — 그것이 옛
//    규칙의 "칸은 조각에 이미 구조가 있을 때만" 과 같은 답이다: 항목을 통째로 덮었을 때만
//    조각에 그 항목이 들어 있다.
export function clipContextOf(range: Range, root: Element): readonly Element[] {
  const out: Element[] = [];
  const start = range.commonAncestorContainer;
  let el: Element | null = start.nodeType === 1 ? (start as Element) : start.parentElement;
  while (el !== null && el !== root && root.contains(el)) {
    if (!el.hasAttribute('data-key')) out.push(el);
    else if (coversAll(range, el)) out.push(el);
    else break;
    el = el.parentElement;
  }
  return out;
}

// 껍데기만 복제해 여는 태그 글자를 뜬다 — 속성을 손으로 다시 적지 않는다.
function openTagOf(el: Element): string {
  const html = (el.cloneNode(false) as Element).outerHTML;
  const close = `</${el.tagName.toLowerCase()}>`;
  return html.toLowerCase().endsWith(close) ? html.slice(0, html.length - close.length) : html;
}

// 범위 하나 → 클립보드에 실을 html.
//
// 첨부 하나만 고른 선택은 **맥락 두르기 대신** 문단 감싸기로 간다(위 `fileClipHtml` 의 까닭).
// 두 길이 겹칠 일은 없다: 첨부가 제 문단을 통째로 덮고 있어도 그 문단은 래퍼문단이 아니라
// 글 문단이라, 첨부의 정체(물건)를 말해 주는 것은 그 문단이 아니라 감싼 새 문단이다.
export function clipHtmlOf(range: Range, root: Element, owner: Document): string {
  const box = owner.createElement('div');
  box.appendChild(range.cloneContents());
  const inner = dressClipHtml(box.innerHTML);
  if (loneFileLink(inner)) return fileClipHtml(inner);
  const opens = clipContextOf(range, root).map(openTagOf);
  return dressClipHtml(wrapClipHtml(inner, opens));
}

// --- 싣기 ---------------------------------------------------------------------------------------

// `ClipboardEvent.clipboardData` 중 우리가 쓰는 만큼 — 그물이 가짜 하나로 이 자리를 잡는다.
export interface ClipTarget {
  setData(type: string, value: string): void;
}

export const NABI_CLIPBOARD_MIME = 'application/vnd.nabi.tree+json';

export function encodeClipboardBody(body: unknown): string {
  return JSON.stringify({ version: 1, body });
}

export function loadClipboard(target: ClipTarget, body: unknown, html: string, plain: string): boolean {
  let htmlWritten = false;
  let plainWritten = false;
  try {
    target.setData(NABI_CLIPBOARD_MIME, encodeClipboardBody(body));
  } catch {
    /* MIME fallback continues. */
  }
  try {
    target.setData('text/html', html);
    htmlWritten = true;
  } catch {
    /* Plain fallback continues. */
  }
  try {
    target.setData('text/plain', plain);
    plainWritten = true;
  } catch {
    /* The caller keeps the source selection intact. */
  }
  return htmlWritten || plainWritten;
}
