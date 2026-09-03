// diff wing 의 배선 — 대조 스냅샷 + 전체화면 판.
// Wiring for the diff wing: the compare snapshot plus the fullscreen pane.
// 대조 상태는 문서를 실은 순간(setJson·setHtml)마다 갈린다 — 타자·붙여넣기·undo 는 안 건드려, 판은 "실은 뒤 무엇이 달라졌나"만 답한다.
// The compare snapshot resets only when a doc is loaded (setJson/setHtml); typing, paste, and undo leave it alone, so the pane always answers "what changed since load."
import type { Nabi } from '../editor/index.js';
import type { Registry } from '../wing/index.js';
import { localeDirection, translate } from '../locale/index.js';
import { inertDocumentBackground, pushDocumentLayer, topLayerFocus, type DocumentLayer } from '../layer.js';
import { mountDiff, diffButton, type DiffMount } from './mount.js';
import { ensureCss } from './styles.js';

export interface DiffWingMountOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  // 판이 닫힌 뒤 포커스가 돌아갈 편집 표면.
  readonly surface: HTMLElement;
  readonly allowLocalUrls?: boolean;
  readonly locale?: string;
}

export interface DiffWingMount {
  open(): void;
  close(): void;
  // 지금 대조 상태 — 마지막으로 실은 문서의 JSON 이다.
  baseline(): unknown;
  unmount(): void;
}

export function mountDiffWing(options: DiffWingMountOptions): DiffWingMount {
  const nabi = options.nabi;
  const registry = options.registry;
  const surface = options.surface;
  const locale = options.locale;
  const allowLocalUrls = options.allowLocalUrls;
  const doc = surface.ownerDocument;
  const t = (key: string): string => translate(key, locale ?? 'en');
  const releaseCss = ensureCss(doc);

  let base: unknown = nabi.getJson();
  const offChange = nabi.onChange((change) => {
    if (change.loaded) base = nabi.getJson();
  });

  let screen: HTMLElement | null = null;
  let inner: DiffMount | null = null;
  let layer: DocumentLayer | null = null;
  let releaseInert: (() => void) | null = null;
  let priorFocus: HTMLElement | null = null;
  let closeButton: HTMLButtonElement | null = null;
  let offCloseButton: (() => void) | null = null;
  let disposed = false;

  const onKey = (event: Event): void => {
    if (!layer?.isTop()) return;
    const key = event as KeyboardEvent;
    if (key.key === 'Escape') {
      key.preventDefault();
      key.stopPropagation();
      close();
      return;
    }
    if (key.key !== 'Tab' || !screen) return;
    const focusable = [
      ...screen.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ];
    if (focusable.length === 0) {
      key.preventDefault();
      screen.focus({ preventScroll: true });
      return;
    }
    const first = focusable[0] as HTMLElement;
    const last = focusable.at(-1) as HTMLElement;
    const active = doc.activeElement as HTMLElement | null;
    if (key.shiftKey ? active === first || !screen.contains(active) : active === last || !screen.contains(active)) {
      key.preventDefault();
      (key.shiftKey ? last : first).focus({ preventScroll: true });
    }
  };

  const close = (): void => {
    if (!screen) return;
    const closing = screen;
    let failure: unknown = null;
    try {
      offCloseButton?.();
    } catch (error) {
      failure ??= error;
    }
    offCloseButton = null;
    closeButton = null;
    try {
      doc.removeEventListener('keydown', onKey, true);
    } catch (error) {
      failure ??= error;
    }
    try {
      layer?.release();
    } catch (error) {
      failure ??= error;
    }
    layer = null;
    try {
      releaseInert?.();
    } catch (error) {
      failure ??= error;
    }
    releaseInert = null;
    try {
      inner?.unmount();
    } catch (error) {
      failure ??= error;
    }
    inner = null;
    try {
      closing.remove();
    } catch (error) {
      failure ??= error;
    }
    screen = null;
    const topFocus = topLayerFocus(doc);
    const prior = priorFocus?.isConnected ? priorFocus : null;
    const restore =
      prior && (!topFocus || topFocus.contains(prior))
        ? prior
        : (topFocus ?? prior ?? (surface.isConnected ? surface : null));
    priorFocus = null;
    try {
      restore?.focus({ preventScroll: true });
    } catch (error) {
      failure ??= error;
    }
    if (failure) throw failure;
  };

  const open = (): void => {
    if (disposed) return;
    // 이미 떠 있으면 그 자리에서 지금 상태로 다시 그린다 — 판이 둘로 겹치지 않는다.
    if (screen) {
      inner?.update(base, nabi.getJson());
      return;
    }
    const active = doc.activeElement;
    priorFocus = active && typeof (active as Node).nodeType === 'number' ? (active as HTMLElement) : null;
    screen = doc.createElement('div');
    screen.className = 'nabi-diff-screen';
    screen.setAttribute('role', 'dialog');
    screen.setAttribute('aria-modal', 'true');
    screen.setAttribute('aria-label', t('diff.region'));
    const inherited = doc.defaultView?.getComputedStyle(surface).direction;
    screen.setAttribute('dir', locale === undefined ? (inherited === 'rtl' ? 'rtl' : 'ltr') : localeDirection(locale));
    screen.tabIndex = -1;
    const host = doc.createElement('div');
    host.className = 'nabi-diff-screen-host';
    screen.append(host);
    doc.body.append(screen);
    const opening = screen;
    try {
      const mounted = mountDiff({
        root: host,
        before: base,
        after: nabi.getJson(),
        registry,
        ...(allowLocalUrls ? { allowLocalUrls: true } : {}),
        ...(locale ? { locale } : {}),
      });
      if (screen !== opening || disposed) {
        mounted.unmount();
        return;
      }
      inner = mounted;
      // 닫기(X)는 제 줄을 안 만들고 diff 줄의 오른쪽 끝에 얹는다 — 줄은 방금 mountDiff 가 세웠으니 반드시 있다.
      // The close (X) doesn't get its own row; it's appended to the diff toolbar's right end, which mountDiff just built so it's guaranteed to exist.
      closeButton = diffButton(doc, t('close'), 'M4.5 4.5l7 7M11.5 4.5l-7 7');
      const onCloseButton = (): void => {
        if (screen === opening) close();
      };
      closeButton.addEventListener('click', onCloseButton);
      offCloseButton = () => closeButton?.removeEventListener('click', onCloseButton);
      host.querySelector('.nabi-diff-bar')?.append(closeButton);
      layer = pushDocumentLayer(doc, screen);
      releaseInert = inertDocumentBackground(doc, screen);
      doc.addEventListener('keydown', onKey, true);
      closeButton.focus({ preventScroll: true });
    } catch (error) {
      try {
        offCloseButton?.();
      } catch {}
      offCloseButton = null;
      closeButton = null;
      try {
        doc.removeEventListener('keydown', onKey, true);
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
        inner?.unmount();
      } catch {}
      inner = null;
      try {
        screen?.remove();
      } catch {}
      screen = null;
      priorFocus = null;
      throw error;
    }
  };

  return {
    open,
    close,
    baseline: () => base,
    unmount() {
      if (disposed) return;
      disposed = true;
      close();
      offChange();
      releaseCss();
    },
  };
}
