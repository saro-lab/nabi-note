import { JSDOM } from 'jsdom';
import { caretAt } from '../src/caret/index.js';
import { hostOf } from '../src/editor/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { bulletListWing, defaultWings, orderedListWing, taskListWing } from '../src/wings/index.js';
import { mountToolbar } from '../src/ui/index.js';
import { translate } from '../src/locale/index.js';
import { SAMPLE } from '../demo/sample.js';
import { done, eq, ok } from './net.js';

function pointerClick(w: 'tc' | 'hl'): { readonly armed: boolean; readonly toast: readonly string[] } {
  const dom = new JSDOM('<!doctype html><html><body><div id="toolbar"></div><div id="surface"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const said: string[] = [];
  const { nabi, registry } = createNabiWith(defaultWings, {
    doc: [{ w: 'p', ch: ['글'] }],
    locale: 'ko',
    toast: (level, message) => said.push(`${level}:${message}`),
  });
  nabi.select(caretAt({ path: [0], offset: 1 }));
  const toolbar = mountToolbar({
    nabi,
    registry,
    root: owner.getElementById('toolbar') as HTMLElement,
    surface,
  });
  const button = toolbar.buttons.find((candidate) => candidate.w === w);
  button?.el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, detail: 1 }));
  const answer = { armed: hostOf(nabi).armed.isArmed(w), toast: said };
  toolbar.unmount();
  dom.window.close();
  return answer;
}

const textColor = pointerClick('tc');
ok('글자색 상단 버튼 — 효과가 없는 접힌 캐럿의 포인터 클릭은 예약하지 않는다', !textColor.armed);
eq('글자색 상단 버튼 — 선택된 글자가 없다는 토스트를 띄운다', textColor.toast, [`info:${translate('noTarget', 'ko')}`]);

const highlight = pointerClick('hl');
ok('형광펜 상단 버튼 — 효과가 없는 접힌 캐럿의 포인터 클릭은 예약하지 않는다', !highlight.armed);
eq('형광펜 상단 버튼 — 선택된 글자가 없다는 토스트를 띄운다', highlight.toast, [`info:${translate('noTarget', 'ko')}`]);

function pointerClickInDemo(w: 'tc' | 'hl'): { readonly errors: number; readonly toast: readonly string[] } {
  const dom = new JSDOM('<!doctype html><html><body><div id="toolbar"></div><div id="surface"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const said: string[] = [];
  const errors: unknown[] = [];
  const { nabi, registry } = createNabiWith(defaultWings, {
    doc: SAMPLE,
    locale: 'ko',
    toast: (level, message) => said.push(`${level}:${message}`),
    onError: (error) => errors.push(error),
  });
  nabi.select(caretAt({ path: [3], offset: 20 }));
  const toolbar = mountToolbar({
    nabi,
    registry,
    root: owner.getElementById('toolbar') as HTMLElement,
    surface,
  });
  const button = toolbar.buttons.find((candidate) => candidate.w === w);
  button?.el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, detail: 1 }));
  const answer = { errors: errors.length, toast: said };
  toolbar.unmount();
  dom.window.close();
  return answer;
}

for (const w of ['tc', 'hl'] as const) {
  const clicked = pointerClickInDemo(w);
  eq(`${w} 데모 문장 — 접힌 캐럿의 포인터 클릭은 오류가 아니다`, clicked.errors, 0);
  eq(`${w} 데모 문장 — 선택된 글자가 없다는 토스트를 띄운다`, clicked.toast, [`info:${translate('noTarget', 'ko')}`]);
}

function keyboardPress(w: 'tc' | 'hl' | 'sup' | 'sub'): {
  readonly value: unknown;
  readonly pressed: string | null;
  readonly doc: unknown;
} {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="chrome"><div id="toolbar"></div></div><div id="surface" tabindex="0"></div></body></html>',
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['글'] }] });
  nabi.select(caretAt({ path: [0], offset: 1 }));
  const toolbar = mountToolbar({
    nabi,
    registry,
    root: owner.getElementById('toolbar') as HTMLElement,
    surface,
    quick: [w],
  });
  toolbar.buttons.find((button) => button.w === w)!.press();
  const mark = hostOf(nabi)
    .armed.peek()
    .plus.find((candidate) => candidate.w === w);
  nabi.applyCommand('insertText', { text: '자' });
  const answer = {
    value: mark?.a?.['c'],
    pressed: toolbar.buttons.find((candidate) => candidate.w === w)?.el.getAttribute('aria-pressed') ?? null,
    doc: nabi.getJson(),
  };
  toolbar.unmount();
  dom.window.close();
  return answer;
}

const hintedTextColor = keyboardPress('tc');
eq('글자색 키보드 실행 — 첫 번째 초록색을 임시 선택한다', hintedTextColor.value, 'green');
eq('글자색 키보드 실행 — 글자색 버튼도 눌린 상태로 보인다', hintedTextColor.pressed, 'true');
eq('글자색 키보드 실행 — 다음 입력에 초록 글자색이 실제로 걸린다', hintedTextColor.doc, [
  { w: 'p', ch: ['글', { w: 'tc', a: { c: 'green' }, ch: ['자'] }] },
]);

const hintedHighlight = keyboardPress('hl');
eq('형광펜 키보드 실행 — 첫 번째 노란색을 임시 선택한다', hintedHighlight.value, 'yellow');
eq('형광펜 키보드 실행 — 형광펜 버튼도 눌린 상태로 보인다', hintedHighlight.pressed, 'true');
eq('형광펜 키보드 실행 — 다음 입력에 노란 형광펜이 실제로 걸린다', hintedHighlight.doc, [
  { w: 'p', ch: ['글', { w: 'hl', a: { c: 'yellow' }, ch: ['자'] }] },
]);

const hintedSuperscript = keyboardPress('sup');
eq('윗첨자 키보드 실행 — 윗첨자 버튼이 임시 선택된다', hintedSuperscript.pressed, 'true');
eq('윗첨자 키보드 실행 — 다음 입력에 윗첨자가 실제로 걸린다', hintedSuperscript.doc, [
  { w: 'p', ch: ['글', { w: 'sup', ch: ['자'] }] },
]);

const hintedSubscript = keyboardPress('sub');
eq('아랫첨자 키보드 실행 — 아랫첨자 버튼이 임시 선택된다', hintedSubscript.pressed, 'true');
eq('아랫첨자 키보드 실행 — 다음 입력에 아랫첨자가 실제로 걸린다', hintedSubscript.doc, [
  { w: 'p', ch: ['글', { w: 'sub', ch: ['자'] }] },
]);

eq(
  '리스트 셋은 Shift 두 번 힌트 글자를 갖지 않는다',
  [bulletListWing, orderedListWing, taskListWing].map((wing) => wing.button?.shortcut),
  [undefined, undefined, undefined],
);

done('toolbar-value');
