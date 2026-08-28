// contenteditable 표면 — 정책(actions·autoformat·vessel·redraw)은 전부 아래 순수부에 있고
// 이 파일은 그것을 브라우저 이벤트에 배선만 한다. EditContext 가 서는 날 갈리는 것도 이 파일이다
// (포트 뒤 교체).
//
// 원칙: 정본은 트리다. 화면 캐럿은 파생이고, 어긋나면 트리 쪽으로 교정한다.
// 예외 구간은 IME 조합뿐 — 그동안은 DOM 이 정답이고, 끝나는 순간 한 번에 따라잡는다.
import { isElement, isWrapper, type NabiDoc } from '../schema/index.js';
import { holders, isHolder, nodeAt, terminalOf } from '../doc/index.js';
import { isCollapsed, sameSelection, selectObject, type Selection } from '../caret/index.js';
import { localeDirection, translate } from '../locale/index.js';
import type { Nabi, NabiChange } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import { renderEditorHtml, renderParagraphHtml, type HtmlOptions } from '../html/index.js';
import type { IoFilter } from '../io/index.js';
import { makeSurfaceActions, type SurfaceActions } from './actions.js';
import { diffPlain, holderTextOf } from './text.js';
import { domTextOf, fromDomPoint, holderElOf, pathOfId, toDomPoint, ZERO_WIDTH } from './map.js';
import { rememberClip } from './clip.js';
import { clipHtmlOf, loadClipboard } from './clipboard.js';
import { ioFiltersOf } from './filters.js';
import { makePasteFlow } from './paste.js';
import { planRedraw } from './redraw.js';
import type { EditSurfacePort, ReadCaret } from './port.js';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const SHOW_TEXT = 4;

const eventElement = (target: EventTarget | null): Element | null =>
  target !== null && (target as Node).nodeType === ELEMENT_NODE ? (target as Element) : null;

export interface SurfaceOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  // 서버가 그린 편집기 DOM 을 다시 그리지 않고 이어받는다 — 어긋나면 그때만 새로 그린다.
  readonly hydrate?: boolean;
  readonly allowLocalUrls?: boolean;
  // 글의 말 — **방향을 정한다** (098). 주면 편집 영역에 `dir` 을 적어, 아랍어·우르두에서는
  // 오른쪽에서 왼쪽으로 쓴다. 페이지가 `<html dir>` 로 아무 말도 안 해도 그렇다.
  // 안 주면 안 건드린다 — 방향을 제 손으로 쥐는 호스트의 것을 덮으면 안 된다.
  readonly locale?: string;
  // 빈 편집기의 안내글 — 아무것도 없을 때 첫 줄에 흐리게 서는 그 말이다.
  // 안 주면 코어 사전의 말이 로케일대로 선다. **빈 글자열을 주면 안내글이 없다**(끄는 손).
  // 줄바꿈(`\n`)은 그대로 줄바꿈으로 선다 — 여러 줄짜리 안내글이 된다.
  readonly placeholder?: string;
  // 호스트가 이 표면에만 끼우는 IO 필터 — **맨 앞에 선다**. 레지스트리에 끼운 것
  // (`makeRegistry(wings, { ioFilters })`)은 이미 wing 필터 앞에 접혀 있고, 내장 셋(html·md)은
  // 늘 마지막이다. 그래서 최종 순서는 여기 것 → 레지스트리 것 → 내장이다.
  readonly ioFilters?: readonly IoFilter[];
  // 드롭·붙여넣기로 온 파일이 흘러가는 곳 (업로드 wing 이 11 에서 잇는다). 없으면 삼킨다.
  readonly fileSink?: (files: readonly File[]) => void;
  readonly doubleEnterMs?: number;
  // 교정 핑퐁 유예(ms) — 우리 교정 직후 브라우저가 되받아치면 한 프레임 쉬었다 다시 쓴다 (Q10).
  readonly correctionDeferMs?: number;
}

export interface Surface {
  readonly actions: SurfaceActions;
  readonly port: EditSurfacePort;
  focus(): void;
  redrawAll(): void;
  unmount(): void;
}

