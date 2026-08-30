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
import { hostOf, type Nabi } from '../editor/index.js';
import { routeKey, type KeyIntent, type Registry } from '../wing/index.js';
import { tryInputRule } from './autoformat.js';
import { canEscape, escapeVesselOp, vesselAt } from './vessel.js';

export type ArrowDir = 'left' | 'right' | 'up' | 'down';

// 연타 창(ms) — **이 집의 연타는 전부 이 하나를 본다.** 두 번째 두드림까지 참아 주는 시간이고,
// 그릇 탈출의 빠른 이중 엔터·서식 지우기의 Esc 두 번·힌트의 Shift 두 번(`ui/hints.ts`)이
// 같은 몸짓이라 값이 갈리면 손이 셋을 따로 익혀야 한다. 밖에서 바꾸는 문은 각자 남는다.
export const TAP_MS = 350;

export interface SurfaceActionsOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 그릇 탈출의 "빠른 이중 엔터" 창(ms) — 조정 가능한 상수. Esc 연타도 이 값을 나눠 쓴다.
  readonly doubleEnterMs?: number;
  readonly now?: () => number;
  // **일반 편집 상태인가** — 위에 뜬 것(덮개·판·전체화면·힌트 배지)이 하나도 없는 자리다.
  // 연타 몸짓은 여기서만 산다: 전체화면의 Esc 귀(`ui/overlay.ts`)는 아무것도 안 막아서
  // 게이트가 없으면 Esc 두 번이 "전체화면 나가기 + 서식 지우기" 를 한 몸짓에 낸다.
  // 답은 DOM 을 보는 mount 가 든다 — 안 주면 늘 참이다(그물·헤드리스 호스트).
  // 업로드 잠금은 여기서 안 묻는다: 인스턴스의 `$lock` 이 이미 답을 들고 있다.
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
  // escapeKeys(예약 음수 방향)와 Escape(예약 해제)를 가른다 — true 면 키를 소비한다.
  // `repeat` 는 눌러 두어서 온 반복 이벤트 — 누르고 있는 것은 연타가 아니다.
  escapeKey(key: string, repeat?: boolean): boolean;
  // 연타 셈을 끊는다 — 조합(IME) 중의 키처럼 "연타가 아닌 것"이 지날 때 mount 가 부른다.
  breakDouble(): void;
  // 스페이스 직후의 오토포맷 — 되맞추기(reconcile)가 스페이스를 트리에 넣은 뒤 부른다.
  afterSpace(): boolean;
  // 다음 홀더가 드롭캡이면 그 첫 자리 — ArrowDown 개입은 mount 가 화면 줄로 판단해 쓴다.
  dropcapBelow(): Position | null;
}

