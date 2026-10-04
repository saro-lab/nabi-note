// 0.9 수명 회귀망 - 취소, unmount, 늦은 Promise, document 전역 자원의 소유권을 고정한다.
// 0.9 lifecycle regression net — pins down ownership of cancellation, unmount, late promises, and document-global resources.
import { JSDOM } from 'jsdom';
import { writeNabiFile, type FileStore } from '../src/io/index.js';
import { createNabiWith, makeRegistry, simpleMark } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { mountFile, mountLocalHistory, mountUpload } from '../src/surface/index.js';
import { attachCodePaint, attachTableSort, attachViewer } from '../src/viewer/index.js';
import {
  createTicker,
  mountContextToolbar,
  mountHints,
  mountSticky,
  mountToolbar,
  mountViewTools,
  openChoosePanel,
  openHistoryPanel,
  openLightbox,
  openPanel,
  openPreview,
  openPrompt,
  openSavePanel,
  openScrim,
} from '../src/ui/index.js';
import { registerToolbox } from '../src/ui/parts/toolbox-keyboard.js';
import { suppressMousedownTap } from '../src/ui/parts/button.js';
import { done, eq, ok } from './net.js';
import { hostOf, type Command } from '../src/editor/index.js';
import { mountDiff, mountDiffWing } from '../src/diff/index.js';
import { makeTranslator } from '../src/locale/index.js';
import { claimMountRoot } from '../src/lifecycle.js';

