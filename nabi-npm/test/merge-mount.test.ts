import { JSDOM } from 'jsdom';
import { mountMerge, MERGE_CSS, type MergeMountOptions, type MergeResult } from '../src/merge/index.js';
import { wings } from '../src/wings/index.js';
import { done, eq, ok } from './net.js';

const p = (text: string) => ({ w: 'p', ch: [text] });
const selectedWings = wings().allBasic().build();
const base = [p('base'), p('anchor'), p('tail')];
const local = [p('local'), p('anchor'), p('tail')];
const incoming = [p('base'), p('anchor'), p('incoming tail')];
const conflicting = [p('incoming'), p('anchor'), p('incoming tail')];

function fixture(options: Partial<Omit<MergeMountOptions, 'root' | 'wings'>> = {}) {
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="merge" class="host" dir="rtl"></div></body></html>',
    {
      url: 'https://example.test',
      pretendToBeVisual: true,
    },
  );
  const owner = dom.window.document;
  const root = owner.getElementById('merge')!;
  const mounted = mountMerge({ root, base, local, incoming, wings: selectedWings, locale: 'en', ...options });
  const content = root.querySelector<HTMLElement>('.nabi-merge-content')!;
  const button = (action: string) => root.querySelector<HTMLButtonElement>(`[data-merge-action="${action}"]`)!;
  const lineButton = (source: 'base' | 'incoming', line: number) =>
    root.querySelector<HTMLButtonElement>(`[data-merge-action="${source}"][data-source-start="${line}"]`)!;
  return {
    dom,
    owner,
    root,
    mounted,
    content,
    button,
    lineButton,
    close() {
      mounted.unmount();
      dom.window.close();
    },
  };
}

function selectFirst(f: ReturnType<typeof fixture>, offset = 0) {
  const position = { path: [0], offset };
  f.mounted.nabi.select({ anchor: position, focus: position });
}

{
  let received: MergeResult | undefined;
  let calls = 0;
  const f = fixture({
    incomingVersion: 'server-7',
    onConfirm(result) {
      received = result;
      calls += 1;
    },
  });
  eq('독립 변경은 화면을 열 때 모두 반영한다', f.mounted.nabi.getJson(), [p('local'), p('anchor'), p('incoming tail')]);
  eq('자동 머지 뒤 충돌은 없다', f.mounted.session.getState().unresolvedCount, 0);
  ok(
    '충돌이 없으면 해결 도구와 이동 도구를 숨긴다',
    f.root.querySelector<HTMLElement>('.nabi-merge-actions')!.hidden === true &&
      f.button('prev').hidden === true &&
      f.button('next').hidden === true,
  );
  ok('충돌이 없으면 바로 확인할 수 있다', !f.button('confirm').disabled);
  ok(
    '가운데는 편집 가능하고 양쪽 원본은 읽기 전용이다',
    f.content.getAttribute('contenteditable') === 'true' &&
      f.root.querySelectorAll('.nabi-merge-source [contenteditable="true"]').length === 0,
  );
  ok('가운데에서 일반 서식 도구를 사용할 수 있다', !!f.root.querySelector('[data-name="b"]'));
  ok(
    '공개 편집 DOM에 문서 CSS가 적용되는 클래스를 유지한다',
    f.mounted.content === f.content && f.mounted.content.classList.contains('nabi-content'),
  );
  ok('자동 머지 결과 확인이 성공한다', await f.mounted.confirm());
  eq('확인 콜백은 현재 저장 JSON을 받는다', received?.json, f.mounted.nabi.getJson());
  eq('확인 콜백은 게시 HTML을 받는다', received?.html, f.mounted.nabi.getHtml());
  eq('서버 버전은 그대로 돌려준다', received?.incomingVersion, 'server-7');
  ok(
    '저장 HTML에 충돌 표식과 편집기 키가 없다',
    !!received && !/nabi-merge|data-key|data-nabi-filler/.test(received.html),
  );
  ok('같은 revision은 다시 제출하지 않는다', !(await f.mounted.confirm()) && f.button('confirm').disabled);
  eq('중복 확인은 콜백을 다시 호출하지 않는다', calls, 1);
  selectFirst(f);
  ok('확인한 뒤 결과를 다시 편집할 수 있다', f.mounted.nabi.applyCommand('insertText', { text: 'final ' }));
  ok('다시 편집한 결과는 새 확인을 허용한다', !f.button('confirm').disabled && (await f.mounted.confirm()));
  eq('새 revision은 콜백을 다시 호출한다', calls, 2);
  f.close();
}

