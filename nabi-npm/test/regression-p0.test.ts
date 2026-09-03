// 0.9 P0 회귀망 - 화면과 트리가 갈릴 때 글자를 잃는 세 경로를 각각 고정한다.
// 0.9 P0 regression net — pins down three paths that lose text when the screen and the tree diverge.
import { JSDOM } from 'jsdom';
import { createNabiWith } from '../src/wing/index.js';
import { encodeClipboardBody, mountSurface, NABI_CLIPBOARD_MIME, type Surface } from '../src/surface/index.js';
import type { Nabi } from '../src/editor/index.js';
import { done, eq, ok } from './net.js';

interface Stood {
  readonly dom: JSDOM;
  readonly nabi: Nabi;
  readonly root: HTMLElement;
  readonly surface: Surface;
}

function stand(values: readonly string[], fileSink?: (files: readonly File[]) => void): Stood {
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith([], {
    doc: values.map((value) => ({ w: 'p', ch: [value] })),
  });
  const surface = mountSurface({ nabi, registry, root, ...(fileSink ? { fileSink } : {}) });
  return { dom, nabi, root, surface };
}

function textOf(paragraph: Element): Text {
  const walker = paragraph.ownerDocument.createTreeWalker(paragraph, 4);
  const text = walker.nextNode();
  if (!text) throw new Error('텍스트 없음');
  return text as Text;
}

function selectDom(
  doc: Document,
  anchor: Text,
  anchorOffset: number,
  focus = anchor,
  focusOffset = anchorOffset,
): void {
  doc.getSelection()?.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
}

function eventWith<T extends Event>(event: T, name: string, value: unknown): T {
  Object.defineProperty(event, name, { value });
  return event;
}

function close(stood: Stood): void {
  stood.surface.unmount();
  stood.dom.window.close();
}

for (const [name, value] of [
  ['NBSP', 'A\u00a0B'],
  ['ZWSP', 'A\u200bB'],
] as const) {
  const stood = stand([value]);
  stood.root.focus();
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, text.data.length);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data: null,
      inputType: 'insertText',
    }),
  );
  eq(`${name} - DOM이 안 바뀐 input 뒤에도 저장 글자를 보존한다`, stood.nabi.getJson(), [{ w: 'p', ch: [value] }]);
  close(stood);
}

for (const [name, data, domValue, saved] of [
  ['U+0020', ' ', 'A\u00a0B', 'A B'],
  ['NBSP', '\u00a0', 'A\u00a0B', 'A\u00a0B'],
  ['ZWSP', '\u200b', 'A\u200bB', 'A\u200bB'],
] as const) {
  const stood = stand(['AB']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data,
      inputType: 'insertText',
    }),
  );
  text.data = domValue;
  selectDom(stood.dom.window.document, text, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data,
      inputType: 'insertText',
    }),
  );
  eq(`${name} - 직접 입력의 의미를 DOM NBSP 표현과 분리한다`, stood.nabi.getJson(), [{ w: 'p', ch: [saved] }]);
  close(stood);
}

{
  const stood = stand(['ABCDE']);
  stood.nabi.select({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  });
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 3, text, 5);
  const loaded = new Map<string, string>();
  const clipboard = {
    files: [],
    types: ['text/plain', 'text/html'],
    getData: () => '',
    setData: (type: string, value: string) => loaded.set(type, value),
  };
  stood.root.dispatchEvent(
    eventWith(new stood.dom.window.Event('cut', { bubbles: true, cancelable: true }), 'clipboardData', clipboard),
  );
  eq('cut - 복사한 실제 DOM 범위와 같은 DE를 트리에서도 지운다', stood.nabi.getJson(), [{ w: 'p', ch: ['ABC'] }]);
  eq('cut - 클립보드에는 실제 DOM 선택을 싣는다', loaded.get('text/plain'), 'DE');
  close(stood);
}

