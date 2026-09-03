// 노출 규칙은 선언에서만 나온다 — registry의 소유 판정과 wing의 allows·holds·place뿐, ui가 wing 이름을 알아보고 특례를 두는 자리는 없다. tool은 늘 보이고, mark는 순수 인라인 상자(코드) 안에서 숨고, attr는 래퍼문단엔 정렬만(물건이 noAlign이면 그마저 숨고) 나머지 문단 속성은 숨으며, void·container는 인라인 홀더 속엔 못 서고 allows 밖이면 숨는다.
// Visibility is decided purely by declaration — registry ownership plus a wing's allows/holds/place, with no special-casing of wing names anywhere in ui. tool is always visible; mark hides inside a purely-inline box (code); attr shows only alignment on a wrapper paragraph (hidden too if the item declares noAlign), and hides other paragraph attrs entirely; void/container can't stand inside an inline holder and hides outside the parent's allows.
import { isWrapper, takesAlign, type ElementNode, type NabiDoc } from '../schema/index.js';
import { nodeAt, type EditEnv, type Position } from '../doc/index.js';
import type { Registry, Wing } from '../wing/index.js';

export interface ReachAt {
  // 캐럿을 직접 든 홀더 (글 문단·표의 칸·코드 상자…).
  // The holder directly containing the caret (a text paragraph, table cell, code box...).
  readonly holder: ElementNode | null;
  // 그 홀더가 글·라인만 드는 인라인 홀더인가.
  // Whether that holder only holds text/lines (an inline holder).
  readonly inline: boolean;
  // 홀더가 어떤 wing의 자기 노드(부품이 아니라)인가 — 코드 상자를 가려내는 자리다.
  // Whether the holder is a wing's own node (not a part) — this is what distinguishes a code box.
  readonly holderWing: Wing | null;
  readonly holderIsOwnNode: boolean;
  // 새 블록이 들어갈 자리를 품는 가장 안쪽 노드 — 없으면 문서 뿌리다.
  // The innermost node that would hold a new block — the document root when there is none.
  readonly blockParent: ElementNode | null;
  readonly blockParentWing: Wing | null;
  // 캐럿의 최상위 문단.
  // The caret's top-level paragraph.
  readonly top: ElementNode | null;
  readonly topIsWrapper: boolean;
  // 그 최상위 문단이 정렬을 받는가 — 물건이 정렬을 마다하면(`noAlign`) 거짓이다.
  // Whether that top paragraph accepts alignment — false when the item declares `noAlign`.
  readonly topTakesAlign: boolean;
}

// 캐럿 자리를 한 번만 재서 규칙 넷이 나눠 쓴다 — 같은 걸음을 네 번 걷지 않는다.
// Measures the caret's position once and lets all four rules share it, instead of walking the same steps four times.
export function reachAt(doc: NabiDoc, pos: Position, registry: Registry, env: EditEnv): ReachAt {
  const holder = nodeAt(doc, pos.path);
  const holderWing = holder ? registry.ownerOf(holder.w) : null;
  const holderIsOwnNode = holder !== null && holderWing !== null && holderWing.w === holder.w;
  const inline = holder !== null && env.inlineHolders.has(holder.w);

  // 블록이 앉을 자리 — 홀더 자신이 문단이면 그 위, 아니면 홀더가 곧 그 자리다.
  // Where a block would land — one level above the holder if it's a paragraph, otherwise the holder itself.
  let blockParent: ElementNode | null = null;
  for (let depth = pos.path.length - 1; depth >= 1; depth -= 1) {
    const node = nodeAt(doc, pos.path.slice(0, depth));
    if (!node) continue;
    if (env.blockHolders.has(node.w)) {
      blockParent = node;
      break;
    }
    // 글 속이다 — 블록은 여기 못 선다.
    // Inside inline content — a block can't stand here.
    if (env.inlineHolders.has(node.w)) break;
  }
  const top = nodeAt(doc, [pos.path[0] ?? 0]);

  return {
    holder,
    inline,
    holderWing,
    holderIsOwnNode,
    blockParent,
    blockParentWing: blockParent ? registry.ownerOf(blockParent.w) : null,
    top,
    topIsWrapper: top !== null && isWrapper(top, env),
    topTakesAlign: top === null || takesAlign(top, env),
  };
}

// 품을 쪽이 이 타입을 받는가 — `allows` 는 그 wing 자신의 노드에만 걸린다(부품에는 안 걸린다).
// Whether the parent accepts this type — `allows` only applies to a wing's own node, never to its parts.
export function admits(reach: ReachAt, childW: string): boolean {
  const parent = reach.blockParent;
  const wing = reach.blockParentWing;
  if (!parent || !wing) return true; // document root — anything goes
  if (wing.w !== parent.w) return true; // a part (table cell, list item) — no restriction declared
  return wing.allows === undefined || wing.allows.includes(childW);
}

export function visibleAt(reach: ReachAt, wing: Wing): boolean {
  switch (wing.place) {
    case 'tool':
      return true;
    case 'mark':
      // 속이 평문인 상자 안 — 마크가 살아남지 못하는 자리다(코드 상자의 repair가 걷는다).
      // Inside a purely-plain-text box — marks can't survive there (a code box's repair strips them).
      return !(reach.inline && reach.holderIsOwnNode);
    case 'attr':
      // 래퍼문단이 드는 문단 속성은 정렬 하나뿐이고, 물건이 마다했으면(noAlign) 그마저 없다. 캐럿이 상자 속이든 통째로 고른 자리든 최상위는 같은 래퍼문단이라 한 판정으로 함께 닫힌다.
      // A wrapper paragraph carries only alignment among paragraph attrs, and even that's gone if the item declares noAlign. Whether the caret is inside the box or the whole thing is selected, the top-level node is the same wrapper, so one check covers both.
      if (!reach.topIsWrapper) return true;
      return wing.attrKey === 'a' && reach.topTakesAlign;
    default:
      // void·container — 글 속에는 못 서고, 품을 쪽의 allows 밖이면 숨는다.
      // void/container — can't stand inside inline content, and hides outside the parent's allows.
      return !reach.inline && admits(reach, wing.w);
  }
}
