import type { Selection } from '../caret/index.js';
import type { ElementNode, NabiDoc } from '../schema/index.js';
import type { Wing } from './contract.js';

export interface $ContextState {
  readonly node?: ElementNode;
  readonly values?: Readonly<Record<string, string | undefined>>;
  readonly hidden?: readonly string[];
}

type Resolver = (doc: NabiDoc, selection: Selection) => $ContextState;

const CONTEXT_STATE = Symbol('nabi.contextState');

interface StatefulWing extends Wing {
  readonly [CONTEXT_STATE]?: { readonly owner: string; readonly resolve: Resolver };
}

export function $setContextState(wing: Wing, resolve: Resolver): void {
  Object.defineProperty(wing, CONTEXT_STATE, {
    value: Object.freeze({ owner: wing.w, resolve }),
    enumerable: true,
  });
}

export function $contextState(wing: Wing, doc: NabiDoc, selection: Selection): $ContextState | undefined {
  const state = (wing as StatefulWing)[CONTEXT_STATE];
  return state?.owner === wing.w ? state.resolve(doc, selection) : undefined;
}
