// 노출 규칙 — "여기서 못 쓰는 아이콘은 안 보인다". 판정은 **선언에서만** 나온다: registry 의
// 소유 판정과 wing 의 `allows`·`holds`·`place` 다. ui 가 wing 이름을 알아보고 특례를 두는 자리는
// 하나도 없다 (그 특례들이 옛 판의 중복이었다).
//
// 갈래별 규칙 넷:
//   tool       늘 보인다 — 문서 자리를 안 탄다
//   mark       속이 평문인 상자(스스로 `holds: 'inline'` 인 컨테이너 = 코드) 안에서는 숨는다
//   attr       래퍼문단에는 정렬만 얹힌다 — 나머지 문단 속성은 숨는다
//   void·container  글 속(인라인 홀더)에는 못 서고, 품을 쪽의 `allows` 밖이면 숨는다
import { isWrapper, type ElementNode, type NabiDoc } from '../schema/index.js';
import { nodeAt, type EditEnv, type Position } from '../doc/index.js';
import type { Registry, Wing } from '../wing/index.js';

export interface ReachAt {
  // 캐럿을 직접 든 홀더 (글 문단·표의 칸·코드 상자…).
  readonly holder: ElementNode | null;
  // 그 홀더가 글·라인만 드는 인라인 홀더인가.
  readonly inline: boolean;
  // 홀더가 어떤 wing 의 **자기 노드**(부품이 아니라)인가 — 코드 상자를 가려내는 자리다.
  readonly holderWing: Wing | null;
  readonly holderIsOwnNode: boolean;
  // 새 블록이 들어갈 자리를 품는 가장 안쪽 노드 — 없으면 문서 뿌리다.
  readonly blockParent: ElementNode | null;
  readonly blockParentWing: Wing | null;
  // 캐럿의 최상위 문단.
  readonly top: ElementNode | null;
  readonly topIsWrapper: boolean;
}

// 캐럿 자리를 한 번만 재서 규칙 넷이 나눠 쓴다 — 같은 걸음을 네 번 걷지 않는다.
export function reachAt(doc: NabiDoc, pos: Position, registry: Registry, env: EditEnv): ReachAt {
  const holder = nodeAt(doc, pos.path);
  const holderWing = holder ? registry.ownerOf(holder.w) : null;
  const holderIsOwnNode = holder !== null && holderWing !== null && holderWing.w === holder.w;
  const inline = holder !== null && env.inlineHolders.has(holder.w);

  // 블록이 앉을 자리 — 홀더 자신이 문단이면 그 위, 아니면 홀더가 곧 그 자리다.
  let blockParent: ElementNode | null = null;
  for (let depth = pos.path.length - 1; depth >= 1; depth -= 1) {
    const node = nodeAt(doc, pos.path.slice(0, depth));
    if (!node) continue;
    if (env.blockHolders.has(node.w)) {
      blockParent = node;
      break;
    }
    if (env.inlineHolders.has(node.w)) break; // 글 속이다 — 블록은 여기 못 선다
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
  };
}

// 품을 쪽이 이 타입을 받는가 — `allows` 는 **그 wing 자신의 노드**에만 걸린다(부품에는 안 걸린다).
export function admits(reach: ReachAt, childW: string): boolean {
  const parent = reach.blockParent;
  const wing = reach.blockParentWing;
  if (!parent || !wing) return true; // 문서 뿌리 — 무엇이든 선다
  if (wing.w !== parent.w) return true; // 부품(표의 칸·리스트 항목) — 제한 선언이 없다
  return wing.allows === undefined || wing.allows.includes(childW);
}

// 이 wing 의 버튼이 지금 자리에서 보이는가.
export function visibleAt(reach: ReachAt, wing: Wing): boolean {
  switch (wing.place) {
    case 'tool':
      return true;
    case 'mark':
      // 속이 평문인 상자 안 — 마크가 살아남지 못하는 자리다(코드 상자의 repair 가 걷는다).
      return !(reach.inline && reach.holderIsOwnNode);
    case 'attr':
      // 래퍼문단(물건을 입은 문단)이 드는 문단 속성은 정렬 하나뿐이다.
      return !reach.topIsWrapper || wing.attrKey === 'a';
    default:
      // void·container — 글 속에는 못 서고, 품을 쪽의 `allows` 밖이면 숨는다.
      return !reach.inline && admits(reach, wing.w);
  }
}
