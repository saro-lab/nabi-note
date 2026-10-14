import { isWrapper, P, takesAlign, type NabiDoc } from '../schema/index.js';
import {
  comparePositions,
  holderLength,
  holders,
  nodeAt,
  type EditEnv,
  type HolderAt,
  type Position,
} from './position.js';
import type { DocRange } from './range.js';

export type ParagraphTargets = (
  doc: NabiDoc,
  selection: DocRange,
  key: string,
  env: EditEnv,
) => readonly HolderAt[] | undefined;

const TARGETS = Symbol('nabi.paragraphTargets');
type TargetEnv = EditEnv & { readonly [TARGETS]?: readonly ParagraphTargets[] };

export function $setParagraphTargetResolvers(env: EditEnv, resolvers: readonly ParagraphTargets[]): void {
  if (resolvers.length) Object.defineProperty(env, TARGETS, { value: Object.freeze([...resolvers]) });
}

export function $copyParagraphTargets(source: EditEnv, target: EditEnv): void {
  const resolvers = (source as TargetEnv)[TARGETS];
  if (resolvers) $setParagraphTargetResolvers(target, resolvers);
}

const ordered = (selection: DocRange): readonly [Position, Position] =>
  comparePositions(selection.anchor, selection.focus) <= 0
    ? [selection.anchor, selection.focus]
    : [selection.focus, selection.anchor];

export function $acceptsParagraphAttr(target: HolderAt, key: string, env: EditEnv): boolean {
  return target.node.w === P && (key === 'a' ? takesAlign(target.node, env) : !isWrapper(target.node, env));
}

export function $selectedParagraphs(doc: NabiDoc, selection: DocRange, env: EditEnv): readonly HolderAt[] {
  const [start, end] = ordered(selection);
  if (comparePositions(start, end) === 0) {
    const node = nodeAt(doc, start.path);
    return node?.w === P ? [{ path: start.path, node }] : [];
  }
  return holders(doc, env).filter(
    ({ path, node }) =>
      node.w === P &&
      comparePositions({ path, offset: holderLength(node, env) }, start) >= 0 &&
      comparePositions({ path, offset: 0 }, end) <= 0,
  );
}

export function $defaultParagraphTargets(
  doc: NabiDoc,
  selection: DocRange,
  key: string,
  env: EditEnv,
): readonly HolderAt[] {
  if (key !== 'a')
    return $selectedParagraphs(doc, selection, env).filter((target) => $acceptsParagraphAttr(target, key, env));
  const [start, end] = ordered(selection);
  const from = start.path[0];
  const to = end.path[0];
  if (from === undefined || to === undefined) return [];
  const targets: HolderAt[] = [];
  for (let index = from; index <= to; index += 1) {
    const node = doc[index];
    const target = node ? { path: [index], node } : null;
    if (target && $acceptsParagraphAttr(target, key, env)) targets.push(target);
  }
  return targets;
}

export function paragraphTargets(doc: NabiDoc, selection: DocRange, key: string, env: EditEnv): readonly HolderAt[] {
  for (const resolve of (env as TargetEnv)[TARGETS] ?? []) {
    const targets = resolve(doc, selection, key, env);
    if (targets !== undefined) return targets;
  }
  return $defaultParagraphTargets(doc, selection, key, env);
}
