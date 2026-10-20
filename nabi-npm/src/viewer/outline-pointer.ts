export function bindOutlinePointer(
  panel: HTMLElement,
  list: HTMLElement,
  visit: (index: number) => void,
  step: (direction: number) => boolean,
  release: () => void,
): { stop(): void; isNavigating(): boolean; unmount(): void } {
  const owner = panel.ownerDocument;
  const view = owner.defaultView!;
  let pointer: number | null = null;
  let fromItem = false;
  let selected = -1;
  let direction = 0;
  let timer = 0;
  const itemOf = (target: Element | null): HTMLElement | null => {
    const item = target?.closest<HTMLElement>('[data-nabi-outline-index]');
    return item && list.contains(item) ? item : null;
  };
  const edgeOf = (target: Element | null): number => {
    const edge = target?.closest<HTMLElement>('[data-nabi-outline-scroll]');
    return edge && panel.contains(edge) && edge.getAttribute('aria-disabled') !== 'true'
      ? Number(edge.dataset['nabiOutlineScroll'])
      : 0;
  };
  const choose = (item: HTMLElement | null): void => {
    if (!item) return;
    const index = Number(item.dataset['nabiOutlineIndex']);
    if (selected === index) return;
    selected = index;
    visit(index);
  };
  const tick = (): void => {
    timer = 0;
    if (pointer !== null && direction && step(direction)) timer = view.setTimeout(tick, 180);
  };
  const scroll = (next: number): void => {
    if (next === direction) return;
    view.clearTimeout(timer);
    timer = 0;
    direction = next;
    if (pointer !== null && direction) {
      selected = -1;
      if (step(direction)) timer = view.setTimeout(tick, 350);
    }
  };
  const stop = (): void => {
    const id = pointer;
    pointer = null;
    fromItem = false;
    selected = -1;
    scroll(0);
    if (id !== null && panel.hasPointerCapture(id)) panel.releasePointerCapture(id);
  };
  const down = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
      return;
    const target = event.target as Element;
    const item = itemOf(target);
    const edge = edgeOf(target);
    if (!item && !edge) return;
    event.preventDefault();
    stop();
    pointer = event.pointerId;
    fromItem = item !== null;
    panel.setPointerCapture(pointer);
    (item ?? target.closest<HTMLElement>('button'))?.focus({ preventScroll: true });
    choose(item);
    if (edge) scroll(edge);
  };
  const move = (event: PointerEvent): void => {
    if (pointer === null || event.pointerId !== pointer) return;
    if (!(event.buttons & 1)) {
      stop();
      return;
    }
    const target = owner.elementFromPoint(event.clientX, event.clientY);
    event.preventDefault();
    scroll(edgeOf(target));
    const item = itemOf(target);
    if (item) {
      fromItem = true;
      choose(item);
    }
  };
  const end = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    const close = event.type === 'pointerup' && fromItem;
    stop();
    if (close) release();
  };
  const prevent = (event: Event): void => event.preventDefault();
  panel.addEventListener('pointerdown', down);
  panel.addEventListener('pointermove', move);
  panel.addEventListener('pointerup', end);
  panel.addEventListener('pointercancel', end);
  panel.addEventListener('lostpointercapture', end);
  panel.addEventListener('selectstart', prevent);
  panel.addEventListener('dragstart', prevent);
  panel.addEventListener('contextmenu', prevent);
  view.addEventListener('blur', stop);
  return {
    stop,
    isNavigating: () => pointer !== null,
    unmount() {
      stop();
      panel.removeEventListener('pointerdown', down);
      panel.removeEventListener('pointermove', move);
      panel.removeEventListener('pointerup', end);
      panel.removeEventListener('pointercancel', end);
      panel.removeEventListener('lostpointercapture', end);
      panel.removeEventListener('selectstart', prevent);
      panel.removeEventListener('dragstart', prevent);
      panel.removeEventListener('contextmenu', prevent);
      view.removeEventListener('blur', stop);
    },
  };
}
