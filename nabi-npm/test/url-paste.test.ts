import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createNabiWith, defaultWings, mountSurface, type PasteUrlHandler, type Wing } from '../src/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { NABI_CLIPBOARD_MIME } from '../src/surface/clipboard.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const link = (text: string, href = new URL(text).href): ElementNode => ({ w: 'a', a: { href }, ch: [text] });
const float = (children: readonly ElementNode[]): ElementNode => ({
  w: 'p',
  ch: [{ w: 'float', a: { side: 'left', w: 30 }, ch: children }],
});
const table = (paragraph: ElementNode): ElementNode => ({
  w: 'p',
  ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [paragraph] }] }] }],
});
const settled = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function fixture(
  doc: NabiDoc = [p()],
  registered: readonly Wing[] = defaultWings,
  options: { readonly onPasteUrl?: PasteUrlHandler } = {},
) {
  const dom = new JSDOM('<div id="surface"></div>', {
    pretendToBeVisual: true,
    url: 'https://example.com/editor',
  });
  globalThis.DOMParser = dom.window.DOMParser;
  const root = dom.window.document.getElementById('surface')!;
  const errors: unknown[] = [];
  const editor = createNabiWith(registered, { doc, typingMergeMs: 0, onError: (error) => errors.push(error) });
  const surface = mountSurface({ ...editor, root, ...options });
  root.focus();
  return {
    ...editor,
    errors,
    root,
    surface,
    paste(plain: string, html = '', custom = '') {
      const values = new Map([
        ['text/plain', plain],
        ['text/html', html],
        [NABI_CLIPBOARD_MIME, custom],
      ]);
      const event = new dom.window.Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', {
        value: {
          files: [],
          types: [...values].filter(([, value]) => value !== '').map(([type]) => type),
          getData: (type: string) => values.get(type) ?? '',
        },
      });
      root.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
    },
    close() {
      surface.unmount();
      dom.window.close();
      Reflect.deleteProperty(globalThis, 'DOMParser');
    },
  };
}

for (const url of [
  'https://example.com/posts/1?draft=1#top',
  'http://example.com:8080/path',
  'HTTPS://EXAMPLE.COM:443/path',
]) {
  const editor = fixture([p('AB')]);
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(url), 'B'] }]);
  assert.equal(editor.root.querySelector('a')?.textContent, url);
  assert.equal(editor.root.querySelector('a')?.getAttribute('href'), new URL(url).href);
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), [p('AB')]);
  editor.close();
}

{
  const editor = fixture();
  const url = 'https://example.com/trimmed';
  editor.paste(` \n${url}\r\n\t`);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url)] }]);
  editor.close();
}

for (const html of [
  '<p>https://example.com/clipboard</p>',
  '<p><strong>https://example.com/clipboard</strong></p>',
  '<a href="https://example.com/other">https://example.com/clipboard</a>',
]) {
  const editor = fixture();
  const url = 'https://example.com/clipboard';
  editor.paste(url, html);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url)] }]);
  editor.close();
}

{
  const editor = fixture();
  const url = 'https://example.com/invalid-envelope';
  editor.paste(url, '', '{invalid');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url)] }]);
  editor.close();
}

for (const text of [
  'Read https://example.com/path',
  'https://example.com/one https://example.com/two',
  'https://example.com/a b',
  '/posts/1',
  '//example.com/posts/1',
  'javascript:alert(1)',
  'data:text/html,hello',
  'https://',
]) {
  const editor = fixture();
  editor.paste(text);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [p(text)]);
  assert.equal(editor.root.querySelector('a'), null);
  editor.close();
}

{
  const editor = fixture();
  editor.paste('https://example.com/one\nhttps://example.com/two');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [p('https://example.com/one'), p('https://example.com/two')]);
  editor.close();
}

{
  const editor = fixture([p('ABCD')]);
  const selection: Selection = { anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 3 } };
  editor.nabi.select(selection);
  const url = 'https://example.com/replacement';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(url), 'D'] }]);
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), [p('ABCD')]);
  assert.deepEqual(editor.nabi.getSelection(), selection);
  assert.equal(editor.nabi.undo(), false);
  editor.close();
}

for (const [wrap, path] of [
  [(paragraph: ElementNode) => float([paragraph]), [0, 0, 0]],
  [table, [0, 0, 0, 0, 0]],
  [(paragraph: ElementNode) => float([table(paragraph)]), [0, 0, 0, 0, 0, 0, 0]],
] as const) {
  const editor = fixture([wrap(p('AB')), p('outside')]);
  editor.nabi.select(caretAt({ path, offset: 1 }));
  const url = 'https://example.com/nested';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [wrap({ w: 'p', ch: ['A', link(url), 'B'] }), p('outside')]);
  assert.deepEqual(editor.nabi.getSelection().focus.path, path);
  editor.close();
}

