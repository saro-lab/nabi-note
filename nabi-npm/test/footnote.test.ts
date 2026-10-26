// 각주 그물 — 인라인 단말 정규화, 저장·편집 HTML, 왕복, 커맨드, 캐럿 칸, md, diff, 편집 표면(번호·하단 목록·지우기)을 고정한다.
// Footnote net: pins inline-terminal normalization, stored/editor HTML, round trips, commands, caret units, md, diff, and the editing surface (numbers, list, deletion).
import { JSDOM } from 'jsdom';
import { cocoon, lengthOf, type ElementNode, type NabiNode } from '../src/schema/index.js';
import { deleteBackward, terminalOf, type Position } from '../src/doc/index.js';
import type { Selection } from '../src/caret/index.js';
import { $createNabiWith, createNabiWith, makeRegistry, renderStoredHtml } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { renderMarkdown, parseMarkdown } from '../src/io/index.js';
import { mdEnvOf } from '../src/surface/filters.js';
import { mountSurface } from '../src/surface/index.js';
import { domTextOf, fromDomPoint, toDomPoint } from '../src/surface/map.js';
import { diffDocs } from '../src/diff/index.js';
import { attachViewer } from '../src/viewer/index.js';
import { hostOf } from '../src/editor/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const env = registry.env;

const el = (w: string, ch: readonly NabiNode[] = [], a?: Record<string, string | number>): ElementNode =>
  a ? { w, a, ch } : { w, ch };
const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode => el('p', ch, a);
const fn = (t: string): ElementNode => el('fn', [], { t });
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const range = (a: Position, b: Position): Selection => ({ anchor: a, focus: b });
const make = (doc: readonly unknown[]) => $createNabiWith(defaultWings, { doc, parseHtml: tinyHtml }).nabi;
const strip = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

// --- 정규화 -----------------------------------------------------------------------------------

{
  const doc = cocoon([p(['본문', fn('첫 각주'), '이어서'])], env);
  const middle = (doc[0] as ElementNode).ch[1] as ElementNode;
  ok(
    '정규화 — 각주는 글자 사이에 그대로 선다',
    (doc[0] as ElementNode).ch.length === 3 &&
      middle.w === 'fn' &&
      middle.a?.['t'] === '첫 각주' &&
      middle.ch.length === 0,
    JSON.stringify(doc),
  );
  eq('정규화 — 각주는 캐럿 한 칸이다', lengthOf(doc[0] as ElementNode, terminalOf(env)), 6);

  const cleaned = make([p(['a', { w: 'fn', a: { t: '  둘째\n 줄\t탭 ' }, ch: ['버려질 속'] }])]).getJson();
  eq('정규화 — 줄바꿈·탭은 공백, 앞뒤 공백은 정리, 속은 비운다', cleaned, [
    { w: 'p', ch: ['a', { w: 'fn', a: { t: '둘째 줄 탭' }, ch: [] }] },
  ]);

  const empty = make([p(['a', { w: 'fn', a: { t: '  \n ' }, ch: [] }, 'b'])]).getJson();
  eq('정규화 — 빈 각주는 사라진다', empty, [{ w: 'p', ch: ['ab'] }]);

  const loose = make([fn('맨몸')]).getJson();
  eq('정규화 — 문단 밖 각주는 문단에 감싸인다', loose, [{ w: 'p', ch: [{ w: 'fn', a: { t: '맨몸' }, ch: [] }] }]);

  const coded = make([p([el('code', ['x', fn('코드 속')])])]).getJson() as { ch: { ch: unknown[] }[] }[];
  ok('정규화 — 코드 상자 속 각주는 걷힌다', !JSON.stringify(coded).includes('"fn"'), JSON.stringify(coded));
}

// --- HTML ---------------------------------------------------------------------------------------

