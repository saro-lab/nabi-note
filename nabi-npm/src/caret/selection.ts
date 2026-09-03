// 선택 — 자리(Position) 둘의 쌍이 전부다. 곁방 상태가 없다.
// A selection is just a pair of positions, with no side state.
// 물건 골라짐(object selection)은 래퍼문단 0~1 범위를 덮는 보통 선택일 뿐이라, 판별 함수만 둔다.
// An object being "selected" is just an ordinary selection spanning a wrapper paragraph's 0~1, so only a predicate is needed.
import { isWrapper, type NabiDoc, type SchemaEnv } from '../schema/index.js';
import {
  comparePositions,
  holderRuns,
  isHolder,
  nodeAt,
  positionExists,
  runGraphemeBoundaries,
  terminalOf,
  type Position,
} from '../doc/index.js';
import { snapGraphemeOffset } from '../doc/grapheme.js';

export interface Selection {
  readonly anchor: Position;
  readonly focus: Position;
}

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

// anchor 가 focus 뒤에 설 수 있어, 문서 순서로 정렬한 [시작, 끝]을 낸다.
// anchor can sit after focus, so this returns [start, end] sorted in document order.
export function ordered(sel: Selection): readonly [Position, Position] {
  return comparePositions(sel.anchor, sel.focus) <= 0 ? [sel.anchor, sel.focus] : [sel.focus, sel.anchor];
}

export function selectionExists(doc: NabiDoc, sel: Selection, env: SchemaEnv): boolean {
  return positionExists(doc, sel.anchor, env) && positionExists(doc, sel.focus, env);
}

function snapPosition(
  doc: NabiDoc,
  pos: Position,
  env: SchemaEnv,
  bias: 'backward' | 'forward' | 'nearest',
): Position | null {
  if (!positionExists(doc, pos, env)) return null;
  const holder = nodeAt(doc, pos.path);
  if (!holder || !isHolder(holder, env) || isWrapper(holder, env)) return pos;
  const boundaries = runGraphemeBoundaries(holderRuns(holder, terminalOf(env)));
  const offset = snapGraphemeOffset(boundaries, pos.offset, bias);
  return offset === pos.offset ? pos : { path: pos.path, offset };
}

export function normalizeSelection(doc: NabiDoc, sel: Selection, env: SchemaEnv): Selection | null {
  if (!selectionExists(doc, sel, env)) return null;
  if (samePosition(sel.anchor, sel.focus)) {
    const position = snapPosition(doc, sel.focus, env, 'nearest');
    return position ? { anchor: position, focus: position } : null;
  }
  const forward = comparePositions(sel.anchor, sel.focus) <= 0;
  const anchor = snapPosition(doc, sel.anchor, env, forward ? 'backward' : 'forward');
  const focus = snapPosition(doc, sel.focus, env, forward ? 'forward' : 'backward');
  return anchor && focus ? { anchor, focus } : null;
}

export function isObjectSelection(doc: NabiDoc, sel: Selection, env: SchemaEnv): boolean {
  if (sel.anchor.path.length !== sel.focus.path.length) return false;
  if (!sel.anchor.path.every((v, i) => v === sel.focus.path[i])) return false;
  const [start, end] = ordered(sel);
  if (start.offset !== 0 || end.offset !== 1) return false;
  const holder = nodeAt(doc, sel.anchor.path);
  return holder !== null && isWrapper(holder, env);
}

export function selectObject(path: readonly number[]): Selection {
  return { anchor: { path, offset: 0 }, focus: { path, offset: 1 } };
}
