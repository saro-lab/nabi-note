import { parseNodes } from '../html/parse.js';
import { $importDoc } from '../html/import.js';
import { cocoon } from '../schema/cocoon.js';
import { $isKnownType } from '../schema/env.js';
import { $guarded, $snapshotNodes } from '../schema/json.js';
import { canonicalTextLines } from '../schema/text.js';
import type { NabiDoc, NabiNode } from '../schema/types.js';
import type { Registry, StoredHtmlOptions } from '../wing/index.js';
import { mergeNodeKey } from './units.js';

function canonicalNodes(nodes: readonly NabiNode[]): NabiNode[] {
  const result: NabiNode[] = [];
  const push = (node: NabiNode): void => {
    if (node === '') return;
    const last = result[result.length - 1];
    if (typeof last === 'string' && typeof node === 'string') result[result.length - 1] = last + node;
    else result.push(node);
  };
  for (const node of nodes) {
    if (typeof node === 'string') {
      canonicalTextLines(node).forEach((line, index) => {
        if (index > 0) push({ w: 'br', ch: [] });
        push(line);
      });
    } else {
      push(node.a ? { w: node.w, a: node.a, ch: canonicalNodes(node.ch) } : { w: node.w, ch: canonicalNodes(node.ch) });
    }
  }
  return result;
}

function knownNodes(nodes: readonly NabiNode[], registry: Registry): boolean {
  return nodes.every(
    (node) => typeof node === 'string' || ($isKnownType(registry.env, node.w) && knownNodes(node.ch, registry)),
  );
}

export function normalizeMergeInput(input: unknown, registry: Registry, options?: StoredHtmlOptions): NabiDoc | null {
  return $guarded('merge input', null, () => {
    if (typeof input === 'string') {
      if (typeof DOMParser === 'undefined') return null;
      // 빠진 날개의 노드가 정규화에서 지워지기 전에 확인한다.
      // Check missing-wing nodes before closed-schema normalization can erase them.
      const imported = $importDoc(parseNodes(input), {
        env: { ...registry.env },
        ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
        ...(registry.claim ? { claim: registry.claim } : {}),
      });
      return imported && knownNodes(imported, registry) ? cocoon(imported, registry.env) : null;
    }
    const raw = $snapshotNodes(input);
    if (!raw || !knownNodes(raw, registry)) return null;
    const clean = canonicalNodes(raw);
    const doc = cocoon(clean, registry.env);
    if (clean.length === 0) return doc;
    return JSON.stringify(clean.map(mergeNodeKey)) === JSON.stringify(doc.map(mergeNodeKey)) ? doc : null;
  });
}