{
  const nabi = make([p(['가', fn('하나 <b>"&\''), '나']), p([el('b', ['굵게', fn('둘')])], { h: 2 })]);
  const html = nabi.getHtml();
  ok(
    '저장 HTML — 번호는 문서 순서, 내용은 이스케이프된 속성',
    html.includes('<sup data-nabi-fn="하나 &lt;b&gt;&quot;&amp;&#39;">[1]</sup>') &&
      html.includes('<sup data-nabi-fn="둘">[2]</sup>'),
    html,
  );
  ok(
    '저장 HTML — 문서 끝 목록이 붙고 내용은 글자 그대로다',
    html.endsWith(
      '<section data-nabi-footnotes><ol><li data-nabi-fn-n="1"><span data-nabi-fn-num>[1]</span> 하나 &lt;b&gt;"&amp;\'</li><li data-nabi-fn-n="2"><span data-nabi-fn-num>[2]</span> 둘</li></ol></section>',
    ),
    html,
  );
  eq('저장 HTML — renderStoredHtml도 같다', renderStoredHtml(nabi.getJson(), registry), html);

  const editor = nabi.getEditorHtml();
  ok(
    '편집 HTML — 번호 없는 봉해진 표식이고 목록은 없다',
    editor.includes('<span data-nabi-terminal contenteditable="false" draggable="false" data-nabi-fn="둘"></span>') &&
      !editor.includes('data-nabi-footnotes') &&
      !editor.includes('[1]'),
    editor,
  );

  const trailing = make([p(['끝', fn('마지막')])]).getEditorHtml();
  ok(
    '편집 HTML — 끝의 각주 뒤에 받침 br',
    trailing.includes('data-nabi-fn="마지막"></span><br data-nabi-filler/>'),
    trailing,
  );

  const none = make([p(['각주 없음'])]).getHtml();
  ok('저장 HTML — 각주가 없으면 목록도 없다', !none.includes('data-nabi-footnotes'), none);
}

// --- 왕복 ---------------------------------------------------------------------------------------

{
  const text =
    '참고 (https://example.com/a_(b)). HTTP://EXAMPLE.COM?q=1&x=2 및 https://예시.한국/문서, ' +
    '<img src=x onerror=alert(1)> javascript:alert(1) data:text/html,x blob:https://example.com/id ' +
    'https://bad\\host.test https://';
  const nabi = make([p(['가', fn(text)])]);
  const dom = new JSDOM(nabi.getHtml());
  const section = dom.window.document.querySelector('[data-nabi-footnotes]')!;
  eq('URL — 표시 글자는 문장 부호와 HTML처럼 보이는 내용까지 그대로다', section.textContent, `[1] ${text}`);
  eq(
    'URL — 허용된 HTTP 주소만 정규화된 링크로 바꾼다',
    Array.from(section.querySelectorAll('a')).map((link) => [link.textContent, link.getAttribute('href')]),
    [
      ['https://example.com/a_(b)', 'https://example.com/a_(b)'],
      ['HTTP://EXAMPLE.COM?q=1&x=2', 'http://example.com/?q=1&x=2'],
      ['https://예시.한국/문서', new URL('https://예시.한국/문서').href],
    ],
  );
  ok('URL — HTML처럼 보이는 내용은 실행 가능한 요소가 아니다', !section.querySelector('img, script, [onerror]'));
  const back = make([]);
  back.setHtml(nabi.getHtml());
  eq('URL — 링크가 있는 하단 목록을 다시 읽어도 저장 내용은 평문 각주다', back.getJson(), nabi.getJson());
  dom.window.close();
}

