// 마크는 기본이 "바로 앞 글자의 마크"고, 예약 상태(04)가 있으면 호출 쪽이 marks로 넘겨 이긴다.
// A mark defaults to whatever precedes the caret; a pending state (04) overrides it via the `marks` param.
import { BR, P, isWrapper, marksBefore, type ElementNode, type NabiDoc, type Run } from '../schema/index.js';
import { canonicalTextLength, canonicalTextLines } from '../schema/text.js';
import { nodeAt, replaceAt, terminalOf, type EditEnv, type EditResult, type Position } from './position.js';
import { fromRuns, holderRuns, sliceRuns, withChildren } from './runs-edit.js';

function spliceRuns(doc: NabiDoc, pos: Position, holder: ElementNode, inserted: readonly Run[], env: EditEnv): NabiDoc {
  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  const next = [
    ...sliceRuns(runs, 0, pos.offset),
    ...inserted,
    ...sliceRuns(runs, pos.offset, Number.MAX_SAFE_INTEGER),
  ];
  return replaceAt(doc, pos.path, [withChildren(holder, fromRuns(next))]);
}

// 래퍼문단 곁에 새 글 문단을 세운다 — offset 0은 위, 1은 아래.
// Plants a fresh text paragraph beside a wrapper paragraph — offset 0 goes above, 1 below.
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

  const length = canonicalTextLength(text);
  const runs = (stack: readonly ElementNode[]): Run[] => {
    const out: Run[] = [];
    canonicalTextLines(text).forEach((line, index) => {
      if (index > 0) out.push({ kind: 'node', node: { w: BR, ch: [] }, marks: stack });
      if (line !== '') out.push({ kind: 'text', text: line, marks: stack });
    });
    return out;
  };

  if (isWrapper(holder, env)) {
    return besideWrapper(doc, pos, holder, runs([]), length);
  }

  const stack = marks ?? marksBefore(holder, pos.offset, terminalOf(env));
  return {
    doc: spliceRuns(doc, pos, holder, runs(stack), env),
    caret: { path: pos.path, offset: pos.offset + length },
  };
}

// br은 마크 안에서 마크를 잇는다(<b>45<br/>6</b>) — 래퍼문단에서는 엔터와 같은 길로 빈 문단을 세운다(br이 설 글이 없다).
// A br continues the surrounding mark (<b>45<br/>6</b>); on a wrapper paragraph it degrades to an empty paragraph like Enter, since there's no text for a br to sit in.
export function insertLine(doc: NabiDoc, pos: Position, env: EditEnv, marks?: readonly ElementNode[]): EditResult {
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
