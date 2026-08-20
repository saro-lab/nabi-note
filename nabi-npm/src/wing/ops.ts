// 공용 부품 — wings 구현들이 나눠 쓰는 연산. 형제 wing import 를 없애는 자리다 (경계 시험이 지킨다).
// 전부 순수 함수이고, 반환 자리는 반환 문서에 실재한다 (doc 층 공통 계약).
import { P, isElement, runsOf, type Attrs, type ElementNode, type NabiDoc } from '../schema/index.js';
import {
  holderLength,
  holders,
  nodeAt,
  positionExists,
  sameMark,
  terminalOf,
  type EditEnv,
  type EditResult,
  type Position,
} from '../doc/index.js';
import { ordered, type Selection } from '../caret/index.js';

export { unwrapItem } from '../doc/index.js';

// --- 접힌 캐럿이 든 마크의 범위 ---------------------------------------------------------------
//
// **접힌 캐럿은 "아무것도 안 골랐다"가 아니다.** 상황 줄에 그 마크의 그룹이 떠 있다는 것은 캐럿이
// 그 마크 **안**에 서 있다는 뜻이고, 그러면 사람이 겨누고 있는 것은 그 마크가 덮은 글 전체다.
// 형광펜 한가운데를 찍고 색을 바꾸면 "형광펜"이라는 낱말 전체가 바뀌어야지, 다음에 칠 글자만
// 예약되면 안 된다 — 그것은 사람이 부탁한 적 없는 일이다.
//
// 범위를 **긁어서** 골랐으면 그 범위가 그대로 겨눔이다(이 함수를 안 부른다). 접혔을 때만 넓힌다.
//
// 캐럿이 그 마크 밖이면 null 이다 — 그때는 걸 글자가 없으므로 예약(다음 글자에 걸기)이 맞다.
export function markSpanAt(
  doc: NabiDoc,
  at: Position,
  w: string,
  env: EditEnv,
): { readonly selection: Selection; readonly mark: ElementNode } | null {
  const holder = nodeAt(doc, at.path);
  if (!holder) return null;
  const runs = runsOf(holder, terminalOf(env));
  // 런의 시작 오프셋 표 — 넓히기가 양옆으로 걷기 때문에 먼저 재 둔다.
  const starts: number[] = [];
  let total = 0;
  for (const run of runs) {
    starts.push(total);
    total += run.kind === 'text' ? run.text.length : 1;
  }
  const markIn = (index: number): ElementNode | undefined => runs[index]?.marks.find((m) => m.w === w);
  for (let i = 0; i < runs.length; i += 1) {
    const offset = starts[i] as number;
    const length = (i + 1 < runs.length ? (starts[i + 1] as number) : total) - offset;
    const mark = markIn(i);
    // 경계 정규화와 같은 규칙 — 캐럿은 **바로 앞 글자**의 마크를 따른다. 그래서 끝 오프셋도 든다.
    if (mark && at.offset > offset && at.offset <= offset + length) {
      // 같은 값의 이웃 런까지 넓힌다 — 한 마크가 여러 런으로 쪼개져 있을 수 있다(굵게가 중간에 낀 형광펜).
      //
      // 다만 **이어진 런만이다.** 홀더 전체에서 같은 값을 긁어 모으면(min/max) 마크가 끊긴 자리
      // 너머의 동색 조각까지 하나로 묶이고, 그 사이에 낀 **남의 글**(다른 색·맨글)이 통째로 겨눔에
      // 들어간다 — 초록|코랄|초록에서 첫 초록을 바꿨는데 코랄이 물드는 길이 그것이다. 사람이 "그
      // 마크"라고 여기는 것은 캐럿 자리에서 이어져 보이는 조각 하나뿐이다.
      let from = offset;
      let to = offset + length;
      for (let j = i - 1; j >= 0; j -= 1) {
        const its = markIn(j);
        if (!its || !sameMark(its, mark)) break;
        from = starts[j] as number;
      }
      for (let j = i + 1; j < runs.length; j += 1) {
        const its = markIn(j);
        if (!its || !sameMark(its, mark)) break;
        to = (j + 1 < runs.length ? (starts[j + 1] as number) : total);
      }
      return {
        selection: { anchor: { path: at.path, offset: from }, focus: { path: at.path, offset: to } },
        mark,
      };
    }
  }
  return null;
}

