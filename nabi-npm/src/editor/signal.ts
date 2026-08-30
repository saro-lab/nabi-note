// 단일 신호 — 문서·선택·예약 변화가 구독 하나로 온다 (옛 신호 3종 + 무신호 2종의 통합).
// 바뀐 문단 목록은 참조 비교로 만든다 — 문단 단위 구조 공유가 이것을 공짜로 만든다.
import type { NabiDoc } from '../schema/index.js';

export interface NabiChange {
  readonly doc: boolean;
  readonly selection: boolean;
  readonly armed: boolean;
  // 문서 **교체**(setJson·setHtml)의 신호에만 실리는 참 — 타자·붙여넣기·undo 는 안 든다.
  // 붙여넣기는 setHtml 을 안 타므로(표면의 붙여넣기 길은 커맨드다) 이 깃발로 "문서를 새로
  // 실은 순간"을 밖에서 가를 수 있다 — diff 의 대조 스냅샷이 그 자리다 (260825_005).
  readonly loaded?: boolean;
  // 바뀌었거나 새로 선 최상위 문단의 _id — 09 의 부분 재그리기가 그대로 쓴다.
  readonly paragraphs: readonly string[];
  // 사라진 최상위 문단의 _id — DOM 에서 걷을 것.
  readonly removed: readonly string[];
}

export function diffParagraphs(
  prev: NabiDoc,
  next: NabiDoc,
): { readonly paragraphs: readonly string[]; readonly removed: readonly string[] } {
  if (prev === next) return { paragraphs: [], removed: [] };
  const prevRefs = new Set(prev);
  const prevIndexes = new Map(prev.map((node, index) => [node, index] as const));
  const nextIds = new Set<string>();
  const paragraphs: string[] = [];
  for (const [index, node] of next.entries()) {
    if (node._id !== undefined) nextIds.add(node._id);
    if ((!prevRefs.has(node) || prevIndexes.get(node) !== index) && node._id !== undefined) paragraphs.push(node._id);
  }
  const removed: string[] = [];
  for (const node of prev) {
    if (node._id !== undefined && !nextIds.has(node._id)) removed.push(node._id);
  }
  return { paragraphs, removed };
}