{
  const text = [
    "https://example.com/O'Reilly",
    "'https://example.org/O'Reilly'.",
    '"https://example.net/quoted"',
    'https://example.com/%22quoted%22',
    "https://example.com/?q=O'Reilly",
  ].join(' ');
  const nabi = make([p(['가', fn(text)])]);
  const dom = new JSDOM(`<article class="nabi-content">${nabi.getHtml()}</article>`);
  const article = dom.window.document.querySelector<HTMLElement>('article')!;
  const viewer = attachViewer(article);
  article.querySelector<HTMLElement>('sup[data-nabi-fn]')!.click();
  for (const selector of ['[data-nabi-footnotes]', '.nabi-fn-tip']) {
    const content = article.querySelector(selector)!;
    eq(`URL 인용부호 ${selector} — 보이는 원문은 그대로다`, content.textContent, `[1] ${text}`);
    eq(
      `URL 인용부호 ${selector} — 내부 작은따옴표는 보존하고 둘러싼 인용부호만 제외한다`,
      Array.from(content.querySelectorAll('a')).map((link) => [link.textContent, link.getAttribute('href')]),
      [
        ["https://example.com/O'Reilly", "https://example.com/O'Reilly"],
        ["https://example.org/O'Reilly", "https://example.org/O'Reilly"],
        ['https://example.net/quoted', 'https://example.net/quoted'],
        ['https://example.com/%22quoted%22', 'https://example.com/%22quoted%22'],
        ["https://example.com/?q=O'Reilly", 'https://example.com/?q=O%27Reilly'],
      ],
    );
  }
  viewer.unmount();
  dom.window.close();
}

{
  const source = make([p(['가', fn('하나 <i>'), '나', fn('둘')]), p(['다', fn('셋')])]);
  const back = make([]);
  back.setHtml(source.getHtml());
  eq('왕복 — HTML을 다시 읽어도 각주는 한 번씩만 돌아오고 목록은 본문이 되지 않는다', back.getJson(), source.getJson());

  const pasted = make([]);
  pasted.setHtml('<p>밖<sup data-nabi-fn="  남의 \n 각주 ">[7]</sup></p><p>그냥<sup>1</sup></p>');
  eq('가져오기 — 속의 번호는 버리고 속성만 읽으며, 남의 sup은 위첨자로 남는다', pasted.getJson(), [
    { w: 'p', ch: ['밖', { w: 'fn', a: { t: '남의 각주' }, ch: [] }] },
    { w: 'p', ch: ['그냥', { w: 'sup', ch: ['1'] }] },
  ]);
}

// --- 커맨드 -------------------------------------------------------------------------------------

{
  const nabi = make([p(['가나다'])]);
  nabi.select(range(at([0], 1), at([0], 1)));
  ok('insertFootnote — 캐럿 자리에 선다', nabi.applyCommand('insertFootnote', { t: ' 첫 \n줄 ' }));
  eq('insertFootnote — 내용은 한 줄로', nabi.getJson(), [
    { w: 'p', ch: ['가', { w: 'fn', a: { t: '첫 줄' }, ch: [] }, '나다'] },
  ]);
  eq('insertFootnote — 캐럿은 각주 뒤', nabi.getSelection(), range(at([0], 2), at([0], 2)));
  ok('insertFootnote — 빈 내용은 거절', !nabi.applyCommand('insertFootnote', { t: '   ' }));

  nabi.select(range(at([0], 3), at([0], 1)));
  ok('insertFootnote — 범위면 선택 끝에 넣는다', nabi.applyCommand('insertFootnote', { t: '둘' }));
  eq('insertFootnote — 고른 글자는 그대로', nabi.getJson(), [
    {
      w: 'p',
      ch: ['가', { w: 'fn', a: { t: '첫 줄' }, ch: [] }, '나', { w: 'fn', a: { t: '둘' }, ch: [] }, '다'],
    },
  ]);

  nabi.select(range(at([0], 1), at([0], 2)));
  ok('setFootnote — 꼭 고른 각주의 내용을 바꾼다', nabi.applyCommand('setFootnote', { t: '고친 내용' }));
  ok('setFootnote — 같은 값은 바뀐 것이 없다', !nabi.applyCommand('setFootnote', { t: '고친 내용' }));
  nabi.select(range(at([0], 0), at([0], 2)));
  ok('setFootnote — 각주 하나를 꼭 맞게 덮지 않으면 거절', !nabi.applyCommand('setFootnote', { t: 'x' }));

  nabi.select(range(at([0], 3), at([0], 4)));
  ok('removeFootnote — 꼭 고른 각주를 지운다', nabi.applyCommand('removeFootnote'));
  eq('removeFootnote — 나머지는 그대로', nabi.getJson(), [
    { w: 'p', ch: ['가', { w: 'fn', a: { t: '고친 내용' }, ch: [] }, '나다'] },
  ]);
  ok('undo — 지운 각주가 돌아온다', nabi.undo() && JSON.stringify(nabi.getJson()).includes('"둘"'));

  const linked = make([p([el('a', ['링크글'], { href: 'https://example.com/' }), '뒤'])]);
  linked.select(range(at([0], 1), at([0], 1)));
  linked.applyCommand('insertFootnote', { t: '링크 밖' });
  eq('insertFootnote — 링크 글자 안이면 링크 끝 뒤에 선다', linked.getJson(), [
    {
      w: 'p',
      ch: [
        { w: 'a', a: { href: 'https://example.com/' }, ch: ['링크글'] },
        { w: 'fn', a: { t: '링크 밖' }, ch: [] },
        '뒤',
      ],
    },
  ]);

  const coded = make([p([el('code', ['x'])])]);
  coded.select(range(at([0, 0], 1), at([0, 0], 1)));
  ok('insertFootnote — 코드 상자 안에서는 거절', !coded.applyCommand('insertFootnote', { t: '코드' }));

  const doc = cocoon([p(['a', fn('x'), 'b'])], env);
  const back = deleteBackward(doc, at([0], 2), env);
  eq('deleteBackward — 각주는 한 칸으로 지워진다', strip(back.doc[0]?.ch), ['ab']);
}