// 문서 처음/조각 안의 첫 캐럿 자리 — 없으면 [0].0 (빈 문단 하나는 cocoon 이 보장한다).
function firstCaretIn(doc: NabiDoc, env: EditEnv, topIndex?: number): Position {
  for (const holder of holders(doc, env)) {
    if (topIndex !== undefined && holder.path[0] !== topIndex) continue;
    return { path: holder.path, offset: 0 };
  }
  return { path: [0], offset: 0 };
}

// 물건의 **기본 차림** — 말 없이 넣은 물건이 입는 폭과 정렬이다 (old 와 같은 값).
//
// 왜 여기 사는가: 물건을 문서에 세우는 길이 하나가 아니다 — 툴바의 "그림 넣기" 가 하나, 업로드가
// 끝나고 커밋하는 길이 또 하나다. 둘이 저마다 제 숫자를 들면 "기본값" 이란 말이 거짓이 되고
// 실제로 한쪽만 고쳐진 채로 갈라져 있었다. 갈래끼리는 서로를 안 부르므로(경계 규칙) 이 값의
// 자리는 둘 다 부르는 이 층이다.
//
// 정렬이 물건이 아니라 **래퍼문단**의 것인 까닭은 다 — 물건의 정렬은 상황 줄이 아니라
// 툴바가 맡고, 툴바의 겨눔은 캐럿이 든 최상위 문단이다.
export const LUMP_DEFAULT_WIDTH = '60';
export const LUMP_DEFAULT_ALIGN = 'c';

// 물건 하나를 캐럿 자리의 최상위에 세운다 — 래퍼문단을 입혀서.
// 캐럿의 최상위 문단이 빈 문단이면 **교체**된다(규칙: 빈 문단 + 단일 물건 = 교체
// 같은 노드의 자식만 갈리고 정렬(a)·_id 가 산다). 아니면 그 최상위 다음에 선다.
//
// `wrap` 은 **래퍼문단이 처음 입는 속성**이다 — 그림이 가운데로 서는 자리가 여기다. 물건의
// 정렬은 물건이 아니라 래퍼문단이 든다(plan 의 결정: 물건의 정렬은 툴바가 맡고 겨눔은 래퍼문단)
// 그래서 "가운데 정렬된 그림" 이란 곧 "가운데 정렬된 문단 안의 그림" 이다.
// 이미 서 있던 빈 문단을 교체하는 길에서는 **그 문단이 들고 있던 것이 이긴다** — 사람이 왼쪽으로
// 맞춰 둔 자리에 그림을 넣었는데 가운데로 튕기면, 넣은 적 없는 결정이 끼어든 것이 된다.
export function insertLump(
  doc: NabiDoc,
  caret: Position,
  lump: ElementNode,
  _env: EditEnv,
  wrap?: Attrs,
): EditResult {
  const top = caret.path[0] ?? doc.length - 1;
  const node = doc[top];
  const empty =
    node !== undefined && node.w === P && node.ch.length === 0;
  const dressed = (own: Attrs | undefined): Attrs | undefined => {
    const a = { ...(wrap ?? {}), ...(own ?? {}) };
    return Object.keys(a).length > 0 ? a : undefined;
  };

  if (empty && node) {
    const a = dressed(node.a);
    const wrapper: ElementNode = {
      w: P,
      ch: [lump],
      ...(a ? { a } : {}),
      ...(node._id !== undefined ? { _id: node._id } : {}),
    };
    const next = [...doc.slice(0, top), wrapper, ...doc.slice(top + 1)] as NabiDoc;
    return { doc: next, caret: { path: [top], offset: 1 } };
  }

  const at = top + 1;
  const a = dressed(undefined);
  const wrapper: ElementNode = { w: P, ch: [lump], ...(a ? { a } : {}) };
  const next = [...doc.slice(0, at), wrapper, ...doc.slice(at)] as NabiDoc;
  return { doc: next, caret: { path: [at], offset: 1 } };
}

