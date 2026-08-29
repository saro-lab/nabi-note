// diff 엔트리(`nabi-note/diff`) — wing 이 아니라 홀로 서는 전역 기능이다 (260825_001).
//
// 입력은 `setJson`/`setHtml` 이 받는 것과 같은 결의 **데이터 두 개**다(나비트리 JSON 또는 HTML
// 글자열) — 살아있는 `Nabi` 인스턴스가 있어야 도는 게 아니라서, 임의의 두 저장본을 그대로
// 넣을 수 있다. 매칭은 `_id` 를 안 본다(260825_001 4절 1번): 흔한 쓰임이 이미 저장된 과거본과
// 지금 상태의 비교라, 저장된 쪽에 지금 트리로 이어지는 `_id` 계보가 있으리라는 보장이 없다.
//
// 두 문이 나간다:
//   - `diffDocs`  — 순수 비교. 블록 매칭 + 글자 단위 diff + 조립 HTML(강조 span 포함)까지 낸 모델.
//   - `mountDiff` — 그 모델로 좌우 2단 읽기 전용 화면을 세운다(커넥터 선·스크롤 동기화·점프·접기).
import { cocoon } from '../schema/cocoon.js';
import { $fromJson, $guarded } from '../schema/json.js';
import type { ElementNode, NabiDoc } from '../schema/types.js';
import { importDoc, parseNodes, renderParagraphHtml, type HtmlOptions } from '../html/index.js';
import type { Registry, StoredHtmlOptions } from '../wing/index.js';
import type { Nabi } from '../editor/index.js';
import { translate } from '../locale/index.js';
import { matchBlocks, type DiffEntry, type DiffKind, type MatchBlock } from './match.js';
import { htmlText, htmlTextFormats, paintHtml, type CharRange } from './paint.js';

export type { CharRange } from './paint.js';
export type { DiffEntry, DiffKind } from './match.js';

// --- 순수 비교 ---------------------------------------------------------------------------------

export interface DiffPaneBlock {
  // 조립 HTML — changed 블록에는 글자 강조 span(.nabi-diff-del/.nabi-diff-ins)이 이미 입혀져 있다.
  readonly html: string;
  readonly text: string;
  // entries 의 인덱스 — 이 블록이 속한 짝.
  readonly entry: number;
}

export interface DocDiff {
  readonly entries: readonly DiffEntry[];
  readonly before: readonly DiffPaneBlock[];
  readonly after: readonly DiffPaneBlock[];
  // kind !== 'same' 인 entry 인덱스 — 이전/다음 점프의 차례표.
  readonly changes: readonly number[];
}

export type DiffOptions = StoredHtmlOptions;

const jobOf = (registry: Registry, options?: DiffOptions): HtmlOptions => ({
  env: registry.env,
  builders: registry.builders,
  ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
});

// 나비트리 JSON 또는 HTML 글자열 → 내부 트리. 거절 규칙은 setJson/setHtml 과 같다(아니면 null).
// HTML 글자열 갈래는 DOMParser 를 쓰므로 브라우저 전용이다 — 없는 환경에서는 null 로 거절한다.
function normalizeInput(input: unknown, registry: Registry, options?: DiffOptions): NabiDoc | null {
  if (typeof input === 'string') {
    if (typeof DOMParser === 'undefined') return null;
    return $guarded('diff', null, () => {
      const nodes = parseNodes(input);
      const imported = importDoc(nodes, {
        env: registry.env,
        ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
        ...(registry.claim ? { claim: registry.claim } : {}),
      });
      return cocoon(imported, registry.env);
    });
  }
  return $fromJson(input, registry.env);
}

const DEL_CLASS = 'nabi-diff-del';
const INS_CLASS = 'nabi-diff-ins';

