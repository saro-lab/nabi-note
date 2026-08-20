// 런 — 저장 모양(중첩 마크)을 오프셋 계산용으로 편 파생 뷰다.
// 좌표 규칙: 글자 하나 = 한 칸, 단말 노드 하나 = 한 칸 (ask-1 단말 규칙).
// 저장은 언제나 중첩 한 모양이고, 계산이 필요할 때만 이 뷰를 편다 — 캐시는 필요가 재어지면 단다.
import { BR } from './reserved.js';
import { isElement, type ElementNode, type NabiNode } from './types.js';

// 단말 판정 — 기본은 라인(br)뿐이고, 물건까지 세려는 쪽(래퍼문단의 0/1 등)은 자기 환경의
// 판정을 넘긴다. 스키마는 wing 갈래를 모르므로 함수로 받는다.
export type Terminal = (w: string) => boolean;
const brOnly: Terminal = (w) => w === BR;

// 글자 런 — 같은 마크 더미 아래 이어진 글자. marks 는 바깥→안 순서의 마크 엘리먼트들이다.
export interface TextRun {
  readonly kind: 'text';
  readonly text: string;
  readonly marks: readonly ElementNode[];
}

// 단말 런 — 라인·물건 하나. 오프셋 한 칸을 차지한다.
export interface NodeRun {
  readonly kind: 'node';
  readonly node: ElementNode;
  readonly marks: readonly ElementNode[];
}

export type Run = TextRun | NodeRun;

// 문단(또는 인라인 홀더)의 속을 평평한 런 목록으로 편다.
export function runsOf(holder: ElementNode, isTerminal: Terminal = brOnly): Run[] {
  const out: Run[] = [];
  const walk = (nodes: readonly NabiNode[], marks: readonly ElementNode[]): void => {
    for (const node of nodes) {
      if (!isElement(node)) {
        if (node === '') continue;
        const last = out[out.length - 1];
        if (last !== undefined && last.kind === 'text' && last.marks === marks) {
          out[out.length - 1] = { kind: 'text', text: last.text + node, marks };
          continue;
        }
        out.push({ kind: 'text', text: node, marks });
        continue;
      }
      if (isTerminal(node.w)) {
        out.push({ kind: 'node', node, marks });
        continue;
      }
      walk(node.ch, [...marks, node]);
    }
  };
  walk(holder.ch, []);
  return out;
}

// 한 런이 차지하는 칸 수 — 글자 런은 글자 수, 단말 런은 한 칸.
export function runLength(run: Run): number {
  return run.kind === 'text' ? run.text.length : 1;
}

// 문단 전체의 칸 수 — 캐럿 오프셋은 0 부터 이 값까지 선다. 래퍼문단이면 정확히 1 이 나온다.
export function lengthOf(holder: ElementNode, isTerminal: Terminal = brOnly): number {
  let total = 0;
  for (const run of runsOf(holder, isTerminal)) total += runLength(run);
  return total;
}

// 오프셋 바로 앞 한 칸의 마크 더미 — 경계 정규화("캐럿은 바로 앞 글자의 마크를 따른다.
// 문단 처음이면 무마크다",)의 계산 재료다. 좌표 규칙 자체는 04(caret)의 것.
export function marksBefore(
  holder: ElementNode,
  offset: number,
  isTerminal: Terminal = brOnly,
): readonly ElementNode[] {
  if (offset <= 0) return [];
  let at = 0;
  for (const run of runsOf(holder, isTerminal)) {
    const end = at + runLength(run);
    if (offset <= end) return run.marks;
    at = end;
  }
  return [];
}
