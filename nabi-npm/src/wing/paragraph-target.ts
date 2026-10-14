import type { EditEnv } from '../doc/index.js';
import { $setParagraphTargetResolvers, type ParagraphTargets } from '../doc/paragraph-target.js';
import type { Wing } from './contract.js';

export {
  $acceptsParagraphAttr,
  $defaultParagraphTargets,
  $selectedParagraphs,
  paragraphTargets,
} from '../doc/paragraph-target.js';
export type { ParagraphTargets } from '../doc/paragraph-target.js';

const TARGETS = Symbol('nabi.wingParagraphTargets');
interface TargetWing extends Wing {
  readonly [TARGETS]?: { readonly owner: string; readonly resolve: ParagraphTargets };
}

export function $setParagraphTargets(wing: Wing, resolve: ParagraphTargets): void {
  Object.defineProperty(wing, TARGETS, {
    value: Object.freeze({ owner: wing.w, resolve }),
    enumerable: true,
  });
}

export function $collectParagraphTargets(wings: readonly Wing[], env: EditEnv): void {
  const resolvers = wings.flatMap((wing) => {
    const hook = (wing as TargetWing)[TARGETS];
    return hook?.owner === wing.w ? [hook.resolve] : [];
  });
  $setParagraphTargetResolvers(env, resolvers);
}
