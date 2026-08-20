// contenteditable 표면 — 정책(actions·autoformat·vessel·redraw)은 전부 아래 순수부에 있고
// 이 파일은 그것을 브라우저 이벤트에 배선만 한다. EditContext 가 서는 날 갈리는 것도 이 파일이다
// (포트 뒤 교체).
//
// 원칙: 정본은 트리다. 화면 캐럿은 파생이고, 어긋나면 트리 쪽으로 교정한다.
// 예외 구간은 IME 조합뿐 — 그동안은 DOM 이 정답이고, 끝나는 순간 한 번에 따라잡는다.
import { P, cocoon, isElement, isWrapper, type ElementNode, type NabiDoc } from '../schema/index.js';
import { isHolder, nodeAt, terminalOf } from '../doc/index.js';
import { caretAt, isCollapsed, sameSelection, selectObject, type Selection } from '../caret/index.js';
import { localeDirection, translate } from '../locale/index.js';
import type { Nabi, NabiChange } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import {
  fragmentOf,
  pasteFragment,
  renderEditorHtml,
  renderParagraphHtml,
  type HtmlOptions,
} from '../html/index.js';
import { makeSurfaceActions, type SurfaceActions } from './actions.js';
import { diffPlain, holderTextOf } from './text.js';
import { domTextOf, fromDomPoint, holderElOf, pathOfId, toDomPoint, ZERO_WIDTH } from './map.js';
import { insertFragmentOp } from './fragment.js';
import { planRedraw } from './redraw.js';
import type { EditSurfacePort, ReadCaret } from './port.js';

