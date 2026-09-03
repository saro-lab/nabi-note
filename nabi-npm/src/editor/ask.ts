// 사람에게 묻는 길 — 인스턴스 옵션으로 주입한다. editor 층은 DOM 을 모르므로 브라우저 alert/confirm 연결은 호스트·ui 몫이다.
// A way to ask the person, injected via instance options; the editor layer knows no DOM, so wiring real alert/confirm is the host's or ui's job.
import type { Toast } from './toast.js';

// 고르는 판의 한 자리 — 이름과 (있으면) 그림이다. 그림은 16×16 svg 의 속(path 몇 개)이라 이 층도 DOM 을 안 문다.
// One entry in a choose panel: a label and an optional icon, the icon being just the inner paths of a 16x16 svg so this layer still touches no DOM.
export interface ChooseOption {
  readonly label: string;
  readonly icon?: string;
}

export interface Ask {
  message(text: string): void;
  confirm(text: string): boolean | Promise<boolean>;
  // 여럿 중 하나 — 답은 자리 번호다. -1(과 범위 밖)은 취소이고, 그때는 아무 일도 안 난다.
  // A choice among several; the answer is an index. -1 (or out of range) means cancel, and nothing happens.
  choose?(question: string, options: readonly ChooseOption[]): number | Promise<number>;
}

export type Choose = NonNullable<Ask['choose']>;

// 머리 없는 환경(서버·시험)의 기본 — 물을 사람이 없으면 답은 "아니오"다(취소·Escape와 같은 뜻). 물어야 할 일이 있는 호스트는 ask를 주면 된다.
// The default for headless environments (server, tests): with no one to ask, the answer is "no" (same as cancel/Escape); a host that needs real answers supplies its own ask.
export const silentAsk: Ask = {
  message() {},
  confirm() {
    return false;
  },
  // 고르는 물음의 기본은 첫째다 — confirm과 다르다: 여기서 취소(-1)를 답하면 붙여넣기가 통째로 사라지므로, 목록의 첫째("가장 그럴듯한 해석")를 답으로 삼는다.
  // A choose question defaults to the first option, unlike confirm — answering cancel (-1) here would drop the whole paste, so the list's first entry (the "most likely" reading) is used instead.
  choose() {
    return 0;
  },
};

// 인스턴스의 기본 Ask — message가 toast(info)로 흐른다. wing이 어느 문으로 말하든 그리는 길은 하나다.
// The instance's default Ask: message flows to toast(info), giving wings one rendering path no matter which door they speak through.
export function toastAsk(toast: Toast): Ask {
  return {
    message(text) {
      toast('info', text);
    },
    confirm() {
      return false;
    },
  };
}
