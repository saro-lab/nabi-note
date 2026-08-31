// 어떤 타입이 물건·단말·컨테이너인가는 wing 계약의 지식이라, schema는 그것을 집합으로만 받아 판정한다 — wing 층은 모른다.
// Which type is an object/terminal/container is wing-contract knowledge; schema only judges by the sets it's handed, unaware of the wing layer.
import { P } from './reserved.js';
import { isElement, type ElementNode, type NabiNode } from './types.js';

export interface SchemaEnv {
  // 래퍼문단이 감싸야 하는 타입 전부(블록 단말 + 한 줄을 차지하는 컨테이너).
  // Every type a wrapper paragraph must wrap: block terminals plus one-line containers.
  readonly lumps: ReadonlySet<string>;
  // 속이 전혀 없어 ch를 강제로 비우는 블록 단말(hr·img·youtube 류).
  // Block terminals with no content at all, forced to an empty ch (hr/img/youtube and the like).
  readonly voids: ReadonlySet<string>;
  // 속이 블록인 컨테이너 — 떠도는 인라인은 문단으로 감싸 넣는다.
  // A container whose content is blocks; stray inline nodes get wrapped in a paragraph.
  readonly blockHolders: ReadonlySet<string>;
  // 속이 인라인인 블록 — 문단처럼 속을 직접 든다(summary·code 류).
  // A block whose content is inline, held directly like a paragraph (summary/code and the like).
  readonly inlineHolders: ReadonlySet<string>;
  // 값이 1/0뿐인 불리언 attr 이름 — 0과 숫자 아닌 값은 "없음"으로 걷는다.
  // Boolean attr names whose only value is 1/0; 0 or a non-numeric value counts as absent.
  readonly boolAttrs: ReadonlySet<string>;
  readonly attrSchemas?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly boolAttrsByType?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly clearableMarks?: ReadonlySet<string>;
  readonly clearableAttrs?: ReadonlySet<string>;
  // 정렬을 마다하는 물건(예: 코드 상자) — 그 물건을 입은 래퍼문단은 정렬조차 못 받는다.
  // An object that refuses alignment (a code box, say) — its wrapper paragraph can't take alignment either.
  readonly noAlign?: ReadonlySet<string>;
  // 타입별 복구 훅 — 표 격자 등 자기 속 구조는 그 타입의 wing이 고친다.
  // Per-type repair hooks; a type's own internal structure (a table grid) is fixed by that type's wing.
  readonly repair?: Readonly<Record<string, (node: ElementNode) => ElementNode | null>>;
}

const CLOSED_ATTR_TYPES = Symbol('nabi.closedAttrTypes');
const BUILTIN_ATTR_OWNER = Symbol('nabi.builtinAttrOwner');
const KNOWN_TYPES = Symbol('nabi.knownTypes');

interface BuiltinAttrOwner {
  readonly ownerW: string;
  readonly attrTypes: readonly string[];
}

type InternalSchemaEnv = SchemaEnv & {
  readonly [CLOSED_ATTR_TYPES]?: ReadonlySet<string>;
  readonly [KNOWN_TYPES]?: ReadonlySet<string>;
};

export function $closeKnownTypes(env: SchemaEnv, types: Iterable<string>): void {
  Object.defineProperty(env, KNOWN_TYPES, { value: new Set(types) });
}

export function $copyKnownTypes(from: SchemaEnv, to: SchemaEnv): void {
  const types = (from as InternalSchemaEnv)[KNOWN_TYPES];
  if (types) $closeKnownTypes(to, types);
}

export function $isKnownType(env: SchemaEnv, w: string): boolean {
  const types = (env as InternalSchemaEnv)[KNOWN_TYPES];
  return types === undefined || types.has(w);
}

export function $closeBuiltinAttrs(env: SchemaEnv, types: Iterable<string>): void {
  Object.defineProperty(env, CLOSED_ATTR_TYPES, { value: new Set(types) });
}

export function $markBuiltinAttrOwner(owner: object, types: Iterable<string>): void {
  const marked = $builtinAttrTypes(owner) ?? [];
  const combined = [...new Set([...marked, ...types])];
  if ($builtinAttrTypes(owner) !== undefined && combined.length === marked.length) return;
  const ownerW = (owner as { readonly w?: unknown }).w;
  if (typeof ownerW !== 'string') return;
  Object.defineProperty(owner, BUILTIN_ATTR_OWNER, {
    value: Object.freeze({ ownerW, attrTypes: Object.freeze(combined) }),
    enumerable: true,
    configurable: true,
  });
}

