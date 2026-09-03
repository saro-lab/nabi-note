// 눌림 판정은 wing의 place가 곧 갈래다: mark는 캐럿 자리의 마크 더미+예약 상태, attr는 캐럿 문단의 속성, void·container는 캐럿을 품는 조상 노드, tool은 늘 꺼짐이다. 값은 공백으로 이은 상태 토큰 더미라 "같다"가 아니라 "품는가"로 읽는다.
// A wing's `place` decides how pressed state is read: mark uses the caret's mark stack plus armed state, attr uses the caret paragraph's attribute, void/container uses an ancestor node owning the caret, tool is never pressed. Values are space-joined token stacks matched by "contains," not "equals."
import type { ElementNode, NabiDoc } from '../schema/index.js';
import { nodeAt, type EditEnv } from '../doc/index.js';
import { marksAt, ordered, type ArmedState, type Selection } from '../caret/index.js';
import type { Registry, Wing } from '../wing/index.js';

export interface PressEnv {
  readonly doc: NabiDoc;
  readonly sel: Selection;
  readonly env: EditEnv;
  readonly registry: Registry;
  // 예약 상태 — 접힌 캐럿에서 버튼만 누른 순간의 답이다. 없으면 안 본다.
  // Armed state — the answer at the instant a button was pressed on a collapsed caret. Absent means not consulted.
  readonly armed?: ArmedState;
}

export interface Pressed {
  readonly on: boolean;
  // `currentValue` 의 답 그대로 — 상태 토큰 더미다. 값 없는 눌림이면 undefined.
  // Exactly what `currentValue` reports — a token stack. Undefined for a pressed state with no value.
  readonly value?: string;
}

const OFF: Pressed = { on: false };

// 상태 토큰 하나가 값에 들어 있는가 — 공백으로 갈라 낱말 단위로 본다.
// Whether one token is present in the value — split on whitespace and checked word by word.
export function hasToken(value: string | undefined, token: string): boolean {
  if (value === undefined || token === '') return false;
  return value.split(/\s+/).includes(token);
}

// 캐럿이 든 조상 중 이 wing 소유의 노드들 — 안에서 밖으로. 컨테이너는 자기 노드 말고 부품(표의 칸·행)도 소유하므로 여럿이 나올 수 있다.
// Ancestors of the caret owned by this wing, inside-out. A container can own parts too (a table's cells and rows), so several can come back.
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

// 후보(안→밖)가 답한 값을 모두 합친다 — 한 wing이 여러 급을 소유하면(표=표·행·칸) 상태도 급마다 나뉘어 살아서, 겨눔 하나만 읽으면 절반이 제 상태를 못 본다. 같은 이름 노드가 겹치면 안쪽 하나만 센다(접기 속 접기에서 바깥 open·안쪽 shut이 함께 실리면 안 된다).
// Merges the values every candidate (inside-out) reports — when a wing owns several node levels (a table owns table/row/cell), state lives split across them, so reading only the target node would blind half the row to its own state. When the same node name repeats, only the innermost counts (nested folds must not report both the outer's "open" and the inner's "shut" at once).
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

// 이 wing이 겨누는 노드 하나 — 후보들(안→밖) 중 자기 값을 답하는 첫 노드다(표는 칸이, 접기는 상자가 답한다). 아무도 안 답하면 가장 안쪽이 겨눔이다(값이 아직 없다는 뜻이지 자리가 없다는 뜻이 아니다).
// The single node this wing targets — the first candidate (inside-out) that reports its own value (a table's cell, a fold's box). If none do, the innermost is the target anyway (meaning no value yet, not no target).
export function aimNode(candidates: readonly ElementNode[], wing: Wing): ElementNode | null {
  if (candidates.length === 0) return null;
  for (const node of candidates) {
    if (wing.currentValue?.(node) !== undefined) return node;
  }
  return candidates[0] ?? null;
}

// 캐럿 자리의 마크 중 이 이름의 것 — 예약(양수)이 있으면 그것이 이긴다(아직 문서엔 없다).
// This mark at the caret, by name — an armed "plus" wins if present (not yet in the document).
function markAt(env: PressEnv, w: string): { readonly on: boolean; readonly node?: ElementNode } {
  const armed = env.armed?.peek();
  const plus = armed?.plus.find((mark) => mark.w === w);
  if (plus) return { on: true, node: plus };
  // 음수 예약 — 다음 입력은 이 마크 밖에 선다. 눌림도 꺼진 것으로 보여야 앞뒤가 맞는다.
  // An armed "minus" — the next input lands outside this mark, so pressed state must show off too, for consistency.
  if (armed?.minus.includes(w)) return { on: false };
  const [start] = ordered(env.sel);
  const found = marksAt(env.doc, start, env.env).find((mark) => mark.w === w);
  return found ? { on: true, node: found } : { on: false };
}

// 이 wing이 지금 눌려 있는가 — 툴바·상황 줄·힌트가 함께 쓰는 유일한 문.
// Whether this wing is currently pressed — the one door shared by the toolbar, context row, and hints.
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
    // 문단 속성은 선택 시작 문단이 겨눔이다 — doc의 setParagraphAttr와 같은 기준.
    // A paragraph attr targets the selection's starting paragraph — same rule as doc's setParagraphAttr.
    const [start] = ordered(env.sel);
    const node = nodeAt(env.doc, [start.path[0] as number]);
    if (!node) return OFF;
    const value = wing.currentValue?.(node);
    return value === undefined ? OFF : { on: true, value };
  }

  // void·container — 캐럿을 품는 조상이 곧 눌림이다. 값은 그 조상들이 함께 답한다(표의 정렬 표식은 표에, 병합·제목은 칸에 산다 — 둘은 같은 줄의 단추다).
  // void/container — the ancestor holding the caret is what's pressed; its value comes from all of them together (a table's sort marker lives on the table, merge/heading on the cell — both are buttons on the same row).
  const candidates = ownedAncestors(env.doc, env.sel.focus.path, wing, env.registry);
  const node = aimNode(candidates, wing);
  if (!node) return OFF;
  const value = stackValue(candidates, wing);
  return value === undefined ? { on: true } : { on: true, value };
}

// 값 하나가 지금 눌린 값인가 — 값 마크의 색 칸, 제목의 레벨 칸이 묻는 질문.
// Whether a given value is the currently-pressed one — what a value mark's color swatch or a heading's level cell asks.
export function pressedValue(env: PressEnv, w: string, value: string | number): boolean {
  const state = pressedOf(env, w);
  return state.on && hasToken(state.value, String(value));
}

// 컨트롤 하나의 지금 값을 읽는다 — attr이 선언돼 있으면 겨눔 노드의 그 attr, 아니면 줄기가 합쳐 답한 상태 토큰(stackValue)이다.
// Reads a control's current value — the target node's attr when declared, otherwise the chain's merged state token (stackValue).
export function controlValueOf(node: ElementNode, stack: string | undefined, attr?: string): string | undefined {
  if (attr !== undefined) {
    const raw = node.a?.[attr];
    return raw === undefined ? undefined : String(raw);
  }
  return stack;
}

// 마크 노드 하나 짓기 — 마크 버튼이 코어의 `toggleMark` 로 보낼 인자다.
// Builds one mark node — the argument a mark button sends to the core's `toggleMark`.
export function markNode(w: string): ElementNode {
  return { w, ch: [] };
}
