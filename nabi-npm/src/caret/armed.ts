// 예약 상태 — 경계 정규화("앞 글자를 따른다")를 거스르는 유일한 문 (, ask-1 Q12).
// 스펙 4단계: ① 버튼/단축키가 예약을 만든다 ② 캐럿 이동·방향키·마우스·Del/백스페이스 = 해제
// ③ 글자 입력 = 그때 마크를 만들어 글자에 입히고 예약을 풀며 캐럿 이동 ④ escapeKeys(마크
// 벗고 쓰기)는 같은 상태의 음수 방향. 문서를 안 바꾸므로 undo 지점이 없다.
// 인스턴스 소유 — 모듈 전역이 아니라 팩토리 클로저다. 신호는 콜백 하나로 05 의 단일 신호에 합류.
import { type ElementNode } from '../schema/index.js';
import { sameMark } from '../doc/index.js';

export interface ArmedState {
  // 같은 이름·같은 값 재예약 = 해제(토글), 같은 이름·다른 값 = 교체, 새 이름 = 추가.
  arm(mark: ElementNode): void;
  // 음수 예약 — 다음 입력이 이 마크 "밖"에 선다 (링크 끝 탈출 류).
  escape(w: string): void;
  // 이동·삭제류 몸짓 — 예약 전부 해제.
  clear(): void;
  // 입력 순간 — 기본 마크 더미(경계 정규화의 답)에 예약을 적용한 최종 더미를 내주고, 예약을 푼다.
  takeForInsert(base: readonly ElementNode[]): readonly ElementNode[];
  // 눌림 표시용 — 이 이름이 양수 예약돼 있나 / 예약이 하나라도 있나.
  isArmed(w: string): boolean;
  isEmpty(): boolean;
  // 지금 상태 훔쳐보기 (시험·툴바) — 복사본이다.
  peek(): { readonly plus: readonly ElementNode[]; readonly minus: readonly string[] };
}

export function makeArmed(onChange?: () => void): ArmedState {
  let plus: ElementNode[] = [];
  let minus: string[] = [];

  const notify = (): void => {
    onChange?.();
  };

  return {
    arm(mark) {
      const at = plus.findIndex((m) => m.w === mark.w);
      if (at >= 0 && sameMark(plus[at] as ElementNode, mark)) {
        plus = plus.filter((_, i) => i !== at); // 같은 값 재예약 = 해제
      } else if (at >= 0) {
        plus = plus.map((m, i) => (i === at ? mark : m)); // 다른 값 = 교체
      } else {
        plus = [...plus, mark];
      }
      minus = minus.filter((w) => w !== mark.w); // 양수 예약은 같은 이름의 음수를 지운다
      notify();
    },
    escape(w) {
      if (!minus.includes(w)) minus = [...minus, w];
      plus = plus.filter((m) => m.w !== w);
      notify();
    },
    clear() {
      if (plus.length === 0 && minus.length === 0) return;
      plus = [];
      minus = [];
      notify();
    },
    takeForInsert(base) {
      const stripped = base.filter((m) => !minus.includes(m.w));
      const replaced = stripped.filter((m) => !plus.some((armed) => armed.w === m.w));
      const result = [...replaced, ...plus];
      if (plus.length > 0 || minus.length > 0) {
        plus = [];
        minus = [];
        notify();
      }
      return result;
    },
    isArmed(w) {
      return plus.some((m) => m.w === w);
    },
    isEmpty() {
      return plus.length === 0 && minus.length === 0;
    },
    peek() {
      return { plus: [...plus], minus: [...minus] };
    },
  };
}