// --- Markdown -----------------------------------------------------------------------------------

{
  const doc = cocoon([p(['가', fn('하나 [괄호] *별*'), '나']), p(['다', fn('둘')])], env);
  const md = renderMarkdown(doc, {
    env,
    builders: registry.mdBuilders,
    appendices: registry.mdAppendices,
    html: { env, builders: registry.builders },
  });
  eq('md — 본문은 [^n], 끝에 정의 줄', md, '가[^1]나\n\n다[^2]\n\n[^1]: 하나 \\[괄호\\] \\*별\\*\n[^2]: 둘');
  const back = cocoon(parseMarkdown(md, mdEnvOf(registry)), env);
  eq('md — 다시 읽으면 같은 각주', strip(back), strip(doc));
  const literal = parseMarkdown('없는[^9] 이름과\n\n```\n[^1]: 코드 속\n```', mdEnvOf(registry));
  ok(
    'md — 정의 없는 참조와 코드 울타리 속 줄은 글자 그대로',
    !JSON.stringify(literal).includes('"fn"'),
    JSON.stringify(literal),
  );
}

// --- diff ---------------------------------------------------------------------------------------

{
  const before = [p(['둘째', fn('B')]), p(['셋째', fn('C')])];
  const shifted = [p(['첫째', fn('A')]), p(['둘째', fn('B')]), p(['셋째', fn('C')])];
  const model = diffDocs(before, shifted, registry);
  const kinds = model?.entries.map((entry) => entry.kind);
  eq('diff — 앞에 각주를 넣어 번호만 밀린 블록은 같은 블록이다', kinds, ['added', 'same', 'same']);
  const edited = diffDocs(before, [p(['둘째', fn('B 고침')]), p(['셋째', fn('C')])], registry);
  eq(
    'diff — 내용만 바뀐 각주는 바뀐 블록이다',
    edited?.entries.map((entry) => entry.kind),
    ['changed', 'same'],
  );
}

// --- 편집 표면 ----------------------------------------------------------------------------------