const TEXT_NODE = 3;
const SHOW_TEXT = 4;

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
  const actions = makeSurfaceActions({
    nabi,
    registry,
    ...(options.doubleEnterMs !== undefined ? { doubleEnterMs: options.doubleEnterMs } : {}),
  });

  // --- 상태 (전부 이 mount 의 것) ------------------------------------------------------
  let composing = false;
  let reconciling = false;
  let syncing = false; // 화면 → 트리 동기화 중 — 트리 → 화면 되쓰기를 멈춘다(왕복 차단)
  let expected: Selection | null = null; // 쓰기 토큰 — 우리가 쓴 선택의 지문 (setTimeout 금지)
  let lastCorrectionAt = 0;
  let correctionQueued = false;
  let replaySelectAll = false;
  let deferred: (() => void)[] = [];

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
    expected = null;
    syncing = true;
    try {
      nabi.select(read.selection);
    } finally {
      syncing = false;
    }
    // 구독자가 선택을 고쳐 세웠으면(첨부 링크의 통째 넓히기) 화면도 따라간다 — syncing 동안은
    // 트리 → 화면 되쓰기가 꺼져 있어서, 여기서 안 쓰면 캐럿이 첨부 속에 선 채로 남는다
    // (트리는 통째로 골랐는데 화면은 캐럿 하나 — 두 정답이 갈린 채 멈춘다).
    const settled = nabi.getSelection();
    if (!sameSelection(settled, read.selection)) writeCaret(settled);
    if (read.corrected) {
      // 표현 불가 자리(문단 사이·물건 속)의 캐럿 — 트리 자리로 되쓴다. 직후에 또 오면 한 프레임
      // 쉬어 브라우저와의 교정 핑퐁을 끊는다 (Q10 — 조정 가능한 상수).
      const deferMs = options.correctionDeferMs ?? 80;
      const t = Date.now();
      if (t - lastCorrectionAt < deferMs) {
        if (!correctionQueued && view) {
          correctionQueued = true;
          view.requestAnimationFrame(() => {
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
    if (composing || reconciling) return;
    if (change.doc) applyRedraw(change);
    if ((change.doc || change.selection) && !syncing) writeCaret(nabi.getSelection());
  });

  // --- 키 -------------------------------------------------------------------------------------
  const caretOnLastLine = (): boolean => {
    const sel = nabi.getSelection();
    const holder = nodeAt(doc(), sel.focus.path);
    if (!holder || typeof holder._id !== 'string') return false;
    const el = holderElOf(root, holder._id);
    if (!el || typeof el.getBoundingClientRect !== 'function') return false;
    const box = el.getBoundingClientRect();
    // 빈 줄의 캐럿 사각형은 전부 0 일 수 있다 — 그때는 블록 자신이 그 줄이다 (옛 062 의 교훈).
    const rect = caretRect() ?? { top: box.top, bottom: box.bottom, left: box.left, right: box.right };
    const lineHeight = view ? Number.parseFloat(view.getComputedStyle(el).lineHeight) || 16 : 16;
    return box.bottom - rect.bottom < lineHeight * 0.9;
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    // 누가 이미 가져간 키는 두 번 안 먹는다.
    //
    // 상황 줄의 힌트 모드가 문서에 **캡처**로 먼저 붙어(ui/hints) Tab·방향키를 제 걸음으로 쓴다.
    // 그 걸음이 여기까지 흘러오면 한 몸짓이 두 번 일한다 — 상황 줄의 겨눔이 옮겨지면서 동시에
    // 코드 상자가 들여쓰기까지 했다. `defaultPrevented` 가 "이건 이미 누구의 것"이라는 표식이다.
    if (ev.defaultPrevented) return;
    if (ev.isComposing || ev.keyCode === 229) {
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
      actions.tab(ev.shiftKey);
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (ev.shiftKey) actions.shiftEnter();
      else actions.enter();
      return;
    }
    if (ev.key === 'Backspace' && !mod) {
      ev.preventDefault();
      actions.backspace();
      return;
    }
    if (ev.key === 'Delete' && !mod) {
      ev.preventDefault();
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
      if (actions.arrow(dir)) {
        ev.preventDefault();
        return;
      }
      // 드롭캡 문단으로 "내려가는" 걸음은 브라우저가 틀린다 — 우리 걸음으로 대신한다.
      if (dir === 'down') {
        const target = actions.dropcapBelow();
        if (target && caretOnLastLine()) {
          ev.preventDefault();
          nabi.select(caretAt(target));
        }
      }
      return;
    }
    if (actions.escapeKey(ev.key)) ev.preventDefault();
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
      actions.enter();
      return;
    }
    if (t === 'insertLineBreak') {
      ev.preventDefault();
      actions.shiftEnter();
      return;
    }
    if (t === 'deleteContentBackward') {
      ev.preventDefault();
      actions.backspace();
      return;
    }
    if (t === 'deleteContentForward') {
      ev.preventDefault();
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
  const reconcile = (): void => {
    const read = readCaret();
    if (!read) return;
    const focusPath = read.selection.focus.path;
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
        const top = nodeAt(doc(), [focusPath[0] as number]);
        if (top && typeof top._id === 'string') {
          applyRedraw({ doc: true, selection: false, armed: false, paragraphs: [top._id], removed: [] });
        }
        writeCaret(nabi.getSelection());
        return;
      }

      // 스페이스 직후의 오토포맷 — 변환이 일어나면 신호가 그 문단을 새로 그리고 캐럿도 쓴다.
      if (change.inserted === ' ' && actions.afterSpace()) return;
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
  };

  // --- IME 조합 (옛 판의 실기기 교훈 번역) -------------------------------------------
  const ensureCaretSlot = (): void => {
    const s = domSelection();
    if (!s || s.rangeCount === 0 || s.anchorNode?.nodeType === TEXT_NODE) return;
    const sel = nabi.getSelection();
    const holder = nodeAt(doc(), sel.focus.path);
    if (!holder || typeof holder._id !== 'string' || isWrapper(holder, env)) return;
    const el = holderElOf(root, holder._id);
    if (!el || domTextOf(el) !== '') return;
    // 조합은 진짜 텍스트 노드 안에서만 시작된다 — 빈 문단에는 그 자리가 없어 IME 가 아예 안 뜬다.
    const slot = owner.createTextNode(ZERO_WIDTH);
    el.replaceChildren(slot);
    expected = null;
    try {
      s.setBaseAndExtent(slot, 1, slot, 1);
    } catch {
      // 자리만 만들어 둔다 — 선택을 못 옮겨도 조합은 이 노드에서 시작된다.
    }
  };

  const onCompositionStart = (): void => {
    replaySelectAll = false;
    const sel = nabi.getSelection();
    // 범위 위 조합 — 브라우저가 DOM 에서 범위를 지우기 전에 트리도 지워 캐럿 하나에서 시작한다.
    if (!isCollapsed(sel)) nabi.applyCommand('deleteRange');
    ensureCaretSlot();
    composing = true;
  };

  const cleanupZeroWidth = (): void => {
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
      if (cleaned === '') continue; // 아직 빈 자리 — 캐럿의 집이므로 남긴다
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

  const onCompositionEnd = (): void => {
    composing = false;
    reconcile();
    cleanupZeroWidth();
    const queued = deferred;
    deferred = [];
    for (const fn of queued) fn();
    if (replaySelectAll) {
      replaySelectAll = false;
      actions.selectAll();
    }
  };

  // --- 붙여넣기·드롭·클릭 ----------------------------------------------------------------------
  const onPaste = (ev: ClipboardEvent): void => {
    ev.preventDefault();
    const files = ev.clipboardData?.files;
    if (files && files.length > 0) {
      options.fileSink?.(Array.from(files));
      return;
    }
    const html = ev.clipboardData?.getData('text/html') ?? '';
    const plain = ev.clipboardData?.getData('text/plain') ?? '';
    if (html === '' && plain === '') return;
    if (html === '' && !plain.includes('\n')) {
      // 평문 한 줄은 그냥 글자다 — 캐럿에 이어 쓴다.
      nabi.applyCommand('insertText', { text: plain });
      return;
    }
    const raw: readonly ElementNode[] =
      html !== ''
        ? pasteFragment(html, {
            env,
            ...(registry.claim ? { claim: registry.claim } : {}),
            ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
          })
        : plain.split('\n').map((line): ElementNode => ({ w: P, ch: line === '' ? [] : [line] }));
    // 조각도 문서의 불변식을 입고 들어온다 — 래퍼 입히기·쪼개기는 cocoon 의 것이다.
    const fragment = fragmentOf(cocoon([...raw], env));
    if (fragment.length === 0) return;
    nabi.group(() => {
      if (!isCollapsed(nabi.getSelection())) nabi.applyCommand('deleteRange');
      nabi.$applyRaw(insertFragmentOp(fragment), 'insertFragment');
    });
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
    const target = ev.target instanceof Element ? ev.target : null;
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
    const target = ev.target instanceof Element ? ev.target : null;
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
  root.addEventListener('paste', onPaste as EventListener);
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
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('beforeinput', onBeforeInput as EventListener);
      root.removeEventListener('input', onInput);
      root.removeEventListener('compositionstart', onCompositionStart);
      root.removeEventListener('compositionend', onCompositionEnd);
      root.removeEventListener('paste', onPaste as EventListener);
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
