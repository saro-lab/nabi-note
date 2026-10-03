// 복사·잘라내기 HTML을 직접 짓는다(007→260823_008) — 크롬이 user-select:none 첨부 서브트리를 클립보드에서 통째로 빼먹어(실측 60자 빈 껍데기) 브라우저에 맡길 수 없다. cloneContents()가 조상을 안 들고 오는 문제는 clipContextOf가 되씌워 보완한다
// Builds copy/cut HTML ourselves (007 -> 260823_008); Chrome drops a user-select:none attachment's subtree from the clipboard entirely (measured: a 60-byte empty shell), so we can't rely on the browser. clipContextOf re-wraps ancestor context that cloneContents() otherwise loses
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

// 화면 전용 표식(contenteditable·draggable·data-nabi-picked·data-nabi-dropcap-letter)은 밖으로 나가는 글자에서 걷는다 — data-key는 남아도 무해하다(들여오기가 모르는 속성은 조용히 흘린다)
// Screen-only markers (contenteditable, draggable, data-nabi-picked, data-nabi-dropcap-letter) are stripped from outgoing text; data-key is harmless to leave (import silently drops attributes it doesn't recognize)
const DISPLAY_ONLY = ['contenteditable', 'draggable', 'data-nabi-picked', 'data-nabi-dropcap-letter'];
const DISPLAY_ATTR = new RegExp(`\\s+(?:${DISPLAY_ONLY.join('|')})(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*))?`, 'gi');