{
  const editor = fixture([{ w: 'p', ch: [{ w: 'code', ch: ['AB'] }] }]);
  editor.nabi.select(caretAt({ path: [0, 0], offset: 1 }));
  const url = 'https://example.com/code';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [{ w: 'code', ch: [`A${url}B`] }] }]);
  assert.equal(editor.root.querySelector('a'), null);
  editor.close();
}

{
  const editor = fixture(
    [p()],
    defaultWings.filter((wing) => wing.w !== 'a'),
  );
  const url = 'https://example.com/no-link-wing';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [p(url)]);
  assert.equal(editor.root.querySelector('a'), null);
  editor.close();
}

{
  const url = 'https://example.com/internal';
  const body: NabiDoc = [{ w: 'p', ch: [{ w: 'b', ch: [url] }] }];
  const editor = fixture();
  editor.paste(url, `<p><strong>${url}</strong></p>`, JSON.stringify({ version: 1, body }));
  await settled();
  assert.deepEqual(editor.nabi.getJson(), body);
  editor.close();
}

{
  const editor = fixture();
  editor.paste('Page title', '<p><strong>Page title</strong></p>');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [{ w: 'b', ch: ['Page title'] }] }]);
  editor.close();
}

{
  const oldHref = 'https://example.com/old';
  const editor = fixture([{ w: 'p', ch: ['A', link('OLD', oldHref), 'B'] }]);
  editor.nabi.select(caretAt({ path: [0], offset: 2 }));
  const url = 'https://example.com/new';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [
    { w: 'p', ch: ['A', link('O', oldHref), link(url), link('LD', oldHref), 'B'] },
  ]);
  editor.close();
}

for (const [url, sameOrigin, path] of [
  ['HTTPS://EXAMPLE.COM:443/posts/1?draft=1#top', true, '/posts/1?draft=1#top'],
  ['https://example.com', true, '/'],
  ['http://example.com/posts/1', false, '/posts/1'],
  ['https://example.com:444/posts/1', false, '/posts/1'],
  ['https://elsewhere.example/posts/1?x=2#top', false, '/posts/1?x=2#top'],
] as const) {
  const calls: unknown[][] = [];
  const editor = fixture([p()], defaultWings, {
    onPasteUrl: (...args) => {
      calls.push(args);
      return 'Page title';
    },
  });
  editor.paste(` \n${url}\r\n`);
  await settled();
  assert.deepEqual(calls, [[url, sameOrigin, path]]);
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link('Page title', new URL(url).href)] }]);
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), [p()]);
  assert.equal(editor.nabi.undo(), false);
  editor.close();
}

for (const [wrap, path] of [
  [(paragraph: ElementNode) => paragraph, [0]],
  [(paragraph: ElementNode) => float([paragraph, p('after')]), [0, 0, 0]],
  [
    (paragraph: ElementNode): ElementNode => ({
      w: 'p',
      ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [paragraph, p('after')] }] }] }],
    }),
    [0, 0, 0, 0, 0],
  ],
] as const) {
  let calls = 0;
  const url = 'https://example.com/empty-paragraph';
  const editor = fixture([wrap(p()), p('outside')], defaultWings, {
    onPasteUrl: () => {
      calls += 1;
      return 'Empty paragraph title';
    },
  });
  editor.nabi.select(caretAt({ path, offset: 0 }));
  editor.paste(url);
  await settled();
  assert.equal(calls, 1);
  assert.deepEqual(editor.nabi.getJson(), [wrap({ w: 'p', ch: [link('Empty paragraph title', url)] }), p('outside')]);
  editor.close();
}

{
  const label = ' <img src=x onerror=alert(1)> & <strong>Title</strong> ';
  const editor = fixture([p()], defaultWings, { onPasteUrl: () => label });
  const url = 'https://example.com/literal';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(label, url)] }]);
  assert.equal(editor.root.querySelector('a')?.textContent?.replaceAll('\u00a0', ' '), label);
  assert.equal(editor.root.querySelector('img, strong'), null);
  editor.close();
}

