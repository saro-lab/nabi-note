// 각주 노드 다루기 — 글 정리, 선택이 덮은 각주 찾기, 문서 순서 자리, 문서 끝 목록 조립.
// Footnote node helpers: text cleanup, finding the footnote a selection covers, document-order spots, and the document-end list.
import { isElement, isWrapper, runsOf, type ElementNode, type NabiDoc, type NabiNode } from '../../schema/index.js';
import { holders, nodeAt, terminalOf, type EditEnv, type Position } from '../../doc/index.js';
import { ordered, type Selection } from '../../caret/index.js';
import type { HtmlAppendix } from '../../html/index.js';
import type { MdAppendix } from '../../io/index.js';
import { textLinkParts } from '../../url.js';

export const FN = 'fn';

const CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const LINE_BREAK = /\s*(?:\r\n?|[\n\u2028\u2029])\s*/g;

// 각주 내용은 한 줄 텍스트다 — 줄바꿈은 공백 하나로, 제어 문자는 지우고, 비면 각주가 아니다(null).
// Footnote content is one line of text: a line break becomes one space, control characters go, and an empty result is no footnote (null).
export function footnoteText(value: unknown): string | null {
  const raw = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : null;
  if (raw === null) return null;
  const text = raw.replace(LINE_BREAK, ' ').replace(/\t/g, ' ').replace(CONTROLS, '').trim();
  return text === '' ? null : text;
}

export function textOf(node: ElementNode): string {
  const value = node.a?.['t'];
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}

// 글 문단·글줄 홀더(접기 제목)에만 선다 — 코드 상자는 글자 그대로의 자리라 안 받는다.
// Stands only in text paragraphs and inline holders (a details summary); a code box is literal text, so it takes none.
export function takesFootnote(holder: ElementNode, env: EditEnv): boolean {
  if (holder.w === 'p') return !isWrapper(holder, env);
  return env.inlineHolders.has(holder.w) && holder.w !== 'code';
}

// 홀더 안 각주의 칸 자리들 — 접힌 캐럿 옆 지우기와 문서 순서 자리가 같이 쓴다.
// Offsets of the footnotes inside a holder; shared by deletion beside a caret and by document-order spots.
export function footnoteOffsets(holder: ElementNode, env: EditEnv): number[] {
  const out: number[] = [];
  let at = 0;
  for (const run of runsOf(holder, terminalOf(env))) {
    if (run.kind === 'node' && run.node.w === FN) out.push(at);
    at += run.kind === 'text' ? run.text.length : 1;
  }
  return out;
}

export interface FootnoteHit {
  readonly path: readonly number[];
  readonly offset: number;
  readonly holder: ElementNode;
  readonly node: ElementNode;
}

// 선택이 각주 하나를 꼭 맞게 덮을 때만 답한다 — 상황 줄의 고치기·지우기가 겨누는 모양이다.
// Answers only when the selection covers exactly one footnote; that's the shape the context row's edit/delete aims at.
export function footnoteAt(doc: NabiDoc, sel: Selection, env: EditEnv): FootnoteHit | null {
  const [start, end] = ordered(sel);
  if (end.offset - start.offset !== 1 || start.path.length !== end.path.length) return null;
  if (start.path.some((value, i) => value !== end.path[i])) return null;
  const holder = nodeAt(doc, start.path);
  if (!holder || isWrapper(holder, env)) return null;
  let at = 0;
  for (const run of runsOf(holder, terminalOf(env))) {
    if (at === start.offset) {
      return run.kind === 'node' && run.node.w === FN ? { path: start.path, offset: at, holder, node: run.node } : null;
    }
    if (at > start.offset) return null;
    at += run.kind === 'text' ? run.text.length : 1;
  }
  return null;
}

// 문서 순서의 각주 자리 — 번호 n은 이 목록의 n-1번째다(렌더의 차례와 같은 트리 순서).
// Footnote spots in document order; number n is entry n-1 (the same tree order the renderer counts).
export function footnoteSpots(doc: NabiDoc, env: EditEnv): Position[] {
  const out: Position[] = [];
  for (const { path, node } of holders(doc, env)) {
    if (isWrapper(node, env)) continue;
    for (const offset of footnoteOffsets(node, env)) out.push({ path, offset });
  }
  return out;
}

// 각주 하나를 갈아 끼운다 — 마크 속에 들어가 있어도 같은 참조를 찾아 그 자리만 바꾼다.
// Swaps one footnote node; even nested inside marks it finds the same reference and replaces just that spot.
export function withNode(holder: ElementNode, target: ElementNode, next: ElementNode): ElementNode {
  const swap = (nodes: readonly NabiNode[]): readonly NabiNode[] => {
    let changed = false;
    const out = nodes.map((node) => {
      if (node === target) {
        changed = true;
        return next;
      }
      if (!isElement(node) || node.ch.length === 0) return node;
      const ch = swap(node.ch);
      if (ch === node.ch) return node;
      changed = true;
      return { ...node, ch };
    });
    return changed ? out : nodes;
  };
  const ch = swap(holder.ch);
  return ch === holder.ch ? holder : { ...holder, ch };
}

// 저장·게시 HTML의 문서 끝 목록 — 번호는 저장하지 않으니 여기서도 차례로 매긴다.
// The document-end list in stored/published HTML; numbers are never stored, so they're assigned by order here too.
export const footnoteList: HtmlAppendix = (nodes, ctx) => {
  const items = nodes
    .map((node, i) => {
      const n = String(i + 1);
      const num = ctx.wrap('span', ctx.escape(`[${n}]`), { 'data-nabi-fn-num': '' });
      const text = textLinkParts(textOf(node))
        .map((part) => (part.href ? ctx.wrap('a', ctx.escape(part.text), { href: part.href }) : ctx.escape(part.text)))
        .join('');
      return ctx.wrap('li', `${num} ${text}`, { 'data-nabi-fn-n': n });
    })
    .join('');
  return ctx.wrap('section', ctx.wrap('ol', items), { 'data-nabi-footnotes': '' });
};

// md 각주 정의 줄 — GFM 문법이라 다른 md 뷰어에서도 각주로 읽힌다.
// md footnote definition lines; GFM syntax, so other md viewers read them as footnotes too.
export const footnoteMdList: MdAppendix = (nodes, escape) =>
  nodes.map((node, i) => `[^${i + 1}]: ${escape(textOf(node))}`).join('\n');
