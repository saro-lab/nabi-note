// 단일 신호 — 문서·선택·예약 변화가 구독 하나로 온다 (옛 신호 3종 + 무신호 2종의 통합).
// 바뀐 문단 목록은 참조 비교로 만든다 — 문단 단위 구조 공유가 이것을 공짜로 만든다.
import type { NabiDoc } from '../schema/index.js';

export interface NabiChange {
  readonly doc: boolean;
  readonly selection: boolean;
  readonly armed: boolean;
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
  const nextIds = new Set<string>();
  const paragraphs: string[] = [];
  for (const node of next) {
    if (node._id !== undefined) nextIds.add(node._id);
    if (!prevRefs.has(node) && node._id !== undefined) paragraphs.push(node._id);
  }
  const removed: string[] = [];
  for (const node of prev) {
    if (node._id !== undefined && !nextIds.has(node._id)) removed.push(node._id);
  }
  return { paragraphs, removed };
}
