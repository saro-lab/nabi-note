// IME 조합 시작의 실제 DOM 선택과 트리 선택이 어긋나는 모바일 타이밍을 jsdom으로 고정한다.
// Pins down, via jsdom, the mobile timing where the real DOM selection and the tree selection diverge at IME composition start.
import { JSDOM } from 'jsdom';
import { createNabiWith, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { mountSurface } from '../src/surface/index.js';
import type { Nabi } from '../src/editor/index.js';
import type { Surface } from '../src/surface/index.js';
import { done, eq, ok } from './net.js';

interface Stood {
  readonly dom: JSDOM;
  readonly nabi: Nabi;
  readonly root: HTMLElement;
  readonly surface: Surface;
  readonly paragraph: HTMLParagraphElement;
  readonly text: Text;
}

function standTree(doc: unknown, wings: readonly Wing[] = []): Stood {
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith(wings, {
    doc,
  });
  const surface = mountSurface({ nabi, registry, root });
  return {
    dom,
    nabi,
    root,
    surface,
    get paragraph() {
      return root.querySelector('p') as HTMLParagraphElement;
    },
    get text() {
      const paragraph = root.querySelector('p') as HTMLParagraphElement;
      const walker = dom.window.document.createTreeWalker(paragraph, 4);
      return walker.nextNode() as Text;
    },
  };
}

function standDoc(values: readonly string[], attrs: readonly ({ readonly dc?: 1 } | undefined)[] = []): Stood {
  return standTree(
    values.map((value, index) => ({ w: 'p', ...(attrs[index] ? { a: attrs[index] } : {}), ch: [value] })),
  );
}

function stand(value: string): Stood {
  return standDoc([value]);
}

function selectDom(doc: Document, text: Text, anchor: number, focus = anchor): void {
  const selection = doc.getSelection();
  if (!selection) throw new Error('selection 없음');
  selection.removeAllRanges();
  const range = doc.createRange();
  range.setStart(text, Math.min(anchor, focus));
  range.setEnd(text, Math.max(anchor, focus));
  selection.addRange(range);
}

function selectAcross(doc: Document, anchor: Text, anchorOffset: number, focus: Text, focusOffset: number): void {
  const selection = doc.getSelection();
  if (!selection) throw new Error('selection 없음');
  selection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
}

function pointAt(paragraph: HTMLElement, offset: number): { readonly text: Text; readonly offset: number } {
  const walker = paragraph.ownerDocument.createTreeWalker(paragraph, 4);
  let remain = offset;
  let last: Text | null = null;
  while (walker.nextNode()) {
    const text = walker.currentNode as Text;
    last = text;
    if (remain <= text.data.length) return { text, offset: remain };
    remain -= text.data.length;
  }
  if (!last) throw new Error('텍스트 없음');
  return { text: last, offset: last.data.length };
}

function selectAt(stood: Stood, anchor: number, focus = anchor): void {
  const a = pointAt(stood.paragraph, anchor);
  const f = pointAt(stood.paragraph, focus);
  stood.dom.window.document.getSelection()?.setBaseAndExtent(a.text, a.offset, f.text, f.offset);
}

function start(stood: Stood): void {
  stood.root.dispatchEvent(new stood.dom.window.CompositionEvent('compositionstart', { bubbles: true }));
}

function end(stood: Stood, data = ''): void {
  stood.root.dispatchEvent(new stood.dom.window.CompositionEvent('compositionend', { bubbles: true, data }));
}

function close(stood: Stood): void {
  stood.surface.unmount();
  stood.dom.window.close();
}

{
  const stood = stand('');
  eq(
    '빈 편집기의 처음 모양은 표식 있는 받침 br이다',
    stood.paragraph.innerHTML.toLowerCase(),
    '<br data-nabi-filler="">',
  );

  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('focus'));
  const slot = stood.paragraph.firstChild;
  ok('포커스 순간 compositionstart보다 먼저 텍스트 노드를 만든다', slot?.nodeType === 3);
  eq('조합 전 자리는 폭 없는 한 글자다', slot?.textContent, '\u200b');

  start(stood);
  end(stood);
  eq('빈 조합이 끝나도 포커스 중 다음 조합 자리는 유지한다', stood.paragraph.textContent, '\u200b');

  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));
  eq(
    '편집기를 떠나면 표식 있는 렌더러 빈 모양으로 돌아간다',
    stood.paragraph.innerHTML.toLowerCase(),
    '<br data-nabi-filler="">',
  );
  const previousParser = globalThis.DOMParser;
  globalThis.DOMParser = stood.dom.window.DOMParser;
  try {
    ok('focus/빈 composition/blur 뒤 live editor DOM도 다시 읽힌다', stood.nabi.setHtml(stood.root.innerHTML));
    eq('표식 있는 받침은 live DOM 왕복에서도 실제 br가 되지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: [] }]);
  } finally {
    globalThis.DOMParser = previousParser;
  }
  close(stood);
}

