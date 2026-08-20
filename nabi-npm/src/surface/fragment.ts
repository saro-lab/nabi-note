// 붙여넣기 조각을 캐럿 자리에 끼우는 순수 연산 — "빈 문단 + 단일 물건 = 교체"는 wing/ops 의
// insertLump 가 알고, 여기는 여러 문단 조각의 자리 잡기다.
import { BR, P, isElement, isWrapper, runsOf, type ElementNode, type NabiDoc, type NabiNode, type SchemaEnv } from '../schema/index.js';
import {
  fromRuns,
  holderLength,
  holders,
  nodeAt,
  replaceAt,
  sliceRuns,
  splitParagraph,
  terminalOf,
  withChildren,
  type Position,
} from '../doc/index.js';
import { caretAt, isCollapsed } from '../caret/index.js';
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
  return last ? { path: last.path, offset: 0 } : { path: [0], offset: 0 };
}


// 조각을 **글줄 하나로 누른다** — 문단 경계는 라인(br)이 되고 마크는 그대로 살아남는다.
// 표의 칸처럼 "문단 하나로 고정된" 자리에 붙여넣을 때 쓰는 모양이다(옛 규칙: 칸은 글줄).
function pressToInline(fragment: readonly ElementNode[]): NabiNode[] {
  const out: NabiNode[] = [];
  const walk = (nodes: readonly NabiNode[]): void => {
    for (const node of nodes) {
      if (typeof node === 'string') {
        if (node !== '') out.push(node);
        continue;
      }
      if (!isElement(node)) continue;
      if (node.w === BR) {
        out.push({ w: BR, ch: [] });
        continue;
      }
      // 블록 껍데기(문단·래퍼·표의 행과 칸) — 벗기고 속만 잇는다.
      if (node.w === P || node.ch.some((kid) => isElement(kid) && (kid.w === P || kid.w === 'tr' || kid.w === 'td'))) {
        walk(node.ch);
        continue;
      }
      if (node.ch.length === 0) continue; // 물건·빈 마크 — 글줄에 못 선다
      out.push(node); // 마크 — 그대로 산다(형광펜·글자색이 여기서 살아남는다)
    }
  };
  fragment.forEach((block, at) => {
    if (at > 0 && out.length > 0) out.push({ w: BR, ch: [] });
    walk([block]);
  });
  return out;
}

// 캐럿이 접힌 상태를 전제한다 — 범위였다면 부르는 쪽(mount)이 먼저 deleteRange 를 돌린다(한 group 안).
export function insertFragmentOp(fragment: readonly ElementNode[]): Command {
  return (doc, sel, _args, env) => {
    if (fragment.length === 0 || !isCollapsed(sel)) return null;
    const focus = sel.focus;
    const holder = nodeAt(doc, focus.path);
    if (!holder) return null;

    // 조각이 물건 하나뿐 — 교체 규칙의 자료 그대로 (빈 문단이면 그 자리가 래퍼문단이 된다).
    const lump = singleLumpOf(fragment, env);
    if (lump) {
      const r = insertLump(doc, focus, lump, env);
      return { doc: r.doc, selection: caretAt(r.caret) };
    }

    const top = focus.path[0] as number;
    const topNode = doc[top];
    if (topNode === undefined) return null;

    // 캐럿의 최상위가 빈 문단이다 — 조각이 그 자리를 차지한다.
    if (topNode.w === P && topNode.ch.length === 0) {
      const next = [...doc.slice(0, top), ...fragment, ...doc.slice(top + 1)] as NabiDoc;
      return { doc: next, selection: caretAt(caretAfter(next, top + fragment.length - 1, env)) };
    }

    // 최상위 글 문단의 캐럿 — 그 자리를 가르고 사이에 끼운다.
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
      const inline = pressToInline(fragment);
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

    // 래퍼문단(0/1) — 최상위 앞/뒤에 통째로 세운다.
    const before = focus.path.length === 1 && focus.offset <= 0;
    const at = before ? top : top + 1;
    const next = [...doc.slice(0, at), ...fragment, ...doc.slice(at)] as NabiDoc;
    return { doc: next, selection: caretAt(caretAfter(next, at + fragment.length - 1, env)) };
  };
}
