import { DisposerStack } from '../../lifecycle.js';
import { NARROW_REM } from '../narrow.js';
import { make } from './dom.js';
import { openPanel, type Panel, type PanelOptions } from './panel.js';
import { openScrim } from './scrim.js';

export function openToolbarPanelFrame(owner: Document, options: PanelOptions, mode: 'modal' | 'inline'): Panel {
  if (mode !== 'modal' && mode !== 'inline') throw new TypeError('Unknown toolbar panel mode');
  const life = new DisposerStack();
  const view = owner.defaultView;
  const visual = view?.visualViewport;
  const source = options.anchor.closest<HTMLElement>('.nabi') ?? options.anchor.parentElement ?? owner.body;
  const probe = make(owner, 'span', '', { 'aria-hidden': 'true' });
  probe.style.cssText = `position:absolute;width:var(--nabi-mobile-breakpoint,${NARROW_REM}rem);height:0;visibility:hidden;pointer-events:none`;
  let panel: Panel | undefined;
  let closed = false;
  const finish = (): void => {
    if (closed) return;
    closed = true;
    life.dispose();
    options.onClose?.();
  };
  const narrow = (): boolean => {
    const measured = parseFloat(view?.getComputedStyle(probe).width ?? '');
    const unit = parseFloat(view?.getComputedStyle(owner.documentElement).fontSize ?? '') || 16;
    const threshold = Number.isFinite(measured) ? measured : NARROW_REM * unit;
    return (owner.documentElement.clientWidth || view?.innerWidth || 1024) < threshold;
  };
  try {
    life.add(() => probe.remove());
    source.append(probe);
    const mobile = narrow();
    const refresh = (): void => {
      if (closed) return;
      if (mode === 'inline' && narrow() !== mobile) panel?.close();
      else panel?.reposition();
    };
    view?.addEventListener('resize', refresh);
    life.add(() => view?.removeEventListener('resize', refresh));
    if (view?.ResizeObserver) {
      const observer = new view.ResizeObserver(refresh);
      life.add(() => observer.disconnect());
      observer.observe(probe);
    }
    if (mode === 'inline' && !mobile) {
      panel = openPanel(owner, {
        ...options,
        className: `${options.className ?? ''} nabi-custom-panel-inline`,
        onClose: finish,
      });
    } else {
      const root = make(owner, 'div', `nabi-card ${options.className ?? ''} nabi-custom-panel-modal`);
      const expanded = options.anchor.getAttribute('aria-expanded');
      life.add(() => {
        if (expanded === null) options.anchor.removeAttribute('aria-expanded');
        else options.anchor.setAttribute('aria-expanded', expanded);
      });
      options.anchor.setAttribute('aria-expanded', 'true');
      const scrim = openScrim(owner, {
        card: root,
        restore: options.restore ?? options.anchor,
        className: `nabi-custom-scrim${mode === 'inline' ? ' nabi-custom-fullscreen' : ''}`,
        initialFocus: false,
        onClose: finish,
      });
      const reposition = (): void => {
        if (!visual || closed) return;
        scrim.root.style.inset = 'auto';
        scrim.root.style.left = `${visual.offsetLeft}px`;
        scrim.root.style.top = `${visual.offsetTop}px`;
        scrim.root.style.width = `${visual.width}px`;
        scrim.root.style.height = `${visual.height}px`;
      };
      panel = { root, close: scrim.close, reposition };
      for (const event of ['resize', 'scroll']) {
        visual?.addEventListener(event, reposition);
        life.add(() => visual?.removeEventListener(event, reposition));
      }
      reposition();
    }
    return panel;
  } catch (error) {
    panel?.close();
    finish();
    throw error;
  }
}
