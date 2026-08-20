// 사람에게 묻는 길 — 인스턴스 옵션으로 주입한다 (old ask.ts 계약의 번역).
// editor 층은 DOM 을 모르므로 브라우저 alert/confirm 연결은 호스트·ui 몫이다.
import type { Toast } from './toast.js';

export interface Ask {
  // 말 하나 — 답을 안 받는다.
  message(text: string): void;
  // 예/아니오 — 동기든 비동기든 받는다.
  confirm(text: string): boolean | Promise<boolean>;
}

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