export function diffDocs(
  before: unknown,
  after: unknown,
  registry: Registry,
  options?: DiffOptions,
): DocDiff | null {
  const beforeDoc = normalizeInput(before, registry, options);
  const afterDoc = normalizeInput(after, registry, options);
  if (!beforeDoc || !afterDoc) return null;

  return $guarded('diffDocs', null, () => {
    const job = jobOf(registry, options);
    const toBlocks = (doc: NabiDoc): MatchBlock[] =>
      doc.map((block: ElementNode) => {
        const html = renderParagraphHtml(block, job);
        return { key: html, text: htmlText(html), formats: htmlTextFormats(html) };
      });
    const beforeBlocks = toBlocks(beforeDoc);
    const afterBlocks = toBlocks(afterDoc);
    const entries = matchBlocks(beforeBlocks, afterBlocks);

    const beforeViews: DiffPaneBlock[] = new Array(beforeBlocks.length);
    const afterViews: DiffPaneBlock[] = new Array(afterBlocks.length);
    const changes: number[] = [];
    entries.forEach((entry, at) => {
      if (entry.kind !== 'same') changes.push(at);
      if (entry.before !== null) {
        const block = beforeBlocks[entry.before] as MatchBlock;
        const ranges = entry.beforeRanges ?? [];
        beforeViews[entry.before] = {
          html: ranges.length > 0 ? paintHtml(block.key, ranges, DEL_CLASS) : block.key,
          text: block.text,
          entry: at,
        };
      }
      if (entry.after !== null) {
        const block = afterBlocks[entry.after] as MatchBlock;
        const ranges = entry.afterRanges ?? [];
        afterViews[entry.after] = {
          html: ranges.length > 0 ? paintHtml(block.key, ranges, INS_CLASS) : block.key,
          text: block.text,
          entry: at,
        };
      }
    });
    return { entries, before: beforeViews, after: afterViews, changes };
  });
}

// --- 화면 --------------------------------------------------------------------------------------

export interface DiffMountOptions {
  readonly root: HTMLElement;
  readonly before: unknown;
  readonly after: unknown;
  readonly registry: Registry;
  readonly allowLocalUrls?: boolean;
  readonly locale?: string;
}

export interface DiffMount {
  update(before: unknown, after: unknown): void;
  unmount(): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// 접기 모드에서 바뀐 덩어리 앞뒤로 남기는 맥락 블록 수.
const FOLD_CONTEXT = 1;

// 아이콘 단추 하나 — 판(mountDiff)과 전체화면(mountDiffWing)이 같은 모양을 나눠 쓴다.
function diffButton(doc: Document, title: string, path: string): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'nabi-diff-btn';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  return button;
}

