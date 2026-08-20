// 삽입 — 글자와 라인. 마크는 "바로 앞 글자의 마크"가 기본이고(경계 정규화)
// 예약 상태(04)가 있으면 호출 쪽이 marks 로 넘겨 그 기본을 이긴다.
// 래퍼문단의 0/1 에서는 위/아래에 새 글 문단이 생기며 거기 들어간다 (예).
import {
  BR,
  P,
  isWrapper,
  marksBefore,
  type ElementNode,
  type NabiDoc,
  type Run,
} from '../schema/index.js';
import {
  nodeAt,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sliceRuns, withChildren } from './runs-edit.js';

// 홀더의 [offset] 자리에 런들을 끼워 넣은 새 문서.
function spliceRuns(
  doc: NabiDoc,
  pos: Position,
  holder: ElementNode,
  inserted: readonly Run[],
  env: EditEnv,
): NabiDoc {
  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  const next = [
    ...sliceRuns(runs, 0, pos.offset),
    ...inserted,
    ...sliceRuns(runs, pos.offset, Number.MAX_SAFE_INTEGER),
  ];
  return replaceAt(doc, pos.path, [withChildren(holder, fromRuns(next))]);
}

// 래퍼문단 곁에 새 글 문단을 세우고 그 안에 넣는다 — 0 은 위, 1 은 아래.
function besideWrapper(
  doc: NabiDoc,
  pos: Position,
  wrapper: ElementNode,
  ch: readonly Run[],
  caretOffset: number,
): EditResult {
  const fresh: ElementNode = { w: P, ch: fromRuns(ch) };
  const before = pos.offset === 0;
  const next = replaceAt(doc, pos.path, before ? [fresh, wrapper] : [wrapper, fresh]);
  const parent = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  const path = before ? pos.path : [...parent, index + 1];
  return { doc: next, caret: { path, offset: caretOffset } };
}

// 글자 삽입 — marks 를 안 주면 앞 글자의 마크를 따른다.
export function insertText(
  doc: NabiDoc,
  pos: Position,
  text: string,
  env: EditEnv,
  marks?: readonly ElementNode[],
): EditResult {
  if (text === '') return { doc, caret: pos };
  const holder = nodeAt(doc, pos.path);
  if (!holder) return { doc, caret: pos };

  if (isWrapper(holder, env)) {
    const run: Run = { kind: 'text', text, marks: [] };
    return besideWrapper(doc, pos, holder, [run], text.length);
  }

  const stack = marks ?? marksBefore(holder, pos.offset, terminalOf(env));
  const run: Run = { kind: 'text', text, marks: stack };
  return {
    doc: spliceRuns(doc, pos, holder, [run], env),
    caret: { path: pos.path, offset: pos.offset + text.length },
  };
}

// 라인 삽입 (Shift+Enter) — 라인은 마크 안에서 마크를 잇는다 (예: <b>45<br/>6</b>).
// 래퍼문단에서는 엔터와 같은 길이다 — 위/아래 빈 문단 (유도: 라인이 설 글이 없다).
export function insertLine(
  doc: NabiDoc,
  pos: Position,
  env: EditEnv,
  marks?: readonly ElementNode[],
): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return { doc, caret: pos };

  if (isWrapper(holder, env)) {
    return besideWrapper(doc, pos, holder, [], 0);
  }

  const stack = marks ?? marksBefore(holder, pos.offset, terminalOf(env));
  const run: Run = { kind: 'node', node: { w: BR, ch: [] }, marks: stack };
  return {
    doc: spliceRuns(doc, pos, holder, [run], env),
    caret: { path: pos.path, offset: pos.offset + 1 },
  };
}
