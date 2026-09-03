// 붙여넣기 조각을 캐럿 자리에 끼우는 순수 연산 — 단일 물건 교체는 wing/ops의 insertLump가 맡고, 여기는 여러 문단 조각의 자리 잡기다
// Pure operation for splicing a paste fragment at the caret; single-object replacement is insertLump's job (wing/ops), this handles multi-paragraph fragment placement
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

// 끼운 조각 바로 뒤의 캐럿 자리 — 다음 홀더의 처음, 없으면 조각 안 마지막 홀더의 끝
// The caret position right after the inserted fragment: the next holder's start, or the fragment's last holder's end if there is none
function caretAfter(doc: NabiDoc, lastTop: number, env: SchemaEnv): Position {
  const all = holders(doc, env);
  for (const holder of all) {
    if ((holder.path[0] as number) > lastTop) return { path: holder.path, offset: 0 };
  }
  const last = all[all.length - 1];
  return last ? { path: last.path, offset: holderLength(last.node, env) } : { path: [0], offset: 0 };
}

// 조각을 글줄 하나로 누른다 — 문단 경계는 br이 되고 마크는 그대로 산다. 표 칸처럼 문단 하나로 고정된 자리에 쓰는 모양이다
// Flattens the fragment into one line of text; paragraph boundaries become br and marks survive. Used where the target is fixed to one paragraph, like a table cell
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

// 조각을 홀더 안에 글줄로 이어 붙인다 — 문단을 안 가른다. 표 칸 전용이었는데 최상위 문단에도 같은 답이 맞아 공유한다. withChildren이 _id를 지켜 재그리기는 그 문단 하나(redraw.ts의 put)로 그친다
// Splices the fragment into the holder as inline text without splitting the paragraph; originally table-cell-only, it now serves top-level paragraphs too since the same answer applies. withChildren preserves _id, so redraw touches only that one paragraph (a single put in redraw.ts)
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

// 글줄로 이어 붙일 조각인가 — 문단이 정확히 하나뿐이고(length===1), 블록 속성(제목·정렬·드롭캡)이 없고(a===undefined), 래퍼문단이 아닐 때만이다(래퍼는 singleLumpOf가 이미 처리해 겹치지 않는다)
// Whether the fragment should splice as inline text: exactly one paragraph (length===1), no block attributes like heading/align/dropcap (a===undefined), and not a wrapper (wrappers are already handled by singleLumpOf, so the two never overlap)
function inlineFragment(fragment: readonly ElementNode[], env: SchemaEnv): boolean {
  if (fragment.length !== 1) return false;
  const only = fragment[0];
  return only !== undefined && only.w === P && only.a === undefined && !isWrapper(only, env);
}

// 캐럿이 접힌 상태를 전제한다 — 범위였다면 부르는 쪽(mount)이 먼저 deleteRange를 한 group 안에서 돌린다
// Assumes a collapsed caret; for a range, the caller (mount) runs deleteRange first, inside the same undo group
export function insertFragmentOp(fragment: readonly ElementNode[]): Command {
  return (doc, sel, _args, env) => {
    if (fragment.length === 0 || !isCollapsed(sel)) return null;
    const focus = sel.focus;
    const holder = nodeAt(doc, focus.path);
    if (!holder) return null;

    // 조각이 물건 하나뿐이면 래퍼문단의 속성(정렬 등)도 함께 되씌운다(260823_010) — 물건만 뽑으면 가운데 그림이 왼쪽으로 돌아왔다(복사본의 data-nabi-align="c"를 insertLump가 안 받아 갔다, 실측). insertLump의 wrap은 기본값 자리라 붙여넣기에서는 실려 온 속성이 이겨야 하므로 배치 후 한 번 더 덮어 쓴다
    // A single-object fragment also re-applies the wrapper's attributes like alignment (260823_010); taking just the object reverted a centered image to the left (the copy's data-nabi-align="c" wasn't picked up by insertLump, measured). insertLump's `wrap` is a default slot, but pasted attributes must win, so they're re-applied after placement
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

    // 캐럿의 최상위가 빈 문단이면 조각이 그 자리를 차지한다
    // If the caret's top-level node is an empty paragraph, the fragment takes its place
    if (topNode.w === P && topNode.ch.length === 0) {
      const next = [...doc.slice(0, top), ...fragment, ...doc.slice(top + 1)] as NabiDoc;
      return { doc: next, selection: caretAt(caretAfter(next, top + fragment.length - 1, env)) };
    }

    // 인라인 조각 + 글 홀더는 문단을 안 가르고 캐럿 자리에 글줄로 잇는다(260823_008) — 최상위든 칸 속이든 조각의 생김새로 갈리지 캐럿 깊이로 안 갈린다
    // An inline fragment plus a text holder splices in as text without splitting the paragraph (260823_008); the branch is decided by the fragment's shape, not the caret's depth, so it applies at top level or inside a cell alike
    if (inlineFragment(fragment, env) && isHolder(holder, env) && !isWrapper(holder, env)) {
      const spliced = spliceInline(doc, focus, holder, fragment, env);
      if (spliced) return spliced;
    }

    // 최상위 글 문단의 캐럿은 그 자리를 가르고 사이에 조각을 끼운다 — 문단 둘 이상이거나 블록 속성이 실린 조각만 여기로 온다
    // A caret in a top-level text paragraph splits it and inserts the fragment between the halves; only multi-paragraph or block-attributed fragments reach this branch
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

    // 칸 속·코드 속의 캐럿은 조각을 그 자리 안에 글줄로 끼운다 — 예전엔 표 밖으로 떨어져 칸에 붙였는데 표 아래에 새 문단이 생기던 버그였다(셀 안 형광펜·글자색 서식이 증발)
    // A caret inside a table cell or code block splices the fragment inline right there; it used to fall through and land outside the table, creating a stray paragraph below it while the cell stayed empty (losing highlight/color formatting pasted into a cell)
    if (focus.path.length > 1 && !isWrapper(holder, env)) {
      return spliceInline(doc, focus, holder, fragment, env);
    }

    // 래퍼문단(0/1)은 최상위 앞/뒤에 조각을 통째로 세운다
    // A wrapper paragraph (offset 0/1) plants the whole fragment before/after it at the top level
    const before = focus.path.length === 1 && focus.offset <= 0;
    const at = before ? top : top + 1;
    const next = [...doc.slice(0, at), ...fragment, ...doc.slice(at)] as NabiDoc;
    return { doc: next, selection: caretAt(caretAfter(next, at + fragment.length - 1, env)) };
  };
}