function paletteToolbar(parent: HTMLElement, onOpen: () => void) {
  const root = parent.ownerDocument.createElement('div');
  parent.append(root);
  let active = false;
  const stop = registerToolbox(root, {
    open() {
      active = true;
      onOpen();
    },
    close() {
      active = false;
    },
    active: () => active,
  });
  return {
    root,
    buttons: [],
    refresh() {},
    unmount() {
      active = false;
      stop();
      root.remove();
    },
  };
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const file = { name: 'a.png', size: 10, type: 'image/png' };

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="outer"><div id="inner"></div></div><div id="separate"></div></body></html>',
  );
  const owner = dom.window.document;
  const outer = owner.getElementById('outer') as HTMLElement;
  const inner = owner.getElementById('inner') as HTMLElement;
  const separate = owner.getElementById('separate') as HTMLElement;
  const releaseOuter = claimMountRoot(outer);
  const releaseSeparate = claimMountRoot(separate);
  let innerRejected = false;
  try {
    claimMountRoot(inner);
  } catch {
    innerRejected = true;
  }
  releaseOuter();
  const releaseInner = claimMountRoot(inner);
  let outerRejected = false;
  try {
    claimMountRoot(outer);
  } catch {
    outerRejected = true;
  }
  releaseInner();
  const retryOuter = claimMountRoot(outer);
  retryOuter();
  releaseSeparate();
  ok(
    'mount root ownership - disjoint roots coexist while ancestor and descendant overlap is rejected until unmount',
    innerRejected && outerRejected,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="editor" contenteditable="true"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  const upload = deferred<{ uri: string } | null>();
  const mounted = mountUpload({ nabi, root, uploader: () => upload.promise });
  mounted.take([file]);
  mounted.cancel();
  ok(
    'upload cancel - uploader가 AbortSignal을 무시해도 잠금과 contenteditable을 즉시 복원한다',
    !mounted.isRunning() && hostOf(nabi).lockedBy() === null && root.getAttribute('contenteditable') === 'true',
  );
  upload.resolve(null);
  await tick();
  mounted.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><table id="table" data-nabi-sortable><tbody><tr><th aria-sort="ascending">H</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></tbody></table></body></html>',
  );
  const table = dom.window.document.getElementById('table') as HTMLTableElement;
  const header = table.rows[0]?.cells[0] as HTMLTableCellElement;
  const sort = attachTableSort(table);
  (table.querySelector('.nabi-sort') as HTMLButtonElement).click();
  sort();
  const orderRestored = [...table.rows].map((row) => row.textContent).join(',') === 'H,A,B';
  const second = attachTableSort(table);
  header.replaceChildren('host header');
  second();
  ok(
    'table viewer - same tbody order and original cell aria baseline survive sorting and host replaceChildren',
    orderRestored && header.getAttribute('aria-sort') === 'ascending' && header.textContent === 'host header',
    table.outerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><table data-nabi-sortable><tr><th>A</th></tr><tr><td>A</td></tr></table><table data-nabi-sortable><tr><th>B</th></tr><tr><td>B</td></tr></table></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const create = owner.createElement.bind(owner);
  let buttons = 0;
  owner.createElement = ((tag: string) => {
    if (tag === 'button' && ++buttons === 2) throw new Error('second table');
    return create(tag);
  }) as typeof owner.createElement;
  let threw = false;
  try {
    attachTableSort(root);
  } catch {
    threw = true;
  }
  owner.createElement = create;
  const retry = attachTableSort(root);
  retry();
  ok(
    'table viewer - later table setup throw rolls back earlier helpers and permits retry',
    threw && root.querySelectorAll('.nabi-sort').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><table data-nabi-sortable><tr><th>A</th><th>B</th></tr><tr><td>A</td><td>B</td></tr></table></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const create = owner.createElement.bind(owner);
  let buttons = 0;
  owner.createElement = ((tag: string) => {
    if (tag === 'button' && ++buttons === 2) throw new Error('second header');
    return create(tag);
  }) as typeof owner.createElement;
  let threw = false;
  try {
    attachTableSort(root);
  } catch {
    threw = true;
  }
  owner.createElement = create;
  const retry = attachTableSort(root);
  retry();
  ok(
    'table viewer - later header setup throw rolls back same-table helper and aria state',
    threw && root.querySelectorAll('.nabi-sort').length === 0 && root.querySelector('[aria-sort]') === null,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><pre><code>A</code></pre><pre><code>B</code></pre></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const create = owner.createElement.bind(owner);
  let spans = 0;
  owner.createElement = ((tag: string) => {
    if (tag === 'span' && ++spans === 2) throw new Error('second code');
    return create(tag);
  }) as typeof owner.createElement;
  let threw = false;
  try {
    attachCodePaint(root, { highlight: (source) => [{ text: source, type: 'keyword' }] });
  } catch {
    threw = true;
  }
  owner.createElement = create;
  const retry = attachCodePaint(root, { highlight: (source) => [{ text: source, type: 'keyword' }] });
  retry();
  ok(
    'code viewer - later code paint throw rolls back earlier projection and permits retry',
    threw && root.querySelectorAll('[data-nabi-token]').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><button id="restore"></button><div id="page"></div></body></html>',
  );
  const owner = dom.window.document;
  const restore = owner.getElementById('restore') as HTMLElement;
  const page = owner.getElementById('page') as HTMLElement;
  const outerCard = owner.createElement('div');
  const innerCard = owner.createElement('div');
  const outer = openScrim(owner, { card: outerCard, restore });
  const inner = openScrim(owner, { card: innerCard, restore: page });
  const tab = new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  innerCard.dispatchEvent(tab);
  const innerModal = innerCard.getAttribute('role') === 'dialog' && innerCard.getAttribute('aria-modal') === 'true';
  inner.close();
  const innerClosedToOuter = owner.activeElement === outerCard;
  const pageInert = page.hasAttribute('inert');
  const outerReady = !outer.root.hasAttribute('inert');
  outer.close();
  ok(
    'scrim - modal role, top focus trap, nested inert background, and focus restoration compose',
    innerModal && tab.defaultPrevented && innerClosedToOuter && pageInert && outerReady,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const owner = dom.window.document;
  const outerCard = owner.createElement('div');
  const restore = owner.createElement('button');
  outerCard.append(restore);
  const outer = openScrim(owner, { card: outerCard });
  restore.focus();
  const inner = openScrim(owner, { card: owner.createElement('div'), restore });
  inner.close();
  ok(
    'scrim focus - a connected restore target inside the surviving dialog wins over the outer card fallback',
    owner.activeElement === restore,
  );
  outer.close();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const owner = dom.window.document;
  const empty = owner.createElement('div');
  openScrim(owner, { card: empty }).close();
  const existing = owner.createElement('div');
  existing.setAttribute('role', 'region');
  existing.setAttribute('tabindex', '2');
  openScrim(owner, { card: existing }).close();
  const changed = owner.createElement('div');
  const live = openScrim(owner, { card: changed });
  changed.setAttribute('role', 'alert');
  changed.setAttribute('aria-modal', 'host');
  changed.setAttribute('tabindex', '7');
  live.close();
  const retry = openScrim(owner, { card: empty });
  retry.close();
  ok(
    'scrim baseline - injected attrs restore on close while existing and host mid-modal attrs remain untouched',
    !empty.hasAttribute('role') &&
      !empty.hasAttribute('aria-modal') &&
      !empty.hasAttribute('tabindex') &&
      existing.getAttribute('role') === 'region' &&
      existing.getAttribute('tabindex') === '2' &&
      !existing.hasAttribute('aria-modal') &&
      changed.getAttribute('role') === 'alert' &&
      changed.getAttribute('aria-modal') === 'host' &&
      changed.getAttribute('tabindex') === '7',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="first"></div><div id="second"></div></body></html>');
  const owner = dom.window.document;
  const first = owner.getElementById('first') as HTMLElement;
  const second = owner.getElementById('second') as HTMLElement;
  const set = second.setAttribute.bind(second);
  second.setAttribute = ((name: string, value: string) => {
    if (name === 'inert') throw new Error('inert failed');
    set(name, value);
  }) as typeof second.setAttribute;
  let threw = false;
  try {
    openScrim(owner, { card: owner.createElement('div') });
  } catch {
    threw = true;
  }
  second.setAttribute = set;
  const retry = openScrim(owner, { card: owner.createElement('div') });
  retry.close();
  ok(
    'scrim setup - later inert failure restores prior sibling and leaves no orphan scrim before retry',
    threw && !first.hasAttribute('inert') && owner.querySelector('.nabi-scrim') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><head></head><body><button id="surface"></button></body></html>');
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const diff = mountDiffWing({ nabi, registry, surface });
  surface.focus();
  diff.open();
  const screen = dom.window.document.querySelector('.nabi-diff-screen') as HTMLElement;
  const close = [...screen.querySelectorAll('button')].at(-1) as HTMLButtonElement;
  const initialCloseFocus = close === dom.window.document.activeElement;
  dom.window.document.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );
  ok(
    'diff fullscreen - modal semantics, initial close focus, Escape, and surface restoration are owned',
    screen.getAttribute('role') === 'dialog' &&
      screen.getAttribute('aria-modal') === 'true' &&
      initialCloseFocus &&
      !screen.isConnected &&
      dom.window.document.activeElement === surface,
    [
      screen.getAttribute('role') ?? '',
      screen.getAttribute('aria-modal') ?? '',
      String(initialCloseFocus),
      String(screen.isConnected),
      String(dom.window.document.activeElement === surface),
    ],
  );
  diff.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="viewer"><pre><code>let a = 1</code></pre><table data-nabi-sortable><tbody><tr><th>A</th></tr><tr><td>old</td></tr></tbody></table></div></body></html>',
  );
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  const viewer = attachViewer(root);
  const code = root.querySelector('code') as HTMLElement;
  const table = root.querySelector('table') as HTMLTableElement;
  code.textContent = 'host replacement';
  table.tBodies[0]?.replaceChildren(dom.window.document.createElement('tr'));
  const row = table.tBodies[0]?.rows[0] as HTMLTableRowElement;
  row.insertCell().textContent = 'host row';
  viewer.refresh();
  viewer.unmount();
  ok(
    'viewer refresh - same-node host code/table updates become the new baseline',
    code.textContent === 'host replacement' &&
      table.rows[0]?.textContent === 'host row' &&
      root.querySelectorAll('.nabi-sort').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="viewer"><pre><code>A</code></pre><table data-nabi-sortable><tr><th>A</th></tr><tr><td>A</td></tr></table></div></body></html>',
  );
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  let viewer!: ReturnType<typeof attachViewer>;
  let reenter = false;
  viewer = attachViewer(root, {
    highlight: () => {
      if (reenter) {
        reenter = false;
        viewer.refresh();
      }
      return null;
    },
  });
  reenter = true;
  viewer.refresh();
  viewer.unmount();
  ok(
    'viewer refresh - highlight refresh reentry is coalesced and leaves no helpers',
    root.querySelectorAll('.nabi-sort, [data-nabi-token]').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="viewer"><pre><code>A</code></pre></div></body></html>');
  const owner = dom.window.document;
  const root = owner.getElementById('viewer') as HTMLElement;
  let viewer!: ReturnType<typeof attachViewer>;
  let requests = 0;
  let armed = false;
  viewer = attachViewer(root, {
    highlight: (source) => {
      if (armed && source === 'A' && requests < 3) {
        requests += 1;
        if (root.querySelectorAll('code').length === 1) {
          const pre = owner.createElement('pre');
          const code = owner.createElement('code');
          code.textContent = 'B';
          pre.append(code);
          root.append(pre);
        }
        viewer.refresh();
      }
      return [{ text: source, type: 'keyword' }];
    },
  });
  armed = true;
  viewer.refresh();
  const painted = root.querySelectorAll('[data-nabi-token]').length === 2;
  viewer.unmount();
  ok(
    'viewer refresh - one pending rerun paints host code appended during callback, stays bounded, and restores both hosts',
    painted &&
      requests <= 2 &&
      root.querySelectorAll('[data-nabi-token]').length === 0 &&
      [...root.querySelectorAll('code')].map((code) => code.textContent).join(',') === 'A,B',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="viewer"><pre><code>A</code></pre></div></body></html>');
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  let old!: ReturnType<typeof attachViewer>;
  let armed = false;
  let rejected = false;
  old = attachViewer(root, {
    highlight: (source) => {
      if (armed) {
        armed = false;
        old.unmount();
        try {
          attachViewer(root);
        } catch {
          rejected = true;
        }
      }
      return [{ text: source, type: 'keyword' }];
    },
  });
  armed = true;
  old.refresh();
  const fresh = attachViewer(root, { highlight: (source) => [{ text: source, type: 'keyword' }] });
  const painted = root.querySelectorAll('[data-nabi-token]').length === 1;
  fresh.unmount();
  ok(
    'viewer refresh - in-flight unmount defers its claim release so reattach retries only after rollback',
    rejected && painted && root.querySelectorAll('[data-nabi-token]').length === 0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="viewer"><pre><code>A</code></pre></div></body></html>');
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  const code = root.querySelector('code') as HTMLElement;
  let viewer!: ReturnType<typeof attachViewer>;
  let armed = false;
  viewer = attachViewer(root, {
    highlight: (source) => {
      if (armed && source === 'A') {
        armed = false;
        code.textContent = 'B';
        viewer.refresh();
      }
      return [{ text: source, type: 'keyword' }];
    },
  });
  armed = true;
  viewer.refresh();
  const paintedB = code.textContent === 'B' && code.querySelectorAll('[data-nabi-token]').length === 1;
  viewer.unmount();
  ok(
    'viewer refresh - a host same-node mutation during highlighter callback is left for the pending B snapshot',
    paintedB && code.textContent === 'B' && code.querySelectorAll('[data-nabi-token]').length === 0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const broken = {
    extension: '',
    get id(): string {
      throw new Error('format failed');
    },
  };
  let threw = false;
  try {
    openSavePanel({ surface, file: { formats: () => [broken], saveAs: () => undefined } as never });
  } catch {
    threw = true;
  }
  let saves = 0;
  const retry = openSavePanel({
    surface,
    file: {
      formats: () => [{ id: 'html', extension: '.html' }],
      saveAs: () => {
        saves += 1;
      },
    } as never,
  });
  const row = retry.card.querySelector('.nabi-save-row') as HTMLElement;
  const input = retry.card.querySelector('input') as HTMLInputElement;
  retry.close();
  row?.click();
  input?.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  const normal = openSavePanel({
    surface,
    file: {
      formats: () => [{ id: 'html', extension: '.html' }],
      saveAs: () => {
        saves += 1;
      },
    } as never,
  });
  (normal.card.querySelector('.nabi-save-row') as HTMLElement).click();
  ok(
    'save modal - setup failure leaves no scrim, retained controls are inert, and retry saves exactly once',
    threw &&
      owner.querySelectorAll('.nabi-scrim').length === 0 &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert') &&
      saves === 1,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button></body></html>');
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const lightbox = openLightbox({ surface, src: 'x', alt: '   ' });
  const named =
    lightbox.card.getAttribute('role') === 'dialog' &&
    Boolean(lightbox.card.getAttribute('aria-label')) &&
    lightbox.card.getAttribute('alt') === '   ';
  lightbox.close();
  ok('lightbox a11y - whitespace-only image alt preserves the alt while supplying a localized dialog name', named);
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><button id="surface"></button><div id="tools"><div class="nabi-tools"><button data-name="preview" aria-label="preview"></button><button data-name="fullscreen" aria-label="fullscreenEnter"></button></div></div></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  const tools = owner.getElementById('tools') as HTMLElement;
  const retained = tools.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement;
  const original = tools.innerHTML;
  let calls = 0;
  const staged = {
    locale: 'en',
    t: (key: string) => {
      calls += 1;
      if (calls === 3) throw new Error('final paint');
      return key;
    },
    pick: () => '',
  };
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  let threw = false;
  try {
    mountViewTools({ nabi, root, surface, container: tools, translator: staged });
  } catch {
    threw = true;
  }
  retained.click();
  surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  const failedCleanly = threw && tools.innerHTML === original && !root.classList.contains('is-fullscreen');
  const retry = mountViewTools({ nabi, root, surface, container: tools });
  retry.unmount();
  ok(
    'view tools setup - final translator paint failure rolls back SSR controls, listeners, gesture ownership, and fullscreen state',
    failedCleanly && !root.classList.contains('is-fullscreen'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><button id="surface-a"></button><button id="surface-b"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const surfaceA = owner.getElementById('surface-a') as HTMLElement;
  const surfaceB = owner.getElementById('surface-b') as HTMLElement;
  let broken = true;
  let bPressed = 0;
  const toolbarA = {
    get root() {
      if (broken) throw new Error('toolbar getter');
      return root;
    },
  };
  const toolbarB = paletteToolbar(root, () => {
    bPressed += 1;
  });
  let threw = false;
  try {
    mountHints({ root, surface: surfaceA, toolbar: toolbarA as never });
  } catch {
    threw = true;
  }
  broken = false;
  const retry = mountHints({ root, surface: surfaceB, toolbar: toolbarB as never });
  root.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  root.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  const bOwns = bPressed === 1;
  retry.unmount();
  ok(
    'toolbox setup - failed A leaves shared-root ownership clean so distinct B opens once and unmounts cleanly',
    threw && bOwns && !root.classList.contains('nabi-hinting'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"><button id="surface"></button><div id="chrome"></div></div></body></html>',
  );
  const owner = dom.window.document;
  const view = dom.window;
  const root = owner.getElementById('root') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  const chrome = owner.getElementById('chrome') as HTMLElement;
  root.style.setProperty('--nabi-keyboard-top', '17px');
  root.style.setProperty('--nabi-keyboard-bottom', '19px');
  root.style.setProperty('--nabi-bar-height', '23px');
  // jsdom의 지연 초기화 리스너를 편집기 리스너와 따로 센다.
  // Initialize jsdom's lazy selector listeners before counting editor listeners.
  surface.focus();
  view.getComputedStyle(root);
  let adds = 0;
  let removes = 0;
  const add = view.addEventListener.bind(view);
  const remove = view.removeEventListener.bind(view);
  view.addEventListener = ((...args: Parameters<Window['addEventListener']>) => {
    adds += 1;
    add(...args);
  }) as Window['addEventListener'];
  view.removeEventListener = ((...args: Parameters<Window['removeEventListener']>) => {
    removes += 1;
    remove(...args);
  }) as Window['removeEventListener'];
  let disconnected = 0;
  let fail = true;
  view.ResizeObserver = class {
    observe(): void {
      if (fail) throw new Error('observe');
    }
    disconnect(): void {
      disconnected += 1;
    }
  } as never;
  let threw = false;
  try {
    mountSticky({ root, surface, chrome, iosBranch: false });
  } catch {
    threw = true;
  }
  const baseline =
    root.style.getPropertyValue('--nabi-keyboard-top') === '17px' &&
    root.style.getPropertyValue('--nabi-keyboard-bottom') === '19px' &&
    root.style.getPropertyValue('--nabi-bar-height') === '23px';
  fail = false;
  const retry = mountSticky({ root, surface, chrome, iosBranch: false });
  retry.unmount();
  ok(
    'sticky setup - active-surface observer failure rolls back listeners, observer, CSS baseline, and permits retry',
    threw && adds === removes && disconnected >= 1 && baseline,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="root"><button id="surface"></button></div></body></html>');
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  let ownerAdds = 0;
  let ownerRemoves = 0;
  let surfaceAdds = 0;
  let surfaceRemoves = 0;
  const addOwner = owner.addEventListener.bind(owner);
  const removeOwner = owner.removeEventListener.bind(owner);
  const addSurface = surface.addEventListener.bind(surface);
  const removeSurface = surface.removeEventListener.bind(surface);
  owner.addEventListener = ((...args: Parameters<Document['addEventListener']>) => {
    ownerAdds += 1;
    addOwner(...args);
  }) as Document['addEventListener'];
  owner.removeEventListener = ((...args: Parameters<Document['removeEventListener']>) => {
    ownerRemoves += 1;
    removeOwner(...args);
  }) as Document['removeEventListener'];
  surface.addEventListener = ((...args: Parameters<HTMLElement['addEventListener']>) => {
    surfaceAdds += 1;
    addSurface(...args);
  }) as HTMLElement['addEventListener'];
  surface.removeEventListener = ((...args: Parameters<HTMLElement['removeEventListener']>) => {
    surfaceRemoves += 1;
    removeSurface(...args);
  }) as HTMLElement['removeEventListener'];
  let rootReads = 0;
  let surfaceReads = 0;
  let chromeReads = 0;
  let nabiReads = 0;
  let iosReads = 0;
  let settleReads = 0;
  let threw = false;
  try {
    const sticky = mountSticky({
      get root(): HTMLElement {
        rootReads += 1;
        if (rootReads > 1) throw new Error('root reread');
        return root;
      },
      get surface(): HTMLElement {
        surfaceReads += 1;
        if (surfaceReads > 1) throw new Error('surface reread');
        return surface;
      },
      get chrome(): undefined {
        chromeReads += 1;
        if (chromeReads > 1) throw new Error('chrome reread');
        return undefined;
      },
      get nabi(): undefined {
        nabiReads += 1;
        if (nabiReads > 1) throw new Error('nabi reread');
        return undefined;
      },
      get iosBranch(): boolean {
        iosReads += 1;
        if (iosReads > 1) throw new Error('iosBranch reread');
        return false;
      },
      get settle(): undefined {
        settleReads += 1;
        if (settleReads > 1) throw new Error('settle reread');
        return undefined;
      },
    });
    sticky.unmount();
  } catch {
    threw = true;
  }
  owner.addEventListener = addOwner;
  owner.removeEventListener = removeOwner;
  surface.addEventListener = addSurface;
  surface.removeEventListener = removeSurface;
  ok(
    'sticky setup - every host option is snapshotted once before owned resources and teardown balances listeners',
    !threw &&
      [rootReads, surfaceReads, chromeReads, nabiReads, iosReads, settleReads].every((reads) => reads === 1) &&
      ownerAdds === ownerRemoves &&
      surfaceAdds === surfaceRemoves,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="toolbar"></div><div id="context">host</div><div id="sticky"><button id="surface"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const measured = <T>(mount: (options: { readonly settle?: unknown }) => { unmount(): void }): boolean => {
    let adds = 0;
    let removes = 0;
    const add = owner.addEventListener.bind(owner);
    const remove = owner.removeEventListener.bind(owner);
    owner.addEventListener = ((...args: Parameters<Document['addEventListener']>) => {
      adds += 1;
      add(...args);
    }) as Document['addEventListener'];
    owner.removeEventListener = ((...args: Parameters<Document['removeEventListener']>) => {
      removes += 1;
      remove(...args);
    }) as Document['removeEventListener'];
    let reads = 0;
    const options = {
      get settle(): undefined {
        if (reads++ === 0) return undefined;
        throw new Error('second settle read');
      },
    };
    let threw = false;
    try {
      mount(options).unmount();
    } catch {
      threw = true;
    }
    owner.addEventListener = add;
    owner.removeEventListener = remove;
    return !threw && reads === 1 && adds === removes;
  };
  const toolbar = measured((extra) =>
    mountToolbar({ nabi, registry, root: owner.getElementById('toolbar') as HTMLElement, surface, ...extra } as never),
  );
  const context = measured((extra) =>
    mountContextToolbar({
      nabi,
      registry,
      root: owner.getElementById('context') as HTMLElement,
      surface,
      ...extra,
    } as never),
  );
  const sticky = measured((extra) =>
    mountSticky({ root: owner.getElementById('sticky') as HTMLElement, surface, iosBranch: false, ...extra } as never),
  );
  ok(
    'settle setup - toolbar, context, and sticky snapshot a staged settle getter once and release owned watchers',
    toolbar && context && sticky,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="toolbar"></div><div id="context"></div><div id="sticky"><button id="surface"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  let hosted = 0;
  const toolbar = mountToolbar({
    nabi,
    registry,
    root: owner.getElementById('toolbar') as HTMLElement,
    surface,
    onHost: () => {
      hosted += 1;
    },
  });
  const save = toolbar.buttons.find((button) => button.w === 'save');
  toolbar.unmount();
  save?.press();
  save?.accelerate();
  toolbar.refresh();
  const context = mountContextToolbar({
    nabi,
    registry,
    root: owner.getElementById('context') as HTMLElement,
    surface,
  });
  context.unmount();
  context.refresh();
  const emptyContext =
    context.groups().length === 0 &&
    context.buttons().length === 0 &&
    (owner.getElementById('context') as HTMLElement).childElementCount === 0;
  let afterViewport = 0;
  const settle = {
    busy: () => false,
    onSettle: () => () => {},
    afterViewport: (work: () => void) => {
      afterViewport += 1;
      work();
    },
    unmount: () => undefined,
  };
  const sticky = mountSticky({
    root: owner.getElementById('sticky') as HTMLElement,
    surface,
    settle,
    iosBranch: false,
  });
  sticky.unmount();
  sticky.aim();
  ok(
    'ui handles - retained toolbar, context, and sticky public methods are terminal no-ops after unmount',
    hosted === 0 &&
      emptyContext &&
      afterViewport === 0 &&
      !(owner.getElementById('sticky') as HTMLElement).hasAttribute('style'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="view-on" class="is-fullscreen"><button></button><div></div></div><div id="view-host"><button></button><div></div></div><div id="sticky"><button id="surface"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const on = owner.getElementById('view-on') as HTMLElement;
  const host = owner.getElementById('view-host') as HTMLElement;
  const initial = mountViewTools({
    nabi,
    root: on,
    surface: on.querySelector('button') as HTMLElement,
    container: on.querySelector('div') as HTMLElement,
  });
  initial.unmount();
  const hostTools = mountViewTools({
    nabi,
    root: host,
    surface: host.querySelector('button') as HTMLElement,
    container: host.querySelector('div') as HTMLElement,
  });
  host.classList.add('is-fullscreen');
  hostTools.unmount();
  const stickyRoot = owner.getElementById('sticky') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  stickyRoot.style.setProperty('--nabi-bar-height', '17px');
  stickyRoot.style.setProperty('--nabi-keyboard-top', '5px');
  surface.focus();
  const sticky = mountSticky({ root: stickyRoot, surface, iosBranch: false });
  stickyRoot.style.setProperty('--nabi-bar-height', '99px');
  sticky.unmount();
  ok(
    'ui leases - view fullscreen and sticky CSS vars restore baselines while preserving host mid-mount changes',
    on.classList.contains('is-fullscreen') &&
      host.classList.contains('is-fullscreen') &&
      stickyRoot.style.getPropertyValue('--nabi-bar-height') === '99px' &&
      stickyRoot.style.getPropertyValue('--nabi-keyboard-top') === '5px',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="root">host</div></body></html>');
  const owner = dom.window.document;
  const root = owner.getElementById('root') as HTMLElement;
  let renders = 0;
  const mark = simpleMark({
    w: 'exDiffGuard',
    toHtml: (_node, children, ctx) => {
      renders += 1;
      return ctx.element('span', children());
    },
  });
  const mount = mountDiff({
    root,
    before: [{ w: 'p', ch: [{ w: 'exDiffGuard', ch: ['A'] }] }],
    after: [{ w: 'p', ch: [{ w: 'exDiffGuard', ch: ['B'] }] }],
    registry: makeRegistry([mark]),
  });
  const toggle = root.querySelectorAll<HTMLButtonElement>('button')[2] as HTMLButtonElement;
  const count = renders;
  mount.unmount();
  toggle.click();
  mount.update(
    [{ w: 'p', ch: [{ w: 'exDiffGuard', ch: ['C'] }] }],
    [{ w: 'p', ch: [{ w: 'exDiffGuard', ch: ['D'] }] }],
  );
  ok(
    'diff standalone lifecycle - retained toolbar controls and public update are terminal no-ops after unmount',
    renders === count && root.childElementCount === 0 && !root.classList.contains('nabi-diff'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><button id="surface"></button><div id="page"></div></body></html>',
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  let broken = true;
  const options = {
    nabi,
    registry,
    surface,
    get locale(): string | undefined {
      if (broken) throw new Error('locale getter');
      return 'en';
    },
  };
  let threw = false;
  try {
    mountDiffWing(options);
  } catch {
    threw = true;
  }
  const clean =
    owner.querySelector('.nabi-diff-screen') === null &&
    owner.querySelector('[data-nabi-diff]') === null &&
    !surface.hasAttribute('inert') &&
    !(owner.getElementById('page') as HTMLElement).hasAttribute('inert');
  broken = false;
  const retry = mountDiffWing(options);
  retry.open();
  const opened = owner.querySelector('.nabi-diff-screen') !== null;
  retry.close();
  retry.unmount();
  ok(
    'diff setup - a throwing locale getter fails before lifecycle acquisition and a fresh retry opens cleanly',
    threw && clean && opened && owner.querySelector('.nabi-diff-screen') === null && !surface.hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  let diff: { close(): void; open(): void; unmount(): void };
  let armed = true;
  const mark = simpleMark({
    w: 'exReentry',
    toHtml: (_node, children, ctx) => {
      if (armed) {
        armed = false;
        diff.close();
      }
      return ctx.element('span', children());
    },
  });
  const registry = makeRegistry([mark]);
  const { nabi } = createNabiWith([mark], { doc: [{ w: 'p', ch: [{ w: 'exReentry', ch: ['A'] }] }] });
  diff = mountDiffWing({ nabi, registry, surface });
  diff.open();
  const aborted =
    owner.querySelector('.nabi-diff-screen') === null &&
    !surface.hasAttribute('inert') &&
    !(owner.getElementById('page') as HTMLElement).hasAttribute('inert');
  diff.open();
  const retry = owner.querySelector('.nabi-diff-screen') as HTMLElement | null;
  diff.close();
  diff.unmount();
  ok(
    'diff open reentry - a renderer close during mount aborts before layer ownership and a later open retries cleanly',
    aborted &&
      retry !== null &&
      !retry.isConnected &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const diff = mountDiffWing({ nabi, registry, surface });
  diff.open();
  const stale = [
    ...(owner.querySelector('.nabi-diff-screen') as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
  ].at(-1) as HTMLButtonElement;
  diff.close();
  diff.open();
  const current = owner.querySelector('.nabi-diff-screen') as HTMLElement;
  stale.click();
  const stillOpen = current.isConnected && surface.hasAttribute('inert');
  diff.close();
  diff.unmount();
  ok(
    'diff fullscreen lifecycle - a retained old close button cannot close a later modal generation',
    stillOpen && !surface.hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><button id="surface" style="direction: rtl"></button><div id="root" style="direction: rtl"></div></body></html>',
  );
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const root = owner.getElementById('root') as HTMLElement;
  const standalone = mountDiff({
    root,
    before: [{ w: 'p', ch: ['A'] }],
    after: [{ w: 'p', ch: ['B'] }],
    registry: makeRegistry([]),
  });
  const lightbox = openLightbox({ surface, src: 'x' });
  const inheritedLightbox = lightbox.card.getAttribute('dir') === 'rtl';
  lightbox.close();
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const wing = mountDiffWing({ nabi, registry, surface });
  wing.open();
  const screen = owner.querySelector('.nabi-diff-screen') as HTMLElement;
  wing.close();
  wing.unmount();
  standalone.unmount();
  ok(
    'diff direction - absent locale inherits host rtl direction without a standalone dir lease',
    root.getAttribute('dir') === null &&
      dom.window.getComputedStyle(root).direction === 'rtl' &&
      inheritedLightbox &&
      screen.getAttribute('dir') === 'rtl',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const records = [
    { sessionId: 'one', summary: 'One', body: '[]', savedAt: 1, createdAt: 1 },
    { sessionId: 'two', summary: 'Two', body: '[]', savedAt: 1, createdAt: 1 },
  ];
  const panel = openHistoryPanel({
    surface,
    history: {
      alive: () => true,
      list: () => records,
      restore: () => true,
      remove: () => true,
      clear: () => true,
      ask: { confirm: async () => true },
      toast: () => undefined,
      sessionId: 'current',
      snapshot: () => true,
      forget: () => true,
      unmount: () => undefined,
    } as never,
    render: (record) => {
      if (record.sessionId === 'one')
        [...owner.querySelectorAll<HTMLButtonElement>('.nabi-history-tool[aria-label]')]
          .find((button) => button.closest('.nabi-history-row')?.textContent?.includes('Two'))
          ?.click();
      return '<p>Preview</p>';
    },
  }) as NonNullable<ReturnType<typeof openHistoryPanel>>;
  [...panel.card.querySelectorAll<HTMLButtonElement>('.nabi-history-tool[aria-label]')]
    .find((button) => button.closest('.nabi-history-row')?.textContent?.includes('One'))
    ?.click();
  const onePreview = owner.querySelectorAll('.nabi-scrim').length === 2;
  panel.close();
  ok(
    'history preview reentry - a nested render preview attempt owns one generation and outer close removes every layer',
    onePreview &&
      owner.querySelectorAll('.nabi-scrim').length === 0 &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  let calls = 0;
  const history = {
    alive: () => true,
    list: () => {
      calls += 1;
      if (calls === 2) throw new Error('draw failed');
      return [{ sessionId: 'old', summary: 'Old', body: '[]', savedAt: 1, createdAt: 1 }];
    },
    restore: () => true,
    remove: () => true,
    clear: () => true,
    ask: { confirm: async () => true },
    toast: () => undefined,
    sessionId: 'current',
    snapshot: () => true,
    forget: () => true,
    unmount: () => undefined,
  };
  let threw = false;
  try {
    openHistoryPanel({ surface, history: history as never, render: () => '' });
  } catch {
    threw = true;
  }
  const retry = openHistoryPanel({ surface, history: { ...history, list: () => [] } as never, render: () => '' });
  retry?.close();
  ok(
    'history setup - a second list read failure happens before modal ownership and leaves inert background baseline for retry',
    threw &&
      owner.querySelectorAll('.nabi-scrim').length === 0 &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const broken = {
    get label(): string {
      throw new Error('choice failed');
    },
  };
  let rejected = false;
  try {
    await openChoosePanel({ surface, question: 'Choose', options: [broken] as never });
  } catch {
    rejected = true;
  }
  let resolved = -2;
  const retry = openChoosePanel({ surface, question: 'Choose', options: [{ label: 'One' }] }).then((value) => {
    resolved = value;
  });
  (owner.querySelector('.nabi-choose button') as HTMLButtonElement).click();
  await retry;
  ok(
    'choose modal - setup rejection restores background and a normal retry resolves',
    rejected &&
      owner.querySelectorAll('.nabi-scrim').length === 0 &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert') &&
      resolved === 0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="context"></div><button id="surface"></button><div id="page"></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('context') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  let busy = false;
  let settled: (() => void) | null = null;
  const settle = {
    busy: () => busy,
    onSettle: (fn: () => void) => {
      settled = fn;
      return () => {
        settled = null;
      };
    },
    afterViewport: () => undefined,
    unmount: () => undefined,
  };
  const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'img', a: { src: '/image.png' } }] });
  const context = mountContextToolbar({ nabi, registry, root, surface, settle });
  const view = root.querySelector<HTMLButtonElement>('button[data-name="view"]') as HTMLButtonElement;
  view.click();
  const retained = view;
  busy = true;
  nabi.setJson([{ w: 'p', ch: ['plain'] }]);
  retained.click();
  const immediate =
    owner.querySelectorAll('.nabi-scrim').length === 0 &&
    !surface.hasAttribute('inert') &&
    !(owner.getElementById('page') as HTMLElement).hasAttribute('inert');
  busy = false;
  const fire = settled as (() => void) | null;
  fire?.();
  ok(
    'context busy refresh - document replacement immediately closes lightbox and invalidates retained view controls before deferred rebuild',
    immediate && context.groups().length === 0 && owner.querySelectorAll('.nabi-scrim').length === 0,
  );
  context.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="context"></div></body></html>');
  const owner = dom.window.document;
  const promptWing = {
    ...simpleMark({ w: 'exPrompt' }),
    context: {
      title: { en: 'Prompt' },
      controls: [
        {
          kind: 'prompt' as const,
          name: 'edit',
          command: 'setProbe',
          label: { en: 'Edit' },
          fields: [{ name: 'value', kind: 'text' as const, label: { en: 'Value' } }],
        },
      ],
    },
    commands: { setProbe: (() => null) as Command },
  };
  const registry = makeRegistry([promptWing]);
  const { nabi } = createNabiWith([promptWing], { doc: [{ w: 'p', ch: [{ w: 'exPrompt', ch: ['A'] }] }] });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  const context = mountContextToolbar({
    nabi,
    registry,
    root: owner.getElementById('context') as HTMLElement,
    translator: makeTranslator('fa'),
  });
  (owner.querySelector('button[data-name="edit"]') as HTMLButtonElement).click();
  const prompt = owner.querySelector('.nabi-prompt') as HTMLElement;
  ok(
    'translator locale - a fa context root and its prompt preserve rtl panel direction and accessible name',
    context.root.getAttribute('dir') === 'rtl' &&
      prompt.getAttribute('dir') === 'rtl' &&
      prompt.getAttribute('role') === 'dialog' &&
      Boolean(prompt.getAttribute('aria-label') || prompt.getAttribute('aria-labelledby')),
  );
  context.unmount();
  dom.window.close();
}

{
  let now = 0;
  let sequence = 0;
  const jobs = new Map<number, { at: number; run: () => void }>();
  const ticker = createTicker({
    size: 10,
    onChange: () => undefined,
    now: () => now,
    schedule: (run, ms) => {
      const id = ++sequence;
      jobs.set(id, { at: now + ms, run });
      return () => jobs.delete(id);
    },
  });
  const first = ticker.finish();
  const second = ticker.finish();
  while (jobs.size > 0) {
    const [id, job] = [...jobs.entries()].sort((a, b) => a[1].at - b[1].at)[0] as [
      number,
      { at: number; run: () => void },
    ];
    jobs.delete(id);
    now = job.at;
    job.run();
  }
  await Promise.all([first, second]);
  ticker.stop();
  ok(
    'ticker finish - concurrent callers share one tail, both settle, and stop leaves no scheduled work',
    first === second && jobs.size === 0,
  );
}

{
  let now = 0;
  let sequence = 0;
  const jobs = new Map<number, { at: number; run: () => void }>();
  let ticker!: ReturnType<typeof createTicker>;
  ticker = createTicker({
    size: 10,
    onChange: () => {
      void ticker.finish();
    },
    now: () => now,
    schedule: (run, ms) => {
      const id = ++sequence;
      jobs.set(id, { at: now + ms, run });
      return () => jobs.delete(id);
    },
  });
  const [id, first] = jobs.entries().next().value as [number, { at: number; run: () => void }];
  jobs.delete(id);
  now = first.at;
  first.run();
  const oneTail = jobs.size === 1;
  ticker.stop();
  const cleared = jobs.size === 0;
  ok('ticker reentry - a regular tick that starts finish leaves one tail job, and stop cancels it', oneTail && cleared);
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="context"></div></body></html>');
  const owner = dom.window.document;
  const seen: Record<string, unknown>[] = [];
  const exV = {
    ...simpleMark({ w: 'exV' }),
    context: {
      title: { en: 'Value' },
      controls: [
        {
          kind: 'text' as const,
          name: 'value',
          command: 'setProbe',
          argKey: 'exV',
          label: { en: 'Value' },
          initial: () => 'set',
        },
      ],
    },
    commands: {
      setProbe: ((doc, selection, args) => {
        seen.push({ exV: args['exV'] });
        return { doc, selection };
      }) as Command,
    },
  };
  const registry = makeRegistry([exV]);
  const { nabi } = createNabiWith([exV], { doc: [{ w: 'p', ch: [{ w: 'exV', ch: ['A'] }] }] });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  const context = mountContextToolbar({ nabi, registry, root: owner.getElementById('context') as HTMLElement });
  const input = owner.querySelector<HTMLInputElement>('input[data-name="value"]') as HTMLInputElement;
  input.value = '';
  input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  ok(
    'context text - a nonempty clearable custom value commits empty once and suppresses the duplicate change',
    JSON.stringify(seen) === JSON.stringify([{ exV: '' }]),
  );
  context.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="viewer"><table data-nabi-sortable><tr><th>A</th></tr><tr><td>A</td></tr></table><pre><code>A</code></pre></div></body></html>',
  );
  const owner = dom.window.document;
  const root = owner.getElementById('viewer') as HTMLElement;
  const create = owner.createElement.bind(owner);
  owner.createElement = ((tag: string) => {
    if (tag === 'span') throw new Error('code paint failed');
    return create(tag);
  }) as typeof owner.createElement;
  let threw = false;
  try {
    attachViewer(root, { highlight: (source) => [{ text: source, type: 'keyword' }] });
  } catch {
    threw = true;
  }
  owner.createElement = create;
  const retry = attachViewer(root, { highlight: (source) => [{ text: source, type: 'keyword' }] });
  retry.unmount();
  ok(
    'viewer attach - code paint failure rolls back table helper, root claim, and permits baseline retry',
    threw && root.querySelectorAll('.nabi-sort, [data-nabi-token]').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="viewer"><pre><code>A</code></pre><table data-nabi-sortable><tr><th>A</th></tr><tr><td>A</td></tr></table></div></body></html>',
  );
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  let viewer!: ReturnType<typeof attachViewer>;
  let disposeDuringPaint = false;
  viewer = attachViewer(root, {
    highlight: () => {
      if (disposeDuringPaint) viewer.unmount();
      return null;
    },
  });
  disposeDuringPaint = true;
  viewer.refresh();
  ok(
    'viewer refresh - unmount during highlight rolls back local setup and leaves no helpers',
    root.querySelectorAll('.nabi-sort, [data-nabi-token]').length === 0,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="a"><button id="surface-a"></button><div id="tools-a"></div></div><div id="b"><button id="surface-b"></button><div id="tools-b"></div></div></body></html>',
  );
  const owner = dom.window.document;
  const rootA = owner.getElementById('a') as HTMLElement;
  const rootB = owner.getElementById('b') as HTMLElement;
  const surfaceA = owner.getElementById('surface-a') as HTMLElement;
  const surfaceB = owner.getElementById('surface-b') as HTMLElement;
  const toolsA = owner.getElementById('tools-a') as HTMLElement;
  const toolsB = owner.getElementById('tools-b') as HTMLElement;
  const a = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const b = createNabiWith([], { doc: [{ w: 'p', ch: ['B'] }] });
  const viewA = mountViewTools({ ...a, root: rootA, surface: surfaceA, container: toolsA });
  const viewB = mountViewTools({ ...b, root: rootB, surface: surfaceB, container: toolsB });
  (toolsA.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement).click();
  (toolsB.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement).click();
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  ok(
    'fullscreen ownership - Escape from editor A leaves editor B fullscreen',
    !rootA.classList.contains('is-fullscreen') && rootB.classList.contains('is-fullscreen'),
  );
  viewA.unmount();
  viewB.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="a"><button id="surface-a"></button></div><div id="b"><button id="surface-b"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const rootA = owner.getElementById('a') as HTMLElement;
  const surfaceA = owner.getElementById('surface-a') as HTMLElement;
  const surfaceB = owner.getElementById('surface-b') as HTMLElement;
  let pressed = 0;
  const hints = mountHints({
    root: rootA,
    surface: surfaceA,
    toolbar: paletteToolbar(rootA, () => {
      pressed += 1;
    }),
  });
  surfaceA.focus();
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  const ownShortcut = pressed === 1;
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  surfaceB.focus();
  const key = new dom.window.KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  surfaceB.dispatchEvent(key);
  ok(
    'toolbox ownership - opening works once, foreign focus closes A and does not consume its Escape',
    ownShortcut && !hints.active() && !key.defaultPrevented && pressed === 2,
  );
  hints.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="a"><button id="surface-a"></button></div><div id="b"><button id="surface-b"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const rootA = owner.getElementById('a') as HTMLElement;
  const rootB = owner.getElementById('b') as HTMLElement;
  const surfaceA = owner.getElementById('surface-a') as HTMLElement;
  const surfaceB = owner.getElementById('surface-b') as HTMLElement;
  let aPressed = 0;
  let bPressed = 0;
  const a = mountHints({
    root: rootA,
    surface: surfaceA,
    toolbar: paletteToolbar(rootA, () => {
      aPressed += 1;
    }),
  });
  const b = mountHints({
    root: rootB,
    surface: surfaceB,
    toolbar: paletteToolbar(rootB, () => {
      bPressed += 1;
    }),
  });
  for (const surface of [surfaceA, surfaceB]) {
    surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
    surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  }
  const handoff =
    !a.active() && b.active() && !rootA.classList.contains('nabi-hinting') && !rootB.classList.contains('nabi-hinting');
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  const bOwns =
    bPressed === 1 && aPressed === 1 && !a.active() && !b.active() && !rootA.classList.contains('nabi-hinting');
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  surfaceA.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  a.unmount();
  b.unmount();
  ok(
    'toolbox ownership - exact A to B to A handoff deactivates the prior palette without leaving it active',
    handoff &&
      bOwns &&
      aPressed === 2 &&
      bPressed === 1 &&
      !a.active() &&
      !b.active() &&
      !rootA.classList.contains('nabi-hinting') &&
      !rootB.classList.contains('nabi-hinting'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="button"></button></body></html>');
  const button = dom.window.document.getElementById('button') as HTMLButtonElement;
  let animationListeners = 0;
  const timers = new Set<number>();
  const set = dom.window.setTimeout.bind(dom.window);
  const clear = dom.window.clearTimeout.bind(dom.window);
  dom.window.setTimeout = ((fn: TimerHandler, ms?: number, ...args: unknown[]) => {
    const id = set(fn, ms, ...(args as []));
    timers.add(id);
    return id;
  }) as typeof dom.window.setTimeout;
  dom.window.clearTimeout = ((id: number | undefined) => {
    if (id !== undefined) timers.delete(id);
    clear(id);
  }) as typeof dom.window.clearTimeout;
  const add = button.addEventListener.bind(button);
  const remove = button.removeEventListener.bind(button);
  button.addEventListener = ((
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (type === 'animationend') animationListeners += 1;
    add(type, listener, options);
  }) as typeof button.addEventListener;
  button.removeEventListener = ((
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => {
    if (type === 'animationend') animationListeners -= 1;
    remove(type, listener, options);
  }) as typeof button.removeEventListener;
  const release = suppressMousedownTap(button);
  button.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }));
  button.dispatchEvent(new dom.window.MouseEvent('mousedown', { bubbles: true }));
  release();
  ok(
    'button tap - repeated animation listeners and timers are replaced, then cleanup removes both',
    animationListeners === 0 && timers.size === 0 && !button.classList.contains('nabi-tap'),
  );
  dom.window.close();
}

{
  const classes = new Set<string>();
  let down: ((event: MouseEvent) => void) | null = null;
  const button = {
    classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name) },
    offsetWidth: 0,
    ownerDocument: { defaultView: null },
    addEventListener: (type: string, listener: (event: MouseEvent) => void) => {
      if (type === 'mousedown') down = listener;
    },
    removeEventListener: () => undefined,
  } as unknown as HTMLElement;
  const release = suppressMousedownTap(button);
  (down as ((event: MouseEvent) => void) | null)?.({ preventDefault: () => undefined } as MouseEvent);
  release();
  ok('button tap - a document without defaultView clears the transient class immediately', !classes.has('nabi-tap'));
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><table id="viewer" data-nabi-sortable><tr><th>A</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></table></body></html>',
  );
  const root = dom.window.document.getElementById('viewer') as HTMLTableElement;
  const viewer = attachViewer(root);
  (root.querySelector('.nabi-sort') as HTMLButtonElement).click();
  viewer.unmount();
  ok(
    'viewer table teardown - direct-row header and body return to their exact original order',
    [...root.rows].map((row) => row.textContent).join(',') === 'A,A,B' && root.querySelector('.nabi-sort') === null,
    root.outerHTML,
  );
  dom.window.close();
}

{
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['원문'] }] });
  const upload = deferred<{ uri: string } | null>();
  let doneCalls = 0;
  const mounted = mountUpload({
    nabi,
    uploader: () => upload.promise,
    onDone: () => {
      doneCalls += 1;
    },
  });
  mounted.take([file]);
  mounted.unmount();
  upload.resolve({ uri: '/late.png' });
  await tick();
  eq('upload unmount - 늦은 resolve가 폐기된 mount의 callback을 다시 부르지 않는다', doneCalls, 0);
  eq('upload unmount - 늦은 resolve가 문서를 커밋하지 않는다', nabi.getJson(), [{ w: 'p', ch: ['원문'] }]);
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><button id="a"></button><div id="first"></div><button id="b"></button><div id="second"></div></body></html>',
  );
  const owner = dom.window.document;
  const anchor = owner.getElementById('a') as HTMLElement;
  const other = owner.getElementById('b') as HTMLElement;
  const second = owner.getElementById('second') as HTMLElement;
  const panel = openPanel(owner, { anchor });
  const tab = new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  second.dispatchEvent(tab);
  const escape = new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  second.dispatchEvent(escape);
  ok(
    'panel ownership - first editor panel does not consume Tab or Escape from second editor',
    !tab.defaultPrevented && !escape.defaultPrevented && panel.root.isConnected,
  );
  panel.close();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="anchor" aria-expanded="false"></button></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  const rect = anchor.getBoundingClientRect.bind(anchor);
  anchor.getBoundingClientRect = (() => {
    throw new Error('rect');
  }) as typeof anchor.getBoundingClientRect;
  let threw = false;
  try {
    openPanel(owner, { anchor });
  } catch {
    threw = true;
  }
  anchor.getBoundingClientRect = rect;
  const retry = openPanel(owner, { anchor });
  anchor.setAttribute('aria-expanded', 'host');
  retry.close();
  ok(
    'panel setup - initial placement failure and host aria-expanded changes both preserve the exact host baseline',
    threw && owner.querySelector('.nabi-panel') === null && anchor.getAttribute('aria-expanded') === 'host',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="anchor"></button></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  let submitted: Readonly<Record<string, string>> | null = null;
  const panel = openPrompt(owner, {
    anchor,
    fields: [
      { name: 'first', label: 'First', optional: true, value: 'set' },
      { name: 'second', label: 'Second', optional: true },
    ],
    okLabel: 'OK',
    onSubmit: (values) => {
      submitted = values;
    },
  });
  const inputs = [...panel.root.querySelectorAll('input')] as HTMLInputElement[];
  const okButton = panel.root.querySelector('button') as HTMLButtonElement;
  inputs[0]?.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  const secondFocused = owner.activeElement === inputs[1];
  inputs[1]?.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  const okFocused = owner.activeElement === okButton;
  inputs[0]!.value = '';
  inputs[0]?.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  okButton.click();
  ok(
    'prompt - Tab cycles fields and enabled confirmation, and an optional cleared value commits',
    secondFocused && okFocused && submitted?.['first'] === '' && submitted?.['second'] === '',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="anchor"></button></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  let clean = true;
  for (const field of [
    {
      get label(): string {
        throw new Error('label');
      },
      name: 'one',
    },
    {
      label: 'Value',
      get value(): string {
        throw new Error('value');
      },
      name: 'one',
    },
  ]) {
    let threw = false;
    try {
      openPrompt(owner, { anchor, fields: [field] as never, okLabel: 'OK', onSubmit: () => undefined });
    } catch {
      threw = true;
    }
    clean &&=
      threw &&
      owner.querySelector('.nabi-prompt') === null &&
      owner.querySelector('.nabi-scrim') === null &&
      anchor.getAttribute('aria-expanded') === null;
  }
  const retry = openPrompt(owner, { anchor, fields: [], okLabel: 'OK', onSubmit: () => undefined });
  retry.close();
  ok('prompt setup - throwing field label/value accessors restore the panel and anchor and permit retry', clean);
  dom.window.close();
}

{
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['원문'] }] });
  const openedFile = deferred<{ name: string; text: string } | null>();
  const store: FileStore = {
    save: () => undefined,
    open: () => openedFile.promise,
  };
  const mounted = mountFile({ nabi, registry, store });
  const opening = mounted.open();
  mounted.unmount();
  openedFile.resolve({ name: 'late.nabi', text: writeNabiFile([{ w: 'p', ch: ['늦은 문서'] }]) });
  const opened = await opening;
  ok(
    'file open - unmount 뒤 늦은 resolve를 적용하지 않는다',
    !opened && JSON.stringify(nabi.getJson()) === JSON.stringify([{ w: 'p', ch: ['원문'] }]),
  );
}

{
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('insertText', { text: 'B' });
  const saved = deferred<void>();
  const store: FileStore = {
    save: () => saved.promise,
    open: () => Promise.resolve(null),
  };
  const mounted = mountFile({ nabi, registry, store });
  mounted.save();
  mounted.unmount();
  saved.resolve();
  await tick();
  ok('file save - unmount 뒤 늦은 완료가 clean baseline을 바꾸지 않는다', nabi.isChanged());
}

{
  const data = new Map<string, string>();
  let now = 4000;
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  };
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const history = mountLocalHistory({ nabi, storage, minIntervalMs: 3000, now: () => now });
  history.snapshot();
  now = 5000;
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('insertText', { text: 'B' });
  history.unmount();
  ok('local history - throttle에 남은 마지막 편집을 unmount에서 flush한다', history.list()[0]?.summary === 'AB');
}

{
  const dom = new JSDOM('<div id="viewer"></div>');
  const root = dom.window.document.getElementById('viewer') as HTMLElement;
  const viewers = [attachViewer(root)];
  let rejected = false;
  try {
    viewers.push(attachViewer(root));
  } catch {
    rejected = true;
  }
  ok('viewer - 같은 root의 중복 attach를 즉시 거절한다', rejected);
  for (const viewer of viewers.reverse()) viewer.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const outerCard = dom.window.document.createElement('div');
  const innerCard = dom.window.document.createElement('div');
  const outer = openScrim(dom.window.document, { card: outerCard });
  const inner = openScrim(dom.window.document, { card: innerCard });
  dom.window.document.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  ok(
    'nested scrim - Escape는 document layer stack의 맨 위 판만 닫는다',
    dom.window.document.body.contains(outer.root) && !dom.window.document.body.contains(inner.root),
  );
  outer.close();
  inner.close();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><button id="anchor"></button><button id="outside"></button></body></html>',
  );
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  const outside = owner.getElementById('outside') as HTMLElement;
  const prompt = openPrompt(owner, {
    anchor,
    fields: [
      { name: 'one', label: 'One', optional: true },
      { name: 'two', label: 'Two', optional: true },
    ],
    okLabel: 'OK',
    onSubmit: () => undefined,
  });
  const controls = [...prompt.root.querySelectorAll<HTMLElement>('input, button')];
  controls.at(-1)?.focus();
  controls
    .at(-1)
    ?.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  const wrapped = owner.activeElement === controls[0];
  const nonmodal =
    prompt.root.getAttribute('role') === 'dialog' &&
    !prompt.root.hasAttribute('aria-modal') &&
    Boolean(prompt.root.getAttribute('aria-label') || prompt.root.getAttribute('aria-labelledby')) &&
    !anchor.hasAttribute('inert') &&
    owner.querySelector('.nabi-scrim') === null &&
    prompt.root.parentElement === anchor.parentElement;
  outside.dispatchEvent(new dom.window.PointerEvent('pointerdown', { bubbles: true }));
  ok(
    'prompt panel - named dialog, interactive background, focus cycle, and outside pointer close',
    nonmodal && wrapped && !prompt.root.isConnected,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const page = owner.getElementById('page') as HTMLElement;
  const outer = openScrim(owner, { card: owner.createElement('div') });
  const late = owner.createElement('button');
  owner.body.append(late);
  await tick();
  const lateInert = late.hasAttribute('inert');
  const inner = openScrim(owner, { card: owner.createElement('div') });
  const nestedRootSafe = !inner.root.hasAttribute('inert');
  inner.close();
  outer.close();
  ok(
    'scrim inert - late body siblings become inert while nested modal roots remain interactive',
    lateInert && nestedRootSafe && !late.hasAttribute('inert') && !page.hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="first"></div><div id="second"></div></body></html>');
  const owner = dom.window.document;
  const first = owner.getElementById('first') as HTMLElement;
  const second = owner.getElementById('second') as HTMLElement;
  const scrim = openScrim(owner, { card: owner.createElement('div') });
  const remove = first.removeAttribute.bind(first);
  first.removeAttribute = ((name: string) => {
    if (name === 'inert') throw new Error('restore failed');
    remove(name);
  }) as typeof first.removeAttribute;
  try {
    scrim.close();
  } catch {}
  first.removeAttribute = remove;
  ok(
    'scrim teardown - one inert restore failure still releases peers, layer root, and later retry',
    !second.hasAttribute('inert') && !scrim.root.isConnected && owner.querySelector('.nabi-scrim') === null,
  );
  const retry = openScrim(owner, { card: owner.createElement('div') });
  retry.close();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="outer"><button id="outer-surface"></button><div id="outer-tools"></div><div id="inner"><button id="inner-surface"></button><div id="inner-tools"></div></div></div></body></html>',
  );
  const owner = dom.window.document;
  const outer = owner.getElementById('outer') as HTMLElement;
  const inner = owner.getElementById('inner') as HTMLElement;
  const outerSurface = owner.getElementById('outer-surface') as HTMLElement;
  const innerSurface = owner.getElementById('inner-surface') as HTMLElement;
  const outerTools = owner.getElementById('outer-tools') as HTMLElement;
  const innerTools = owner.getElementById('inner-tools') as HTMLElement;
  const a = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const b = createNabiWith([], { doc: [{ w: 'p', ch: ['B'] }] });
  let outerPressed = 0;
  let innerPressed = 0;
  const hintsA = mountHints({
    root: outer,
    surface: outerSurface,
    toolbar: paletteToolbar(outer, () => {
      outerPressed += 1;
    }),
  });
  const hintsB = mountHints({
    root: inner,
    surface: innerSurface,
    toolbar: paletteToolbar(inner, () => {
      innerPressed += 1;
    }),
  });
  const viewA = mountViewTools({ ...a, root: outer, surface: outerSurface, container: outerTools });
  const viewB = mountViewTools({ ...b, root: inner, surface: innerSurface, container: innerTools });
  innerSurface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  innerSurface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  (outerTools.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement).click();
  (innerTools.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement).click();
  innerSurface.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );
  ok(
    'nested editor ownership - inner toolbox and Escape never activate or close the containing editor',
    outerPressed === 0 &&
      innerPressed === 1 &&
      outer.classList.contains('is-fullscreen') &&
      !inner.classList.contains('is-fullscreen'),
  );
  hintsA.unmount();
  hintsB.unmount();
  viewA.unmount();
  viewB.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><button id="a"></button><div id="a-tools"></div><button id="b"></button><div id="b-tools"></div></body></html>',
  );
  const owner = dom.window.document;
  const registry = makeRegistry(defaultWings);
  const a = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const b = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['B'] }] });
  let aSaves = 0;
  let bSaves = 0;
  const toolbarA = mountToolbar({
    nabi: a.nabi,
    registry,
    root: owner.getElementById('a-tools') as HTMLElement,
    surface: owner.getElementById('a') as HTMLElement,
    onHost: (name) => {
      if (name === 'save') aSaves += 1;
    },
  });
  const toolbarB = mountToolbar({
    nabi: b.nabi,
    registry,
    root: owner.getElementById('b-tools') as HTMLElement,
    surface: owner.getElementById('b') as HTMLElement,
    onHost: (name) => {
      if (name === 'save') bSaves += 1;
    },
  });
  (owner.getElementById('a') as HTMLElement).dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true }),
  );
  (owner.getElementById('b') as HTMLElement).dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true }),
  );
  ok(
    'toolbar ownership - sibling surface accelerators reach only their own toolbar land',
    aSaves === 1 && bSaves === 1,
  );
  toolbarA.unmount();
  toolbarB.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="a"></button><button id="b"></button></body></html>');
  const owner = dom.window.document;
  const registry = makeRegistry([]);
  const a = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const b = createNabiWith([], { doc: [{ w: 'p', ch: ['B'] }] });
  const first = mountDiffWing({ nabi: a.nabi, registry, surface: owner.getElementById('a') as HTMLElement });
  const second = mountDiffWing({ nabi: b.nabi, registry, surface: owner.getElementById('b') as HTMLElement });
  first.open();
  second.open();
  const top = [...owner.querySelectorAll<HTMLElement>('.nabi-diff-screen')].at(-1) as HTMLElement;
  first.close();
  ok(
    'diff close - a non-top fullscreen restores focus to the surviving top modal, not its old target',
    owner.activeElement === top && top.isConnected,
  );
  second.close();
  first.unmount();
  second.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const diff = mountDiffWing({ nabi, registry, surface });
  diff.unmount();
  diff.open();
  diff.close();
  diff.unmount();
  ok(
    'diff lifecycle - an unmounted public handle cannot recreate fullscreen modal or inert background',
    owner.querySelector('.nabi-diff-screen') === null &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const owner = dom.window.document;
  const outerCard = owner.createElement('div');
  const surface = owner.createElement('button');
  outerCard.append(surface);
  const outer = openScrim(owner, { card: outerCard });
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  const diff = mountDiffWing({ nabi, registry, surface });
  surface.focus();
  diff.open();
  diff.close();
  ok(
    'diff focus - a connected prior target inside the surviving dialog wins over its card fallback',
    owner.activeElement === surface,
  );
  diff.unmount();
  outer.close();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="diff"></div></body></html>');
  const owner = dom.window.document;
  const root = owner.getElementById('diff') as HTMLElement;
  const mounted = mountDiff({
    root,
    before: [{ w: 'p', ch: ['A'] }],
    after: [{ w: 'p', ch: ['B'] }],
    registry: makeRegistry(defaultWings),
  });
  const bar = owner.querySelector('.nabi-diff-bar') as HTMLElement;
  const extra = owner.createElement('button');
  extra.textContent = 'Close';
  bar.append(extra);
  const next = bar.querySelectorAll<HTMLButtonElement>('button')[1] as HTMLButtonElement;
  next.disabled = true;
  next.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  (owner.activeElement as HTMLButtonElement).dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
  );
  const fromDisabled = owner.activeElement === extra;
  extra.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
  const homeMoved = owner.activeElement === bar.querySelector('button:not([disabled])');
  next.disabled = false;
  next.focus();
  for (let i = 0; i < 10 && !next.disabled; i += 1) next.click();
  const rehomed =
    next.disabled && owner.activeElement !== next && !(owner.activeElement as HTMLButtonElement | null)?.disabled;
  ok(
    'diff standalone - named nonmodal region and toolbar keep dynamic keyboard roving after a disabled current control',
    root.getAttribute('role') === 'region' &&
      root.getAttribute('aria-modal') === null &&
      root.hasAttribute('aria-label') &&
      bar.getAttribute('role') === 'toolbar' &&
      bar.hasAttribute('aria-label') &&
      fromDisabled &&
      homeMoved &&
      rehomed,
  );
  mounted.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="frame"><div id="toolbar"></div><button id="surface"></button><div id="tools"></div></div></body></html>',
  );
  const owner = dom.window.document;
  const frame = owner.getElementById('frame') as HTMLElement;
  const surface = owner.getElementById('surface') as HTMLElement;
  const toolbarRoot = owner.getElementById('toolbar') as HTMLElement;
  const tools = owner.getElementById('tools') as HTMLElement;
  const { nabi, registry } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  let saved = 0;
  let hinted = 0;
  const toolbar = mountToolbar({
    nabi,
    registry,
    root: toolbarRoot,
    surface,
    onHost: (name) => {
      if (name === 'save') saved += 1;
    },
  });
  const hints = mountHints({
    root: frame,
    surface,
    toolbar: paletteToolbar(toolbarRoot, () => {
      hinted += 1;
    }),
  });
  const view = mountViewTools({ nabi, root: frame, surface, container: tools });
  surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  (tools.querySelector('button[data-name="fullscreen"]') as HTMLButtonElement).click();
  const enteredFullscreen = frame.classList.contains('is-fullscreen');
  surface.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  surface.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true }),
  );
  const exactlyOnce = hinted === 1 && saved === 1 && enteredFullscreen && !frame.classList.contains('is-fullscreen');
  view.unmount();
  hints.unmount();
  toolbar.unmount();
  const afterUnmount = new dom.window.KeyboardEvent('keydown', {
    key: 's',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  surface.dispatchEvent(afterUnmount);
  ok(
    'gesture identity - toolbar, hints, and view tools share one surface land and release safely in reverse',
    exactlyOnce && !afterUnmount.defaultPrevented && saved === 1,
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="frame"><button id="a"></button><button id="b"></button></div></body></html>',
  );
  const owner = dom.window.document;
  const frame = owner.getElementById('frame') as HTMLElement;
  const a = owner.getElementById('a') as HTMLElement;
  const b = owner.getElementById('b') as HTMLElement;
  let aPressed = 0;
  let bPressed = 0;
  const hintsA = mountHints({
    root: frame,
    surface: a,
    toolbar: paletteToolbar(frame, () => {
      aPressed += 1;
    }),
  });
  const hintsB = mountHints({
    root: frame,
    surface: b,
    toolbar: paletteToolbar(frame, () => {
      bPressed += 1;
    }),
  });
  a.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  a.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
  owner.body.dispatchEvent(
    new dom.window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }),
  );
  ok(
    'gesture identity - sibling surfaces sharing one broad frame still select their exact surface land',
    aPressed === 1 && bPressed === 0,
  );
  hintsB.unmount();
  hintsA.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="anchor"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  let submitted = 0;
  const onFocus = (event: Event): void => {
    if ((event.target as Element).tagName === 'INPUT')
      (owner.querySelector('.nabi-prompt button') as HTMLButtonElement | null)?.click();
  };
  owner.addEventListener('focusin', onFocus, true);
  openPrompt(owner, {
    anchor,
    fields: [{ name: 'value', label: 'Value', optional: true }],
    okLabel: 'OK',
    onSubmit: () => {
      submitted += 1;
    },
  });
  owner.removeEventListener('focusin', onFocus, true);
  ok(
    'prompt panel - focusin submit reentry closes the panel after its close delegate is installed',
    submitted === 1 &&
      owner.querySelector('.nabi-scrim') === null &&
      !anchor.hasAttribute('inert') &&
      anchor.getAttribute('aria-expanded') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="anchor"></button></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  let threw = false;
  try {
    openPrompt(owner, {
      anchor,
      fields: [
        {
          name: 'value',
          label: 'Value',
          value: 'x',
          validate: () => {
            throw new Error('invalid');
          },
        },
      ],
      okLabel: 'OK',
      onSubmit: () => undefined,
    });
  } catch {
    threw = true;
  }
  const retry = openPrompt(owner, {
    anchor,
    fields: [{ name: 'value', label: 'Value', optional: true }],
    okLabel: 'OK',
    onSubmit: () => undefined,
  });
  retry.close();
  ok(
    'prompt setup - a throwing initial validator removes the panel and anchor state before retry',
    threw && owner.querySelector('.nabi-prompt') === null && anchor.getAttribute('aria-expanded') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="host"><button id="anchor"></button></div></body></html>');
  const owner = dom.window.document;
  const anchor = owner.getElementById('anchor') as HTMLElement;
  Object.defineProperties(anchor, { offsetLeft: { value: 37 }, offsetTop: { value: 13 }, offsetHeight: { value: 9 } });
  const prompt = openPrompt(owner, {
    anchor,
    fields: [{ name: 'one', label: 'One', optional: true }],
    okLabel: 'OK',
    onSubmit: () => undefined,
  });
  const movedLeft = prompt.root.style.left;
  const movedTop = prompt.root.style.top;
  await tick();
  ok(
    'prompt panel position - content and deferred measurements retain anchor-relative coordinates',
    prompt.root.style.left === movedLeft && prompt.root.style.top === movedTop,
  );
  prompt.close();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const preview = openPreview({
    nabi,
    surface,
    onBody: () => () => {
      throw new Error('detach failed');
    },
  });
  const named =
    preview.card.getAttribute('role') === 'dialog' &&
    preview.card.getAttribute('aria-modal') === 'true' &&
    Boolean(preview.card.getAttribute('aria-label') || preview.card.getAttribute('aria-labelledby'));
  const image = owner.createElement('img');
  (preview.card.querySelector('.nabi-preview-body') as HTMLElement).append(image);
  image.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  try {
    preview.close();
  } catch {}
  ok(
    'preview dialog - a named modal still closes nested lightbox and restores inert background after body teardown failure',
    named &&
      owner.querySelector('.nabi-scrim') === null &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  let restored = 0;
  let removed = 0;
  const panel = openHistoryPanel({
    surface,
    history: {
      alive: () => true,
      list: () => [{ sessionId: 'old', summary: 'Old', body: '[]', savedAt: 1, createdAt: 1 }],
      restore: () => {
        restored += 1;
        return true;
      },
      remove: () => {
        removed += 1;
        return true;
      },
      clear: () => true,
      ask: { confirm: async () => true },
      toast: () => undefined,
      sessionId: 'current',
      snapshot: () => true,
      forget: () => true,
      unmount: () => undefined,
    } as never,
    render: () => '<p>Preview</p>',
  }) as NonNullable<ReturnType<typeof openHistoryPanel>>;
  const [open, view, drop] = [
    ...panel.card.querySelectorAll<HTMLButtonElement>('.nabi-history-open, .nabi-history-tool'),
  ];
  view?.click();
  const preview = owner.querySelector('.nabi-history-preview') as HTMLElement;
  panel.close();
  open?.click();
  view?.click();
  drop?.click();
  await tick();
  panel.close();
  ok(
    'history modal - outer close owns its preview and retained history controls become inert',
    owner.querySelectorAll('.nabi-scrim').length === 0 &&
      !preview.isConnected &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert') &&
      restored === 0 &&
      removed === 0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const preview = openPreview({ nabi, surface });
  const image = owner.createElement('img');
  (preview.card.querySelector('.nabi-preview-body') as HTMLElement).append(image);
  preview.close();
  (preview.card.querySelector('.nabi-preview-body') as HTMLElement).append(image);
  image.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  ok(
    'preview teardown - retained card listeners cannot open a lightbox after close',
    owner.querySelector('.nabi-scrim') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><button id="surface"></button><div id="page"></div></body></html>');
  const owner = dom.window.document;
  const surface = owner.getElementById('surface') as HTMLElement;
  const { nabi } = createNabiWith([], {
    doc: [
      { w: 'p', ch: ['A'] },
      { w: 'p', ch: ['B'] },
    ],
  });
  nabi.select({ anchor: { path: [1], offset: 0 }, focus: { path: [1], offset: 0 } });
  let detached = 0;
  const rect = dom.window.HTMLElement.prototype.getBoundingClientRect;
  dom.window.HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
    if (this.classList.contains('nabi-card')) throw new Error('measure failed');
    return rect.call(this);
  };
  let threw = false;
  try {
    openPreview({
      nabi,
      surface,
      onBody: () => () => {
        detached += 1;
      },
    });
  } catch {
    threw = true;
  }
  dom.window.HTMLElement.prototype.getBoundingClientRect = rect;
  ok(
    'preview setup - post-scrim measurement failure closes the modal and detaches the body exactly once',
    threw &&
      detached === 1 &&
      owner.querySelector('.nabi-scrim') === null &&
      !surface.hasAttribute('inert') &&
      !(owner.getElementById('page') as HTMLElement).hasAttribute('inert'),
  );
  dom.window.close();
}

done('regression-lifecycle');
