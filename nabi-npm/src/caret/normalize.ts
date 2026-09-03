// 경계 정규화 — 캐럿은 바로 앞 글자의 마크를 따르고, 문단 처음이면 무마크다.
// Boundary normalization: the caret inherits the mark of the char right before it, or none at a paragraph's start.
import { isWrapper, marksBefore, type ElementNode, type NabiDoc } from '../schema/index.js';
import { nodeAt, terminalOf, type EditEnv, type Position } from '../doc/index.js';

export function marksAt(doc: NabiDoc, pos: Position, env: EditEnv): readonly ElementNode[] {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return [];
  // 래퍼문단 안(0/1)의 타이핑은 새 글 문단으로 나간다 — 물려받을 마크가 없다.
  // Typing inside a wrapper paragraph's slots (0/1) goes out to a new text paragraph, so there's nothing to inherit.
  if (isWrapper(holder, env)) return [];
  return marksBefore(holder, pos.offset, terminalOf(env));
}