{
  const stood = stand('');
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('focus'));
  eq('unmount 전 빈 holder에는 mount 소유 slot만 선다', stood.paragraph.textContent, '\u200b');
  stood.surface.unmount();
  eq('unmount는 소유 slot과 편집기 받침을 걷고 발행 빈 문단을 남긴다', stood.root.innerHTML, '<p></p>');
  stood.dom.window.close();
}

{
  const stood = standTree([{ w: 'p', ch: [{ w: 'br', ch: [] }] }]);
  eq('실제 br 하나는 빈 홀더 받침과 다른 DOM 모양이다', stood.paragraph.innerHTML, '<br><br data-nabi-filler="">');
  stood.dom.window.document.getSelection()?.setBaseAndExtent(stood.paragraph, 1, stood.paragraph, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: null, inputType: 'insertText' }),
  );
  eq('DOM이 바뀌지 않은 input이 실제 br를 빈 값으로 오인하지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: [{ w: 'br', ch: [] }] },
  ]);
  close(stood);
}

{
  const stood = stand('');
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('focus'));
  const slot = stood.paragraph.firstChild as Text;
  slot.data = '\u200bA';
  selectDom(stood.dom.window.document, slot, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: 'A', inputType: 'insertText' }),
  );

  eq('일반 첫 입력도 조합용 폭 없는 문자를 즉시 걷는다', stood.paragraph.textContent, 'A');
  eq('일반 첫 입력의 저장값에는 폭 없는 문자가 없다', stood.nabi.getJson(), [{ w: 'p', ch: ['A'] }]);
  close(stood);
}

{
  const stood = stand('A');
  stood.text.data = 'A\r\nB\rC\nD';
  selectDom(stood.dom.window.document, stood.text, stood.text.data.length);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: null, inputType: 'insertText' }),
  );
  eq('DOM 텍스트의 CRLF·CR·LF도 br 한 칸으로 되맞춤한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A', { w: 'br', ch: [] }, 'B', { w: 'br', ch: [] }, 'C', { w: 'br', ch: [] }, 'D'] },
  ]);
  close(stood);
}

{
  const stood = standTree([{ w: 'p', ch: ['#'] }], defaultWings);
  selectDom(stood.dom.window.document, stood.text, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: ' ',
      inputType: 'insertText',
    }),
  );
  stood.text.data = '#\u00a0';
  selectDom(stood.dom.window.document, stood.text, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data: ' ',
      inputType: 'insertText',
    }),
  );
  eq('contenteditable이 NBSP로 그린 U+0020도 스페이스 오토포맷을 유지한다', stood.nabi.getJson(), [
    { w: 'p', a: { h: 1 }, ch: [] },
  ]);
  close(stood);
}

{
  const stood = stand('A B');
  selectDom(stood.dom.window.document, stood.text, 3);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: ' ',
      inputType: 'insertText',
    }),
  );
  stood.text.data = 'A\u00a0';
  selectDom(stood.dom.window.document, stood.text, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data: null,
      inputType: 'deleteContentBackward',
    }),
  );
  eq('stale insertText hint는 뒤이은 delete input에 쓰이지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A\u00a0'] },
  ]);
  close(stood);
}

{
  const stood = stand('AB');
  selectDom(stood.dom.window.document, stood.text, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: ' ',
      inputType: 'insertText',
    }),
  );
  stood.text.data = 'A\u00a0B';
  selectDom(stood.dom.window.document, stood.text, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data: '\u00a0',
      inputType: 'insertText',
    }),
  );
  eq('data가 다른 input은 stale U+0020 hint를 이어받지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['A\u00a0B'] }]);
  close(stood);
}

