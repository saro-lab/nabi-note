// 내부와 외부가 한 모양이고 `_` 접두 필드만 내부 전용이다 — 텍스트는 맨 문자열, 마크는 중첩 요소, 런은 저장 모양이 아니라 파생 뷰다.
// Internal and external share one shape, only `_`-prefixed fields are internal; text is a bare string, marks nest as elements, and runs (runs.ts) are a derived view, not what's stored.

// 문자열이 기본이고, 숫자는 불리언(1/0)과 제목 단계(h: 1~6)에만 온다.
// String is the default; a number appears only for a boolean (1/0) or a heading level (h: 1-6).
export type AttrValue = string | number;
export type Attrs = Readonly<Record<string, AttrValue>>;

// `w`는 이 노드를 소유한 wing의 이름(코어 예약어 p·br 포함) — `_id`는 getJson에서 벗겨지고 cocoon이 결정적으로 채운다(hydrate의 전제).
// `w` names the owning wing (including core's p/br); `_id` is stripped by getJson and deterministically filled by cocoon — the premise hydrate relies on.
export interface ElementNode {
  readonly w: string;
  readonly a?: Attrs;
  readonly ch: readonly NabiNode[];
  readonly _id?: string;
}

export type NabiNode = ElementNode | string;

// 루트는 문단 배열이다 — root 객체는 없다.
// The root is just an array of paragraphs; there's no root object.
export type NabiDoc = readonly ElementNode[];

// undefined도 받아 거절한다 — `ch[0]`처럼 없을 수 있는 자리를 그대로 물려도 안전하게 하려고(실제로 빈 표칸에서 터진 적이 있다).
// Accepts and rejects undefined too, so a possibly-missing slot like `ch[0]` can be passed straight through safely (this actually crashed once, on an empty table cell).
export function isElement(node: NabiNode | undefined): node is ElementNode {
  return node !== undefined && typeof node !== 'string';
}

export function isText(node: NabiNode | undefined): node is string {
  return typeof node === 'string';
}
