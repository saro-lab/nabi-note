// DOM 없이 도는 키 정책 엔진 — mount(DOM)는 이벤트만 여기로 넘기고 preventDefault만 결정한다. 파이프라인: wing.onKey → 코어 규칙 → 브라우저(true=소비)
// A DOM-free key policy engine; mount(DOM) only forwards events here and decides preventDefault. Pipeline: wing.onKey -> core rules -> browser (true = consumed)
import { isWrapper } from '../schema/index.js';
import { holderLength, holders, nodeAt, type Position } from '../doc/index.js';
import {
  caretAt,
  docEnd,
  docStart,
  isCollapsed,
  marksAt,
  samePosition,
  stepBackward,
  stepForward,
} from '../caret/index.js';
import { hostOf, type Nabi } from '../editor/index.js';
import { routeKey, type KeyIntent, type Registry } from '../wing/index.js';
import { tryInputRule } from './autoformat.js';
import { canEscape, escapeVesselOp, vesselAt } from './vessel.js';

export type ArrowDir = 'left' | 'right' | 'up' | 'down';

// 모든 연타 몸짓(이중 엔터·Esc 두 번·Shift 두 번)이 공유하는 창(ms) — 갈리면 손이 셋을 따로 익혀야 한다
// Shared double-tap window (ms) for every tap gesture (double Enter, double Esc, double Shift); a mismatch would force users to learn three different timings
export const TAP_MS = 350;

export interface SurfaceActionsOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 그릇 탈출의 이중 엔터 창(ms) — Esc 연타도 이 값을 나눠 쓴다
  // Vessel-escape double-Enter window (ms); double-Esc shares this same value
  readonly doubleEnterMs?: number;
  readonly now?: () => number;
  // 위에 뜬 것(덮개·판·전체화면 등)이 없을 때만 참 — 없으면 게이트 없이 Esc 두 번이 두 몸짓을 한 번에 낸다
  // True only when nothing is overlaid (scrim/panel/fullscreen); without this gate, double-Esc would fire two gestures at once
  readonly plain?: () => boolean;
}

export interface SurfaceActions {
  enter(): boolean;
  shiftEnter(): boolean;
  tab(shift: boolean): boolean;
  backspace(): boolean;
  deleteForward(): boolean;
  arrow(dir: ArrowDir): boolean;
  selectAll(): boolean;
  // 마크 탈출용 키(음수 예약)와 Escape(예약 해제)를 가른다 — true면 키를 소비했다는 뜻이다. repeat는 눌러 둔 반복 이벤트라 연타로 안 센다
  // Distinguishes mark-escape keys (negative pending) from Escape (clears pending); true means consumed. `repeat` marks a held-key repeat, which never counts as a tap
  escapeKey(key: string, repeat?: boolean): boolean;
  // 연타 셈을 끊는다 — IME 조합 중의 키처럼 "연타가 아닌 것"이 지날 때 mount가 부른다
  // Resets the tap count; mount calls this when a non-tap key (like an IME composition key) passes through
  breakDouble(): void;
  // 스페이스 직후 오토포맷 — reconcile이 스페이스를 트리에 넣은 뒤 mount가 부른다
  // Autoformat right after a space; called once reconcile has already inserted the space into the tree
  afterSpace(): boolean;
  // 다음 홀더가 드롭캡이면 그 첫 자리를 준다 — ArrowDown 개입 여부는 mount가 화면 줄로 판단해 쓴다
  // Returns the first position of the next holder if it's a dropcap; mount uses this to decide whether ArrowDown should intervene, based on visual line
  dropcapBelow(): Position | null;
}

