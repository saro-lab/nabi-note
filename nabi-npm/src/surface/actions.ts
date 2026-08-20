// 표면의 정책 엔진 — DOM 없이 도는 키 처리 전부다. mount(DOM)는 이벤트를 이 문으로 옮기고
// preventDefault 만 결정한다. 그래서 키 파이프라인이 통째로 그물에 잡힌다 (surface).
//
// 파이프라인: 소유자 wing.onKey → (pass) 코어 내장 규칙 → (pass) 브라우저.
// true = 우리가 소비했다(preventDefault), false = 브라우저의 걸음이다.
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
import type { Nabi } from '../editor/index.js';
import { routeKey, type KeyIntent, type Registry } from '../wing/index.js';
import { tryInputRule } from './autoformat.js';
import { canEscape, escapeVesselOp, vesselAt } from './vessel.js';

export type ArrowDir = 'left' | 'right' | 'up' | 'down';

export interface SurfaceActionsOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 그릇 탈출의 "빠른 이중 엔터" 창(ms) — 조정 가능한 상수.
  readonly doubleEnterMs?: number;
  readonly now?: () => number;
}

export interface SurfaceActions {
  enter(): boolean;
  shiftEnter(): boolean;
  tab(shift: boolean): boolean;
  backspace(): boolean;
  deleteForward(): boolean;
  arrow(dir: ArrowDir): boolean;
  selectAll(): boolean;
  // escapeKeys(예약 음수 방향)와 Escape(예약 해제)를 가른다 — true 면 키를 소비한다.
  escapeKey(key: string): boolean;
  // 스페이스 직후의 오토포맷 — 되맞추기(reconcile)가 스페이스를 트리에 넣은 뒤 부른다.
  afterSpace(): boolean;
  // 다음 홀더가 드롭캡이면 그 첫 자리 — ArrowDown 개입은 mount 가 화면 줄로 판단해 쓴다.
  dropcapBelow(): Position | null;
}