for (const action of ['base', 'incoming'] as const) {
  const f = fixture({ incoming: conflicting });
  eq(`${action}: 겹친 변경만 충돌로 남긴다`, f.mounted.session.getState().unresolvedCount, 1);
  eq(`${action}: 충돌 밖의 새 변경은 자동 반영한다`, f.mounted.nabi.getJson(), [
    p('local'),
    p('anchor'),
    p('incoming tail'),
  ]);
  ok(`${action}: 충돌이 남으면 확인은 비활성이다`, f.button('confirm').disabled && !(await f.mounted.confirm()));
  f.button(action).click();
  eq(`${action}: 선택한 원본으로 충돌만 교체한다`, f.mounted.nabi.getJson(), [
    p(action === 'base' ? 'base' : 'incoming'),
    p('anchor'),
    p('incoming tail'),
  ]);
  eq(`${action}: 선택하면 충돌 수가 줄어든다`, f.mounted.session.getState().unresolvedCount, 0);
  ok(`${action}: 선택 뒤 확인할 수 있다`, !f.button('confirm').disabled);
  ok(`${action}: 선택을 실행 취소한다`, f.mounted.nabi.undo());
  eq(
    `${action}: 실행 취소는 글과 미해결 상태를 복원한다`,
    [f.mounted.nabi.getJson(), f.mounted.session.getState().unresolvedCount],
    [[p('local'), p('anchor'), p('incoming tail')], 1],
  );
  ok(`${action}: 실행 취소 뒤 확인을 다시 막는다`, f.button('confirm').disabled);
  ok(
    `${action}: 다시 실행하면 해결 상태까지 복원한다`,
    f.mounted.nabi.redo() && f.mounted.session.getState().unresolvedCount === 0 && !f.button('confirm').disabled,
  );
  f.close();
}

{
  const f = fixture({
    base: [p('base first'), p('base second'), p('tail')],
    local: [p('local first'), p('local second'), p('tail')],
    incoming: [p('incoming first'), p('incoming second'), p('tail')],
  });
  eq('인접한 변경도 행별 충돌로 나눈다', f.mounted.session.getState().unresolvedCount, 2);
  eq('오른쪽 각 변경 행에 채택 버튼을 둔다', f.root.querySelectorAll('[data-merge-action="incoming"]').length, 2);
  ok(
    '왼쪽과 오른쪽 채택 버튼은 행 사이에 둔다',
    f.lineButton('base', 0).parentElement?.classList.contains('nabi-merge-gutter') === true &&
      f.lineButton('incoming', 1).parentElement?.classList.contains('nabi-merge-gutter') === true,
  );
  f.lineButton('incoming', 1).click();
  eq('두 번째 행만 채택하면 첫 번째 행은 유지한다', f.mounted.nabi.getJson(), [
    p('local first'),
    p('incoming second'),
    p('tail'),
  ]);
  eq('선택하지 않은 인접 충돌만 남는다', f.mounted.session.getState().unresolvedCount, 1);
  eq('채택한 행은 오른쪽 차이 목록에서 사라진다', f.root.querySelectorAll('[data-merge-action="incoming"]').length, 1);
  f.mounted.nabi.undo();
  eq(
    '행 채택 취소는 문서와 두 충돌을 복원한다',
    [f.mounted.nabi.getJson(), f.mounted.session.getState().unresolvedCount],
    [[p('local first'), p('local second'), p('tail')], 2],
  );
  f.mounted.nabi.redo();
  eq(
    '행 채택 재실행도 해당 행만 바꾼다',
    [f.mounted.nabi.getJson(), f.mounted.session.getState().unresolvedCount],
    [[p('local first'), p('incoming second'), p('tail')], 1],
  );
  f.button('current').click();
  ok('남은 행을 현재 내용으로 해결하면 확인할 수 있다', await f.mounted.confirm());
  f.close();
}

