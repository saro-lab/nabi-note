// 나비트리의 모양 — 내부와 외부가 한 모양이고, `_` 접두 필드만 내부 전용이다 (~3.2).
// 텍스트는 맨 문자열, 마크는 중첩 요소다 — 평평한 런은 저장 모양이 아니라 파생 뷰(runs.ts)다.

// attr 값은 문자열이 기본이고, 숫자는 불리언(1/0)과 제목 단계(h: 1~6)에만 온다.
export type AttrValue = string | number;
export type Attrs = Readonly<Record<string, AttrValue>>;

// 엘리먼트 — `w` 는 이 노드를 소유한 wing 의 이름(코어 예약어 p·br 포함), `_id` 는 내부 전용 키다.
// `_id` 는 getJson 에서 벗겨지고, cocoon 이 결정적으로 채운다 — hydrate 의 전제.
export interface ElementNode {
  readonly w: string;
  readonly a?: Attrs;
  readonly ch: readonly NabiNode[];
  readonly _id?: string;
}

export type NabiNode = ElementNode | string;

// 문서 — 루트는 문단 배열이다. root 객체는 없다.
export type NabiDoc = readonly ElementNode[];

// undefined 를 받아서 **떨어뜨린다** — `ch[0]` 처럼 없을 수 있는 자리를 그대로 물릴 수 있다.
// 좁게 두면 `isElement(ch[0])` 가 undefined 에 true 를 답해 다음 줄의 `.w` 에서 터진다 — 이름이
// 가드처럼 보이는 자리라 더 잘 속고, 실제로 터졌다(빈 표칸 repairCell, ailog 102). 호출자마다
// 가드를 세우는 대신 문 하나를 넓혀 그 종류를 통째로 없앤다.
// Accepts undefined and rejects it, so `isElement(ch[0])` is safe as-is. A narrow signature let
// undefined pass as "element" and crash on `.w` one line later (empty table cell, ailog 102).
export function isElement(node: NabiNode | undefined): node is ElementNode {
  return node !== undefined && typeof node !== 'string';
}

export function isText(node: NabiNode | undefined): node is string {
  return typeof node === 'string';
}
