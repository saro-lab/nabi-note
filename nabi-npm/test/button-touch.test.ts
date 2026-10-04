import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { wireIconButton } from '../src/ui/parts/button.js';

function fixture(ios = true) {
  const dom = new JSDOM('<!doctype html><button type="button">Bold</button>', { pretendToBeVisual: true });
  const owner = dom.window.document;
  const button = owner.querySelector('button')!;
  Object.defineProperties(dom.window.navigator, {
    userAgent: {
      value: ios
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/132.0 Mobile Safari/537.36',
    },
    platform: { value: ios ? 'iPhone' : 'Linux armv8l' },
    maxTouchPoints: { value: 1 },
  });
  button.getBoundingClientRect = () => new dom.window.DOMRect(0, 0, 32, 32);
  owner.elementFromPoint = (x: number, y: number) => (x >= 0 && x <= 32 && y >= 0 && y <= 32 ? button : owner.body);
  let time = 100;
  Object.defineProperty(dom.window.performance, 'now', { value: () => time });
  const hands: string[] = [];
  const release = wireIconButton(button, (hand) => hands.push(hand));
  const point = (x = 10, y = 10, identifier = 1): Touch => ({
    identifier,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
    target: button,
  });
  const touch = (
    type: string,
    options: { x?: number; y?: number; identifiers?: readonly number[]; cancelable?: boolean } = {},
  ): Event => {
    const points = (options.identifiers ?? [1]).map((id) => point(options.x, options.y, id));
    const event = new dom.window.Event(type, { bubbles: true, cancelable: options.cancelable ?? true });
    Object.defineProperties(event, {
      touches: { value: type === 'touchend' || type === 'touchcancel' ? [] : points },
      targetTouches: { value: type === 'touchend' || type === 'touchcancel' ? [] : points },
      changedTouches: { value: points },
      timeStamp: { value: time },
    });
    button.dispatchEvent(event);
    return event;
  };
  return {
    dom,
    owner,
    button,
    hands,
    release,
    touch,
    advance(ms: number) {
      time += ms;
    },
    dispose() {
      release();
      dom.window.close();
    },
  };
}

{
  const f = fixture();
  f.touch('touchstart');
  assert.equal(f.hands.length, 0, 'touchstart alone does not run a command');
  const end = f.touch('touchend');
  assert.deepEqual(f.hands, ['pointer'], 'a completed iOS tap works without a compatibility click');
  assert.equal(end.defaultPrevented, true, 'the browser must suppress its later compatibility mouse events');
  f.touch('touchend');
  assert.deepEqual(f.hands, ['pointer'], 'a completed touch cannot run twice');
  f.button.click();
  assert.deepEqual(f.hands, ['pointer', 'keyboard'], 'a following keyboard activation remains independent');
  f.dispose();
}

for (const interruption of [
  'move',
  'cancel',
  'multitouch',
  'second-finger',
  'long-press',
  'outside',
  'disabled',
  'not-cancelable',
] as const) {
  const f = fixture();
  f.touch('touchstart', interruption === 'multitouch' ? { identifiers: [1, 2] } : {});
  if (interruption === 'move') {
    f.touch('touchmove', { x: 24 });
    f.touch('touchmove', { x: 10 });
  }
  if (interruption === 'cancel') f.touch('touchcancel');
  if (interruption === 'second-finger') f.touch('touchstart', { identifiers: [1, 2] });
  if (interruption === 'long-press') f.advance(501);
  if (interruption === 'disabled') f.button.disabled = true;
  const end = f.touch('touchend', {
    ...(interruption === 'outside' ? { x: 50 } : {}),
    cancelable: interruption !== 'not-cancelable',
  });
  assert.deepEqual(f.hands, [], `${interruption} cannot activate the button through touchend`);
  assert.equal(end.defaultPrevented, false, `${interruption} leaves the touch gesture to the browser`);
  f.dispose();
}

{
  const f = fixture();
  f.touch('touchstart');
  f.release();
  f.touch('touchend');
  f.button.click();
  assert.deepEqual(f.hands, [], 'unmount clears an in-flight touch and every activation listener');
  f.dispose();
}

{
  const f = fixture(false);
  f.touch('touchstart');
  const end = f.touch('touchend');
  assert.equal(end.defaultPrevented, false, 'Android keeps its native click path');
  assert.deepEqual(f.hands, []);
  f.button.dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
  f.button.click();
  assert.deepEqual(f.hands, ['pointer', 'keyboard']);
  f.dispose();
}

console.log('iOS button taps: one activation, gesture cancellation, cleanup and native click paths passed');
