// DOM ↔ 트리 캐럿 사상 — data-key(=_id)가 다리다. 트리가 정본이라 표현 불가한 화면 자리(문단 사이·물건 속)는 가장 가까운 자리로 교정한다
// Maps caret positions between DOM and tree via data-key (=_id); the tree is authoritative, so a screen caret at a position the tree can't express (between paragraphs, inside an object) is corrected to the nearest valid one
import { isElement, isWrapper, type NabiDoc, type NabiNode, type SchemaEnv } from '../schema/index.js';
import { holderLength, holders, isHolder, nodeAt, type Position } from '../doc/index.js';

// IME가 빈 문단에서 조합을 시작할 자리 — DOM에만 살고 트리에는 없다
// A slot for IME composition to start in an empty paragraph; it exists only in the DOM, never in the tree
export const ZERO_WIDTH = '​';

export type CaretSlot = (node: Text) => boolean;

export interface DomPoint {
  readonly node: Node;
  readonly offset: number;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

function projectedText(node: Text, caretSlot?: CaretSlot): string {
  const raw = node.data;
  const owned = caretSlot?.(node) === true && raw.startsWith(ZERO_WIDTH) ? raw.slice(1) : raw;
  return owned.replace(/\r\n?/g, '\n');
}

function logicalLength(node: Text, caretSlot?: CaretSlot): number {
  return projectedText(node, caretSlot).length;
}

// 속성 선택자용 — _id는 schema가 안전 문자만 보장하지만, 방어로 따옴표·역슬래시를 이스케이프한다
// For the attribute selector; schema guarantees _id has only safe characters, but quotes/backslashes are escaped defensively anyway
function escapeId(id: string): string {
  return id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function holderElOf(root: Element, id: string): HTMLElement | null {
  const el = root.querySelector(`[data-key="${escapeId(id)}"]`);
  // root가 iframe·jsdom 같은 다른 realm에서 오면 전역 HTMLElement와 instanceof가 거짓이 된다 — 홀더는 우리 렌더러가 만든 요소라는 계약으로 캐스팅한다
  // instanceof against the global HTMLElement fails when root comes from another realm (iframe, jsdom); the cast instead relies on the contract that holders are always elements our renderer made
  return el as HTMLElement | null;
}

// data-key 하나의 문서 경로 — 홀더만이 아니라 노드 전부를 뒤진다(td·tr·table·img도 키를 단다). 홀더만 보던 때는 칸을 짚는 질문이 늘 null이라 표를 가로지르는 드래그가 갈 곳을 못 찾았다
// Finds one data-key's document path by searching all nodes, not just holders (cells/rows/tables/images carry keys too); searching holders only made every cell query return null, so a drag across a table had nowhere to land
export function pathOfId(doc: NabiDoc, _env: SchemaEnv, id: string): readonly number[] | null {
  let found: readonly number[] | null = null;
  const walk = (nodes: readonly NabiNode[], base: readonly number[]): void => {
    for (let i = 0; i < nodes.length && !found; i += 1) {
      const node = nodes[i];
      if (!isElement(node)) continue;
      const path = [...base, i];
      if (node._id === id) {
        found = path;
        return;
      }
      walk(node.ch, path);
    }
  };
  walk(doc, []);
  return found;
}

// 화면 전용 받침(data-nabi-filler)은 라인이 아니다 — 브라우저가 끝의 br 뒤에 캐럿을 못 세워 화면에만 더한 것이라, 셈에 들면 트리와 길이가 어긋나 reconcile이 매번 줄이 늘었다고 읽는다
// A screen-only filler (data-nabi-filler) doesn't count as a line; it's added only because the browser can't place a caret after a trailing br, and counting it would desync from the tree's length, making reconcile see a phantom extra line every time
const isFiller = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).hasAttribute('data-nabi-filler');

const isBr = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).tagName === 'BR' && !isFiller(node);

// 봉해진 섬은 편집기 화면에서만 contenteditable="false"를 입는다(첨부 링크: 101) — 속은 트리 글자지만 캐럿의 집이 아니다, 브라우저가 그 자리엔 캐럿도 자판도 안 들인다
// A sealed island only carries contenteditable="false" on the editor's screen (attachment link: 101); its inside is real tree text but not a caret home, since the browser places no caret or virtual keyboard there
const isSealed = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).getAttribute('contenteditable') === 'false';