{
  const dom = new JSDOM('<!doctype html><html><body><div class="nabi"><div id="editor"></div></div></body></html>');
  const owner = dom.window.document;
  const root = owner.getElementById('editor') as HTMLElement;
  const { nabi, registry: reg } = createNabiWith(defaultWings, {
    doc: [p(['가', fn('하나'), '나']), p([fn('둘')])],
  });
  const surface = mountSurface({ nabi, registry: reg, root });
  const markers = () => Array.from(root.querySelectorAll('[data-nabi-fn]'));
  eq(
    '표면 — 번호는 DOM 순서로 매겨진다',
    markers().map((m) => m.getAttribute('data-nabi-n')),
    ['1', '2'],
  );
  const area = root.nextElementSibling;
  ok(
    '표면 — 하단 목록은 본문 밖 형제 영역이다',
    area?.classList.contains('nabi-footnote-area') === true &&
      area.textContent === '[1] 하나[2] 둘' &&
      !root.contains(area),
    area?.outerHTML,
  );
  const selectionBeforeListClick = nabi.getSelection();
  let listScrolled = false;
  (markers()[1] as HTMLElement).scrollIntoView = () => {
    listScrolled = true;
  };
  const viewer = attachViewer(area as HTMLElement);
  area!.querySelectorAll<HTMLElement>('[data-nabi-fn-num]')[1]!.click();
  eq('표면 — 하단 번호를 눌러도 본문 선택은 그대로다', nabi.getSelection(), selectionBeforeListClick);
  ok('표면 — 하단 번호를 눌러도 스크롤하지 않는다', !listScrolled);
  ok('표면 — viewer를 함께 걸어도 하단 번호에 이동 동작을 붙이지 않는다', !area!.querySelector('[data-nabi-fn-ready]'));
  viewer.unmount();

  const first = root.querySelector('p') as HTMLElement;
  eq('표면 — 화면 글자에서 각주는 한 칸', domTextOf(first), '가\n나');
  const after = toDomPoint(root, hostOf(nabi).doc(), reg.env, at([0], 2));
  ok(
    '표면 — 각주 뒤 자리는 각주 다음 글자의 처음이다',
    after?.node.textContent === '나' && after.offset === 0,
    String(after?.node.textContent),
  );
  const back = after ? fromDomPoint(root, hostOf(nabi).doc(), reg.env, after.node, after.offset) : null;
  eq('표면 — 그 DOM 자리를 트리로 되돌려도 같다', back?.pos, at([0], 2));
  eq(
    '표면 — 문단 자식 자리로 짚어도 각주를 한 칸으로 센다',
    fromDomPoint(root, hostOf(nabi).doc(), reg.env, first, 2)?.pos,
    at([0], 2),
  );

  nabi.select(range(at([0], 0), at([0], 0)));
  nabi.applyCommand('insertFootnote', { t: '앞' });
  eq(
    '표면 — 앞에 넣으면 다른 문단의 번호도 밀린다',
    markers().map((m) => m.getAttribute('data-nabi-n')),
    ['1', '2', '3'],
  );
  ok('표면 — 하단 목록도 따라간다', root.nextElementSibling?.textContent === '[1] 앞[2] 하나[3] 둘');

  nabi.select(range(at([0], 1), at([0], 1)));
  const key = new dom.window.KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
  root.dispatchEvent(key);
  eq('표면 — 붙은 Backspace는 먼저 각주를 고른다', nabi.getSelection(), range(at([0], 0), at([0], 1)));
  ok(
    '표면 — 골라진 각주에 표시가 선다',
    markers()[0]?.hasAttribute('data-nabi-picked') === true,
    markers()[0]?.outerHTML,
  );

  nabi.setJson([p(['각주 없음'])]);
  ok('표면 — 각주가 다 사라지면 하단 영역도 없다', root.nextElementSibling === null);
  surface.unmount();
  dom.window.close();
}

// --- viewer -------------------------------------------------------------------------------------

