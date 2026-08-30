// 스키마 환경 — 갈래 지식(어떤 타입이 물건·단말·컨테이너인가)은 wing 계약의 것이라
// 스키마는 그것을 집합으로 받아서만 판정한다 (경계: schema 는 wing 층을 모른다).
// 07(wing 계약)이 등록된 선언에서 이 환경을 짓고, 그때까지 시험은 손으로 짠 환경을 쓴다.
import { P } from './reserved.js';
import { isElement, type ElementNode, type NabiNode } from './types.js';

export interface SchemaEnv {
  // 물건 — 래퍼문단이 감싸야 하는 타입 전부: 블록 단말 + 한 줄을 차지하는 컨테이너
  // (hr·img·youtube·table·ul·ol·tl·quote·details·code 류).
  readonly lumps: ReadonlySet<string>;
  // 블록 단말 — 속이 전혀 없어서 ch 를 강제로 비운다 (hr·img·youtube 류).
  readonly voids: ReadonlySet<string>;
  // 속이 블록(문단·물건·다른 컨테이너)인 컨테이너 — 이 안의 떠도는 인라인은 문단으로 감싼다
  // (table·tr·td·ul·li·ol·oli·tl·tli·quote·details 류).
  readonly blockHolders: ReadonlySet<string>;
  // 속이 인라인(글·라인)인 블록 — 문단처럼 속을 직접 든다 (summary·code 류).
  readonly inlineHolders: ReadonlySet<string>;
  // 값이 1/0 뿐인 불리언 attr 이름 — 0 과 숫자 아닌 값은 "없음"이므로 걷는다.
  readonly boolAttrs: ReadonlySet<string>;
  readonly attrSchemas?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly boolAttrsByType?: ReadonlyMap<string, ReadonlySet<string>>;
  readonly clearableMarks?: ReadonlySet<string>;
  readonly clearableAttrs?: ReadonlySet<string>;
  // 정렬(a)을 마다하는 물건 — 이 물건을 입은 래퍼문단에는 정렬조차 안 실린다.
  // 래퍼문단이 드는 문단 속성은 정렬 하나뿐인데(Q11), 그 하나마저 뜻이 없는 물건이 있다:
  // 코드 상자는 속이 글자 자리로 말하는 평문이라 가운데로 밀면 코드가 흐트러질 뿐이다.
  // wing 의 `noAlign` 선언이 registry 를 지나 여기로 접힌다 — 아래층은 wing 이름을 모른다.
  readonly noAlign?: ReadonlySet<string>;
  // 타입별 복구 훅 — 자기 속 구조(표 격자 등)는 그 타입의 wing 이 고친다.
  // cocoon 은 위임 호출만 하고, 훅의 결과는 그 타입 안에서 유효하다고 믿는다.
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

// 시험·상위 층이 같은 문으로 환경을 짓게 하는 도우미 — 배열을 집합으로 굳힌다.
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

// 물건인가 — 래퍼문단이 필요한 타입.
export function isLump(node: NabiNode, env: SchemaEnv): node is ElementNode {
  return isElement(node) && env.lumps.has(node.w);
}

// 래퍼문단인가 — 자식이 물건 하나뿐인 p. 저장 표식 없이 이 판별식만 진실을 말한다 (결정 Q14).
export function isWrapper(node: NabiNode, env: SchemaEnv): boolean {
  return isElement(node) && node.w === P && node.ch.length === 1 && isLump(node.ch[0] as NabiNode, env);
}

// 이 물건이 정렬을 마다하는가 — wing 의 `noAlign` 선언이 접힌 자리다.
export function refusesAlign(w: string, env: SchemaEnv): boolean {
  return env.noAlign?.has(w) ?? false;
}

// 이 문단이 정렬을 받는가 — 글 문단은 언제나 받고, 래퍼문단은 제가 입은 물건에 달렸다.
// 노출(ui)·커맨드(doc·정렬 wing)·고치(cocoon)가 이 한 문으로 같은 답을 낸다: 세 자리가
// 각자 판정을 적으면 셋이 조금씩 어긋나고, 그 틈이 곧 "숨었는데 눌리는 단추"다.
export function takesAlign(node: NabiNode, env: SchemaEnv): boolean {
  if (!isElement(node) || node.w !== P) return false;
  if (!isWrapper(node, env)) return true;
  return !refusesAlign((node.ch[0] as ElementNode).w, env);
}
