// 게시 화면의 각주 — 번호에 마우스를 올리거나 누르거나 탭하면 내용 말풍선이 뜨고, 하단 번호를 누르면 본문의 그 번호로 간다. 닫기 단추는 없다.
// Footnotes on a published page: hovering, clicking, or tapping a number shows its content in a bubble, and a number in the list jumps to its marker in the body. There is no close button.
// 저장 HTML만으로도 번호와 하단 목록은 읽힌다 — 여기는 그 위에 얹는 읽기 편의일 뿐이고, 내용은 언제나 textContent로만 넣는다.
// Stored HTML alone already shows numbers and the list; this only adds reading conveniences on top, and content is always inserted via textContent.

export const FOOTNOTE_ATTR = 'data-nabi-fn';

const MARKER = `sup[${FOOTNOTE_ATTR}]`;
const OPEN_ATTR = 'data-nabi-fn-open';
const READY_ATTR = 'data-nabi-fn-ready';
const GAP = 6;
const EDGE = 8;
const HOVER_CLOSE_MS = 120;

interface Saved {
  readonly el: Element;
  readonly name: string;
  readonly value: string | null;
}

const markersIn = (scope: ParentNode): HTMLElement[] =>
  Array.from(scope.querySelectorAll<HTMLElement>(MARKER)).filter((el) => !el.hasAttribute('data-nabi-terminal'));

