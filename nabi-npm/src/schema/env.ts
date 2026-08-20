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
  // 타입별 복구 훅 — 자기 속 구조(표 격자 등)는 그 타입의 wing 이 고친다.
  // cocoon 은 위임 호출만 하고, 훅의 결과는 그 타입 안에서 유효하다고 믿는다.
  readonly repair?: Readonly<Record<string, (node: ElementNode) => ElementNode | null>>;
}

// 시험·상위 층이 같은 문으로 환경을 짓게 하는 도우미 — 배열을 집합으로 굳힌다.
export function makeEnv(draft: {
  readonly lumps?: readonly string[];
  readonly voids?: readonly string[];
  readonly blockHolders?: readonly string[];
  readonly inlineHolders?: readonly string[];
  readonly boolAttrs?: readonly string[];
  readonly repair?: Readonly<Record<string, (node: ElementNode) => ElementNode | null>>;
}): SchemaEnv {
  return {
    lumps: new Set(draft.lumps ?? []),
    voids: new Set(draft.voids ?? []),
    blockHolders: new Set(draft.blockHolders ?? []),
    inlineHolders: new Set(draft.inlineHolders ?? []),
    boolAttrs: new Set(draft.boolAttrs ?? []),
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