export function mountDiff(options: DiffMountOptions): DiffMount {
  const { root, registry, locale } = options;
  const doc = root.ownerDocument;
  const t = (key: string): string => translate(key, locale ?? 'en');
  ensureCss(doc);
  root.classList.add('nabi-diff');

  const el = (cls: string, tag = 'div'): HTMLElement => {
    const node = doc.createElement(tag);
    node.className = cls;
    return node;
  };
  const iconButton = (title: string, path: string): HTMLButtonElement => diffButton(doc, title, path);

  const bar = el('nabi-diff-bar');
  const prevButton = iconButton(t('diff.prev'), 'M3.5 10 8 5.5 12.5 10');
  const nextButton = iconButton(t('diff.next'), 'M3.5 6 8 10.5 12.5 6');
  const count = el('nabi-diff-count', 'span');
  const spacer = el('nabi-diff-spacer', 'span');
  // "바뀐 부분만" 은 글자가 아니라 상하 세모 화살표다(주인 지시 2026-08-25) — 서로를 향해
  // 접히는 모양이 곧 "안 바뀐 구간을 접는다" 다. 말은 title/aria 로 남는다.
  const toggleButton = iconButton(t('diff.onlyChanges'), 'M4.5 2.5 8 6l3.5-3.5M4.5 13.5 8 10l3.5 3.5');
  toggleButton.setAttribute('aria-pressed', 'false');
  // 숫자(0 / 0)와 접기는 왼쪽 무리(이전/다음 곁)다 — 오른쪽 끝은 전체화면(mountDiffWing)이
  // 얹는 닫기(X) 하나만의 자리다(주인 지시 2026-08-25).
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

  let model: DocDiff | null = null;
  let beforeEls: HTMLElement[] = [];
  let afterEls: HTMLElement[] = [];
  let cursor = -1;
  let folded = false;
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
    root.classList.toggle('nabi-diff-only', folded);
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
      return { top: blockEl.offsetTop - pane.scrollTop, bottom: blockEl.offsetTop + blockEl.offsetHeight - pane.scrollTop };
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
    // 다음 블록이 없다 — 문서 **끝**에 붙은 짝이다. "있었을 자리"는 마지막 블록의 아랫변이지
    // 패인 바닥이 아니다: scrollHeight 는 빈 여백까지의 높이라, 짧은 문서에서 선이 글을 지나
    // 허공 바닥으로 떨어졌다(주인 신고 2026-08-25).
    for (let k = els.length - 1; k >= 0; k -= 1) {
      const blockEl = els[k];
      if (visible(blockEl)) return blockEl.offsetTop + blockEl.offsetHeight;
    }
    return 0;
  };

  // changed 짝의 선 색 — 왼쪽(before)은 빨강, 오른쪽(after)은 초록으로 흐르는 그라디언트다.
  // `userSpaceOnUse` 가 요점: 어느 선이든 **같은 x 에서 같은 색**이라, changed 선끼리 겹쳐도
  // 겹친 자리가 딴 색으로 안 드러난다(아래 시트의 불투명 규칙과 짝이다). id 는 마운트마다 다르게
  // 짓는다 — 한 페이지에 diff 가 둘이면 defs 의 id 가 부딪힌다.
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

  // 반대쪽 패인의 "있었을 자리" 한 줄 — 추가는 왼쪽(before)에 초록, 지움은 오른쪽(after)에
  // 빨강(주인 지시 2026-08-25: 오른쪽에만 초록이 보이고 왼쪽에는 아무 표시가 없었다).
  // 거터의 이음선이 점으로 모이는 그 y 에, 같은 색으로 이어지는 선이다. 패인 안에 살아서
  // 스크롤과 함께 구른다 — 스크롤마다 다시 놓을 것이 없고, 레이아웃이 바뀔 때만 다시 놓는다.
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
  const requestDraw = (): void => {
    if (raf !== 0) return;
    raf = root.ownerDocument.defaultView?.requestAnimationFrame(() => {
      raf = 0;
      draw();
    }) ?? 0;
  };

  // --- 스크롤 동기화 — 세로는 앵커 짝 기준, 가로는 비율 ---------------------------------------
  // 프로그램이 옮긴 스크롤이 낳는 메아리 이벤트를 한 번 삼킨다.
  let syncing: HTMLElement | 'all' | null = null;
  const releaseSync = (): void => {
    root.ownerDocument.defaultView?.requestAnimationFrame(() => {
      syncing = null;
    });
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

  // --- 이전/다음 점프 -------------------------------------------------------------------------
  const setCount = (): void => {
    const total = model?.changes.length ?? 0;
    count.textContent = `${cursor < 0 ? 0 : cursor + 1} / ${total}`;
    prevButton.disabled = cursor <= 0;
    nextButton.disabled = total === 0 || cursor >= total - 1;
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
  prevButton.addEventListener('click', () => jump(cursor - 1));
  nextButton.addEventListener('click', () => jump(cursor + 1));
  toggleButton.addEventListener('click', () => {
    folded = !folded;
    applyFold();
    measure();
    placeMarks();
    requestDraw();
  });

  const openLinksInNewTab = (root: HTMLElement): void => {
    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  };

  const paint = (before: unknown, after: unknown): void => {
    model = diffDocs(before, after, registry, options.allowLocalUrls ? { allowLocalUrls: true } : undefined);
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
  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    measure();
    placeMarks();
    requestDraw();
  });
  resizeObserver?.observe(body);
  resizeObserver?.observe(beforeDocEl);
  resizeObserver?.observe(afterDocEl);

  paint(options.before, options.after);

  return {
    update: paint,
    unmount() {
      resizeObserver?.disconnect();
      if (raf !== 0) root.ownerDocument.defaultView?.cancelAnimationFrame(raf);
      beforePane.removeEventListener('scroll', onBeforeScroll);
      afterPane.removeEventListener('scroll', onAfterScroll);
      root.replaceChildren();
      root.classList.remove('nabi-diff', 'nabi-diff-only');
    },
  };
}

// --- diff wing 의 배선 — 대조 스냅샷 + 전체화면 판 ----------------------------------------------
//
// 대조 상태는 **문서를 실은 순간**(setJson·setHtml — 신호의 `loaded`)마다 그 문서로 갈린다.
// 타자·붙여넣기·undo 는 대조 상태를 안 건드린다 — 붙여넣기는 setHtml 을 안 타므로(표면의
// 붙여넣기는 커맨드다), 판이 답하는 물음은 "실은 뒤 무엇이 달라졌나" 다.
// 툴바의 diff 단추(`diffWing`, action: host)를 받은 호스트가 `open()` 을 부른다.