{
  const stood = stand('');
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('focus'));
  const slot = stood.paragraph.firstChild as Text;
  const typed = stood.dom.window.document.createTextNode('A');
  slot.after(typed);
  selectDom(stood.dom.window.document, typed, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: 'A', inputType: 'insertText' }),
  );

  eq('첫 글자가 새 Text 노드로 와도 앞의 조합 자리를 걷는다', stood.paragraph.textContent, 'A');
  eq('갈린 Text 노드 첫 입력도 저장값과 같다', stood.nabi.getJson(), [{ w: 'p', ch: ['A'] }]);
  close(stood);
}

{
  const stood = stand('가나다');
  stood.nabi.select({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  });
  let startedChanges = 0;
  const stop = stood.nabi.onChange(() => {
    startedChanges += 1;
  });
  // selectionchange가 늦어 트리에는 옛 범위가 남았지만, IME는 실제 끝 캐럿에서 다음 조합을 연다.
  // selectionchange lags, so the tree still holds the old range, but the IME opens the next composition at the real, current caret.
  selectDom(stood.dom.window.document, stood.text, 3);
  start(stood);
  start(stood);

  eq('낡은 트리 범위는 지우지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  eq('중복 조합 시작도 트리 신호를 하나도 내지 않는다', startedChanges, 0);
  ok('조합 시작이 IME의 문단 앵커를 교체하지 않는다', stood.root.querySelector('p') === stood.paragraph);

  stood.text.data = '가나다라';
  selectDom(stood.dom.window.document, stood.text, 4);
  end(stood);
  eq('빠른 다음 조합이 앞 자모를 옮기지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['가나다라'] }]);
  stop();
  close(stood);
}

{
  const stood = stand('A B');
  selectDom(stood.dom.window.document, stood.text, 1, 2);
  start(stood);
  stood.text.data = 'A\u00a0B';
  selectDom(stood.dom.window.document, stood.text, 2);
  end(stood, '\u00a0');
  eq('같은 holder IME가 기존 space를 NBSP로 바꾸면 그 문자를 보존한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A\u00a0B'] },
  ]);
  close(stood);
}

