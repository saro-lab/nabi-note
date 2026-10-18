import { defaultWings, type ElementNode } from '../src/index.js';
import { mountMerge, type MergeMount, type MergeResult } from '../src/merge/index.js';

const el = (id: string): HTMLElement => document.getElementById(id)!;
const p = (text: string): ElementNode => ({ w: 'p', ch: [text] });
const base = [
  { w: 'p', a: { h: 2 }, ch: ['함께 떠나는 주말 여행'] },
  p('출발 시간은 오전 9시입니다.'),
  p('출발 장소를 미리 확인해 주세요.'),
  p('준비물은 모자와 물입니다.'),
  p('점심 식사 뒤에는 잠시 쉽니다.'),
  p('오후에는 공원을 둘러봅니다.'),
  p('마지막 일정을 확인해 주세요.'),
  p('모임 장소는 역 앞입니다.'),
];
const local = base.map((node, at) => {
  if (at === 1) return p('출발 시간은 오전 10시입니다.');
  if (at === 3) return p('준비물은 모자, 물, 우산입니다.');
  if (at === 7) return p('모임 장소는 도서관 앞입니다.');
  return node;
});
const incoming = base.map((node, at) => {
  if (at === 1) return p('출발 시간은 오전 11시입니다.');
  if (at === 5) return p('오후에는 미술관을 둘러봅니다.');
  if (at === 7) return p('모임 장소는 카페 앞입니다.');
  return node;
});

let current: MergeMount;
let lastResult: MergeResult | null = null;
let offChange = () => {};

function reset(scenario: 'conflicts' | 'automatic' = 'conflicts'): void {
  offChange();
  current?.unmount();
  lastResult = null;
  el('confirmed').hidden = true;
  const choose = el('scenario') as HTMLSelectElement;
  choose.value = scenario;
  current = mountMerge({
    root: el('merge-host'),
    base,
    local: scenario === 'automatic' ? base.map((node, at) => (at === 3 ? local[at]! : node)) : local,
    incoming: scenario === 'automatic' ? base.map((node, at) => (at === 5 ? incoming[at]! : node)) : incoming,
    wings: defaultWings,
    locale: 'ko',
    incomingVersion: 'weekend-2',
    editorOptions: { typingMergeMs: 0 },
    onConfirm(result) {
      lastResult = result;
      el('confirmed-html').innerHTML = result.html;
      el('confirmed-json').textContent = JSON.stringify(result.json, null, 2);
      el('confirmed').hidden = false;
    },
  });
  const state = (): void => {
    const value = current.session.getState();
    el('demo-state').textContent = value.unresolvedCount
      ? `남은 충돌 ${value.unresolvedCount}`
      : '모든 충돌을 해결했습니다.';
  };
  offChange = current.session.onChange(state);
  state();
}

el('scenario').addEventListener('change', () =>
  reset((el('scenario') as HTMLSelectElement).value as 'conflicts' | 'automatic'),
);
el('reset').addEventListener('click', () =>
  reset((el('scenario') as HTMLSelectElement).value as 'conflicts' | 'automatic'),
);
el('undo').addEventListener('click', () => current.nabi.undo());
el('redo').addEventListener('click', () => current.nabi.redo());
Object.assign(globalThis, {
  mergeDemo: {
    get current() {
      return current;
    },
    get lastResult() {
      return lastResult;
    },
    reset,
  },
});
reset();