export function attachFootnotes(root: HTMLElement): () => void {
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const saved: Saved[] = [];
  const remember = (el: Element, name: string, value: string): void => {
    saved.push({ el, name, value: el.getAttribute(name) });
    el.setAttribute(name, value);
  };

  const markers = markersIn(root);
  const lists = Array.from(root.querySelectorAll<HTMLElement>('[data-nabi-footnotes]'));
  if (markers.length === 0 && lists.length === 0) return () => {};

  const tipId = `nabi-fn-tip-${Math.random().toString(36).slice(2, 10)}`;
  for (const marker of markers) {
    remember(marker, 'tabindex', '0');
    remember(marker, 'role', 'button');
    remember(marker, 'aria-expanded', 'false');
  }
  for (const list of lists) remember(list, READY_ATTR, '');

  let tip: HTMLElement | null = null;
  let current: HTMLElement | null = null;
  let pinned = false;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelClose = (): void => {
    if (closeTimer !== null) clearTimeout(closeTimer);
    closeTimer = null;
  };

  const place = (marker: HTMLElement, bubble: HTMLElement): void => {
    const seat = marker.getBoundingClientRect();
    const width = view?.innerWidth ?? owner.documentElement.clientWidth;
    const height = view?.innerHeight ?? owner.documentElement.clientHeight;
    bubble.style.left = '0px';
    bubble.style.top = '0px';
    const box = bubble.getBoundingClientRect();
    const left = Math.max(EDGE, Math.min(seat.left + seat.width / 2 - box.width / 2, width - box.width - EDGE));
    const below = seat.bottom + GAP;
    const top =
      below + box.height <= height - EDGE || seat.top - GAP - box.height < EDGE ? below : seat.top - GAP - box.height;
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(Math.max(EDGE, top))}px`;
  };

  const close = (): void => {
    cancelClose();
    if (current) {
      current.setAttribute('aria-expanded', 'false');
      current.removeAttribute(OPEN_ATTR);
      current.removeAttribute('aria-describedby');
    }
    current = null;
    pinned = false;
    tip?.remove();
  };

  const open = (marker: HTMLElement, pin: boolean): void => {
    cancelClose();
    if (current !== marker) close();
    if (!tip) {
      tip = owner.createElement('div');
      tip.className = 'nabi-fn-tip';
      tip.id = tipId;
      tip.setAttribute('role', 'group');
      tip.addEventListener('pointerenter', cancelClose);
      tip.addEventListener('pointerleave', onLeave);
    }
    const scope = marker.closest<HTMLElement>('.nabi-content') ?? root;
    const index = markersIn(scope).indexOf(marker);
    const number = owner.createElement('button');
    number.type = 'button';
    number.setAttribute('data-nabi-fn-num', '');
    number.textContent = `[${index + 1}]`;
    number.addEventListener('click', (event) => {
      const list = lists.find((list) => (list.parentElement ?? root) === scope);
      const item = list?.querySelector<HTMLElement>(`[data-nabi-fn-n="${index + 1}"]`);
      if (!item) return;
      event.preventDefault();
      const reduce = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
      close();
      item.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      if (!item.hasAttribute('tabindex')) remember(item, 'tabindex', '-1');
      item.focus({ preventScroll: true });
    });
    tip.replaceChildren(number, owner.createTextNode(` ${marker.getAttribute(FOOTNOTE_ATTR) ?? ''}`));
    // 본문 root 안에 붙여 글꼴 크기·색 토큰을 그대로 물려받는다 — 크기는 그 기준의 한 단계 아래다(CSS).
    // Placed inside the content root so it inherits the font size and color tokens; its size is one step below that base (CSS).
    const host = marker.closest<HTMLElement>('.nabi-content') ?? root;
    if (tip.parentElement !== host) host.append(tip);
    current = marker;
    pinned = pinned || pin;
    marker.setAttribute('aria-expanded', 'true');
    marker.setAttribute(OPEN_ATTR, '');
    marker.setAttribute('aria-describedby', tipId);
    place(marker, tip);
  };

  const markerOf = (target: EventTarget | null): HTMLElement | null => {
    const el = target as Element | null;
    if (!el || typeof el.closest !== 'function') return null;
    const marker = el.closest<HTMLElement>(MARKER);
    return marker && markers.includes(marker) ? marker : null;
  };

  const onLeave = (event: PointerEvent): void => {
    if (pinned || event.pointerType !== 'mouse') return;
    const next = event.relatedTarget as Node | null;
    if (next && (tip?.contains(next) || current?.contains(next))) return;
    cancelClose();
    closeTimer = setTimeout(close, HOVER_CLOSE_MS);
  };

  const onOver = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    const marker = markerOf(event.target);
    if (!marker) return;
    if (current === marker) cancelClose();
    else if (!pinned) open(marker, false);
  };

  const onOut = (event: PointerEvent): void => {
    if (markerOf(event.target)) onLeave(event);
  };

  // 같은 번호를 다시 누르면 닫고, 아니면 고정해서 연다 — 접기 제목 속 번호라도 접기가 같이 열리고 닫히지 않게 기본 동작을 막는다.
  // Pressing the same number again closes it, otherwise it opens pinned; the default action is blocked so a number inside a details summary doesn't toggle it.
  const onClick = (event: MouseEvent): void => {
    const marker = markerOf(event.target);
    if (marker) {
      event.preventDefault();
      if (current === marker && pinned) close();
      else open(marker, true);
      return;
    }
    const num = (event.target as Element | null)?.closest?.('[data-nabi-fn-num]');
    const item = num?.closest('[data-nabi-fn-n]');
    const list = item?.closest('[data-nabi-footnotes]');
    if (!item || !list || !lists.includes(list as HTMLElement)) return;
    const index = Number(item.getAttribute('data-nabi-fn-n')) - 1;
    const scope = list.parentElement ?? root;
    const target = markersIn(scope)[index];
    if (!target) return;
    event.preventDefault();
    const reduce = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    target.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    target.focus({ preventScroll: true });
  };

  const onKey = (event: KeyboardEvent): void => {
    const marker = markerOf(event.target);
    if (event.key === 'Tab' && current && tip) {
      if (marker === current && !event.shiftKey) {
        event.preventDefault();
        tip.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
      } else if (event.shiftKey && tip.contains(event.target as Node)) {
        event.preventDefault();
        current.focus({ preventScroll: true });
      }
    }
    if (marker && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (current === marker && pinned) close();
      else open(marker, true);
    }
  };

  const onFocusIn = (event: FocusEvent): void => {
    const marker = markerOf(event.target);
    if (marker && current !== marker) open(marker, false);
  };

  const onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (pinned || !current || (next && (tip?.contains(next) || current.contains(next)))) return;
    if (markerOf(event.target) || tip?.contains(event.target as Node)) close();
  };

  // 바깥을 누르거나 Esc면 닫는다 — 말풍선 안의 글을 고르는 동안은 안 닫힌다.
  // An outside press or Escape closes it; selecting text inside the bubble doesn't.
  const onOutside = (event: PointerEvent): void => {
    if (!current) return;
    const target = event.target as Node | null;
    if (target && (tip?.contains(target) || current.contains(target))) return;
    close();
  };

  const onEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !current) return;
    const marker = current;
    const inside = tip?.contains(owner.activeElement) === true;
    if (inside) marker.focus({ preventScroll: true });
    close();
  };

  const onMove = (): void => {
    if (current && tip) place(current, tip);
  };

  root.addEventListener('pointerover', onOver);
  root.addEventListener('pointerout', onOut);
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  owner.addEventListener('pointerdown', onOutside, true);
  owner.addEventListener('keydown', onEscape, true);
  view?.addEventListener('scroll', onMove, true);
  view?.addEventListener('resize', onMove);

  return () => {
    close();
    tip = null;
    view?.removeEventListener('resize', onMove);
    view?.removeEventListener('scroll', onMove, true);
    owner.removeEventListener('keydown', onEscape, true);
    owner.removeEventListener('pointerdown', onOutside, true);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('keydown', onKey);
    root.removeEventListener('click', onClick);
    root.removeEventListener('pointerout', onOut);
    root.removeEventListener('pointerover', onOver);
    for (const { el, name, value } of saved.reverse()) {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    }
  };
}
