import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { caretAt, type Selection } from '../src/caret/index.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/index.js';
import { mountSurface } from '../src/surface/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';

const p = (ch: readonly NabiNode[] = []): ElementNode => ({ w: 'p', ch });
const image = (): ElementNode => p([{ w: 'img', a: { src: 'https://example.com/image.png' }, ch: [] }]);
const at = (index: number, offset: number) => ({ path: [index], offset });
const selected = (index: number): Selection => ({ anchor: at(index, 0), focus: at(index, 1) });

function stand(doc: NabiDoc) {
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, { doc });
  const surface = mountSurface({ nabi, registry, root });
  const input = (forward: boolean, live: Selection, target: Selection): void => {
    surface.port.writeCaret(target);
    const range = dom.window.document.getSelection()!.getRangeAt(0).cloneRange();
    surface.port.writeCaret(live);
    assert.deepEqual(surface.port.readCaret()?.selection, live);
    const event = new dom.window.InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: forward ? 'deleteContentForward' : 'deleteContentBackward',
    });
    Object.defineProperty(event, 'getTargetRanges', { value: () => [range] });
    root.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };
  const key = (forward: boolean, live: Selection): void => {
    surface.port.writeCaret(live);
    const event = new dom.window.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: forward ? 'Delete' : 'Backspace',
    });
    root.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };
  const close = (): void => {
    surface.unmount();
    dom.window.close();
  };
  return { nabi, input, key, close };
}

for (const [name, node, length] of [
  ['footnote', { w: 'fn', a: { t: 'note' }, ch: [] }, 1],
  ['attachment', { w: 'a', a: { href: '/file.txt', file: 'txt' }, ch: ['fi', { w: 'b', ch: ['le'] }] }, 4],
] as const) {
  for (const forward of [true, false]) {
    const doc = [p(['a', node, 'z'])];
    const live = caretAt(at(0, forward ? 1 : 1 + length));
    const span = { anchor: at(0, 1), focus: at(0, 1 + length) };
    const target = {
      anchor: at(0, forward ? 1 : length),
      focus: at(0, forward ? 2 : length + 1),
    };
    {
      const stood = stand(doc);
      stood.input(forward, live, target);
      assert.deepEqual(stood.nabi.getJson(), doc, `${name}: a mobile target preserves the inline object`);
      assert.deepEqual(stood.nabi.getSelection(), span, `${name}: mobile deletion first selects the full object`);
      stood.input(forward, span, span);
      assert.deepEqual(stood.nabi.getJson(), [p(['az'])], `${name}: the second mobile input deletes the selection`);
      stood.close();
    }
    {
      const stood = stand(doc);
      stood.key(forward, live);
      assert.deepEqual(stood.nabi.getJson(), doc, `${name}: keyboard deletion uses the latest DOM caret`);
      assert.deepEqual(stood.nabi.getSelection(), span);
      stood.key(forward, span);
      assert.deepEqual(stood.nabi.getJson(), [p(['az'])], `${name}: the second key deletes the selection`);
      stood.close();
    }
  }
}

for (const forward of [true, false]) {
  {
    const doc = [p(['head']), image(), p(['tail'])];
    const stood = stand(doc);
    const live = caretAt(forward ? at(0, 4) : at(2, 0));
    stood.input(forward, live, selected(1));
    assert.deepEqual(stood.nabi.getJson(), doc, 'a browser object target preserves the adjacent image');
    assert.deepEqual(stood.nabi.getSelection(), selected(1), 'the first input selects the image');
    stood.input(forward, selected(1), selected(1));
    assert.deepEqual(stood.nabi.getJson(), [p(['head']), p(['tail'])], 'an actual selected image is deleted');
    stood.close();
  }

  {
    const stood = stand(forward ? [p(), image()] : [image(), p()]);
    stood.input(forward, caretAt(at(forward ? 0 : 1, 0)), selected(forward ? 1 : 0));
    assert.deepEqual(
      stood.nabi.getJson(),
      [image()],
      'empty-paragraph removal takes priority over the browser image target',
    );
    assert.deepEqual(stood.nabi.getSelection(), selected(0));
    stood.close();
  }

  {
    const doc = [p(['head']), image(), p(['tail'])];
    const stood = stand(doc);
    stood.input(forward, caretAt(at(1, forward ? 0 : 1)), selected(1));
    assert.deepEqual(stood.nabi.getJson(), doc, 'a collapsed wrapper caret is not an explicit object selection');
    assert.deepEqual(stood.nabi.getSelection(), selected(1));
    stood.close();
  }

  {
    const doc = [p(['head']), image(), p(['tail'])];
    const stood = stand(doc);
    const live = caretAt(forward ? at(0, 4) : at(2, 0));
    const target = forward ? { anchor: at(0, 4), focus: at(1, 1) } : { anchor: at(1, 0), focus: at(2, 0) };
    stood.input(forward, live, target);
    assert.deepEqual(stood.nabi.getJson(), doc, 'a cross-paragraph browser target preserves the adjacent image');
    assert.deepEqual(stood.nabi.getSelection(), selected(1));
    stood.close();
  }

  {
    const stood = stand([p(['head']), image(), p(['tail'])]);
    const range = { anchor: at(0, 2), focus: at(1, 1) };
    stood.input(forward, range, range);
    assert.deepEqual(stood.nabi.getJson(), [p(['hetail'])], 'an explicit range still removes its image and text');
    stood.close();
  }
}

{
  const stood = stand([p(['abc'])]);
  stood.input(false, caretAt(at(0, 1)), { anchor: at(0, 1), focus: at(0, 2) });
  assert.deepEqual(stood.nabi.getJson(), [p(['ac'])], 'ordinary text deletion still follows the browser target range');
  stood.close();
}

console.log('mount-delete-boundary: passed');
