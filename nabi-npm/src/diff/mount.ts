import type { LocaleInput } from '../locale/index.js';
import { iconHtml } from '../style/icon.js';
// --- 화면 --------------------------------------------------------------------------------------
import { diffDocs, type DocDiff } from './model.js';
import type { DiffPaneBlock } from './model.js';
import type { DiffEntry } from './match.js';
import type { Registry } from '../wing/index.js';
import { localeDirection, localeValue, makeTranslator } from '../locale/index.js';
import {
  acquireStyleSheet,
  claimMountRoot,
  DisposerStack,
  HostElementBaseline,
  HostElementLease,
} from '../lifecycle.js';
import { ensureCss } from './styles.js';

export interface DiffMountOptions {
  readonly root: HTMLElement;
  readonly before: unknown;
  readonly after: unknown;
  readonly registry: Registry;
  readonly allowLocalUrls?: boolean;
  readonly locale?: LocaleInput;
}

export interface DiffMount {
  update(before: unknown, after: unknown): void;
  unmount(): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// 접기 모드에서 바뀐 덩어리 앞뒤로 남기는 맥락 블록 수.
// The number of context blocks kept before/after a changed chunk in fold mode.
const FOLD_CONTEXT = 1;

// 아이콘 단추 하나 — 판(mountDiff)과 전체화면(mountDiffWing)이 같은 모양을 나눠 쓴다.
// One icon button shape shared by the pane (mountDiff) and the fullscreen view (mountDiffWing).
export function diffButton(doc: Document, title: string, icon: string): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'nabi-diff-btn';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.innerHTML = iconHtml(`diff-${icon.replace(/^diff-/, '')}`, icon);
  return button;
}

