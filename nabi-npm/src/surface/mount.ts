// contenteditable 표면 — 정책(actions·autoformat·vessel·redraw)은 순수부에 있고 이 파일은 브라우저 이벤트 배선만 한다(EditContext가 서는 날 포트 뒤에서 교체될 파일). 원칙: 트리가 정본, 화면 캐럿은 파생이라 어긋나면 트리로 교정한다. 예외는 IME 조합 중뿐 — 그동안은 DOM이 정답이고 끝나는 순간 한 번에 따라잡는다
// The contenteditable surface; policy (actions/autoformat/vessel/redraw) lives in the pure layer, this file only wires it to browser events (and is what a future EditContext implementation would replace, behind the port). Principle: the tree is authoritative, the screen caret is derived and gets corrected back to it when they diverge -- except during IME composition, when the DOM is authoritative and gets reconciled back in one shot at the end
import { $toJson, isElement, isWrapper, type NabiDoc } from '../schema/index.js';
import { comparePositions, holderLength, holders, isHolder, nodeAt, terminalOf } from '../doc/index.js';
import { caretAt, isCollapsed, ordered, sameSelection, selectObject, type Selection } from '../caret/index.js';
import { localeDirection, translate } from '../locale/index.js';
import { hostOf, type Nabi, type NabiChange } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import { FILLER_ATTR, renderEditorHtml, renderParagraphHtml, type HtmlOptions } from '../html/index.js';
import type { IoFilter } from '../io/index.js';
import { makeSurfaceActions, type SurfaceActions } from './actions.js';
import { diffPlain, holderTextOf } from './text.js';
import { domTextOf, fromDomPoint, holderElOf, pathOfId, toDomPoint, ZERO_WIDTH } from './map.js';
import { clipboardBodyOf, clipHtmlOf, loadClipboard, NABI_CLIPBOARD_MIME } from './clipboard.js';
import { ioFiltersOf } from './filters.js';
import { makePasteFlow } from './paste.js';
import { planRedraw } from './redraw.js';
import type { EditSurfacePort, ReadCaret } from './port.js';
import { claimMountRoot, DisposerStack, HostElementBaseline, HostElementLease } from '../lifecycle.js';
import { cssQuoted, projectDomEdit, samePath, type CompositionSpan, type TextInputHint } from './mount-helpers.js';

export { cssQuoted } from './mount-helpers.js';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const eventElement = (target: EventTarget | null): Element | null =>
  target !== null && (target as Node).nodeType === ELEMENT_NODE ? (target as Element) : null;

export interface SurfaceOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  // 서버가 그린 편집기 DOM을 다시 그리지 않고 이어받는다 — 어긋나면 그때만 새로 그린다
  // Adopts the server-rendered editor DOM instead of redrawing it; only redraws if it turns out to mismatch
  readonly hydrate?: boolean;
  readonly allowLocalUrls?: boolean;
  // 글의 언어가 쓰기 방향을 정한다(098) — 주면 dir을 적어 아랍어·우르두는 페이지의 <html dir>과 무관하게 오른쪽에서 왼쪽으로 쓴다. 안 주면 안 건드린다(방향을 직접 쥔 호스트를 덮지 않는다)
  // The text's language decides writing direction (098); when given, `dir` is set so Arabic/Urdu write right-to-left regardless of the page's own <html dir>. When omitted, it's left untouched, so a host managing direction itself isn't overridden
  readonly locale?: string;
  // 빈 편집기의 안내글 — 안 주면 코어 사전의 로케일 말이 선다. 빈 글자열을 주면 안내글이 꺼진다. 줄바꿈은 그대로 여러 줄 안내글이 된다
  // The empty-editor placeholder; omitted, it falls back to the core dictionary's localized text. An empty string turns it off. Newlines are preserved, producing a multi-line placeholder
  readonly placeholder?: string;
  // 이 표면에만 끼우는 IO 필터 — 맨 앞에 선다. 최종 순서: 여기 것 → 레지스트리 것(makeRegistry의 ioFilters, wing 필터 앞) → 내장 셋(html·md, 늘 마지막)
  // IO filters scoped to this surface, placed first. Final order: these -> registry filters (makeRegistry's ioFilters, already ahead of wing filters) -> built-ins (html/md, always last)
  readonly ioFilters?: readonly IoFilter[];
  // 드롭·붙여넣기로 온 파일이 흘러가는 곳(업로드 wing이 11에서 잇는다) — 없으면 그냥 버린다
  // Where dropped/pasted files flow to (the upload wing connects this at mount extra 11); without it, files are simply discarded
  readonly fileSink?: (files: readonly File[]) => void;
  readonly doubleEnterMs?: number;
  // 교정 핑퐁 유예(ms) — 우리 교정 직후 브라우저가 되받아치면 한 프레임 쉬었다 다시 쓴다(Q10)
  // Correction ping-pong debounce (ms); if the browser bounces back right after our own correction, wait one frame before writing again (Q10)
  readonly correctionDeferMs?: number;
}

export interface Surface {
  readonly actions: SurfaceActions;
  readonly port: EditSurfacePort;
  focus(): void;
  redrawAll(): void;
  unmount(): void;
}