export function makeSurfaceActions(options: SurfaceActionsOptions): SurfaceActions {
  const { nabi, registry } = options;
  const doubleMs = options.doubleEnterMs ?? 350;
  const now = options.now ?? (() => Date.now());
  let lastEnterAt = 0;

  // 소유자 wing 에게 묻는다 — null 이면 pass. 답한 결과가 무변화면 문의 침묵으로 false 가
  // 되어 코어 규칙으로 떨어진다(wing 은 "내 일 아님"을 null 로만 말한다는 계약의 다른 반쪽).
  // 임자에게 물어본다 — **답했으면 그 키는 그의 것이다.**
  //
  // 문서가 바뀌었는지로 판단하지 않는다(계약: "null = pass … 트리 동일성으로 짐작하지 않는다").
  // 문이 침묵으로 false 를 답하는 자리가 있어서, 그것을 그대로 돌려주면 **아무 일도 안 하기로
  // 한 답**이 "임자가 없다" 로 읽혔다 — 목록 첫 항목의 탭이 그래서 코어의 스페이스 넷까지
  // 흘러갔다. 임자가 `null` 이 아닌 것을 답했으면 거기서 끝이다.
  const route = (intent: KeyIntent): boolean => {
    const outcome = routeKey(intent, nabi.$doc(), nabi.getSelection(), nabi.$env, registry);
    if (outcome === null) return false;
    nabi.$applyRaw(() => outcome, `key:${intent.key}`);
    return true;
  };

  const enter = (): boolean => {
    const t = now();
    const quick = t - lastEnterAt <= doubleMs;
    lastEnterAt = t;
    // 엔터 트리거 오토포맷(구분선 ---·코드 펜스)이 먼저 — 아무도 안 잡을 때만 분할로 간다.
    if (tryInputRule(nabi, registry, 'enter')) return true;
    if (route({ key: 'enter' })) return true;
    if (quick) {
      const sel = nabi.getSelection();
      if (isCollapsed(sel)) {
        const vessel = vesselAt(nabi.$doc(), sel.focus, registry);
        if (vessel && canEscape(nabi.$doc(), sel.focus, vessel, nabi.$env)) {
          if (nabi.$applyRaw(escapeVesselOp(vessel), 'escapeVessel')) return true;
        }
      }
    }
    nabi.applyCommand('splitParagraph');
    return true; // 엔터는 언제나 우리 것 — 브라우저 분할은 계약이 아니다
  };

  const arrow = (dir: ArrowDir): boolean => {
    if (route({ key: 'arrow', dir })) return true;
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) return false; // 범위 걸음(Shift 등)은 브라우저의 것
    const doc = nabi.$doc();
    const env = nabi.$env;
    const holder = nodeAt(doc, sel.focus.path);
    if (!holder) return false;
    const wrapped = isWrapper(holder, env);
    const back = dir === 'left' || dir === 'up';

    // 상하는 화면 줄 걸음이라 브라우저의 것 — 래퍼문단(0/1)만 논리 걸음으로 대신한다.
    if (dir === 'up' || dir === 'down') {
      if (!wrapped) return false;
      const target = back ? stepBackward(doc, sel.focus, env) : stepForward(doc, sel.focus, env);
      if (!samePosition(target, sel.focus)) nabi.select(caretAt(target));
      return true;
    }

    // 좌우 — 문단 안 글자 걸음은 브라우저, 경계(홀더 끝·래퍼)는 트리가 걷는다 (③).
    const atEdge = back ? sel.focus.offset === 0 : sel.focus.offset === holderLength(holder, env);
    if (!wrapped && !atEdge) return false;
    const target = back ? stepBackward(doc, sel.focus, env) : stepForward(doc, sel.focus, env);
    if (!samePosition(target, sel.focus)) nabi.select(caretAt(target));
    return true; // 문서 양끝은 제자리 소비 — 캐럿이 편집기를 안 나간다
  };

  // 그릇 첫머리의 백스페이스 — **지우는 손이 아니라 겨누는 손이다.**
  //
  // 그릇(표·인용·접기·코드·목록) 안 첫 자리에서 백스페이스를 치면, 지우기 전에 **무엇이 지워질
  // 것인가**를 한 번 보여 준다: 그릇 통째가 선택된다. 한 번 더 쳐야 지워진다. 앞을 지울 것이
  // 없는 자리라 예전에는 껍데기만 조용히 벗겨졌는데, 그러면 표 하나가 순식간에 글줄 더미가 되고
  // 되돌리기 말고는 돌아올 길이 없었다.
  //
  // 겨누는 것은 그릇 자신이 아니라 **그릇을 감싼 래퍼문단**이다 — 물건 통째 선택(0~1)이 이미
  // 그 모양이고(클릭으로 그림을 고르는 그 선택), 그 범위 위의 백스페이스가 물건을 걷는다.
  const aimVessel = (): boolean => {
    const sel = nabi.getSelection();
    if (!isCollapsed(sel) || sel.focus.offset !== 0) return false;
    const doc = nabi.$doc();
    const env = nabi.$env;
    const vessel = vesselAt(doc, sel.focus, registry);
    if (!vessel) return false;

    // 그릇 안 **첫 홀더**인가 — 그 앞에는 그릇 안에 지울 것이 아무것도 없다는 뜻이다.
    // (안쪽에 또 그릇이 있으면 `vesselAt` 이 안쪽 것을 답하므로 안쪽이 먼저 겨눠진다.)
    const inside = holders([vessel.node], env);
    const first = inside[0];
    if (!first) return false;
    const firstPath = [...vessel.path, ...first.path.slice(1)];
    if (firstPath.length !== sel.focus.path.length) return false;
    if (!firstPath.every((v, i) => v === sel.focus.path[i])) return false;

    // 감싼 래퍼문단 — 그릇은 물건이라 언제나 래퍼문단 하나를 쓰고 있다.
    const wrapPath = vessel.path.slice(0, -1);
    const wrap = nodeAt(doc, wrapPath);
    if (!wrap || !isWrapper(wrap, env)) return false;
    return nabi.select({ anchor: { path: wrapPath, offset: 0 }, focus: { path: wrapPath, offset: 1 } });
  };

  return {
    enter,
    shiftEnter() {
      if (route({ key: 'enter' })) return true; // 그릇·리스트가 Shift+Enter 도 자기 규칙으로 받을 수 있다
      nabi.applyCommand('insertLine');
      return true;
    },
    tab(shift) {
      if (route({ key: shift ? 'shiftTab' : 'tab' })) return true;
      // 아무도 안 가져간 Tab = 스페이스 넷 — **다만 캐럿이 접혀 있을 때만.**
      //
      // 범위 위에서는 아무 일도 안 한다. 스페이스 넷을 넣는 것은 글자를 치는 것과 같은 일이라
      // 잡아 둔 것을 지우고 그 자리에 넣는다 — 문단 여럿을 잡고 탭을 치면 그 문단들이 통째로
      // 사라졌다. 탭은 "글자 넷" 을 뜻하는 키가 아니라 **깊이** 를 뜻하는 키이고, 그 깊이를
      // 가져갈 임자(코드·목록)가 없는 자리에서는 답이 없는 것이 맞는 답이다.
      // Shift+Tab 도 마찬가지로 아무 일 없이 삼킨다.
      if (!shift && isCollapsed(nabi.getSelection())) nabi.applyCommand('insertText', { text: '    ' });
      return true; // Tab 이 포커스를 편집기 밖으로 내보내지 않는다
    },
    backspace() {
      // **wing 이 먼저다.** 제 규칙을 가진 그릇에서는 그 규칙이 겨누기보다 앞선다 — 목록의 첫
      // 항목 첫머리에서 백스페이스는 "목록 전체를 고른다" 가 아니라 **그 항목의 표식을 벗긴다**
      // 이고, 그것이 목록에서 오래된 답이다. 겨누기가 먼저 서면 글이 든 목록이 통째로 골라져
      // 다음 한 번에 사라졌다.
      //
      // 그래서 겨누기는 **아무도 안 가져간 자리**의 답으로 남는다: 인용·접기·코드·표처럼 첫머리
      // 백스페이스에 제 규칙이 없는 그릇들이다. 목록도 제 규칙이 다 떨어지면(항목이 문단으로
      // 풀려 목록이 사라지면) 자연히 이 자리로 오지 않는다.
      if (route({ key: 'backspace' })) return true;
      // 겨누기 — 성사되면 이번 백스페이스는 선택으로 끝나고, 다음 것이 지운다.
      if (aimVessel()) return true;
      nabi.applyCommand('deleteBackward');
      return true; // 삭제 표(§2.5)는 전부 우리 규칙이다
    },
    deleteForward() {
      if (route({ key: 'delete' })) return true;
      nabi.applyCommand('deleteForward');
      return true;
    },
    arrow,
    selectAll() {
      const doc = nabi.$doc();
      const env = nabi.$env;
      const start = docStart(doc, env);
      const end = docEnd(doc, env);
      if (!start || !end) return false;
      nabi.select({ anchor: start, focus: end });
      return true;
    },
    escapeKey(key) {
      // 양수 예약이 서 있으면 Escape 는 그것부터 걷는다 — 가장 최근의 명시 상태다 (②).
      if (key === 'Escape' && nabi.$armed.peek().plus.length > 0) {
        nabi.$armed.clear();
        return true;
      }
      const sel = nabi.getSelection();
      const declared = registry.escapes.get(key);
      // 선언된 탈출 키 — 캐럿이 그 마크 안일 때만 음수 예약이 선다 (④).
      if (declared && isCollapsed(sel)) {
        const marks = marksAt(nabi.$doc(), sel.focus, nabi.$env);
        const hit = declared.filter((w) => marks.some((mark) => mark.w === w));
        if (hit.length > 0) {
          for (const w of hit) nabi.$armed.escape(w);
          return true;
        }
      }
      // 남은 것(음수 예약)도 Escape 로 걷는다 — 걷은 것이 있을 때만 소비한다.
      if (key === 'Escape' && !nabi.$armed.isEmpty()) {
        nabi.$armed.clear();
        return true;
      }
      return false;
    },
    afterSpace() {
      return tryInputRule(nabi, registry, 'space');
    },
    dropcapBelow() {
      const sel = nabi.getSelection();
      if (!isCollapsed(sel)) return null;
      const doc = nabi.$doc();
      const env = nabi.$env;
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
