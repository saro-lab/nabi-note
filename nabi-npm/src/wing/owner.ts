// 키 소유 판정 — 캐럿 자리를 품는 가장 안쪽 노드의 wing을 찾는다(문단이면 코어 = null).
// Resolves key ownership by finding the innermost node's wing at the caret; a paragraph means the core owns it (null).
import { P, isWrapper, type NabiDoc } from '../schema/index.js';
import { documentIndex, isolationPath, nodeAt, type EditEnv } from '../doc/index.js';
import { isCollapsed, isObjectSelection, type Selection } from '../caret/index.js';
import type { CommandOutcome } from '../editor/index.js';
import type { KeyIntent, OwnerAt, Wing } from './contract.js';
import type { Registry } from './registry.js';
import { blocksBoundaryEscape, exitWrapper } from './ops.js';

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

export function routeKey(
  intent: KeyIntent,
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  registry: Registry,
): CommandOutcome | null {
  const found = keyOwnerAt(doc, sel, registry);
  if (intent.key === 'arrow' && (intent.dir === 'up' || intent.dir === 'down') && !intent.shift) {
    const path = sel.focus.path;
    const holder = nodeAt(doc, path);
    if (holder && isWrapper(holder, env) && (isCollapsed(sel) || isObjectSelection(doc, sel, env))) {
      return exitWrapper(doc, [...path, 0], intent.dir, env);
    }
    const handled = found?.wing.onKey?.(intent, doc, sel, env, found.owner);
    if (handled) return handled;
    for (let depth = path.length; depth > 1; depth--) {
      const at = path.slice(0, depth);
      const node = nodeAt(doc, at);
      if (node && env.lumps.has(node.w)) {
        return blocksBoundaryEscape(intent, doc, sel, env, { path: at, node });
      }
    }
    return null;
  }
  const boundary = isolationPath(doc, sel.focus.path, env);
  if (!boundary) return found?.wing.onKey?.(intent, doc, sel, env, found.owner) ?? null;
  const visited = new Set<Wing>();
  for (let depth = sel.focus.path.length; depth >= boundary.length; depth -= 1) {
    const path = sel.focus.path.slice(0, depth);
    const node = nodeAt(doc, path);
    if (!node || node.w === P) continue;
    const wing = registry.ownerOf(node.w);
    if (!wing || visited.has(wing)) continue;
    visited.add(wing);
    const result = wing.onKey?.(intent, doc, sel, env, { path, node });
    if (result) return result;
  }
  return null;
}
