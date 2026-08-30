// 0.9 P1 회귀망 - 원인이 한 함수나 한 수명 경계로 좁혀지는 사례만 먼저 고정한다.
import { JSDOM } from 'jsdom';
import { safeUrl } from '../src/html/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { injectSheets } from '../src/ui/index.js';
import { mountSurface, type Surface } from '../src/surface/index.js';
import { rankRows } from '../src/viewer/index.js';
import { done, eq, ok } from './net.js';

eq('URL - 브라우저가 외부 호스트로 해석하는 역슬래시 상대 주소를 거절한다', safeUrl('/\\evil.example/x', true), null);

{
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['정본'] }] });
  const canonical = nabi.getEditorHtml();
  const holder = dom.window.document.createElement('div');
  holder.innerHTML = canonical;
  const key = holder.firstElementChild?.getAttribute('data-key') ?? '';
  root.innerHTML = `<h1 data-key="${key}" data-nabi-align="r">다른 DOM</h1>`;

  const surface = mountSurface({ nabi, registry, root, hydrate: true });
  const adopted = root.firstElementChild;
  ok(
    'hydrate - key만 같고 태그/속성/텍스트가 다른 DOM은 입양하지 않는다',
    adopted?.tagName === 'P' && adopted.textContent === '정본' && !adopted.hasAttribute('data-nabi-align'),
    root.innerHTML,
  );
  surface.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  const first = injectSheets(dom.window.document, ['.shared { color: red; }']);
  const second = injectSheets(dom.window.document, ['.shared { color: red; }']);
  first();
  eq(
    'CSS refcount - 첫 사용자가 떼어도 둘째 사용자의 공용 시트는 남는다',
    dom.window.document.head.querySelectorAll('style').length,
    1,
  );
  second();
  eq(
    'CSS refcount - 마지막 사용자가 떼면 공용 시트가 사라진다',
    dom.window.document.head.querySelectorAll('style').length,
    0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const first = createNabiWith([], { doc: [{ w: 'p', ch: ['첫째'] }] });
  const second = createNabiWith([], { doc: [{ w: 'p', ch: ['둘째'] }] });
  const mounted: Surface[] = [mountSurface({ ...first, root })];
  let rejected = false;
  try {
    mounted.push(mountSurface({ ...second, root }));
  } catch {
    rejected = true;
  }
  ok('같은 root - 활성 surface의 중복 mount를 즉시 거절한다', rejected);
  for (const surface of mounted.reverse()) surface.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="first"></div><div id="second"></div>');
  const firstRoot = dom.window.document.getElementById('first') as HTMLElement;
  const secondRoot = dom.window.document.getElementById('second') as HTMLElement;
  const first = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const second = createNabiWith([], { doc: [{ w: 'p', ch: ['B'] }] });
  const firstSurface = mountSurface({ ...first, root: firstRoot });
  const secondSurface = mountSurface({ ...second, root: secondRoot });
  firstSurface.unmount();
  second.nabi.select({
    anchor: { path: [0], offset: 1 },
    focus: { path: [0], offset: 1 },
  });
  second.nabi.applyCommand('insertText', { text: 'C' });
  eq('Q10 document 공유 - 한 root를 unmount해도 다른 root의 surface는 계속 동작한다', secondRoot.textContent, 'BC');
  secondSurface.unmount();
  dom.window.close();
}

{
  let answer: readonly number[] | null = null;
  let threw = false;
  try {
    answer = rankRows(['나', '가'], 'ascending', '');
  } catch {
    threw = true;
  }
  ok('빈 lang - 표 정렬은 RangeError 없이 기본 locale로 정렬한다', !threw && JSON.stringify(answer) === '[1,0]');
}

{
  const doc = [
    {
      w: 'p',
      ch: [
        {
          w: 'details',
          a: { o: 1 },
          ch: [
            { w: 'summary', ch: ['제목'] },
            { w: 'p', ch: [{ w: 'code', ch: ['const x = 1'] }] },
            { w: 'p', ch: [{ w: 'img', a: { src: 'https://example.com/a.png', w: '60' }, ch: [] }] },
            { w: 'p', ch: [{ w: 'youtube', a: { v: 'dQw4w9WgXcQ', w: '70' }, ch: [] }] },
          ],
        },
      ],
    },
  ];
  const { nabi } = createNabiWith(defaultWings, { doc });
  nabi.select({
    anchor: { path: [0, 0, 1, 0], offset: 1 },
    focus: { path: [0, 0, 1, 0], offset: 1 },
  });
  const changed = nabi.applyCommand('setCodeLanguage', { lang: 'typescript' });
  const nested = (((nabi.getJson()[0] as { ch: unknown[] }).ch[0] as { ch: unknown[] }).ch[1] as { ch: unknown[] })
    .ch[0] as {
    a?: Readonly<Record<string, unknown>>;
  };
  ok(
    '중첩 wing command - details 안 코드의 언어를 실제 소유 경로에서 바꾼다',
    changed && nested.a?.['lang'] === 'typescript',
  );

  nabi.select({
    anchor: { path: [0, 0, 2], offset: 0 },
    focus: { path: [0, 0, 2], offset: 1 },
  });
  const imageChanged = nabi.applyCommand('setImageWidth', { w: '80' });
  const image = (((nabi.getJson()[0] as { ch: unknown[] }).ch[0] as { ch: unknown[] }).ch[2] as { ch: unknown[] })
    .ch[0] as {
    a?: Readonly<Record<string, unknown>>;
  };
  ok(
    '중첩 wing command - details 안 img wrapper에서 실제 이미지 경로를 바꾼다',
    imageChanged && image.a?.['w'] === '80',
  );

  nabi.select({
    anchor: { path: [0, 0, 3], offset: 0 },
    focus: { path: [0, 0, 3], offset: 1 },
  });
  const youtubeChanged = nabi.applyCommand('setYoutubeWidth', { w: '90' });
  const youtube = (((nabi.getJson()[0] as { ch: unknown[] }).ch[0] as { ch: unknown[] }).ch[3] as { ch: unknown[] })
    .ch[0] as {
    a?: Readonly<Record<string, unknown>>;
  };
  ok(
    '중첩 wing command - details 안 youtube wrapper에서 실제 영상 경로를 바꾼다',
    youtubeChanged && youtube.a?.['w'] === '90',
  );

  nabi.select({
    anchor: { path: [0, 0, 1, 0], offset: 1 },
    focus: { path: [0, 0, 1, 0], offset: 1 },
  });
  const detailsChanged = nabi.applyCommand('setDetailsOpen', { open: false });
  const details = (nabi.getJson()[0] as { ch: Array<{ a?: Readonly<Record<string, unknown>> }> }).ch[0];
  ok(
    '중첩 wing command - 깊은 code 선택에서 실제 details 조상 경로를 바꾼다',
    detailsChanged && details?.a?.['o'] === undefined,
  );
}

{
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, {
    doc: [{ w: 'p', ch: [{ w: 'code', a: { lang: 'typescript' }, ch: [] }] }],
  });
  const surface = mountSurface({ nabi, registry, root });
  const code = root.querySelector('[data-nabi-code]') ?? root.querySelector('pre');
  ok(
    '빈 code highlight - 색칠 뒤에도 caret용 filler br가 남는다',
    code?.querySelector('br[data-nabi-filler]') !== null,
    root.innerHTML,
  );
  surface.unmount();
  dom.window.close();
}

done('regression-p1');
