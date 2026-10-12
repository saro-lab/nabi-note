import { isElement, type NabiDoc } from '../schema/index.js';
import { nodeAt, replaceAt, type Position } from '../doc/index.js';
import type { Command } from '../editor/index.js';

export function scopeBlockCommand(command: Command, scopes: ReadonlySet<string>): Command {
  return (doc, selection, args, env) => {
    const ownerAt = (at: Position): readonly number[] | null => {
      for (let depth = at.path.length - 1; depth > 0; depth -= 1) {
        const path = at.path.slice(0, depth);
        const node = nodeAt(doc, path);
        if (node && scopes.has(node.w)) return path;
      }
      return null;
    };
    const anchor = ownerAt(selection.anchor);
    const focus = ownerAt(selection.focus);
    if (!anchor && !focus) return command(doc, selection, args, env);
    if (!anchor || !focus || anchor.length !== focus.length || anchor.some((v, i) => v !== focus[i])) return null;
    const owner = nodeAt(doc, anchor);
    if (!owner || !owner.ch.every(isElement)) return null;
    const local = (at: Position): Position => ({ path: at.path.slice(anchor.length), offset: at.offset });
    const result = command(
      owner.ch as NabiDoc,
      { anchor: local(selection.anchor), focus: local(selection.focus) },
      args,
      env,
    );
    if (!result) return null;
    const global = (at: Position): Position => ({ path: [...anchor, ...at.path], offset: at.offset });
    return {
      ...result,
      doc: replaceAt(doc, anchor, [{ ...owner, ch: result.doc }]),
      selection: { anchor: global(result.selection.anchor), focus: global(result.selection.focus) },
    };
  };
}