export function makeSurfaceActions(options: SurfaceActionsOptions): SurfaceActions {
  const { nabi, registry } = options;
  const doubleMs = options.doubleEnterMs ?? TAP_MS;
  const now = options.now ?? (() => Date.now());
  let lastEnterAt = 0;
  let lastEscapeAt = 0;
  let escapeTaps = 0;

  // 연타를 받아도 되는 자리인가 — 위에 뜬 것도 없고 문서가 잠기지도 않았다.
  const plain = (): boolean => hostOf(nabi).lockedBy() === null && (options.plain?.() ?? true);

  // 소유자 wing 에게 묻는다 — null 이면 pass. 답한 결과가 무변화면 문의 침묵으로 false 가
  // 되어 코어 규칙으로 떨어진다(wing 은 "내 일 아님"을 null 로만 말한다는 계약의 다른 반쪽).
  // 임자에게 물어본다 — **답했으면 그 키는 그의 것이다.**
  //
  // 문서가 바뀌었는지로 판단하지 않는다(계약: "null = pass … 트리 동일성으로 짐작하지 않는다").
  // 문이 침묵으로 false 를 답하는 자리가 있어서, 그것을 그대로 돌려주면 **아무 일도 안 하기로
  // 한 답**이 "임자가 없다" 로 읽혔다 — 목록 첫 항목의 탭이 그래서 코어의 스페이스 넷까지
  // 흘러갔다. 임자가 `null` 이 아닌 것을 답했으면 거기서 끝이다.
  const route = (intent: KeyIntent): boolean => {
    const outcome = routeKey(intent, hostOf(nabi).doc(), nabi.getSelection(), hostOf(nabi).env, registry);
    if (outcome === null) return false;
    hostOf(nabi).applyRaw(() => outcome, `key:${intent.key}`);
    return true;
  };

  const enter = (): boolean => {
    const t = now();
    const quick = t - lastEnterAt <= doubleMs;
    // 엔터 트리거 오토포맷(구분선 ---·코드 펜스)이 먼저 — 아무도 안 잡을 때만 분할로 간다.
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
    return true; // 엔터는 언제나 우리 것 — 브라우저 분할은 계약이 아니다
  };

  const arrow = (dir: ArrowDir): boolean => {
    lastEnterAt = 0;
    if (route({ key: 'arrow', dir })) return true;
    const sel = nabi.getSelection();
    if (!isCollapsed(sel)) return false; // 범위 걸음(Shift 등)은 브라우저의 것
    const doc = hostOf(nabi).doc();
    const env = hostOf(nabi).env;
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
    const doc = hostOf(nabi).doc();
    const env = hostOf(nabi).env;
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
      lastEnterAt = 0;
      if (route({ key: 'enter' })) return true; // 그릇·리스트가 Shift+Enter 도 자기 규칙으로 받을 수 있다
      nabi.applyCommand('insertLine');
      return true;
    },
    tab(shift) {
      lastEnterAt = 0;
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
      lastEnterAt = 0;
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
      // --- 연타 셈 (맨 앞에 선다 — **앞 갈래의 소비와 무관하게 센다**) ------------------------
      //
      // 세는 것은 이 키 자신뿐이다: 사이에 다른 키가 오면 끊기고(글자를 치는 손은 연타가 아니다),
      // 누르고 있어 오는 반복도 안 세고, 위에 뭔가 떠 있는 동안(plain 이 거짓)도 안 센다.
      // 마지막 것이 전체화면의 문이다 — 첫 Esc 가 전체화면을 나가고 둘째가 발동하는 길을 막는다.
      //
      // **아래 갈래 셋이 이 Esc 를 가져가도 두드림으로는 센다.** 안 그러면 마크 안에서 연타가
      // 영영 안 선다 — 형광펜 위의 캐럿은 Esc 마다 "마크 탈출"(갈래 ②·③)이 먼저 먹으므로,
      // 소비를 셈의 끝으로 읽으면 셈이 늘 1 에 머문다. 그래서 형광펜 위의 Esc 두 번은
      // 첫 번에 탈출 예약, 둘째에 서식 지우기로 **이어진다**.
      //
      // 두드림을 **세는** 것이 힌트(`ui/hints.ts`)와 같은 모양인 까닭: 발동은 딱 두 번째뿐이라,
      // 셋째·넷째는 이어진 채로 흘러간다. Esc 를 네 번 치면 두 번이 아니라 **한 번** 난다.
      const counts = registry.doubles.has(key) && repeat !== true && plain();
      const t = now();
      escapeTaps = counts ? (t - lastEscapeAt <= doubleMs ? escapeTaps + 1 : 1) : 0;
      lastEscapeAt = counts ? t : 0;
      const quick = escapeTaps === 2;

      // 갈래 셋 — 예약 걷기·마크 탈출. 몸은 그대로고, 답하는 것은 **키를 삼켰는가** 하나다.
      const escapeStages = (): boolean => {
        // 양수 예약이 서 있으면 Escape 는 그것부터 걷는다 — 가장 최근의 명시 상태다 (②).
        if (key === 'Escape' && hostOf(nabi).armed.peek().plus.length > 0) {
          hostOf(nabi).armed.clear();
          return true;
        }
        const sel = nabi.getSelection();
        const declared = registry.escapes.get(key);
        // 선언된 탈출 키 — 캐럿이 그 마크 안일 때만 음수 예약이 선다 (④).
        if (declared && isCollapsed(sel)) {
          const marks = marksAt(hostOf(nabi).doc(), sel.focus, hostOf(nabi).env);
          const hit = declared.filter((w) => marks.some((mark) => mark.w === w));
          if (hit.length > 0) {
            for (const w of hit) hostOf(nabi).armed.escape(w);
            return true;
          }
        }
        // 남은 것(음수 예약)도 Escape 로 걷는다 — 걷은 것이 있을 때만 소비한다.
        if (key === 'Escape' && !hostOf(nabi).armed.isEmpty()) {
          hostOf(nabi).armed.clear();
          return true;
        }
        return false;
      };
      const consumed = escapeStages();

      // 연타 — 선언한 wing 이 있을 때만 돈다. 표면은 wing 이름을 모르고 모아진 표만 본다.
      // **선택이 있든 접힌 캐럿이든 부른다**: 무엇을 지울지는 커맨드가 이미 안다(범위면 한 번에,
      // 캐럿이면 안쪽 마크부터 한 켜씩, 벗길 마크가 없으면 문단 속성). 단추와 같은 일이다.
      // 커맨드가 침묵하면(지울 것이 없으면) 키도 안 삼킨다 — 앞 갈래가 가져간 것만 남는다.
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