for (const asynchronous of [false, true]) {
  for (const value of ['', ' \t\n', null, undefined, 42, { title: 'Object' }]) {
    const onPasteUrl = (() => (asynchronous ? Promise.resolve(value) : value)) as PasteUrlHandler;
    const editor = fixture([p()], defaultWings, { onPasteUrl });
    const url = 'https://example.com/fallback';
    editor.paste(url);
    await settled();
    assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url)] }]);
    editor.close();
  }
}

for (const asynchronous of [false, true]) {
  const failure = new Error('Title lookup failed');
  const editor = fixture([p()], defaultWings, {
    onPasteUrl: () => {
      if (asynchronous) return Promise.reject(failure);
      throw failure;
    },
  });
  const url = 'https://example.com/error';
  editor.paste(url);
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url)] }]);
  assert.deepEqual(editor.errors, [failure]);
  editor.close();
}

for (const mode of ['code', 'missing-wing', 'internal', 'non-url'] as const) {
  let calls = 0;
  const editor = fixture(
    mode === 'code' ? [{ w: 'p', ch: [{ w: 'code', ch: [] }] }] : [p()],
    mode === 'missing-wing' ? defaultWings.filter((wing) => wing.w !== 'a') : defaultWings,
    {
      onPasteUrl: () => {
        calls += 1;
        return 'Unexpected title';
      },
    },
  );
  if (mode === 'code') editor.nabi.select(caretAt({ path: [0, 0], offset: 0 }));
  const url = 'https://example.com/skip';
  const body = [{ w: 'p', ch: [{ w: 'b', ch: [url] }] }];
  editor.paste(
    mode === 'non-url' ? `See ${url}` : url,
    '',
    mode === 'internal' ? JSON.stringify({ version: 1, body }) : '',
  );
  await settled();
  assert.equal(calls, 0);
  editor.close();
}

{
  const pending = deferred<string>();
  const editor = fixture([p('ABCD'), p('elsewhere')], defaultWings, { onPasteUrl: () => pending.promise });
  const selection: Selection = { anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 3 } };
  editor.nabi.select(selection);
  const url = 'https://example.com/async';
  editor.paste(url);
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(url), 'D'] }, p('elsewhere')]);
  const moved = caretAt({ path: [1], offset: 3 });
  editor.nabi.select(moved);
  pending.resolve('Loaded title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link('Loaded title', url), 'D'] }, p('elsewhere')]);
  assert.deepEqual(editor.nabi.getSelection(), moved);
  editor.close();
}

for (const location of ['same-paragraph', 'other-paragraph'] as const) {
  const pending = deferred<string>();
  const editor = fixture([p('AB'), p('elsewhere')], defaultWings, { onPasteUrl: () => pending.promise });
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  const url = 'https://example.com/edited-around';
  editor.paste(url);
  editor.nabi.select(caretAt({ path: location === 'same-paragraph' ? [0] : [1], offset: 0 }));
  editor.nabi.applyCommand('insertText', { text: 'X' });
  const selection = editor.nabi.getSelection();
  pending.resolve('Loaded title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [
    { w: 'p', ch: [location === 'same-paragraph' ? 'XA' : 'A', link('Loaded title', url), 'B'] },
    p(location === 'other-paragraph' ? 'Xelsewhere' : 'elsewhere'),
  ]);
  assert.deepEqual(editor.nabi.getSelection(), selection);
  editor.close();
}

for (const mutation of ['rename', 'href', 'delete', 'delete-undo', 'replacement', 'undo', 'undo-redo'] as const) {
  const pending = deferred<string>();
  const editor = fixture([p('AB')], defaultWings, { onPasteUrl: () => pending.promise });
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  const url = 'https://example.com/stale';
  editor.paste(url);
  if (mutation === 'replacement') editor.nabi.setJson(editor.nabi.getJson());
  else if (mutation === 'undo' || mutation === 'undo-redo') {
    assert.equal(editor.nabi.undo(), true);
    if (mutation === 'undo-redo') assert.equal(editor.nabi.redo(), true);
  } else if (mutation === 'delete' || mutation === 'delete-undo') {
    editor.nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 + url.length } });
    editor.nabi.applyCommand('deleteRange');
    if (mutation === 'delete-undo') assert.equal(editor.nabi.undo(), true);
  } else {
    editor.nabi.select(caretAt({ path: [0], offset: 2 }));
    if (mutation === 'rename') editor.nabi.applyCommand('renameLink', { text: 'Manual title' });
    else editor.nabi.applyCommand('setLink', { href: 'https://example.com/manual' });
  }
  const changed = editor.nabi.getJson();
  pending.resolve('Stale title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), changed);
  editor.close();
}

