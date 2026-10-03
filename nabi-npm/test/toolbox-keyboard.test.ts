import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountHints } from '../src/ui/hints.js';
import {
  mountToolboxKeyboard,
  registerToolbox,
  toolboxFor,
  type ToolboxBridge,
} from '../src/ui/parts/toolbox-keyboard.js';

const dom = new JSDOM(
  `<!doctype html><div id="palette">
  <div class="nabi-toolbox-group"><button id="a">A</button><button id="b">B</button><button hidden>Hidden</button></div>
  <div class="nabi-toolbox-group"><button disabled>Disabled</button><button id="c">C</button><button id="d">D</button></div>
  <div class="nabi-ctx-group"><button id="e">E</button><button id="f">F</button></div>
  <div hidden class="nabi-toolbox-group"><button>Hidden group</button></div>
  <input id="input"><select id="select"><option>One</option></select><textarea id="text"></textarea>
  <div id="editable" contenteditable="true" tabindex="0">Value</div>
</div><div id="surface" contenteditable="true" tabindex="0">Text</div><button id="outside">Outside</button>`,
  {
    pretendToBeVisual: true,
  },
);
const owner = dom.window.document;
const el = (id: string): HTMLElement => owner.getElementById(id)!;
const palette = el('palette');
const geometry: Record<string, [number, number]> = {
  a: [0, 0],
  b: [60, 0],
  c: [10, 48],
  d: [100, 48],
  e: [0, 96],
  f: [65, 96],
};
for (const [id, [left, top]] of Object.entries(geometry))
  el(id).getBoundingClientRect = () =>
    ({ left, top, right: left + 44, bottom: top + 44, width: 44, height: 44 }) as DOMRect;
const key = (target: HTMLElement, name: string, options: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new dom.window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
};
const step = (name: string, expected: string, options: KeyboardEventInit = {}): void => {
  assert.equal(key(owner.activeElement as HTMLElement, name, options).defaultPrevented, true);
  assert.equal(owner.activeElement?.id, expected);
};
const keyboard = mountToolboxKeyboard(palette);
assert.equal(keyboard.focusFirst(), true);
assert.equal(owner.activeElement, el('a'));
step('Tab', 'c');
step('Tab', 'e');
step('Tab', 'a');
step('Tab', 'e', { shiftKey: true });
step('ArrowRight', 'f');
step('ArrowRight', 'a');
step('ArrowLeft', 'f');
el('b').focus();
step('ArrowDown', 'd');
step('ArrowDown', 'f');
step('ArrowDown', 'b');
step('ArrowUp', 'f');
palette.style.direction = 'rtl';
el('a').focus();
step('ArrowRight', 'f');
step('ArrowLeft', 'a');
palette.style.direction = 'ltr';
for (const options of [
  { isComposing: true },
  { keyCode: 229 },
  { ctrlKey: true },
  { metaKey: true },
  { altKey: true },
  { shiftKey: true },
]) {
  el('a').focus();
  assert.equal(key(el('a'), 'ArrowRight', options).defaultPrevented, false);
  assert.equal(owner.activeElement, el('a'));
}
for (const id of ['input', 'select', 'text', 'editable']) {
  el(id).focus();
  assert.equal(key(el(id), 'Tab').defaultPrevented, false);
  assert.equal(key(el(id), 'ArrowDown').defaultPrevented, false);
  for (const name of ['b', 'Backspace', 'Delete']) assert.equal(key(el(id), name).defaultPrevented, false);
  assert.equal(owner.activeElement, el(id));
}
el('a').focus();
for (const name of ['Enter', ' ']) assert.equal(key(el('a'), name).defaultPrevented, false);
for (const name of ['b', 'B', 'q', 'Backspace', 'Delete']) {
  assert.equal(key(el('a'), name).defaultPrevented, true);
  assert.equal(key(el('a'), name, { shiftKey: true }).defaultPrevented, true);
  for (const options of [
    { isComposing: true },
    { keyCode: 229 },
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
  ])
    assert.equal(key(el('a'), name, options).defaultPrevented, false);
}
const stop = (event: Event): void => event.preventDefault();
el('a').addEventListener('keydown', stop);
key(el('a'), 'ArrowDown');
assert.equal(owner.activeElement, el('a'), 'a grid or control retains its own keyboard handler');
el('a').removeEventListener('keydown', stop);
keyboard.unmount();
assert.equal(key(el('a'), 'Tab').defaultPrevented, false);
assert.equal(keyboard.focusFirst(), false);

let open = false;
let count = 0;
const restores: (boolean | undefined)[] = [];
const bridge: ToolboxBridge = {
  open() {
    open = true;
    count += 1;
    el('a').focus();
  },
  close(restore) {
    open = false;
    restores.push(restore);
    if (restore) el('surface').focus();
  },
  active: () => open,
};
const release = registerToolbox(palette, bridge);
const overlay = { ...bridge };
const releaseOverlay = registerToolbox(palette, overlay);
assert.equal(toolboxFor(palette), overlay);
releaseOverlay();
assert.equal(toolboxFor(palette), bridge);
const toolbar = { root: palette, buttons: [], refresh() {}, unmount() {} };
const hints = mountHints({ root: palette, surface: el('surface'), toolbar });
const twice = (target: HTMLElement, options: KeyboardEventInit = {}): void => {
  key(target, 'Shift', options);
  key(target, 'Shift', options);
};
for (const options of [
  { isComposing: true },
  { keyCode: 229 },
  { repeat: true },
  { ctrlKey: true },
  { metaKey: true },
  { altKey: true },
])
  twice(el('surface'), options);
twice(el('input'));
twice(el('editable'));
twice(el('outside'));
assert.equal(count, 0);
el('surface').focus();
twice(el('surface'));
assert.equal(hints.active(), true);
assert.equal(count, 1);
assert.equal(owner.activeElement, el('a'));
assert.equal(palette.classList.contains('nabi-hinting'), false);
assert.equal(key(el('a'), 'q', { code: 'KeyQ' }).defaultPrevented, false);
assert.equal(hints.active(), true, 'typing a former hint letter does not execute or close the palette');
hints.hide();
assert.equal(hints.active(), false);
assert.equal(restores.at(-1), true);
assert.equal(owner.activeElement, el('surface'));
bridge.open();
assert.equal(hints.active(), true, 'pointer-opened toolbox state is visible through the preserved API');
el('outside').focus();
assert.equal(hints.active(), false);
assert.equal(restores.at(-1), false);
assert.equal(owner.activeElement, el('outside'));
twice(el('surface'));
el('input').focus();
key(el('input'), 'x');
assert.equal(hints.active(), true, 'typing inside a hosted input does not close its toolbox');
hints.unmount();
assert.equal(restores.at(-1), false);
assert.equal(hints.active(), false);
release();
assert.equal(toolboxFor(palette), undefined);

const fallback = mountHints({ root: palette, surface: el('surface'), toolbar });
el('surface').focus();
twice(el('surface'));
assert.equal(fallback.active(), true);
assert.equal(owner.activeElement, el('a'));
step('Tab', 'c');
key(el('c'), 'Escape');
assert.equal(fallback.active(), false);
assert.equal(owner.activeElement, el('surface'));
fallback.unmount();
dom.window.close();
console.log('toolbox keyboard: grouped Tab, geometric arrows, wrap, bridge, IME and focus ownership passed');
