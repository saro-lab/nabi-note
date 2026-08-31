// 문단과 라인은 wing이 아니라 편집기 자신의 것이다 — registry가 wing 등록 때 이 목록과의 충돌을 막는다.
// Paragraph and line belong to the editor itself, not any wing; the registry blocks wing registrations that collide with this list.

// 캐럿의 유일한 집 — 래퍼문단도 같은 p다(자식이 물건 하나뿐인 p, 판별식 isWrapper).
// The only home for the caret; a wrapper paragraph is still just a `p` with one lump child (see isWrapper).
export const P = 'p';

// 문단 안의 줄바꿈 — 인라인 단말, 오프셋 한 칸. Shift+Enter가 넣는다.
// A line break inside a paragraph — an inline terminal, one offset slot, inserted by Shift+Enter.
export const BR = 'br';

export const RESERVED: ReadonlySet<string> = new Set([P, BR]);
