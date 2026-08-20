// 미리보기·전체화면·라이트박스 — 셋 다 `scrim` 부품 위에 선다(전체화면만 덮개가 아니라 클래스다).
// 옛 판이 셋에 걸쳐 세 벌 갖고 있던 Escape·바깥 클릭·포커스 복원이 부품 하나로 내려갔다.
//
// 미리보기의 알맹이는 **`renderHtml` + `nabi.css`** 다: 편집기 표식(`data-key`)이 없는 그대로의
// 보기 HTML 을 `.nabi-content` 안에 넣는다. 보는 사람이 볼 것과 글자 하나까지 같아야 한다.
import type { Nabi } from '../editor/index.js';
import { makeTranslator, type Translator } from '../locale/index.js';
import { iconSvg, make } from './parts/dom.js';
import {
  FULLSCREEN_ENTER_ICON,
  FULLSCREEN_EXIT_ICON,
  renderViewToolsHtml,
} from '../wing/toolbar-html.js';
import { setPressed, wireIconButton } from './parts/button.js';
import { openScrim, type Scrim } from './parts/scrim.js';

export const FULLSCREEN_CLASS = 'is-fullscreen';

// 아이콘 셋 — 코어의 것이다(wing 이 아니다). old 번역.
// 아이콘 셋과 뷰 도구의 글자는 **`wing/toolbar-html.ts` 가 든다** — 서버도 같은 줄을 그려야
// 하고, ssr 엔트리는 ui 를 안 딛기 때문이다 (097). 부르던 자리를 위해 다시 내보낸다.
export {
  FULLSCREEN_ENTER_ICON,
  FULLSCREEN_EXIT_ICON,
  PREVIEW_ICON,
} from '../wing/toolbar-html.js';

// --- 전체화면 ---------------------------------------------------------------------------------
// Fullscreen API 가 아니라 클래스 하나다 — iframe 안이나 API 가 막힌 자리에서도 산다.
// 크롬과 편집기가 **함께** 커져야 한다: 크롬만 고정하면 편집기가 안 자란다.

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
  readonly surface: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
  // 본문이 세워진 직후 한 번 — **보는 쪽 런타임을 호스트가 여기서 건다**(표 정렬이 그것이다).
  // 답으로 떼는 함수를 주면 덮개가 걷힐 때 부른다.
  //
  // 코어가 직접 걸 수 없는 까닭: `viewer` 는 `ui` 의 **위층**이라 이 파일이 그것을 부르면 층이
  // 뒤집힌다(경계 그물이 잡는다). 021 판에서도 이 일은 호스트(그때는 데모)의 것이었는데,
  // 미리보기가 호스트에서 코어로 옮겨 오면서 걸 자리가 없어져 표 정렬이 통째로 빠져 있었다.
  // 이 훅이 그 자리를 되돌려 준다 — 층은 그대로 두고 문만 연다.
  readonly onBody?: (body: HTMLElement) => (() => void) | void;
}

export interface Overlay {
  readonly card: HTMLElement;
  close(): void;
}

export function openPreview(options: PreviewOptions): Overlay {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);

  const card = make(owner, 'div', 'nabi-card');
  card.style.setProperty('--nabi-preview-width', `${Math.round(options.surface.getBoundingClientRect().width)}px`);

  const close = make(owner, 'button', 'nabi-close', { type: 'button', 'aria-label': t.t('close') });
  close.textContent = '✕';

  const body = make(owner, 'div', 'nabi-content nabi-preview-body');
  // 보기 HTML 그대로 — 이스케이프는 render 안의 태그 문 하나가 이미 했다 (06 규칙).
  body.innerHTML = options.nabi.getHtml();

  card.append(close, body);
  let inner: Overlay | null = null;

  // 호스트가 보는 쪽 런타임을 걸 자리 — 카드가 아직 문서 밖이지만 트리는 다 서 있어서
  // 질의도 리스너도 그대로 걸린다(붙은 뒤에 부르면 화면이 한 번 깜빡인다).
  const detachBody = options.onBody?.(body);

  const scrim: Scrim = openScrim(owner, {
    card,
    restore: options.surface,
    onClose: () => {
      // 덮개가 걷히면 건 것도 놓는다 — 카드는 버려지지만 리스너는 호스트가 단 것이라 되돌려 준다.
      if (typeof detachBody === 'function') detachBody();
      inner?.close();
    },
  });

  // 카드가 문서에 **붙은 뒤**에 부른다 — 붙기 전에는 offset 도 높이도 0 이라 잴 것이 없다.
  revealCaretBlock(card, body, options.nabi);

  close.addEventListener('click', () => scrim.close());

  // 미리보기에는 상황 줄이 없다 — 그림을 크게 보는 유일한 몸짓이 클릭이다.
  body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    event.preventDefault();
    inner = openLightbox({
      surface: options.surface,
      src: target.currentSrc || target.src,
      alt: target.alt,
      ...(options.translator ? { translator: options.translator } : {}),
      ...(options.locale ? { locale: options.locale } : {}),
    });
  });

  return { card, close: () => scrim.close() };
}

