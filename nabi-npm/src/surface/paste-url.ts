import { coreCommands, hostOf, type Nabi } from '../editor/index.js';
import { isCollapsed, ordered } from '../caret/index.js';
import { documentIndex, fromRuns, nodeAt, sliceRuns, terminalOf, type Position } from '../doc/index.js';
import { $toJson, runsOf, type ElementNode } from '../schema/index.js';
import { canonicalTextLength } from '../schema/text.js';
import { diffPlain, holderTextOf } from './text.js';

export type PasteUrlHandler = (
  url: string,
  isSameOrigin: boolean,
  path: string,
) => string | null | void | Promise<string | null | void>;

export function resolvePastedUrl(
  nabi: Nabi,
  url: string,
  href: string,
  callback: PasteUrlHandler,
  origin?: string,
  signal?: AbortSignal,
): void {
  const host = hostOf(nabi);
  const env = host.env;
  const terminal = terminalOf(env);
  const end = nabi.getSelection().focus;
  const holder = nodeAt(host.doc(), end.path);
  if (!holder?._id || signal?.aborted) return;
  const holderId = holder._id;
  let start = end.offset - url.length;
  let finish = end.offset;
  let before = holderTextOf(holder, terminal);
  let previousSelection = nabi.getSelection();
  let previousPath = end.path;
  const content = (node: ElementNode): string =>
    JSON.stringify($toJson([{ w: 'p', ch: fromRuns(sliceRuns(runsOf(node, terminal), start, finish)) }]));
  const original = content(holder);
  const initialRuns = sliceRuns(runsOf(holder, terminal), start, finish);
  if (
    start < 0 ||
    before.slice(start, finish) !== url ||
    !initialRuns.every((run) => run.marks.some((mark) => mark.w === 'a' && mark.a?.['href'] === href))
  )
    return;

  let active = true;
  let stopChange = (): void => {};
  const stop = (): void => {
    active = false;
    stopChange();
    signal?.removeEventListener('abort', stop);
  };
  const refresh = (): boolean => {
    const current = documentIndex(host.doc(), env).byIdAt(holderId);
    if (!current) return false;
    const after = holderTextOf(current.node, terminal);
    let change = diffPlain(before, after);
    const selection = nabi.getSelection();
    const [from, to] = ordered(previousSelection);
    const samePath = (a: readonly number[], b: readonly number[]): boolean =>
      a.length === b.length && a.every((index, at) => b[at] === index);
    // 같은 URL이 이어지면 텍스트 차이만으로 삽입·삭제 위치를 구분할 수 없다.
    // Adjacent identical URLs need the editing selection to disambiguate insertions and deletions.
    if (
      change &&
      isCollapsed(selection) &&
      samePath(from.path, previousPath) &&
      samePath(to.path, previousPath) &&
      samePath(selection.focus.path, current.path) &&
      selection.focus.offset >= from.offset
    ) {
      const inserted = after.slice(from.offset, selection.focus.offset);
      if (before.slice(0, from.offset) + inserted + before.slice(to.offset) === after)
        change = { start: from.offset, removedEnd: to.offset, inserted };
    }
    if (
      change &&
      before.length > after.length &&
      isCollapsed(previousSelection) &&
      isCollapsed(selection) &&
      samePath(from.path, previousPath) &&
      samePath(selection.focus.path, current.path)
    ) {
      const at = selection.focus.offset;
      const removedEnd = at + before.length - after.length;
      if (before.slice(0, at) + before.slice(removedEnd) === after) change = { start: at, removedEnd, inserted: '' };
    }
    if (change) {
      if (change.removedEnd <= start) {
        const delta = change.inserted.length - (change.removedEnd - change.start);
        start += delta;
        finish += delta;
      } else if (change.start < finish) return false;
    }
    before = after;
    previousPath = current.path;
    return content(current.node) === original;
  };
  stopChange = nabi.onChange((change) => {
    if (change.loaded || (change.doc && !refresh())) stop();
    previousSelection = nabi.getSelection();
  });
  signal?.addEventListener('abort', stop, { once: true });

  const settle = (value: unknown): void => {
    if (!active) return;
    const valid = refresh();
    stop();
    if (!valid || typeof value !== 'string' || value.trim() === '' || value === url) return;
    const current = documentIndex(host.doc(), env).byIdAt(holderId);
    const insert = coreCommands()['insertText'];
    if (!current || !insert) return;
    const path = current.path;
    const marks = sliceRuns(runsOf(current.node, terminal), start, finish)[0]?.marks;
    const target = { anchor: { path, offset: start }, focus: { path, offset: finish } };
    const length = canonicalTextLength(value);
    const shift = (position: Position): Position => {
      if (position.path.length !== path.length || !path.every((index, at) => position.path[at] === index))
        return position;
      const offset =
        position.offset <= start
          ? position.offset
          : position.offset >= finish
            ? position.offset + length - (finish - start)
            : start + Math.min(position.offset - start, length);
      return { path, offset };
    };
    host.applyRaw((doc, selection, _args, editEnv) => {
      const changed = insert(doc, target, { text: value, marks }, editEnv);
      return changed
        ? { doc: changed.doc, selection: { anchor: shift(selection.anchor), focus: shift(selection.focus) } }
        : null;
    }, 'pasteUrlText');
  };
  const fail = (error: unknown): void => {
    const report = active;
    stop();
    if (report) host.reportError(error);
  };

  try {
    const parsed = new URL(href);
    const result = callback(url, parsed.origin === origin, parsed.pathname + parsed.search + parsed.hash);
    if (
      result !== null &&
      (typeof result === 'object' || typeof result === 'function') &&
      typeof (result as PromiseLike<unknown>).then === 'function'
    ) {
      void Promise.resolve(result).then(settle, fail);
    } else settle(result);
  } catch (error) {
    fail(error);
  }
}
