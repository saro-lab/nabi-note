// 첨부 링크는 글이 아니라 한 덩어리로 다룬다 — 이름표 글자를 못 고치게 닿으면 통째로 고르고, 고치는 자리는 상황 줄뿐이다. 스키마는 안 바꾼다(발행 페이지에서는 그냥 링크다)
// Attachment links are treated as one object, not editable text — touching one selects it whole; the schema stays a plain link, this behavior lives only in the editor surface
// onKey가 아니라 attach인 까닭: 마크는 경로가 없어 keyOwnerAt이 이 wing까지 안 올라온다 — 표면에 직접 손대는 wing은 attach로 선언한다
// This uses `attach`, not `onKey`, because a mark has no path — `keyOwnerAt` never reaches this wing, so surface-level wings declare listeners here instead
import { runsOf } from '../../schema/index.js';
import { nodeAt, terminalOf, type EditEnv } from '../../doc/index.js';
import { isCollapsed, ordered, type Selection } from '../../caret/index.js';
import type { NabiDoc } from '../../schema/index.js';
import type { Attach } from '../../wing/index.js';

// ui/picked와 같은 이름이지만 층이 위라 값만 그대로 적는다
// Same name ui/picked uses, but that layer sits above this one, so the value is just repeated here
const PICKED_ATTR = 'data-nabi-picked';

interface Span {
  from: number;
  to: number;
  readonly href: unknown;
  readonly file: unknown;
}

// 이웃한 같은 첨부는 한 자리로 합친다 — 이름표 가운데 굵게가 끼면 마크가 런으로 갈리기 때문이다
// Adjacent spans of the same attachment merge into one — bold in the middle of a name splits the mark into separate runs
function fileSpans(doc: NabiDoc, path: readonly number[], env: EditEnv): Span[] {
  const holder = nodeAt(doc, path);
  if (!holder) return [];
  const out: Span[] = [];
  let offset = 0;
  for (const run of runsOf(holder, terminalOf(env))) {
    const size = run.kind === 'text' ? run.text.length : 1;
    const link = run.marks.find((m) => m.w === 'a');
    const file = link?.a?.['file'];
    if (typeof file === 'string' && file !== '') {
      const href = link?.a?.['href'];
      const last = out[out.length - 1];
      if (last && last.to === offset && last.href === href && last.file === file) last.to = offset + size;
      else out.push({ from: offset, to: offset + size, href, file });
    }
    offset += size;
  }
  return out;
}

// 닿으면 첨부까지 넓힌 선택, 아니면 null — 접힌 캐럿은 경계(from/to 그 자리)는 안 닿은 것으로 봐야 앞뒤에 캐럿을 세울 수 있다
// Returns a selection widened to cover the attachment, or null — a collapsed caret exactly at a boundary doesn't count, so the caret can still land beside it
function widen(doc: NabiDoc, sel: Selection, env: EditEnv): Selection | null {
  const [start, end] = ordered(sel);
  if (start.path.length !== end.path.length || start.path.some((v, i) => v !== end.path[i])) return null;
  const spans = fileSpans(doc, start.path, env);
  if (spans.length === 0) return null;

  const collapsed = start.offset === end.offset;
  let from = start.offset;
  let to = end.offset;
  for (const span of spans) {
    const touches = collapsed
      ? start.offset > span.from && start.offset < span.to
      : start.offset < span.to && end.offset > span.from;
    if (!touches) continue;
    from = Math.min(from, span.from);
    to = Math.max(to, span.to);
  }
  if (from === start.offset && to === end.offset) return null;
  return { anchor: { path: start.path, offset: from }, focus: { path: start.path, offset: to } };
}

// fileSpans와 같은 이유로 이웃한 a를 한 무리로 합친다 — 화면 물건 수가 자리 목록과 어긋나면 안 된다
// Merges adjacent anchors into one group for the same reason `fileSpans` does, so on-screen object counts match the span list
function fileAnchorGroups(holderEl: Element): Element[][] {
  const groups: Element[][] = [];
  let prev: Element | null = null;
  for (const el of Array.from(holderEl.querySelectorAll('a[data-nabi-file]'))) {
    const last = groups[groups.length - 1];
    const joined =
      prev !== null &&
      last !== undefined &&
      el.previousSibling === prev &&
      el.getAttribute('href') === prev.getAttribute('href') &&
      el.getAttribute('data-nabi-file') === prev.getAttribute('data-nabi-file');
    if (joined && last) last.push(el);
    else groups.push([el]);
    prev = el;
  }
  return groups;
}

