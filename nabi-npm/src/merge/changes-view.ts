import { diffDocs } from '../diff/model.js';
import { hostOf } from '../editor/host.js';
import { renderParagraphHtml } from '../html/index.js';
import { toDomPoint } from '../surface/map.js';
import type { MergeChange, MergeSession } from './session.js';
import { splitMergeUnits, type MergeUnit } from './units.js';

interface ChangePane {
  readonly source: 'base' | 'incoming';
  readonly root: HTMLElement;
  readonly gutter: HTMLElement;
}

interface ChangeRow {
  readonly node: HTMLElement;
  readonly pane: ChangePane;
  readonly start: number;
  readonly end: number;
  readonly change?: MergeChange;
  readonly button?: HTMLButtonElement;
}

export function mountMergeChanges(options: {
  session: MergeSession;
  panes: readonly ChangePane[];
  content: HTMLElement;
  scroll: HTMLElement;
  paper: HTMLElement;
  overlay: HTMLElement;
  label(source: 'base' | 'incoming'): string;
  select(id: string): void;
  allowLocalUrls?: boolean;
}) {
  const { session, panes, content, scroll, paper, overlay } = options;
  const { registry, nabi } = session;
  const host = hostOf(nabi);
  const owner = content.ownerDocument;
  const view = owner.defaultView;
  let rows: ChangeRow[] = [];
  let revision = -1;
  let active = '';
  let disabled = false;
  let frame = 0;
  let dead = false;
  const job = { env: registry.env, builders: registry.builders, allowLocalUrls: options.allowLocalUrls };
  const make = (className: string, parent: HTMLElement): HTMLElement => {
    const node = owner.createElement('div');
    node.className = className;
    parent.append(node);
    return node;
  };
  const resultBox = (start: number, end: number, units: readonly MergeUnit[]): { top: number; bottom: number } => {
    const first = units[start];
    const last = units[Math.max(start, end - 1)];
    const node = content.children[first?.paragraph ?? units.at(-1)?.paragraph ?? 0] as HTMLElement | undefined;
    const fallback = node?.getBoundingClientRect() ?? content.getBoundingClientRect();
    if (!first) return { top: fallback.bottom, bottom: fallback.bottom + 3 };
    if (first.end === 1 && first.node.w !== 'p') {
      return { top: fallback.top, bottom: start === end ? fallback.top + 3 : fallback.bottom };
    }
    const from = toDomPoint(content, host.doc(), registry.env, { path: [first.paragraph], offset: first.start });
    const to =
      last &&
      toDomPoint(content, host.doc(), registry.env, {
        path: [last.paragraph],
        offset: start === end ? first.start : last.end,
      });
    if (from && to) {
      const range = owner.createRange();
      range.setStart(from.node, from.offset);
      range.setEnd(to.node, to.offset);
      if (typeof range.getClientRects === 'function') {
        const rects = [...range.getClientRects()].filter((rect) => rect.height > 0);
        if (rects.length) {
          const top = Math.min(...rects.map((rect) => rect.top));
          return { top, bottom: start === end ? top + 3 : Math.max(...rects.map((rect) => rect.bottom)) };
        }
      }
    }
    return { top: fallback.top, bottom: start === end ? fallback.top + 3 : fallback.bottom };
  };
  const paint = (): void => {
    frame = 0;
    if (dead) return;
    overlay.replaceChildren();
    const units = splitMergeUnits(host.doc(), registry);
    const paperBox = paper.getBoundingClientRect();
    const viewport = scroll.getBoundingClientRect();
    const conflicts = session.getState().conflicts.filter((conflict) => conflict.status === 'unresolved');
    for (const pane of panes) pane.gutter.querySelector('svg')?.remove();
    for (const row of rows) {
      const change = row.change;
      if (!change || !row.button) continue;
      const { pane } = row;
      const sourceBox = row.node.getBoundingClientRect();
      const targetBox = resultBox(row.start, row.end, units);
      const gutterBox = pane.gutter.getBoundingClientRect();
      const sourceViewport = pane.root.getBoundingClientRect();
      const visible = sourceBox.bottom > sourceViewport.top && sourceBox.top < sourceViewport.bottom;
      row.button.hidden = !visible;
      row.button.style.top = `${Math.max(0, Math.min(gutterBox.height - 28, sourceBox.top - gutterBox.top))}px`;
      const focused = change.conflictIds.includes(active);
      row.node.toggleAttribute('data-merge-active', focused);
      row.button.toggleAttribute('data-merge-active', focused);
      row.button.disabled = disabled || change.ambiguous;
      row.button.title = `${options.label(pane.source)} (${change.sourceStart + 1})`;
      row.button.setAttribute('aria-label', row.button.title);
      let svg = pane.gutter.querySelector('svg');
      if (!svg) {
        svg = owner.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('aria-hidden', 'true');
        pane.gutter.prepend(svg);
      }
      const left = pane.source === 'base' ? sourceBox : targetBox;
      const right = pane.source === 'base' ? targetBox : sourceBox;
      const y = (value: number) => value - gutterBox.top;
      const w = gutterBox.width;
      const path = owner.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M0,${y(left.top)} C${w / 2},${y(left.top)} ${w / 2},${y(right.top)} ${w},${y(right.top)} L${w},${y(right.bottom)} C${w / 2},${y(right.bottom)} ${w / 2},${y(left.bottom)} 0,${y(left.bottom)} Z`,
      );
      svg.append(path);
      if (targetBox.bottom < viewport.top || targetBox.top > viewport.bottom) continue;
      const band = make('nabi-merge-band', overlay);
      band.dataset.source = pane.source;
      band.style.top = `${targetBox.top - paperBox.top}px`;
      band.style.height = `${Math.max(3, targetBox.bottom - targetBox.top)}px`;
      if (focused) band.dataset.active = '';
    }
    for (const conflict of conflicts) {
      const box = resultBox(conflict.resultStart, conflict.resultEnd, units);
      const band = make('nabi-merge-band nabi-merge-unresolved', overlay);
      band.style.top = `${box.top - paperBox.top}px`;
      band.style.height = `${Math.max(3, box.bottom - box.top)}px`;
      if (conflict.id === active) band.dataset.active = '';
    }
  };
  const schedule = (): void => {
    if (dead || frame) return;
    if (view?.requestAnimationFrame) frame = view.requestAnimationFrame(paint);
    else paint();
  };
  const render = (): void => {
    const result = splitMergeUnits(host.doc(), registry);
    const focused = owner.activeElement as HTMLElement | null;
    const focusSource = focused?.dataset.mergeAction;
    const focusIndex = Number(focused?.dataset.sourceStart);
    rows = [];
    for (const pane of panes) {
      const top = pane.root.scrollTop;
      const source = splitMergeUnits(session.model[pane.source], registry);
      pane.root.replaceChildren();
      pane.gutter.replaceChildren();
      const append = (index: number, start: number, end: number, change?: MergeChange): void => {
        const row = make('nabi-merge-source-block', pane.root);
        row.dataset.unit = String(index);
        row.dataset.paragraph = String(source[index]?.paragraph ?? -1);
        const number = make('nabi-merge-line-number', row);
        number.textContent = change && change.sourceStart === change.sourceEnd ? '−' : String(index + 1);
        number.setAttribute('aria-hidden', 'true');
        const text = make('nabi-merge-line-text', row);
        const removed = change && change.sourceStart === change.sourceEnd;
        text.toggleAttribute(
          'data-line-break',
          !removed && source[index]?.boundary === 'br' && (!change || change.sourceEnd === index + 1),
        );
        const original = removed ? [] : source.slice(index, change?.sourceEnd ?? index + 1).map((unit) => unit.node);
        const compared = diffDocs(
          original,
          result.slice(start, end).map((unit) => unit.node),
          registry,
          {
            allowLocalUrls: options.allowLocalUrls,
          },
        );
        text.innerHTML =
          compared?.before.map((block) => block.html).join('') ??
          original.map((node) => renderParagraphHtml(node, job)).join('');
        if (!text.childElementCount) text.append(owner.createElement('br'));
        let button: HTMLButtonElement | undefined;
        if (change) {
          row.dataset.change = change.kind;
          row.dataset.conflict = String(change.conflictIds.length > 0);
          row.addEventListener('click', () => {
            if (change.conflictIds[0]) options.select(change.conflictIds[0]);
          });
          button = owner.createElement('button');
          button.type = 'button';
          button.className = 'nabi-merge-button nabi-merge-line-action';
          button.dataset.mergeAction = pane.source;
          button.dataset.sourceStart = String(change.sourceStart);
          button.dataset.resultStart = String(change.resultStart);
          button.textContent = pane.source === 'base' ? '›' : '‹';
          button.addEventListener('click', () => {
            if (!disabled) session.applyChange(change);
          });
          pane.gutter.append(button);
        }
        rows.push({ node: row, pane, start, end, change, button });
      };
      let sourceAt = 0;
      let resultAt = 0;
      for (const change of session.getChanges(pane.source)) {
        while (sourceAt < change.sourceStart) {
          append(sourceAt++, resultAt, resultAt + 1);
          resultAt += 1;
        }
        append(change.sourceStart, change.resultStart, change.resultEnd, change);
        sourceAt = change.sourceEnd;
        resultAt = change.resultEnd;
      }
      while (sourceAt < source.length) {
        append(sourceAt++, resultAt, resultAt + 1);
        resultAt += 1;
      }
      pane.root.scrollTop = top;
    }
    if (focusSource && Number.isFinite(focusIndex)) {
      const candidates = rows.filter((row) => row.pane.source === focusSource && row.button);
      const next = candidates.find((row) => row.change!.sourceStart >= focusIndex) ?? candidates.at(-1);
      if (next?.button) next.button.focus({ preventScroll: true });
      else content.focus({ preventScroll: true });
    }
  };
  const scrollers = [scroll, ...panes.map((pane) => pane.root)];
  let synchronizing = false;
  const syncScroll = (event: Event): void => {
    schedule();
    if (synchronizing) return;
    const source = event.currentTarget as HTMLElement;
    const progress = source.scrollTop / Math.max(1, source.scrollHeight - source.clientHeight);
    synchronizing = true;
    for (const target of scrollers) {
      if (target !== source) target.scrollTop = progress * Math.max(0, target.scrollHeight - target.clientHeight);
    }
    view?.requestAnimationFrame(() => {
      synchronizing = false;
    });
  };
  for (const target of scrollers) target.addEventListener('scroll', syncScroll, { passive: true });
  const resize = view?.ResizeObserver ? new view.ResizeObserver(schedule) : null;
  resize?.observe(content);
  for (const pane of panes) {
    resize?.observe(pane.root);
    pane.root.addEventListener('load', schedule, true);
  }
  content.addEventListener('load', schedule, true);
  view?.addEventListener('resize', schedule);
  return {
    update(selected: string, blocked: boolean, composing: boolean): void {
      active = selected;
      disabled = blocked;
      if (!composing && revision !== session.getState().revision) {
        revision = session.getState().revision;
        render();
      }
      for (const row of rows) if (row.button) row.button.disabled = disabled || !!row.change?.ambiguous;
      if (!composing) schedule();
    },
    reveal(id: string): void {
      const conflict = session.getState().conflicts.find((item) => item.id === id);
      if (!conflict) return;
      const box = resultBox(conflict.resultStart, conflict.resultEnd, splitMergeUnits(host.doc(), registry));
      scroll.scrollTop += box.top - scroll.getBoundingClientRect().top - 24;
      for (const pane of panes) {
        const row = rows.find((item) => item.pane === pane && item.change?.conflictIds.includes(id));
        if (row)
          pane.root.scrollTop += row.node.getBoundingClientRect().top - pane.root.getBoundingClientRect().top - 24;
      }
      schedule();
    },
    dispose(): void {
      dead = true;
      if (frame) view?.cancelAnimationFrame(frame);
      resize?.disconnect();
      for (const target of scrollers) target.removeEventListener('scroll', syncScroll);
      for (const pane of panes) pane.root.removeEventListener('load', schedule, true);
      content.removeEventListener('load', schedule, true);
      view?.removeEventListener('resize', schedule);
    },
  };
}