{
  const pending = deferred<string>();
  const editor = fixture([p('AB')], defaultWings, { onPasteUrl: () => pending.promise });
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  const url = 'https://example.com/unmounted';
  editor.paste(url);
  editor.surface.unmount();
  pending.resolve('Detached title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(url), 'B'] }]);
  editor.close();
}

for (const sameUrl of [false, true]) {
  const first = deferred<string>();
  const second = deferred<string>();
  const firstUrl = 'https://example.com/first';
  const secondUrl = sameUrl ? firstUrl : 'https://example.com/second';
  let calls = 0;
  const editor = fixture([p('AB'), p('CD')], defaultWings, {
    onPasteUrl: () => (calls++ === 0 ? first.promise : second.promise),
  });
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  editor.paste(firstUrl);
  editor.nabi.select(caretAt({ path: [1], offset: 1 }));
  editor.paste(secondUrl);
  assert.deepEqual(editor.nabi.getJson(), [
    { w: 'p', ch: ['A', link(firstUrl), 'B'] },
    { w: 'p', ch: ['C', link(secondUrl), 'D'] },
  ]);
  second.resolve('Second title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [
    { w: 'p', ch: ['A', link(firstUrl), 'B'] },
    { w: 'p', ch: ['C', link('Second title', secondUrl), 'D'] },
  ]);
  first.resolve('First title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [
    { w: 'p', ch: ['A', link('First title', firstUrl), 'B'] },
    { w: 'p', ch: ['C', link('Second title', secondUrl), 'D'] },
  ]);
  editor.close();
}

for (const insertBefore of [false, true]) {
  for (const resolveFirst of [false, true]) {
    const first = deferred<string>();
    const second = deferred<string>();
    let calls = 0;
    const editor = fixture([p('AB')], defaultWings, {
      onPasteUrl: () => (calls++ === 0 ? first.promise : second.promise),
    });
    const url = 'https://example.com/adjacent';
    editor.nabi.select(caretAt({ path: [0], offset: 1 }));
    editor.paste(url);
    if (insertBefore) editor.nabi.select(caretAt({ path: [0], offset: 1 }));
    editor.paste(url);
    assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(url + url, url), 'B'] }]);
    if (resolveFirst) first.resolve('First');
    else second.resolve('Second');
    await settled();
    const partial = resolveFirst
      ? insertBefore
        ? `${url}First`
        : `First${url}`
      : insertBefore
        ? `Second${url}`
        : `${url}Second`;
    assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link(partial, url), 'B'] }]);
    if (resolveFirst) second.resolve('Second');
    else first.resolve('First');
    await settled();
    assert.deepEqual(editor.nabi.getJson(), [
      { w: 'p', ch: ['A', link(insertBefore ? 'SecondFirst' : 'FirstSecond', url), 'B'] },
    ]);
    editor.close();
  }
}

{
  const pending = deferred<string>();
  const url = 'https://example.com/repeated';
  const editor = fixture([{ w: 'p', ch: [link(url), 'AB'] }], defaultWings, {
    onPasteUrl: () => pending.promise,
  });
  editor.nabi.select(caretAt({ path: [0], offset: url.length }));
  editor.paste(url);
  editor.nabi.select({ anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: url.length } });
  editor.nabi.applyCommand('deleteRange');
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link(url), 'AB'] }]);
  pending.resolve('Remaining title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: [link('Remaining title', url), 'AB'] }]);
  editor.close();
}

{
  const pending = deferred<string>();
  const editor = fixture([p('AB')], defaultWings, { onPasteUrl: () => pending.promise });
  const url = 'https://example.com/async-undo';
  editor.nabi.select(caretAt({ path: [0], offset: 1 }));
  editor.paste(url);
  const inserted = editor.nabi.getJson();
  pending.resolve('Loaded title');
  await settled();
  assert.deepEqual(editor.nabi.getJson(), [{ w: 'p', ch: ['A', link('Loaded title', url), 'B'] }]);
  assert.deepEqual(editor.nabi.getSelection(), caretAt({ path: [0], offset: 1 + 'Loaded title'.length }));
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), inserted);
  assert.equal(editor.nabi.undo(), true);
  assert.deepEqual(editor.nabi.getJson(), [p('AB')]);
  assert.equal(editor.nabi.undo(), false);
  editor.close();
}

console.log('URL paste: URL detection, label callbacks, fallbacks, async lifetime, nested scopes and undo passed');
