import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  createLocale,
  createNabiWith,
  defaultWings,
  makeTranslator,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountViewTools,
  mountUpload,
  mountUploadView,
  mountLocalHistory,
  mountFile,
  openSavePanel,
  openHistoryPanel,
  openPreview,
  renderToolbarHtml,
  type LocaleSource,
  type UploadView,
} from '../src/index.js';
import { hostOf } from '../src/editor/index.js';
import { mountDiffWing } from '../src/diff/index.js';
import { attachTableSort } from '../src/viewer/index.js';

function fixture(doc: unknown = [{ w: 'p', ch: ['base'] }]) {
  const dom = new JSDOM(
    '<!doctype html><div id="app"><div id="toolbar"></div><div id="context"></div><div id="tools"></div><div id="surface"></div></div>',
    { url: 'https://example.test', pretendToBeVisual: true },
  );
  const owner = dom.window.document;
  const el = (id: string): HTMLElement => owner.getElementById(id)!;
  const controller = createLocale('en');
  let subscriptions = 0;
  const locale: LocaleSource = {
    get locale() {
      return controller.locale;
    },
    onChange(listener) {
      subscriptions += 1;
      const stop = controller.onChange(listener);
      let alive = true;
      return () => {
        if (alive) {
          alive = false;
          subscriptions -= 1;
          stop();
        }
      };
    },
  };
  const { nabi, registry } = createNabiWith(defaultWings, { doc, locale, typingMergeMs: 0 });
  const root = el('surface');
  const surface = mountSurface({ nabi, registry, root, locale });
  const common = { nabi, registry, surface: root, locale };
  el('toolbar').innerHTML = renderToolbarHtml({ registry, locale });
  const ssrButton = el('toolbar').querySelector('button');
  const toolbar = mountToolbar({ ...common, root: el('toolbar') });
  assert.equal(el('toolbar').querySelector('button'), ssrButton);
  const context = mountContextToolbar({ ...common, root: el('context') });
  const view = mountViewTools({ ...common, root: el('app'), container: el('tools') });
  return {
    dom,
    owner,
    el,
    controller,
    locale,
    nabi,
    registry,
    root,
    surface,
    toolbar,
    context,
    view,
    subscriptions: () => subscriptions,
    dispose() {
      view.unmount();
      context.unmount();
      toolbar.unmount();
      surface.unmount();
      assert.equal(subscriptions, 0);
      dom.window.close();
    },
  };
}

{
  const f = fixture();
  const { nabi, root, controller } = f;
  const history = mountLocalHistory({ nabi, storage: f.dom.window.localStorage });
  const diff = mountDiffWing({ nabi, registry: f.registry, surface: root, locale: f.locale });
  nabi.select({ anchor: { path: [0], offset: 4 }, focus: { path: [0], offset: 4 } });
  nabi.applyCommand('insertText', { text: ' A' });
  nabi.applyCommand('insertText', { text: ' B' });
  nabi.undo();
  const snapshot = () => ({
    json: nabi.getJson(),
    html: nabi.getHtml(),
    selection: nabi.getSelection(),
    session: nabi.sessionId,
    dirty: nabi.isChanged(),
    history: history.list(),
    baseline: diff.baseline(),
  });
  const before = snapshot();
  const doc = hostOf(nabi).doc();
  const paragraph = root.firstChild;
  const button = f.toolbar.buttons[0]!.el;
  const listenersBefore = f.subscriptions();
  let changes = 0;
  const stop = nabi.onChange(() => {
    changes += 1;
  });
  for (const code of ['ko', 'ar', 'en-GB', 'en-US', 'en']) controller.setLocale(code);
  assert.deepEqual(snapshot(), before);
  assert.equal(hostOf(nabi).doc(), doc);
  assert.equal(root.firstChild, paragraph);
  assert.equal(f.toolbar.buttons[0]!.el, button);
  assert.equal(f.subscriptions(), listenersBefore);
  assert.equal(changes, 0);
  assert.equal(nabi.redo(), true);
  assert.equal(nabi.getHtml(), '<p>base A B</p>');
  assert.equal(nabi.undo(), true);
  assert.equal(nabi.undo(), true);
  assert.equal(nabi.getHtml(), '<p>base</p>');
  assert.equal(nabi.undo(), false);
  assert.equal(nabi.isChanged(), false);
  stop();
  diff.unmount();
  history.unmount();
  f.dispose();
}

