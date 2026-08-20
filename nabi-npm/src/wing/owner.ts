// 키 소유 판정 — 캐럿 자리를 품는 가장 안쪽 노드의 wing 을 찾는다 (문단이면 코어 = null).
// surface(09)의 키 파이프라인이 이 판정으로 "소유자 → 코어 → 브라우저" 순서를 세운다.
import { P, type NabiDoc } from '../schema/index.js';
import { nodeAt, type EditEnv } from '../doc/index.js';
import type { Selection } from '../caret/index.js';
import type { CommandOutcome } from '../editor/index.js';
import type { KeyIntent, OwnerAt, Wing } from './contract.js';
import type { Registry } from './registry.js';

export interface KeyOwner {
  readonly wing: Wing;
  readonly owner: OwnerAt;
}

// focus 경로의 안쪽부터 올라가며 소유 wing 을 찾는다 — 문단(래퍼문단 포함)은 코어의 것이라
// 건너뛴다. 래퍼문단 안(0/1)의 캐럿도 문단의 캐럿이므로 코어 규칙(§2.5)이 맞다.
export function keyOwnerAt(doc: NabiDoc, sel: Selection, registry: Registry): KeyOwner | null {
  const path = sel.focus.path;
  for (let depth = path.length; depth >= 1; depth -= 1) {
    const at = path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (!node || node.w === P) continue;
    const wing = registry.ownerOf(node.w);
    if (wing) return { wing, owner: { path: at, node } };
  }
  return null;
}

// 키 하나를 소유자에게 라우팅한다 — 소유자가 없거나 onKey 가 없거나 null(pass)이면 null.
// null 을 받은 쪽(09)은 코어 내장 규칙으로, 그다음 브라우저로 떨어뜨린다.
export function routeKey(
  intent: KeyIntent,
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  registry: Registry,
): CommandOutcome | null {
  const found = keyOwnerAt(doc, sel, registry);
  if (!found || !found.wing.onKey) return null;
  return found.wing.onKey(intent, doc, sel, env, found.owner);
}
