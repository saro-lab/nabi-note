// 엔터의 모든 갈래가 여기 모인다 — 글 문단은 갈라지고, 래퍼문단은 빈 문단을 세우고, 인라인 홀더/표 칸 속은 라인으로 대신한다.
// Every branch of Enter routes through here: a text paragraph splits, a wrapper plants an empty paragraph, and inline holders/table cells get a line break instead.
import { P, isWrapper, type Attrs, type AttrValue, type ElementNode, type NabiDoc } from '../schema/index.js';
import { insertLine } from './insert.js';
import { nodeAt, replaceAt, terminalOf, type EditEnv, type EditResult, type Position } from './position.js';
import { fromRuns, holderRuns, sliceRuns } from './runs-edit.js';

// a(정렬)는 양쪽 다, dc(드롭캡)는 첫 글자를 가진 쪽만, h(제목)는 글이 있는 쪽만 — 빈 문단에 제목을 안 물려야 엔터마다 제목이 안 불어난다.
// Alignment carries to both halves, drop cap follows whichever side keeps the first character, heading only survives on a side with text — otherwise every Enter at a heading's end would spawn another heading.
function splitAttrs(a: Attrs | undefined, keepDc: boolean, hasText: boolean): Attrs | undefined {
  if (!a) return undefined;
  const out: Record<string, AttrValue> = {};
  if (hasText && a['h'] !== undefined) out['h'] = a['h'];
  if (a['a'] !== undefined) out['a'] = a['a'];
  if (keepDc && a['dc'] !== undefined) out['dc'] = a['dc'];
  return Object.keys(out).length > 0 ? out : undefined;
}

export function splitParagraph(doc: NabiDoc, pos: Position, env: EditEnv): EditResult {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return { doc, caret: pos };

  // 앞(offset 0)은 위에, 뒤(1)는 아래에 빈 문단을 연다.
  // Offset 0 opens an empty paragraph above, 1 below.
  if (isWrapper(holder, env)) {
    const fresh: ElementNode = { w: P, ch: [] };
    const before = pos.offset === 0;
    const next = replaceAt(doc, pos.path, before ? [fresh, holder] : [holder, fresh]);
    const parent = pos.path.slice(0, -1);
    const index = pos.path[pos.path.length - 1] as number;
    return { doc: next, caret: { path: before ? pos.path : [...parent, index + 1], offset: 0 } };
  }

  // 인라인 홀더 속과 문단 하나 고정 컨테이너(표의 칸) 속에서는 엔터가 라인이 된다.
  // Inside an inline holder or a single-paragraph container (a table cell), Enter becomes a line break instead.
  if (env.inlineHolders.has(holder.w)) return insertLine(doc, pos, env);
  const parentNode = pos.path.length > 1 ? nodeAt(doc, pos.path.slice(0, -1)) : null;
  if (parentNode && env.singleParagraph?.has(parentNode.w)) return insertLine(doc, pos, env);

  const terminal = terminalOf(env);
  const runs = holderRuns(holder, terminal);
  const headRuns = sliceRuns(runs, 0, pos.offset);
  const tailRuns = sliceRuns(runs, pos.offset, Number.MAX_SAFE_INTEGER);
  const headKeepsDc = pos.offset > 0;

  const headAttrs = splitAttrs(holder.a, headKeepsDc, headRuns.length > 0);
  const head: ElementNode = {
    w: holder.w,
    ...(headAttrs ? { a: headAttrs } : {}),
    ch: fromRuns(headRuns),
    ...(holder._id !== undefined ? { _id: holder._id } : {}),
  };
  const tailAttrs = splitAttrs(holder.a, !headKeepsDc, tailRuns.length > 0);
  const tail: ElementNode = {
    w: P,
    ...(tailAttrs ? { a: tailAttrs } : {}),
    ch: fromRuns(tailRuns),
  };

  const next = replaceAt(doc, pos.path, [head, tail]);
  const parent = pos.path.slice(0, -1);
  const index = pos.path[pos.path.length - 1] as number;
  return { doc: next, caret: { path: [...parent, index + 1], offset: 0 } };
}
