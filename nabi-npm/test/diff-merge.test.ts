import { JSDOM } from 'jsdom';
import {
  applyDiffMerge,
  diffMergeChanges,
  mountDiff,
  mountDiffWing,
  type DiffMergeProposal,
} from '../src/diff/index.js';
import { defaultWings, makeRegistry } from '../src/ssr.js';
import { createNabiWith } from '../src/index.js';
import { hostOf } from '../src/editor/host.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const p = (text: string) => ({ w: 'p', ch: [text] });
const br = { w: 'br', ch: [] };
const lineDoc = (first: string, last: string) => [{ w: 'p', ch: [first, br, 'middle', br, last] }];
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

{
  const before = [p('old first'), p('middle'), p('old last')];
  const after = [p('new first'), p('middle'), p('new last')];
  const beforeJson = JSON.stringify(before);
  const afterJson = JSON.stringify(after);
  const plan = diffMergeChanges(before, after, registry)!;
  eq('떨어진 문단 변경을 각각 반영한다', plan.changes.length, 2);
  const result = applyDiffMerge(before, after, plan.changes[0]!.id, registry);
  eq('한 묶음만 이전 내용으로 돌린다', result, [p('old first'), p('middle'), p('new last')]);
  eq('원본은 바뀌지 않는다', [JSON.stringify(before), JSON.stringify(after)], [beforeJson, afterJson]);
  eq('다시 비교하면 남은 변경만 있다', diffMergeChanges(before, result, registry)?.changes.length, 1);
  eq('갱신 뒤 예전 변경 ID는 거절한다', applyDiffMerge(before, result, plan.changes[1]!.id, registry), null);
}

{
  const before = lineDoc('old first', 'old last');
  const after = lineDoc('new first', 'new last');
  const plan = diffMergeChanges(before, after, registry)!;
  eq('명시적 줄바꿈을 사이에 둔 변경은 나뉜다', plan.changes.length, 2);
  eq(
    '줄 적용은 같은 문단의 다른 줄을 유지한다',
    applyDiffMerge(before, after, plan.changes[0]!.id, registry),
    lineDoc('old first', 'new last'),
  );
  eq('다음 줄의 위치는 UTF-16과 br을 센다', plan.changes[1]!.afterPosition, {
    block: 0,
    offset: 'new first'.length + 1 + 'middle'.length + 1,
  });
}

for (const [name, before, after] of [
  ['추가', [p('lead'), p('tail')], [p('lead'), p('added'), p('tail')]],
  ['삭제', [p('lead'), p('removed'), p('tail')], [p('lead'), p('tail')]],
  ['이동', [p('one'), p('two'), p('three')], [p('two'), p('three'), p('one')]],
  ['반복 문단 이동', [p('dup'), p('dup'), p('tail')], [p('tail'), p('dup'), p('dup')]],
] as const) {
  const plan = diffMergeChanges(before, after, registry)!;
  eq(`${name}은 한 번에 복원한다`, plan.changes.length, 1);
  eq(`${name}은 복제 없이 원래 순서가 된다`, applyDiffMerge(before, after, plan.changes[0]!.id, registry), before);
}

{
  const before = [{ w: 'p', ch: ['same'] }];
  const after = [{ w: 'p', ch: [{ w: 'b', ch: ['same'] }] }];
  const plan = diffMergeChanges(before, after, registry)!;
  eq('서식만 바뀌어도 적용 대상이다', plan.changes.length, 1);
  eq('서식은 원본 트리에서 복원한다', applyDiffMerge(before, after, plan.changes[0]!.id, registry), before);
  eq('동일 문서는 적용 대상이 없다', diffMergeChanges(before, before, registry)?.changes, []);
  eq('없는 ID는 적용하지 않는다', applyDiffMerge(before, after, 'missing', registry), null);
  eq('잘못된 입력은 거절한다', diffMergeChanges(null, after, registry), null);
  eq(
    '해석할 날개가 없는 입력은 거절한다',
    diffMergeChanges([{ w: 'p', ch: [{ w: 'unknown-wing', ch: ['keep me'] }] }], after, registry),
    null,
  );
}

function fixture(onMerge?: (proposal: DiffMergeProposal) => void | Promise<void>, onError?: (error: unknown) => void) {
  const dom = new JSDOM('<!doctype html><html><body><div id="diff"></div></body></html>');
  const root = dom.window.document.getElementById('diff')!;
  const before = [p('before')];
  const after = [p('after')];
  const mounted = mountDiff({ root, before, after, registry, onMerge, onError });
  const button = () => root.querySelector<HTMLButtonElement>('.nabi-diff-merge-action');
  return {
    dom,
    root,
    mounted,
    button,
    before,
    after,
    close() {
      mounted.unmount();
      dom.window.close();
    },
  };
}

{
  const f = fixture();
  eq('기본 비교는 머지 버튼이 없다', f.button(), null);
  ok('기존 두 인자 update를 유지한다', f.mounted.update(f.before, f.after));
  f.close();
}

