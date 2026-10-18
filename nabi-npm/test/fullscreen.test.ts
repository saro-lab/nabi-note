import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, mountViewTools, setFullscreen } from '../src/index.js';

{
  const dom = new JSDOM(
    '<main lang="ko" style="--nabi-font:serif"><i></i><div id="editor"><div contenteditable="true" tabindex="0">abcdef</div></div><b></b></main>',
  );
  const owner = dom.window.document;
  const parent = owner.querySelector('main')!;
  const root = owner.getElementById('editor')!;
  const surface = root.firstElementChild as HTMLElement;
  const text = surface.firstChild!;
  surface.focus();
  owner.getSelection()!.setBaseAndExtent(text, 5, text, 1);
  setFullscreen(root, true);
  const host = root.parentElement!;
  assert.equal(host.parentElement, owner.body);
  assert.equal(host.style.getPropertyValue('--nabi-font'), 'serif');
  assert.equal(host.lang, 'ko');
  assert.equal(owner.activeElement, surface);
  assert.equal(owner.getSelection()!.anchorOffset, 5);
  assert.equal(owner.getSelection()!.focusOffset, 1);
  setFullscreen(root, true);
  assert.equal(owner.querySelectorAll('.nabi-fullscreen-host').length, 1);
  parent.style.setProperty('--nabi-font', 'monospace');
  parent.lang = 'en';
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  assert.equal(host.style.getPropertyValue('--nabi-font'), 'monospace');
  assert.equal(host.lang, 'en');
  setFullscreen(root, false);
  assert.equal(root.parentElement, parent);
  assert.equal(root.previousElementSibling!.tagName, 'I');
  assert.equal(root.nextElementSibling!.tagName, 'B');
  assert.equal(owner.activeElement, surface);
  assert.equal(owner.getSelection()!.toString(), 'bcde');
  assert.equal(owner.querySelector('.nabi-fullscreen-host'), null);
  assert.equal(parent.childNodes.length, 3);
  setFullscreen(root, false);
  dom.window.close();
}

{
  const dom = new JSDOM('<main><div id="editor"><div id="tools"></div><div id="surface"></div></div><b></b></main>');
  const owner = dom.window.document;
  const root = owner.getElementById('editor')!;
  const parent = root.parentElement!;
  const { nabi } = createNabiWith([]);
  const view = mountViewTools({
    nabi,
    root,
    container: owner.getElementById('tools')!,
    surface: owner.getElementById('surface')!,
  });
  view.buttons.find((button) => button.dataset['name'] === 'fullscreen')!.click();
  assert.equal(root.parentElement!.parentElement, owner.body);
  parent.remove();
  view.unmount();
  assert.equal(root.parentElement, parent);
  assert.equal(root.isConnected, false);
  assert.equal(root.classList.contains('is-fullscreen'), false);
  assert.equal(root.nextElementSibling!.tagName, 'B');
  assert.equal(owner.querySelector('.nabi-fullscreen-host'), null);
  view.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<main><div id="editor"><div id="tools"></div><div id="surface"></div></div></main>');
  const owner = dom.window.document;
  const root = owner.getElementById('editor')!;
  const parent = root.parentElement!;
  const { nabi } = createNabiWith([]);
  const view = mountViewTools({
    nabi,
    root,
    container: owner.getElementById('tools')!,
    surface: owner.getElementById('surface')!,
  });
  root.classList.add('is-fullscreen');
  view.unmount();
  assert.equal(root.classList.contains('is-fullscreen'), true);
  assert.equal(root.parentElement, parent);
  assert.equal(owner.querySelector('.nabi-fullscreen-host'), null);
  dom.window.close();
}

console.log('Fullscreen portal: passed');