export function makeSurfaceActions(options: SurfaceActionsOptions): SurfaceActions {
  const { nabi, registry } = options;
  const doubleMs = options.doubleEnterMs ?? TAP_MS;
  const now = options.now ?? (() => Date.now());
  let lastEnterAt = 0;
  let lastEscapeAt = 0;
  let escapeTaps = 0;

  // 연타를 받아도 되는 자리인가 — 위에 뜬 것도 없고 문서도 안 잠겼다
  // Whether taps are allowed here: nothing overlaid and the document isn't locked
  const plain = (): boolean => hostOf(nabi).lockedBy() === null && (options.plain?.() ?? true);

  // wing에게 먼저 묻는다 — null이면 pass, 응답했으면 그 키는 wing 것이다. 문서 변화 여부로 판단하지 않는다: 침묵의 응답(false)도 "처리했다"로 읽어야 한다(안 그러면 목록 첫 항목 탭이 코어의 스페이스 넷까지 흘러갔다)
  // Asks the owning wing first: null means pass, any other response means the wing owns this key. Ownership isn't inferred from doc changes -- a silent (no-op) response still counts as "handled", or a list's first-item Tab would fall through to core's four-space rule
  const route = (intent: KeyIntent): boolean => {
    const outcome = routeKey(intent, hostOf(nabi).doc(), nabi.getSelection(), hostOf(nabi).env, registry);
    if (outcome === null) return false;
    hostOf(nabi).applyRaw(() => outcome, `key:${intent.key}`);
    return true;
  };

  const enter = (): boolean => {
    const t = now();
    const quick = t - lastEnterAt <= doubleMs;
    // 엔터 트리거 오토포맷(구분선·코드 펜스)이 먼저다 — 아무도 안 잡을 때만 문단 분할로 간다
    // Enter-triggered autoformat (divider, code fence) runs first; splitting only happens if nothing claims it
    if (tryInputRule(nabi, registry, 'enter')) {
      lastEnterAt = 0;
      return true;
    }
    if (route({ key: 'enter' })) {
      lastEnterAt = 0;
      return true;
    }
    lastEnterAt = t;
    if (quick) {
      const sel = nabi.getSelection();
      if (isCollapsed(sel)) {
        const vessel = vesselAt(hostOf(nabi).doc(), sel.focus, registry);
        if (vessel && canEscape(hostOf(nabi).doc(), sel.focus, vessel, hostOf(nabi).env)) {
          if (hostOf(nabi).applyRaw(escapeVesselOp(vessel), 'escapeVessel')) {
            lastEnterAt = 0;
            return true;
          }
        }
      }
    }
    nabi.applyCommand('splitParagraph');
    // 엔터는 언제나 여기서 처리한다 — 브라우저의 기본 분할은 쓰지 않는다
    // Enter is always handled here; the browser's native split is never used
    return true;
  };

  const arrow = (dir: ArrowDir): boolean => {
    lastEnterAt = 0;
    if (route({ key: 'arrow', dir })) return true;
    const sel = nabi.getSelection();
    // 범위 걸음(Shift 등)은 브라우저의 것
    // Stepping over a range (e.g. with Shift) is left to the browser
    if (!isCollapsed(sel)) return false;
    const doc = hostOf(nabi).doc();
    const env = hostOf(nabi).env;
    const holder = nodeAt(doc, sel.focus.path);
    if (!holder) return false;
    const wrapped = isWrapper(holder, env);
    const back = dir === 'left' || dir === 'up';

    // 상하 이동은 화면 줄 단위라 브라우저 몫이다 — 래퍼문단(0/1)만 논리 걸음으로 대신한다
    // Up/down movement is visual-line based and left to the browser; only wrapper paragraphs (0/1) use logical stepping instead
    if (dir === 'up' || dir === 'down') {
      if (!wrapped) return false;
      const target = back ? stepBackward(doc, sel.focus, env) : stepForward(doc, sel.focus, env);
      if (!samePosition(target, sel.focus)) nabi.select(caretAt(target));
      return true;
    }

    // 좌우 이동은 문단 안에서는 브라우저가, 경계(홀더 끝·래퍼)는 트리가 건넨다(③)
    // Left/right movement stays with the browser inside a paragraph; the tree steps across boundaries (holder edges, wrappers) (③)
    const atEdge = back ? sel.focus.offset === 0 : sel.focus.offset === holderLength(holder, env);
    if (!wrapped && !atEdge) return false;
    const target = back ? stepBackward(doc, sel.focus, env) : stepForward(doc, sel.focus, env);
    if (!samePosition(target, sel.focus)) nabi.select(caretAt(target));
    // 문서 양끝은 제자리 소비 — 캐럿이 편집기를 안 나간다
    // At the document's edges the key is still consumed in place, so the caret never leaves the editor
    return true;
  };

  // 그릇 첫머리의 백스페이스는 바로 지우지 않고 그릇 전체를 먼저 선택한다(감싼 래퍼문단 0~1) — 한 번 더 쳐야 지워진다. 예전엔 조용히 껍데기만 벗겨져 표가 순식간에 사라지고 되돌리기만 살길이었다
  // Backspace at a vessel's first position selects the whole vessel (its wrapper paragraph, 0-1) instead of deleting; a second press is needed. It used to silently strip the wrapper, making a table vanish instantly with only undo to recover it
  const aimVessel = (): boolean => {
    const sel = nabi.getSelection();
    if (!isCollapsed(sel) || sel.focus.offset !== 0) return false;
    const doc = hostOf(nabi).doc();
    const env = hostOf(nabi).env;
    const vessel = vesselAt(doc, sel.focus, registry);
    if (!vessel) return false;

    // 그릇 안 첫 홀더인가 — 안쪽에 또 그릇이 있으면 vesselAt이 그 안쪽부터 먼저 겨눈다
    // Is this the vessel's first holder; if a nested vessel exists inside, vesselAt targets it first
    const inside = holders([vessel.node], env);
    const first = inside[0];
    if (!first) return false;
    const firstPath = [...vessel.path, ...first.path.slice(1)];
    if (firstPath.length !== sel.focus.path.length) return false;
    if (!firstPath.every((v, i) => v === sel.focus.path[i])) return false;

    // 그릇은 물건이라 언제나 감싸는 래퍼문단을 하나 쓰고 있다
    // A vessel is an "object" node, so it's always wrapped in exactly one wrapper paragraph
    const wrapPath = vessel.path.slice(0, -1);
    const wrap = nodeAt(doc, wrapPath);
    if (!wrap || !isWrapper(wrap, env)) return false;
    return nabi.select({ anchor: { path: wrapPath, offset: 0 }, focus: { path: wrapPath, offset: 1 } });
  };

  return {
    enter,
    shiftEnter() {
      lastEnterAt = 0;
      // 그릇·리스트가 Shift+Enter도 자기 규칙으로 받을 수 있다
      // Vessels/lists may claim Shift+Enter through their own rule too
      if (route({ key: 'enter' })) return true;
      nabi.applyCommand('insertLine');
      return true;
    },
    tab(shift) {
      lastEnterAt = 0;
      if (route({ key: shift ? 'shiftTab' : 'tab' })) return true;
      // 아무도 안 가져간 Tab은 스페이스 넷이 되지만 캐럿이 접혀 있을 때만이다 — 범위 위에서 넣으면 잡힌 문단들이 통째로 지워진다(탭은 "깊이"를 뜻하는 키라 임자가 없으면 아무 일도 안 하는 게 맞다)
      // An unclaimed Tab becomes four spaces only when the caret is collapsed; inserting over a range would delete the selected paragraphs outright (Tab means "depth", so doing nothing is correct when no owner claims it)
      if (!shift && isCollapsed(nabi.getSelection())) nabi.applyCommand('insertText', { text: '    ' });
      // Tab이 포커스를 편집기 밖으로 내보내지 않는다
      // Tab never moves focus outside the editor
      return true;
    },
    backspace() {
      lastEnterAt = 0;
      // wing의 규칙이 겨누기(aimVessel)보다 먼저다 — 목록 첫 항목의 백스페이스는 표식만 벗겨야지, 겨누기가 먼저 서면 목록 전체가 한 번에 사라졌다. 겨누기는 제 규칙이 없는 그릇(인용·접기·코드·표)에만 남는 답이다
      // The wing's own rule wins over aimVessel; a list's first-item Backspace should only strip its marker, and letting aimVessel go first made the whole list disappear in one press. aimVessel only answers for vessels without their own rule (quote/details/code/table)
      if (route({ key: 'backspace' })) return true;
      if (aimVessel()) return true;
      nabi.applyCommand('deleteBackward');
      // 삭제 표(§2.5)는 전부 여기서 처리한다
      // All deletion marks (§2.5) are produced here
      return true;
    },
    deleteForward() {
      lastEnterAt = 0;
      if (route({ key: 'delete' })) return true;
      nabi.applyCommand('deleteForward');
      return true;
    },
    arrow,
    selectAll() {
      lastEnterAt = 0;
      const doc = hostOf(nabi).doc();
      const env = hostOf(nabi).env;
      const start = docStart(doc, env);
      const end = docEnd(doc, env);
      if (!start || !end) return false;
      nabi.select({ anchor: start, focus: end });
      return true;
    },
    escapeKey(key, repeat) {
      lastEnterAt = 0;
      // --- 연타 셈은 아래 갈래가 키를 가져가도 계속 센다 — 안 그러면 마크 탈출이 Esc를 매번 먼저 먹어 형광펜 위에서 연타가 영영 안 선다. 발동은 정확히 두 번째뿐이고 셋째·넷째는 흘려보낸다(힌트와 같은 모양) ---
      // Tap counting continues even when a lower branch claims the key, or mark-escape eating every Esc would keep the count stuck at 1 on a highlighted caret. Only the exact second tap fires; a 3rd/4th tap is absorbed (same shape as the hint gesture)
      const counts = registry.doubles.has(key) && repeat !== true && plain();
      const t = now();
      escapeTaps = counts ? (t - lastEscapeAt <= doubleMs ? escapeTaps + 1 : 1) : 0;
      lastEscapeAt = counts ? t : 0;
      const quick = escapeTaps === 2;

      // 예약 걷기·마크 탈출 세 갈래 — 답하는 것은 키를 삼켰는가 하나뿐이다
      // Three branches (clear pending / mark escape); each only answers whether it consumed the key
      const escapeStages = (): boolean => {
        // 양수 예약이 있으면 Escape가 그것부터 걷는다 — 가장 최근에 명시된 상태다(②)
        // If a positive pending mark exists, Escape clears it first, being the most recently declared state (②)
        if (key === 'Escape' && hostOf(nabi).armed.peek().plus.length > 0) {
          hostOf(nabi).armed.clear();
          return true;
        }
        const sel = nabi.getSelection();
        const declared = registry.escapes.get(key);
        // 선언된 탈출 키 — 캐럿이 해당 마크 안일 때만 음수 예약을 세운다(④)
        // A declared escape key sets a negative pending mark only when the caret sits inside that mark (④)
        if (declared && isCollapsed(sel)) {
          const marks = marksAt(hostOf(nabi).doc(), sel.focus, hostOf(nabi).env);
          const hit = declared.filter((w) => marks.some((mark) => mark.w === w));
          if (hit.length > 0) {
            for (const w of hit) hostOf(nabi).armed.escape(w);
            return true;
          }
        }
        // 남은 음수 예약도 Escape로 걷는다 — 걷은 것이 있을 때만 키를 소비한다
        // Escape also clears any remaining negative pending marks; the key is consumed only if something was cleared
        if (key === 'Escape' && !hostOf(nabi).armed.isEmpty()) {
          hostOf(nabi).armed.clear();
          return true;
        }
        return false;
      };
      const consumed = escapeStages();

      // 연타 발동은 선언한 wing이 있을 때만 돈다 — 선택 범위든 접힌 캐럿이든 그대로 부르고, 무엇을 지울지는 커맨드가 안다. 커맨드가 침묵하면 키도 안 삼킨다
      // The tap gesture only fires for a wing that declared it; it's called regardless of selection vs. collapsed caret, and the command itself decides what to clear. A no-op command leaves the key unconsumed
      const double = quick ? registry.doubles.get(key) : undefined;
      if (double !== undefined && nabi.applyCommand(double)) return true;
      return consumed;
    },
    breakDouble() {
      lastEnterAt = 0;
      escapeTaps = 0;
      lastEscapeAt = 0;
    },
    afterSpace() {
      lastEnterAt = 0;
      return tryInputRule(nabi, registry, 'space');
    },
    dropcapBelow() {
      const sel = nabi.getSelection();
      if (!isCollapsed(sel)) return null;
      const doc = hostOf(nabi).doc();
      const env = hostOf(nabi).env;
      const all = holders(doc, env);
      const at = all.findIndex(
        (h) => h.path.length === sel.focus.path.length && h.path.every((v, i) => v === sel.focus.path[i]),
      );
      const next = at >= 0 ? all[at + 1] : undefined;
      if (!next || next.node.a?.['dc'] !== 1) return null;
      return { path: next.path, offset: 0 };
    },
  };
}
