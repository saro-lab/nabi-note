import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountTooltip } from '../src/ui/parts/tooltip.js';

const dom = new JSDOM(
  `<!doctype html><span id="nabi-tooltip-1"></span>
  <div id="root" data-nabi-tooltips="host" style="--nabi-fg: #123456; --nabi-bg: #abcdef; --nabi-z-dialog: 900; font-family: serif; direction: rtl">
    <div style="overflow:hidden"><button id="button" data-nabi-tip="Bold (Ctrl+B)" title="Native" aria-describedby="existing"><span>Icon</span></button></div>
    <button id="swatch" class="nabi-swatch" data-nabi-tip="Red"></button>
  </div><div id="second"><button data-nabi-tip="Second"></button></div>`,
  { pretendToBeVisual: true },
);
const owner = dom.window.document;
const root = owner.getElementById('root')!;
const button = owner.getElementById('button')!;
const swatch = owner.getElementById('swatch')!;
const second = owner.getElementById('second')!;
const bounds = (left: number, top: number, width: number, height: number): DOMRect =>
  ({ x: left, y: top, left, top, right: left + width, bottom: top + height, width, height }) as DOMRect;
let anchor = bounds(90, 110, 32, 32);
let origin = { left: 0, top: 0 };
for (const el of [button, swatch, second.firstElementChild!]) el.getBoundingClientRect = () => anchor;
const originalBox = dom.window.HTMLElement.prototype.getBoundingClientRect;
dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
  return this.classList.contains('nabi-tooltip')
    ? bounds(Number.parseFloat(this.style.left) + origin.left, Number.parseFloat(this.style.top) + origin.top, 100, 24)
    : originalBox.call(this);
};
Object.defineProperty(dom.window, 'innerWidth', { configurable: true, value: 180 });
Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 160 });
const pointer = (
  target: Element,
  name = 'pointerover',
  relatedTarget: EventTarget | null = null,
  pointerType = 'mouse',
): void => {
  const event = new dom.window.MouseEvent(name, { bubbles: true, relatedTarget });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
};
const tooltip = (): HTMLElement | null => owner.querySelector('.nabi-tooltip');
const mounted = mountTooltip(root);
pointer(button);
let visible = tooltip()!;
assert.equal(visible.parentElement, owner.body, 'the tooltip escapes clipping ancestors');
assert.equal(visible.getAttribute('role'), 'tooltip');
assert.equal(visible.textContent, 'Bold (Ctrl+B)');
assert.notEqual(visible.id, 'nabi-tooltip-1', 'ids do not collide with existing page content');
assert.equal(button.getAttribute('title'), '', 'native title is suppressed while hovering');
assert.equal(button.getAttribute('aria-describedby'), `existing ${visible.id}`);
assert.equal(visible.style.getPropertyValue('--nabi-fg'), '#123456');
assert.equal(visible.style.getPropertyValue('--nabi-bg'), '#abcdef');
assert.equal(visible.style.fontFamily, 'serif');
assert.equal(visible.style.direction, 'rtl');
assert.equal(visible.style.zIndex, '901');
assert.equal(visible.style.top, '80px', 'a bottom-edge button flips the tooltip above itself');
assert.equal(visible.style.left, '56px');
pointer(button, 'pointerout', button.firstElementChild);
assert.equal(tooltip(), visible, 'crossing children inside the same button keeps the tooltip');
button.setAttribute('data-nabi-tip', 'Localized label');
await Promise.resolve();
assert.equal(tooltip()?.textContent, 'Localized label');
button.setAttribute('hidden', '');
await Promise.resolve();
assert.equal(tooltip(), null, 'hiding a hovered command removes its tooltip');
assert.equal(button.getAttribute('title'), 'Native');
assert.equal(button.getAttribute('aria-describedby'), 'existing');
button.removeAttribute('hidden');
pointer(swatch);
assert.equal(tooltip()?.textContent, 'Red', 'color swatches use the same unclipped tooltip');
pointer(swatch, 'pointerout');
assert.equal(tooltip(), null);
pointer(button, 'pointerover', null, 'touch');
assert.equal(tooltip(), null, 'touch interactions do not create persistent hover labels');
button.setAttribute('aria-expanded', 'true');
pointer(button);
assert.equal(tooltip(), null, 'an open panel does not retain its trigger tooltip');
button.removeAttribute('aria-expanded');
anchor = bounds(170, 0, 32, 32);
pointer(button);
assert.equal(tooltip()?.style.left, '72px', 'right-edge labels stay within the viewport');
assert.equal(tooltip()?.style.top, '38px');
owner.dispatchEvent(new dom.window.Event('scroll'));
assert.equal(tooltip(), null);
for (const [host, event] of [
  [owner, new dom.window.Event('pointerdown')],
  [owner, new dom.window.KeyboardEvent('keydown', { key: 'Escape' })],
  [dom.window, new dom.window.Event('resize')],
] as const) {
  pointer(button);
  assert.ok(tooltip());
  host.dispatchEvent(event);
  assert.equal(tooltip(), null);
}
pointer(button);
button.setAttribute('title', 'Host changed title');
button.setAttribute('aria-describedby', 'host-replaced-description');
mounted.hide();
assert.equal(button.getAttribute('title'), 'Host changed title');
assert.equal(button.getAttribute('aria-describedby'), 'host-replaced-description');
pointer(button);
button.remove();
await Promise.resolve();
assert.equal(tooltip(), null, 'replacing a palette button clears its detached tooltip');
root.append(button);

const viewport = new dom.window.EventTarget();
Object.assign(viewport, { width: 180, height: 160, offsetLeft: 30, offsetTop: 100 });
Object.defineProperty(dom.window, 'visualViewport', { configurable: true, value: viewport });
const shifted = mountTooltip(second);
origin = { left: -30, top: -100 };
anchor = bounds(160, 110, 32, 32);
pointer(second.firstElementChild!);
visible = tooltip()!;
assert.equal(visible.style.left, '102px', 'visual viewport offset is converted to fixed coordinates');
assert.equal(visible.style.top, '180px');
viewport.dispatchEvent(new dom.window.Event('scroll'));
assert.equal(tooltip(), null);
shifted.unmount();
origin = { left: 0, top: 0 };
pointer(button);
assert.ok(tooltip());
mounted.unmount();
mounted.unmount();
assert.equal(tooltip(), null);
assert.equal(root.getAttribute('data-nabi-tooltips'), 'host');
assert.equal(button.getAttribute('title'), 'Host changed title');
assert.equal(button.getAttribute('aria-describedby'), 'host-replaced-description');
assert.equal(button.hasAttribute('data-nabi-tooltip-active'), false);
pointer(button);
mounted.refresh();
assert.equal(tooltip(), null, 'unmount removes delegated listeners and leaves refresh inert');
const add = owner.addEventListener;
owner.addEventListener = () => {
  throw new Error('listener registration failed');
};
assert.throws(() => mountTooltip(root), /listener registration failed/);
owner.addEventListener = add;
assert.equal(root.getAttribute('data-nabi-tooltips'), 'host', 'failed mounting restores the host marker');
pointer(button);
assert.equal(tooltip(), null, 'failed mounting releases listeners that were already registered');
dom.window.close();
console.log('tooltip lifecycle, clipping, viewport and label regressions passed');
