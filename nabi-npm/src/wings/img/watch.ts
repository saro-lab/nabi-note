// 이미지의 표면 부속 — **선언형이다**: 리스너를 직접 달지 않고 `attach` 로 선언하면
// surface 의 mount 가 붙이고 unmount 가 뗀다. 여기서 DOM 어휘(`document`·`window`)를 직접
// 부르지 않는 것도 그 때문이다 — 손잡이는 언제나 넘겨받은 `root` 에서 뻗는다.
//
// 깨진 그림 표식: 죽은 주소·만료된 서명 주소·사라진 `blob:` 을 화면에서만 알린다.
// **`src` 는 절대 안 건드린다** — 표식 속성만 달고 그림은 시트가 그린다. `load` 가 표식을 떼
// 주므로 되살아난 주소는 저절로 복구된다. 저장값에는 이 표식이 절대 없다.
import type { Attach } from '../../wing/index.js';

export const BROKEN_ATTR = 'data-nabi-broken';

export const imageAttach: Attach = ({ root }) => {
  // `error` 는 버블링하지 않지만 캡처는 내려간다 — 루트에서 들을 수 있는 유일한 길이다.
  const sync = (event: Event): void => {
    const target = event.target as Element | null;
    if (!target || target.tagName !== 'IMG') return;
    if (event.type === 'error') target.setAttribute(BROKEN_ATTR, '');
    else target.removeAttribute(BROKEN_ATTR);
  };
  root.addEventListener('error', sync, true);
  root.addEventListener('load', sync, true);

  // 라이트박스(그림 하나만 크게 보기)의 자리 — 상자를 그리는 것은 ui(12)의 몫이라 여기서는
  // 열 것이 없다. 12 가 서면 이 부속이 클릭을 받아 ui 의 상자를 부르는 한 줄이 선다.

  return () => {
    root.removeEventListener('error', sync, true);
    root.removeEventListener('load', sync, true);
  };
};
