// 덮개(scrim) — **하나**다. 미리보기·라이트박스·(호스트의) 패널이 전부 이 위에 선다.
// 덮개가 드는 책임 셋이 옛 판에서는 세 파일에 흩어져 있었다:
//   Escape 로 닫기· 덮개 자신을 누르면 닫기· 닫을 때 **포커스를 원래 자리로 돌려주기**
//
// 포커스 복원은 `focusQuiet` 한 길이다 — 화면을 던지지 않는다 (040 §6.1).
import { focusQuiet, make } from './dom.js';
import { inertDocumentBackground, pushDocumentLayer, topLayerFocus, type DocumentLayer } from '../../layer.js';

export interface ScrimOptions {
  // 덮개 위에 올릴 알맹이 — 이 요소 밖을 누르면 닫힌다.
  readonly card: HTMLElement;
  // 닫힌 뒤 포커스가 돌아갈 자리.
  readonly restore?: HTMLElement | null;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly initialFocus?: boolean;
}

export interface Scrim {
  readonly root: HTMLElement;
  close(): void;
}

function focusables(card: HTMLElement): HTMLElement[] {
  if (typeof card.querySelectorAll !== 'function') return [];
  return [
    ...card.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.isConnected && !element.hasAttribute('hidden'));
}

export function openScrim(owner: Document, options: ScrimOptions): Scrim {
  const previousParent = options.card.parentNode;
  const previousNext = options.card.nextSibling;
  const before = ['role', 'aria-modal', 'tabindex'].map((name) => [name, options.card.getAttribute(name)] as const);
  const injected = new Map<string, string>();
  const root = make(owner, 'div', options.className ? `nabi-scrim ${options.className}` : 'nabi-scrim');
  const has = (name: string): boolean =>
    typeof options.card.hasAttribute === 'function'
      ? options.card.hasAttribute(name)
      : options.card.getAttribute(name) !== null;
  if (!has('role')) {
    options.card.setAttribute('role', 'dialog');
    injected.set('role', 'dialog');
  }
  if (!has('aria-modal')) {
    options.card.setAttribute('aria-modal', 'true');
    injected.set('aria-modal', 'true');
  }
  if (!has('tabindex')) {
    options.card.tabIndex = -1;
    injected.set('tabindex', '-1');
  }
  root.append(options.card);

  let closed = false;
  let layer: DocumentLayer | null = null;
  let releaseInert: (() => void) | null = null;
  const top = (): boolean => layer?.isTop() === true;
  const close = (): void => {
    // 두 번 닫아도 한 번만 닫힌다 — 덮개 클릭과 Escape 가 같은 순간에 오는 일이 있다.
    if (closed) return;
    closed = true;
    try {
      owner.removeEventListener('keydown', onKey, true);
    } catch {}
    try {
      owner.removeEventListener('pointerdown', onDown, true);
    } catch {}
    try {
      releaseInert?.();
    } catch {}
    releaseInert = null;
    try {
      layer?.release();
    } catch {}
    layer = null;
    try {
      root.remove();
    } catch {}
    for (const [name, value] of injected) {
      try {
        if (options.card.getAttribute(name) === value) options.card.removeAttribute(name);
      } catch {}
    }
    const topFocus = topLayerFocus(owner);
    const restore = options.restore?.isConnected ? options.restore : null;
    const target = restore && (!topFocus || topFocus.contains(restore)) ? restore : (topFocus ?? restore);
    try {
      focusQuiet(target);
    } finally {
      options.onClose?.();
    }
  };

  const onKey = (event: Event): void => {
    if (!top()) return;
    const key = event as KeyboardEvent;
    if (key.key === 'Escape') {
      key.preventDefault();
      key.stopPropagation();
      close();
      return;
    }
    if (key.key !== 'Tab') return;
    if (event.target === null || event.target === undefined) return;
    const items = focusables(options.card);
    if (items.length === 0) {
      key.preventDefault();
      options.card.focus({ preventScroll: true });
      return;
    }
    const first = items[0] as HTMLElement;
    const last = items.at(-1) as HTMLElement;
    const active = owner.activeElement as HTMLElement | null;
    if (
      key.shiftKey
        ? active === first || !options.card.contains(active)
        : active === last || !options.card.contains(active)
    ) {
      key.preventDefault();
      (key.shiftKey ? last : first).focus({ preventScroll: true });
    }
  };

  const onDown = (event: Event): void => {
    if (!top()) return;
    const target = event.target;
    if (target && options.card.contains(target as Node)) return;
    close();
  };

  try {
    owner.addEventListener('keydown', onKey, true);
    owner.addEventListener('pointerdown', onDown, true);
    owner.body.append(root);
    const scrim = { root, close };
    layer = pushDocumentLayer(owner, options.card);
    releaseInert = inertDocumentBackground(owner, root);
    if (options.initialFocus !== false) (focusables(options.card)[0] ?? options.card).focus({ preventScroll: true });
    return scrim;
  } catch (error) {
    try {
      owner.removeEventListener('keydown', onKey, true);
    } catch {}
    try {
      owner.removeEventListener('pointerdown', onDown, true);
    } catch {}
    try {
      releaseInert?.();
    } catch {}
    try {
      layer?.release();
    } catch {}
    root.remove();
    options.card.remove();
    if (previousParent) previousParent.insertBefore(options.card, previousNext);
    for (const [name, value] of before) {
      if (value === null) options.card.removeAttribute(name);
      else options.card.setAttribute(name, value);
    }
    throw error;
  }
}
