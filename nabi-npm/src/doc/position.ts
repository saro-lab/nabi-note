// 경로는 캐럿 홀더(문단·인라인 홀더)를 가리키고, 래퍼문단 속은 0(물건 앞)/1(물건 뒤) 둘뿐이다. caret(04)이 그대로 가져다 쓴다.
// A path targets a caret holder (paragraph or inline holder); inside a wrapper it's just 0 (before) or 1 (after). caret (04) reuses this as-is.
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
  readonly path: readonly number[];
  // 홀더 안의 칸(0~lengthOf) — 글자·단말은 한 칸, 래퍼문단은 0/1뿐이다.
  // A slot inside the holder (0 to lengthOf); text/terminal each count as one, a wrapper only has 0/1.
  readonly offset: number;
}

// 반환 자리는 반환 문서에 실재해야 한다 — 옛 mergeBox 버그가 남긴 공통 계약이다.
// The returned caret must exist in the returned doc — a contract left by an old mergeBox bug.
export interface EditResult {
  readonly doc: NabiDoc;
  readonly caret: Position;
  // 범위를 남기는 연산(마크)만 싣는다 — 없으면 접힌 캐럿이다.
  // Only range-preserving operations (marks) carry this; absent means a collapsed caret.
  readonly anchor?: Position;
}

export interface EditEnv extends SchemaEnv {
  // 문단 하나로 고정된 컨테이너(표의 칸 등) — 그 속의 엔터는 분할이 아니라 라인이다.
  // A container fixed to one paragraph (a table cell); Enter inside it becomes a line, not a split.
  readonly singleParagraph?: ReadonlySet<string>;
}

// 라인은 언제나 한 칸이고, 홀더 속에 선 물건도 한 칸이다.
// A line always counts as one slot, and so does an object standing inside a holder.
export function terminalOf(env: SchemaEnv): Terminal {
  return (w) => w === BR || env.lumps.has(w);
}

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

// 루트 경로면 문서 배열 자신을 돌려준다.
// A root path returns the document array itself.
export function siblingsAt(doc: NabiDoc, path: readonly number[]): readonly NabiNode[] | null {
  if (path.length === 0) return null;
  if (path.length === 1) return doc;
  const parent = nodeAt(doc, path.slice(0, -1));
  return parent ? parent.ch : null;
}

// 경로 위 조상만 새로 짓는다 — 나머지는 구조 공유.
// Only rebuilds ancestors along the path; everything else shares structure.
export function replaceAt(doc: NabiDoc, path: readonly number[], replacement: readonly NabiNode[]): NabiDoc {
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
    const next: ElementNode =
      node.a !== undefined
        ? { w: node.w, a: node.a, ch, ...(node._id !== undefined ? { _id: node._id } : {}) }
        : { w: node.w, ch, ...(node._id !== undefined ? { _id: node._id } : {}) };
    return [...nodes.slice(0, index), next, ...nodes.slice(index + 1)];
  };
  return walk(doc, 0) as NabiDoc;
}

// 문단(래퍼 포함) 또는 인라인 홀더(summary·code 류)인가.
// A paragraph (wrappers included) or an inline holder (summary/code and the like).
export function isHolder(node: NabiNode, env: SchemaEnv): node is ElementNode {
  return isElement(node) && (node.w === P || env.inlineHolders.has(node.w));
}

// 래퍼문단은 1(물건 한 칸), 그 밖은 런 길이다.
// A wrapper counts as 1 (the object is one slot); anything else is its run length.
export function holderLength(holder: ElementNode, env: SchemaEnv): number {
  if (isWrapper(holder, env)) return 1;
  return lengthOf(holder, terminalOf(env));
}

// 경로가 홀더에 닿고 오프셋이 칸 안인가 — 그물(테스트)의 공통 검사다.
// Path resolves to a holder and the offset is in range; the shared check tests use.
export function positionExists(doc: NabiDoc, pos: Position, env: SchemaEnv): boolean {
  const node = nodeAt(doc, pos.path);
  if (!node || !isHolder(node, env)) return false;
  return Number.isInteger(pos.offset) && pos.offset >= 0 && pos.offset <= holderLength(node, env);
}

// 래퍼문단은 자기 속 홀더들보다 문서 순서에서 먼저 선다.
// A wrapper paragraph precedes the holders nested inside it, in document order.
export interface HolderAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

export interface IndexedNode {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

export class DocumentIndex {
  readonly holders: readonly HolderAt[];
  readonly top: readonly IndexedNode[];
  private readonly byId = new Map<string, IndexedNode>();
  private readonly byPath = new Map<string, IndexedNode>();

  constructor(
    readonly doc: NabiDoc,
    env: SchemaEnv,
  ) {
    const holderList: HolderAt[] = [];
    const top: IndexedNode[] = [];
    const walk = (nodes: readonly NabiNode[], base: readonly number[], topLevel: boolean): void => {
      nodes.forEach((node, i) => {
        if (!isElement(node)) return;
        const path = Object.freeze([...base, i]);
        const entry = Object.freeze({ path, node });
        this.byPath.set(pathKey(path), entry);
        if (topLevel) top.push(entry);
        if (typeof node._id === 'string' && !this.byId.has(node._id)) this.byId.set(node._id, entry);
        if (isHolder(node, env)) holderList.push(entry);
        walk(node.ch, path, false);
      });
    };
    walk(doc, [], true);
    this.holders = Object.freeze(holderList);
    this.top = Object.freeze(top);
  }

  byIdAt(id: string): IndexedNode | null {
    return this.byId.get(id) ?? null;
  }
  at(path: readonly number[]): IndexedNode | null {
    return this.byPath.get(pathKey(path)) ?? null;
  }
  ownerAt(path: readonly number[], w?: string): IndexedNode | null {
    for (let depth = path.length; depth >= 1; depth -= 1) {
      const found = this.at(path.slice(0, depth));
      if (found && (w === undefined || found.node.w === w)) return found;
    }
    return null;
  }
}

const indexCache = new WeakMap<object, WeakMap<object, DocumentIndex>>();

export function documentIndex(doc: NabiDoc, env: SchemaEnv): DocumentIndex {
  let byEnv = indexCache.get(doc);
  if (!byEnv) {
    byEnv = new WeakMap();
    indexCache.set(doc, byEnv);
  }
  let index = byEnv.get(env);
  if (!index) {
    index = new DocumentIndex(doc, env);
    byEnv.set(env, index);
  }
  return index;
}

function pathKey(path: readonly number[]): string {
  return path.join('.');
}

export function holders(doc: NabiDoc, env: SchemaEnv): HolderAt[] {
  return [...documentIndex(doc, env).holders];
}

// 경로 사전순, 같은 홀더면 오프셋순 — 한쪽이 다른 쪽의 접두면 그건 래퍼문단이라, offset 0(물건 앞)은 속보다 앞, 1(물건 뒤)은 속보다 뒤다.
// Lexicographic by path, then by offset within the same holder; a path that prefixes another is a wrapper, where offset 0 (before) precedes its contents and 1 (after) follows them.
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