{
  const stood = stand('가나다');
  // 반대 어긋남: 트리는 접힌 캐럿이지만 실제 DOM은 첫 글자를 고른 채 교체 조합을 시작한다.
  // The opposite mismatch: the tree has a collapsed caret, but the real DOM starts a replacement composition with the first character selected.
  selectDom(stood.dom.window.document, stood.text, 0, 1);
  start(stood);

  eq('조합 시작은 실제 DOM 범위도 트리에서 미리 지우지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  ok('조합 시작은 문단 DOM을 그대로 둔다', stood.root.querySelector('p') === stood.paragraph);

  stood.text.data = '라나다';
  selectDom(stood.dom.window.document, stood.text, 1);
  end(stood);
  eq('범위 위 조합은 선택 글자만 바꾼다', stood.nabi.getJson(), [{ w: 'p', ch: ['라나다'] }]);
  close(stood);
}

{
  const stood = stand('가나다');
  stood.nabi.select({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  });
  const anchor = stood.root.querySelector('p');
  start(stood);

  eq('일치한 범위도 조합 시작에는 트리를 건드리지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  ok('조합 시작이 조합 앵커를 다시 그리지 않는다', stood.root.querySelector('p') === anchor);

  stood.text.data = '라나다';
  selectDom(stood.dom.window.document, stood.text, 1);
  end(stood);
  eq('일치한 범위의 조합도 정상 교체된다', stood.nabi.getJson(), [{ w: 'p', ch: ['라나다'] }]);
  stood.nabi.undo();
  eq('IME 범위 교체 전체는 undo 한 번으로 돌아간다', stood.nabi.getJson(), [{ w: 'p', ch: ['가나다'] }]);
  close(stood);
}

{
  const stood = standDoc(['A', 'B']);
  selectDom(stood.dom.window.document, stood.text, 1);
  start(stood);
  stood.text.data = 'A가';
  selectDom(stood.dom.window.document, stood.text, 2);

  stood.nabi.select({
    anchor: { path: [1], offset: 1 },
    focus: { path: [1], offset: 1 },
  });
  stood.nabi.applyCommand('insertText', { text: 'X' });
  eq('조합 중 다른 문단의 외부 변경은 트리에 산다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A'] },
    { w: 'p', ch: ['BX'] },
  ]);

  end(stood);
  eq('조합과 다른 문단 외부 변경을 모두 보존한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A가'] },
    { w: 'p', ch: ['BX'] },
  ]);
  eq('미뤘던 다른 문단 DOM도 조합 뒤 따라잡는다', stood.root.textContent, 'A가BX');
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  const first = paragraphs[0]?.firstChild as Text;
  const second = paragraphs[1]?.firstChild as Text;
  selectAcross(stood.dom.window.document, first, 1, second, 1);
  start(stood);

  (paragraphs[0] as HTMLParagraphElement).textContent = 'A가D';
  paragraphs[1]?.remove();
  selectDom(stood.dom.window.document, (paragraphs[0] as HTMLParagraphElement).firstChild as Text, 2);
  end(stood, '가');

  eq('여러 문단 IME 교체는 확정 문자열을 범위에 한 번 적용한다', stood.nabi.getJson(), [{ w: 'p', ch: ['A가D'] }]);
  stood.nabi.undo();
  eq('여러 문단 IME 교체도 undo 한 번으로 돌아간다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  selectAcross(stood.dom.window.document, paragraphs[1]?.firstChild as Text, 1, paragraphs[0]?.firstChild as Text, 1);
  start(stood);
  end(stood, '');
  eq('역방향 cross-holder 취소는 원래 anchor/focus 방향을 지킨다', stood.nabi.getSelection(), {
    anchor: { path: [1], offset: 1 },
    focus: { path: [0], offset: 1 },
  });
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  selectAcross(stood.dom.window.document, paragraphs[0]?.firstChild as Text, 1, paragraphs[1]?.firstChild as Text, 1);
  start(stood);
  (paragraphs[0] as HTMLParagraphElement).textContent = 'A';
  (paragraphs[1] as HTMLParagraphElement).textContent = 'D';
  end(stood, '');
  eq('양끝 holder가 남아도 선택 내용이 사라진 빈 replacement를 확정한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AD'] },
  ]);
  stood.nabi.undo();
  eq('빈 cross-holder replacement도 undo 한 단위다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD', 'EF']);
  const paragraphs = stood.root.querySelectorAll('p');
  selectAcross(stood.dom.window.document, paragraphs[0]?.firstChild as Text, 1, paragraphs[2]?.firstChild as Text, 1);
  start(stood);
  (paragraphs[0] as HTMLParagraphElement).textContent = 'A';
  (paragraphs[2] as HTMLParagraphElement).textContent = 'F';
  end(stood, '');
  eq('중간 holder 내용이 남으면 빈 replacement로 추정하지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
    { w: 'p', ch: ['EF'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  const first = paragraphs[0]?.firstChild as Text;
  const second = paragraphs[1]?.firstChild as Text;
  selectAcross(stood.dom.window.document, first, 1, second, 1);
  start(stood);
  end(stood, '');

  eq('여러 문단 조합 취소는 원래 범위를 지우지 않는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['A', 'B']);
  const second = stood.root.querySelectorAll('p')[1] as HTMLParagraphElement;
  const secondText = second.firstChild as Text;
  selectDom(stood.dom.window.document, secondText, 1);
  start(stood);
  secondText.data = 'B가';
  selectDom(stood.dom.window.document, secondText, 2);

  stood.nabi.select({
    anchor: { path: [0], offset: 1 },
    focus: { path: [0], offset: 1 },
  });
  stood.nabi.applyCommand('splitParagraph');
  end(stood);

  eq('앞 문단 분할로 경로가 밀려도 홀더 ID로 조합 대상을 다시 찾는다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A'] },
    { w: 'p', ch: [] },
    { w: 'p', ch: ['B가'] },
  ]);
  eq('경로 이동과 조합을 반영한 DOM도 트리와 같다', stood.root.textContent, 'AB가');
  close(stood);
}

