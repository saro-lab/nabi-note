import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountViewTools, renderViewToolsHtml } from '../src/index.js';
import { iconHtml, iconToken } from '../src/style/icon.js';
import { done, eq, ok } from './net.js';

for (const showPreview of [true, false]) {
  for (const showFullscreen of [true, false]) {
    const dom = new JSDOM('<div class="nabi"><div id="tools"></div><div id="surface"></div></div>');
    const owner = dom.window.document;
    const root = owner.querySelector<HTMLElement>('.nabi')!;
    const container = owner.querySelector<HTMLElement>('#tools')!;
    const surface = owner.querySelector<HTMLElement>('#surface')!;
    const { nabi } = createNabiWith(defaultWings);
    const options = { showPreview, showFullscreen, locale: 'ko' };
    container.innerHTML = renderViewToolsHtml(options);
    const original = [...container.querySelectorAll('button')];
    const names = [...(showPreview ? ['preview'] : []), ...(showFullscreen ? ['fullscreen'] : [])];
    const view = mountViewTools({ ...options, nabi, root, surface, container });
    eq(
      `visibility ${names}: correct controls`,
      view.buttons.map((button) => button.dataset['name']),
      names,
    );
    ok(
      `visibility ${names}: SSR nodes reused`,
      view.buttons.every((button, at) => button === original[at]),
    );
    if (!names.length) eq('both hidden: no empty tools', container.innerHTML, '');
    const full = view.buttons.find((button) => button.dataset['name'] === 'fullscreen');
    if (full) {
      full.click();
      ok('fullscreen enters', root.classList.contains('is-fullscreen'));
      eq(
        'fullscreen exit icon',
        full.querySelector('[data-nabi-icon]')?.getAttribute('data-nabi-icon'),
        'view-fullscreen-exit',
      );
      surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      ok('fullscreen Escape exits', !root.classList.contains('is-fullscreen'));
    }
    view.unmount();
    view.unmount();
    eq('unmount removes controls', container.children.length, 0);
    dom.window.close();
  }
}

{
  const dom = new JSDOM('<div><div id="tools"></div><div id="surface"></div></div>');
  const owner = dom.window.document;
  const container = owner.querySelector<HTMLElement>('#tools')!;
  container.innerHTML = renderViewToolsHtml();
  const { nabi } = createNabiWith(defaultWings);
  const view = mountViewTools({
    nabi,
    container,
    root: container.parentElement!,
    surface: owner.querySelector<HTMLElement>('#surface')!,
    showPreview: false,
  });
  eq(
    'mismatched SSR discards hidden preview',
    [...container.querySelectorAll('button')].map((button) => button.dataset['name']),
    ['fullscreen'],
  );
  view.unmount();
  dom.window.close();
}

{
  const html = iconHtml('toolbar-custom:star"', undefined, '<path d="M0 0"/>');
  const dom = new JSDOM(html);
  const icon = dom.window.document.querySelector('[data-nabi-icon]')!;
  eq('custom key survives escaping', icon.getAttribute('data-nabi-icon'), 'toolbar-custom:star"');
  eq('custom CSS token is deterministic', iconToken('toolbar-custom:star'), 'toolbar-custom_3a_star');
  eq('legacy SVG keeps inherited color', icon.querySelector('svg')?.getAttribute('stroke'), 'currentColor');
  eq('icon is decorative', icon.getAttribute('aria-hidden'), 'true');
  dom.window.close();
}

done('아이콘 테마와 보기 도구 표시');
