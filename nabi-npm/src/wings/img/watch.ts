// 이미지의 표면 부속 — 선언형이라 mount/unmount가 붙이고 뗀다. DOM 어휘는 언제나 넘겨받은 `root`에서 뻗는다.
// The image surface attach — declarative, so mount/unmount handle wiring; all DOM access goes through the given `root`.
//
// 깨진 그림 표식은 화면에서만 안다 — `src`는 안 건드리고, `load`가 표식을 떼 저절로 복구된다.
// A broken-image flag is screen-only — `src` is never touched, and a later `load` clears the flag on its own.
import type { Attach } from '../../wing/index.js';

export const BROKEN_ATTR = 'data-nabi-broken';

export const imageAttach: Attach = ({ root }) => {
  // `error`는 버블링하지 않지만 캡처는 내려간다 — 루트에서 들을 수 있는 유일한 길이다.
  // `error` doesn't bubble, but capture still descends — the only way to catch it from the root.
  const sync = (event: Event): void => {
    const target = event.target as Element | null;
    if (!target || target.tagName !== 'IMG') return;
    if (event.type === 'error') target.setAttribute(BROKEN_ATTR, '');
    else target.removeAttribute(BROKEN_ATTR);
  };
  root.addEventListener('error', sync, true);
  root.addEventListener('load', sync, true);

  return () => {
    root.removeEventListener('error', sync, true);
    root.removeEventListener('load', sync, true);
  };
};