{
  const stood = stand('A');
  selectDom(stood.dom.window.document, stood.text, 1);
  start(stood);
  stood.text.data = 'A가';
  selectDom(stood.dom.window.document, stood.text, 2);

  stood.nabi.select({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 0 },
  });
  stood.nabi.applyCommand('insertText', { text: 'Z' });
  end(stood);

  eq('활성 문단 충돌은 명시적 외부 변경을 보존한다', stood.nabi.getJson(), [{ w: 'p', ch: ['ZA'] }]);
  eq('충돌한 조합 DOM은 트리 정본으로 되돌린다', stood.root.textContent, 'ZA');
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD', 'EF']);
  const paragraphs = stood.root.querySelectorAll('p');
  const first = paragraphs[0]?.firstChild as Text;
  const third = paragraphs[2]?.firstChild as Text;
  selectAcross(stood.dom.window.document, third, 1, first, 1);
  start(stood);
  (paragraphs[0] as HTMLParagraphElement).textContent = 'A값F';
  paragraphs[1]?.remove();
  paragraphs[2]?.remove();
  const composed = (paragraphs[0] as HTMLParagraphElement).firstChild as Text;
  selectDom(stood.dom.window.document, composed, 2);
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));

  eq('역방향·여러 holder IME blur도 prefix/suffix 사이 결과를 확정한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['A값F'] },
  ]);
  stood.nabi.undo();
  eq('cross-holder blur 확정은 undo 한 단위다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
    { w: 'p', ch: ['EF'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  selectAcross(stood.dom.window.document, paragraphs[0]?.firstChild as Text, 1, paragraphs[1]?.firstChild as Text, 1);
  start(stood);
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));
  eq('DOM이 바뀌지 않은 cross-holder blur는 취소로 보고 원문을 지킨다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AB'] },
    { w: 'p', ch: ['CD'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = stood.root.querySelectorAll('p');
  selectAcross(stood.dom.window.document, paragraphs[0]?.firstChild as Text, 1, paragraphs[1]?.firstChild as Text, 1);
  start(stood);
  (paragraphs[0] as HTMLParagraphElement).textContent = 'A가D';
  paragraphs[1]?.remove();
  stood.nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } });
  stood.nabi.applyCommand('insertText', { text: 'Z' });
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));
  eq('cross-holder 조합 범위의 명시적 외부 변경은 stale DOM보다 우선한다', stood.nabi.getJson(), [
    { w: 'p', ch: ['ZAB'] },
    { w: 'p', ch: ['CD'] },
  ]);
  close(stood);
}

{
  const stood = stand('A');
  selectDom(stood.dom.window.document, stood.text, 1);
  start(stood);
  stood.text.data = 'A가';
  selectDom(stood.dom.window.document, stood.text, 2);
  stood.root.dispatchEvent(new stood.dom.window.FocusEvent('blur'));

  eq('compositionend 없는 blur도 보이는 조합을 확정한다', stood.nabi.getJson(), [{ w: 'p', ch: ['A가'] }]);
  stood.text.data = 'A가B';
  selectDom(stood.dom.window.document, stood.text, 3);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: 'B', inputType: 'insertText' }),
  );
  eq('blur 뒤 조합 잠금이 남지 않는다', stood.nabi.getJson(), [{ w: 'p', ch: ['A가B'] }]);
  close(stood);
}

{
  const stood = standDoc(['Drop'], [{ dc: 1 }]);
  eq(
    '드롭캡 편집 DOM은 첫 글자를 실제 요소로 그린다',
    stood.paragraph.innerHTML,
    '<span data-nabi-dropcap-letter="">D</span>rop',
  );

  stood.text.data = 'XD';
  selectDom(stood.dom.window.document, stood.text, 1);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', { bubbles: true, data: 'X', inputType: 'insertText' }),
  );

  eq('첫머리 일반 입력은 저장값에 한 번 반영된다', stood.nabi.getJson(), [{ w: 'p', a: { dc: 1 }, ch: ['XDrop'] }]);
  eq(
    '일반 입력 뒤 드롭캡 요소는 새 첫 글자로 옮겨진다',
    stood.paragraph.querySelector('[data-nabi-dropcap-letter]')?.textContent,
    'X',
  );
  eq('다시 그린 뒤 캐럿의 논리 위치를 지킨다', stood.surface.port.readCaret()?.selection.focus.offset, 1);
  stood.nabi.undo();
  eq(
    'undo 뒤 드롭캡 요소도 원래 첫 글자로 돌아간다',
    stood.paragraph.querySelector('[data-nabi-dropcap-letter]')?.textContent,
    'D',
  );
  close(stood);
}