// 최상위의 래퍼문단(물건) 하나를 통째로 걷는다 — 캐럿은 앞 문단의 끝(없으면 다음 문단의 처음)
// 문서가 비면 빈 문단 하나가 선다 (의 삭제 착지 규칙과 같은 결).
export function removeLump(doc: NabiDoc, topIndex: number, env: EditEnv): EditResult {
  const rest = [...doc.slice(0, topIndex), ...doc.slice(topIndex + 1)] as NabiDoc;
  if (rest.length === 0) {
    const empty: ElementNode = { w: P, ch: [] };
    return { doc: [empty], caret: { path: [0], offset: 0 } };
  }
  // 앞쪽에서 가장 가까운 홀더의 끝 — 없으면 문서의 첫 홀더의 처음.
  let landing: Position | null = null;
  for (const holder of holders(rest, env)) {
    if ((holder.path[0] as number) < topIndex) {
      landing = { path: holder.path, offset: holderLength(holder.node, env) };
    } else if (!landing) {
      landing = { path: holder.path, offset: 0 };
      break;
    } else break;
  }
  return { doc: rest, caret: landing ?? { path: [0], offset: 0 } };
}

// 감싸기 토글 — 선택이 걸친 최상위 블록들을 컨테이너 하나로 감싸거나(래퍼문단을 입고 선다)
// 이미 전부 그 컨테이너(의 래퍼)면 속의 블록들을 제자리에 편다. quote 류가 그대로 쓴다.
export function toggleWrap(doc: NabiDoc, sel: Selection, containerW: string, env: EditEnv): EditResult {
  const [start, end] = ordered(sel);
  const a = (start.path[0] ?? 0) as number;
  const b = (end.path[0] ?? a) as number;
  const covered = doc.slice(a, b + 1);

  const wrapped = covered.every((node) => {
    const lump = node.ch[0];
    return node.w === P && node.ch.length === 1 && isElement(lump) && lump.w === containerW;
  });

  if (wrapped && covered.length > 0) {
    // 푼다 — 컨테이너 속 블록들이 제자리에 선다.
    const inner: ElementNode[] = [];
    for (const node of covered) {
      const lump = node.ch[0] as ElementNode;
      for (const child of lump.ch) if (isElement(child)) inner.push(child);
    }
    const blocks = inner.length > 0 ? inner : [{ w: P, ch: [] } as ElementNode];
    const next = [...doc.slice(0, a), ...blocks, ...doc.slice(b + 1)] as NabiDoc;
    return { doc: next, caret: firstCaretIn(next, env, a) };
  }

  // 감싼다 — 걸친 블록 전부가 컨테이너의 속이 되고, 컨테이너는 래퍼문단을 입는다.
  const container: ElementNode = { w: containerW, ch: covered };
  const wrapper: ElementNode = { w: P, ch: [container] };
  const next = [...doc.slice(0, a), wrapper, ...doc.slice(b + 1)] as NabiDoc;
  const caret = firstCaretIn(next, env, a);
  return { doc: next, caret: positionExists(next, caret, env) ? caret : { path: [a], offset: 0 } };
}

// 최상위 인덱스의 노드 — wings 가 자기 물건을 찾을 때 쓰는 잔 도우미.
export function topNodeAt(doc: NabiDoc, path: readonly number[]): ElementNode | null {
  return nodeAt(doc, [path[0] ?? 0]);
}
