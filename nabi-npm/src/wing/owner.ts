// 키 소유 판정 — 캐럿 자리를 품는 가장 안쪽 노드의 wing을 찾는다(문단이면 코어 = null).
// Resolves key ownership by finding the innermost node's wing at the caret; a paragraph means the core owns it (null).
import { P, type NabiDoc } from '../schema/index.js';
import { documentIndex, type EditEnv } from '../doc/index.js';
import type { Selection } from '../caret/index.js';
import type { CommandOutcome } from '../editor/index.js';
import type { KeyIntent, OwnerAt, Wing } from './contract.js';
import type { Registry } from './registry.js';

export interface KeyOwner {
  readonly wing: Wing;
  readonly owner: OwnerAt;
}

// focus 경로의 안쪽부터 올라가며 소유 wing을 찾는다 — 문단(래퍼문단 포함)은 코어 소관이라 건너뛴다.
// Walks up from the focus path's innermost node; paragraphs (including wrapper paragraphs) belong to the core, so they're skipped.
export function keyOwnerAt(doc: NabiDoc, sel: Selection, registry: Registry): KeyOwner | null {
  const index = documentIndex(doc, registry.env);
  const path = sel.focus.path;
  for (let depth = path.length; depth >= 1; depth -= 1) {
    const at = path.slice(0, depth);
    const node = index.at(at)?.node;
    if (!node || node.w === P) continue;
    const wing = registry.ownerOf(node.w);
    if (wing) return { wing, owner: { path: at, node } };
  }
  return null;
}

// 키 하나를 소유자에게 라우팅한다 — 소유자가 없거나 onKey가 없거나 null(pass)이면 null.
// Routes one key to its owner; returns null if there's no owner, no onKey, or the owner passes.
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