{
  const stood = stand(['ABCDE']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 1, text, 4);
  const cut = new stood.dom.window.Event('cut', { bubbles: true, cancelable: true });
  stood.root.dispatchEvent(cut);
  eq('cut - clipboardData가 없어도 source 문서를 지우지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['ABCDE'] }]);
  ok('cut - clipboardData가 없으면 browser default cut을 막는다', cut.defaultPrevented);
  close(stood);
}

{
  const stood = stand(['ABCDE']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 1, text, 4);
  const loaded = new Map<string, string>();
  const cut = new stood.dom.window.Event('cut', { bubbles: true, cancelable: true });
  stood.root.dispatchEvent(
    eventWith(cut, 'clipboardData', {
      files: [],
      types: [],
      getData: () => '',
      setData: (type: string, value: string) => {
        if (type === NABI_CLIPBOARD_MIME) throw new Error('unsupported custom MIME');
        loaded.set(type, value);
      },
    }),
  );
  eq('cut - custom MIME 기록 실패 뒤 HTML fallback도 기록한다', loaded.get('text/html')?.includes('BCD'), true);
  eq('cut - custom MIME 기록 실패 뒤 평문 fallback도 기록한다', loaded.get('text/plain'), 'BCD');
  eq('cut - fallback 하나 이상이 기록되면 선택 범위를 지운다', stood.nabi.getJson(), [{ w: 'p', ch: ['AE'] }]);
  ok('cut - fallback을 직접 기록했으므로 browser 기본 동작을 막는다', cut.defaultPrevented);
  close(stood);
}

{
  const stood = stand(['ABCDE']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 1, text, 4);
  const cut = new stood.dom.window.Event('cut', { bubbles: true, cancelable: true });
  stood.root.dispatchEvent(
    eventWith(cut, 'clipboardData', {
      files: [],
      types: [],
      getData: () => '',
      setData: () => {
        throw new Error('clipboard blocked');
      },
    }),
  );
  eq('cut - HTML과 평문 fallback이 모두 실패하면 문서를 지우지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['ABCDE'] },
  ]);
  eq('cut - 기록 실패는 실제 DOM source selection을 그대로 남긴다', stood.nabi.getSelection(), {
    anchor: { path: [0], offset: 1 },
    focus: { path: [0], offset: 4 },
  });
  ok('cut - 아무 형식도 기록하지 못하면 browser default cut을 막아 원본을 보존한다', cut.defaultPrevented);
  close(stood);
}

{
  const stood = stand(['AB']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 2);
  const clipboard = {
    files: [],
    types: ['text/plain'],
    getData: (type: string) => (type === 'text/plain' ? 'X' : ''),
  };
  stood.root.dispatchEvent(
    eventWith(new stood.dom.window.Event('paste', { bubbles: true, cancelable: true }), 'clipboardData', clipboard),
  );
  eq('paste - selectionchange 전 실제 DOM 캐럿인 문단 끝에 붙인다', stood.nabi.getJson(), [{ w: 'p', ch: ['ABX'] }]);
  close(stood);
}

{
  const stood = stand(['A']);
  const text = textOf(stood.root.querySelector('p') as Element);
  selectDom(stood.dom.window.document, text, 1);
  const clipboard = {
    files: [],
    types: ['text/plain'],
    getData: (type: string) => (type === 'text/plain' ? '\u00a0\u200b' : ''),
  };
  stood.root.dispatchEvent(
    eventWith(new stood.dom.window.Event('paste', { bubbles: true, cancelable: true }), 'clipboardData', clipboard),
  );
  eq('paste - NBSP·ZWSP를 일반 공백이나 slot으로 오인하지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A\u00a0\u200b'] },
  ]);
  close(stood);
}

{
  const stood = stand(['AB', 'CD']);
  const second = textOf(stood.root.querySelectorAll('p')[1] as Element);
  selectDom(stood.dom.window.document, second, 1);
  const beforeDoc = stood.nabi.getJson();
  const beforeSelection = stood.nabi.getSelection();
  const paste = new stood.dom.window.Event('paste', { bubbles: true, cancelable: true });
  stood.root.dispatchEvent(
    eventWith(paste, 'clipboardData', {
      files: [],
      types: ['text/plain'],
      getData: () => {
        throw new Error('clipboard snapshot failed');
      },
    }),
  );
  eq('paste - getData 예외는 문서를 원자적으로 유지한다', stood.nabi.getJson(), beforeDoc);
  eq(
    'paste - getData 예외는 live DOM caret도 editor selection에 commit하지 않는다',
    stood.nabi.getSelection(),
    beforeSelection,
  );
  ok('paste - snapshot 실패에도 browser raw paste를 막는다', paste.defaultPrevented);
  close(stood);
}

function dropAt(
  stood: Stood,
  target: Text,
  offset: number,
  transfer: { readonly types: readonly string[]; readonly files: readonly unknown[]; getData(type: string): string },
): Event {
  Object.defineProperty(stood.dom.window.document, 'caretPositionFromPoint', {
    configurable: true,
    value: () => ({ offsetNode: target, offset }),
  });
  const drop = new stood.dom.window.Event('drop', { bubbles: true, cancelable: true });
  stood.root.dispatchEvent(eventWith(drop, 'dataTransfer', transfer));
  return drop;
}

