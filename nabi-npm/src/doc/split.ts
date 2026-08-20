// 분할(엔터) 표의 라우팅이 전부 여기다.
// 글 문단: 문단이 갈라지고 캐럿은 새 문단 처음(오프셋 0 = 무마크 — 경계 정규화가 D1 을 만든다).
// 문단 속성: h·a 는 이어지고, dc(드롭캡)는 첫 글자를 가진 쪽만 갖는다.
// 래퍼문단: 0 이면 위에, 1 이면 아래에 빈 문단이 서고 캐럿이 거기 간다 (옛 060 이 규칙이 된 자리).
// 인라인 홀더(summary·code)와 문단 하나 고정 컨테이너(표의 칸) 속: 분할 대신 라인.
import {
  P,
  isWrapper,
  type Attrs,
  type AttrValue,
  type ElementNode,
  type NabiDoc,
} from '../schema/index.js';
import { insertLine } from './insert.js';
import {
  nodeAt,
  replaceAt,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from './position.js';
import { fromRuns, holderRuns, sliceRuns } from './runs-edit.js';

// 분할 양쪽의 속성 — 셋이 서로 다른 규칙을 쓴다.
//
//   a (정렬)  양쪽 다 — 자리잡기라 이어지는 것이 자연스럽다.
//   dc (드롭캡) **첫 글자를 가진 쪽만** — 첫 글자에 걸리는 것이라 글을 따라간다.
//   h (제목)  **글이 있는 쪽만.**
//
// 제목이 그런 까닭: 제목 끝에서 엔터를 치면 다음 줄은 본문을 쓰려는 자리다. 그런데 빈 문단이
// 제목을 물려받으면 글자를 치는 순간 제목 둘이 되어, 사람이 매번 제목을 풀어야 했다.
// **빈 문단은 제목이 아니다** — 가운데를 가르면 양쪽 다 글이 있으니 둘 다 제목으로 남는다.
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

  // 래퍼문단 — 앞(0)은 위에, 뒤(1)는 아래에 빈 문단을 연다.
  if (isWrapper(holder, env)) {
    const fresh: ElementNode = { w: P, ch: [] };
    const before = pos.offset === 0;
    const next = replaceAt(doc, pos.path, before ? [fresh, holder] : [holder, fresh]);
    const parent = pos.path.slice(0, -1);
    const index = pos.path[pos.path.length - 1] as number;
    return { doc: next, caret: { path: before ? pos.path : [...parent, index + 1], offset: 0 } };
  }

  // 인라인 홀더 속과 문단 하나 고정 컨테이너(표의 칸) 속 — 엔터는 라인이다.
  if (env.inlineHolders.has(holder.w)) return insertLine(doc, pos, env);
  const parentNode = pos.path.length > 1 ? nodeAt(doc, pos.path.slice(0, -1)) : null;
  if (parentNode && env.singleParagraph?.has(parentNode.w)) return insertLine(doc, pos, env);

  // 글 문단 — 갈라진다.
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
