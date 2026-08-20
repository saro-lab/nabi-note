// 선택 — 자리(Position) 둘의 쌍이 전부다. 곁방 상태 없음:
// 물건 골라짐 = 래퍼문단 0~1 범위라는 "보통 선택"이고, 판별 함수만 둔다.
import { isWrapper, type NabiDoc, type SchemaEnv } from '../schema/index.js';
import {
  comparePositions,
  nodeAt,
  positionExists,
  type Position,
} from '../doc/index.js';

export interface Selection {
  readonly anchor: Position;
  readonly focus: Position;
}

// 접힌 캐럿 하나를 선택으로 — anchor 와 focus 가 같은 자리다.
export function caretAt(pos: Position): Selection {
  return { anchor: pos, focus: pos };
}

export function isCollapsed(sel: Selection): boolean {
  return samePosition(sel.anchor, sel.focus);
}

export function samePosition(a: Position, b: Position): boolean {
  if (a.offset !== b.offset || a.path.length !== b.path.length) return false;
  return a.path.every((v, i) => v === b.path[i]);
}

export function sameSelection(a: Selection | null, b: Selection | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return samePosition(a.anchor, b.anchor) && samePosition(a.focus, b.focus);
}

// 문서 순서로 정렬한 [시작, 끝] — anchor 가 focus 뒤에 설 수 있다.
export function ordered(sel: Selection): readonly [Position, Position] {
  return comparePositions(sel.anchor, sel.focus) <= 0
    ? [sel.anchor, sel.focus]
    : [sel.focus, sel.anchor];
}

// 두 자리 모두 문서에 실재하는가 — 공통 계약의 선택판.
export function selectionExists(doc: NabiDoc, sel: Selection, env: SchemaEnv): boolean {
  return positionExists(doc, sel.anchor, env) && positionExists(doc, sel.focus, env);
}

// 물건이 골라졌는가 — 같은 래퍼문단의 0~1 을 정확히 덮는 범위다. 별도 상태가 아니다.
export function isObjectSelection(doc: NabiDoc, sel: Selection, env: SchemaEnv): boolean {
  if (sel.anchor.path.length !== sel.focus.path.length) return false;
  if (!sel.anchor.path.every((v, i) => v === sel.focus.path[i])) return false;
  const [start, end] = ordered(sel);
  if (start.offset !== 0 || end.offset !== 1) return false;
  const holder = nodeAt(doc, sel.anchor.path);
  return holder !== null && isWrapper(holder, env);
}

// 래퍼문단 하나를 통째로 고른 선택 — 클릭·걸음이 쓴다.
export function selectObject(path: readonly number[]): Selection {
  return { anchor: { path, offset: 0 }, focus: { path, offset: 1 } };
}