{
  const text = '출처 https://example.com/?a=1&b=2 및 https://example.org/x.';
  const dom = new JSDOM('<!doctype html><div class="nabi"><div id="editor"></div></div>');
  const root = dom.window.document.querySelector<HTMLElement>('#editor')!;
  const { nabi, registry: reg } = createNabiWith(defaultWings, { doc: [p(['가', fn(text)])] });
  const surface = mountSurface({ nabi, registry: reg, root });
  eq(
    '표면 URL — 편집 하단 목록에도 같은 주소 링크가 보인다',
    Array.from(root.nextElementSibling!.querySelectorAll('a')).map((link) => link.getAttribute('href')),
    ['https://example.com/?a=1&b=2', 'https://example.org/x'],
  );
  eq('표면 URL — 링크를 표시해도 저장 각주 내용은 바꾸지 않는다', nabi.getJson(), [p(['가', fn(text)])]);
  surface.unmount();
  dom.window.close();
}

for (const preview of [false, true]) {
  const text = '참고 https://example.com/?a=1&b=2 및 (https://example.org/x). <b>글자</b>';
  const html = make([p(['가', fn(text)])]).getHtml();
  const dom = new JSDOM(
    `<!doctype html><article class="nabi-content${preview ? ' nabi-preview-body' : ''}">${html}</article>`,
  );
  const owner = dom.window.document;
  const article = owner.querySelector<HTMLElement>('article')!;
  const baseline = article.innerHTML;
  const viewer = attachViewer(article);
  const marker = article.querySelector<HTMLElement>('sup[data-nabi-fn]')!;
  marker.focus();
  const tip = article.querySelector<HTMLElement>('.nabi-fn-tip')!;
  eq(`viewer URL ${preview} — 툴팁도 원래 글자를 그대로 보인다`, tip.textContent, `[1] ${text}`);
  eq(
    `viewer URL ${preview} — 하단 목록과 툴팁의 링크는 같다`,
    Array.from(tip.querySelectorAll('a')).map((link) => [link.textContent, link.getAttribute('href')]),
    Array.from(article.querySelectorAll('[data-nabi-footnotes] a')).map((link) => [
      link.textContent,
      link.getAttribute('href'),
    ]),
  );
  ok(`viewer URL ${preview} — 태그처럼 보이는 글자는 요소로 해석하지 않는다`, !tip.querySelector('b'));
  const first = tip.querySelector<HTMLElement>('button, a[href]')!;
  const tab = new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  marker.dispatchEvent(tab);
  ok(`viewer URL ${preview} — Tab은 툴팁의 첫 조작 요소로 간다`, tab.defaultPrevented && owner.activeElement === first);
  const links = tip.querySelectorAll('a');
  links[links.length - 1]!.focus();
  const back = new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  links[links.length - 1]!.dispatchEvent(back);
  ok(`viewer URL ${preview} — 뒤쪽 링크의 Shift+Tab은 앞선 조작 요소로 간다`, !back.defaultPrevented);
  first.focus();
  const returnToMarker = new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  first.dispatchEvent(returnToMarker);
  ok(
    `viewer URL ${preview} — 첫 조작 요소의 Shift+Tab은 본문 번호로 돌아간다`,
    returnToMarker.defaultPrevented && owner.activeElement === marker,
  );
  viewer.unmount();
  eq(`viewer URL ${preview} — 떼면 링크가 있는 원래 저장 HTML로 돌아간다`, article.innerHTML, baseline);
  dom.window.close();
}