// 미리보기는 **쓰던 자리에서 열린다** (053 — 주인 지시 "커서의 위치정도까지 스크롤해서 보여줘").
// 긴 글을 쓰다 눌러 보면 보러 온 것은 방금 쓴 문단인데, 언제나 맨 위에서 열리면 그것을 찾아
// 또 내려가야 한다.
//
// 두 문서를 **id 가 아니라 자리로** 맞춘다: 미리보기가 그리는 것은 밖으로 나가는 HTML 이라
// 캐럿의 내부 주소(data-key)가 하나도 없다 — 그래야 맞다, 그 열쇠는 문서의 일부가 아니다.
function revealCaretBlock(scroller: HTMLElement, body: HTMLElement, nabi: Nabi): void {
  const index = nabi.getSelection().focus.path[0];
  // 첫 블록이면 이미 맨 위다 — 건드리지 않는다.
  if (typeof index !== 'number' || index <= 0) return;
  // **수가 어긋나면 손을 뗀다.** 아무것도 안 그리는 블록(주소가 거절된 그림)이나 껍데기를 잃은
  // 블록이 있으면 자리가 밀리는데, 그때는 엉뚱한 데로 데려가느니 맨 위가 낫다.
  if (body.children.length !== nabi.$doc().length) return;
  const target = body.children[index];
  if (!(target instanceof HTMLElement)) return;
  // "위치 **정도**" 가 핵심이다 — 3분의 1 지점에 둔다. 맨 위에 딱 붙이면 그 블록이 첫 줄이 되어
  // 문서의 처음을 보는 것과 구별이 안 된다. 앞의 것이 조금 보여야 어디쯤인지 눈이 알아본다.
  const delta = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  scroller.scrollTop += delta - scroller.clientHeight / 3;
}

// --- 라이트박스 -------------------------------------------------------------------------------
// 판도 막대도 닫기 단추도 없다 — 덮개 클릭과 Escape 가 나가는 길이다.
// 주소는 노드에서 온 값이라 **요소로 짓고 `src` 를 얹는다**(HTML 문자열로 만들지 않는다).

export interface LightboxOptions {
  readonly surface: HTMLElement;
  readonly src: string;
  readonly alt?: string;
  readonly locale?: string;
  readonly translator?: Translator;
}

export function openLightbox(options: LightboxOptions): Overlay {
  const owner = options.surface.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  const image = owner.createElement('img');
  image.className = 'nabi-card nabi-lightbox';
  image.src = options.src;
  image.alt = options.alt ?? '';
  if (!options.alt) image.setAttribute('aria-label', t.t('lightbox'));

  const scrim = openScrim(owner, { card: image, restore: options.surface });
  return { card: image, close: () => scrim.close() };
}

// --- 도구 단추 둘 (미리보기·전체화면) ----------------------------------------------------------

export interface ViewToolsOptions extends PreviewOptions {
  // 전체화면이 걸리는 자리 — 크롬과 편집기를 함께 품은 `.nabi` 뿌리다.
  readonly root: HTMLElement;
  // 단추 둘이 들어설 그릇.
  readonly container: HTMLElement;
}