{
  const lines = (first: string, second: string) => ({ w: 'p', ch: [first, { w: 'br', ch: [] }, second] });
  const f = fixture({
    base: [lines('base first', 'base second')],
    local: [lines('local first', 'local second')],
    incoming: [lines('incoming first', 'incoming second')],
  });
  eq(
    '명시적 줄바꿈도 원본에서 독립된 두 행으로 보인다',
    f.root.querySelectorAll('.nabi-merge-incoming .nabi-merge-source-block').length,
    2,
  );
  eq('명시적 줄바꿈마다 채택 버튼을 둔다', f.root.querySelectorAll('[data-merge-action="incoming"]').length, 2);
  f.lineButton('incoming', 1).click();
  eq('두 번째 줄 채택은 첫 줄과 줄바꿈을 보존한다', f.mounted.nabi.getJson(), [
    lines('local first', 'incoming second'),
  ]);
  eq('줄 채택 뒤에도 하나의 문단이다', f.content.children.length, 1);
  f.mounted.nabi.undo();
  eq('줄 채택을 취소하면 같은 문단의 두 줄을 복원한다', f.mounted.nabi.getJson(), [
    lines('local first', 'local second'),
  ]);
  f.close();
}

{
  const f = fixture();
  f.lineButton('base', 2).click();
  eq('충돌 없이 자동 반영한 줄도 원본으로 되돌릴 수 있다', f.mounted.nabi.getJson(), [
    p('local'),
    p('anchor'),
    p('tail'),
  ]);
  eq('자동 반영한 줄을 바꿔도 새 충돌은 만들지 않는다', f.mounted.session.getState().unresolvedCount, 0);
  f.lineButton('incoming', 2).click();
  eq('자동 반영한 줄을 다시 오른쪽에서 가져온다', f.mounted.nabi.getJson(), [
    p('local'),
    p('anchor'),
    p('incoming tail'),
  ]);
  f.close();
}

{
  const f = fixture({ incoming: conflicting });
  const release = f.mounted.session.hold();
  ok(
    '외부 보류 동안 모든 행별 버튼을 비활성화한다',
    [...f.root.querySelectorAll<HTMLButtonElement>('.nabi-merge-line-action')].every((button) => button.disabled),
  );
  f.lineButton('incoming', 0).click();
  eq('외부 보류 중 클릭은 결과를 바꾸지 않는다', f.mounted.nabi.getJson(), [
    p('local'),
    p('anchor'),
    p('incoming tail'),
  ]);
  release();
  ok('외부 보류를 풀면 행별 버튼을 다시 활성화한다', !f.lineButton('incoming', 0).disabled);
  f.close();
}

{
  const f = fixture({ base: [p('Meeting at 9.')], local: [p('Meeting at 10.')], incoming: [p('Meeting at 11.')] });
  await new Promise<void>((resolve) => f.dom.window.requestAnimationFrame(() => resolve()));
  ok(
    '양쪽 원본에 글자 차이를 강조한다',
    !!f.root.querySelector('.nabi-merge-base .nabi-diff-del') &&
      !!f.root.querySelector('.nabi-merge-incoming .nabi-diff-del'),
  );
  ok(
    '결과의 차이 띠는 편집 DOM 밖에 그린다',
    !!f.root.querySelector('.nabi-merge-overlay .nabi-merge-band') &&
      f.content.querySelector('[class*="nabi-merge"], [class*="nabi-diff"]') === null,
  );
  ok(
    '게시 HTML에는 행 번호, 버튼과 차이 표식을 넣지 않는다',
    !/nabi-merge|nabi-diff|data-source-start|data-result-start|data-key/.test(f.mounted.nabi.getHtml()),
  );
  f.close();
}