{
  const html = make([p(['가', fn('보이는 <내용>'), '나']), p([fn('둘')])]).getHtml();
  const dom = new JSDOM(`<!doctype html><html><body><article class="nabi-content">${html}</article></body></html>`);
  const owner = dom.window.document;
  const article = owner.querySelector('article') as HTMLElement;
  const baseline = article.innerHTML;
  const viewer = attachViewer(article);
  const marker = article.querySelector('sup[data-nabi-fn]') as HTMLElement;
  ok(
    'viewer — 번호는 키보드로 닿는다',
    marker.getAttribute('tabindex') === '0' && marker.getAttribute('role') === 'button',
  );
  marker.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  const tip = article.querySelector('.nabi-fn-tip');
  ok(
    'viewer — 누르면 말풍선이 글자 그대로 뜬다',
    tip?.textContent === '[1] 보이는 <내용>' &&
      tip.children.length === 1 &&
      tip.firstElementChild?.tagName === 'BUTTON' &&
      marker.getAttribute('aria-expanded') === 'true',
    tip?.outerHTML,
  );
  marker.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  ok('viewer — 같은 번호를 다시 누르면 닫힌다', article.querySelector('.nabi-fn-tip') === null);
  marker.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  owner.body.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true }));
  ok('viewer — 바깥을 누르면 닫힌다', article.querySelector('.nabi-fn-tip') === null);
  marker.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  const item = article.querySelector<HTMLElement>('[data-nabi-fn-n="1"]')!;
  let scrolled = false;
  item.scrollIntoView = () => {
    scrolled = true;
  };
  article.querySelector<HTMLButtonElement>('.nabi-fn-tip button')!.click();
  ok('viewer — 말풍선 번호는 하단 각주로 이동하고 닫힌다', scrolled && !article.querySelector('.nabi-fn-tip'));
  eq('viewer — 이동한 각주에 포커스가 간다', owner.activeElement, item);
  scrolled = false;
  marker.scrollIntoView = () => {
    scrolled = true;
  };
  item.querySelector<HTMLElement>('[data-nabi-fn-num]')!.click();
  ok('viewer — 게시 화면 하단 번호는 본문으로 이동한다', scrolled && owner.activeElement === marker);
  viewer.unmount();
  ok(
    'viewer — 떼면 저장 HTML 그대로다',
    !marker.hasAttribute('tabindex') && !marker.hasAttribute('role') && article.innerHTML === baseline,
    article.innerHTML,
  );
  dom.window.close();
}

{
  const html = make([p(['가', fn('미리보기 내용')])]).getHtml();
  const dom = new JSDOM(
    `<!doctype html><html><body><div class="nabi-content nabi-preview-body">${html}<button id="after">After</button></div></body></html>`,
  );
  const owner = dom.window.document;
  const preview = owner.querySelector<HTMLElement>('.nabi-preview-body')!;
  const baseline = preview.innerHTML;
  const viewer = attachViewer(owner.body);
  const marker = preview.querySelector<HTMLElement>('sup[data-nabi-fn]')!;
  const item = preview.querySelector<HTMLElement>('[data-nabi-fn-n]')!;
  let scrolled = false;
  marker.scrollIntoView = item.scrollIntoView = () => {
    scrolled = true;
  };
  marker.click();
  const tip = preview.querySelector<HTMLElement>('.nabi-fn-tip')!;
  eq('미리보기 — 각주 내용은 말풍선으로 읽는다', tip.textContent, '[1] 미리보기 내용');
  ok('미리보기 — 말풍선 번호는 이동 버튼이 아니다', tip.firstElementChild?.tagName === 'SPAN');
  tip.querySelector<HTMLElement>('[data-nabi-fn-num]')!.click();
  ok('미리보기 — 말풍선 번호를 눌러도 이동하거나 닫히지 않는다', !scrolled && tip.isConnected);
  item.querySelector<HTMLElement>('[data-nabi-fn-num]')!.click();
  ok(
    '미리보기 — 하단 번호를 눌러도 이동하거나 포커스를 옮기지 않는다',
    !scrolled && owner.activeElement === owner.body,
  );
  ok('미리보기 — 하단 번호에 이동 상태를 붙이지 않는다', !preview.querySelector('[data-nabi-fn-ready]'));
  const tab = new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  marker.dispatchEvent(tab);
  ok('미리보기 — 이동 버튼이 없으면 Tab을 가로채지 않는다', !tab.defaultPrevented);
  viewer.unmount();
  eq('미리보기 — 떼면 원래 HTML로 돌아간다', preview.innerHTML, baseline);
  dom.window.close();
}

done('footnote');
