import { isCollapsed, type Selection } from '../caret/index.js';
import type { EditEnv } from '../doc/index.js';
import type { NabiDoc } from '../schema/index.js';
import type { Attach } from './contract.js';

type DeleteSelection = (doc: NabiDoc, selection: Selection, env: EditEnv, forward: boolean) => Selection | null;

const selectors = new WeakMap<Attach, DeleteSelection>();

export function $bindDeleteSelection(attach: Attach, select: DeleteSelection): void {
  selectors.set(attach, select);
}

export function $deleteSelectionAt(
  attaches: readonly Attach[],
  doc: NabiDoc,
  selection: Selection,
  env: EditEnv,
  forward: boolean,
): Selection | null {
  if (!isCollapsed(selection)) return null;
  for (const attach of attaches) {
    const selected = selectors.get(attach)?.(doc, selection, env, forward);
    if (selected) return selected;
  }
  return null;
}
