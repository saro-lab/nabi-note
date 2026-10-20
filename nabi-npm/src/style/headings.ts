export function headingText(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  for (const br of copy.querySelectorAll('br')) br.replaceWith(element.ownerDocument.createTextNode(' '));
  for (const marker of copy.querySelectorAll('[data-nabi-fn], [data-nabi-footnotes]')) marker.remove();
  return (copy.textContent ?? '').replace(/\s+/gu, ' ').trim();
}

export function ownsHeading(root: HTMLElement, element: Element): boolean {
  for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
    if (parent.matches('.nabi-content, [data-nabi-outline-root]')) return false;
  }
  return root.contains(element);
}

export function headingElements(root: HTMLElement, visible = true): HTMLElement[] {
  const view = root.ownerDocument.defaultView;
  return Array.from(root.querySelectorAll<HTMLElement>('h1, h2')).filter((element) => {
    if (!ownsHeading(root, element) || element.closest('details, [data-nabi-footnotes]') || !headingText(element))
      return false;
    if (!visible) return true;
    if (!element.getClientRects().length || element.closest('[hidden]')) return false;
    return view?.getComputedStyle(element).visibility === 'visible';
  });
}

export function attachHeadingNumbers(root: HTMLElement): {
  update(headings?: readonly HTMLElement[]): void;
  unmount(): void;
} {
  const attribute = 'data-nabi-outline-number';
  const saved = new Map<HTMLElement, { before: string | null; written: string }>();
  function restore(element: HTMLElement, value: { before: string | null; written: string }): void {
    if (element.getAttribute(attribute) !== value.written) return;
    if (value.before === null) element.removeAttribute(attribute);
    else element.setAttribute(attribute, value.before);
  }
  return {
    update(headings = headingElements(root, false)) {
      const numbers = new Map<HTMLElement, string>();
      let number = 0;
      for (const heading of headings) {
        if (heading.tagName === 'H1') numbers.set(heading, String(++number));
      }
      for (const [element, value] of saved) {
        if (!ownsHeading(root, element) || element.tagName !== 'H1') {
          restore(element, value);
          saved.delete(element);
        }
      }
      for (const element of root.querySelectorAll<HTMLElement>('h1')) {
        if (!ownsHeading(root, element)) continue;
        const written = numbers.get(element) ?? '';
        const previous = saved.get(element);
        saved.set(element, { before: previous ? previous.before : element.getAttribute(attribute), written });
        if (element.getAttribute(attribute) !== written) element.setAttribute(attribute, written);
      }
    },
    unmount() {
      for (const [element, value] of saved) restore(element, value);
      saved.clear();
    },
  };
}