{
  const f = fixture({ incoming: conflicting });
  selectFirst(f);
  f.mounted.nabi.applyCommand('insertText', { text: 'manual ' });
  eq('직접 수정만 해서는 충돌을 완료하지 않는다', f.mounted.session.getState().unresolvedCount, 1);
  f.button('current').click();
  eq('현재 내용 해결은 직접 쓴 문장을 보존한다', f.mounted.nabi.getJson(), [
    p('manual local'),
    p('anchor'),
    p('incoming tail'),
  ]);
  eq('현재 내용 해결은 충돌을 완료한다', f.mounted.session.getState().unresolvedCount, 0);
  selectFirst(f);
  f.mounted.nabi.applyCommand('insertText', { text: 'polished ' });
  eq('해결한 곳을 다시 수정해도 완료 상태를 유지한다', f.mounted.session.getState().unresolvedCount, 0);
  f.mounted.nabi.undo();
  eq('후속 편집만 되돌리면 해결 상태는 남는다', f.mounted.session.getState().unresolvedCount, 0);
  f.mounted.nabi.undo();
  eq(
    '해결 동작을 되돌리면 글은 유지하고 충돌은 복원한다',
    [f.mounted.nabi.getJson(), f.mounted.session.getState().unresolvedCount],
    [[p('manual local'), p('anchor'), p('incoming tail')], 1],
  );
  f.close();
}

{
  let attempts = 0;
  const errors: unknown[] = [];
  const failure = new Error('save failed');
  const f = fixture({
    onConfirm() {
      attempts += 1;
      if (attempts === 1) throw failure;
      return attempts !== 2;
    },
    onError(error) {
      errors.push(error);
    },
  });
  ok('확인 콜백 예외는 실패로 반환한다', !(await f.mounted.confirm()));
  eq('콜백 예외 뒤 브라우저의 직접 편집도 다시 연다', f.content.getAttribute('contenteditable'), 'true');
  eq('확인 콜백 예외를 onError에 전달한다', errors, [failure]);
  ok(
    '확인 실패를 화면에 알리고 다시 시도할 수 있다',
    !f.root.querySelector<HTMLElement>('[role="alert"]')!.hidden && !f.button('confirm').disabled,
  );
  ok('콜백 false는 완료 처리하지 않는다', !(await f.mounted.confirm()) && !f.button('confirm').disabled);
  eq('확인 거절 뒤 브라우저 편집 상태를 복원한다', f.content.getAttribute('contenteditable'), 'true');
  ok('실패 뒤 성공한 재시도는 완료한다', await f.mounted.confirm());
  eq('재시도 횟수가 맞는다', attempts, 3);
  ok('성공한 재시도는 실패 안내를 감춘다', f.root.querySelector<HTMLElement>('[role="alert"]')!.hidden === true);
  f.close();
}

{
  let settle!: (value: boolean) => void;
  let received: MergeResult | undefined;
  const f = fixture({
    onConfirm(result) {
      received = result;
      return new Promise<boolean>((resolve) => {
        settle = resolve;
      });
    },
  });
  const snapshot = f.mounted.nabi.getJson();
  const promise = f.mounted.confirm();
  ok('저장 대기 중 확인 버튼을 막는다', f.button('confirm').disabled);
  eq('저장 대기 중 브라우저가 DOM에 직접 입력하지 못하게 한다', f.content.getAttribute('contenteditable'), 'false');
  ok('저장 대기 중 중복 호출을 거절한다', !(await f.mounted.confirm()));
  selectFirst(f);
  ok('저장 대기 중 결과 편집을 잠근다', !f.mounted.nabi.applyCommand('insertText', { text: 'late ' }));
  eq('잠긴 문서는 제출한 내용 그대로다', f.mounted.nabi.getJson(), snapshot);
  ok('살아 있는 제출 신호는 취소되지 않는다', received?.signal.aborted === false);
  settle(true);
  ok('비동기 저장이 성공하면 확인을 완료한다', await promise);
  eq('저장 완료 뒤 브라우저 편집을 다시 허용한다', f.content.getAttribute('contenteditable'), 'true');
  ok('저장 뒤 결과 편집 잠금을 푼다', f.mounted.nabi.applyCommand('insertText', { text: 'after ' }));
  f.close();
}