export interface DiffWingMountOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 판이 닫힌 뒤 포커스가 돌아갈 편집 표면.
  readonly surface: HTMLElement;
  readonly allowLocalUrls?: boolean;
  readonly locale?: string;
}

export interface DiffWingMount {
  open(): void;
  close(): void;
  // 지금 대조 상태 — 마지막으로 실은 문서의 JSON 이다.
  baseline(): unknown;
  unmount(): void;
}

export function mountDiffWing(options: DiffWingMountOptions): DiffWingMount {
  const { nabi, registry, surface } = options;
  const doc = surface.ownerDocument;
  const t = (key: string): string => translate(key, options.locale ?? 'en');
  ensureCss(doc);

  let base: unknown = nabi.getJson();
  const offChange = nabi.onChange((change) => {
    if (change.loaded) base = nabi.getJson();
  });

  let screen: HTMLElement | null = null;
  let inner: DiffMount | null = null;

  const onKey = (event: Event): void => {
    if ((event as KeyboardEvent).key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  };

  const close = (): void => {
    if (!screen) return;
    doc.removeEventListener('keydown', onKey, true);
    inner?.unmount();
    inner = null;
    screen.remove();
    screen = null;
    surface.focus({ preventScroll: true });
  };

  const open = (): void => {
    // 이미 떠 있으면 그 자리에서 지금 상태로 다시 그린다 — 판이 둘로 겹치지 않는다.
    if (screen) {
      inner?.update(base, nabi.getJson());
      return;
    }
    screen = doc.createElement('div');
    screen.className = 'nabi-diff-screen';
    const host = doc.createElement('div');
    host.className = 'nabi-diff-screen-host';
    screen.append(host);
    doc.body.append(screen);
    inner = mountDiff({
      root: host,
      before: base,
      after: nabi.getJson(),
      registry,
      ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
      ...(options.locale ? { locale: options.locale } : {}),
    });
    // 닫기(X)는 제 줄을 안 만들고 diff 줄의 오른쪽 끝에 얹는다 — 한 줄을 아낀다
    // (주인 지시 2026-08-25). 줄은 방금 mountDiff 가 세웠으니 반드시 있다.
    const closeButton = diffButton(doc, t('close'), 'M4.5 4.5l7 7M11.5 4.5l-7 7');
    closeButton.addEventListener('click', close);
    host.querySelector('.nabi-diff-bar')?.append(closeButton);
    doc.addEventListener('keydown', onKey, true);
  };

  return {
    open,
    close,
    baseline: () => base,
    unmount() {
      close();
      offChange();
    },
  };
}

// --- 시트 --------------------------------------------------------------------------------------

function ensureCss(doc: Document): void {
  if (doc.head.querySelector('style[data-nabi-diff]')) return;
  const style = doc.createElement('style');
  style.setAttribute('data-nabi-diff', '');
  style.textContent = DIFF_CSS;
  doc.head.appendChild(style);
}

// `--nabi-*` 토큰을 대체값과 함께 부른다 — 편집기 시트(`nabi.css`) 없이 홀로 설 때도 옷이 있다.
// 다크 판정은 코어와 같은 두 길이다: 호스트의 `.dark` 클래스, 또는 `data-nabi-theme`.
export const DIFF_CSS = `
.nabi-diff {
  --nabi-diff-del: rgb(217 59 59 / 12%);
  --nabi-diff-del-hard: rgb(217 59 59 / 30%);
  --nabi-diff-ins: rgb(22 163 74 / 12%);
  --nabi-diff-ins-hard: rgb(22 163 74 / 30%);
  --nabi-diff-move: rgb(59 111 224 / 12%);
  --nabi-diff-move-hard: rgb(59 111 224 / 30%);
  /* 커넥터 선 전용 — **불투명**이다. 반투명이면 같은 색 선이 겹친 자리가 진해져 여러 선으로
     읽힌다(주인 지시 2026-08-25: 겹쳐도 녹색은 녹색 하나, 빨강은 빨강 하나). 바탕에 미리
     섞어 두면 겹침이 안 보인다. 섞는 비율은 블록 배경(위 12%·14% 알파)과 **같은 값**이다 —
     블록의 연한 색이 패인 끝에서 선으로 그대로 이어진다(주인 지시: 그 연한 상태로 라인까지). */
  --nabi-diff-line-del: color-mix(in srgb, rgb(217 59 59) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(22 163 74) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-move: color-mix(in srgb, rgb(59 111 224) 12%, var(--nabi-bg, #fff));
  /* "있었을 자리" 2px 줄 전용 — 연한 선 색으로는 두 픽셀이 안 보여서 한 단계 진하게. */
  --nabi-diff-mark-del: color-mix(in srgb, rgb(217 59 59) 30%, var(--nabi-bg, #fff));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(22 163 74) 30%, var(--nabi-bg, #fff));
  display: flex; flex-direction: column; gap: .375rem;
  color: var(--nabi-fg, #1b1b1f);
}
:where(html, body).dark .nabi-diff:not([data-nabi-theme="light"]),
.nabi-diff[data-nabi-theme="dark"] {
  /* 표준 토큰도 제 몸에 든다 — 이 층은 편집기(.nabi) 밖(body·홀로 선 자리)에 설 수 있어
     상속이 안 닿는다(scrim 이 제 몸에 토큰을 드는 그 규칙). 실측 2026-08-26: 다크 페이지에서
     패인만 흰색으로 남았다 — 패인의 var(--nabi-bg, #fff) 가 대체값으로 떨어져서다. */
  color-scheme: dark;
  --nabi-fg: #e8e8ee; --nabi-bg: #16161a; --nabi-muted: #9a9aa6; --nabi-line: #2e2e36;
  --nabi-accent: #7ea2ff; --nabi-soft: rgb(255 255 255 / 7%);
  /* 다크의 기조색 — **흰색 쪽으로 밝히고 채도를 뺀** 파스텔이다(주인 지시 2026-08-26, 두 차례:
     "밝기 올리고 채도 빼기" → "더 흰색에 가깝게, 묻혀서 안 보인다"). 어두운 바탕에서 칠이
     보이는 것은 색상이 아니라 **밝기 차**라, 알파도 한 단계 올렸다. 이음선(line)의 혼합비는
     블록 알파와 같은 값이어야 한다 — 다르면 패인 끝에서 색이 이어지다 톤이 갈린다. */
  --nabi-diff-del: rgb(248 196 200 / 18%);
  --nabi-diff-del-hard: rgb(248 196 200 / 40%);
  --nabi-diff-ins: rgb(178 238 200 / 16%);
  --nabi-diff-ins-hard: rgb(178 238 200 / 36%);
  --nabi-diff-move: rgb(200 214 250 / 18%);
  --nabi-diff-move-hard: rgb(200 214 250 / 38%);
  --nabi-diff-line-del: color-mix(in srgb, rgb(248 196 200) 18%, var(--nabi-bg, #16161a));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(178 238 200) 16%, var(--nabi-bg, #16161a));
  --nabi-diff-line-move: color-mix(in srgb, rgb(200 214 250) 18%, var(--nabi-bg, #16161a));
  --nabi-diff-mark-del: color-mix(in srgb, rgb(248 196 200) 40%, var(--nabi-bg, #16161a));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(178 238 200) 36%, var(--nabi-bg, #16161a));
}
:where(html, body).light .nabi-diff:not([data-nabi-theme="dark"]),
.nabi-diff[data-nabi-theme="light"] {
  color-scheme: light;
  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-diff-del: rgb(217 59 59 / 12%);
  --nabi-diff-del-hard: rgb(217 59 59 / 30%);
  --nabi-diff-ins: rgb(22 163 74 / 12%);
  --nabi-diff-ins-hard: rgb(22 163 74 / 30%);
  --nabi-diff-move: rgb(59 111 224 / 12%);
  --nabi-diff-move-hard: rgb(59 111 224 / 30%);
  --nabi-diff-line-del: color-mix(in srgb, rgb(217 59 59) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-ins: color-mix(in srgb, rgb(22 163 74) 12%, var(--nabi-bg, #fff));
  --nabi-diff-line-move: color-mix(in srgb, rgb(59 111 224) 12%, var(--nabi-bg, #fff));
  --nabi-diff-mark-del: color-mix(in srgb, rgb(217 59 59) 30%, var(--nabi-bg, #fff));
  --nabi-diff-mark-ins: color-mix(in srgb, rgb(22 163 74) 30%, var(--nabi-bg, #fff));
}

.nabi-diff-bar { display: flex; align-items: center; gap: .25rem; }
.nabi-diff-spacer { flex: 1; }
.nabi-diff-btn {
  appearance: none; border: 1px solid var(--nabi-line, #e2e2e8); border-radius: 0;
  background: transparent; color: inherit; cursor: pointer;
  block-size: 1.75rem; min-inline-size: 1.75rem; padding: 0 .375rem;
  display: inline-flex; align-items: center; justify-content: center;
  font: inherit; font-size: .8125rem;
}
.nabi-diff-btn:hover:not(:disabled) { color: var(--nabi-accent, #3b6fe0); }
.nabi-diff-btn:disabled { opacity: .4; cursor: default; }
.nabi-diff-btn[aria-pressed="true"] { color: var(--nabi-accent, #3b6fe0); }
.nabi-diff-btn:active:not(:disabled) { transform: translateY(2px); transition: transform 60ms ease-out; }
.nabi-diff-btn svg { inline-size: 1rem; block-size: 1rem; }
.nabi-diff-count {
  font-size: .75rem; color: var(--nabi-muted, #6b6b76);
  font-variant-numeric: tabular-nums; margin-inline-start: .25rem;
}

.nabi-diff-body {
  display: grid; grid-template-columns: minmax(0, 1fr) 1.75rem minmax(0, 1fr);
  border: 1px solid var(--nabi-line, #e2e2e8); background: var(--nabi-bg, #fff);
}
.nabi-diff-pane {
  position: relative; overflow: scroll;
  block-size: var(--nabi-diff-height, 30rem);
  background: var(--nabi-bg, #fff);
}
/* 스크롤바 상시 노출 — overflow:scroll 에 더해, 오버레이 스크롤바(macOS)도 고전 모드로 세운다. */
.nabi-diff-pane::-webkit-scrollbar { inline-size: .625rem; block-size: .625rem; }
.nabi-diff-pane::-webkit-scrollbar-track { background: transparent; }
.nabi-diff-pane::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--nabi-fg, #1b1b1f) 26%, transparent);
  border-radius: .3125rem;
}
.nabi-diff-pane { scrollbar-width: thin; }
/* 좌우 여백이 없다 — 색 블록이 패인의 양 끝까지 닿아, 거터의 이음선과 한 몸으로 이어진다
   (주인 지시 2026-08-25: 좌우 패딩·앞 보더를 걷고 연한 색으로 라인까지 연결).
   폭은 패인 그대로다 — 옛 판의 \`inline-size: max-content\` 는 **문단의 줄바꿈을 죽여서**
   (max-content 는 글을 한 줄로 잰다) 문서가 패인의 여덟 배(실측 1855px/패인 223px)로 터졌고
   그림·영상의 % 폭 표식도 기준을 잃었다(주인 신고 2026-08-25). 패인 폭이 기준이면 글은
   줄바꿈하고, %는 살아나고, 넓은 표는 제 스크롤 겉옷(.nabi-scroll) 안에서 구른다. */
.nabi-diff-doc { padding: .75rem 0; box-sizing: border-box; }

.nabi-diff-gutter { position: relative; overflow: hidden; background: var(--nabi-soft, rgb(0 0 0 / 4.5%)); }
.nabi-diff-gutter svg { position: absolute; inset: 0; display: block; }
/* 선은 소속 색 그대로다 — 지움(빨강)·추가(초록)·이동(파랑), changed 는 왼쪽 빨강에서 오른쪽
   초록으로 가는 그라디언트(색 정지점만 여기, 마운트별 id 를 무는 fill 은 JS 인라인).
   테두리(stroke)는 걷었다 — 겹친 선 속에서 남의 몸 위로 금을 그어, "선 하나" 로 안 보인다. */
.nabi-diff-line { stroke: none; }
.nabi-diff-line-removed { fill: var(--nabi-diff-line-del); }
.nabi-diff-line-added { fill: var(--nabi-diff-line-ins); }
.nabi-diff-line-moved { fill: var(--nabi-diff-line-move); }
.nabi-diff-stop-del { stop-color: var(--nabi-diff-line-del); }
.nabi-diff-stop-ins { stop-color: var(--nabi-diff-line-ins); }

/* 반대쪽 패인의 "있었을 자리" 한 줄 — 추가는 왼쪽(before)에 초록, 지움은 오른쪽(after)에 빨강.
   이음선과 같은 불투명 토큰이라 거터의 선이 이 줄로 이어져 보이고, 같은 자리에 여러 개가
   겹쳐도(이웃한 추가 여럿) 한 줄로 보인다. */
.nabi-diff-mark { position: absolute; inset-inline: 0; block-size: 2px; pointer-events: none; }
.nabi-diff-mark-added { background: var(--nabi-diff-mark-ins); }
.nabi-diff-mark-removed { background: var(--nabi-diff-mark-del); }

/* 전체화면 판 — diff wing 의 단추가 여는 화면이다. 편집기 밖(body)에 서므로 색은 대체값과
   다크 갈래를 제 몸에 든다(맨 위 토큰 블록과 같은 규칙). */
.nabi-diff-screen {
  position: fixed; inset: 0; z-index: 80; box-sizing: border-box;
  background: var(--nabi-bg, #fff); color: var(--nabi-fg, #1b1b1f);
  display: flex; flex-direction: column; gap: .5rem; padding: .75rem;
}
:where(html, body).dark .nabi-diff-screen:not([data-nabi-theme="light"]),
.nabi-diff-screen[data-nabi-theme="dark"] {
  background: var(--nabi-bg, #16161a); color: var(--nabi-fg, #e8e8ee);
  --nabi-line: #2e2e36; --nabi-soft: rgb(255 255 255 / 7%);
}
/* 판이 남은 높이를 다 먹는다 — 패인의 고정 높이(--nabi-diff-height)를 화면 채움으로 바꾼다. */
.nabi-diff-screen-host { flex: 1; min-block-size: 0; }
.nabi-diff-screen-host .nabi-diff { block-size: 100%; }
.nabi-diff-screen-host .nabi-diff-body { flex: 1; min-block-size: 0; grid-template-rows: minmax(0, 1fr); }
.nabi-diff-screen-host .nabi-diff-pane { block-size: auto; }

.nabi-diff-block { padding: .125rem 0; }
/* 블록 껍데기가 문단의 직계 자리를 차지하므로 UA 기본 여백을 속에서 걷는다 —
   문단 사이 간격은 nabi.css 의 \`.nabi-content > *\` 가 껍데기에 그대로 준다. */
.nabi-diff-block > * { margin: 0; }
.nabi-diff-block[data-diff="removed"] { background: var(--nabi-diff-del); }
.nabi-diff-block[data-diff="added"] { background: var(--nabi-diff-ins); }
.nabi-diff-before .nabi-diff-block[data-diff="changed"] { background: var(--nabi-diff-del); }
.nabi-diff-after .nabi-diff-block[data-diff="changed"] { background: var(--nabi-diff-ins); }
.nabi-diff-block[data-diff="moved"] { background: var(--nabi-diff-move); }
.nabi-diff-block .nabi-diff-del { background: var(--nabi-diff-del-hard); }
.nabi-diff-block .nabi-diff-ins { background: var(--nabi-diff-ins-hard); }
.nabi-diff-focus { outline: 2px solid var(--nabi-accent, #3b6fe0); outline-offset: -2px; }

/* 접기 — 안 바뀐 구간은 숨고, 구간마다 첫 블록이 줄임 표시 한 줄로 남는다. */
.nabi-diff-only .nabi-diff-cut { display: none; }
.nabi-diff-only .nabi-diff-gap > * { display: none; }
.nabi-diff-only .nabi-diff-gap {
  background: var(--nabi-soft, rgb(0 0 0 / 4.5%));
  padding-block: 0;
}
.nabi-diff-only .nabi-diff-gap::before {
  content: "\\00b7 \\00b7 \\00b7";
  display: block; text-align: center;
  color: var(--nabi-muted, #6b6b76); font-size: .75rem; line-height: 1.5;
}
`;