{
  const stood = standDoc(['Drop'], [{ dc: 1 }]);
  selectDom(stood.dom.window.document, stood.text, 0);
  start(stood);
  stood.text.data = '가D';
  selectDom(stood.dom.window.document, stood.text, 1);
  end(stood, '가');

  eq('첫머리 IME 확정값도 저장값에 한 번 반영된다', stood.nabi.getJson(), [{ w: 'p', a: { dc: 1 }, ch: ['가Drop'] }]);
  eq(
    'IME 종료 뒤 드롭캡 요소는 완성된 첫 문자소로 옮겨진다',
    stood.paragraph.querySelector('[data-nabi-dropcap-letter]')?.textContent,
    '가',
  );
  eq('IME 뒤 캐럿도 삽입한 문자소 다음에 남는다', stood.surface.port.readCaret()?.selection.focus.offset, 1);
  stood.nabi.undo();
  eq('드롭캡 첫머리 IME도 undo 한 번으로 돌아간다', stood.nabi.getJson(), [{ w: 'p', a: { dc: 1 }, ch: ['Drop'] }]);
  close(stood);
}

{
  const stood = standDoc(['Drop. abc'], [{ dc: 1 }]);
  stood.nabi.select({
    anchor: { path: [0], offset: 5 },
    focus: { path: [0], offset: 5 },
  });
  // iOS의 늦은 selectionchange와 같은 상태: 트리는 마침표 뒤, 화면은 공백 뒤에 서 있다.
  // Mirrors iOS's delayed selectionchange — the tree sits after the period, the screen after the following space.
  selectAt(stood, 6);
  stood.root.dispatchEvent(
    new stood.dom.window.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Backspace',
    }),
  );

  eq('keydown Backspace는 실행 직전 실제 DOM 캐럿의 공백을 지운다', stood.nabi.getJson(), [
    { w: 'p', a: { dc: 1 }, ch: ['Drop.abc'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['Drop. abc'], [{ dc: 1 }]);
  stood.nabi.select({
    anchor: { path: [0], offset: 5 },
    focus: { path: [0], offset: 5 },
  });
  selectAt(stood, 5);
  const from = pointAt(stood.paragraph, 5);
  const to = pointAt(stood.paragraph, 6);
  const before = new stood.dom.window.InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'deleteContentBackward',
  });
  Object.defineProperty(before, 'getTargetRanges', {
    value: () => [
      {
        startContainer: from.text,
        startOffset: from.offset,
        endContainer: to.text,
        endOffset: to.offset,
      },
    ],
  });
  stood.root.dispatchEvent(before);

  eq('모바일 beforeinput은 늦은 Selection보다 브라우저의 삭제 target range를 쓴다', stood.nabi.getJson(), [
    { w: 'p', a: { dc: 1 }, ch: ['Drop.abc'] },
  ]);
  close(stood);
}

{
  const stood = standDoc(['AB', 'CD']);
  const paragraphs = Array.from(stood.root.querySelectorAll('p'));
  const first = pointAt(paragraphs[0] as HTMLElement, 1);
  const second = pointAt(paragraphs[1] as HTMLElement, 1);
  const before = new stood.dom.window.InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: 'X',
    inputType: 'insertReplacementText',
  });
  Object.defineProperty(before, 'getTargetRanges', {
    value: () => [
      {
        startContainer: first.text,
        startOffset: first.offset,
        endContainer: second.text,
        endOffset: second.offset,
      },
    ],
  });
  stood.root.dispatchEvent(before);
  ok('unsupported beforeinput - browser 소유 입력은 preventDefault하지 않는다', !before.defaultPrevented);

  first.text.data = 'AX';
  second.text.data = 'D';
  stood.dom.window.document.getSelection()?.setBaseAndExtent(first.text, 2, first.text, 2);
  stood.root.dispatchEvent(
    new stood.dom.window.InputEvent('input', {
      bubbles: true,
      data: 'X',
      inputType: 'insertReplacementText',
    }),
  );

  eq('unsupported beforeinput - target range에 걸친 모든 holder를 tree로 되맞춘다', stood.nabi.getJson(), [
    { w: 'p', ch: ['AX'] },
    { w: 'p', ch: ['D'] },
  ]);
  eq('unsupported beforeinput - 되맞춘 holder DOM도 canonical tree와 같다', stood.root.textContent, 'AXD');
  close(stood);
}

done('mount-composition');