{
  const f = fixture([{ w: 'p', ch: [] }]);
  const another = fixture();
  const t = makeTranslator(f.locale, { preview: { en: 'My preview', ko: '내 미리보기' } });
  f.controller.setLocale('ko');
  assert.equal(t.t('preview'), '내 미리보기');
  assert.equal(f.el('tools').querySelector('[data-name="preview"]')!.getAttribute('aria-label'), '미리보기');
  assert.ok(f.root.style.getPropertyValue('--nabi-placeholder').includes(makeTranslator('ko').t('placeholder')));
  assert.equal(another.el('tools').querySelector('[data-name="preview"]')!.getAttribute('aria-label'), 'Preview');
  (f.el('tools').querySelector('[data-name="fullscreen"]') as HTMLButtonElement).click();
  f.controller.setLocale('ar');
  assert.equal(f.root.dir, 'rtl');
  assert.equal(f.el('app').classList.contains('is-fullscreen'), true);
  assert.equal(f.el('tools').querySelector('[data-name="fullscreen"]')!.getAttribute('aria-pressed'), 'true');
  assert.equal(f.el('toolbar').dir, 'rtl');
  assert.equal(f.el('context').dir, 'rtl');
  f.dispose();
  another.dispose();
}

{
  const f = fixture();
  f.toolbar.buttons.find((b) => b.w === 'a')!.el.click();
  const input = f.owner.querySelector<HTMLInputElement>('.nabi-prompt input')!;
  assert.ok(input);
  input.value = 'https://example.test/draft';
  input.focus();
  input.setSelectionRange(4, 12);
  const label = input.getAttribute('aria-label');
  f.controller.setLocale('ko');
  assert.equal(f.owner.querySelector('.nabi-prompt input'), input);
  assert.equal(f.owner.activeElement, input);
  assert.equal(input.value, 'https://example.test/draft');
  assert.deepEqual([input.selectionStart, input.selectionEnd], [4, 12]);
  assert.notEqual(input.getAttribute('aria-label'), label);
  assert.equal(f.owner.querySelector('.nabi-prompt .nabi-go')!.textContent, makeTranslator('ko').t('ok'));
  f.dispose();
}