{
  const proposals: DiffMergeProposal[] = [];
  const f = fixture((proposal) => {
    proposals.push(proposal);
  });
  f.button()!.click();
  eq('클릭은 콜백에 적용 후보를 보낸다', proposals.length, 1);
  const proposal = proposals[0]!;
  eq('이전에서 현재 방향으로 결과를 만든다', proposal.result, f.before);
  ok('호스트가 수용하기 전 비교는 그대로다', f.root.querySelector('.nabi-diff-after')!.textContent!.includes('after'));
  ok('전달한 revision으로 수용한다', f.mounted.update(proposal.before, proposal.result, proposal.revision));
  ok('수용하면 기존 요청 signal을 중단한다', proposal.signal.aborted);
  eq('수용 뒤 해결된 버튼은 사라진다', f.button(), null);
  ok('같은 revision을 다시 수용하지 않는다', !f.mounted.update(proposal.before, proposal.result, proposal.revision));
  await tick();
  f.close();
}

{
  const proposals: DiffMergeProposal[] = [];
  let release!: () => void;
  const f = fixture((proposal) => {
    proposals.push(proposal);
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  });
  const oldButton = f.button()!;
  oldButton.click();
  oldButton.click();
  eq('대기 중에는 중복 콜백이 없다', proposals.length, 1);
  ok('대기 중에는 적용 버튼을 끈다', oldButton.disabled);
  const old = proposals[0]!;
  f.mounted.update(f.before, [p('new incoming')]);
  ok('다른 입력으로 갱신하면 대기를 중단한다', old.signal.aborted);
  oldButton.click();
  eq('갱신 전 버튼은 실행되지 않는다', proposals.length, 1);
  ok('오래된 응답으로 새 입력을 덮지 않는다', !f.mounted.update(old.before, old.result, old.revision));
  release();
  await tick();
  ok('오래된 완료는 새 버튼을 막지 않는다', !f.button()!.disabled);
  f.close();
}

{
  let proposal: DiffMergeProposal | undefined;
  let reject!: (error: unknown) => void;
  let failures = 0;
  const f = fixture(
    (value) => {
      proposal = value;
      return new Promise<void>((_resolve, fail) => {
        reject = fail;
      });
    },
    () => {
      failures += 1;
    },
  );
  f.button()!.click();
  f.close();
  ok('해제하면 요청 signal을 중단한다', proposal!.signal.aborted);
  ok('해제 뒤 update를 거절한다', !f.mounted.update(proposal!.before, proposal!.result, proposal!.revision));
  reject(new Error('late error'));
  await tick();
  eq('해제 뒤 콜백 실패를 다시 전달하지 않는다', failures, 0);
}

{
  const failure = new Error('host refused');
  const failures: unknown[] = [];
  const f = fixture(
    () => {
      throw failure;
    },
    (error) => {
      failures.push(error);
    },
  );
  f.button()!.click();
  eq('호스트 예외는 onError로 전달한다', failures, [failure]);
  ok('실패 뒤 다시 적용할 수 있다', !f.button()!.disabled);
  ok('실패로 문서를 바꾸지 않는다', f.root.querySelector('.nabi-diff-after')!.textContent!.includes('after'));
  f.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const previousParser = globalThis.DOMParser;
  globalThis.DOMParser = dom.window.DOMParser;
  try {
    const before = '<p>old</p><p>tail</p>';
    const after = '<p>new</p><p>tail</p>';
    const plan = diffMergeChanges(before, after, registry)!;
    eq('HTML도 정규화한 트리로 적용한다', applyDiffMerge(before, after, plan.changes[0]!.id, registry), [
      p('old'),
      p('tail'),
    ]);
  } finally {
    globalThis.DOMParser = previousParser;
    dom.window.close();
  }
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="surface" tabindex="0"></div></body></html>');
  const surface = dom.window.document.getElementById('surface')!;
  const { nabi, registry: editorRegistry } = createNabiWith([], { doc: [p('base')], typingMergeMs: 0 });
  const wing = mountDiffWing({ nabi, registry: editorRegistry, surface });
  nabi.applyCommand('insertText', { text: 'local ' });
  const local = nabi.getJson();
  wing.open();
  const button = () => dom.window.document.querySelector<HTMLButtonElement>('.nabi-diff-merge-action');
  ok('날개 머지는 기본으로 켜진다', button() !== null);
  button()!.click();
  eq('날개 머지는 현재 편집기에 반영한다', nabi.getJson(), [p('base')]);
  eq('날개 머지는 로드 기준을 옮기지 않는다', wing.baseline(), [p('base')]);
  ok('날개 머지는 undo 한 번으로 되돌린다', nabi.undo());
  eq('undo는 내 원래 편집을 복원한다', nabi.getJson(), local);
  eq('undo 뒤에도 로드 기준은 같다', wing.baseline(), [p('base')]);
  const stale = button()!;
  nabi.applyCommand('insertText', { text: 'later ' });
  nabi.undo();
  stale.click();
  eq('변경 후 undo해도 낡은 날개 버튼을 거절한다', nabi.getJson(), local);
  const release = hostOf(nabi).lock('upload');
  button()!.click();
  eq('편집기 잠금 중에는 날개 머지를 적용하지 않는다', nabi.getJson(), local);
  release();
  await tick();
  button()!.click();
  eq('잠금 해제 뒤 다시 적용할 수 있다', nabi.getJson(), [p('base')]);
  wing.unmount();
  const readonlyWing = mountDiffWing({ nabi, registry: editorRegistry, surface, merge: false });
  nabi.applyCommand('insertText', { text: 'new local ' });
  readonlyWing.open();
  eq('날개 머지도 명시적으로 끌 수 있다', button(), null);
  readonlyWing.unmount();
  dom.window.close();
}

done('diff-merge');