// 태그 하나를 매치 — 따옴표 안 `>`도 삼킨다. 우리가 조립한 HTML에만 적용하므로 이 정도로 충분하다(외부 HTML 판정에는 안 쓴다)
// Matches one tag, tolerating a quoted `>` inside an attribute; good enough since this only runs on HTML we assembled ourselves, never on untrusted external HTML
const TAG = /<(\/?)([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
const FILLER = new RegExp(`\\s${FILLER_ATTR}\\b`, 'i');
const DROP_CAP_SPAN =
  /<span\b(?=[^>]*\bdata-nabi-dropcap-letter(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?)[^>]*>([^<]*)<\/span>/gi;

// 표시 전용 걷기 — 밖으로 나가는 글자에서 화면 전용 표식을 지운다
// Strips screen-only display markers from text headed outside the editor
export function dressClipHtml(html: string): string {
  return html.replace(DROP_CAP_SPAN, '$1').replace(TAG, (all: string, slash: string, name: string, attrs: string) => {
    // 받침 br은 노드째 걷는다 — 속성만 걷으면 진짜 라인이 되어, dropFiller가 못 잡는 "글 뒤에 붙은 받침"이 되살아난다
    // A filler br is removed entirely, not just its attribute, or it becomes a real line break that dropFiller (which only strips a lone standalone br) won't catch when it trails real text
    if (name.toLowerCase() === 'br' && FILLER.test(attrs)) return '';
    const kept = attrs.replace(DISPLAY_ATTR, '');
    return kept === attrs ? all : `<${slash}${name}${kept}>`;
  });
}

// --- 파일링크 예외: 첨부는 마크지만 하나의 객체로 다뤄, 붙여넣을 때만 문단으로 감싸고 뒤에 빈 문단을 잇는다(2026-08-23) — 안 그러면 인라인 조각으로 취급돼 이미 있는 줄 끝에 붙어 첨부 둘이 하나처럼 엉킨다. 빈 문단이 뒤인 까닭은 캐럿이 거기 서서 바로 이어 쓰게 하려는 것. 글자와 섞어 고른 선택엔 이 예외가 안 걸린다 ---
// File-link exception: an attachment is a mark but treated as one object, so pasting wraps it in a plain paragraph plus a trailing empty one (2026-08-23) -- otherwise it's treated as inline text and tacked onto an existing line, making two attachments look like one merged badge. The empty paragraph trails so the caret lands there ready to type; a selection mixing text with the attachment skips this exception
const FILE_OPEN = /^<a\s[^>]*>/i;
const FILE_ATTR = /\sdata-nabi-file="[^"]+"/i;

// 조각이 첨부 a 태그 하나뿐인가 — 앞뒤에 글자도 없고 속에 다른 a도 없다
// Whether the fragment is exactly one attachment <a> tag, with no surrounding text and no nested <a>
export function loneFileLink(html: string): boolean {
  const s = html.trim();
  const open = FILE_OPEN.exec(s)?.[0];
  if (open === undefined || !s.toLowerCase().endsWith('</a>')) return false;
  if ((s.match(/<a\b/gi) ?? []).length !== 1) return false;
  return FILE_ATTR.test(open);
}

// 첨부 하나를 문단으로 감싸고 빈 문단을 잇는다 — 빈 <br/>은 html/render.ts의 FILLER 표기와 같아 들여오기가 그대로 빈 문단으로 읽는다
// Wraps a lone attachment in a paragraph plus a trailing empty one; the empty <br/> matches html/render.ts's FILLER marker, so import reads it back as an empty paragraph
export function fileClipHtml(inner: string): string {
  return `<p>${inner.trim()}</p><p></p>`;
}

// 여는 태그 목록으로 조각을 두른다 — 목록은 안쪽부터 온다(clipContextOf가 그 순서로 준다)
// Wraps the fragment in a list of opening tags, given innermost-first (the order clipContextOf produces)
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
const SHOW_TEXT = 4;

// 범위가 이 블록의 글자를 전부 덮었나 — 화면 전용인 끝의 받침 br은 사람이 고를 수 없어 셈에서 뺀다
// Whether the range covers all of this block's text; a trailing filler br is screen-only and unselectable, so it's excluded from the count
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

// 조각 위에 되씌울 조상들을 안쪽부터 바깥쪽 순으로 모은다 — data-key 없는 조상(마크)은 항상 씌우고, data-key 있는 블록(문단·칸·표 등)은 그 속을 전부 덮었을 때만 씌우며, 반쯤 덮으면 거기서 멈춘다
// Collects ancestors to re-wrap the fragment in, innermost first; ancestors without data-key (marks) are always included, but a data-key'd block (paragraph/cell/table) is included only if fully covered, stopping there otherwise
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

// 얕은 복제로 여는 태그 글자를 뜬다 — 속성을 손으로 다시 안 적는다
// Gets the opening tag text via a shallow clone, so attributes aren't retyped by hand
function openTagOf(el: Element): string {
  const html = (el.cloneNode(false) as Element).outerHTML;
  const close = `</${el.tagName.toLowerCase()}>`;
  return html.toLowerCase().endsWith(close) ? html.slice(0, html.length - close.length) : html;
}

// 범위 하나를 클립보드 HTML로 — 첨부 하나만 고른 선택은 맥락 두르기 대신 문단 감싸기로 간다(fileClipHtml). 두 길은 절대 안 겹친다: 첨부의 부모 문단은 글 문단이라 물건임을 말해 주지 못한다
// Converts one range to clipboard HTML; a selection of exactly one attachment takes the paragraph-wrap path instead of ancestor-wrapping (fileClipHtml). The two paths never overlap, since an attachment's parent paragraph is a text paragraph and can't itself signal "this is an object"
export function clipHtmlOf(range: Range, root: Element, owner: Document): string {
  const box = owner.createElement('div');
  box.appendChild(range.cloneContents());
  // 부분 선택은 보호된 공백 사이에서 시작할 수 있어, 복사 조각의 양 끝을 다시 보호한다.
  // Partial selections can split protected spaces, so protect the copied fragment's edges again.
  const texts = owner.createTreeWalker(box, SHOW_TEXT);
  const first = texts.nextNode();
  if (first) {
    let last = first;
    for (let next = texts.nextNode(); next; next = texts.nextNode()) last = next;
    first.nodeValue = (first.nodeValue ?? '').replace(/^ +/, (spaces) => '\u00a0'.repeat(spaces.length));
    last.nodeValue = (last.nodeValue ?? '').replace(/ +$/, (spaces) => '\u00a0'.repeat(spaces.length));
  }
  const inner = dressClipHtml(box.innerHTML);
  if (loneFileLink(inner)) return fileClipHtml(inner);
  const opens = clipContextOf(range, root).map(openTagOf);
  return dressClipHtml(wrapClipHtml(inner, opens));
}

// --- 싣기 ---------------------------------------------------------------------------------------

// ClipboardEvent.clipboardData 중 우리가 쓰는 부분만 — 테스트는 가짜 구현으로 이 자리를 채운다
// The slice of ClipboardEvent.clipboardData we actually use; tests fill this with a fake implementation
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
