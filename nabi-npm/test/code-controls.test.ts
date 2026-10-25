import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createLocale, createNabiWith, defaultWings, mountSurface } from '../src/index.js';
import { attachViewer } from '../src/viewer/index.js';
import { codeSourceOf } from '../src/code/index.js';

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

{
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://example.test' });
  const root = dom.window.document.getElementById('root')!;
  const copied: string[] = [];
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: { writeText: async (text: string) => copied.push(text) },
  });
  const { nabi, registry } = createNabiWith(defaultWings, {
    locale: 'ko',
    doc: [
      {
        w: 'p',
        ch: [
          {
            w: 'code',
            a: { lang: 'typescript' },
            ch: ['  const x = 1;', { w: 'br', ch: [] }, '끝', { w: 'br', ch: [] }],
          },
        ],
      },
    ],
  });
  const surface = mountSurface({ nabi, registry, root });
  nabi.select({ anchor: { path: [0, 0], offset: 2 }, focus: { path: [0, 0], offset: 7 } });
  const before = {
    json: nabi.getJson(),
    html: nabi.getHtml(),
    selection: nabi.getSelection(),
    dirty: nabi.isChanged(),
  };
  const button = root.querySelector<HTMLButtonElement>('.nabi-code-copy')!;
  assert.equal(button.getAttribute('aria-label'), '코드 복사');
  assert.equal(root.querySelector('pre > code')!.textContent, '  const x = 1;끝');
  button.click();
  await tick();
  assert.deepEqual(copied, ['  const x = 1;\n끝\n']);
  assert.equal(button.getAttribute('data-copy-state'), 'copied');
  assert.deepEqual(
    { json: nabi.getJson(), html: nabi.getHtml(), selection: nabi.getSelection(), dirty: nabi.isChanged() },
    before,
  );
  assert.ok(!nabi.getHtml().includes('nabi-code-copy'));
  const reader = dom.window.document.createElement('article');
  reader.innerHTML = nabi.getHtml();
  root.after(reader);
  const viewer = attachViewer(reader);
  reader.querySelector<HTMLButtonElement>('.nabi-code-copy')!.click();
  await tick();
  assert.equal(copied.at(-1), '  const x = 1;\n끝\n');
  viewer.unmount();
  reader.remove();
  nabi.setJson([{ w: 'p', ch: [{ w: 'code', ch: ['a\u200bb'] }] }]);
  root.querySelector<HTMLButtonElement>('.nabi-code-copy')!.click();
  await tick();
  assert.equal(copied.at(-1), 'a\u200bb');
  nabi.applyCommand('setCodeLanguage', { lang: 'python' });
  assert.equal(root.querySelector('pre')!.getAttribute('data-nabi-lang'), 'python');
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 1);
  nabi.applyCommand('insertText', { text: 'changed' });
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 1);
  surface.unmount();
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 0);
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><article lang="ko"><pre><code class="language-js">  x<br>y<br></code></pre><pre><code></code></pre></article>',
    { url: 'https://example.test' },
  );
  const root = dom.window.document.querySelector('article')!;
  const original = root.innerHTML;
  const locale = createLocale('en');
  const copied: string[] = [];
  let failed = false;
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    value: {
      writeText: async (text: string) => {
        if (failed) throw new Error('denied');
        copied.push(text);
      },
    },
  });
  const viewer = attachViewer(root, { locale });
  assert.equal(root.querySelector('pre')!.getAttribute('data-nabi-lang'), 'js');
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 2);
  let button = root.querySelector<HTMLButtonElement>('.nabi-code-copy')!;
  assert.equal(button.getAttribute('aria-label'), 'Copy code');
  locale.setLocale('ko');
  assert.equal(button.getAttribute('aria-label'), '코드 복사');
  button.click();
  await tick();
  assert.deepEqual(copied, ['  x\ny\n']);
  failed = true;
  button.click();
  await tick();
  assert.equal(button.getAttribute('data-copy-state'), 'failed');
  viewer.refresh();
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 2);
  button = root.querySelector<HTMLButtonElement>('.nabi-code-copy')!;
  failed = false;
  root.querySelector('code')!.textContent = 'new text';
  button.click();
  await tick();
  assert.equal(copied.at(-1), 'new text');
  viewer.unmount();
  assert.equal(root.querySelectorAll('.nabi-code-copy').length, 0);
  assert.equal(root.querySelector('pre')!.getAttribute('data-nabi-lang'), null);
  assert.equal(codeSourceOf(root.querySelector('code')!), 'new text');
  root.innerHTML = original;
  const restored = attachViewer(root);
  restored.unmount();
  assert.equal(root.innerHTML, original);
  dom.window.close();
}

console.log('Code controls checks passed');

{
  const { nabi } = createNabiWith(defaultWings, {
    doc: [{ w: 'p', ch: [{ w: 'code', ch: ['  x\u00a0y &nbsp;'] }] }],
  });
  const dom = new JSDOM(nabi.getHtml());
  assert.equal(codeSourceOf(dom.window.document.querySelector('code')!), '  x\u00a0y &nbsp;');
  dom.window.close();
}

{
  const cases = [
    ['pa-IN', 'ਕੋਡ ਕਾਪੀ ਕਰੋ', 'ਕੋਡ ਕਾਪੀ ਹੋ ਗਿਆ', 'ਕਾਪੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।'],
    ['ps-AF', 'کوډ کاپي کړئ', 'کوډ کاپي شو', 'کاپي کول ناکام شول. مهرباني وکړئ بیا هڅه وکړئ.'],
    ['yo-NG', 'Da kóòdù kọ', 'A ti da kóòdù kọ', 'Kò ṣeé da kọ. Jọ̀wọ́ tún gbìyànjú.'],
  ] as const;
  for (const [language, idle, copied, failed] of cases) {
    const dom = new JSDOM('<!doctype html><div id="editor"></div><article></article>', {
      url: 'https://example.test',
    });
    const owner = dom.window.document;
    const locale = createLocale(language);
    let reject = false;
    const values: string[] = [];
    Object.defineProperty(dom.window.navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          if (reject) throw new Error('denied');
          values.push(value);
        },
      },
    });
    const { nabi, registry } = createNabiWith(defaultWings, {
      locale,
      doc: [{ w: 'p', ch: [{ w: 'code', ch: ['  x', { w: 'br', ch: [] }, 'y'] }] }],
    });
    const editor = owner.getElementById('editor')!;
    const surface = mountSurface({ nabi, registry, root: editor, locale });
    const reader = owner.querySelector('article')!;
    reader.innerHTML = nabi.getHtml();
    const viewer = attachViewer(reader, { locale });
    for (const root of [editor, reader]) {
      const button = root.querySelector<HTMLButtonElement>('.nabi-code-copy')!;
      const label = (expected: string): void => {
        assert.equal(button.getAttribute('aria-label'), expected);
        assert.equal(button.title, expected);
      };
      reject = false;
      label(idle);
      button.click();
      await tick();
      label(copied);
      assert.equal(values.at(-1), '  x\ny');
      reject = true;
      button.click();
      await tick();
      label(failed);
    }
    locale.setLocale('en');
    assert.equal(reader.querySelector('button')!.getAttribute('aria-label'), 'Copy failed. Please try again.');
    locale.setLocale(language);
    assert.equal(reader.querySelector('button')!.getAttribute('aria-label'), failed);
    viewer.unmount();
    surface.unmount();
    dom.window.close();
  }
}
