export function makeMovePreview(root: HTMLElement, source: HTMLElement, startX: number, startY: number) {
  const owner = source.ownerDocument;
  const view = owner.defaultView!;
  const rect = source.getBoundingClientRect();
  const scrollers: { source: Element; clone: Element }[] = [];

  const snapshot = (element: Element): Element => {
    const video = element.tagName === 'IFRAME';
    const clone = (video ? owner.createElement('div') : element.cloneNode(false)) as HTMLElement;
    const style = view.getComputedStyle(element);
    for (const property of Array.from(style)) clone.style.setProperty(property, style.getPropertyValue(property));
    for (const attribute of ['id', 'data-key', 'data-nabi-picked', 'contenteditable', 'autofocus']) {
      clone.removeAttribute(attribute);
    }
    clone.style.pointerEvents = 'none';
    clone.style.userSelect = 'none';
    clone.style.animation = 'none';
    clone.style.transition = 'none';
    if (element.hasAttribute('data-nabi-picked')) clone.style.outline = 'none';
    if (video) {
      clone.style.display = 'grid';
      clone.style.placeItems = 'center';
      clone.style.background = '#181818';
      clone.innerHTML =
        '<svg viewBox="0 0 64 44" width="64" height="44" aria-hidden="true"><rect width="64" height="44" rx="10" fill="#e22"/><path d="M26 12v20l18-10Z" fill="#fff"/></svg>';
    } else {
      for (const child of element.childNodes) {
        clone.append(child.nodeType === 1 ? snapshot(child as Element) : child.cloneNode(true));
      }
    }
    if (element.scrollLeft || element.scrollTop) scrollers.push({ source: element, clone });
    return clone;
  };

  const preview = owner.createElement('div');
  preview.className = 'nabi-content nabi-move-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.inert = true;
  const style = view.getComputedStyle(root);
  for (const property of Array.from(style)) {
    if (property.startsWith('--')) preview.style.setProperty(property, style.getPropertyValue(property));
  }
  preview.style.width = `${rect.width}px`;
  preview.style.height = `${rect.height}px`;
  const clone = snapshot(source) as HTMLElement;
  clone.style.position = 'relative';
  clone.style.inset = 'auto';
  clone.style.margin = '0';
  clone.style.float = 'none';
  clone.style.boxSizing = 'border-box';
  clone.style.width = clone.style.inlineSize = `${rect.width}px`;
  clone.style.height = clone.style.blockSize = `${rect.height}px`;
  clone.style.minWidth = clone.style.minInlineSize = '0';
  clone.style.maxWidth = clone.style.maxInlineSize = 'none';
  clone.style.minHeight = clone.style.minBlockSize = '0';
  clone.style.maxHeight = clone.style.maxBlockSize = 'none';
  preview.append(clone);

  const move = (x: number, y: number): void => {
    preview.style.transform = `translate3d(${rect.left + x - startX}px, ${rect.top + y - startY}px, 0)`;
  };
  move(startX, startY);
  owner.body.append(preview);
  for (const { source, clone } of scrollers) {
    clone.scrollLeft = source.scrollLeft;
    clone.scrollTop = source.scrollTop;
  }
  return { move, remove: () => preview.remove() };
}
