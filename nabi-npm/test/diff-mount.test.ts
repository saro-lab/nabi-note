import { JSDOM } from 'jsdom';
import { mountDiff } from '../src/diff/index.js';
import { makeRegistry } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const before = Array.from({ length: 7 }, (_, index) => ({ w: 'p', ch: [`Paragraph ${index}`] }));
const after = before.map((block, index) => (index === 3 ? { w: 'p', ch: ['Paragraph 3 changed'] } : block));

function fixture(first: unknown, second: unknown) {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="diff"></div></body></html>');
  const root = dom.window.document.getElementById('diff') as HTMLElement;
  const mounted = mountDiff({ root, before: first, after: second, registry });
  const toggle = root.querySelector<HTMLButtonElement>('[aria-pressed]')!;
  const count = root.querySelector('.nabi-diff-count')!;
  const shown = (side: 'before' | 'after'): string[] =>
    [...root.querySelectorAll<HTMLElement>(`.nabi-diff-${side} .nabi-diff-block`)]
      .filter((block) => {
        const child = block.firstElementChild;
        return (
          dom.window.getComputedStyle(block).display !== 'none' &&
          child !== null &&
          dom.window.getComputedStyle(child).display !== 'none'
        );
      })
      .map((block) => block.textContent ?? '');
  return {
    root,
    mounted,
    toggle,
    count,
    shown,
    close() {
      mounted.unmount();
      dom.window.close();
    },
  };
}

{
  const f = fixture(before, after);
  ok(
    '변경이 있으면 변경 부분만 보기로 시작한다',
    f.toggle.getAttribute('aria-pressed') === 'true' && !f.toggle.disabled,
  );
  eq('처음 변경 수를 표시한다', f.count.textContent, '0 / 1');
  eq('원본은 변경 앞뒤 맥락만 남긴다', f.shown('before'), ['Paragraph 2', 'Paragraph 3', 'Paragraph 4']);
  eq('수정본은 변경 앞뒤 맥락만 남긴다', f.shown('after'), ['Paragraph 2', 'Paragraph 3 changed', 'Paragraph 4']);
  f.toggle.click();
  eq(
    '접기를 끄면 원본 전체를 표시한다',
    f.shown('before'),
    before.map((block) => block.ch[0]),
  );
  eq(
    '접기를 끄면 수정본 전체를 표시한다',
    f.shown('after'),
    after.map((block) => block.ch[0]),
  );
  eq('전체 보기 상태를 알린다', f.toggle.getAttribute('aria-pressed'), 'false');
  f.toggle.click();
  eq('다시 접으면 변경 부분만 남긴다', f.shown('after'), ['Paragraph 2', 'Paragraph 3 changed', 'Paragraph 4']);
  f.mounted.update(before, before);
  ok('변경이 사라지면 접기 단추를 끈다', f.toggle.disabled && f.toggle.getAttribute('aria-pressed') === 'false');
  eq('변경이 사라지면 변경 수는 0이다', f.count.textContent, '0 / 0');
  eq(
    '변경이 사라지면 문서 전체를 표시한다',
    f.shown('after'),
    before.map((block) => block.ch[0]),
  );
  f.toggle.click();
  eq(
    '비활성 접기 단추는 문서를 숨기지 않는다',
    f.shown('after'),
    before.map((block) => block.ch[0]),
  );
  f.mounted.update(before, after);
  ok(
    '변경이 다시 생기면 앞서 선택한 접기를 복원한다',
    !f.toggle.disabled && f.toggle.getAttribute('aria-pressed') === 'true',
  );
  eq('복원한 접기는 변경 앞뒤 맥락을 남긴다', f.shown('after'), ['Paragraph 2', 'Paragraph 3 changed', 'Paragraph 4']);
  f.close();
}

{
  const f = fixture(before, before);
  ok('동일 문서는 접기 없이 시작한다', f.toggle.disabled && f.toggle.getAttribute('aria-pressed') === 'false');
  eq(
    '동일 문서의 원본 전체가 보인다',
    f.shown('before'),
    before.map((block) => block.ch[0]),
  );
  eq(
    '동일 문서의 수정본 전체가 보인다',
    f.shown('after'),
    before.map((block) => block.ch[0]),
  );
  f.toggle.click();
  f.mounted.update(before, after);
  eq('동일 문서로 시작해도 변경이 생기면 기본 접기를 쓴다', f.toggle.getAttribute('aria-pressed'), 'true');
  f.toggle.click();
  f.mounted.update(before, before);
  f.mounted.update(before, after);
  eq('전체 보기 선택은 변경이 없어졌다가 생겨도 유지한다', f.toggle.getAttribute('aria-pressed'), 'false');
  eq(
    '유지한 전체 보기는 수정본을 모두 표시한다',
    f.shown('after'),
    after.map((block) => block.ch[0]),
  );
  f.close();
}

{
  const f = fixture(before, after);
  f.mounted.update(null, after);
  ok('잘못된 입력은 접기를 비활성화한다', f.toggle.disabled && f.toggle.getAttribute('aria-pressed') === 'false');
  eq('잘못된 입력은 변경 수를 비운다', f.count.textContent, '0 / 0');
  eq('잘못된 입력은 이전 문서를 남기지 않는다', f.root.querySelectorAll('.nabi-diff-block').length, 0);
  f.mounted.update([], []);
  ok(
    '빈 문서끼리 비교해도 접기를 비활성화한다',
    f.toggle.disabled && f.toggle.getAttribute('aria-pressed') === 'false',
  );
  f.mounted.update(before, after);
  eq('유효한 비교를 다시 받으면 접기 선택을 복원한다', f.toggle.getAttribute('aria-pressed'), 'true');
  f.close();
}

done('diff-mount');
