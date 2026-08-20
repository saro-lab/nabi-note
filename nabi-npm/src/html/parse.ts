// **DOM 이 허락된 유일한 자리** (경계 시험이 이 파일만 예외로 둔다).
// 하는 일은 하나다: DOM 트리를 `import.ts` 의 최소 엘리먼트 모양으로 옮기고, 역대응은 그쪽에 맡긴다.
// 태그 → 노드 규칙이 여기 있으면 브라우저 없이는 시험할 수 없다 — 그래서 어댑터만 남긴다.
//
// **브라우저 전용** — `DOMParser` 가 없는 곳(Node)에서는 부를 수 없다. 서버가 HTML 을 읽어야 하면
// 최소 모양을 손수 지어 `importDoc` 을 직접 부른다 (그물이 그렇게 한다).
import type { NabiDoc } from '../schema/types.js';
import { importDoc, type ImportOptions, type ParseNode } from './import.js';

// 전역 상수(Node.ELEMENT_NODE)를 안 부른다 — DOM 없는 환경에서 깨지는 자리가 거기다.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function adopt(source: globalThis.Node): ParseNode | null {
  if (source.nodeType === TEXT_NODE) return { kind: 'text', text: source.textContent ?? '' };
  if (source.nodeType !== ELEMENT_NODE) return null; // 주석·처리 지시 — 문서의 것이 아니다
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

// HTML 글자열 → 최소 엘리먼트 트리. 어댑터의 절반이고, **`createNabi` 의 `parseHtml` 옵션이
// 바라는 모양이 정확히 이것이다** — 호스트가 `setHtml` 을 쓰려면 이 문 하나만 꽂으면 된다
// (13: 이것이 없으면 브라우저 호스트가 어댑터를 손수 다시 짜야 했다).
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
export function parseHtml(html: string, options: ImportOptions): NabiDoc {
  return importDoc(parseNodes(html), options);
}
