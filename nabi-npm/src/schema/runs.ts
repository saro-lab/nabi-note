// 저장 모양(중첩 마크)을 오프셋 계산용으로 편 파생 뷰다 — 저장은 언제나 중첩이고, 계산이 필요할 때만 이 뷰를 편다.
// A derived view flattening the stored (nested-mark) shape for offset math; storage stays nested, this view is built only when needed.
import { BR } from './reserved.js';
import { isElement, type ElementNode, type NabiNode } from './types.js';

// 기본은 라인(br)뿐 — 물건까지 세려는 쪽(래퍼문단의 0/1 등)은 자기 판정을 넘긴다. schema는 wing 갈래를 몰라 함수로 받는다.
// Defaults to just the line break (br); a caller counting objects too (a wrapper's 0/1) passes its own predicate, since schema doesn't know wing categories.
export type Terminal = (w: string) => boolean;
const brOnly: Terminal = (w) => w === BR;

// marks는 바깥에서 안으로 순서의 마크 엘리먼트들이다.
// marks lists the enclosing mark elements, outermost first.
export interface TextRun {
  readonly kind: 'text';
  readonly text: string;
  readonly marks: readonly ElementNode[];
}

export interface NodeRun {
  readonly kind: 'node';
  readonly node: ElementNode;
  readonly marks: readonly ElementNode[];
}

export type Run = TextRun | NodeRun;

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

export function runLength(run: Run): number {
  return run.kind === 'text' ? run.text.length : 1;
}

// 캐럿 오프셋은 0부터 이 값까지 선다 — 래퍼문단이면 정확히 1이 나온다.
// The caret offset ranges from 0 to this value; a wrapper paragraph always yields exactly 1.
export function lengthOf(holder: ElementNode, isTerminal: Terminal = brOnly): number {
  let total = 0;
  for (const run of runsOf(holder, isTerminal)) total += runLength(run);
  return total;
}

// 경계 정규화("캐럿은 바로 앞 글자의 마크를 따른다")의 계산 재료 — 좌표 규칙 자체는 caret(04)의 것.
// Feeds boundary normalization ("the caret follows the mark just before it"); the coordinate rule itself belongs to caret (04).
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
