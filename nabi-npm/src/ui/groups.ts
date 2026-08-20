// 상황 줄이 무엇을 그릴지 정하는 순수부 — 캐럿 자리에서 **그룹 목록**을 답한다.
// (그리는 일은 `context.ts` 가 하고, 그것은 이 목록을 종류별 렌더러로 돌릴 뿐이다.
//  옛 판의 230줄짜리 refresh 하나가 이 둘로 갈렸다.)
//
// 그룹의 출처는 셋이고 순서가 있다:
//   1. 캐럿 경로의 조상 — 바깥부터 안쪽으로 (표 → 접기 → 코드)
//   2. 캐럿 자리의 마크 — 링크·형광펜·글자색·크기·서체 (경계 정규화의 답을 그대로 쓴다)
//   3. 문단 속성 wing — 제목·정렬·드롭캡. 셋은 노드를 안 세우므로(place 'attr') 캐럿 경로에
//      **없다** — 경로만 훑으면 영영 안 뜬다. 그래서 캐럿의 최상위 문단을 겨눔으로 세운다.
// 셋 다 "`context` 선언이 있는 wing" 만 센다. 선언이 없으면 그릴 것이 없다는 뜻이다.
//
// 문단 속성 그룹은 **그 문단이 값을 가질 때만** 선다 — 아무것도 안 고른 칸 줄은 아무 말도 하지
// 않는다. 눌러서 효과가 사라지면 그룹도 함께 빠지고, 걸려 있으면 지금 골라진 것이 보인다.
//
// 그룹이 **겨누는 노드**는 `press` 의 규칙 하나로 고른다: 후보(안→밖) 중 자기 값을 답하는 첫
// 노드다. 표의 그룹은 칸을 겨누고(칸이 'merged th' 를 답한다), 접기의 그룹은 상자를 겨눈다.
// 다만 **상태 토큰은 겨눔 하나가 아니라 후보 전부가 함께 답한다** (`press` 의 `stackValue`) —
// 표의 정렬 표식은 칸이 아니라 표에 살아서, 한 노드만 읽으면 그 단추는 영영 안 눌려 보인다.
import { isElement, isWrapper, type ElementNode, type NabiDoc } from '../schema/index.js';
import { holderLength, nodeAt, type EditEnv, type Position } from '../doc/index.js';
import { marksAt, ordered, type Selection } from '../caret/index.js';
import type { Registry, Wing } from '../wing/index.js';
import { aimNode } from './press.js';

export interface ContextGroup {
  readonly wing: Wing;
  // 이 그룹이 겨누는 노드 — 속성 하나로 읽는 값(`attr` 을 선언한 컨트롤·판의 미리 채우기)이 여기 산다.
  readonly node: ElementNode;
  // 이 wing 이 소유한 조상 전부 — **안에서 밖으로**. 상태 토큰은 이 줄기가 함께 답한다
  // (표: 칸이 'merged th', 표가 'sort'). 겨눔 하나만 읽으면 그 줄의 절반이 상태를 못 본다.
  readonly nodes: readonly ElementNode[];
}

// 마크를 읽을 자리 하나 — 접힌 캐럿이면 그 자리, 범위면 **첫 글자의 끝**이다.
// (경계 정규화가 앞 글자를 따르므로, 첫 글자의 끝에서 읽어야 그 첫 글자의 마크가 나온다.)
// 범위가 문단을 넘어가면 시작 문단의 끝을 넘지 않게 눌러 둔다.
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
  // wing 하나에 후보 여럿(표의 table·tr·td) — 순서는 **안에서 밖으로** 모은다.
  const order: Wing[] = [];
  const candidates = new Map<Wing, ElementNode[]>();

  const offer = (wing: Wing | null, node: ElementNode): void => {
    if (!wing || !wing.context) return;
    const list = candidates.get(wing);
    if (list) {
      list.unshift(node); // 바깥으로 갈수록 뒤에 선다
      return;
    }
    order.push(wing);
    candidates.set(wing, [node]);
  };

  // 1. 조상 — 바깥에서 안으로 훑되, 후보 목록은 안쪽이 앞에 오게 쌓는다.
  const path = sel.focus.path;
  for (let depth = 1; depth <= path.length; depth += 1) {
    const at = path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (!node) continue;
    offer(registry.ownerOf(node.w), node);
    // 래퍼문단이 캐럿의 홀더다 — 그 속 물건은 조상이 아니지만 이 줄이 겨누는 것이 그것이다
    // (물건 선택 = 래퍼문단 0~1 범위 — 별도 상태가 아니다).
    if (depth === path.length && isWrapper(node, env)) {
      const lump = node.ch[0];
      if (isElement(lump)) offer(registry.ownerOf(lump.w), lump);
    }
  }

  // 2. 마크 — 캐럿 자리의 마크 더미(경계 정규화의 답)를 그대로 읽는다.
  //
  // 범위를 골랐으면 **첫 글자**의 마크를 읽는다. 경계 정규화가 "캐럿은 바로 앞 글자를 따른다"
  // 이므로, 범위 시작점에서 그대로 읽으면 고른 첫 글자가 아니라 그 **앞** 글자를 보게 된다
  // 형광펜의 첫 글자부터 긁으면 형광펜 그룹이 안 뜨던 자리가 거기다.
  const [start, end] = ordered(sel);
  const at = markReadPoint(doc, start, end, env);
  for (const mark of marksAt(doc, at, env)) offer(registry.ownerOf(mark.w), mark);

  // 3. 문단 속성 — 겨눔은 **선택 시작 문단**이다(press 의 attr 판정과 같은 기준). 값이 없는
  //    wing 은 건너뛴다: 그 문단에 안 걸린 속성의 칸 줄을 세울 까닭이 없다.
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
