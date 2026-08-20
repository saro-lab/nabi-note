// 부분 재그리기 계획 — 단일 신호의 "바뀐/사라진 최상위 문단 _id" 를 DOM 조작 목록으로 편다.
// 전체 innerHTML 재그리기는 없다 (문단이 재그리기의 단위다).
import type { NabiDoc } from '../schema/index.js';
import type { NabiChange } from '../editor/index.js';

export type RedrawOp =
  | { readonly kind: 'remove'; readonly id: string }
  | { readonly kind: 'put'; readonly id: string; readonly index: number };

// remove 가 먼저, put 은 문서 순서(오름차순) — 그래야 삽입 인덱스가 밀리지 않는다.
export function planRedraw(doc: NabiDoc, change: NabiChange): RedrawOp[] {
  const ops: RedrawOp[] = [];
  for (const id of change.removed) ops.push({ kind: 'remove', id });
  if (change.paragraphs.length === 0) return ops;

  const index = new Map<string, number>();
  doc.forEach((node, i) => {
    if (node._id !== undefined) index.set(node._id, i);
  });
  const puts: { readonly kind: 'put'; readonly id: string; readonly index: number }[] = [];
  for (const id of change.paragraphs) {
    const at = index.get(id);
    if (at !== undefined) puts.push({ kind: 'put', id, index: at });
  }
  puts.sort((a, b) => a.index - b.index);
  return [...ops, ...puts];
}
