// 눌림 판정 — **한 벌**이다. 옛 판은 두 갈래였고(부검 §1-7), 툴바와 상황 줄이 서로 다른 답을
// 내놓는 자리가 거기서 났다. 여기 함수 하나가 툴바·상황 줄·힌트의 유일한 답이다.
//
// 갈래별 답 (wing 의 `place` 가 곧 갈래다):
//   mark      캐럿 자리의 마크 더미(caret 의 `marksAt`) + 예약 상태. 값은 wing 의 `currentValue`
//   attr      캐럿 문단의 attrs — `currentValue` 한 길
//   void·container  캐럿 경로의 조상 중 그 wing 소유 노드 — 값은 그 노드의 `currentValue`
//   tool      눌리지 않는다 (문서에 흔적이 없다)
//
// **값은 상태 토큰이다** (10 판단): `currentValue` 는 공백으로 이은 낱말 더미일 수 있다
// (표의 칸은 'merged th'). 그래서 "값이 같은가"가 아니라 "토큰을 품는가"로 읽는다.
import type { ElementNode, NabiDoc } from '../schema/index.js';
import { nodeAt, type EditEnv } from '../doc/index.js';
import { marksAt, ordered, type ArmedState, type Selection } from '../caret/index.js';
import type { Registry, Wing } from '../wing/index.js';

export interface PressEnv {
  readonly doc: NabiDoc;
  readonly sel: Selection;
  readonly env: EditEnv;
  readonly registry: Registry;
  // 예약 상태 — 접힌 캐럿에서 버튼만 누른 순간의 답이다 (①). 없으면 안 본다.
  readonly armed?: ArmedState;
}

export interface Pressed {
  readonly on: boolean;
  // `currentValue` 의 답 그대로 — 상태 토큰 더미다. 값 없는 눌림이면 undefined.
  readonly value?: string;
}

const OFF: Pressed = { on: false };

// 상태 토큰 하나가 값에 들어 있는가 — 공백으로 갈라 낱말 단위로 본다.
export function hasToken(value: string | undefined, token: string): boolean {
  if (value === undefined || token === '') return false;
  return value.split(/\s+/).includes(token);
}

// 캐럿이 든 조상 중 이 wing 소유의 노드들 — **안에서 밖으로**. 컨테이너는 자기 노드 말고
// 부품(표의 칸·행)도 소유하므로 여럿이 나올 수 있다.
export function ownedAncestors(
  doc: NabiDoc,
  path: readonly number[],
  wing: Wing,
  registry: Registry,
): readonly ElementNode[] {
  const out: ElementNode[] = [];
  for (let depth = path.length; depth >= 1; depth -= 1) {
    const node = nodeAt(doc, path.slice(0, depth));
    if (!node) continue;
    if (registry.ownerOf(node.w) === wing) out.push(node);
  }
  return out;
}

export function ownedAncestor(
  doc: NabiDoc,
  path: readonly number[],
  wing: Wing,
  registry: Registry,
): ElementNode | null {
  return ownedAncestors(doc, path, wing, registry)[0] ?? null;
}

// 줄기 하나의 상태 토큰 — 후보들(안→밖)이 답한 값을 **모두 합친다.**
//
// 왜 한 노드로 안 되나: 한 wing 이 여러 급의 노드를 소유하면(표는 표·행·칸을 다 소유한다)
// 상태도 급마다 나뉘어 산다. 정렬 표식은 **표**에 살고 병합·제목은 **칸**에 사는데, 상황 줄의
// 단추 열 개는 한 줄에 나란히 선다. 겨눔 하나만 읽으면 칸이 답하는 순간 표는 쳐다도 안 보게 되어
// 그 줄의 절반이 제 상태를 영영 못 본다. 값이 애초에 "공백으로 이은 낱말 더미"이고 판정도
// `hasToken` 이라, 합치는 것이 이 설계와 같은 결이다.
//
// 같은 이름의 노드가 겹치면 **안쪽 하나만** 센다 — 접기 속 접기에서 바깥의 'open' 과 안쪽의
// 'shut' 이 함께 실리면 토글 하나가 켜진 동시에 꺼진 것으로 보인다. 캐럿이 든 것은 안쪽이므로
// 같은 급이 둘이면 안쪽이 말한다. 급이 다르면(표와 칸) 서로 다른 것을 말하는 것이라 함께 실린다.
export function stackValue(candidates: readonly ElementNode[], wing: Wing): string | undefined {
  const tokens: string[] = [];
  const said = new Set<string>();
  for (const node of candidates) {
    if (said.has(node.w)) continue;
    said.add(node.w);
    const value = wing.currentValue?.(node);
    if (value === undefined) continue;
    for (const token of value.split(/\s+/)) {
      if (token !== '' && !tokens.includes(token)) tokens.push(token);
    }
  }
  return tokens.length > 0 ? tokens.join(' ') : undefined;
}