{
  let calls = 0;
  const f = fixture({
    onConfirm() {
      calls += 1;
    },
  });
  f.mounted.session.onChange((state) => {
    if (!state.canConfirm) f.mounted.unmount();
  });
  ok('확인 시작 알림에서 해제된 화면은 확인을 완료하지 않는다', !(await f.mounted.confirm()));
  eq('시작 알림에서 해제되었으면 저장 콜백도 호출하지 않는다', calls, 0);
  eq('확인 시작 중 해제되어도 화면을 다시 만들지 않는다', f.root.childElementCount, 0);
  f.close();
}

{
  let received: MergeResult | undefined;
  const f = fixture({
    onConfirm(result) {
      received = result;
    },
  });
  const snapshot = f.mounted.nabi.getJson();
  const revision = f.mounted.session.getState().revision;
  const attempts: boolean[] = [];
  let attempted = false;
  f.mounted.session.onChange((state) => {
    if (attempted || state.canConfirm) return;
    attempted = true;
    attempts.push(f.mounted.nabi.applyCommand('insertText', { text: 'reentrant edit' }));
  });
  ok('확인 hold 알림에서 재진입해도 일관된 결과를 제출한다', await f.mounted.confirm());
  eq('hold 알림 전에 문서 잠금을 잡는다', attempts, [false]);
  eq(
    '재진입 시도 뒤 제출 JSON과 revision은 같은 시점을 가리킨다',
    [received?.json, received?.revision],
    [snapshot, revision],
  );
  eq('거절한 재진입 입력을 문서에 남기지 않는다', f.mounted.nabi.getJson(), snapshot);
  eq('재진입을 막은 확인도 편집 가능 상태를 복원한다', f.content.getAttribute('contenteditable'), 'true');
  f.close();
}

{
  let settle!: (value: boolean) => void;
  let received: MergeResult | undefined;
  const f = fixture({
    onConfirm(result) {
      received = result;
      return new Promise<boolean>((resolve) => {
        settle = resolve;
      });
    },
  });
  const promise = f.mounted.confirm();
  eq('해제 직전 대기 중에는 브라우저 편집이 꺼져 있다', f.content.getAttribute('contenteditable'), 'false');
  f.mounted.unmount();
  ok('확인 중 해제해도 일시적인 편집 금지 속성을 남기지 않는다', f.content.getAttribute('contenteditable') !== 'false');
  ok('해제는 대기 중인 확인 신호를 취소한다', received?.signal.aborted === true);
  settle(true);
  ok('해제 뒤 도착한 성공은 확인하지 않는다', !(await promise));
  eq('해제 뒤 늦은 결과가 화면을 다시 만들지 않는다', f.root.childElementCount, 0);
  ok('해제한 머지는 확인을 거절한다', !(await f.mounted.confirm()));
  f.close();
}