{
  const f = fixture([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://example.test' }, ch: ['link'] }] }]);
  f.nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  const controls = f.context.groups().flatMap((group) => [...group.el.querySelectorAll('button, input')]);
  assert.ok(controls.length > 0);
  const labels = controls.map((el) => el.getAttribute('aria-label'));
  f.controller.setLocale('ko');
  assert.deepEqual(
    f.context.groups().flatMap((group) => [...group.el.querySelectorAll('button, input')]),
    controls,
  );
  assert.notDeepEqual(
    controls.map((el) => el.getAttribute('aria-label')),
    labels,
  );
  f.dispose();
}

{
  const f = fixture();
  const file = mountFile({
    nabi: f.nabi,
    registry: f.registry,
    locale: f.locale,
    store: {
      save() {},
      async open() {
        return null;
      },
    },
  });
  const save = openSavePanel({ file, surface: f.root, locale: f.locale });
  const input = save.card.querySelector('input')!;
  input.value = 'unfinished name';
  input.focus();
  input.setSelectionRange(2, 6);
  const selected = save.card.querySelector('[aria-selected="true"]');
  f.controller.setLocale('ar');
  assert.equal(save.card.dir, 'rtl');
  assert.equal(input.value, 'unfinished name');
  assert.equal(f.owner.activeElement, input);
  assert.equal(save.card.querySelector('[aria-selected="true"]'), selected);
  assert.deepEqual([input.selectionStart, input.selectionEnd], [2, 6]);
  save.close();
  file.unmount();
  const history = mountLocalHistory({ nabi: f.nabi, storage: f.dom.window.localStorage });
  history.snapshot();
  const panel = openHistoryPanel({
    history,
    surface: f.root,
    locale: f.locale,
    sessionId: history.sessionId,
    render: () => f.nabi.getHtml(),
  })!;
  const row = panel.card.querySelector('.nabi-history-row');
  const records = history.list();
  f.controller.setLocale('ko-KR');
  assert.equal(panel.card.querySelector('.nabi-history-row'), row);
  assert.equal(panel.card.querySelector('.nabi-history-here')!.textContent, makeTranslator('ko').t('history.current'));
  assert.deepEqual(history.list(), records);
  panel.close();
  history.unmount();
  const preview = openPreview({ nabi: f.nabi, surface: f.root, locale: f.locale });
  const body = preview.card.querySelector('.nabi-preview-body')!;
  const paragraph = body.firstChild;
  f.controller.setLocale('en');
  assert.equal(preview.card.getAttribute('aria-label'), 'Preview');
  assert.equal(body.firstChild, paragraph);
  preview.close();
  const diff = mountDiffWing({ nabi: f.nabi, registry: f.registry, surface: f.root, locale: f.locale });
  diff.open();
  const diffBody = f.owner.querySelector('.nabi-diff-body');
  const focus = f.owner.activeElement;
  f.controller.setLocale('ko');
  assert.equal(f.owner.querySelector('.nabi-diff-body'), diffBody);
  assert.equal(f.owner.activeElement, focus);
  assert.equal(f.owner.querySelector('.nabi-diff')!.getAttribute('aria-label'), makeTranslator('ko').t('diff.region'));
  diff.unmount();
  f.dispose();
}

{
  const f = fixture();
  let finish!: (value: { uri: string }) => void;
  let signal!: AbortSignal;
  let view: UploadView;
  const upload = mountUpload({
    nabi: f.nabi,
    root: f.root,
    locale: f.locale,
    uploader(task) {
      signal = task.signal;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    onStart: (tasks) => view.start(tasks),
    onDone: () => view.done(),
  });
  view = mountUploadView({ nabi: f.nabi, surface: f.root, locale: f.locale, upload });
  upload.take([{ name: 'a.txt', size: 4, type: 'text/plain' }]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const placeholder = f.root.querySelector('.nabi-upload-stop');
  const before = f.nabi.getJson();
  f.controller.setLocale('ko');
  assert.equal(signal.aborted, false);
  assert.equal(upload.isRunning(), true);
  assert.equal(f.root.querySelector('.nabi-upload-stop'), placeholder);
  assert.equal(placeholder!.getAttribute('aria-label'), makeTranslator('ko').t('cancel'));
  assert.deepEqual(f.nabi.getJson(), before);
  finish({ uri: 'https://example.test/a.txt' });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(upload.isRunning(), false);
  assert.ok(f.nabi.getHtml().includes('https://example.test/a.txt'));
  upload.unmount();
  view.unmount();
  f.dispose();
}

{
  const f = fixture();
  const table = f.owner.createElement('table');
  table.innerHTML = '<tbody><tr><th>H</th></tr><tr><td>B</td></tr><tr><td>A</td></tr></tbody>';
  f.owner.body.append(table);
  const detach = attachTableSort(table, { locale: f.locale, tables: 'all' });
  const button = table.querySelector('button')!;
  button.click();
  const rows = [...table.rows];
  const label = button.getAttribute('aria-label');
  f.controller.setLocale('ko');
  assert.deepEqual([...table.rows], rows);
  assert.notEqual(button.getAttribute('aria-label'), label);
  detach();
  f.dispose();
}

{
  const locale = createLocale('en-GB');
  const t = makeTranslator(locale);
  assert.equal(t.locale, 'en');
  assert.equal(makeTranslator(null as unknown as string).locale, 'en');
  assert.throws(() => createLocale(1 as unknown as string), TypeError);
  let calls = 0;
  const stop = locale.onChange(() => {
    calls += 1;
  });
  locale.setLocale('en-US');
  locale.setLocale('en-US');
  assert.equal(calls, 1);
  stop();
  const bad = locale.onChange(() => {
    throw new Error('host');
  });
  const good = locale.onChange(() => {
    calls += 1;
  });
  assert.throws(() => locale.setLocale('ko'), AggregateError);
  assert.equal(calls, 2);
  assert.equal(t.locale, 'ko');
  bad();
  good();
}

{
  const dom = new JSDOM('<div id="toolbar"></div>');
  const root = dom.window.document.getElementById('toolbar')!;
  const source = createLocale('en');
  let subscriptions = 0;
  const locale: LocaleSource = {
    get locale() {
      return source.locale;
    },
    onChange(listener) {
      subscriptions += 1;
      const stop = source.onChange(listener);
      return () => {
        subscriptions -= 1;
        stop();
      };
    },
  };
  const { nabi, registry } = createNabiWith(defaultWings, { locale });
  root.insertAdjacentHTML = () => {
    throw new Error('injected mount failure');
  };
  assert.throws(() => mountToolbar({ nabi, registry, root, locale }), /injected mount failure/);
  assert.equal(subscriptions, 0);
  source.setLocale('ko');
  assert.equal(root.getAttribute('dir'), null);
  dom.window.close();
}

console.log('dynamic locale: editor state, UI identity, panels, upload, history, diff, viewer and cleanup passed');