export function mountSurface(options: SurfaceOptions): Surface {
  const { nabi, registry, root } = options;
  const baseline = new HostElementBaseline(root);
  const lifecycle = new DisposerStack();
  lifecycle.add(claimMountRoot(root));
  try {
    const env = hostOf(nabi).env;
    const owner = root.ownerDocument;
    const view = owner.defaultView;
    const doc = (): NabiDoc => hostOf(nabi).doc();
    const htmlOptions: HtmlOptions = {
      env,
      builders: registry.builders,
      ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
    };
    // 일반 편집 상태인가 — 연타 몸짓의 문이다(260823_004 ④). 새 전역 깃발 없이 DOM의 기존 표식 셋(전체화면·힌트 배지 클래스, 실재하는 덮개·판)만 본다. 실제로 새는 자리는 전체화면 하나뿐이다 — 덮개·판은 캡처 단계에서 이미 막아 여기까지 안 온다
    // Whether editing is in a "plain" state, the gate for tap gestures (260823_004 4); rather than a new global flag, it checks three existing DOM markers (fullscreen/hint-badge classes, actual overlay/panel elements). Fullscreen is the only real leak, since overlays/panels already stop the key at the capture phase before it gets here
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

    // 붙여넣기가 지나는 필터 목록 — 짓는 법은 filters.ts 하나다(저장 판도 같은 목록을 본다)
    // The filter list paste flows through; built in one place (filters.ts), which the save panel also shares
    const takePaste = makePasteFlow({
      nabi,
      filters: ioFiltersOf({
        registry,
        ...(options.ioFilters ? { extra: options.ioFilters } : {}),
        ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
      }),
      locale: () => options.locale ?? hostOf(nabi).locale(),
      ...(options.fileSink ? { fileSink: options.fileSink } : {}),
    });

    // --- 상태 (전부 이 mount 의 것) ------------------------------------------------------
    let composing = false;
    let reconciling = false;
    // 화면 → 트리 동기화 중 — 트리 → 화면 되쓰기를 멈춘다(왕복 차단)
    // Screen-to-tree sync in progress; suppresses tree-to-screen write-back (blocks a round trip)
    let syncing = false;
    // 쓰기 토큰 — 우리가 쓴 선택의 지문(setTimeout 금지)
    // A write token: the fingerprint of the selection we just wrote (no setTimeout)
    let expected: Selection | null = null;
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
    let compositionTopRefs = new Map<string, NabiDoc[number]>();
    let redrawAfterComposition = false;
    let compositionConflict = false;
    let caretSlot: Text | null = null;
    let pendingTextInput: TextInputHint | null = null;
    let pendingChangedHolders: readonly string[] = [];
    let compositionSpan: CompositionSpan | null = null;

    const isCaretSlot = (node: Text): boolean => node === caretSlot;

    const changedHolderIds = (selection: Selection): readonly string[] => {
      const [start, end] = ordered(selection);
      const ids: string[] = [];
      for (const entry of holders(doc(), env)) {
        if (isWrapper(entry.node, env) || typeof entry.node._id !== 'string') continue;
        const first = { path: entry.path, offset: 0 };
        const last = { path: entry.path, offset: holderLength(entry.node, env) };
        if (comparePositions(last, start) < 0 || comparePositions(first, end) > 0) continue;
        ids.push(entry.node._id);
      }
      return ids;
    };

    // --- 그리기(문단 단위) — 전체 innerHTML 재그리기는 mount 최초와 어긋난 hydrate뿐 ---
    // --- Drawing (per-paragraph); a full innerHTML redraw happens only on mount's initial render or a mismatched hydrate ---
    const childOf = (id: string): Element | null => {
      for (const el of Array.from(root.children)) if (el.getAttribute('data-key') === id) return el;
      return null;
    };

    const renderAll = (): void => {
      root.innerHTML = renderEditorHtml(doc(), htmlOptions);
    };

    const adopted = (): boolean => {
      const expected = owner.createElement('template');
      expected.innerHTML = renderEditorHtml(doc(), htmlOptions);
      const actualNodes = Array.from(root.childNodes);
      const expectedNodes = Array.from(expected.content.childNodes);
      return (
        actualNodes.length === expectedNodes.length &&
        actualNodes.every((node, index) => node.isEqualNode(expectedNodes[index] ?? null))
      );
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
          const anchor = root.children[op.index];
          if (anchor !== existing) {
            if (anchor) root.insertBefore(existing, anchor);
            else root.append(existing);
          }
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
      const anchor = toDomPoint(root, doc(), env, sel.anchor, isCaretSlot);
      const focus = toDomPoint(root, doc(), env, sel.focus, isCaretSlot);
      if (!anchor || !focus) return;
      expected = sel;
      try {
        s.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
        // 포커스가 이미 안에 있는 상태(빈 편집기를 지운 직후 등)에서 다음 compositionstart를 기다리면 Android IME가 <br> 위에서 조합 대상을 먼저 정해 버린다 — 캐럿을 쓰는 이 순간 텍스트 노드 자리를 함께 마련한다
        // If focus is already inside (e.g. right after clearing an empty editor) and we wait for the next compositionstart, Android's IME can pick its composition target on a <br> first; preparing a real text-node slot right when the caret is written avoids that
        if (owner.activeElement === root || root.contains(owner.activeElement)) ensureCaretSlot();
      } catch {
        expected = null;
      }
    };

    const readCaret = (): ReadCaret | null => {
      const s = domSelection();
      if (!s || s.rangeCount === 0 || !s.anchorNode || !s.focusNode) return null;
      const anchor = fromDomPoint(root, doc(), env, s.anchorNode, s.anchorOffset, isCaretSlot);
      const focus = fromDomPoint(root, doc(), env, s.focusNode, s.focusOffset, isCaretSlot);
      if (!anchor || !focus) return null;
      return {
        selection: { anchor: anchor.pos, focus: focus.pos },
        corrected: anchor.corrected || focus.corrected,
      };
    };

    // DOM Selection은 화면의 최신 몸짓 자리, 트리 Selection은 마지막 selectionchange 자리다 — 그 이벤트는 task로 예약돼 다음 keydown/beforeinput보다 늦을 수 있어, 구조 입력 직전엔 트리가 화면을 한 번 따라잡는다
    // The DOM Selection reflects the screen's latest gesture, while the tree Selection reflects the last selectionchange received; since that event is scheduled as a task, it can lag behind the next keydown/beforeinput, so the tree catches up to the screen right before running a structural input
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
      // 첨부처럼 구독자가 표현 가능한 바깥 경계로 선택을 넓힌 경우 화면도 그 답을 따른다
      // If a subscriber (e.g. for an attachment) widened the selection to the nearest representable boundary, the screen follows that result too
      const settled = nabi.getSelection();
      if (!sameSelection(settled, selection)) writeCaret(settled);
    };

    const syncSelectionNow = (): void => {
      const read = readCaret();
      if (read) adoptSelection(read.selection);
    };

    const adoptLiveSelection = (): boolean => {
      const read = readCaret();
      if (!read) return false;
      adoptSelection(read.selection);
      const settled = nabi.getSelection();
      if (read.corrected) writeCaret(settled);
      const checked = readCaret();
      return checked !== null && sameSelection(checked.selection, settled);
    };

    // beforeinput의 target range는 브라우저가 이번 입력으로 바꿀 내용이다 — 모바일 가상 키보드는 keydown 없이 이 이벤트만 내고, Backspace가 지울 글자 수도 플랫폼·문자군마다 달라 접힌 캐럿을 다시 계산하는 것보다 이 범위가 더 정확하다
    // beforeinput's target range is what the browser is about to change; mobile virtual keyboards fire only this event with no keydown, and how much a single Backspace deletes varies by platform and script, so trusting this range beats recomputing a collapsed caret ourselves
    const targetSelectionOf = (ev: InputEvent): Selection | null => {
      let ranges: readonly StaticRange[];
      try {
        ranges = ev.getTargetRanges();
      } catch {
        return null;
      }
      const range = ranges[0];
      if (!range) return null;
      const anchor = fromDomPoint(root, doc(), env, range.startContainer, range.startOffset, isCaretSlot);
      const focus = fromDomPoint(root, doc(), env, range.endContainer, range.endOffset, isCaretSlot);
      if (!anchor || !focus) return null;
      return { anchor: anchor.pos, focus: focus.pos };
    };

    const syncSelectionForInput = (ev: InputEvent): void => {
      const live = readCaret();
      const target = targetSelectionOf(ev);
      if (target) {
        // 접힌 캐럿의 문단 경계 Backspace는 목록·인용 같은 구조 규칙이 먼저다 — 브라우저가 제안한 문단 간 삭제 범위를 그대로 쓰면 그 규칙을 건너뛰므로, 그때만 실제 접힌 캐럿을 쓴다
        // A collapsed-caret Backspace at a paragraph boundary must run structural rules (list/quote) first; using the browser's suggested cross-paragraph deletion range would skip those rules, so the actual collapsed caret is used instead in that case
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
      // 포커스가 편집기 밖이면 화면 선택은 정답이 아니다 — 트리가 정답이다(059)
      // If focus is outside the editor, the screen selection isn't authoritative -- the tree is (059)
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
        // 표현 불가 자리(문단 사이·물건 속)의 캐럿은 트리 자리로 되쓴다 — 바로 또 오면 한 프레임 쉬어 브라우저와의 교정 핑퐁을 끊는다(Q10)
        // A caret at a position the tree can't express (between paragraphs, inside an object) is written back to the tree's position; if it recurs immediately, one frame is skipped to break a correction ping-pong with the browser (Q10)
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
      // 조합·reconcile 중에는 DOM이 정답이다 — 그리지도 되쓰지도 않는다
      // While composing or reconciling, the DOM is authoritative; neither redraw nor caret write-back happens
      if (composing) {
        // 조합 밖에서 온 문서 변경은 버리지 않고 끝까지 기억한다 — 활성 문단 자체가 바뀌었으면 DOM 조합 결과로 그 명시적 변경을 덮지 않고, 끝에서 트리를 다시 그려 데이터가 이긴다
        // Document changes arriving from outside composition are remembered until the end, not discarded; if the active paragraph itself changed, its explicit change isn't overwritten by the DOM's composition result -- the tree wins by redrawing at the end
        if (change.doc) {
          redrawAfterComposition = true;
          if (
            compositionTopIds.some((id) => {
              if (change.removed.includes(id)) return true;
              if (!change.paragraphs.includes(id)) return false;
              return doc().find((node) => node._id === id) !== compositionTopRefs.get(id);
            })
          ) {
            compositionConflict = true;
          }
        }
        return;
      }
      if (reconciling) return;
      if (change.doc) applyRedraw(change);
      if ((change.doc || change.selection) && !syncing) writeCaret(nabi.getSelection());
    });
    lifecycle.add(offChange);

    // --- 키 -------------------------------------------------------------------------------------
    const onKeyDown = (ev: KeyboardEvent): void => {
      // 이미 가져간 키는 두 번 안 먹는다 — ui/hints가 문서에 캡처로 먼저 붙어 Tab·방향키를 제 걸음으로 쓰는데, 그 걸음이 여기까지 흘러오면 상황 줄 겨눔 이동과 코드 상자 들여쓰기가 동시에 일어났다. defaultPrevented가 그 표식이다
      // A key already claimed isn't consumed twice; ui/hints attaches at the document's capture phase and uses Tab/arrows for its own navigation, and letting that fall through here made context-row focus move and a code block indent happen from one gesture. defaultPrevented is the marker for "someone already took this"
      if (ev.defaultPrevented) return;
      if (ev.isComposing || ev.keyCode === 229) {
        // 조합이 지나면 연타 셈이 끊긴다 — 조합 직후의 Esc가 조합 앞의 Esc와 이어져 세어지면 안 된다(힌트와 같은 IME 철칙: 조합 중엔 아무것도 안 센다)
        // A composition passing through resets the tap count, or an Esc right after composition would chain with one from before it (same IME rule as hints: nothing counts during composition)
        actions.breakDouble();
        // 조합 중의 Cmd/Ctrl+A는 브라우저가 조합 확정에 써 버려 씹힌다 — 표식만 남겨 끝에 재생한다
        // Cmd/Ctrl+A during composition gets swallowed by the browser committing the composition; a flag is left to replay it afterward
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
          actions.breakDouble();
          if (ev.shiftKey) nabi.redo();
          else nabi.undo();
          return;
        }
        if (letter === 'y' || ev.code === 'KeyY') {
          ev.preventDefault();
          actions.breakDouble();
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
        ev.key === 'ArrowLeft'
          ? 'left'
          : ev.key === 'ArrowRight'
            ? 'right'
            : ev.key === 'ArrowUp'
              ? 'up'
              : ev.key === 'ArrowDown'
                ? 'down'
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
      pendingChangedHolders = [];
      if (t !== 'insertText') pendingTextInput = null;
      if (t !== 'insertParagraph') actions.breakDouble();
      if (composing || ev.isComposing || t.includes('Composition')) {
        if (t === 'insertParagraph' || t === 'insertLineBreak') {
          // 조합 중의 엔터는 IME가 아니라 사람의 분할이다 — 조합이 끝난 뒤로 미룬다
          // Enter during composition is the user's own split, not the IME's; it's deferred until composition ends
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
        const [start, end] = ordered(sel);
        pendingTextInput =
          typeof ev.data === 'string' && !crosses && holder && !isWrapper(holder, env)
            ? {
                path: start.path,
                before: holderTextOf(holder, terminalOf(env)),
                start: start.offset,
                end: end.offset,
                data: ev.data,
              }
            : null;
        // 래퍼문단(0/1)이거나 여러 홀더에 걸친 범위는 브라우저가 고칠 텍스트 노드가 없거나 구조를 헤집는다
        // A wrapper paragraph (0/1) or a range spanning multiple holders has no text node for the browser to edit, or would disturb the structure
        if (crosses || (holder && isWrapper(holder, env))) {
          pendingTextInput = null;
          ev.preventDefault();
          if (typeof ev.data === 'string' && ev.data !== '') {
            nabi.applyCommand('insertText', { text: ev.data });
          }
        }
        // 문단 안 타이핑은 브라우저가 하고 input에서 되맞춘다(IME를 위한 최소 양보)
        // In-paragraph typing is left to the browser and reconciled on `input` (a minimal concession for IME)
        return;
      }
      syncSelectionForInput(ev);
      pendingChangedHolders = changedHolderIds(nabi.getSelection());
    };

    // --- 되맞추기 — 브라우저가 직접 고친 문단 하나를 트리로 --------------------------------------
    const reconcile = (pathHint?: readonly number[], inputHint?: TextInputHint): void => {
      const read = readCaret();
      const focusPath = pathHint ?? read?.selection.focus.path;
      if (!focusPath) return;
      const holder = nodeAt(doc(), focusPath);
      if (!holder || typeof holder._id !== 'string' || isWrapper(holder, env)) return;
      const el = holderElOf(root, holder._id);
      if (!el) return;

      const before = holderTextOf(holder, terminalOf(env));
      const actual = domTextOf(el, isCaretSlot);
      const after = projectDomEdit(
        before,
        actual,
        inputHint && samePath(inputHint.path, focusPath) ? inputHint : undefined,
      );
      const change = diffPlain(before, after);
      const hadArmed = !hostOf(nabi).armed.isEmpty();

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
            // 드문 길 — 브라우저가 개행째로 넣었다(자동완성 류) — 라인 경계로 갈라 순서대로 넣는다
            // A rare path where the browser inserted text with embedded newlines (like autofill); split on line boundaries and insert them in order
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

        // 예약이 소비된 타이핑은 화면(맨 글자)과 트리(마크 입은 글자)가 갈리므로 그 문단만 트리에서 다시 그린다
        // Typing that consumed a pending mark leaves the screen (plain text) diverging from the tree (marked-up text), so only that paragraph is redrawn from the tree
        if (hadArmed) {
          redrawTopAt(focusPath);
          writeCaret(nabi.getSelection());
          return;
        }

        // 스페이스 직후 오토포맷 — 변환이 일어나면 신호가 그 문단을 새로 그리고 캐럿도 쓴다
        // Autoformat right after a space; if a transform fires, its signal redraws that paragraph and writes the caret too
        if (change.inserted === ' ' && actions.afterSpace()) return;

        // 드롭캡 span은 첫 글자의 실제 DOM이다 — 타이핑·IME로 그 글자가 바뀌면 상자를 새 첫 글자로 옮겨야 하므로, 화면의 최종 캐럿을 트리에 받은 뒤 이 문단만 다시 그린다
        // The dropcap span is the real DOM for the first character; once typing/IME changes that character, the box must move to the new one, so the screen's final caret is adopted into the tree and then only this paragraph is redrawn
        const current = nodeAt(doc(), focusPath);
        if (current?.a?.['dc'] === 1) {
          const now = readCaret();
          if (now) adoptSelection(now.selection);
          redrawTopAt(focusPath);
          writeCaret(nabi.getSelection());
          return;
        }
      }

      // 화면 캐럿을 정본으로 삼는다 — 브라우저가 옮긴 캐럿을 트리가 따라가고 되쓰지 않는다
      // The screen caret is treated as authoritative here; the tree follows wherever the browser moved it, without writing back
      const now = readCaret();
      if (now) {
        syncing = true;
        try {
          nabi.select(now.selection);
        } finally {
          syncing = false;
        }
        // selectionchange 경로와 같은 안전망 — 구독자가 고쳐 세운 선택은 화면에도 써 준다
        // Same safety net as the selectionchange path; a selection a subscriber adjusted is also written back to the screen
        const settled = nabi.getSelection();
        if (!sameSelection(settled, now.selection)) writeCaret(settled);
      }
    };

    const onInput = (ev: Event): void => {
      const input = ev as InputEvent;
      const hint = pendingTextInput;
      const changed = pendingChangedHolders;
      pendingTextInput = null;
      pendingChangedHolders = [];
      if (composing || input.isComposing) return;
      if (input.inputType === 'insertText' && input.data === ZERO_WIDTH && caretSlot?.data === ZERO_WIDTH) {
        caretSlot = null;
      }
      if (changed.length > 0) {
        const tops = new Set<number>();
        for (const id of changed) {
          const path = pathOfId(doc(), env, id);
          if (!path) continue;
          tops.add(path[0] as number);
          reconcile(path);
        }
        for (const top of tops) redrawTopAt([top]);
        writeCaret(nabi.getSelection());
        cleanupZeroWidth();
        return;
      }
      const matchedHint =
        input.inputType === 'insertText' && typeof input.data === 'string' && input.data === hint?.data
          ? hint
          : undefined;
      reconcile(undefined, matchedHint);
      cleanupZeroWidth();
    };

    // --- IME 조합 (옛 판의 실기기 교훈 번역) -------------------------------------------
    function ensureCaretSlot(path: readonly number[] = nabi.getSelection().focus.path): void {
      const s = domSelection();
      if (s?.anchorNode?.nodeType === TEXT_NODE && root.contains(s.anchorNode)) return;
      const holder = nodeAt(doc(), path);
      if (!holder || typeof holder._id !== 'string' || isWrapper(holder, env)) return;
      const el = holderElOf(root, holder._id);
      if (!el || domTextOf(el, isCaretSlot) !== '') return;
      // Android Chrome은 compositionstart 전에 조합 대상을 정할 수 있다 — 빈 문단의 br·placeholder 위에서 시작하면 첫 초성·중성이 갈라지므로, 포커스 때부터 이 텍스트 노드 자리를 마련해 둔다
      // Android Chrome can decide its composition target before compositionstart fires; starting on an empty paragraph's br or its placeholder splits the first Hangul jamo, so this text-node slot is prepared as early as focus
      const slot = owner.createTextNode(ZERO_WIDTH);
      caretSlot = slot;
      el.replaceChildren(slot);
      expected = null;
      if (!s) return;
      try {
        s.setBaseAndExtent(slot, 1, slot, 1);
      } catch {
        // 자리만 만들어 둔다 — 선택을 못 옮겨도 조합은 이 노드에서 시작된다
        // Just prepares the slot; even if the selection can't be moved, composition still starts on this node
      }
    }

    const onCompositionStart = (): void => {
      if (composing) return;
      // 먼저 잠근다 — 아래에서 선택 동기화나 범위 삭제가 문단을 다시 그리면 IME가 막 붙잡은 텍스트 노드가 사라져 모바일 조합의 첫 자모와 캐럿이 흩어진다
      // Locks first; if selection sync or range deletion below redraws the paragraph, the text node the IME just grabbed disappears, scattering the first jamo and caret of a mobile composition
      composing = true;
      pendingTextInput = null;
      replaySelectAll = false;
      actions.breakDouble();
      // compositionstart에서는 트리를 전혀 안 고친다 — 여기서 바꾸면 구독자가 움직이고 범위 교체 한 번이 삭제+삽입 두 undo로 갈라진다. DOM 경로만 기억해 뒀다가 끝에서 트리와 최종 DOM을 한 번에 되맞춘다
      // compositionstart never touches the tree; changing it here would move subscribers and split one range replacement into two undo steps (delete + insert). Only the DOM path is remembered, then reconciled with the tree in one shot at the end
      const live = readCaret();
      compositionSelection = live?.selection ?? nabi.getSelection();
      compositionPath = compositionSelection.focus.path;
      const anchor = nodeAt(doc(), compositionSelection.anchor.path);
      compositionAnchorId = anchor && typeof anchor._id === 'string' ? anchor._id : null;
      const holder = nodeAt(doc(), compositionPath);
      compositionHolderId = holder && typeof holder._id === 'string' ? holder._id : null;
      const topIds = [compositionSelection.anchor.path[0], compositionSelection.focus.path[0]]
        .map((index) => nodeAt(doc(), [index as number]))
        .flatMap((node) => (node && typeof node._id === 'string' ? [node._id] : []));
      compositionTopIds = [...new Set(topIds)];
      compositionTopRefs = new Map(
        compositionTopIds.flatMap((id) => {
          const node = doc().find((top) => top._id === id);
          return node ? [[id, node] as const] : [];
        }),
      );
      const [start, end] = ordered(compositionSelection);
      const startHolder = nodeAt(doc(), start.path);
      const endHolder = nodeAt(doc(), end.path);
      if (
        !samePath(start.path, end.path) &&
        startHolder &&
        typeof startHolder._id === 'string' &&
        endHolder &&
        typeof endHolder._id === 'string'
      ) {
        const startText = holderTextOf(startHolder, terminalOf(env));
        const endText = holderTextOf(endHolder, terminalOf(env));
        const linear = holders(doc(), env);
        const startIndex = linear.findIndex((entry) => samePath(entry.path, start.path));
        const endIndex = linear.findIndex((entry) => samePath(entry.path, end.path));
        const middle =
          startIndex >= 0 && endIndex > startIndex
            ? linear
                .slice(startIndex + 1, endIndex)
                .flatMap((entry) =>
                  typeof entry.node._id === 'string'
                    ? [{ id: entry.node._id, text: holderTextOf(entry.node, terminalOf(env)) }]
                    : [],
                )
            : [];
        compositionSpan = {
          startId: startHolder._id,
          endId: endHolder._id,
          startOffset: start.offset,
          endOffset: end.offset,
          prefix: startText.slice(0, start.offset),
          suffix: endText.slice(end.offset),
          startText,
          endText,
          middle,
        };
      } else {
        compositionSpan = null;
      }
      redrawAfterComposition = false;
      compositionConflict = false;
      ensureCaretSlot(compositionPath);
    };

    const cleanupZeroWidth = (restoreEmpty = false): void => {
      const slot = caretSlot;
      if (!slot) return;
      if (!root.contains(slot)) {
        caretSlot = null;
        return;
      }
      const s = domSelection();
      const range = s && s.rangeCount > 0 ? s.getRangeAt(0) : null;
      const parent = slot.parentElement;
      const caretHere = range !== null && range.collapsed && range.startContainer === slot;
      const marker = slot.data.startsWith(ZERO_WIDTH);
      const cleaned = marker ? slot.data.slice(1) : slot.data;
      if (cleaned === '') {
        if (restoreEmpty && parent) {
          slot.remove();
          caretSlot = null;
          if (parent.childNodes.length === 0) {
            const filler = owner.createElement('br');
            filler.setAttribute(FILLER_ATTR, '');
            parent.append(filler);
          }
          return;
        }
        if (parent && domTextOf(parent, isCaretSlot) !== '') {
          slot.remove();
          caretSlot = null;
          if (caretHere) writeCaret(nabi.getSelection());
          return;
        }
        return;
      }
      const offset = caretHere ? Math.max(0, range.startOffset - (marker ? 1 : 0)) : 0;
      slot.data = cleaned;
      caretSlot = null;
      if (caretHere && s) {
        try {
          s.collapse(slot, Math.min(offset, slot.data.length));
        } catch {
          // selectionchange가 트리 캐럿으로 따라잡는다
          // selectionchange will catch up to the tree caret
        }
      }
    };

    const compositionReplacement = (span: CompositionSpan): string | null => {
      const start = holderElOf(root, span.startId);
      if (!start) return null;
      const actual = domTextOf(start, isCaretSlot);
      const end = holderElOf(root, span.endId);
      const endActual = end ? domTextOf(end, isCaretSlot) : null;
      const middleUnchanged = span.middle.every(({ id, text }) => {
        const el = holderElOf(root, id);
        return el !== null && domTextOf(el, isCaretSlot) === text;
      });
      if (actual === span.startText && endActual === span.endText && middleUnchanged) return null;

      const middleLost = span.middle.every(({ id }) => {
        const el = holderElOf(root, id);
        return el === null || domTextOf(el, isCaretSlot) === '';
      });
      if (middleLost && actual === span.prefix && endActual === span.suffix) return '';
      if (endActual !== null || !middleLost) return null;
      if (actual.length < span.prefix.length + span.suffix.length) return null;
      const head = actual.slice(0, span.prefix.length);
      const tail = actual.slice(actual.length - span.suffix.length);
      if (span.prefix !== head || span.suffix !== tail) return null;
      return actual.slice(span.prefix.length, actual.length - span.suffix.length);
    };

    const finishComposition = (data: string | null): void => {
      if (!composing && compositionPath === null) return;
      composing = false;
      const path = compositionHolderId
        ? (pathOfId(doc(), env, compositionHolderId) ?? compositionPath)
        : compositionPath;
      const anchorPath = compositionAnchorId
        ? pathOfId(doc(), env, compositionAnchorId)
        : compositionSelection?.anchor.path;
      const focusPath = compositionHolderId
        ? pathOfId(doc(), env, compositionHolderId)
        : compositionSelection?.focus.path;
      const fallbackRange =
        compositionSelection && anchorPath && focusPath
          ? {
              anchor: { path: anchorPath, offset: compositionSelection.anchor.offset },
              focus: { path: focusPath, offset: compositionSelection.focus.offset },
            }
          : null;
      const span = compositionSpan;
      const startPath = span ? pathOfId(doc(), env, span.startId) : null;
      const endPath = span ? pathOfId(doc(), env, span.endId) : null;
      const orderedRange =
        span && startPath && endPath
          ? {
              anchor: { path: startPath, offset: span.startOffset },
              focus: { path: endPath, offset: span.endOffset },
            }
          : null;
      const crosses = span !== null;
      const conflict = compositionConflict;
      const redraw = redrawAfterComposition;
      const inferred = !conflict && span && (data === null || data === '') ? compositionReplacement(span) : null;
      const replacement = data !== null && data !== '' ? data : inferred;
      compositionPath = null;
      compositionSelection = null;
      compositionAnchorId = null;
      compositionHolderId = null;
      compositionSpan = null;
      compositionTopIds = [];
      compositionTopRefs = new Map();
      redrawAfterComposition = false;
      compositionConflict = false;
      if (!conflict && crosses) {
        const range = replacement !== null ? orderedRange : fallbackRange;
        if (range) {
          reconciling = true;
          try {
            nabi.select(range);
            if (replacement !== null && orderedRange) {
              if (replacement === '') nabi.applyCommand('deleteRange');
              else nabi.applyCommand('insertText', { text: replacement });
            }
          } finally {
            reconciling = false;
          }
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
      // 일부 모바일 IME는 포커스가 먼저 떠나면 compositionend를 빠뜨린다 — 보이는 조합값을 트리에 확정해 잠금이 다음 포커스까지 영구히 남지 않게 한다
      // Some mobile IMEs skip compositionend when focus leaves first; the visible composition value is committed to the tree so the lock doesn't persist until the next focus
      finishComposition(null);
      cleanupZeroWidth(true);
    };

    // --- 붙여넣기·드롭·클릭 ----------------------------------------------------------------------
    // 붙여넣기 판정은 전부 paste.ts에 있다 — 여기서는 이벤트에서 값을 뜨는 일만 한다. clipboardData는 이 함수 밖에서 죽으므로 동기 구간에서 전부 떠 둔다(판이 뜨면 답은 나중에 온다)
    // All paste decision-making lives in paste.ts; this only extracts values from the event, since clipboardData dies outside this synchronous call (any menu it triggers resolves later)
    const onPaste = (ev: ClipboardEvent): void => {
      ev.preventDefault();
      const cd = ev.clipboardData;
      let files: File[];
      let types: string[];
      let custom: string;
      let html: string;
      let plain: string;
      try {
        files = cd ? Array.from(cd.files) : [];
        types = cd ? Array.from(cd.types) : [];
        custom = cd?.getData(NABI_CLIPBOARD_MIME) ?? '';
        html = cd?.getData('text/html') ?? '';
        plain = cd?.getData('text/plain') ?? '';
      } catch {
        return;
      }
      if (!adoptLiveSelection()) return;
      takePaste(
        {
          custom,
          html,
          plain,
          files,
          types,
        },
        files,
      );
    };

    // 복사·잘라내기는 클립보드를 우리가 직접 채운다(260823_008) — 봉해진 첨부는 브라우저가 자동으로 안 실으므로 세 형식을 직접 쓴다. custom MIME은 브라우저가 HTML을 다시 꾸며도 원본 트리 조각을 보존한다
    // Copy/cut fill the clipboard ourselves (260823_008), since the browser won't automatically carry a sealed attachment; all three formats are written by hand. The custom MIME preserves the original tree fragment even if the browser reformats the HTML
    const onCopyOrCut = (ev: ClipboardEvent): void => {
      if (!adoptLiveSelection()) {
        if (ev.type === 'cut') ev.preventDefault();
        return;
      }
      const s = domSelection();
      if (!s || s.rangeCount === 0 || s.isCollapsed) return;
      const range = s.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return;
      const cutting = ev.type === 'cut';
      if (cutting) ev.preventDefault();
      const html = clipHtmlOf(range, root, owner);
      const cd = ev.clipboardData;
      if (!cd) return;
      // 맨 글자는 Selection.toString()이 먼저다(블록 사이 줄바꿈은 그것만 안다) — user-select:none이 걸린 봉해진 첨부에서는 그게 빈 글자라 CSS를 안 보는 Range.toString()으로 받친다
      // Plain text prefers Selection.toString() (only it knows about newlines between blocks); over a sealed attachment with user-select:none it comes back empty, so Range.toString() (which ignores CSS) backs it up
      const plain = s.toString() || range.toString();
      const body = $toJson(clipboardBodyOf(doc(), nabi.getSelection(), env));
      const written = loadClipboard(cd, body, html, plain);
      if (!written) return;
      if (!cutting) ev.preventDefault();
      // preventDefault를 했으니 브라우저의 deleteByCut이 안 온다 — 지우는 것도 우리 몫이다
      // Having called preventDefault, the browser's deleteByCut never fires, so deletion is our responsibility too
      if (cutting) nabi.applyCommand('deleteRange');
    };

    const onDrop = (ev: DragEvent): void => {
      const transfer = ev.dataTransfer;
      if (!transfer) return;
      let types: string[];
      let files: File[];
      let custom: string;
      let html: string;
      let plain: string;
      try {
        types = Array.from(transfer.types);
      } catch {
        return;
      }
      const supported = ['Files', NABI_CLIPBOARD_MIME, 'text/html', 'text/plain'].some((type) => types.includes(type));
      if (!supported) return;
      // 인식한 drop은 이후 후보가 거절되더라도 브라우저의 raw HTML 삽입이나 파일 navigation으로 되살아나면 안 된다 — 앱 상태는 그대로 두되 native default는 여기서 먼저 막는다
      // A recognized drop must not fall back to the browser's raw HTML insertion or file navigation even if the candidate is later rejected; app state is left alone, but the native default is blocked here first
      ev.preventDefault();
      try {
        files = Array.from(transfer.files);
        custom = transfer.getData(NABI_CLIPBOARD_MIME);
        html = transfer.getData('text/html');
        plain = transfer.getData('text/plain');
      } catch {
        return;
      }

      const pointOwner = owner as Document & {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      };
      const position = pointOwner.caretPositionFromPoint?.(ev.clientX, ev.clientY);
      const range = position ? null : pointOwner.caretRangeFromPoint?.(ev.clientX, ev.clientY);
      const node = position?.offsetNode ?? range?.startContainer ?? null;
      const offset = position?.offset ?? range?.startOffset ?? 0;
      if (!node || !root.contains(node)) return;
      const mapped = fromDomPoint(root, doc(), env, node, offset, isCaretSlot);
      if (!mapped) return;
      takePaste(
        {
          custom,
          html,
          plain,
          files,
          types,
        },
        files,
        caretAt(mapped.pos),
      );
    };

    const onDragOver = (ev: DragEvent): void => {
      const types = ev.dataTransfer ? Array.from(ev.dataTransfer.types) : [];
      if (['Files', NABI_CLIPBOARD_MIME, 'text/html', 'text/plain'].some((type) => types.includes(type))) {
        ev.preventDefault();
      }
    };

    // 눌린 자리의 물건(래퍼문단)을 찾는다(없으면 null) — data-key 조상을 만날 때마다 멈추지 않고 글 홀더(문단·칸)를 만날 때까지 올라간다(그림도 자기 키를 달고 있어 거기서 멈추면 눌러도 반응이 없다). 속이 빈 물건만 고른다 — 표·목록처럼 속에 글이 있는 그릇을 통째로 고르면 다음 글자 하나가 그것을 통째로 지웠다(표 오른쪽 빈 자리를 누르고 타이핑하면 표가 사라지던 버그). 글 품은 물건은 null을 답해 캐럿을 브라우저가 가장 가까운 글자리에 놓게 하고, 통째 선택은 첫머리 백스페이스(aimVessel)로 따로 연다
    // Finds the object (wrapper paragraph) under a press, or null; it climbs past every data-key ancestor until it hits a text holder (paragraph/cell), since an image also carries its own key and stopping there would make clicking it do nothing. Only childless objects are selected -- selecting a text-bearing vessel (table/list) whole meant the next keystroke deleted it entirely (clicking the empty space right of a table and typing made the table vanish). Text-bearing objects answer null here, letting the browser place the caret at the nearest text spot; whole-vessel selection has its own door, opened by Backspace at the vessel's start (aimVessel)
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
        // 글을 눌렀다
        // Text was clicked
        if (holder && isHolder(holder, env)) return null;
        el = el.parentElement?.closest('[data-key]') ?? null;
      }
      return null;
    };

    // 물건 고르기는 click이 아니라 누르는 순간(mousedown)에 한다 — click에서 하면 브라우저가 먼저 놓은 캐럿의 selectionchange가 우리 write 뒤에 도착해 트리를 되돌린다(눌러도 그림이 안 골라지던 버그). mousedown을 삼켜 브라우저가 캐럿을 놓을 일 자체를 없애고, 포커스는 우리가 직접 준다. 몸짓의 나머지(mouseup·click)도 함께 삼킨다
    // Object selection happens on mousedown, not click; doing it on click let the browser's own caret placement fire a selectionchange that arrived after our write and reverted the tree (clicking an image sometimes failed to select it). Swallowing mousedown prevents the browser from placing a caret at all, and focus is given manually instead; the rest of the gesture (mouseup, click) is swallowed too
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

    // 누르기를 삼켜도 브라우저는 떼는 순간 다시 캐럿을 놓으려 한다 — 한 몸짓의 세 걸음을 다 삼켜야 우리가 세운 선택이 남는다
    // Even with mousedown swallowed, the browser still tries to place a caret on release; all three steps of the gesture must be swallowed for our selection to survive
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
      // 편집 중 문서는 쓰는 것이지 보는 것이 아니다 — 링크는 이동하지 않는다
      // A document being edited is for writing, not browsing; links don't navigate
      const anchor = target.closest('a');
      if (anchor && root.contains(anchor)) ev.preventDefault();
    };

    // --- 조립 -----------------------------------------------------------------------------------
    // contenteditable은 코어가 소유한다 — 호스트 마크업에 적지 않는다(준비 셋)
    // The core owns the contenteditable attribute; hosts never set it in their markup (prep set 3)
    const attributes = new HostElementLease(root);
    lifecycle.add(() => attributes.dispose());
    attributes.attribute('contenteditable', 'true');
    attributes.className('nabi-editing', true);
    if (options.locale !== undefined) attributes.attribute('dir', localeDirection(options.locale));
    // 빈 편집기의 안내글은 말만 여기서 정한다 — 언제·어떻게 뜨는지는 시트의 몫이고(빈 문단 하나라는 모양만 겨눈다), 여기는 CSS 변수 한 칸에 그 말을 적을 뿐이라 트리·DOM에 안 들어가 저장값·캐럿 셈이 흔들릴 일이 없다. 안 받았으면 코어 사전이 로케일대로 낸다
    // The empty-editor placeholder text is set here only; when/how it appears is the stylesheet's job (targeting the single "one empty paragraph" shape), and this just writes the text into a CSS variable, so it never enters the tree or DOM and can't disturb saved values or caret counting. If none is given, the core dictionary supplies a localized one
    const placeholder = options.placeholder ?? translate('placeholder', options.locale ?? hostOf(nabi).locale());
    if (placeholder !== '') attributes.style('--nabi-placeholder', cssQuoted(placeholder));
    // hydrate — 서버가 그린 편집기 DOM이 문서와 맞으면 다시 그리지 않고 입양한다
    // hydrate: adopts the server-rendered editor DOM instead of redrawing it, if it matches the document
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

    lifecycle.add(() => {
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
    });

    // 선언형 부속 — wing이 선언한 표면 훅을 여기서 붙이고, unmount가 뗀다
    // Declarative extras: wing-declared surface hooks are attached here and detached by unmount
    for (const attach of registry.attaches) {
      const attached = new DisposerStack();
      lifecycle.add(() => attached.dispose());
      let attaching = true;
      try {
        const dispose = attach({
          root,
          nabi,
          doc,
          env,
          pathOfKey: (id) => pathOfId(doc(), env, id),
          onDispose: (registered) => {
            if (!attaching) throw new Error('Attach cleanup must be registered while attach() is running');
            attached.add(registered);
          },
        });
        attaching = false;
        attached.add(dispose);
      } catch (error) {
        attaching = false;
        attached.dispose();
        throw error;
      }
    }

    let unmounted = false;

    return {
      actions,
      port,
      focus: port.focus,
      redrawAll() {
        renderAll();
        writeCaret(nabi.getSelection());
      },
      unmount() {
        if (unmounted) return;
        unmounted = true;
        try {
          finishComposition(null);
        } finally {
          try {
            cleanupZeroWidth(true);
          } finally {
            lifecycle.dispose();
            root.innerHTML = nabi.getHtml();
          }
        }
      },
    };
  } catch (error) {
    lifecycle.dispose();
    baseline.restore();
    throw error;
  }
}