for (const ending of ['compositionend', 'blur']) {
  let received: MergeResult | undefined;
  const f = fixture({
    onConfirm(result) {
      received = result;
    },
  });
  f.content.focus();
  const text = f.content.querySelector('p')!.firstChild as Text;
  const before = text.data;
  f.owner.getSelection()!.setBaseAndExtent(text, before.length, text, before.length);
  f.content.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart', { bubbles: true }));
  text.data = `${before}한글`;
  f.owner.getSelection()!.setBaseAndExtent(text, text.length, text, text.length);
  eq(`${ending}: 조합 중 실제 DOM 변경은 아직 트리에 반영하지 않는다`, f.mounted.nabi.getJson()[0], p(before));
  ok(`${ending}: 조합값이 확정되기 전에는 제출하지 않는다`, !(await f.mounted.confirm()));
  f.content.dispatchEvent(
    ending === 'blur'
      ? new f.dom.window.FocusEvent('blur')
      : new f.dom.window.CompositionEvent('compositionend', { bubbles: true, data: '한글' }),
  );
  ok(`${ending}: 조합 종료 이벤트 직후 확인할 수 있다`, await f.mounted.confirm());
  eq(`${ending}: surface가 확정한 최신 조합값으로 제출한다`, received?.json[0], p(`${before}한글`));
  eq(`${ending}: 조합 확정은 문서 revision에 포함된다`, received?.revision, 1);
  f.close();
}

{
  const f = fixture({ incoming: conflicting });
  f.content.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart', { bubbles: true }));
  ok(
    'IME 조합 중에는 충돌 원본 선택을 막는다',
    f.button('base').disabled && f.button('incoming').disabled && f.button('current').disabled,
  );
  ok('IME 조합 중에는 API 확인도 막는다', !(await f.mounted.confirm()));
  const id = f.mounted.session.getState().conflicts[0]!.id;
  ok('IME 조합 중 session 직접 해결도 막는다', !f.mounted.session.resolve(id, 'current'));
  f.content.dispatchEvent(new f.dom.window.CompositionEvent('compositionend', { bubbles: true, data: '' }));
  ok('IME 조합이 끝나면 충돌 선택을 다시 허용한다', !f.button('base').disabled && !f.button('current').disabled);
  f.button('current').click();
  ok('IME 뒤 해결한 결과를 확인할 수 있다', await f.mounted.confirm());
  f.close();
}

{
  const f = fixture();
  f.content.dispatchEvent(new f.dom.window.CompositionEvent('compositionstart', { bubbles: true }));
  ok('충돌이 없어도 IME 조합 중에는 확인하지 않는다', f.button('confirm').disabled && !(await f.mounted.confirm()));
  f.content.dispatchEvent(new f.dom.window.FocusEvent('blur'));
  ok('조합 중 포커스를 잃으면 확인 보류를 푼다', !f.button('confirm').disabled);
  f.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="first" class="custom" dir="rtl"></div><div id="second"></div></body></html>',
  );
  const owner = dom.window.document;
  const first = owner.getElementById('first')!;
  const second = owner.getElementById('second')!;
  const options = { base, local, incoming, wings: selectedWings, locale: 'en' };
  const a = mountMerge({ ...options, root: first });
  const b = mountMerge({ ...options, root: second });
  const ownedStyles = () => [...owner.querySelectorAll('style')].filter((style) => style.textContent === MERGE_CSS);
  eq('같은 문서의 머지 화면은 CSS 한 벌을 공유한다', ownedStyles().length, 1);
  a.unmount();
  eq('첫 화면만 해제하면 다른 화면의 CSS는 유지한다', ownedStyles().length, 1);
  eq('해제는 호스트 클래스와 방향을 복원한다', [first.className, first.getAttribute('dir')], ['custom', 'rtl']);
  eq('해제는 생성한 화면을 제거한다', first.childElementCount, 0);
  b.unmount();
  eq('마지막 화면 해제는 소유한 머지 CSS를 제거한다', ownedStyles().length, 0);
  a.unmount();
  b.unmount();
  const hostStyle = owner.createElement('style');
  hostStyle.textContent = MERGE_CSS;
  owner.head.append(hostStyle);
  const c = mountMerge({ ...options, root: first });
  c.unmount();
  ok('호스트가 제공한 같은 CSS는 해제해도 남긴다', hostStyle.isConnected);
  dom.window.close();
}

done('merge-mount');
