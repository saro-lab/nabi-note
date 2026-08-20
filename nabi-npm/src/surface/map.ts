// DOM ↔ 트리 캐럿 사상 — `data-key`(=`_id`) 가 다리다. 정본은 트리이므로
// 화면 캐럿이 트리에 표현 불가한 자리(문단 사이·물건 속)에 서면 가장 가까운 자리로 **교정**한다.
import { isElement, isWrapper, type NabiDoc, type NabiNode, type SchemaEnv } from '../schema/index.js';
import { holderLength, holders, isHolder, nodeAt, type Position } from '../doc/index.js';

// IME 가 빈 문단에서 조합을 시작할 자리 — DOM 에만 살고 트리에는 없다(사상이 걷어 센다).
export const ZERO_WIDTH = '​';

export interface DomPoint {
  readonly node: Node;
  readonly offset: number;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

function logicalLength(text: string): number {
  return text.split(ZERO_WIDTH).join('').length;
}

// 속성 선택자용 — _id 는 안전 문자만 갖지만(schema), 방어로 따옴표·역슬래시를 이스케이프한다.
function escapeId(id: string): string {
  return id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function holderElOf(root: Element, id: string): HTMLElement | null {
  const el = root.querySelector(`[data-key="${escapeId(id)}"]`);
  return el instanceof HTMLElement ? el : null;
}

// `data-key` 하나의 문서 경로. **홀더만이 아니라 노드 전부**를 뒤진다 — DOM 에 키를 다는 것은
// 홀더만이 아니기 때문이다(칸 `td`·행 `tr`·표·그림 전부가 키를 단다). 홀더만 보던 때는 칸을
// 짚는 물음에 늘 null 이 나왔고, 그래서 표를 가로지르는 드래그가 갈 곳을 못 찾았다.
// 답이 홀더가 아닐 수 있다는 것은 부르는 쪽의 몫이다 — `fromDomPoint` 는 그때 속으로 내려가거나
// 위로 올라간다.
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

// 화면 전용 받침(`data-nabi-filler`)은 **라인이 아니다** — 브라우저가 끝의 `<br>` 뒤에 캐럿을
// 못 세우기에 편집기 화면에만 하나 더 세운 것이고, 트리에는 그런 라인이 없다. 셈에 들면 화면과
// 트리의 길이가 어긋나 되맞추기가 매번 "줄이 하나 늘었다" 고 읽는다.
const isFiller = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).hasAttribute('data-nabi-filler');

const isBr = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).tagName === 'BR' && !isFiller(node);

// 봉해진 섬 — 편집기 화면에서만 `contenteditable="false"` 를 입는 조각이다(첨부 링크: 101).
// **글자는 트리의 것이지만 그 속은 캐럿의 집이 아니다** — 브라우저가 안 고쳐지는 자리에는 캐럿을
// 안 세우고 가상 자판도 안 들이므로, 그 속을 가리키는 점은 화면에서 "아무 데도 아닌 자리" 가 된다.
const isSealed = (node: Node): boolean =>
  node.nodeType === ELEMENT_NODE && (node as Element).getAttribute('contenteditable') === 'false';

