import { Translations } from './parts/translation.js';
import type { LocaleInput } from '../locale/index.js';
// 미리보기·전체화면·라이트박스는 모두 scrim 부품 위에 선다(전체화면만 클래스일 뿐 덮개가 아니다). 미리보기는 renderHtml + nabi.css 그대로라, 보는 사람이 볼 것과 글자 하나까지 같아야 한다.
// Preview, fullscreen, and lightbox all sit on the scrim part (fullscreen alone is just a class, not an overlay). Preview renders raw renderHtml output styled by nabi.css, so it must match the real output byte for byte.
import { hostOf, type Nabi } from '../editor/index.js';
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { make } from './parts/dom.js';
import { iconHtml } from '../style/icon.js';
import { renderViewToolsHtml, type ViewToolsVisibility } from '../wing/toolbar-html.js';
import { setPressed, wireIconButton } from './parts/button.js';
import { openScrim, type Scrim } from './parts/scrim.js';
import { acquireGestureRoot, HostElementBaseline, HostElementLease, ownsGestureRoot } from '../lifecycle.js';

export const FULLSCREEN_CLASS = 'is-fullscreen';

// 아이콘 셋과 뷰 도구의 글자는 wing/toolbar-html.ts가 든다 — 서버도 같은 줄을 그려야 하고, ssr 엔트리는 ui를 안 딛기 때문이다. 부르던 자리를 위해 다시 내보낸다.
// The icon set and view-tool copy live in wing/toolbar-html.ts — the server must render the same row, and the ssr entry never imports ui. Re-exported here for existing callers.
export { FULLSCREEN_ENTER_ICON, FULLSCREEN_EXIT_ICON, PREVIEW_ICON } from '../wing/toolbar-html.js';

// --- 전체화면 ---------------------------------------------------------------------------------
// Fullscreen API가 아니라 클래스 하나다 — iframe 안이나 API가 막힌 자리에서도 산다. 크롬과 편집기가 함께 커져야 한다.
// Just a class, not the Fullscreen API — works inside an iframe or wherever the API is blocked. The chrome and editor must grow together.

export function isFullscreen(root: HTMLElement): boolean {
  return root.classList.contains(FULLSCREEN_CLASS);
}

export function setFullscreen(root: HTMLElement, on: boolean): void {
  root.classList.toggle(FULLSCREEN_CLASS, on);
}

// --- 미리보기 ---------------------------------------------------------------------------------

export interface PreviewOptions {
  readonly nabi: Nabi;
  // 폭을 재는 자리 — 미리보기가 편집기와 같은 너비로 서야 줄바꿈이 같다.
  // Where the width is measured — the preview must match the editor's width for line wrapping to agree.
  readonly surface: HTMLElement;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
  // 코어가 직접 걸 수 없다 — viewer는 ui보다 위층이라 여기서 부르면 층이 뒤집힌다. 이 훅으로 층은 그대로 두고 문만 연다(표 정렬 등 보는 쪽 런타임이 이걸로 걸린다).
  // The core can't wire this directly — viewer sits above ui, and calling it here would invert the layers. This hook opens a door without breaking that order (e.g. table sorting hooks in through it).
  readonly onBody?: (body: HTMLElement) => (() => void) | void;
}

export interface Overlay {
  readonly card: HTMLElement;
  close(): void;
}

