// 상황 줄이 그릴 그룹 목록을 정하는 순수부 — 출처 셋(조상·마크·문단 속성)을 안→밖 순서로 모으고, 상태는 겨눔 노드 하나가 아니라 후보 줄기 전체가 함께 답한다.
// Pure logic that decides which groups the context toolbar renders — merges three sources (ancestors, marks, paragraph attrs) inside-out; state comes from the whole candidate chain, not just the target node.
import { isElement, isWrapper, type ElementNode, type NabiDoc } from '../schema/index.js';
import { holderLength, nodeAt, type EditEnv, type Position } from '../doc/index.js';
import { marksAt, ordered, type Selection } from '../caret/index.js';
import type { Registry, Wing } from '../wing/index.js';
import { aimNode } from './press.js';

export interface ContextGroup {
  readonly wing: Wing;
  // 이 그룹이 겨누는 노드 — attr을 선언한 컨트롤·판의 미리 채우기가 여기서 값을 읽는다.
  // The node this group targets — controls with a declared attr and panel prefills read their value here.
  readonly node: ElementNode;
  // 이 wing이 소유한 조상 전부(안→밖) — 상태 토큰은 이 줄기 전체가 함께 답한다(표: 칸이 'merged th', 표가 'sort').
  // Every ancestor this wing owns, inside-out — the state token comes from the whole chain (a table's cell answers 'merged th', the table itself 'sort').
  readonly nodes: readonly ElementNode[];
}

// 마크를 읽을 자리 — 접힌 캐럿이면 그 자리, 범위면 첫 글자의 끝(경계 정규화가 앞 글자를 따르므로 그래야 첫 글자의 마크가 나온다).
// Where to read marks from — the caret itself when collapsed, or the end of the first character in a range (boundary normalization follows the preceding character, so this is what yields that first character's marks).
function markReadPoint(doc: NabiDoc, start: Position, end: Position, env: EditEnv): Position {
  if (start.path.length === end.path.length && start.path.every((v, i) => v === end.path[i])) {
    if (start.offset === end.offset) return start; // 접힘
  }
  const holder = nodeAt(doc, start.path);
  if (!holder) return start;
  const limit = holderLength(holder, env);
  return { path: start.path, offset: Math.min(start.offset + 1, limit) };
}

export function contextGroupsAt(
  doc: NabiDoc,
  sel: Selection,
  registry: Registry,
  env: EditEnv,
): readonly ContextGroup[] {
  // wing 하나에 후보 여럿(표의 table·tr·td) — 순서는 안에서 밖으로 모은다.
  // A wing can have several candidates (a table's table/tr/td) — collected inside-out.
  const order: Wing[] = [];
  const candidates = new Map<Wing, ElementNode[]>();

  const offer = (wing: Wing | null, node: ElementNode): void => {
    if (!wing || !wing.context) return;
    const list = candidates.get(wing);
    if (list) {
      list.unshift(node); // outer candidates sort later
      return;
    }
    order.push(wing);
    candidates.set(wing, [node]);
  };

  // 1. 조상 — 바깥에서 안으로 훑되, 후보 목록은 안쪽이 앞에 오게 쌓는다.
  // Ancestors, walked outer-to-inner, but stacked so the innermost candidate sorts first.
  const path = sel.focus.path;
  for (let depth = 1; depth <= path.length; depth += 1) {
    const at = path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (!node) continue;
    offer(registry.ownerOf(node.w), node);
    // 래퍼문단이 캐럿의 홀더다 — 그 속 물건은 조상이 아니지만 이 줄이 겨누는 것이 그것이다(물건 선택은 래퍼문단의 0~1 범위일 뿐, 별도 상태가 아니다).
    // The wrapper paragraph is the caret's holder — the item inside isn't an ancestor, but it's what this row targets (selecting the item is just a 0-1 range on the wrapper, not separate state).
    if (depth === path.length && isWrapper(node, env)) {
      const lump = node.ch[0];
      if (isElement(lump)) offer(registry.ownerOf(lump.w), lump);
    }
  }

  // 2. 마크 — 범위를 골랐으면 첫 글자의 마크를 읽는다. 경계 정규화상 캐럿은 앞 글자를 따르므로, 범위 시작점 그대로 읽으면 고른 첫 글자가 아니라 그 앞 글자를 보게 된다.
  // Marks — for a range, read the first character's marks. Since boundary normalization makes the caret follow the preceding character, reading straight from the range start would see the character before the selection, not its first character.
  const [start, end] = ordered(sel);
  const at = markReadPoint(doc, start, end, env);
  for (const mark of marksAt(doc, at, env)) offer(registry.ownerOf(mark.w), mark);

  // 3. 문단 속성 — 겨눔은 선택 시작 문단이다(press의 attr 판정과 같은 기준). 값이 없는 wing은 건너뛴다.
  // Paragraph-attr wings — targets the selection's starting paragraph (same rule as press's attr check); a wing with no value on it is skipped.
  const top = nodeAt(doc, [start.path[0] as number]);
  if (top) {
    for (const wing of registry.wings) {
      if (wing.place !== 'attr' || !wing.context) continue;
      if (wing.currentValue?.(top) === undefined) continue;
      offer(wing, top);
    }
  }

  const groups: ContextGroup[] = [];
  for (const wing of order) {
    const nodes = candidates.get(wing) ?? [];
    const node = aimNode(nodes, wing);
    if (node) groups.push({ wing, node, nodes });
  }
  return groups;
}