// 속성 선택자용 — _id 는 안전 문자만 갖지만(schema), surface/map과 같은 방어를 한다.
// For attribute selectors; `_id` is already restricted to safe characters (schema), but this mirrors surface/map's defense anyway.
const escapeId = (id: string): string => id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const attachFileLink: Attach = ({ root, nabi, doc, env, pathOfKey }) => {
  // 우리가 세운 선택이 다시 우리를 부르는 재귀를 막는다
  // Guards against our own selection change re-triggering this handler
  let fixing = false;
  let picked: Element[] = [];

  const clearPicked = (): void => {
    for (const el of picked) el.removeAttribute(PICKED_ATTR);
    picked = [];
  };

  // 선택이 첨부 하나를 꼭 맞게 덮을 때만 표식을 얹는다 — 재그리기가 지우므로 바뀔 때마다 다시 얹는다
  // Marks the anchor only when the selection covers exactly one attachment; a redraw clears it, so this reapplies on every change
  const refreshPicked = (): void => {
    if (typeof root.querySelector !== 'function') return; // 그물의 껍데기 root — 표시는 화면의 것이다
    const sel = nabi.getSelection();
    const [start, end] = ordered(sel);
    const current = doc();
    let group: Element[] | null = null;
    if (
      start.offset !== end.offset &&
      start.path.length === end.path.length &&
      start.path.every((v, i) => v === end.path[i])
    ) {
      const spans = fileSpans(current, start.path, env);
      const index = spans.findIndex((span) => span.from === start.offset && span.to === end.offset);
      if (index >= 0) {
        const holder = nodeAt(current, start.path);
        const id = holder && typeof holder._id === 'string' ? holder._id : null;
        const holderEl = id !== null ? root.querySelector(`[data-key="${escapeId(id)}"]`) : null;
        group = holderEl ? (fileAnchorGroups(holderEl)[index] ?? null) : null;
      }
    }
    clearPicked();
    if (!group) return;
    for (const el of group) el.setAttribute(PICKED_ATTR, '');
    picked = group;
  };

  const fix = (): void => {
    if (fixing) return;
    const wanted = widen(doc(), nabi.getSelection(), env);
    if (wanted) {
      fixing = true;
      try {
        nabi.select(wanted);
      } finally {
        fixing = false;
      }
    }
    refreshPicked();
  };

  // mousedown이 첨부 전체를 즉시 고른다 — 그림·영상과 같은 통째 고르기 규칙
  // A mousedown selects the whole attachment at once, matching how images/videos get picked
  let took = false;

  const onMouseDown = (event: MouseEvent): void => {
    took = false;
    if (event.button > 0 || event.shiftKey) return;
    const el = event.target as Element | null;
    if (!el || typeof el.closest !== 'function') return;
    const anchor = el.closest('a[data-nabi-file]');
    if (!anchor || !root.contains(anchor)) return;
    const keyed = anchor.closest('[data-key]');
    const id = keyed?.getAttribute('data-key') ?? '';
    const path = id !== '' ? pathOfKey(id) : null;
    if (!keyed || !path) return;
    const index = fileAnchorGroups(keyed).findIndex((g) => g.includes(anchor));
    const span = index >= 0 ? fileSpans(doc(), path, env)[index] : undefined;
    if (!span) return;
    took = true;
    event.preventDefault();
    if (typeof root.focus === 'function') root.focus({ preventScroll: true });
    nabi.select({ anchor: { path, offset: span.from }, focus: { path, offset: span.to } });
  };

  // mouseup·click도 삼킨다 — 하나만 삼키면 남은 걸음에서 브라우저가 캐럿을 도로 놓는다
  // These are swallowed too, or the browser would replant the caret on whichever step we missed
  const onSwallow = (event: MouseEvent): void => {
    if (!took) return;
    if (event.type === 'click') took = false;
    event.preventDefault();
  };

  // 붙어 있는 백스페이스/Delete는 지우기 전에 먼저 통째로 고른다 — 두 번째 입력이 지운다
  // A Backspace/Delete right against the attachment selects it whole first; the deletion happens on the next press
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) return;
    const at = sel.focus;
    const hit = fileSpans(doc(), at.path, env).find((span) =>
      event.key === 'Backspace' ? at.offset === span.to : at.offset === span.from,
    );
    if (!hit) return;
    event.preventDefault();
    nabi.select({ anchor: { path: at.path, offset: hit.from }, focus: { path: at.path, offset: hit.to } });
  };

  const stop = nabi.onChange(fix);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('mouseup', onSwallow);
  root.addEventListener('click', onSwallow);
  // 캡처로 잡아 표면의 keydown보다 앞서 preventDefault한다 — 안 그러면 코어가 먼저 한 글자를 지운다
  // Captured ahead of the surface's own keydown so preventDefault runs first, or the core deletes a character before this fires
  root.addEventListener('keydown', onKeyDown, true);
  fix();

  return () => {
    stop();
    clearPicked();
    root.removeEventListener('keydown', onKeyDown, true);
    root.removeEventListener('click', onSwallow);
    root.removeEventListener('mouseup', onSwallow);
    root.removeEventListener('mousedown', onMouseDown);
  };
};
