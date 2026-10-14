import { isElement, isWrapper } from '../../schema/index.js';
import { holders, nodeAt } from '../../doc/index.js';
import { ordered } from '../../caret/index.js';
import {
  $acceptsParagraphAttr,
  $defaultParagraphTargets,
  $selectedParagraphs,
  type ParagraphTargets,
} from '../../wing/paragraph-target.js';
import { cellCtxOf, cellPath, selectionBox } from './selection.js';

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);
const within = (path: readonly number[], parent: readonly number[]): boolean =>
  path.length > parent.length && parent.every((value, index) => value === path[index]);

export const tableParagraphTargets: ParagraphTargets = (doc, selection, key, env) => {
  const [start, end] = ordered(selection);
  if (samePath(start.path, end.path)) {
    const node = nodeAt(doc, start.path);
    const item = node?.ch[0];
    if (node && isWrapper(node, env) && isElement(item) && item.w === 'table')
      return key === 'a' && (start.offset === 0 || start.offset === 1) && (end.offset === 0 || end.offset === 1)
        ? [{ path: start.path, node }]
        : [];
  }
  const anchor = cellCtxOf(doc, selection.anchor);
  const focus = cellCtxOf(doc, selection.focus);
  if (anchor || focus) {
    if (!anchor || !focus || !samePath(anchor.tablePath, focus.tablePath)) return [];
    const box = selectionBox(doc, selection);
    if (box) {
      const targets = holders(doc, env);
      return box.cells.flatMap((cell) => {
        if (key === 'h' && cell.cell.a?.['th'] === 1) return [];
        const path = cellPath(box.tablePath, cell);
        return targets.filter((target) => within(target.path, path) && $acceptsParagraphAttr(target, key, env));
      });
    }
    if (key === 'h' && anchor.cell.cell.a?.['th'] === 1) return [];
    const path = cellPath(anchor.tablePath, anchor.cell);
    return $selectedParagraphs(doc, selection, env).filter(
      (target) => within(target.path, path) && $acceptsParagraphAttr(target, key, env),
    );
  }

  const targets = $defaultParagraphTargets(doc, selection, key, env);
  let relevant = false;
  const filtered = targets.filter((target) => {
    if (cellCtxOf(doc, { path: target.path, offset: 0 })) {
      relevant = true;
      return false;
    }
    if (!isWrapper(target.node, env)) return true;
    const item = target.node.ch[0];
    if (!isElement(item) || item.w !== 'table') return true;
    relevant = true;
    return (
      samePath(start.path, target.path) && samePath(end.path, target.path) && start.offset === 0 && end.offset === 1
    );
  });
  return relevant ? filtered : undefined;
};
