// 코어 예약어 — 문단과 라인은 wing 이 아니라 편집기 자신의 것이다 (, ask-1 Q7-a).
// 예약어는 여기 한 곳에만 산다 — registry(07)가 wing 등록 때 이 목록과의 충돌을 막는다.

// 문단 — 캐럿의 유일한 집. 래퍼문단도 같은 p 다(자식이 물건 하나뿐인 p — 판별식 isWrapper).
export const P = 'p';

// 라인 — 문단 안의 줄바꿈. 인라인 단말, 오프셋 한 칸. Shift+Enter 가 넣는다.
export const BR = 'br';

export const RESERVED: ReadonlySet<string> = new Set([P, BR]);
