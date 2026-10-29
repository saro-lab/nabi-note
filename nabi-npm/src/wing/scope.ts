import { isElement, type NabiDoc } from '../schema/index.js';
import { nodeAt, replaceAt, type EditEnv, type Position } from '../doc/index.js';
import type { Command } from '../editor/index.js';

const commandScopes = new WeakMap<EditEnv, ReadonlyMap<string, ReadonlySet<string>>>();

export function bindCommandScopes(env: EditEnv, scopes: ReadonlyMap<string, ReadonlySet<string>>): void {
  commandScopes.set(env, scopes);
}

function scopePath(doc: NabiDoc, path: readonly number[], scopes?: ReadonlySet<string>): readonly number[] | null {
  if (!scopes) return null;
  for (let depth = path.length - 1; depth > 0; depth -= 1) {
    const at = path.slice(0, depth);
    const node = nodeAt(doc, at);
    if (node && scopes.has(node.w)) return at;
  }
  return null;
}

export function commandScopePath(
  doc: NabiDoc,
  path: readonly number[],
  env: EditEnv,
  command: string,
): readonly number[] | null {
  return scopePath(doc, path, commandScopes.get(env)?.get(command));
}

export function scopeBlockCommand(command: Command, scopes: ReadonlySet<string>): Command {
  return (doc, selection, args, env) => {
    const anchor = scopePath(doc, selection.anchor.path, scopes);
    const focus = scopePath(doc, selection.focus.path, scopes);
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
