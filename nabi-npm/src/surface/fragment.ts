// 붙여넣기 조각을 캐럿 자리에 끼우는 순수 연산 — "빈 문단 + 단일 물건 = 교체"는 wing/ops 의
// insertLump 가 알고, 여기는 여러 문단 조각의 자리 잡기다.
import {
  BR,
  P,
  isElement,
  isWrapper,
  runsOf,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
  type SchemaEnv,
} from '../schema/index.js';
import {
  fromRuns,
  holderLength,
  holders,
  isHolder,
  nodeAt,
  replaceAt,
  sliceRuns,
  splitParagraph,
  terminalOf,
  withChildren,
  type Position,
} from '../doc/index.js';
import { caretAt, isCollapsed, type Selection } from '../caret/index.js';
import { insertLump } from '../wing/index.js';
import { singleLumpOf } from '../html/index.js';
import type { Command } from '../editor/index.js';

// 끼운 조각 바로 뒤의 캐럿 자리 — 다음 홀더의 처음, 없으면 조각 안 마지막 홀더의 끝.
function caretAfter(doc: NabiDoc, lastTop: number, env: SchemaEnv): Position {
  const all = holders(doc, env);
  for (const holder of all) {
    if ((holder.path[0] as number) > lastTop) return { path: holder.path, offset: 0 };
  }
  const last = all[all.length - 1];
  return last ? { path: last.path, offset: holderLength(last.node, env) } : { path: [0], offset: 0 };
}

// 조각을 **글줄 하나로 누른다** — 문단 경계는 라인(br)이 되고 마크는 그대로 살아남는다.
// 표의 칸처럼 "문단 하나로 고정된" 자리에 붙여넣을 때 쓰는 모양이다(옛 규칙: 칸은 글줄).
function pressToInline(fragment: readonly ElementNode[], env: SchemaEnv): NabiNode[] {
  const inlineOf = (nodes: readonly NabiNode[]): NabiNode[] => {
    const inline: NabiNode[] = [];
    for (const node of nodes) {
      if (typeof node === 'string') {
        if (node !== '') inline.push(node);
        continue;
      }
      if (!isElement(node)) continue;
      if (node.w === BR) inline.push({ w: BR, ch: [] });
      else if (
        !env.lumps.has(node.w) &&
        !env.blockHolders.has(node.w) &&
        !env.inlineHolders.has(node.w) &&
        node.ch.length > 0
      ) {
        inline.push(node);
      }
    }
    return inline;
  };
  const linesOf = (node: NabiNode): NabiNode[][] => {
    if (typeof node === 'string') return node === '' ? [] : [[node]];
    if (!isElement(node)) return [];
    if (node.w === P) {
      if (isWrapper(node, env)) return node.ch.flatMap(linesOf);
      return [inlineOf(node.ch)];
    }
    if (env.inlineHolders.has(node.w)) return [inlineOf(node.ch)];
    if (env.blockHolders.has(node.w)) return node.ch.flatMap(linesOf);
    if (env.lumps.has(node.w) || node.ch.length === 0) return [];
    return [[node]];
  };
  const lines = fragment.flatMap(linesOf);
  const out: NabiNode[] = [];
  lines.forEach((line, index) => {
    if (index > 0) out.push({ w: BR, ch: [] });
    out.push(...line);
  });
  return out;
}

// 조각을 홀더 **안**에 글줄로 잇는다 — 문단을 안 가른다.
//
// 표의 칸에서만 서던 몸이었는데(아래 "깊은 캐럿" 갈래), 최상위 문단에서도 같은 답이 옳아서
// 자리를 옮겼다. 새 연산이 아니다 — 두 갈래가 한 몸을 나눠 쓴다.
// `withChildren` 이 `_id` 를 지키므로 재그리기는 그 문단 하나로 그친다(`redraw.ts` 의 put 하나).
function spliceInline(
  doc: NabiDoc,
  focus: Position,
  holder: ElementNode,
  fragment: readonly ElementNode[],
  env: SchemaEnv,
): { doc: NabiDoc; selection: Selection } | null {
  const inline = pressToInline(fragment, env);
  if (inline.length === 0) return null;
  const terminal = terminalOf(env);
  const runs = runsOf(holder, terminal);
  const length = holderLength(holder, env);
  const at = Math.max(0, Math.min(focus.offset, length));
  const middle = runsOf({ w: P, ch: inline }, terminal);
  const next = fromRuns([...sliceRuns(runs, 0, at), ...middle, ...sliceRuns(runs, at, length)]);
  const grown = holderLength({ w: P, ch: inline }, env);
  return {
    doc: replaceAt(doc, focus.path, [withChildren(holder, next)]),
    selection: caretAt({ path: focus.path, offset: at + grown }),
  };
}

// 글줄로 이어 붙일 조각인가 — **문단 하나뿐이고 블록의 뜻을 안 든** 것만 그렇다.
// 잃어버렸던 옛 규칙(AGENTS.md §9.14)의 두 번째 줄이다: "문단만 글자로 풀어 잇는다".
//
//  - `length === 1` — 문단 둘 이상은 진짜로 문단 경계를 든 조각이다. 가르는 것이 맞다.
//  - `a === undefined` — 제목(`h`)·정렬(`a`)·드롭캡(`dc`)이 실린 문단은 "블록이었다"는 말을
//    들고 온다. 글줄로 누르면 그 말이 사라지므로 가르기로 보낸다(옛 규칙의 "블록은 통째로").
//  - `!isWrapper` — 물건을 품은 래퍼문단은 앞의 `singleLumpOf` 갈래가 이미 잡는다. 겹치지
//    않게 못 박는다.
function inlineFragment(fragment: readonly ElementNode[], env: SchemaEnv): boolean {
  if (fragment.length !== 1) return false;
  const only = fragment[0];
  return only !== undefined && only.w === P && only.a === undefined && !isWrapper(only, env);
}