export interface ViewTools {
  readonly buttons: readonly HTMLButtonElement[];
  unmount(): void;
}

export function mountViewTools(options: ViewToolsOptions): ViewTools {
  const owner = options.container.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);

  // **제 상자를 스스로 세운다** — 받은 그릇을 `.nabi-tools` 로 만들지 않는다.
  //
  // 이 클래스는 오른쪽 끝으로 띄우는(float) 자리다. 받은 그릇이 툴바 자신이면 툴바 전체가
  // 떠올라 단추 줄이 통째로 흐트러졌다(좁은 화면에서 특히). 호스트가 툴바를 그대로 넘기는 것은
  // 가장 자연스러운 일이므로, 그 자리에서 깨지지 않는 것이 이쪽의 책임이다.
  //
  // **맨 앞에 꽂는다** — float 는 제 뒤의 인라인 내용이 비켜 흐르게 한다. 뒤에 두면 이미 자리를
  // 잡은 단추들 위로 겹친다.
  // 서 있는 줄이 있으면 **다시 안 그린다** — 서버가 미리 그려 보낸 뷰 도구를 이어받는 자리다
  // (097). 견주는 것은 글자가 아니라 구조다: 이름 둘과 이름표가 맞으면 그대로 쓴다.
  // 툴바(096)와 같은 규칙이고, 어긋나면 그 자리에서 새로 그리므로 조용히 안 깨진다.
  const want = { preview: t.t('preview'), fullscreen: t.t('fullscreenEnter') };
  const pick = (host: Element | null, name: string): HTMLButtonElement | null =>
    host?.querySelector<HTMLButtonElement>(`button[data-name="${name}"]`) ?? null;

  let box = options.container.querySelector<HTMLElement>(':scope > .nabi-tools');
  let previewButton = pick(box, 'preview');
  let fullButton = pick(box, 'fullscreen');
  const fits =
    previewButton?.getAttribute('aria-label') === want.preview &&
    fullButton?.getAttribute('aria-label') === want.fullscreen;
  if (!fits) {
    box?.remove();
    options.container.insertAdjacentHTML('afterbegin', renderViewToolsHtml({ translator: t }));
    box = options.container.querySelector<HTMLElement>(':scope > .nabi-tools');
    previewButton = pick(box, 'preview');
    fullButton = pick(box, 'fullscreen');
  }
  // 그릇이 없을 리 없지만(방금 그렸다) 타입을 좁힌다 — 없으면 세울 것이 없으니 빈 손을 답한다.
  if (!box || !previewButton || !fullButton) {
    return { buttons: [], unmount() {} };
  }

  let preview: Overlay | null = null;

  wireIconButton(previewButton, () => {
    preview?.close();
    preview = openPreview(options);
  });

  wireIconButton(fullButton, () => {
    setFullscreen(options.root, !isFullscreen(options.root));
    paint();
  });

  // 전체화면 단추는 상태를 말한다 — 아이콘·이름·`aria-pressed` 가 한 번에 바뀐다.
  const paint = (): void => {
    const on = isFullscreen(options.root);
    const label = t.t(on ? 'fullscreenExit' : 'fullscreenEnter');
    fullButton.innerHTML = iconSvg(on ? FULLSCREEN_EXIT_ICON : FULLSCREEN_ENTER_ICON);
    fullButton.setAttribute('aria-label', label);
    fullButton.setAttribute('data-nabi-tip', label);
    setPressed(fullButton, on);
  };

  // 전체화면은 Escape 로도 나간다 — 미리보기가 열려 있으면 그쪽이 먼저 받는다(덮개가 위에 있다).
  const onKey = (event: Event): void => {
    if ((event as KeyboardEvent).key !== 'Escape') return;
    if (!isFullscreen(options.root)) return;
    setFullscreen(options.root, false);
    paint();
  };

  owner.addEventListener('keydown', onKey);
  paint();

  return {
    buttons: [previewButton, fullButton],
    unmount() {
      owner.removeEventListener('keydown', onKey);
      preview?.close();
      preview = null;
      setFullscreen(options.root, false);
      previewButton.remove();
      fullButton.remove();
      box.remove();
    },
  };
}