for (const [name, types, values, expected] of [
  ['plain', ['text/plain'], { 'text/plain': 'X' }, 'CXD'],
  ['internal', [NABI_CLIPBOARD_MIME], { [NABI_CLIPBOARD_MIME]: encodeClipboardBody([{ w: 'p', ch: ['I'] }]) }, 'CID'],
  ['HTML', ['text/html'], { 'text/html': '<p>H</p>' }, 'CHD'],
] as const) {
  const stood = stand(['AB', 'CD']);
  const target = textOf(stood.root.querySelectorAll('p')[1] as Element);
  const previousParser = globalThis.DOMParser;
  globalThis.DOMParser = stood.dom.window.DOMParser;
  try {
    const drop = dropAt(stood, target, 1, {
      types,
      files: [],
      getData: (type) => (values as Readonly<Record<string, string>>)[type] ?? '',
    });
    eq(`drop - ${name} payload는 실제 drop caret에 붙는다`, stood.nabi.getJson(), [
      { w: 'p', ch: ['AB'] },
      { w: 'p', ch: [expected] },
    ]);
    ok(`drop - ${name} payload를 처리한 때만 기본 동작을 막는다`, drop.defaultPrevented);
  } finally {
    globalThis.DOMParser = previousParser;
    close(stood);
  }
}

{
  let captured: unknown = null;
  let stood!: Stood;
  stood = stand(['AB', 'CD'], () => {
    captured = stood.nabi.getSelection();
  });
  const target = textOf(stood.root.querySelectorAll('p')[1] as Element);
  const file = { name: 'a.png', type: 'image/png', size: 1 };
  const drop = dropAt(stood, target, 1, { types: ['Files'], files: [file], getData: () => '' });
  eq('drop - file sink도 실제 drop caret을 먼저 본다', captured, {
    anchor: { path: [1], offset: 1 },
    focus: { path: [1], offset: 1 },
  });
  ok('drop - file sink가 받으면 기본 동작을 막는다', drop.defaultPrevented);
  close(stood);
}

{
  const stood = stand(['AB', 'CD']);
  const target = textOf(stood.root.querySelectorAll('p')[1] as Element);
  const beforeDoc = stood.nabi.getJson();
  const beforeSelection = stood.nabi.getSelection();
  const invalid = dropAt(stood, target, 1, {
    types: [NABI_CLIPBOARD_MIME],
    files: [],
    getData: (type) => (type === NABI_CLIPBOARD_MIME ? '{broken' : ''),
  });
  eq('drop - 처리할 수 없는 payload는 문서를 원자적으로 유지한다', stood.nabi.getJson(), beforeDoc);
  eq('drop - 처리할 수 없는 payload는 기존 selection도 유지한다', stood.nabi.getSelection(), beforeSelection);
  ok('drop - 인식했지만 처리할 수 없는 payload도 browser raw 삽입을 막는다', invalid.defaultPrevented);

  const throwing = dropAt(stood, target, 1, {
    types: ['text/plain'],
    files: [],
    getData: () => {
      throw new Error('DataTransfer unavailable');
    },
  });
  eq('drop - getData 예외도 문서를 바꾸지 않는다', stood.nabi.getJson(), beforeDoc);
  eq('drop - getData 예외도 selection을 바꾸지 않는다', stood.nabi.getSelection(), beforeSelection);
  ok('drop - 인식한 type의 getData snapshot 실패도 browser 기본 동작을 막는다', throwing.defaultPrevented);
  close(stood);
}

{
  const stood = stand(['A']);
  const outside = stood.dom.window.document.createTextNode('outside');
  stood.dom.window.document.body.appendChild(outside);
  selectDom(stood.dom.window.document, outside, 0, outside, outside.data.length);
  const paste = {
    files: [],
    types: ['text/plain'],
    getData: (type: string) => (type === 'text/plain' ? 'X' : ''),
  };
  stood.root.dispatchEvent(
    eventWith(new stood.dom.window.Event('paste', { bubbles: true, cancelable: true }), 'clipboardData', paste),
  );
  stood.root.dispatchEvent(
    eventWith(new stood.dom.window.Event('cut', { bubbles: true, cancelable: true }), 'clipboardData', {
      files: [],
      types: [],
      getData: () => '',
      setData: () => undefined,
    }),
  );
  eq('cut/paste - live DOM selection을 트리로 mapping하지 못하면 문서를 건드리지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A'] },
  ]);
  close(stood);
}

{
  const stood = stand(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  const first = textOf(paragraphs[0] as Element);
  const second = textOf(paragraphs[1] as Element);
  selectDom(stood.dom.window.document, first, 1, second, 1);
  stood.root.dispatchEvent(new stood.dom.window.CompositionEvent('compositionstart', { bubbles: true }));

  (paragraphs[0] as HTMLParagraphElement).textContent = 'A가D';
  paragraphs[1]?.remove();
  const composed = textOf(paragraphs[0] as Element);
  selectDom(stood.dom.window.document, composed, 2);
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));

  eq('cross-holder IME - compositionend 없는 blur도 보이는 최종 글자를 확정한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A가D'] },
  ]);
  close(stood);
}

done('regression-p0');
