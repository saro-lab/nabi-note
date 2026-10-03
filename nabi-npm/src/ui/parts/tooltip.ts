import { HostElementLease } from '../../lifecycle.js';
import { Z_DIALOG } from '../../style/tokens.js';
import { make } from './dom.js';

export interface Tooltip {
  refresh(): void;
  hide(): void;
  unmount(): void;
}

let serial = 0;

export function mountTooltip(root: HTMLElement): Tooltip {
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  const visual = view?.visualViewport;
  const rootLease = new HostElementLease(root);
  const tip = make(owner, 'div', 'nabi-tooltip', { role: 'tooltip' });
  do tip.id = `nabi-tooltip-${++serial}`;
  while (owner.getElementById(tip.id));
  tip.style.position = 'fixed';
  tip.style.pointerEvents = 'none';
  let target: HTMLElement | null = null;
  let targetLease: HostElementLease | null = null;
  let dead = false;
  const observer = view?.MutationObserver
    ? new view.MutationObserver((changes) => {
        if (changes.some((change) => !tip.contains(change.target))) refresh();
      })
    : null;

  const hide = (): void => {
    observer?.disconnect();
    target = null;
    targetLease?.dispose();
    targetLease = null;
    tip.remove();
  };
  const refresh = (): void => {
    if (dead || !target) return;
    const label = target.getAttribute('data-nabi-tip');
    const style = view?.getComputedStyle(target);
    const box = target.getBoundingClientRect();
    if (
      !root.isConnected ||
      !root.contains(target) ||
      !label ||
      target.closest('[hidden], [inert]') ||
      target.getAttribute('aria-expanded') === 'true' ||
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      box.width <= 0 ||
      box.height <= 0
    ) {
      hide();
      return;
    }
    const theme = view?.getComputedStyle(root);
    for (const name of ['--nabi-fg', '--nabi-bg']) {
      const value = theme?.getPropertyValue(name).trim();
      if (value) tip.style.setProperty(name, value);
      else tip.style.removeProperty(name);
    }
    tip.style.fontFamily = theme?.fontFamily ?? '';
    tip.style.direction = style?.direction || theme?.direction || 'ltr';
    const layer = Number.parseInt(theme?.getPropertyValue('--nabi-z-dialog') ?? '', 10);
    tip.style.zIndex = String((Number.isFinite(layer) ? layer : Z_DIALOG) + 1);
    tip.textContent = label;
    const width = visual?.width ?? view?.innerWidth ?? owner.documentElement.clientWidth;
    const height = visual?.height ?? view?.innerHeight ?? owner.documentElement.clientHeight;
    const left = visual?.offsetLeft ?? 0;
    const top = visual?.offsetTop ?? 0;
    const edge = 8;
    const gap = 6;
    tip.style.maxWidth = `${Math.max(0, width - edge * 2)}px`;
    tip.style.maxHeight = `${Math.max(0, height - edge * 2)}px`;
    tip.style.left = '0px';
    tip.style.top = '0px';
    if (!tip.isConnected) owner.body.append(tip);
    const origin = tip.getBoundingClientRect();
    const anchorLeft = box.left - origin.left;
    const anchorTop = box.top - origin.top;
    const anchorBottom = box.bottom - origin.top;
    const x = anchorLeft + (box.width - origin.width) / 2;
    const below = anchorBottom + gap;
    const above = anchorTop - gap - origin.height;
    const y = below + origin.height <= top + height - edge || above < top + edge ? below : above;
    tip.style.left = `${Math.min(Math.max(x, left + edge), Math.max(left + edge, left + width - edge - origin.width))}px`;
    tip.style.top = `${Math.min(Math.max(y, top + edge), Math.max(top + edge, top + height - edge - origin.height))}px`;
  };
  const over = (event: Event): void => {
    if (dead || (event as PointerEvent).pointerType === 'touch') return;
    const node = event.target as Element | null;
    const next = node?.nodeType === 1 ? node.closest<HTMLElement>('[data-nabi-tip]') : null;
    if (!next || !root.contains(next)) return;
    if (target === next) return;
    hide();
    target = next;
    targetLease = new HostElementLease(next);
    targetLease.attribute('title', '');
    targetLease.attribute('data-nabi-tooltip-active', 'true');
    const described = next.getAttribute('aria-describedby');
    targetLease.attribute('aria-describedby', described ? `${described} ${tip.id}` : tip.id);
    refresh();
    if (target)
      observer?.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-nabi-tip', 'hidden', 'inert', 'aria-expanded', 'class', 'style'],
      });
  };
  const out = (event: Event): void => {
    if ((event as PointerEvent).pointerType === 'touch') return;
    const next = (event as PointerEvent).relatedTarget as Node | null;
    if (target && (!next || typeof next.nodeType !== 'number' || !target.contains(next))) hide();
  };
  const key = (event: Event): void => {
    if ((event as KeyboardEvent).key === 'Escape') hide();
  };
  const unmount = (): void => {
    if (dead) return;
    dead = true;
    hide();
    rootLease.dispose();
    root.removeEventListener('pointerover', over);
    root.removeEventListener('pointerout', out);
    owner.removeEventListener('pointerdown', hide, true);
    owner.removeEventListener('keydown', key, true);
    owner.removeEventListener('scroll', hide, true);
    view?.removeEventListener('resize', hide);
    view?.removeEventListener('blur', hide);
    visual?.removeEventListener('resize', hide);
    visual?.removeEventListener('scroll', hide);
  };
  try {
    rootLease.attribute('data-nabi-tooltips', 'true');
    root.addEventListener('pointerover', over);
    root.addEventListener('pointerout', out);
    owner.addEventListener('pointerdown', hide, true);
    owner.addEventListener('keydown', key, true);
    owner.addEventListener('scroll', hide, true);
    view?.addEventListener('resize', hide);
    view?.addEventListener('blur', hide);
    visual?.addEventListener('resize', hide);
    visual?.addEventListener('scroll', hide);
    return { refresh, hide, unmount };
  } catch (error) {
    unmount();
    throw error;
  }
}
