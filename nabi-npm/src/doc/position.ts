// 자리(Position) — 캐럿의 좌표는 (문단, 오프셋) 하나다.
// 문단은 루트 문단 배열에서 자식 인덱스로 내려가는 경로로 가리킨다 — 마지막 인덱스가
// 캐럿 홀더(문단 또는 인라인 홀더)여야 한다. 래퍼문단 안은 0(물건 앞)·1(물건 뒤) 둘뿐이다.
// 이 파일은 04(caret)가 그대로 가져다 쓰는 최소 공유 타입이다 — caret 은 doc 의 위층이다.
import {
  BR,
  P,
  isElement,
  isWrapper,
  lengthOf,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
  type SchemaEnv,
  type Terminal,
} from '../schema/index.js';

export interface Position {
  // 루트부터 자식 인덱스로 내려가는 경로 — 마지막이 캐럿 홀더다.
  readonly path: readonly number[];
  // 홀더 안의 칸 (0 ~ lengthOf). 글자·단말 = 한 칸, 래퍼문단은 0/1.
  readonly offset: number;
}

// 연산의 답 — 반환 자리는 반환 문서에 실재해야 한다 (공통 계약, 옛 mergeBox 버그의 교훈).
export interface EditResult {
  readonly doc: NabiDoc;
  readonly caret: Position;
  // 범위를 남기는 연산(마크)만 싣는다 — 없으면 접힌 캐럿이다.
  readonly anchor?: Position;
}

// doc 층의 환경 — 스키마 환경에 편집 규칙 하나를 얹는다.
export interface EditEnv extends SchemaEnv {
  // 문단 하나로 고정된 컨테이너(표의 칸 등) — 그 속의 엔터는 분할이 아니라 라인이다.
  readonly singleParagraph?: ReadonlySet<string>;
}

// 오프셋 계산용 단말 판정 — 라인은 언제나 한 칸이고, 물건이 홀더 속에 서 있으면 그것도 한 칸이다.
export function terminalOf(env: SchemaEnv): Terminal {
  return (w) => w === BR || env.lumps.has(w);
}

// 경로가 가리키는 노드 — 어긋나면 null.
export function nodeAt(doc: NabiDoc, path: readonly number[]): ElementNode | null {
  let nodes: readonly NabiNode[] = doc;
  let found: ElementNode | null = null;
  for (const index of path) {
    const node = nodes[index];
    if (node === undefined || !isElement(node)) return null;
    found = node;
    nodes = node.ch;
  }
  return found;
}

// 경로의 부모 자식 목록 — 루트면 문서 배열 자신이다.
export function siblingsAt(doc: NabiDoc, path: readonly number[]): readonly NabiNode[] | null {
  if (path.length === 0) return null;
  if (path.length === 1) return doc;
  const parent = nodeAt(doc, path.slice(0, -1));
  return parent ? parent.ch : null;
}

// 경로 자리의 노드를 여러 노드로 갈아 끼운 새 문서 — 경로 위 조상만 새로 짓는다 (구조 공유).
export function replaceAt(
  doc: NabiDoc,
  path: readonly number[],
  replacement: readonly NabiNode[],
): NabiDoc {
  if (path.length === 0) return doc;
  const walk = (nodes: readonly NabiNode[], depth: number): readonly NabiNode[] => {
    const index = path[depth] as number;
    const node = nodes[index];
    if (node === undefined) return nodes;
    if (depth === path.length - 1) {
      return [...nodes.slice(0, index), ...replacement, ...nodes.slice(index + 1)];
    }
    if (!isElement(node)) return nodes;
    const ch = walk(node.ch, depth + 1);
    if (ch === node.ch) return nodes;
    const next: ElementNode = node.a !== undefined
      ? { w: node.w, a: node.a, ch, ...(node._id !== undefined ? { _id: node._id } : {}) }
      : { w: node.w, ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
    return [...nodes.slice(0, index), next, ...nodes.slice(index + 1)];
  };
  return walk(doc, 0) as NabiDoc;
}

// 캐럿 홀더인가 — 문단(래퍼 포함) 또는 인라인 홀더(summary·code 류).
export function isHolder(node: NabiNode, env: SchemaEnv): node is ElementNode {
  return isElement(node) && (node.w === P || env.inlineHolders.has(node.w));
}

// 홀더의 칸 수 — 래퍼문단은 1(물건 한 칸), 그 밖은 런 길이다.
export function holderLength(holder: ElementNode, env: SchemaEnv): number {
  if (isWrapper(holder, env)) return 1;
  return lengthOf(holder, terminalOf(env));
}

// 자리가 문서에 실재하는가 — 경로가 홀더에 닿고 오프셋이 칸 안이다. 그물의 공통 검사다.
export function positionExists(doc: NabiDoc, pos: Position, env: SchemaEnv): boolean {
  const node = nodeAt(doc, pos.path);
  if (!node || !isHolder(node, env)) return false;
  return Number.isInteger(pos.offset) && pos.offset >= 0 && pos.offset <= holderLength(node, env);
}

// 문서 순서의 홀더 나열 — 래퍼문단은 자기 속(물건 속 홀더들)보다 먼저 선다.
export interface HolderAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

export function holders(doc: NabiDoc, env: SchemaEnv): HolderAt[] {
  const out: HolderAt[] = [];
  const walk = (nodes: readonly NabiNode[], base: readonly number[]): void => {
    nodes.forEach((node, i) => {
      if (!isElement(node)) return;
      const path = [...base, i];
      if (isHolder(node, env)) out.push({ path, node });
      // 인라인 홀더 속은 글자뿐이라 더 내려갈 것이 없다.
      if (!env.inlineHolders.has(node.w)) walk(node.ch, path);
    });
  };
  walk(doc, []);
  return out;
}

// 문서 순서 비교 — 경로 사전순, 같은 홀더면 오프셋순.
// 한쪽 경로가 다른 쪽의 접두면 그것은 래퍼문단이다 — 오프셋 0(물건 앞)은 속보다 앞이고
// 오프셋 1(물건 뒤)은 속보다 뒤다.
export function comparePositions(a: Position, b: Position): number {
  const len = Math.min(a.path.length, b.path.length);
  for (let i = 0; i < len; i += 1) {
    const d = (a.path[i] as number) - (b.path[i] as number);
    if (d !== 0) return d;
  }
  if (a.path.length === b.path.length) return a.offset - b.offset;
  if (a.path.length < b.path.length) return a.offset <= 0 ? -1 : 1;
  return b.offset <= 0 ? 1 : -1;
}