// 이 wing 이 겨누는 노드 하나 — 후보들(안→밖) 중 **자기 값을 답하는 첫 노드**다.
// 표는 칸이 답하고(‘merged th’), 접기는 상자가 답한다(‘open’) — 규칙 하나가 둘을 다 맞힌다.
// 아무도 안 답하면 가장 안쪽이 겨눔이다(값이 아직 없다는 뜻이지 자리가 없다는 뜻이 아니다).
export function aimNode(candidates: readonly ElementNode[], wing: Wing): ElementNode | null {
  if (candidates.length === 0) return null;
  for (const node of candidates) {
    if (wing.currentValue?.(node) !== undefined) return node;
  }
  return candidates[0] ?? null;
}

// 캐럿 자리의 마크 중 이 이름의 것 — 예약(양수)이 있으면 그것이 이긴다(아직 문서엔 없다).
function markAt(env: PressEnv, w: string): { readonly on: boolean; readonly node?: ElementNode } {
  const armed = env.armed?.peek();
  const plus = armed?.plus.find((mark) => mark.w === w);
  if (plus) return { on: true, node: plus };
  // 음수 예약 — 다음 입력은 이 마크 밖에 선다. 눌림도 꺼진 것으로 보여야 앞뒤가 맞는다.
  if (armed?.minus.includes(w)) return { on: false };
  const [start] = ordered(env.sel);
  const found = marksAt(env.doc, start, env.env).find((mark) => mark.w === w);
  return found ? { on: true, node: found } : { on: false };
}

// 이 wing 이 지금 눌려 있는가 — 툴바·상황 줄·힌트가 함께 쓰는 유일한 문.
export function pressedOf(env: PressEnv, w: string): Pressed {
  const wing = env.registry.wingOf(w);
  if (!wing) return OFF;

  if (wing.place === 'tool') return OFF;

  if (wing.place === 'mark') {
    const found = markAt(env, w);
    if (!found.on) return OFF;
    const value = found.node ? wing.currentValue?.(found.node) : undefined;
    return value === undefined ? { on: true } : { on: true, value };
  }

  if (wing.place === 'attr') {
    // 문단 속성은 선택 시작 문단이 겨눔이다 — doc 의 `setParagraphAttr` 와 같은 기준.
    const [start] = ordered(env.sel);
    const node = nodeAt(env.doc, [start.path[0] as number]);
    if (!node) return OFF;
    const value = wing.currentValue?.(node);
    return value === undefined ? OFF : { on: true, value };
  }

  // void·container — 캐럿을 품는 조상이 곧 눌림이다. 값은 그 조상들이 **함께** 답한다
  // (표의 정렬 표식은 표에, 병합·제목은 칸에 산다 — 둘은 같은 줄의 단추다).
  const candidates = ownedAncestors(env.doc, env.sel.focus.path, wing, env.registry);
  const node = aimNode(candidates, wing);
  if (!node) return OFF;
  const value = stackValue(candidates, wing);
  return value === undefined ? { on: true } : { on: true, value };
}

// 값 하나가 지금 눌린 값인가 — 값 마크의 색 칸, 제목의 레벨 칸이 묻는 질문.
export function pressedValue(env: PressEnv, w: string, value: string | number): boolean {
  const state = pressedOf(env, w);
  return state.on && hasToken(state.value, String(value));
}

// 컨트롤 하나의 지금 값을 읽는다 — 상황 줄이 쓰는 그 길 하나.
// `attr` 이 선언돼 있으면 **겨눔 노드**의 그 attr(값 하나가 한 노드에 산다), 아니면 줄기가
// 합쳐 답한 상태 토큰(`stackValue`)이다.
export function controlValueOf(node: ElementNode, stack: string | undefined, attr?: string): string | undefined {
  if (attr !== undefined) {
    const raw = node.a?.[attr];
    return raw === undefined ? undefined : String(raw);
  }
  return stack;
}

// 마크 노드 하나 짓기 — 마크 버튼이 코어의 `toggleMark` 로 보낼 인자다.
export function markNode(w: string): ElementNode {
  return { w, ch: [] };
}