export function mountDiff(options: DiffMountOptions): DiffMount {
  const root = options.root;
  const registry = options.registry;
  const locale = options.locale;
  const allowLocalUrls = options.allowLocalUrls;
  const before = options.before;
  const after = options.after;
  const baseline = new HostElementBaseline(root);
  const lifecycle = new DisposerStack();
  lifecycle.add(claimMountRoot(root));
  try {
    const doc = root.ownerDocument;
    const translator = makeTranslator(locale);
    const t = (key: string): string => translator.t(key);
    const releaseCss = ensureCss(doc);
    lifecycle.add(releaseCss);
    const attributes = new HostElementLease(root);
    lifecycle.add(() => attributes.dispose());
    attributes.className('nabi-diff', true);
    attributes.attribute('role', 'region');
    attributes.attribute('aria-label', t('diff.region'));
    if (locale !== undefined) attributes.attribute('dir', localeDirection(localeValue(locale)));

    const el = (cls: string, tag = 'div'): HTMLElement => {
      const node = doc.createElement(tag);
      node.className = cls;
      return node;
    };
    const iconButton = (title: string, icon: string): HTMLButtonElement => diffButton(doc, title, icon);

    const bar = el('nabi-diff-bar');
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', t('diff.controls'));
    const prevButton = iconButton(t('diff.prev'), 'diff-prev');
    const nextButton = iconButton(t('diff.next'), 'diff-next');
    const count = el('nabi-diff-count', 'span');
    const spacer = el('nabi-diff-spacer', 'span');
    // "바뀐 부분만" 은 글자가 아니라 서로를 향해 접히는 상하 세모 화살표다. 말은 title/aria 로 남는다.
    // "Only changes" is a pair of triangles folding toward each other, not text; the label lives in title/aria instead.
    const toggleButton = iconButton(t('diff.onlyChanges'), 'diff-fold');
    toggleButton.setAttribute('aria-pressed', 'false');
    // 숫자와 접기는 왼쪽 무리다 — 오른쪽 끝은 전체화면(mountDiffWing)이 얹는 닫기(X) 하나만의 자리다.
    // The count and fold toggle group on the left; the far right is reserved solely for the close (X) that mountDiffWing adds.
    bar.append(prevButton, nextButton, count, toggleButton, spacer);

    const body = el('nabi-diff-body');
    const beforePane = el('nabi-diff-pane nabi-diff-before');
    const beforeDocEl = el('nabi-content nabi-diff-doc');
    beforePane.append(beforeDocEl);
    const gutter = el('nabi-diff-gutter');
    const svg = doc.createElementNS(SVG_NS, 'svg');
    gutter.append(svg);
    const afterPane = el('nabi-diff-pane nabi-diff-after');
    const afterDocEl = el('nabi-content nabi-diff-doc');
    afterPane.append(afterDocEl);
    body.append(beforePane, gutter, afterPane);
    root.replaceChildren(bar, body);
    lifecycle.add(() => {
      bar.remove();
      body.remove();
    });

    let model: DocDiff | null = null;
    let beforeEls: HTMLElement[] = [];
    let afterEls: HTMLElement[] = [];
    let cursor = -1;
    let folded = false;
    let unmounted = false;
    // 매칭 블록 쌍 기준 세로 앵커 — [i] 끼리 같은 자리다. 양 끝(0·문서 끝)이 늘 들어 있다.
    let anchorsB: number[] = [];
    let anchorsA: number[] = [];

    const paneHtml = (blocks: readonly DiffPaneBlock[], entries: readonly DiffEntry[]): string =>
      blocks
        .map(
          (block) =>
            `<div class="nabi-diff-block" data-entry="${block.entry}" data-diff="${(entries[block.entry] as DiffEntry).kind}">${block.html}</div>`,
        )
        .join('');

    // --- 접기 — 안 바뀐 구간을 감추고 앞뒤 맥락만 남긴다 ---------------------------------------
    const applyFold = (): void => {
      attributes.className('nabi-diff-only', folded);
      toggleButton.setAttribute('aria-pressed', folded ? 'true' : 'false');
      if (!model) return;
      const keep = new Set<number>();
      model.entries.forEach((entry, at) => {
        if (entry.kind === 'same') return;
        for (let k = at - FOLD_CONTEXT; k <= at + FOLD_CONTEXT; k += 1) keep.add(k);
      });
      const mark = (els: readonly HTMLElement[]): void => {
        let hiddenRun = false;
        for (const blockEl of els) {
          const entry = Number(blockEl.dataset['entry']);
          const hidden = !keep.has(entry);
          blockEl.classList.toggle('nabi-diff-gap', hidden && !hiddenRun);
          blockEl.classList.toggle('nabi-diff-cut', hidden && hiddenRun);
          hiddenRun = hidden;
        }
      };
      mark(beforeEls);
      mark(afterEls);
    };

    // --- 세로 앵커 — 접힌 블록은 앵커에서 빠진다 ----------------------------------------------
    const visible = (blockEl: HTMLElement | undefined): blockEl is HTMLElement =>
      blockEl !== undefined && blockEl.offsetParent !== null;

    const measure = (): void => {
      anchorsB = [0];
      anchorsA = [0];
      if (model) {
        for (const entry of model.entries) {
          // moved 는 양쪽 순서가 어긋나므로 앵커로 못 쓴다 — 단조 증가가 깨진다.
          if (entry.kind !== 'same' && entry.kind !== 'changed') continue;
          const b = beforeEls[entry.before as number];
          const a = afterEls[entry.after as number];
          if (!visible(b) || !visible(a)) continue;
          anchorsB.push(b.offsetTop);
          anchorsA.push(a.offsetTop);
        }
      }
      anchorsB.push(beforePane.scrollHeight);
      anchorsA.push(afterPane.scrollHeight);
    };

    const mapY = (y: number, from: readonly number[], to: readonly number[]): number => {
      let i = from.length - 2;
      for (let k = 0; k < from.length - 1; k += 1) {
        if (y < (from[k + 1] as number)) {
          i = k;
          break;
        }
      }
      const f0 = from[i] as number;
      const f1 = from[i + 1] as number;
      const t0 = to[i] as number;
      const t1 = to[i + 1] as number;
      const ratio = f1 <= f0 ? 0 : (y - f0) / (f1 - f0);
      return t0 + ratio * (t1 - t0);
    };

    // --- 커넥터 선 — 거터의 SVG 에, 스크롤·리사이즈마다 다시 긋는다 -----------------------------
    const spanOf = (
      els: readonly HTMLElement[],
      index: number | null,
      pane: HTMLElement,
      fallback: () => number,
    ): { top: number; bottom: number } => {
      const blockEl = index === null ? undefined : els[index];
      if (visible(blockEl)) {
        return {
          top: blockEl.offsetTop - pane.scrollTop,
          bottom: blockEl.offsetTop + blockEl.offsetHeight - pane.scrollTop,
        };
      }
      const y = fallback() - pane.scrollTop;
      return { top: y, bottom: y };
    };

    // 반대쪽에 블록이 없는 짝(removed·added)이 그쪽에서 "있었을 자리" — 다음 짝의 블록 윗변.
    const collapsedY = (at: number, side: 'before' | 'after'): number => {
      if (!model) return 0;
      const els = side === 'before' ? beforeEls : afterEls;
      for (let k = at + 1; k < model.entries.length; k += 1) {
        const entry = model.entries[k] as DiffEntry;
        if (entry.kind === 'moved') continue;
        const index = side === 'before' ? entry.before : entry.after;
        const blockEl = index === null ? undefined : els[index];
        if (visible(blockEl)) return blockEl.offsetTop;
      }
      // 다음 블록이 없으면 문서 끝에 붙은 짝이다 — "있었을 자리"는 마지막 블록의 아랫변이지 패인 바닥(scrollHeight)이 아니다.
      // With no next block, this pair sits at the doc's end — its spot is the last block's bottom edge, not the pane's scrollHeight.
      for (let k = els.length - 1; k >= 0; k -= 1) {
        const blockEl = els[k];
        if (visible(blockEl)) return blockEl.offsetTop + blockEl.offsetHeight;
      }
      return 0;
    };

    // changed 짝의 선은 왼쪽 빨강에서 오른쪽 초록으로 흐르는 그라디언트다. userSpaceOnUse라 겹친 changed 선끼리도 같은 x에서 같은 색을 낸다.
    // Changed pairs get a gradient from red (left) to green (right); userSpaceOnUse keeps overlapping changed lines the same color at the same x.
    // id는 마운트마다 새로 짓는다 — 한 페이지에 diff가 둘이면 defs의 id가 부딪힌다.
    // A fresh id per mount; two diffs on one page would otherwise collide on the same defs id.
    const gradId = `nabi-diff-grad-${Math.random().toString(36).slice(2, 8)}`;
    const gradientDefs = (w: number): SVGElement => {
      const defs = doc.createElementNS(SVG_NS, 'defs');
      const grad = doc.createElementNS(SVG_NS, 'linearGradient');
      grad.setAttribute('id', gradId);
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('x2', String(w));
      grad.setAttribute('y2', '0');
      for (const [offset, cls] of [
        ['0', 'nabi-diff-stop-del'],
        ['1', 'nabi-diff-stop-ins'],
      ] as const) {
        const stop = doc.createElementNS(SVG_NS, 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('class', cls);
        grad.appendChild(stop);
      }
      defs.appendChild(grad);
      return defs;
    };

    // 반대쪽 패인의 "있었을 자리" 한 줄 — 추가는 왼쪽(before)에 초록, 지움은 오른쪽(after)에 빨강, 거터 이음선과 같은 색으로 이어진다.
    // The "would-have-been" line on the opposite pane: green on the before side for additions, red on the after side for removals, colored to match the gutter connector.
    // 패인 안에 살아서 스크롤과 함께 구른다 — 레이아웃이 바뀔 때만 다시 놓는다.
    // It lives inside the pane and scrolls with it, so it's only repositioned when layout changes.
    let marks: HTMLElement[] = [];
    const placeMarks = (): void => {
      for (const mark of marks) mark.remove();
      marks = [];
      if (!model) return;
      for (const at of model.changes) {
        const entry = model.entries[at] as DiffEntry;
        const side: 'before' | 'after' | null =
          entry.before === null ? 'before' : entry.after === null ? 'after' : null;
        if (side === null) continue;
        const pane = side === 'before' ? beforePane : afterPane;
        const mark = el(`nabi-diff-mark nabi-diff-mark-${entry.kind}`);
        mark.style.top = `${Math.max(0, collapsedY(at, side) - 1)}px`;
        pane.append(mark);
        marks.push(mark);
      }
    };

    const draw = (): void => {
      const w = gutter.clientWidth;
      const h = gutter.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (!model || w === 0) return;
      svg.appendChild(gradientDefs(w));
      for (const at of model.changes) {
        const entry = model.entries[at] as DiffEntry;
        const b = spanOf(beforeEls, entry.before, beforePane, () => collapsedY(at, 'before'));
        const a = spanOf(afterEls, entry.after, afterPane, () => collapsedY(at, 'after'));
        if ((b.bottom < -40 && a.bottom < -40) || (b.top > h + 40 && a.top > h + 40)) continue;
        const c1 = (w * 0.45).toFixed(1);
        const c2 = (w * 0.55).toFixed(1);
        const path = doc.createElementNS(SVG_NS, 'path');
        path.setAttribute(
          'd',
          `M 0 ${b.top} C ${c1} ${b.top} ${c2} ${a.top} ${w} ${a.top} L ${w} ${a.bottom} C ${c2} ${a.bottom} ${c1} ${b.bottom} 0 ${b.bottom} Z`,
        );
        path.setAttribute('class', `nabi-diff-line nabi-diff-line-${entry.kind}`);
        // 마운트별 id 를 무는 칠이라 시트에 못 적는다 — 인라인이 시트를 이기는 성질도 여기서는 뜻이다.
        if (entry.kind === 'changed') path.style.fill = `url(#${gradId})`;
        svg.appendChild(path);
      }
    };

    let raf = 0;
    const syncFrames = new Set<number>();
    lifecycle.add(() => {
      const view = root.ownerDocument.defaultView;
      if (raf !== 0) view?.cancelAnimationFrame(raf);
      for (const frame of syncFrames) view?.cancelAnimationFrame(frame);
      syncFrames.clear();
    });
    const requestDraw = (): void => {
      if (raf !== 0) return;
      raf =
        root.ownerDocument.defaultView?.requestAnimationFrame?.(() => {
          raf = 0;
          draw();
        }) ?? 0;
    };

    // --- 스크롤 동기화 — 세로는 앵커 짝 기준, 가로는 비율 ---------------------------------------
    // 프로그램이 옮긴 스크롤이 낳는 메아리 이벤트를 한 번 삼킨다.
    let syncing: HTMLElement | 'all' | null = null;
    const releaseSync = (): void => {
      const view = root.ownerDocument.defaultView;
      const frame =
        view?.requestAnimationFrame?.(() => {
          syncFrames.delete(frame ?? 0);
          syncing = null;
        }) ?? 0;
      if (frame !== 0) syncFrames.add(frame);
    };
    const follow = (src: HTMLElement, dst: HTMLElement, from: readonly number[], to: readonly number[]): void => {
      requestDraw();
      if (syncing === src || syncing === 'all') return;
      const top = Math.max(0, Math.min(mapY(src.scrollTop, from, to), dst.scrollHeight - dst.clientHeight));
      const maxSrc = src.scrollWidth - src.clientWidth;
      const maxDst = dst.scrollWidth - dst.clientWidth;
      const left = maxSrc <= 0 ? 0 : (src.scrollLeft / maxSrc) * maxDst;
      if (Math.abs(dst.scrollTop - top) < 1 && Math.abs(dst.scrollLeft - left) < 1) return;
      syncing = dst;
      dst.scrollTop = top;
      dst.scrollLeft = left;
      releaseSync();
    };
    const onBeforeScroll = (): void => follow(beforePane, afterPane, anchorsB, anchorsA);
    const onAfterScroll = (): void => follow(afterPane, beforePane, anchorsA, anchorsB);
    beforePane.addEventListener('scroll', onBeforeScroll);
    afterPane.addEventListener('scroll', onAfterScroll);
    lifecycle.add(() => {
      beforePane.removeEventListener('scroll', onBeforeScroll);
      afterPane.removeEventListener('scroll', onAfterScroll);
    });

    // --- 이전/다음 점프 -------------------------------------------------------------------------
    const setCount = (): void => {
      const total = model?.changes.length ?? 0;
      count.textContent = `${cursor < 0 ? 0 : cursor + 1} / ${total}`;
      prevButton.disabled = cursor <= 0;
      nextButton.disabled = total === 0 || cursor >= total - 1;
      const active = root.ownerDocument.activeElement as HTMLButtonElement | null;
      if ((active === prevButton || active === nextButton) && active.disabled) {
        const buttons = [...bar.querySelectorAll<HTMLButtonElement>('button')];
        const at = buttons.indexOf(active);
        const target =
          buttons.find((button, index) => index > at && !button.disabled) ?? buttons.find((button) => !button.disabled);
        target?.focus({ preventScroll: true });
      }
    };

    const jump = (next: number): void => {
      if (!model || model.changes.length === 0) return;
      cursor = Math.max(0, Math.min(next, model.changes.length - 1));
      const at = model.changes[cursor] as number;
      const entry = model.entries[at] as DiffEntry;
      for (const focused of root.querySelectorAll('.nabi-diff-focus')) focused.classList.remove('nabi-diff-focus');
      const bEl = entry.before === null ? undefined : beforeEls[entry.before];
      const aEl = entry.after === null ? undefined : afterEls[entry.after];
      bEl?.classList.add('nabi-diff-focus');
      aEl?.classList.add('nabi-diff-focus');
      const bTop = visible(bEl) ? bEl.offsetTop : collapsedY(at, 'before');
      const aTop = visible(aEl) ? aEl.offsetTop : collapsedY(at, 'after');
      syncing = 'all';
      beforePane.scrollTop = Math.max(0, bTop - beforePane.clientHeight / 3);
      afterPane.scrollTop = Math.max(0, aTop - afterPane.clientHeight / 3);
      releaseSync();
      setCount();
      requestDraw();
    };
    prevButton.addEventListener('click', () => {
      if (!unmounted) jump(cursor - 1);
    });
    nextButton.addEventListener('click', () => {
      if (!unmounted) jump(cursor + 1);
    });
    toggleButton.addEventListener('click', () => {
      if (unmounted) return;
      folded = !folded;
      applyFold();
      measure();
      placeMarks();
      requestDraw();
    });
    const onToolbarKey = (event: KeyboardEvent): void => {
      if (unmounted) return;
      const buttons = [...bar.querySelectorAll<HTMLButtonElement>('button')];
      if (buttons.length === 0) return;
      const at = buttons.indexOf(event.target as HTMLButtonElement);
      if (at < 0) return;
      const enabled = buttons.filter((button) => !button.disabled);
      if (enabled.length === 0) return;
      let target: HTMLButtonElement | null = null;
      if (event.key === 'Home') target = enabled[0] as HTMLButtonElement;
      else if (event.key === 'End') target = enabled.at(-1) as HTMLButtonElement;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const step = event.key === 'ArrowRight' ? 1 : -1;
        for (let offset = 1; offset <= buttons.length; offset += 1) {
          const candidate = buttons[(at + step * offset + buttons.length) % buttons.length] as HTMLButtonElement;
          if (!candidate.disabled) {
            target = candidate;
            break;
          }
        }
      }
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
    };
    bar.addEventListener('keydown', onToolbarKey);
    lifecycle.add(() => bar.removeEventListener('keydown', onToolbarKey));

    const openLinksInNewTab = (root: HTMLElement): void => {
      for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    };

    const paint = (before: unknown, after: unknown): void => {
      if (unmounted) return;
      model = diffDocs(before, after, registry, allowLocalUrls ? { allowLocalUrls: true } : undefined);
      beforeDocEl.innerHTML = model ? paneHtml(model.before, model.entries) : '';
      afterDocEl.innerHTML = model ? paneHtml(model.after, model.entries) : '';
      openLinksInNewTab(beforeDocEl);
      openLinksInNewTab(afterDocEl);
      beforeEls = [...beforeDocEl.children] as HTMLElement[];
      afterEls = [...afterDocEl.children] as HTMLElement[];
      cursor = -1;
      applyFold();
      measure();
      placeMarks();
      setCount();
      requestDraw();
    };

    // 그림·글꼴이 늦게 얹혀 높이가 바뀌면 앵커·선이 함께 낡는다 — 재서 다시 긋는다.
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            measure();
            placeMarks();
            requestDraw();
          });
    resizeObserver?.observe(body);
    resizeObserver?.observe(beforeDocEl);
    resizeObserver?.observe(afterDocEl);
    lifecycle.add(() => resizeObserver?.disconnect());

    const localize = (): void => {
      attributes.attribute('aria-label', t('diff.region'));
      if (locale !== undefined) attributes.attribute('dir', localeDirection(localeValue(locale)));
      bar.setAttribute('aria-label', t('diff.controls'));
      for (const [button, key] of [
        [prevButton, 'diff.prev'],
        [nextButton, 'diff.next'],
        [toggleButton, 'diff.onlyChanges'],
      ] as const) {
        button.title = t(key);
        button.setAttribute('aria-label', t(key));
      }
    };
    if (translator.onChange) lifecycle.add(translator.onChange(localize));
    paint(before, after);

    return {
      update(before, after) {
        if (!unmounted) paint(before, after);
      },
      unmount() {
        if (unmounted) return;
        unmounted = true;
        lifecycle.dispose();
      },
    };
  } catch (error) {
    lifecycle.dispose();
    baseline.restore();
    throw error;
  }
}
