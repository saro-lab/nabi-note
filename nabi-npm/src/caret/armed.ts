// 예약 상태 — 인스턴스마다 독립된 클로저이며, 문서를 안 바꾸므로 undo 지점이 없다.
// Armed state; each instance owns its own closure and never mutates the doc, so it has no undo point.
import { type ElementNode } from '../schema/index.js';
import { sameMark } from '../doc/index.js';

export interface ArmedState {
  // 같은 이름·같은 값 재예약 = 해제(토글), 같은 이름·다른 값 = 교체, 새 이름 = 추가.
  // Re-arming the same name+value toggles it off; same name+different value replaces it; a new name adds.
  arm(mark: ElementNode): void;
  // 음수 예약 — 다음 입력이 이 마크 "밖"에 선다 (링크 끝 탈출 류).
  // A negative reservation; the next input lands outside this mark (e.g. escaping past a link's end).
  escape(w: string): void;
  clear(): void;
  // 입력 순간 — 기본 마크 더미에 예약을 적용한 최종 더미를 내주고, 예약을 푼다.
  // At insert time, applies the reservations onto the base marks and clears them.
  takeForInsert(base: readonly ElementNode[]): readonly ElementNode[];
  isArmed(w: string): boolean;
  isEmpty(): boolean;
  // 복사본을 내준다 — 시험·툴바가 안전하게 들여다보는 자리.
  // Returns a copy, so tests and the toolbar can peek without risk of mutation.
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
        plus = plus.filter((_, i) => i !== at);
      } else if (at >= 0) {
        plus = plus.map((m, i) => (i === at ? mark : m));
      } else {
        plus = [...plus, mark];
      }
      minus = minus.filter((w) => w !== mark.w);
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
