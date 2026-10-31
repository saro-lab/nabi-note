import { selectObject } from '../caret/index.js';
import { holderLength, nodeAt, replaceAt, type Position } from '../doc/index.js';
import type { Command } from '../editor/index.js';
import { P, isElement, isWrapper, type ElementNode } from '../schema/index.js';

const startsWith = (path: readonly number[], prefix: readonly number[]): boolean =>
  path.length >= prefix.length && prefix.every((part, index) => path[index] === part);

export function moveMediaOp(sourcePath: readonly number[], target: Position): Command {
  return (doc, _selection, _args, env) => {
    const source = nodeAt(doc, sourcePath);
    const media = source?.ch[0];
    const destination = nodeAt(doc, target.path);
    if (
      !source ||
      !isWrapper(source, env) ||
      !isElement(media) ||
      (media.w !== 'img' && media.w !== 'youtube') ||
      destination?.w !== P ||
      !Number.isInteger(target.offset) ||
      target.offset < 0 ||
      target.offset > Math.max(1, holderLength(destination, env)) ||
      startsWith(sourcePath, target.path) ||
      startsWith(target.path, sourcePath)
    )
      return null;

    const sourceParentPath = sourcePath.slice(0, -1);
    const targetParentPath = target.path.slice(0, -1);
    const sourceParent = sourceParentPath.length ? nodeAt(doc, sourceParentPath) : null;
    const targetParent = targetParentPath.length ? nodeAt(doc, targetParentPath) : null;
    if (
      (sourceParentPath.length && (!sourceParent || !env.blockHolders.has(sourceParent.w))) ||
      (targetParentPath.length && (!targetParent || !env.blockHolders.has(targetParent.w)))
    )
      return null;

    const sourceIndex = sourcePath[sourcePath.length - 1];
    const targetIndex = target.path[target.path.length - 1];
    const after = target.offset > 0;
    const sameParent =
      sourceParentPath.length === targetParentPath.length && startsWith(sourceParentPath, targetParentPath);
    if (sameParent && sourceIndex === targetIndex + (after ? 1 : -1)) return null;

    const replacement: readonly ElementNode[] = sourceParent?.ch.length === 1 ? [{ w: P, ch: [] }] : [];
    const without = replaceAt(doc, sourcePath, replacement);
    const shiftedTarget = [...target.path];
    const depth = sourcePath.length - 1;
    if (
      replacement.length === 0 &&
      startsWith(target.path, sourceParentPath) &&
      (shiftedTarget[depth] as number) > sourceIndex
    )
      shiftedTarget[depth] -= 1;

    const targetNode = nodeAt(without, shiftedTarget);
    if (!targetNode) return null;
    const next = replaceAt(without, shiftedTarget, after ? [targetNode, source] : [source, targetNode]);
    const movedPath = [...shiftedTarget];
    if (after) movedPath[movedPath.length - 1] += 1;
    return { doc: next, selection: selectObject(movedPath) };
  };
}
