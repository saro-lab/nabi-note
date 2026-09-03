// DOM이 허용된 유일한 곳이다(경계 시험 예외) — 브라우저 전용 어댑터라 DOMParser 없는 Node에서는 못 부른다.
// The only place DOM is allowed (boundary-test exception) — a browser-only adapter; it cannot run without DOMParser (e.g. in Node).
import type { NabiDoc } from '../schema/types.js';
import { importDoc, type ImportOptions, type ParseNode } from './import.js';

// 전역 Node.ELEMENT_NODE를 안 쓴다 — DOM 없는 환경에서는 그 전역이 없어 깨진다.
// Not using the global Node.ELEMENT_NODE — that global doesn't exist in a DOM-less environment and would throw.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function adopt(source: globalThis.Node): ParseNode | null {
  if (source.nodeType === TEXT_NODE) return { kind: 'text', text: source.textContent ?? '' };
  // 주석·처리 지시는 문서 밖이다.
  // Comments and processing instructions aren't part of the document.
  if (source.nodeType !== ELEMENT_NODE) return null;
  const el = source as Element;
  const attrs: Record<string, string> = {};
  for (const attr of el.attributes) attrs[attr.name.toLowerCase()] = attr.value;
  const children: ParseNode[] = [];
  for (const child of el.childNodes) {
    const kid = adopt(child);
    if (kid !== null) children.push(kid);
  }
  return { kind: 'element', tag: el.tagName.toLowerCase(), attrs, children };
}

// HTML→최소 엘리먼트 트리, 어댑터의 절반 — createNabi의 parseHtml 옵션이 바라는 모양과 정확히 같아 호스트는 이 문 하나만 꽂으면 된다.
// HTML string to a minimal element tree, half of the adapter — it matches exactly what createNabi's parseHtml option expects, so a host just plugs in this one door.
export function parseNodes(html: string): ParseNode[] {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const roots: ParseNode[] = [];
  for (const child of parsed.body.childNodes) {
    const kid = adopt(child);
    if (kid !== null) roots.push(kid);
  }
  return roots;
}

// HTML 글자열 → 나비트리. 화이트리스트·구조 정리는 전부 뒤쪽(import·cocoon)에서 일어난다.
// HTML string to nabi-tree; whitelisting and structural cleanup all happen downstream (import, cocoon).
export function parseHtml(html: string, options: ImportOptions): NabiDoc {
  return importDoc(parseNodes(html), options);
}
