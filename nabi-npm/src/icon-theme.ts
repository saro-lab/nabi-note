export function followIconTheme(source: HTMLElement | null | undefined, target: HTMLElement): () => void {
  const owner = target.ownerDocument;
  const view = owner.defaultView;
  if (!source || !view || typeof view.getComputedStyle !== 'function') return () => {};
  const copied = new Set<string>();
  const sync = (): void => {
    const style = view.getComputedStyle(source);
    const next = new Set<string>();
    for (let at = 0; at < style.length; at += 1) {
      const name = style.item(at);
      if (!name.startsWith('--nabi-icon-')) continue;
      const value = style.getPropertyValue(name);
      next.add(name);
      if (target.style.getPropertyValue(name) !== value) target.style.setProperty(name, value);
    }
    for (const name of copied) if (!next.has(name)) target.style.removeProperty(name);
    copied.clear();
    for (const name of next) copied.add(name);
    const scheme = style.colorScheme;
    const theme = scheme === 'dark' ? 'dark' : scheme === 'light' ? 'light' : null;
    if (theme) target.setAttribute('data-nabi-theme', theme);
    else target.removeAttribute('data-nabi-theme');
  };
  const observer = new view.MutationObserver((records) => {
    if (
      records.some(
        ({ target: changed }) =>
          changed === source ||
          (changed.nodeType === 1 && (changed as Element).contains(source)) ||
          owner.head?.contains(changed),
      )
    )
      sync();
  });
  try {
    sync();
    observer.observe(owner.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-nabi-theme'],
      childList: true,
      characterData: true,
      subtree: true,
    });
    owner.addEventListener('load', sync, true);
    view.addEventListener('resize', sync);
  } catch (error) {
    observer.disconnect();
    owner.removeEventListener('load', sync, true);
    view.removeEventListener('resize', sync);
    throw error;
  }
  return () => {
    observer.disconnect();
    owner.removeEventListener('load', sync, true);
    view.removeEventListener('resize', sync);
  };
}
