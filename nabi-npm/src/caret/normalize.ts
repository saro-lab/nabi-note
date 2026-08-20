// 경계 정규화 — 규칙 한 줄: "캐럿은 바로 앞 글자의 마크를 따른다. 문단 처음이면 무마크다."
// (, 크롬 세 규칙의 트리 번역 — 시작 외부·시각 병합·끝 내부가 전부 여기서 나온다.)
// 좌표가 (문단, 오프셋) 하나라 시각 자리당 논리 상태는 저절로 하나다 — 이 함수는 그 자리에서
// 타이핑이 물려받을 마크 더미를 답한다.
import { isWrapper, marksBefore, type ElementNode, type NabiDoc } from '../schema/index.js';
import { nodeAt, terminalOf, type EditEnv, type Position } from '../doc/index.js';

export function marksAt(doc: NabiDoc, pos: Position, env: EditEnv): readonly ElementNode[] {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return [];
  // 래퍼문단 안(0/1)의 타이핑은 새 글 문단으로 나간다 — 물려받을 마크가 없다.
  if (isWrapper(holder, env)) return [];
  return marksBefore(holder, pos.offset, terminalOf(env));
}
