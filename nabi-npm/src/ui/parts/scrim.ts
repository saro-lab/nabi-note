// 덮개(scrim) — **하나**다. 미리보기·라이트박스·(호스트의) 패널이 전부 이 위에 선다.
// 덮개가 드는 책임 셋이 옛 판에서는 세 파일에 흩어져 있었다:
//   Escape 로 닫기· 덮개 자신을 누르면 닫기· 닫을 때 **포커스를 원래 자리로 돌려주기**
//
// 포커스 복원은 `focusQuiet` 한 길이다 — 화면을 던지지 않는다 (040 §6.1).
import { focusQuiet, make } from './dom.js';
import { closeOnOutside } from './outside.js';

export interface ScrimOptions {
  // 덮개 위에 올릴 알맹이 — 이 요소 밖을 누르면 닫힌다.
  readonly card: HTMLElement;
  // 닫힌 뒤 포커스가 돌아갈 자리.
  readonly restore?: HTMLElement | null;
  readonly onClose?: () => void;
  readonly className?: string;
}

export interface Scrim {
  readonly root: HTMLElement;
  close(): void;
}

export function openScrim(owner: Document, options: ScrimOptions): Scrim {
  const root = make(owner, 'div', options.className ? `nabi-scrim ${options.className}` : 'nabi-scrim');
  root.append(options.card);

  let closed = false;
  const close = (): void => {
    // 두 번 닫아도 한 번만 닫힌다 — 덮개 클릭과 Escape 가 같은 순간에 오는 일이 있다.
    if (closed) return;
    closed = true;
    stopOutside();
    owner.removeEventListener('keydown', onKey, true);
    root.remove();
    focusQuiet(options.restore ?? null);
    options.onClose?.();
  };

  const onKey = (event: Event): void => {
    if ((event as KeyboardEvent).key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close();
  };

  owner.addEventListener('keydown', onKey, true);
  const stopOutside = closeOnOutside(owner, () => [options.card], () => {
    // 덮개 자신 안에서 난 바깥 클릭만 닫는다 — 페이지의 다른 곳은 이미 덮개가 가리고 있다.
    close();
  });

  owner.body.append(root);
  // 알맹이가 키를 받아야 Escape 가 여기까지 온다 — 갓 열린 판은 포커스를 받아도 좋다.
  options.card.tabIndex = -1;
  options.card.focus({ preventScroll: true });
  return { root, close };
}