export function $isBuiltinWing(owner: object): boolean {
  return $builtinAttrTypes(owner) !== undefined;
}

export function $builtinAttrTypes(owner: object): readonly string[] | undefined {
  const marker = (owner as { readonly [BUILTIN_ATTR_OWNER]?: BuiltinAttrOwner })[BUILTIN_ATTR_OWNER];
  const currentW = (owner as { readonly w?: unknown }).w;
  return marker && marker.ownerW === currentW ? marker.attrTypes : undefined;
}

export function $hasClosedBuiltinAttrs(env: SchemaEnv, w: string): boolean {
  return (env as InternalSchemaEnv)[CLOSED_ATTR_TYPES]?.has(w) ?? false;
}

export function $usesClosedBuiltinAttrs(env: SchemaEnv): boolean {
  return (env as InternalSchemaEnv)[CLOSED_ATTR_TYPES] !== undefined;
}

// 배열을 집합으로 굳힌다 — 테스트·상위 층이 같은 문으로 환경을 짓게 하는 도우미.
// Freezes arrays into sets; a shared door for tests and upper layers to build an env.
export function makeEnv(draft: {
  readonly lumps?: readonly string[];
  readonly voids?: readonly string[];
  readonly blockHolders?: readonly string[];
  readonly inlineHolders?: readonly string[];
  readonly boolAttrs?: readonly string[];
  readonly attrSchemas?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly boolAttrsByType?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly clearableMarks?: readonly string[];
  readonly clearableAttrs?: readonly string[];
  readonly noAlign?: readonly string[];
  readonly repair?: Readonly<Record<string, (node: ElementNode) => ElementNode | null>>;
}): SchemaEnv {
  return {
    lumps: new Set(draft.lumps ?? []),
    voids: new Set(draft.voids ?? []),
    blockHolders: new Set(draft.blockHolders ?? []),
    inlineHolders: new Set(draft.inlineHolders ?? []),
    boolAttrs: new Set(draft.boolAttrs ?? []),
    ...(draft.attrSchemas ? { attrSchemas: draft.attrSchemas } : {}),
    ...(draft.boolAttrsByType ? { boolAttrsByType: draft.boolAttrsByType } : {}),
    ...(draft.clearableMarks ? { clearableMarks: new Set(draft.clearableMarks) } : {}),
    ...(draft.clearableAttrs ? { clearableAttrs: new Set(draft.clearableAttrs) } : {}),
    ...(draft.noAlign && draft.noAlign.length > 0 ? { noAlign: new Set(draft.noAlign) } : {}),
    ...(draft.repair ? { repair: draft.repair } : {}),
  };
}

export function isLump(node: NabiNode, env: SchemaEnv): node is ElementNode {
  return isElement(node) && env.lumps.has(node.w);
}

// 자식이 물건 하나뿐인 p다 — 저장 표식 없이 이 판별식만으로 정한다(결정 Q14).
// A `p` with exactly one lump child; no stored flag, this predicate alone decides it (decision Q14).
export function isWrapper(node: NabiNode, env: SchemaEnv): boolean {
  return isElement(node) && node.w === P && node.ch.length === 1 && isLump(node.ch[0] as NabiNode, env);
}

export function refusesAlign(w: string, env: SchemaEnv): boolean {
  return env.noAlign?.has(w) ?? false;
}

// 글 문단은 언제나 정렬을 받고, 래퍼문단은 입은 물건에 달렸다 — ui·doc·cocoon이 다 이 한 문으로 답해야 판정이 안 어긋난다.
// A text paragraph always takes alignment; a wrapper depends on its lump. UI, doc commands, and cocoon must all defer to this one function or their judgments drift apart.
export function takesAlign(node: NabiNode, env: SchemaEnv): boolean {
  if (!isElement(node) || node.w !== P) return false;
  if (!isWrapper(node, env)) return true;
  return !refusesAlign((node.ch[0] as ElementNode).w, env);
}
