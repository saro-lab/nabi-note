// 사람에게 묻는 길 — 인스턴스 옵션으로 주입한다 (old ask.ts 계약의 번역).
// editor 층은 DOM 을 모르므로 브라우저 alert/confirm 연결은 호스트·ui 몫이다.
import type { Toast } from './toast.js';

// 고르는 판의 한 자리 — 이름과 (있으면) 그림이다. 그림은 16×16 svg 의 **속**(path 몇 개)이라
// 이 층도 DOM 을 안 문다. 없는 자리는 이름만 선다.
export interface ChooseOption {
  readonly label: string;
  readonly icon?: string;
}

export interface Ask {
  // 말 하나 — 답을 안 받는다.
  message(text: string): void;
  // 예/아니오 — 동기든 비동기든 받는다.
  confirm(text: string): boolean | Promise<boolean>;
  // 여럿 중 하나 — 답은 **자리 번호**다. `-1`(과 범위 밖)은 취소이고, 그때는 아무 일도 안 난다.
  // 붙여넣기 후보가 둘 이상일 때 이 문이 열린다.
  choose?(question: string, options: readonly ChooseOption[]): number | Promise<number>;
}

// 고르는 판 하나 — ui 가 `$bindChoose` 로 거는 그릇의 모양이다.
export type Choose = NonNullable<Ask['choose']>;

// 머리 없는 환경(서버·시험)의 기본 — 물을 사람이 없다.
//
// **답은 "아니오" 다.** 아무도 답하지 않은 물음은 "예" 가 아니다 — 취소·Escape·창 닫기가 뜻하는
// 것과 같다. 이 답이 걸리는 자리는 "쓰던 글을 버리고 열까?" 같은 물음이라, 물을 사람이 없다고
// 버리는 쪽으로 가면 안 된다. 물어야 할 일이 있는 호스트는 `ask` 를 주면 된다.
export const silentAsk: Ask = {
  message() {},
  confirm() {
    return false;
  },
  // **고르는 물음의 기본은 첫째다.** confirm 과 답이 갈리는 자리다: confirm 의 "아니오" 는
  // 쓰던 글을 지키는 답이지만, 여기서 취소(-1)를 답하면 붙여넣기가 통째로 사라진다.
  // 후보 목록의 첫째는 늘 "가장 그럴듯한 해석"이라, 물을 사람이 없으면 그것이 맞는 답이다.
  choose() {
    return 0;
  },
};

// 인스턴스의 기본 Ask — `message` 가 toast(info) 로 흐른다 (084 ask ③ 확정).
//
// 말하는 길을 하나로 모으는 자리다: wing 이 어느 문으로 말하든(`$ask.message` 든 `$toast` 든)
// 그리는 길은 하나다 — core 기본 toast, 또는 호스트가 끼운 콜백. `confirm` 은 silentAsk 와
// 같은 "아니오" 다: toast 는 답을 받는 길이 아니라서 물음까지 떠맡을 수 없다.
// 머리 없는 환경에서는 toast 문이 침묵이라 silentAsk 의 뜻이 그대로 산다.
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