// 홀더 el 속의 논리 오프셋 → DOM 점 — mount 소유 slot 외의 글자와 <br>은 한 칸씩 센다
// Maps a logical offset inside holder `el` to a DOM point; text outside mount-owned slots and each <br> count as one unit
export function toDomPoint(
  root: Element,
  doc: NabiDoc,
  env: SchemaEnv,
  pos: Position,
  caretSlot?: CaretSlot,
): DomPoint | null {
  const holder = nodeAt(doc, pos.path);
  if (!holder || typeof holder._id !== 'string') return null;
  const el = holderElOf(root, holder._id);
  if (!el) return null;

  // 래퍼문단은 0(물건 앞)/1(물건 뒤)을 엘리먼트 오프셋으로 쥔다 — Chrome의 단말 규칙과 같은 모양이다
  // A wrapper paragraph holds 0 (before the object) / 1 (after it) as an element offset, matching Chrome's own terminal-node convention
  if (isWrapper(holder, env)) {
    return { node: el, offset: pos.offset <= 0 ? 0 : el.childNodes.length };
  }

  let remain = pos.offset;
  let last: DomPoint = { node: el, offset: 0 };
  const walk = (node: Node): DomPoint | null => {
    if (node.nodeType === TEXT_NODE) {
      const text = (node as Text).data;
      let i = caretSlot?.(node as Text) === true && text.startsWith(ZERO_WIDTH) ? 1 : 0;
      if (i > 0) last = { node, offset: i };
      while (i < text.length) {
        if (remain === 0) return { node, offset: i };
        remain -= 1;
        i += text[i] === '\r' && text[i + 1] === '\n' ? 2 : 1;
        last = { node, offset: i };
      }
      return null;
    }
    if (node !== el && isBr(node)) {
      const parent = node.parentNode;
      if (!parent) return null;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      if (remain === 0) return { node: parent, offset: index };
      remain -= 1;
      last = { node: parent, offset: index + 1 };
      return null;
    }
    // 봉해진 섬은 통째로 한 칸처럼 건너뛴다(속으로 안 내려간다) — 안 건너뛰면 섬 왼쪽 경계가 첫 글자 앞으로 풀려 캐럿이 안 보이는 자리가 되고 자판도 안 열려 첨부 앞에 이어 쓸 수 없다(attach.ts 규칙 ①). 경계 둘 다 섬 밖(부모의 자식 자리)으로 주고, 속의 자리도 섬 앞으로 접는다
    // A sealed island is skipped whole, like a single unit, never descended into; without this, its left boundary would resolve inside it (counting starts at 0 there), landing the caret somewhere the browser shows no caret or keyboard, blocking typing right before the attachment (attach.ts rule 1). Both boundaries resolve outside the island (as a child position of its parent), and any position inside collapses to the island's front
    if (node !== el && isSealed(node)) {
      const parent = node.parentNode;
      if (!parent) return null;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      const size = countAll(node, caretSlot);
      if (remain < size) return { node: parent, offset: index };
      remain -= size;
      last = { node: parent, offset: index + 1 };
      return null;
    }
    // 다른 data-key(자식 홀더)는 이 홀더의 칸이 아니다 — 방어적으로 걸러낸다
    // A different data-key (a child holder) isn't part of this holder's own count; filtered out defensively
    if (node !== el && node.nodeType === ELEMENT_NODE && (node as Element).hasAttribute('data-key')) return null;
    for (const child of Array.from(node.childNodes)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  const found = walk(el);
  if (found) return found;
  return remain === 0 ? last : null;
}

// 서브트리의 논리 칸 수 — fromDomPoint의 셈에 쓴다
// Counts a subtree's logical units, used by fromDomPoint's counting
function countAll(node: Node, caretSlot?: CaretSlot): number {
  if (node.nodeType === TEXT_NODE) return logicalLength(node as Text, caretSlot);
  if (isBr(node)) return 1;
  let total = 0;
  for (const child of Array.from(node.childNodes)) total += countAll(child, caretSlot);
  return total;
}

export interface MappedPoint {
  readonly pos: Position;
  readonly corrected: boolean;
}

// DOM 점 → 트리 자리 — 문단 사이·물건 속은 가장 가까운 자리로 교정(corrected)된다
// Maps a DOM point to a tree position; between-paragraph or inside-object points are corrected to the nearest valid one
export function fromDomPoint(
  root: Element,
  doc: NabiDoc,
  env: SchemaEnv,
  node: Node,
  offset: number,
  caretSlot?: CaretSlot,
): MappedPoint | null {
  if (!root.contains(node)) return null;

  // 가장 가까운 data-key 조상을 찾는다 — 없으면 편집기 자신이다(문단 사이라는 뜻)
  // Finds the nearest data-key ancestor; none found means the editor itself (i.e. between paragraphs)
  let el: Element | null = node.nodeType === ELEMENT_NODE ? (node as Element) : node.parentElement;
  while (el && el !== root && !el.hasAttribute('data-key')) el = el.parentElement;

  if (!el || el === root) {
    // 문단 사이는 그 인덱스 뒤 첫 홀더의 처음으로, 없으면 앞 마지막 홀더의 끝으로 교정한다
    // Between paragraphs, corrects to the first holder after that index, or the last holder before it if none follows
    const children = node === root ? Array.from(root.children) : [];
    const at = Math.min(offset, children.length);
    for (let i = at; i < children.length; i += 1) {
      const id = children[i]?.getAttribute('data-key');
      const path = id ? pathOfId(doc, env, id) : null;
      if (path) return { pos: { path, offset: 0 }, corrected: true };
    }
    for (let i = at - 1; i >= 0; i -= 1) {
      const id = children[i]?.getAttribute('data-key');
      const path = id ? pathOfId(doc, env, id) : null;
      if (path) {
        const holder = nodeAt(doc, path);
        const len = holder ? holderLength(holder, env) : 0;
        return { pos: { path, offset: len }, corrected: true };
      }
    }
    return null;
  }

  // 잡은 노드에서 캐럿이 설 자리를 찾는다: (1) 그 자신이 홀더면 그 자리, (2) 그릇(td·tr·table 등)이면 속 홀더로 내려간다(Chrome이 표 드래그 끝점을 td+offset 0으로 주는 자리라 예전엔 갈 곳이 없었다), (3) 속 없는 물건(그림·구분선)이면 감싼 래퍼문단으로 올라간다
  // Finds where the caret should land from the hit node: (1) if it's a holder, that's the spot; (2) if it's a container (td/tr/table), descend into an inner holder (this is where Chrome reports a table-drag endpoint, as the td element at offset 0, which used to have nowhere to go); (3) if it's a childless object (image, divider), ascend to its wrapping paragraph
  let path: readonly number[] | null = null;
  let corrected = false;
  while (el && el !== root) {
    const at = pathOfId(doc, env, el.getAttribute('data-key') ?? '');
    const node2 = at ? nodeAt(doc, at) : null;
    if (node2 && isHolder(node2, env)) {
      path = at;
      break;
    }
    if (node2 && at) {
      const inside = holders([node2] as unknown as NabiDoc, env);
      const pick = offset <= 0 ? inside[0] : inside[inside.length - 1];
      if (pick) {
        // holders는 [node2]를 문서로 보고 세므로 첫 칸(0)은 그 자신이다 — 그 자리를 떼고 실제 경로에 잇는다
        // holders() treats [node2] as its own document, so its own index 0 is itself; that leading index is dropped and spliced onto the real path
        const into = [...at, ...pick.path.slice(1)];
        const into_offset = offset <= 0 ? 0 : holderLength(pick.node, env);
        return { pos: { path: into, offset: into_offset }, corrected: true };
      }
    }
    el = el.parentElement;
    while (el && el !== root && !el.hasAttribute('data-key')) el = el.parentElement;
    // 물건 속의 점이었다 — 래퍼의 자리로 교정된다
    // The point was inside an object; it's corrected to the wrapper's position
    corrected = true;
  }
  if (!path || !el || el === root) return null;
  const holder = nodeAt(doc, path);
  if (!holder) return null;

  if (isWrapper(holder, env)) {
    // 래퍼 안에서는 엘리먼트 오프셋 0이면 앞, 그 밖은 뒤다 — 물건 속에서 온 점은 뒤로 교정한다
    // Inside a wrapper, element offset 0 means before, anything else means after; a point that came from inside the object is corrected to "after"
    const at = node === el ? (offset <= 0 ? 0 : 1) : 1;
    return { pos: { path, offset: at }, corrected: corrected || node !== el };
  }

  // 글 홀더에서는 (node, offset) 앞의 논리 칸을 센다
  // For a text holder, counts logical units before (node, offset)
  let acc = 0;
  let found = -1;
  const walk = (cur: Node): boolean => {
    if (cur === node) {
      if (cur.nodeType === TEXT_NODE) {
        const text = cur as Text;
        let prefix = text.data.slice(0, offset);
        if (caretSlot?.(text) === true && prefix.startsWith(ZERO_WIDTH)) prefix = prefix.slice(1);
        found = acc + prefix.replace(/\r\n?/g, '\n').length;
        return true;
      }
      const kids = Array.from(cur.childNodes);
      for (let i = 0; i < Math.min(offset, kids.length); i += 1) acc += countAll(kids[i] as Node, caretSlot);
      found = acc;
      return true;
    }
    if (cur.nodeType === TEXT_NODE) {
      acc += logicalLength(cur as Text, caretSlot);
      return false;
    }
    if (isBr(cur)) {
      acc += 1;
      return false;
    }
    for (const child of Array.from(cur.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  };
  if (!walk(el)) return null;
  const len = holderLength(holder, env);
  const clamped = Math.max(0, Math.min(found, len));
  return { pos: { path, offset: clamped }, corrected: corrected || clamped !== found };
}

// 홀더 el의 화면 글자를 읽는다(<br>는 '\n') — 저장 문자인 NBSP·ZWSP는 그대로 읽는다
// Reads holder el's on-screen text (each <br> becomes '\n'); stored characters like NBSP/ZWSP pass through unchanged
export function domTextOf(el: Element, caretSlot?: CaretSlot): string {
  let out = '';
  let hasFiller = false;
  const walk = (node: Node): void => {
    if (node.nodeType === TEXT_NODE) {
      out += projectedText(node as Text, caretSlot);
      return;
    }
    if (isFiller(node)) {
      hasFiller = true;
      return;
    }
    if (isBr(node)) {
      out += '\n';
      return;
    }
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(el);
  // 받침 규칙 — 혼자 선 br 하나는 빈 것이다(render의 FILLER와 같은 규칙)
  // Filler rule: a single standalone br means empty (the same rule as FILLER in render)
  return out === '\n' && !hasFiller ? '' : out;
}