// 캐럿이 접힌 상태를 전제한다 — 범위였다면 부르는 쪽(mount)이 먼저 deleteRange 를 돌린다(한 group 안).
export function insertFragmentOp(fragment: readonly ElementNode[]): Command {
  return (doc, sel, _args, env) => {
    if (fragment.length === 0 || !isCollapsed(sel)) return null;
    const focus = sel.focus;
    const holder = nodeAt(doc, focus.path);
    if (!holder) return null;

    // 조각이 물건 하나뿐 — 교체 규칙의 자료 그대로 (빈 문단이면 그 자리가 래퍼문단이 된다).
    //
    // **래퍼문단이 들고 온 문단 속성이 함께 선다** (260823_010). 물건만 뽑아 새 껍데기를 입히면
    // 가운데 섰던 그림이 왼쪽으로 돌아왔다 — 복사한 html 에는 `data-nabi-align="c"` 가 실려
    // 있었고 조각에도 `a:{a:'c'}` 로 도착했는데, `insertLump` 가 그것을 안 받아 갔다(실측).
    //
    // `insertLump` 의 `wrap` 은 **기본값**의 자리라(그림 삽입 커맨드가 기본 정렬을 거기로 준다)
    // 캐럿의 빈 문단이 제 속성을 들고 있으면 그것이 이긴다. 붙여넣기는 그 반대여야 한다 —
    // 사람이 **그 모양 그대로** 복사한 것이라, 실려 온 속성이 빈 자리의 속성을 덮는다.
    // 그래서 `wrap` 으로 한 번 주고(빈 자리가 아닐 때의 길), 놓인 래퍼를 한 번 더 되씌운다.
    const lump = singleLumpOf(fragment, env);
    if (lump) {
      const dress = fragment[0]?.a;
      const r = insertLump(doc, focus, lump, env, dress);
      const placed = nodeAt(r.doc, r.caret.path);
      const next =
        dress !== undefined && placed !== null && isWrapper(placed, env) && placed.a !== dress
          ? replaceAt(r.doc, r.caret.path, [{ ...placed, a: dress }])
          : r.doc;
      return { doc: next, selection: caretAt(r.caret) };
    }

    const top = focus.path[0] as number;
    const topNode = doc[top];
    if (topNode === undefined) return null;

    // 캐럿의 최상위가 빈 문단이다 — 조각이 그 자리를 차지한다.
    if (topNode.w === P && topNode.ch.length === 0) {
      const next = [...doc.slice(0, top), ...fragment, ...doc.slice(top + 1)] as NabiDoc;
      return { doc: next, selection: caretAt(caretAfter(next, top + fragment.length - 1, env)) };
    }

    // **인라인 조각 + 글 홀더 — 문단을 안 가르고 캐럿 자리에 글줄로 잇는다.**
    //
    // 문단 가운데를 복사해 다른 문단 가운데에 붙이면 문단 하나가 셋이 되던 자리다(260823_008).
    // 최상위든 칸 속이든 안 가린다 — 조각의 생김새가 갈림이지 캐럿의 깊이가 갈림이 아니다.
    // 빈 문단(위 갈래)이 이보다 앞이라 "빈 문단에 붙이면 그 자리를 차지한다"는 답은 그대로다.
    if (inlineFragment(fragment, env) && isHolder(holder, env) && !isWrapper(holder, env)) {
      const spliced = spliceInline(doc, focus, holder, fragment, env);
      if (spliced) return spliced;
    }

    // 최상위 글 문단의 캐럿 — 그 자리를 가르고 사이에 끼운다.
    // (이제 문단 둘 이상인 조각과 블록 속성이 실린 문단만 여기로 온다.)
    if (focus.path.length === 1 && topNode.w === P && topNode.ch.length > 0 && !isWrapper(topNode, env)) {
      const split = splitParagraph(doc, focus, env);
      const at = split.caret.path[0] as number;
      const next = [...split.doc.slice(0, at), ...fragment, ...split.doc.slice(at)] as NabiDoc;
      const tail: Position = {
        path: [at + fragment.length, ...split.caret.path.slice(1)],
        offset: split.caret.offset,
      };
      return { doc: next, selection: caretAt(tail) };
    }

    // **칸 속·코드 속의 캐럿** — 조각을 그 자리 **안에** 글줄로 끼운다.
    //
    // 예전에는 이 자리가 아래의 "깊은 캐럿" 으로 떨어져 조각이 표 **밖**에 섰다 — 칸에 붙여넣었는데
    // 표 아래에 새 문단이 생기고 칸은 그대로였다(겪은 자리: "셀 안에 형광펜·글자색 붙여넣기 서식이
    // 증발"). 문단 경계는 라인이 되고 마크는 그대로 살아남는다.
    if (focus.path.length > 1 && !isWrapper(holder, env)) {
      return spliceInline(doc, focus, holder, fragment, env);
    }

    // 래퍼문단(0/1) — 최상위 앞/뒤에 통째로 세운다.
    const before = focus.path.length === 1 && focus.offset <= 0;
    const at = before ? top : top + 1;
    const next = [...doc.slice(0, at), ...fragment, ...doc.slice(at)] as NabiDoc;
    return { doc: next, selection: caretAt(caretAfter(next, at + fragment.length - 1, env)) };
  };
}