export function openPreview(options: PreviewOptions): Overlay {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const copy = new Translations(t);
  const direction =
    options.locale !== undefined || options.translator !== undefined
      ? localeDirection(t.locale)
      : owner.defaultView?.getComputedStyle(options.surface).direction === 'rtl'
        ? 'rtl'
        : 'ltr';

  const card = make(owner, 'div', 'nabi-card nabi-preview');
  if (!card.hasAttribute('aria-label') && !card.hasAttribute('aria-labelledby'))
    card.setAttribute('aria-label', t.t('preview'));
  if (!card.hasAttribute('dir')) card.setAttribute('dir', direction);
  card.style.setProperty('--nabi-preview-width', `${Math.round(options.surface.getBoundingClientRect().width)}px`);

  const close = make(owner, 'button', 'nabi-close', { type: 'button', 'aria-label': t.t('close') });
  close.innerHTML = iconHtml('panel-preview-close', 'close');

  const body = make(owner, 'div', 'nabi-content nabi-preview-body');
  // 보기 HTML 그대로다 — 태그를 다루는 render 쪽 함수 하나가 이미 값을 안전하게 처리했다.
  // This is the raw view HTML as-is — the single tag-building function inside render already sanitized the values.
  body.innerHTML = options.nabi.getHtml();
  for (const link of body.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  card.append(close, body);

  let inner: Overlay | null = null;

  // 호스트가 보는 쪽 런타임을 걸 자리 — 카드가 아직 문서 밖이지만 트리는 다 서 있어서 질의도 리스너도 그대로 걸린다(붙은 뒤에 부르면 화면이 한 번 깜빡인다).
  // Where the host wires its view runtime — the card isn't in the document yet, but the tree is fully built, so queries and listeners attach fine (waiting until after it's attached would flash once).
  const detachBody = options.onBody?.(body);

  let scrim: Scrim;
  let disposed = false;
  const onCloseButton = (): void => scrim.close();
  const onBodyClick = (event: Event): void => {
    if (disposed) return;
    const node = event.target as Node | null;
    if (node?.nodeType !== 1 || (node as Element).tagName !== 'IMG') return;
    const target = node as HTMLImageElement;
    event.preventDefault();
    inner = openLightbox({
      surface: options.surface,
      src: target.currentSrc || target.src,
      alt: target.alt,
      ...(options.translator ? { translator: options.translator } : {}),
      ...(options.locale ? { locale: options.locale } : {}),
    });
  };
  try {
    copy.attribute(card, 'aria-label', () => t.t('preview'));
    copy.attribute(close, 'aria-label', () => t.t('close'));
    if (options.locale !== undefined || options.translator !== undefined)
      copy.attribute(card, 'dir', () => localeDirection(t.locale));
    scrim = openScrim(owner, {
      card,
      restore: options.surface,
      onClose: () => {
        // 덮개가 걷히면 건 것도 놓는다 — 카드는 버려지지만 리스너는 호스트가 단 것이라 되돌려 준다.
        // Whatever was wired gets unwired when the scrim closes — the card is discarded, but host-attached listeners are handed back.
        disposed = true;
        copy.dispose();
        close.removeEventListener('click', onCloseButton);
        body.removeEventListener('click', onBodyClick);
        let failure: unknown = null;
        try {
          if (typeof detachBody === 'function') detachBody();
        } catch (error) {
          failure = error;
        }
        try {
          inner?.close();
        } catch (error) {
          failure ??= error;
        }
        if (failure) throw failure;
      },
    });
  } catch (error) {
    copy.dispose();
    try {
      if (typeof detachBody === 'function') detachBody();
    } catch {}
    throw error;
  }

  try {
    // 카드가 문서에 붙은 뒤에 부른다 — 붙기 전에는 offset도 높이도 0이라 잴 것이 없다.
    // Called only after the card is attached — before that, offsets and height are all 0, so there's nothing to measure.
    revealCaretBlock(card, body, options.nabi);

    close.addEventListener('click', onCloseButton);

    // 미리보기에는 상황 줄이 없다 — 그림을 크게 보는 유일한 몸짓이 클릭이다.
    // The preview has no context toolbar — clicking is the only way to enlarge an image.
    body.addEventListener('click', onBodyClick);

    return { card, close: () => scrim.close() };
  } catch (error) {
    try {
      scrim.close();
    } catch {}
    throw error;
  }
}

// 미리보기는 쓰던 자리 근처에서 열린다 — 캐럿 내부 주소(data-key)가 없는 밖으로 나가는 HTML이라, 두 문서를 id가 아니라 블록 순서(index)로 맞춘다.
// The preview opens near where you were writing — since the exported HTML has no internal caret address (data-key), the two documents are aligned by block index, not id.
function revealCaretBlock(scroller: HTMLElement, body: HTMLElement, nabi: Nabi): void {
  const index = nabi.getSelection().focus.path[0];
  if (typeof index !== 'number' || index <= 0) return;
  // 수가 어긋나면 손을 뗀다 — 안 그려진 블록이나 껍데기를 잃은 블록이 있으면 자리가 밀리는데, 그때는 엉뚱한 데로 데려가느니 맨 위가 낫다.
  // Bails if the counts don't match — a skipped or shell-less block would throw off the index, and landing at the top beats landing somewhere wrong.
  if (body.children.length !== hostOf(nabi).doc().length) return;
  const target = body.children[index];
  if (!target) return;
  // "위치 정도"가 핵심이다 — 3분의 1 지점에 둔다. 맨 위에 딱 붙이면 문서의 처음을 보는 것과 구별이 안 된다.
  // "Roughly where you were" is the point — landing a third of the way down, since pinning it to the very top would look identical to opening at the start of the document.
  const delta = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  scroller.scrollTop += delta - scroller.clientHeight / 3;
}

// --- 라이트박스 -------------------------------------------------------------------------------
// 판도 막대도 닫기 단추도 없다 — 덮개 클릭과 Escape가 나가는 길이다. 주소는 노드에서 온 값이라 요소로 짓고 src를 얹는다(HTML 문자열로 만들지 않는다).
// No panel, no bar, no close button — a scrim click or Escape is the only way out. Since the src comes from a node's value, the element is built directly and `src` assigned, never composed as an HTML string.

export interface LightboxOptions {
  readonly surface: HTMLElement;
  readonly src: string;
  readonly alt?: string;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
}

export function openLightbox(options: LightboxOptions): Overlay {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const copy = new Translations(t);
  const image = owner.createElement('img');
  image.className = 'nabi-card nabi-lightbox';
  image.src = options.src;
  image.alt = options.alt ?? '';
  if (!options.alt?.trim()) image.setAttribute('aria-label', t.t('lightbox'));
  if (!image.hasAttribute('dir')) {
    const explicitLocale = options.locale !== undefined || options.translator !== undefined;
    const inherited = owner.defaultView?.getComputedStyle(options.surface).direction;
    image.setAttribute('dir', explicitLocale ? localeDirection(t.locale) : inherited === 'rtl' ? 'rtl' : 'ltr');
  }

  try {
    if (!options.alt?.trim()) copy.attribute(image, 'aria-label', () => t.t('lightbox'));
    if (options.locale !== undefined || options.translator !== undefined)
      copy.attribute(image, 'dir', () => localeDirection(t.locale));
    const scrim = openScrim(owner, { card: image, restore: options.surface, onClose: () => copy.dispose() });
    return { card: image, close: () => scrim.close() };
  } catch (error) {
    copy.dispose();
    throw error;
  }
}

// --- 도구 단추 둘 (미리보기·전체화면) ----------------------------------------------------------

export interface ViewToolsOptions extends PreviewOptions, ViewToolsVisibility {
  // 전체화면이 걸리는 자리 — 크롬과 편집기를 함께 품은 `.nabi` 뿌리다.
  // Where fullscreen is toggled — the `.nabi` root holding both the chrome and the editor.
  readonly root: HTMLElement;
  readonly container: HTMLElement;
}

export interface ViewTools {
  readonly buttons: readonly HTMLButtonElement[];
  unmount(): void;
}

export function mountViewTools(options: ViewToolsOptions): ViewTools {
  const root = options.root;
  const container = options.container;
  const surface = options.surface;
  const translator = options.translator;
  const locale = options.locale;
  const owner = container.ownerDocument;
  const baseline = new HostElementBaseline(container);
  const showPreview = options.showPreview !== false;
  const showFullscreen = options.showFullscreen !== false;
  const releaseRoot = showFullscreen ? acquireGestureRoot(root, [surface]) : () => {};
  const rootLease = new HostElementLease(root);
  let unmounted = false;
  let preview: Overlay | null = null;
  let box: HTMLElement | null = null;
  let previewButton: HTMLButtonElement | null = null;
  let fullButton: HTMLButtonElement | null = null;
  let unbindPreview = (): void => {};
  let unbindFull = (): void => {};
  let copy: Translations | null = null;
  let rootReleased = false;
  const releaseGesture = (): void => {
    if (rootReleased) return;
    rootReleased = true;
    releaseRoot();
  };
  const setOwnFullscreen = (on: boolean): void => rootLease.className(FULLSCREEN_CLASS, on);

  const finish = (work: () => void, failure: { value: unknown }): void => {
    try {
      work();
    } catch (error) {
      failure.value ??= error;
    }
  };
  const dispose = (): void => {
    if (unmounted) return;
    unmounted = true;
    const failure: { value: unknown } = { value: null };
    finish(() => owner.removeEventListener('keydown', onKey), failure);
    finish(releaseGesture, failure);
    finish(unbindPreview, failure);
    finish(unbindFull, failure);
    finish(() => copy?.dispose(), failure);
    finish(() => preview?.close(), failure);
    preview = null;
    finish(() => rootLease.dispose(), failure);
    finish(() => previewButton?.remove(), failure);
    finish(() => fullButton?.remove(), failure);
    finish(() => box?.remove(), failure);
    if (failure.value) throw failure.value;
  };

  const paint = (): void => {
    if (!fullButton) return;
    const on = isFullscreen(root);
    const label = t.t(on ? 'fullscreenExit' : 'fullscreenEnter');
    const icon = on ? 'fullscreen-exit' : 'fullscreen-enter';
    fullButton.innerHTML = iconHtml(`view-${icon}`, icon);
    fullButton.setAttribute('aria-label', label);
    fullButton.setAttribute('data-nabi-tip', label);
    setPressed(fullButton, on);
  };

  const onKey = (event: Event): void => {
    if ((event as KeyboardEvent).key !== 'Escape') return;
    const target = event.target;
    if (target === null || typeof (target as Node).nodeType !== 'number' || !ownsGestureRoot(root, target, surface))
      return;
    if (!isFullscreen(root)) return;
    setOwnFullscreen(false);
    paint();
  };

  let t: Translator;
  try {
    t = translator ?? makeTranslator(locale);
    copy = new Translations(t);

    // 받은 그릇을 nabi-tools로 만들지 않고 제 상자를 새로 세운다 — 툴바 자체를 넘겨받으면 float 배치가 툴바 전체를 흐트러뜨린다. 이미 선 줄(SSR)은 이름표가 맞으면 그대로 쓰고, 안 맞으면 다시 그린다.
    // Builds its own box instead of turning the given container into .nabi-tools — floating the toolbar itself would scramble its layout. An existing (SSR-rendered) row is reused if its labels match, otherwise redrawn.
    const want = [
      ...(showPreview ? [{ name: 'preview', label: t.t('preview'), icon: 'view-preview' }] : []),
      ...(showFullscreen ? [{ name: 'fullscreen', label: t.t('fullscreenEnter'), icon: 'view-fullscreen-enter' }] : []),
    ];
    const pick = (host: Element | null, name: string): HTMLButtonElement | null =>
      host?.querySelector<HTMLButtonElement>(`button[data-name="${name}"]`) ?? null;

    box = container.querySelector<HTMLElement>(':scope > .nabi-tools');
    const existing = Array.from(box?.querySelectorAll('button') ?? []);
    const fits =
      existing.length === want.length &&
      want.every(
        (item, at) =>
          existing[at]?.getAttribute('data-name') === item.name &&
          existing[at]?.getAttribute('aria-label') === item.label &&
          existing[at]?.querySelector('[data-nabi-icon]')?.getAttribute('data-nabi-icon') === item.icon,
      );
    if (!fits || want.length === 0) {
      box?.remove();
      box = null;
      const html = renderViewToolsHtml({ translator: t, showPreview, showFullscreen });
      if (html) {
        container.insertAdjacentHTML('afterbegin', html);
        box = container.querySelector<HTMLElement>(':scope > .nabi-tools');
      }
    }
    previewButton = showPreview ? pick(box, 'preview') : null;
    fullButton = showFullscreen ? pick(box, 'fullscreen') : null;

    if (previewButton) {
      unbindPreview = wireIconButton(previewButton, () => {
        preview?.close();
        preview = openPreview(options);
      });
    }
    if (fullButton) {
      unbindFull = wireIconButton(fullButton, () => {
        setOwnFullscreen(!isFullscreen(root));
        paint();
      });
      owner.addEventListener('keydown', onKey);
    }
    if (previewButton) copy.button(previewButton, () => t.t('preview'));
    copy.add(paint);

    return {
      buttons: [previewButton, fullButton].filter((button): button is HTMLButtonElement => button !== null),
      unmount: dispose,
    };
  } catch (error) {
    try {
      dispose();
    } catch {}
    try {
      baseline.restore();
    } catch {}
    throw error;
  }
}