// 홀더 el 속의 논리 오프셋 → DOM 점. 글자(제로폭 제외) = 한 칸, <br> = 한 칸.
export function toDomPoint(root: Element, doc: NabiDoc, env: SchemaEnv, pos: Position): DomPoint | null {
  const holder = nodeAt(doc, pos.path);
  if (!holder || typeof holder._id !== 'string') return null;
  const el = holderElOf(root, holder._id);
  if (!el) return null;

  // 래퍼문단 — 자리는 0(물건 앞)/1(물건 뒤), 엘리먼트 오프셋으로 쥔다 (크롬 단말 규칙과 같은 모양).
  if (isWrapper(holder, env)) {
    return { node: el, offset: pos.offset <= 0 ? 0 : el.childNodes.length };
  }

  let remain = pos.offset;
  let last: DomPoint = { node: el, offset: 0 };
  const walk = (node: Node): DomPoint | null => {
    if (node.nodeType === TEXT_NODE) {
      const text = node.textContent ?? '';
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === ZERO_WIDTH) continue;
        if (remain === 0) return { node, offset: i };
        remain -= 1;
        last = { node, offset: i + 1 };
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
    // 봉해진 섬 — **통째로 한 칸처럼 건너뛴다.** 속으로 안 내려가는 것이 요점이다.
    //
    // 안 건너뛰면 섬의 **왼쪽 경계**가 섬의 첫 글자 앞으로 풀린다(글자 세기가 거기서 0 이 되므로).
    // 그 점은 안 고쳐지는 자리라 캐럿이 안 보이고 자판도 안 열려서, 첨부 바로 앞에 글을 이어
    // 쓸 수가 없다 — 경계를 일부러 남겨 둔 attach.ts 의 규칙 ①이 화면에서 무너지는 자리다.
    // 그래서 경계 둘을 **섬의 밖**(부모의 자식 자리)으로 준다: 앞은 섬 앞, 뒤는 섬 뒤.
    //
    // 속의 자리(`remain < size`)도 섬 앞으로 접는다. 표현할 점이 없어서이기도 하고, 그 자리는
    // 어차피 닿는 즉시 통째 고르기로 넓어져서(규칙 ①) 잠깐도 안 산다.
    //
    // 통째 고른 선택([from, to))은 이 규칙으로 **섬을 딱 감싼 DOM 범위**가 된다 — 속의 글자를
    // 잡는 것이 아니라 덩어리 하나를 잡는다. 화면에는 물건의 점선 테두리만 남는다(시트가 속의
    // 선택 칠을 걷는다).
    if (node !== el && isSealed(node)) {
      const parent = node.parentNode;
      if (!parent) return null;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      const size = countAll(node);
      if (remain < size) return { node: parent, offset: index };
      remain -= size;
      last = { node: parent, offset: index + 1 };
      return null;
    }
    // 다른 data-key(자식 홀더)는 이 홀더의 칸이 아니다 — 방어.
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

// 서브트리의 논리 칸 수 — fromDomPoint 의 세기용.
function countAll(node: Node): number {
  if (node.nodeType === TEXT_NODE) return logicalLength(node.textContent ?? '');
  if (isBr(node)) return 1;
  let total = 0;
  for (const child of Array.from(node.childNodes)) total += countAll(child);
  return total;
}

export interface MappedPoint {
  readonly pos: Position;
  readonly corrected: boolean;
}

// DOM 점 → 트리 자리. 문단 사이·물건 속은 가장 가까운 자리로 교정(corrected)된다.
export function fromDomPoint(
  root: Element,
  doc: NabiDoc,
  env: SchemaEnv,
  node: Node,
  offset: number,
): MappedPoint | null {
  if (!root.contains(node)) return null;

  // 가장 가까운 data-key 조상 — 없으면 편집기 자신(문단 사이)이다.
  let el: Element | null = node.nodeType === ELEMENT_NODE ? (node as Element) : node.parentElement;
  while (el && el !== root && !el.hasAttribute('data-key')) el = el.parentElement;

  if (!el || el === root) {
    // 문단 사이 — 그 인덱스 뒤 첫 홀더의 처음, 없으면 앞 마지막 홀더의 끝으로 교정한다.
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

  // 잡은 노드에서 **캐럿이 설 자리**를 찾는다 — 셋 중 하나로 끝난다.
  //   1. 그 자신이 홀더다 → 그 자리.
  //   2. 그릇·조각이다(td·tr·table·blockquote…) → 속의 홀더로 **내려간다**. 브라우저가 칸을
  //      가로질러 끌 때 초점이 여기 떨어진다 — Chrome 은 마지막 칸을 `td` 엘리먼트 + offset 0
  //      으로 말한다. 예전에는 이 점이 갈 곳이 없어 표를 가로지르는 드래그가 트리로 안 왔다.
  //   3. 속이 없는 물건이다(그림·영상·구분선) → 그것을 품은 래퍼문단으로 **올라간다**.
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
        // holders 는 `[node2]` 를 문서로 보고 세므로 첫 칸(0)은 그 자신이다 — 떼고 잇는다.
        const into = [...at, ...pick.path.slice(1)];
        const into_offset = offset <= 0 ? 0 : holderLength(pick.node, env);
        return { pos: { path: into, offset: into_offset }, corrected: true };
      }
    }
    el = el.parentElement;
    while (el && el !== root && !el.hasAttribute('data-key')) el = el.parentElement;
    corrected = true; // 물건 속의 점이었다 — 래퍼의 자리로 교정된다
  }
  if (!path || !el || el === root) return null;
  const holder = nodeAt(doc, path);
  if (!holder) return null;

  if (isWrapper(holder, env)) {
    // 래퍼 안 — 엘리먼트 오프셋 0 이면 앞, 그 밖은 뒤다. 물건 속에서 온 점은 뒤로 교정한다.
    const at = node === el ? (offset <= 0 ? 0 : 1) : 1;
    return { pos: { path, offset: at }, corrected: corrected || node !== el };
  }

  // 글 홀더 — (node, offset) 앞의 논리 칸을 센다.
  let acc = 0;
  let found = -1;
  const walk = (cur: Node): boolean => {
    if (cur === node) {
      if (cur.nodeType === TEXT_NODE) {
        const text = cur.textContent ?? '';
        found = acc + logicalLength(text.slice(0, offset));
        return true;
      }
      const kids = Array.from(cur.childNodes);
      for (let i = 0; i < Math.min(offset, kids.length); i += 1) acc += countAll(kids[i] as Node);
      found = acc;
      return true;
    }
    if (cur.nodeType === TEXT_NODE) {
      acc += logicalLength(cur.textContent ?? '');
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

// 브라우저가 **줄 끝의 공백을 NBSP 로 바꿔 넣는다.** contenteditable 에서 맨 끝에 스페이스를
// 치면 U+0020 이 아니라 U+00A0 이 들어간다 — 안 그러면 그 공백이 화면에서 접혀 사라지기 때문에
// 브라우저 나름의 그리기 사정이다.
//
// 그것은 **화면의 사정이지 사람이 친 글자가 아니다.** 그대로 트리에 넣으면 저장값에 NBSP 가
// 박히고, 무엇보다 "스페이스를 쳤다"를 아무도 못 알아본다 — `# ` 오토포맷이 안 뜨던 자리가
// 정확히 여기다(친 것은 스페이스인데 트리에 온 것은 NBSP 라 `' '` 비교가 늘 어긋났다).
//
// 붙여넣기는 이 길로 안 온다(`insertFromPaste` 는 앞에서 막힌다) — 그러니 여기서 되돌려도
// 사람이 일부러 넣은 NBSP 를 뭉개지 않는다. 이 길은 **직접 친 글자**만 지난다.
const NBSP = String.fromCharCode(0xa0);

// 홀더 el 의 화면 글(제로폭 제외, <br> = '\n') — 되맞추기의 자다 (text.ts 의 홀더 글과 같은 모양).
export function domTextOf(el: Element): string {
  let out = '';
  const walk = (node: Node): void => {
    if (node.nodeType === TEXT_NODE) {
      out += (node.textContent ?? '').split(ZERO_WIDTH).join('').split(NBSP).join(' ');
      return;
    }
    if (isBr(node)) {
      out += '\n';
      return;
    }
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(el);
  // 받침 규칙 — 혼자 선 br 하나는 빈 것이다 (render 의 FILLER 와 같은 한 줄 규칙).
  return out === '\n' ? '' : out;
}