// 시트에 넣을 글자열 한 벌 — CSS `content` 가 읽는 **따옴표 안의 모양**이다 (안내글의 말).
//
// **줄바꿈은 `\A` 다.** 자바스크립트의 `'\n'` 을 그대로 흘리면 두 자리에서 진다: CSS 는
// 역슬래시+글자를 "그 글자"로 읽어 `\n` 이 그냥 **n** 이 되고, 진짜 개행을 넣어도 보통의
// 공백처럼 뭉갠다. CSS 의 줄바꿈은 16진 escape `\A` 이고, 뒤에 붙인 공백 하나가 그 escape 를
// 끝내는 표시라 글자로 안 센다 — 줄바꿈 다음에 오는 진짜 공백은 그대로 남는다.
// 실제로 줄이 서려면 시트 쪽의 `white-space: pre-line` 이 받쳐야 한다.
export function cssQuoted(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n?|\n/g, '\\A ');
  return `"${escaped}"`;
}

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export function mountSurface(options: SurfaceOptions): Surface {
  const { nabi, registry, root } = options;
  const env = nabi.$env;
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const doc = (): NabiDoc => nabi.$doc();
  const htmlOptions: HtmlOptions = {
    env,
    builders: registry.builders,
    ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  };
  // 일반 편집 상태인가 — **연타 몸짓의 문**이다 (260823_004 ④).
  //
  // 새 전역 깃발을 안 세운다: 위에 뜬 것들은 이미 DOM 에 제 표식을 남기고 있고, 업로드 잠금은
  // 인스턴스의 `$lock` 이 든다(그쪽은 actions 가 직접 묻는다). 여기서 보는 것은 셋이다 —
  // 전체화면(크롬 뿌리의 클래스)· 힌트 배지(같은 뿌리의 클래스)· 문서에 실재하는 덮개와 판.
  //
  // 덮개·판은 사실 캡처에서 `preventDefault`(+ 덮개는 `stopPropagation`)까지 하므로 키가
  // 여기 오지도 않는다 — 그래도 함께 본다. **실제로 새는 자리는 전체화면 하나**다:
  // `ui/overlay.ts` 의 귀는 문서 **버블**이라 편집기가 먼저 먹고, 막지도 소비하지도 않는다.
  const layered = '.nabi-scrim, .nabi-panel';
  const plain = (): boolean =>
    root.closest('.is-fullscreen') === null &&
    root.closest('.nabi-hinting') === null &&
    owner.querySelector(layered) === null;

  const actions = makeSurfaceActions({
    nabi,
    registry,
    plain,
    ...(options.doubleEnterMs !== undefined ? { doubleEnterMs: options.doubleEnterMs } : {}),
  });

  // 붙여넣기가 지나는 필터 목록 — 짓는 법은 `filters.ts` 하나다(저장 판도 같은 목록을 본다).
  const takePaste = makePasteFlow({
    nabi,
    filters: ioFiltersOf({
      registry,
      ...(options.ioFilters ? { extra: options.ioFilters } : {}),
      ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
    }),
    locale: () => options.locale ?? nabi.$locale(),
    ...(options.fileSink ? { fileSink: options.fileSink } : {}),
  });

  // --- 상태 (전부 이 mount 의 것) ------------------------------------------------------
  let composing = false;
  let reconciling = false;
  let syncing = false; // 화면 → 트리 동기화 중 — 트리 → 화면 되쓰기를 멈춘다(왕복 차단)
  let expected: Selection | null = null; // 쓰기 토큰 — 우리가 쓴 선택의 지문 (setTimeout 금지)
  let lastCorrectionAt = 0;
  let correctionQueued = false;
  let correctionFrame = 0;
  let replaySelectAll = false;
  let deferred: (() => void)[] = [];
  let compositionPath: readonly number[] | null = null;
  let compositionSelection: Selection | null = null;
  let compositionAnchorId: string | null = null;
  let compositionHolderId: string | null = null;
  let compositionTopIds: readonly string[] = [];
  let redrawAfterComposition = false;
  let compositionConflict = false;

  // --- 그리기 (문단 단위 — 전체 innerHTML 은 mount 최초와 어긋난 hydrate 뿐) ------------------
  const childOf = (id: string): Element | null => {
    for (const el of Array.from(root.children)) if (el.getAttribute('data-key') === id) return el;
    return null;
  };

  const renderAll = (): void => {
    root.innerHTML = renderEditorHtml(doc(), htmlOptions);
  };

  const adopted = (): boolean => {
    const ids = doc().map((node) => node._id);
    const keys = Array.from(root.children).map((el) => el.getAttribute('data-key'));
    return ids.length === keys.length && ids.every((id, i) => id !== undefined && keys[i] === id);
  };

  const domMatchesTree = (): boolean => {
    if (!adopted()) return false;
    for (const item of holders(doc(), env)) {
      if (typeof item.node._id !== 'string') return false;
      const el = holderElOf(root, item.node._id);
      if (!el || domTextOf(el) !== holderTextOf(item.node, terminalOf(env))) return false;
    }
    return true;
  };

  const applyRedraw = (change: NabiChange): void => {
    for (const op of planRedraw(doc(), change)) {
      if (op.kind === 'remove') {
        childOf(op.id)?.remove();
        continue;
      }
      const node = doc()[op.index];
      if (node === undefined) continue;
      const html = renderParagraphHtml(node, htmlOptions, true);
      const existing = childOf(op.id);
      if (existing) {
        existing.outerHTML = html;
        continue;
      }
      const anchor = root.children[op.index];
      if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
      else root.insertAdjacentHTML('beforeend', html);
    }
  };

  const redrawTopAt = (path: readonly number[]): void => {
    const top = nodeAt(doc(), [path[0] as number]);
    if (top && typeof top._id === 'string') {
      applyRedraw({ doc: true, selection: false, armed: false, paragraphs: [top._id], removed: [] });
    }
  };

  // --- 캐럿 사상 ------------------------------------------------------------------------------
  const domSelection = (): globalThis.Selection | null => owner.getSelection?.() ?? view?.getSelection() ?? null;

  const writeCaret = (sel: Selection): void => {
    const s = domSelection();
    if (!s) return;
    const anchor = toDomPoint(root, doc(), env, sel.anchor);
    const focus = toDomPoint(root, doc(), env, sel.focus);
    if (!anchor || !focus) return;
    expected = sel;
    try {
      s.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
      // 빈 편집기를 지운 직후처럼 포커스가 이미 안에 있는 상태에서는 다음 compositionstart 를
      // 기다리면 Android IME 가 <br> 위에서 조합 대상을 먼저 정해 버린다. 캐럿을 쓴 이 순간에
      // 진짜 텍스트 노드 자리를 함께 준비한다.
      if (owner.activeElement === root || root.contains(owner.activeElement)) ensureCaretSlot();
    } catch {
      expected = null;
    }
  };

  const readCaret = (): ReadCaret | null => {
    const s = domSelection();
    if (!s || s.rangeCount === 0 || !s.anchorNode || !s.focusNode) return null;
    const anchor = fromDomPoint(root, doc(), env, s.anchorNode, s.anchorOffset);
    const focus = fromDomPoint(root, doc(), env, s.focusNode, s.focusOffset);
    if (!anchor || !focus) return null;
    return {
      selection: { anchor: anchor.pos, focus: focus.pos },
      corrected: anchor.corrected || focus.corrected,
    };
  };

  // DOM Selection은 화면에서 방금 일어난 몸짓의 자리이고, 트리 Selection은 마지막으로
  // selectionchange를 받은 자리다. 그 이벤트는 task로 예약되므로 다음 keydown/beforeinput보다
  // 늦을 수 있다. 구조 입력을 실행하기 직전에는 화면의 최신 자리를 트리가 한 번 따라잡는다.
  const adoptSelection = (selection: Selection): void => {
    expected = null;
    if (!sameSelection(nabi.getSelection(), selection)) {
      syncing = true;
      try {
        nabi.select(selection);
      } finally {
        syncing = false;
      }
    }
    // 첨부처럼 구독자가 표현 가능한 바깥 경계로 넓힌 경우에는 화면도 그 답을 따른다.
    const settled = nabi.getSelection();
    if (!sameSelection(settled, selection)) writeCaret(settled);
  };

  const syncSelectionNow = (): void => {
    const read = readCaret();
    if (read) adoptSelection(read.selection);
  };

  // beforeinput의 target range는 "브라우저가 이번 입력으로 바꿀 내용"이다. 특히 모바일
  // 가상 키보드는 keydown 없이 이 이벤트만 내고, Backspace 한 번이 지울 글자 수도 플랫폼과
  // 문자군마다 다르므로 현재의 접힌 캐럿을 다시 계산하는 것보다 이 범위가 더 정확하다.
  const targetSelectionOf = (ev: InputEvent): Selection | null => {
    let ranges: readonly StaticRange[];
    try {
      ranges = ev.getTargetRanges();
    } catch {
      return null;
    }
    const range = ranges[0];
    if (!range) return null;
    const anchor = fromDomPoint(root, doc(), env, range.startContainer, range.startOffset);
    const focus = fromDomPoint(root, doc(), env, range.endContainer, range.endOffset);
    if (!anchor || !focus) return null;
    return { anchor: anchor.pos, focus: focus.pos };
  };

  const syncSelectionForInput = (ev: InputEvent): void => {
    const live = readCaret();
    const target = targetSelectionOf(ev);
    if (target) {
      // 접힌 캐럿의 문단 경계 Backspace는 목록·인용 같은 nabi 구조 규칙이 먼저다. 브라우저가
      // 제안한 문단 간 삭제 범위로 바꾸면 그 규칙을 건너뛰므로, 그때만 실제 접힌 캐럿을 쓴다.
      const crosses = !samePath(target.anchor.path, target.focus.path);
      if (!(live && isCollapsed(live.selection) && crosses)) {
        adoptSelection(target);
        return;
      }
    }
    if (live) adoptSelection(live.selection);
  };

  const caretRect = (): { top: number; bottom: number; left: number; right: number } | null => {
    const s = domSelection();
    if (!s || s.rangeCount === 0) return null;
    const rect = s.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  };

  const port: EditSurfacePort = {
    focus() {
      root.focus({ preventScroll: true });
    },
    readCaret,
    writeCaret,
    onInput(handler) {
      root.addEventListener('input', handler);
      return () => root.removeEventListener('input', handler);
    },
    caretRect,
  };

  // --- 화면 선택 → 트리 (교정 포함) -----------------------------------------------------------
  const onSelectionChange = (): void => {
    if (composing || reconciling) return;
    // 포커스가 편집기 밖이면 화면 선택은 정답이 아니다 — 트리가 정답이다 (옛 059 의 교훈).
    const active = owner.activeElement;
    if (active !== root && !root.contains(active)) return;
    const read = readCaret();
    if (!read) return;
    if (expected && sameSelection(read.selection, expected)) {
      expected = null;
      return;
    }
    adoptSelection(read.selection);
    if (read.corrected) {
      // 표현 불가 자리(문단 사이·물건 속)의 캐럿 — 트리 자리로 되쓴다. 직후에 또 오면 한 프레임
      // 쉬어 브라우저와의 교정 핑퐁을 끊는다 (Q10 — 조정 가능한 상수).
      const deferMs = options.correctionDeferMs ?? 80;
      const t = Date.now();
      if (t - lastCorrectionAt < deferMs) {
        if (!correctionQueued && view) {
          correctionQueued = true;
          correctionFrame = view.requestAnimationFrame(() => {
            correctionFrame = 0;
            correctionQueued = false;
            writeCaret(nabi.getSelection());
          });
        }
      } else {
        writeCaret(nabi.getSelection());
      }
      lastCorrectionAt = t;
    }
  };

  // --- 트리 → 화면 (단일 신호의 바뀐 문단 목록 = 재그리기 목록) --------------------------------
  const offChange = nabi.onChange((change) => {
    // 조합·되맞추기 중에는 DOM 이 정답이다 — 그리지도 되쓰지도 않는다.
    if (composing) {
      // 조합 밖에서 온 문서 변경은 버리지 않고 끝까지 기억한다. 활성 문단 자체가 바뀌었다면
      // DOM 조합 결과로 그 명시적 변경을 덮지 않는다 — 끝에서 트리를 다시 그려 데이터가 이긴다.
      if (change.doc) {
        redrawAfterComposition = true;
        if (compositionTopIds.some((id) => change.paragraphs.includes(id) || change.removed.includes(id))) {
          compositionConflict = true;
        }
      }
      return;
    }
    if (reconciling) return;
    if (change.doc) applyRedraw(change);
    if ((change.doc || change.selection) && !syncing) writeCaret(nabi.getSelection());
  });

  // --- 키 -------------------------------------------------------------------------------------
  const onKeyDown = (ev: KeyboardEvent): void => {
    // 누가 이미 가져간 키는 두 번 안 먹는다.
    //
    // 상황 줄의 힌트 모드가 문서에 **캡처**로 먼저 붙어(ui/hints) Tab·방향키를 제 걸음으로 쓴다.
    // 그 걸음이 여기까지 흘러오면 한 몸짓이 두 번 일한다 — 상황 줄의 겨눔이 옮겨지면서 동시에
    // 코드 상자가 들여쓰기까지 했다. `defaultPrevented` 가 "이건 이미 누구의 것"이라는 표식이다.
    if (ev.defaultPrevented) return;
    if (ev.isComposing || ev.keyCode === 229) {
      // 조합이 지나면 연타 셈이 끊긴다 — 조합을 끝낸 직후의 Esc 가 조합 앞의 Esc 와 이어져
      // 세어지면 안 된다(힌트의 IME 철칙과 같다: 조합 중에는 아무것도 안 센다).
      actions.breakDouble();
      // 조합 중의 보조키+A — 브라우저가 조합 확정에 써 버려 씹힌다. 표식만 남겨 끝에 재생한다.
      if ((ev.metaKey || ev.ctrlKey) && !ev.altKey && (ev.key.toLowerCase() === 'a' || ev.code === 'KeyA')) {
        replaySelectAll = true;
      }
      return;
    }
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && !ev.altKey) {
      const letter = ev.key.length === 1 ? ev.key.toLowerCase() : '';
      if (letter === 'z' || ev.code === 'KeyZ') {
        ev.preventDefault();
        if (ev.shiftKey) nabi.redo();
        else nabi.undo();
        return;
      }
      if (letter === 'y' || ev.code === 'KeyY') {
        ev.preventDefault();
        nabi.redo();
        return;
      }
      if (!ev.shiftKey && (letter === 'a' || ev.code === 'KeyA')) {
        ev.preventDefault();
        actions.selectAll();
        return;
      }
    }
    if (ev.key === 'Tab') {
      ev.preventDefault();
      syncSelectionNow();
      actions.tab(ev.shiftKey);
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      syncSelectionNow();
      if (ev.shiftKey) actions.shiftEnter();
      else actions.enter();
      return;
    }
    if (ev.key === 'Backspace' && !mod) {
      ev.preventDefault();
      syncSelectionNow();
      actions.backspace();
      return;
    }
    if (ev.key === 'Delete' && !mod) {
      ev.preventDefault();
      syncSelectionNow();
      actions.deleteForward();
      return;
    }
    const dir =
      ev.key === 'ArrowLeft' ? 'left'
      : ev.key === 'ArrowRight' ? 'right'
      : ev.key === 'ArrowUp' ? 'up'
      : ev.key === 'ArrowDown' ? 'down'
      : null;
    if (dir && !mod && !ev.shiftKey && !ev.altKey) {
      syncSelectionNow();
      if (actions.arrow(dir)) {
        ev.preventDefault();
        return;
      }
      return;
    }
    syncSelectionNow();
    if (actions.escapeKey(ev.key, ev.repeat)) ev.preventDefault();
  };

  // --- beforeinput — 구조 입력은 전부 우리 것, 문단 안 타이핑만 브라우저에 맡긴다 ---------------
  const onBeforeInput = (ev: InputEvent): void => {
    const t = ev.inputType;
    if (composing || ev.isComposing || t.includes('Composition')) {
      if (t === 'insertParagraph' || t === 'insertLineBreak') {
        // 조합 중의 엔터 — IME 의 것이 아니라 사람의 분할이다. 조합이 끝난 뒤로 미룬다 (옛 교훈).
        ev.preventDefault();
        deferred.push(() => {
          if (t === 'insertParagraph') actions.enter();
          else actions.shiftEnter();
        });
      }
      return;
    }
    if (t === 'insertParagraph') {
      ev.preventDefault();
      syncSelectionForInput(ev);
      actions.enter();
      return;
    }
    if (t === 'insertLineBreak') {
      ev.preventDefault();
      syncSelectionForInput(ev);
      actions.shiftEnter();
      return;
    }
    if (t === 'deleteContentBackward') {
      ev.preventDefault();
      syncSelectionForInput(ev);
      actions.backspace();
      return;
    }
    if (t === 'deleteContentForward') {
      ev.preventDefault();
      syncSelectionForInput(ev);
      actions.deleteForward();
      return;
    }
    if (t === 'historyUndo') {
      ev.preventDefault();
      nabi.undo();
      return;
    }
    if (t === 'historyRedo') {
      ev.preventDefault();
      nabi.redo();
      return;
    }
    if (t === 'insertFromPaste' || t === 'insertFromDrop') {
      ev.preventDefault();
      return;
    }
    if (t === 'insertText') {
      syncSelectionForInput(ev);
      const sel = nabi.getSelection();
      const holder = nodeAt(doc(), sel.focus.path);
      const crosses = !samePath(sel.anchor.path, sel.focus.path);
      // 래퍼문단(0/1)·여러 홀더에 걸친 범위 — 브라우저가 고칠 텍스트 노드가 없거나 구조를 헤집는다.
      if (crosses || (holder && isWrapper(holder, env))) {
        ev.preventDefault();
        if (typeof ev.data === 'string' && ev.data !== '') {
          nabi.applyCommand('insertText', { text: ev.data });
        }
      }
      return; // 문단 안 타이핑은 브라우저가 하고 input 에서 되맞춘다 (IME 를 위한 최소 양보)
    }
  };

  // --- 되맞추기 — 브라우저가 직접 고친 문단 하나를 트리로 --------------------------------------
  const reconcile = (pathHint?: readonly number[]): void => {
    const read = readCaret();
    const focusPath = pathHint ?? read?.selection.focus.path;
    if (!focusPath) return;
    const holder = nodeAt(doc(), focusPath);
    if (!holder || typeof holder._id !== 'string' || isWrapper(holder, env)) return;
    const el = holderElOf(root, holder._id);
    if (!el) return;

    const before = holderTextOf(holder, terminalOf(env));
    const after = domTextOf(el);
    const change = diffPlain(before, after);
    const hadArmed = !nabi.$armed.isEmpty();

    if (change) {
      reconciling = true;
      try {
        nabi.select({
          anchor: { path: focusPath, offset: change.start },
          focus: { path: focusPath, offset: change.removedEnd },
        });
        if (change.inserted === '') {
          nabi.applyCommand('deleteRange');
        } else if (!change.inserted.includes('\n')) {
          nabi.applyCommand('insertText', { text: change.inserted });
        } else {
          // 드문 길 — 브라우저가 개행째로 넣었다(자동완성 류). 라인 경계로 갈라 순서대로 넣는다.
          const parts = change.inserted.split('\n');
          nabi.group(() => {
            if (change.start !== change.removedEnd) nabi.applyCommand('deleteRange');
            parts.forEach((part, i) => {
              if (i > 0) nabi.applyCommand('insertLine');
              if (part !== '') nabi.applyCommand('insertText', { text: part });
            });
          });
        }
      } finally {
        reconciling = false;
      }

      // 예약이 소비된 타이핑 — 화면(브라우저의 맨 글자)과 트리(마크 입은 글자)가 갈린다.
      // 그 문단만 트리에서 다시 그린다 (옛 판의 전체 재그리기 없이).
      if (hadArmed) {
        redrawTopAt(focusPath);
        writeCaret(nabi.getSelection());
        return;
      }

      // 스페이스 직후의 오토포맷 — 변환이 일어나면 신호가 그 문단을 새로 그리고 캐럿도 쓴다.
      if (change.inserted === ' ' && actions.afterSpace()) return;

      // 드롭캡 span은 첫 글자의 실제 DOM이다. 브라우저가 타이핑·IME로 그 글자를 바꾼 뒤에는
      // 새 첫 글자에 상자를 옮겨야 하므로, 화면의 최종 캐럿을 트리에 받은 다음 이 문단만 다시 그린다.
      const current = nodeAt(doc(), focusPath);
      if (current?.a?.['dc'] === 1) {
        const now = readCaret();
        if (now) adoptSelection(now.selection);
        redrawTopAt(focusPath);
        writeCaret(nabi.getSelection());
        return;
      }
    }

    // 화면 캐럿을 정본으로 — 브라우저가 옮긴 캐럿을 트리가 따라간다(도로 쓰지 않는다).
    const now = readCaret();
    if (now) {
      syncing = true;
      try {
        nabi.select(now.selection);
      } finally {
        syncing = false;
      }
      // 위의 selectionchange 길과 같은 받침 — 구독자가 고쳐 세운 선택은 화면에도 쓴다.
      const settled = nabi.getSelection();
      if (!sameSelection(settled, now.selection)) writeCaret(settled);
    }
  };

  const onInput = (ev: Event): void => {
    if (composing || (ev as InputEvent).isComposing) return;
    reconcile();
    cleanupZeroWidth();
  };

  // --- IME 조합 (옛 판의 실기기 교훈 번역) -------------------------------------------
  function ensureCaretSlot(path: readonly number[] = nabi.getSelection().focus.path): void {
    const s = domSelection();
    if (s?.anchorNode?.nodeType === TEXT_NODE && root.contains(s.anchorNode)) return;
    const holder = nodeAt(doc(), path);
    if (!holder || typeof holder._id !== 'string' || isWrapper(holder, env)) return;
    const el = holderElOf(root, holder._id);
    if (!el || domTextOf(el) !== '') return;
    // Android Chrome 은 compositionstart 전에 조합 대상을 정할 수 있다. 빈 문단의 <br> 와
    // placeholder 위에서 시작하게 두면 첫 초성·중성이 갈라지므로, 포커스 때부터 이 자리를 둔다.
    const slot = owner.createTextNode(ZERO_WIDTH);
    el.replaceChildren(slot);
    expected = null;
    if (!s) return;
    try {
      s.setBaseAndExtent(slot, 1, slot, 1);
    } catch {
      // 자리만 만들어 둔다 — 선택을 못 옮겨도 조합은 이 노드에서 시작된다.
    }
  }

  const onCompositionStart = (): void => {
    if (composing) return;
    // 먼저 잠근다. 아래 선택 동기화나 범위 삭제가 문단을 다시 그리면, IME 가 막 붙잡은 텍스트
    // 노드가 사라져 모바일 조합의 첫 자모와 캐럿이 서로 다른 자리로 흩어진다.
    composing = true;
    replaySelectAll = false;
    actions.breakDouble();
    // compositionstart 에서는 트리를 전혀 고치지 않는다. 여기서 선택이나 문서를 바꾸면 조합이
    // 막 붙잡은 순간에 구독자들이 움직이고, 범위 교체 한 번이 삭제+삽입 두 undo로 갈라진다.
    // 실제 DOM 경로만 기억했다가 끝에서 원래 트리와 최종 DOM을 한 번에 되맞춘다.
    const live = readCaret();
    compositionSelection = live?.selection ?? nabi.getSelection();
    compositionPath = compositionSelection.focus.path;
    const anchor = nodeAt(doc(), compositionSelection.anchor.path);
    compositionAnchorId = anchor && typeof anchor._id === 'string' ? anchor._id : null;
    const holder = nodeAt(doc(), compositionPath);
    compositionHolderId = holder && typeof holder._id === 'string' ? holder._id : null;
    const topIds = [compositionSelection.anchor.path[0], compositionSelection.focus.path[0]]
      .map((index) => nodeAt(doc(), [index as number]))
      .flatMap((node) => node && typeof node._id === 'string' ? [node._id] : []);
    compositionTopIds = [...new Set(topIds)];
    redrawAfterComposition = false;
    compositionConflict = false;
    ensureCaretSlot(compositionPath);
  };

  const cleanupZeroWidth = (restoreEmpty = false): void => {
    const s = domSelection();
    const range = s && s.rangeCount > 0 ? s.getRangeAt(0) : null;
    const walker = owner.createTreeWalker(root, SHOW_TEXT);
    const dirty: Text[] = [];
    while (walker.nextNode()) {
      const text = walker.currentNode as Text;
      if (text.data.includes(ZERO_WIDTH)) dirty.push(text);
    }
    for (const text of dirty) {
      const cleaned = text.data.split(ZERO_WIDTH).join('');
      if (cleaned === '') {
        const parent = text.parentElement;
        const caretHere = range !== null && range.collapsed && range.startContainer === text;
        // 브라우저가 첫 글자를 slot 옆의 새 Text 노드로 넣는 경우가 있다. 같은 홀더에 진짜 글이
        // 생겼다면 이 노드는 더 이상 캐럿의 집이 아니라 앞에 남은 유령 한 칸이다.
        if (parent && domTextOf(parent) !== '') {
          text.remove();
          if (caretHere) writeCaret(nabi.getSelection());
          continue;
        }
        // 포커스 중에는 다음 조합의 집으로 남긴다. 편집기를 떠날 때는 렌더러의 빈 홀더 모양인
        // <br> 로 되돌려 placeholder 판정과 DOM 정본을 다시 맞춘다.
        if (restoreEmpty && parent?.childNodes.length === 1) {
          parent.replaceChildren(owner.createElement('br'));
        }
        continue;
      }
      const caretHere = range !== null && range.collapsed && range.startContainer === text;
      const offset = caretHere
        ? text.data.slice(0, range.startOffset).split(ZERO_WIDTH).join('').length
        : 0;
      text.data = cleaned;
      if (caretHere && s) {
        try {
          s.collapse(text, Math.min(offset, text.data.length));
        } catch {
          // 캐럿을 못 되돌려도 글자는 정리됐다 — selectionchange 가 트리를 따라잡는다.
        }
      }
    }
  };

  const finishComposition = (data: string | null): void => {
    if (!composing && compositionPath === null) return;
    composing = false;
    const path = compositionHolderId ? pathOfId(doc(), env, compositionHolderId) ?? compositionPath : compositionPath;
    const anchorPath = compositionAnchorId ? pathOfId(doc(), env, compositionAnchorId) : compositionSelection?.anchor.path;
    const focusPath = compositionHolderId ? pathOfId(doc(), env, compositionHolderId) : compositionSelection?.focus.path;
    const range = compositionSelection && anchorPath && focusPath ? {
      anchor: { path: anchorPath, offset: compositionSelection.anchor.offset },
      focus: { path: focusPath, offset: compositionSelection.focus.offset },
    } : null;
    const crosses = range !== null && !samePath(range.anchor.path, range.focus.path);
    const conflict = compositionConflict;
    const redraw = redrawAfterComposition;
    compositionPath = null;
    compositionSelection = null;
    compositionAnchorId = null;
    compositionHolderId = null;
    compositionTopIds = [];
    redrawAfterComposition = false;
    compositionConflict = false;
    if (!conflict && crosses && range) {
      const changed = data !== null && (data !== '' || (!redraw && !domMatchesTree()));
      reconciling = true;
      try {
        nabi.select(range);
        if (changed) {
          if (data === '') nabi.applyCommand('deleteRange');
          else nabi.applyCommand('insertText', { text: data });
        }
      } finally {
        reconciling = false;
      }
    } else if (!conflict) {
      reconcile(path ?? undefined);
    }
    cleanupZeroWidth();
    if (redraw || crosses || conflict) {
      renderAll();
      writeCaret(nabi.getSelection());
    }
    const queued = deferred;
    deferred = [];
    for (const fn of queued) fn();
    if (replaySelectAll) {
      replaySelectAll = false;
      actions.selectAll();
    }
  };

  const onCompositionEnd = (event: CompositionEvent): void => {
    finishComposition(event.data);
  };

  const onFocus = (): void => {
    ensureCaretSlot();
  };

  const onBlur = (): void => {
    // 일부 모바일 IME는 포커스가 먼저 떠나면 compositionend 를 빠뜨린다. 보이는 조합값을
    // 트리에 확정해 잠금이 다음 포커스까지 영구히 남지 않게 한다.
    finishComposition(null);
    cleanupZeroWidth(true);
  };

  // --- 붙여넣기·드롭·클릭 ----------------------------------------------------------------------
  // 붙여넣기의 판정은 전부 `paste.ts` 에 있다 — 여기서는 **이벤트에서 값을 뜨는 일**만 한다.
  // `clipboardData` 는 이 함수 밖에서 죽으므로 동기 구간에서 전부 떠 둔다(판이 뜨면 답은 나중에 온다).
  const onPaste = (ev: ClipboardEvent): void => {
    ev.preventDefault();
    const cd = ev.clipboardData;
    const files = cd ? Array.from(cd.files) : [];
    takePaste(
      {
        html: cd?.getData('text/html') ?? '',
        plain: cd?.getData('text/plain') ?? '',
        files,
        types: cd ? Array.from(cd.types) : [],
      },
      files,
    );
  };

  // 복사·잘라내기 — **클립보드를 우리가 채운다** (260823_008).
  //
  // 007 은 브라우저가 채우게 두고 한 벌 떠 두기만 했다. 그 대가가 "되돌아온 글자가 뜬 글자와
  // 같다는 보장이 없다" 였고, 봉해진 첨부에서 그것이 터졌다 — 크롬은 `user-select: none` 인
  // 서브트리를 아예 안 싣는다(실측). 지금은 실은 글자와 기억이 **같은 글자**라 `sameClip` 의
  // ① 겹이 언제나 서고, `<h1>` 의 글자를 다 골라 복사하면 제목도 함께 간다(`clipboard.ts`).
  //
  // 기억은 전역 하나라 인스턴스를 건너서도, 한 번 잘라 열 번 붙여도 그대로 산다.
  const onCopyOrCut = (ev: ClipboardEvent): void => {
    const s = domSelection();
    if (!s || s.rangeCount === 0 || s.isCollapsed) return;
    const range = s.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;
    const html = clipHtmlOf(range, root, owner);
    const cd = ev.clipboardData;
    // 실을 손이 없다(옛 브라우저·합성 이벤트) — 브라우저에 맡기고 기억만 둔다(007 의 길).
    if (!cd) {
      rememberClip(html);
      return;
    }
    // 맨 글자는 **선택의 것**이 먼저다 — 블록 사이의 줄바꿈은 `Selection.toString()` 만 안다.
    // 봉해진 첨부처럼 `user-select: none` 이 걸린 자리에서는 그것이 빈 글자라 범위의 것으로
    // 받친다(`Range.toString()` 은 CSS 를 안 본다).
    const plain = s.toString() || range.toString();
    ev.preventDefault();
    loadClipboard(cd, html, plain);
    // `preventDefault` 를 했으니 브라우저의 `deleteByCut` 이 안 온다 — 지우는 것도 우리 몫이다.
    if (ev.type === 'cut') nabi.applyCommand('deleteRange');
  };

  const onDrop = (ev: DragEvent): void => {
    ev.preventDefault();
    const files = ev.dataTransfer?.files;
    if (files && files.length > 0) options.fileSink?.(Array.from(files));
  };

  const onDragOver = (ev: DragEvent): void => {
    if (ev.dataTransfer?.types.includes('Files')) ev.preventDefault();
  };

  // 눌린 자리의 물건(래퍼문단) — 없으면 null.
  //
  // **찾을 때까지 올라간다.** 키를 단 조상을 만나면 멈추는 것이 아니다: 그림·영상은 자기도
  // 키를 달고 있어서, 거기서 멈추면 "물건을 눌렀는데 아무 일도 안 나는" 자리가 된다.
  // 글 홀더(문단·칸)를 만나면 그때 멈춘다 — 거기서부터는 글자를 누른 것이고 캐럿은 브라우저가 놓는다.
  //
  // **속이 빈 물건만 고른다.** 표·목록·인용·접기·코드는 속에 글이 있어서, 누르면 통째로 골라 두면
  // 그 다음 글자 하나가 그것을 통째로 지운다. 실제로 그랬다: 표의 겉옷(`.nabi-scroll`)은 줄 폭을
  // 다 차지하는데 표는 제 글만큼만 넓어서, **표 오른쪽의 빈 자리**가 전부 "표를 통째로 고르는"
  // 자리였다. 거기를 누르고 한 글자만 쳐도 표가 사라졌다.
  //
  // 그래서 글을 품은 물건은 여기서 null 을 답한다 — 캐럿은 브라우저가 가장 가까운 글자리(칸·항목)에
  // 놓는다. 통째로 고르는 길은 따로 있다: 첫머리에서 백스페이스를 치면 겨누기(`aimVessel`)가 선다.
  const lumpUnder = (target: Element): readonly number[] | null => {
    let el: Element | null = target.closest('[data-key]');
    while (el && root.contains(el)) {
      const id = el.getAttribute('data-key') ?? '';
      const path = pathOfId(doc(), env, id);
      const holder = path ? nodeAt(doc(), path) : null;
      if (holder && isWrapper(holder, env)) {
        const lump = holder.ch[0];
        const void_ = isElement(lump) && env.voids.has(lump.w);
        return void_ ? path : null;
      }
      if (holder && isHolder(holder, env)) return null; // 글을 눌렀다
      el = el.parentElement?.closest('[data-key]') ?? null;
    }
    return null;
  };

  // 물건 고르기는 **누르는 순간**이다 (click 이 아니다).
  //
  // click 에서 하면 브라우저가 먼저 놓은 캐럿이 우리 선택을 덮는다: mousedown 이 래퍼의 모서리에
  // 캐럿을 놓고, 그 selectionchange 가 우리 write 뒤에 도착해 트리를 되돌린다. 눌렀는데 그림이
  // 안 골라지던 자리가 이것이었다. mousedown 을 삼키면 브라우저가 캐럿을 놓을 일 자체가 없다
  // 대신 포커스는 우리가 직접 준다(삼킨 몸짓은 포커스도 안 옮긴다).
  // 물건을 고른 몸짓인가 — 그 몸짓의 나머지(mouseup·click)도 우리가 삼킨다.
  let tookLump = false;

  const onMouseDown = (ev: MouseEvent): void => {
    tookLump = false;
    if (ev.button !== 0) return;
    const target = eventElement(ev.target);
    if (!target) return;
    const path = lumpUnder(target);
    if (!path) return;
    tookLump = true;
    ev.preventDefault();
    root.focus({ preventScroll: true });
    nabi.select(selectObject(path));
    writeCaret(nabi.getSelection());
  };

  // 누르기를 삼켜도 브라우저는 **떼는 순간** 다시 캐럿을 놓으려 한다 — 한 몸짓의 세 걸음을
  // 다 삼켜야 우리가 세운 선택이 남는다. 그래서 mouseup·click 도 여기서 끊는다.
  const onMouseUp = (ev: MouseEvent): void => {
    if (!tookLump) return;
    ev.preventDefault();
    writeCaret(nabi.getSelection());
  };

  const onClick = (ev: MouseEvent): void => {
    if (tookLump) {
      tookLump = false;
      ev.preventDefault();
      writeCaret(nabi.getSelection());
      return;
    }
    const target = eventElement(ev.target);
    if (!target) return;
    // 편집 중 문서는 쓰는 것이지 보는 것이 아니다 — 링크는 이동하지 않는다.
    const anchor = target.closest('a');
    if (anchor && root.contains(anchor)) ev.preventDefault();
  };

  // --- 조립 -----------------------------------------------------------------------------------
  // contenteditable 은 코어가 소유한다 — 호스트 마크업에 적지 않는다 (준비 셋).
  root.setAttribute('contenteditable', 'true');
  root.classList.add('nabi-editing');
  if (options.locale !== undefined) root.setAttribute('dir', localeDirection(options.locale));
  // 빈 편집기의 안내글 — **말만 준다.** 언제 뜨고 어떻게 생겼나는 시트의 것이고(빈 문단
  // 하나라는 모양 하나를 겨눈다), 여기서는 그 말을 변수 한 칸에 적어 둘 뿐이다.
  // 트리에도 DOM 에도 안 들어가므로 저장값·캐럿 셈이 흔들릴 자리가 없다.
  // 말을 안 받았으면 코어 사전이 낸다 — 로케일은 이 mount 의 것이 먼저고, 없으면 인스턴스의 것이다.
  const placeholder = options.placeholder ?? translate('placeholder', options.locale ?? nabi.$locale());
  if (placeholder !== '') root.style.setProperty('--nabi-placeholder', cssQuoted(placeholder));
  // hydrate — 서버가 그린 편집기 DOM 이 문서와 맞으면 다시 그리지 않고 입양한다.
  if (!(options.hydrate === true && adopted())) renderAll();

  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('beforeinput', onBeforeInput as EventListener);
  root.addEventListener('input', onInput);
  root.addEventListener('compositionstart', onCompositionStart);
  root.addEventListener('compositionend', onCompositionEnd);
  root.addEventListener('focus', onFocus);
  root.addEventListener('blur', onBlur);
  root.addEventListener('paste', onPaste as EventListener);
  root.addEventListener('copy', onCopyOrCut as EventListener);
  root.addEventListener('cut', onCopyOrCut as EventListener);
  root.addEventListener('drop', onDrop as EventListener);
  root.addEventListener('dragover', onDragOver as EventListener);
  root.addEventListener('mousedown', onMouseDown);
  root.addEventListener('mouseup', onMouseUp);
  root.addEventListener('click', onClick);
  owner.addEventListener('selectionchange', onSelectionChange);

  // 선언형 부속 — wing 이 선언한 표면 훅을 여기서 붙이고, unmount 가 뗀다.
  const detachers = registry.attaches.map((attach) =>
    attach({ root, nabi, pathOfKey: (id) => pathOfId(doc(), env, id) }),
  );

  return {
    actions,
    port,
    focus: port.focus,
    redrawAll() {
      renderAll();
      writeCaret(nabi.getSelection());
    },
    unmount() {
      for (const detach of detachers) detach();
      offChange();
      if (correctionFrame !== 0) view?.cancelAnimationFrame?.(correctionFrame);
      correctionFrame = 0;
      correctionQueued = false;
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('beforeinput', onBeforeInput as EventListener);
      root.removeEventListener('input', onInput);
      root.removeEventListener('compositionstart', onCompositionStart);
      root.removeEventListener('compositionend', onCompositionEnd);
      root.removeEventListener('focus', onFocus);
      root.removeEventListener('blur', onBlur);
      root.removeEventListener('paste', onPaste as EventListener);
      root.removeEventListener('copy', onCopyOrCut as EventListener);
      root.removeEventListener('cut', onCopyOrCut as EventListener);
      root.removeEventListener('drop', onDrop as EventListener);
      root.removeEventListener('dragover', onDragOver as EventListener);
      root.removeEventListener('click', onClick);
      root.removeEventListener('mouseup', onMouseUp);
      root.removeEventListener('mousedown', onMouseDown);
      owner.removeEventListener('selectionchange', onSelectionChange);
      root.removeAttribute('contenteditable');
      root.classList.remove('nabi-editing');
      root.style.removeProperty('--nabi-placeholder');
    },
  };
}
