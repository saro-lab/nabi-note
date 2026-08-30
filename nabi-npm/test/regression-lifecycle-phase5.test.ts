import { JSDOM } from 'jsdom';
import { mountDiff } from '../src/diff/index.js';
import { browserFileStore, mountFile, mountLocalHistory, mountSurface, mountUpload } from '../src/surface/index.js';
import { createNabiWith, makeRegistry, type Wing } from '../src/wing/index.js';
import { renderToolbarHtml } from '../src/wing/toolbar-html.js';
import { defaultWings } from '../src/wings/index.js';
import { injectSheets, mountContextToolbar, mountToolbar, watchSettle } from '../src/ui/index.js';
import { HostElementLease, openFilePicker } from '../src/lifecycle.js';
import { writeNabiFile, type FileStore } from '../src/io/index.js';
import { HISTORY_KEY, type HistoryRecord } from '../src/wings/local-history/local-history.js';
import { done, eq, ok } from './net.js';
import { hostOf } from '../src/editor/index.js';

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

{
  const dom = new JSDOM('<div id="root" class="host" data-host="yes"><span>baseline</span></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const baseline = root.firstElementChild as HTMLElement;
  let baselineClicks = 0;
  baseline.addEventListener('click', () => {
    baselineClicks += 1;
  });
  let firstClicks = 0;
  let secondClicks = 0;
  const first: Wing = {
    w: 'exLifecycleFirst',
    place: 'tool',
    attach: ({ root: host }) => {
      const click = (): void => {
        firstClicks += 1;
      };
      host.classList.add('attached-first');
      host.addEventListener('click', click);
      return () => {
        host.classList.remove('attached-first');
        host.removeEventListener('click', click);
      };
    },
  };
  const second: Wing = {
    w: 'exLifecycleSecond',
    place: 'tool',
    attach: ({ root: host, onDispose }) => {
      const click = (): void => {
        secondClicks += 1;
      };
      host.addEventListener('click', click);
      onDispose(() => host.removeEventListener('click', click));
      host.setAttribute('data-partial', 'yes');
      throw new Error('attach failed');
    },
  };
  const editor = createNabiWith([first, second], { doc: [{ w: 'p', ch: ['editor'] }] });
  let threw = false;
  try {
    mountSurface({ ...editor, root });
  } catch {
    threw = true;
  }
  baseline.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  root.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  ok('attach onDispose rollback - attach 실행 중 등록한 listener를 throw 후에도 떼어 낸다', secondClicks === 0);
  ok(
    'attach rollback - 앞선 disposer와 root DOM/attribute를 모두 되돌린다',
    threw &&
      firstClicks === 0 &&
      secondClicks === 0 &&
      baselineClicks === 1 &&
      root.firstElementChild === baseline &&
      root.innerHTML === '<span>baseline</span>' &&
      root.className === 'host' &&
      root.getAttribute('data-host') === 'yes' &&
      !root.hasAttribute('data-partial'),
    root.outerHTML,
  );
  const retry = createNabiWith([], { doc: [{ w: 'p', ch: ['retry'] }] });
  const mounted = mountSurface({ ...retry, root });
  mounted.unmount();
  ok('attach rollback - 실패한 mount가 root claim을 남기지 않는다', root.textContent === 'retry');
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="root"></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['A'] }] });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  const surface = mountSurface({ nabi, registry, root });
  surface.port.writeCaret(nabi.getSelection());
  root.dispatchEvent(new dom.window.CompositionEvent('compositionstart', { bubbles: true }));
  const holder = root.querySelector('[data-key]') as HTMLElement;
  holder.textContent = 'A한';
  surface.unmount();
  ok(
    'surface composition unmount - 보이는 미확정 IME 입력을 tree에 확정한 뒤 canonical HTML을 남긴다',
    root.textContent === 'A한' && nabi.getHtml() === root.innerHTML,
    [root.innerHTML, JSON.stringify(nabi.getJson())],
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="root" class="host" dir="ltr" style="--nabi-placeholder: old"></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const { nabi, registry } = createNabiWith([], { doc: [{ w: 'p', ch: ['canonical'] }] });
  const surface = mountSurface({ nabi, registry, root, locale: 'ar', placeholder: 'draft' });
  root.setAttribute('dir', 'auto');
  root.style.setProperty('--nabi-placeholder', 'host-change');
  root.classList.add('host-mid');
  surface.unmount();
  ok(
    'surface lease - host 중간 변경을 보존하고 자기 attr/class만 compare-and-restore한다',
    root.getAttribute('dir') === 'auto' &&
      root.style.getPropertyValue('--nabi-placeholder') === 'host-change' &&
      root.classList.contains('host') &&
      root.classList.contains('host-mid') &&
      !root.classList.contains('nabi-editing') &&
      !root.hasAttribute('contenteditable'),
    root.outerHTML,
  );
  ok(
    'surface unmount - editor key/filler가 아닌 canonical read-only HTML을 남긴다',
    root.innerHTML === nabi.getHtml() && root.querySelector('[data-key], [data-nabi-filler]') === null,
    root.innerHTML,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const view = dom.window;
  const createObjectURL = view.URL.createObjectURL;
  const revokeObjectURL = view.URL.revokeObjectURL;
  const click = view.HTMLAnchorElement.prototype.click;
  const revoked: string[] = [];
  view.URL.createObjectURL = () => 'blob:phase5';
  view.URL.revokeObjectURL = (url: string): void => {
    revoked.push(url);
  };
  view.HTMLAnchorElement.prototype.click = () => {
    throw new Error('save click failed');
  };
  let threw = false;
  try {
    browserFileStore(view.document).save({ name: 'a.nabi', text: '{}' });
  } catch {
    threw = true;
  }
  view.HTMLAnchorElement.prototype.click = click;
  await tick();
  ok(
    'browser save cleanup - anchor click이 throw해도 숨은 anchor를 걷고 blob URL을 revoke한다',
    threw && view.document.querySelector('a[download]') === null && revoked[0] === 'blob:phase5',
    [view.document.body.innerHTML, JSON.stringify(revoked)],
  );
  view.URL.createObjectURL = createObjectURL;
  view.URL.revokeObjectURL = revokeObjectURL;
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="root"></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const editor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  const surface = mountSurface({ ...editor, root });
  const pending = deferred<{ uri: string } | null>();
  let doneCalls = 0;
  const progress: ((percent: number) => void)[] = [];
  const upload = mountUpload({
    nabi: editor.nabi,
    root,
    uploader: (task) => {
      progress.push(task.onProgress);
      return pending.promise;
    },
    onDone: () => {
      doneCalls += 1;
    },
  });
  upload.take([{ name: 'a.png', size: 1, type: 'image/png' }]);
  surface.unmount();
  eq(
    'out-of-order lease - surface를 먼저 떼어도 upload 잠금은 유지된다',
    root.getAttribute('contenteditable'),
    'false',
  );
  upload.cancel();
  eq(
    'out-of-order lease - 마지막 upload lease가 떠나면 surface 전 baseline으로 돌아간다',
    root.getAttribute('contenteditable'),
    null,
  );
  progress[0]?.(75);
  pending.resolve({ uri: '/late.png' });
  await tick();
  eq('upload cancel - onDone은 즉시 한 번이고 late progress/resolve가 callback을 되살리지 않는다', doneCalls, 1);
  upload.unmount();
  dom.window.close();
}

{
  const rejectedEditor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  let rejectedUploads = 0;
  let rejectedMount!: ReturnType<typeof mountUpload>;
  rejectedMount = mountUpload({
    nabi: rejectedEditor.nabi,
    extensions: ['png'],
    uploader: () => {
      rejectedUploads += 1;
      return null;
    },
    onReject: () => rejectedMount.unmount(),
  });
  rejectedMount.take([
    { name: 'bad.exe', size: 1, type: 'application/octet-stream' },
    { name: 'good.png', size: 1, type: 'image/png' },
  ]);

  const startedEditor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  let startedUploads = 0;
  let doneCalls = 0;
  let startedMount!: ReturnType<typeof mountUpload>;
  startedMount = mountUpload({
    nabi: startedEditor.nabi,
    uploader: () => {
      startedUploads += 1;
      return null;
    },
    onStart: () => startedMount.cancel(),
    onDone: () => {
      doneCalls += 1;
    },
  });
  startedMount.take([{ name: 'good.png', size: 1, type: 'image/png' }]);
  ok(
    'upload callback reentry - onReject unmount와 onStart cancel 뒤 uploader/lock을 시작하거나 되살리지 않는다',
    rejectedUploads === 0 &&
      hostOf(rejectedEditor.nabi).lockedBy() === null &&
      !rejectedMount.isRunning() &&
      startedUploads === 0 &&
      hostOf(startedEditor.nabi).lockedBy() === null &&
      !startedMount.isRunning() &&
      doneCalls === 1,
  );
  startedMount.unmount();
}

{
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  const calls: string[] = [];
  let mounted!: ReturnType<typeof mountUpload>;
  mounted = mountUpload({
    nabi,
    uploader: (task) => {
      calls.push(task.name);
      if (calls.length === 1) mounted.cancel();
      return null;
    },
  });
  mounted.take([
    { name: 'first.png', size: 1, type: 'image/png' },
    { name: 'second.png', size: 1, type: 'image/png' },
  ]);
  await tick();
  eq('upload uploader reentry - 첫 동기 uploader가 cancel하면 뒤 파일 uploader를 시작하지 않는다', calls, [
    'first.png',
  ]);
  mounted.unmount();
}

{
  const dom = new JSDOM('<div id="root" contenteditable="true"></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  const toggle = root.classList.toggle;
  root.classList.toggle = ((name: string, force?: boolean): boolean => {
    if (name === 'nabi-uploading') throw new Error('class write failed');
    return toggle.call(root.classList, name, force);
  }) as typeof root.classList.toggle;
  const upload = mountUpload({ nabi, root, uploader: () => null });
  let threw = false;
  try {
    upload.take([{ name: 'a.png', size: 1, type: 'image/png' }]);
  } catch {
    threw = true;
  }
  root.classList.toggle = toggle;
  ok(
    'upload lock transaction - host property write가 throw해도 editor lock과 앞선 lease를 rollback한다',
    threw && hostOf(nabi).lockedBy() === null && root.getAttribute('contenteditable') === 'true' && !upload.isRunning(),
    root.outerHTML,
  );
  upload.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="root" data-mode="base" class="base" style="color: red"></div>');
  const root = dom.window.document.getElementById('root') as HTMLElement;
  const lower = new HostElementLease(root);
  lower.attribute('data-mode', 'lower');
  lower.className('active', true);
  lower.style('color', 'blue');
  const upper = new HostElementLease(root);
  upper.attribute('data-mode', 'upper');
  upper.className('active', false);
  upper.style('color', 'green');
  lower.attribute('data-mode', 'lower-next');
  eq(
    '공통 lease - 아래 handle 갱신은 살아 있는 위 lease의 DOM 값을 덮지 않는다',
    root.getAttribute('data-mode'),
    'upper',
  );
  lower.dispose();
  upper.dispose();
  ok(
    '공통 lease - 역순이 아닌 release도 전체 baseline을 복원한다',
    root.getAttribute('data-mode') === 'base' && root.className === 'base' && root.style.color === 'red',
    root.outerHTML,
  );
  const hostLease = new HostElementLease(root);
  hostLease.attribute('data-mode', 'mount');
  root.setAttribute('data-mode', 'host');
  hostLease.dispose();
  eq('공통 lease - host가 마지막 값을 바꾸면 덮어쓰지 않는다', root.getAttribute('data-mode'), 'host');

  root.setAttribute('data-mode', 'base');
  const throwingLease = new HostElementLease(root);
  throwingLease.attribute('data-mode', 'mount');
  const setAttribute = root.setAttribute;
  root.setAttribute = ((name: string, value: string): void => {
    if (name === 'data-mode' && value === 'failed') throw new Error('host write failed');
    setAttribute.call(root, name, value);
  }) as typeof root.setAttribute;
  let updateThrew = false;
  try {
    throwingLease.attribute('data-mode', 'failed');
  } catch {
    updateThrew = true;
  }
  root.setAttribute = setAttribute;
  throwingLease.dispose();
  ok(
    '공통 lease - 기존 handle write가 throw하면 값도 rollback해 dispose가 baseline을 복원한다',
    updateThrew && root.getAttribute('data-mode') === 'base',
    root.outerHTML,
  );
  dom.window.close();
}

{
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const calls: string[] = [];
  const offFirst = hostOf(nabi).registerCommand('ownedCommand', () => {
    calls.push('first');
    return null;
  });
  const offSecond = hostOf(nabi).registerCommand('ownedCommand', () => {
    calls.push('second');
    return null;
  });
  offFirst();
  nabi.applyCommand('ownedCommand');
  offSecond();
  nabi.applyCommand('ownedCommand');
  eq('command disposer - 아래 등록을 먼저 떼도 위 구현만 돌고 폐기된 구현은 복원되지 않는다', calls, ['second']);

  const offAgain = hostOf(nabi).registerCommand('ownedCommand', () => {
    calls.push('again');
    return null;
  });
  const offTop = hostOf(nabi).registerCommand('ownedCommand', () => {
    calls.push('top');
    return null;
  });
  offTop();
  nabi.applyCommand('ownedCommand');
  offAgain();
  eq('command disposer - 위 등록을 먼저 떼면 살아 있는 바로 아래 구현만 복원한다', calls, ['second', 'again']);
}

{
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const opens = [deferred<{ name: string; text: string } | null>(), deferred<{ name: string; text: string } | null>()];
  let at = 0;
  const store: FileStore = {
    save: () => undefined,
    open: () => (opens[at++] as (typeof opens)[number]).promise,
  };
  const file = mountFile({ nabi, registry, store });
  const first = file.open();
  const second = file.open();
  opens[1]?.resolve({ name: 'second.nabi', text: writeNabiFile([{ w: 'p', ch: ['second'] }]) });
  ok('file open order - 최신 open 결과를 적용한다', await second);
  opens[0]?.resolve({ name: 'first.nabi', text: writeNabiFile([{ w: 'p', ch: ['first'] }]) });
  const openedDoc = nabi.getJson() as readonly { readonly ch: readonly unknown[] }[];
  ok(
    'file open order - 늦게 끝난 오래된 open은 false이고 문서를 덮지 않는다',
    !(await first) && openedDoc[0]?.ch[0] === 'second',
  );
  file.unmount();
}

{
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const saves = [deferred<void>(), deferred<void>()];
  let at = 0;
  const store: FileStore = {
    save: () => (saves[at++] as (typeof saves)[number]).promise,
    open: () => Promise.resolve(null),
  };
  const file = mountFile({ nabi, registry, store });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('insertText', { text: 'B' });
  file.save();
  nabi.applyCommand('insertText', { text: 'C' });
  file.save();
  saves[1]?.resolve();
  await tick();
  ok('file save order - 최신 save 완료가 현재 문서를 clean으로 만든다', !nabi.isChanged());
  saves[0]?.resolve();
  await tick();
  ok('file save order - 오래된 save의 늦은 완료가 clean baseline을 되돌리지 않는다', !nabi.isChanged());
  file.unmount();
}

{
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('insertText', { text: 'B' });
  const thenableState: { resolve?: () => void } = {};
  const store: FileStore = {
    save: () =>
      ({
        then(resolve: () => void) {
          thenableState.resolve = resolve;
        },
      }) as unknown as Promise<void>,
    open: () => Promise.resolve(null),
  };
  const file = mountFile({ nabi, registry, store });
  file.save();
  ok('file save thenable - cross-realm 모양의 thenable은 완료 전 clean이 아니다', nabi.isChanged());
  await tick();
  thenableState.resolve?.();
  await tick();
  ok('file save thenable - thenable이 실제 완료된 뒤 clean baseline을 옮긴다', !nabi.isChanged());
  file.unmount();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const store = browserFileStore(dom.window.document);
  const cancelled = store.open();
  const cancelInput = dom.window.document.querySelector('input[type="file"]') as HTMLInputElement;
  cancelInput.dispatchEvent(new dom.window.Event('cancel'));
  eq('browser picker - cancel event가 null로 끝나고 input을 걷는다', await cancelled, null);
  eq(
    'browser picker - cancel cleanup 뒤 숨은 input이 없다',
    dom.window.document.querySelectorAll('input[type="file"]').length,
    0,
  );

  const focused = store.open();
  dom.window.dispatchEvent(new dom.window.Event('focus'));
  eq('browser picker - change 없는 브라우저의 focus fallback이 null로 끝난다', await focused, null);
  eq(
    'browser picker - focus fallback도 같은 cleanup으로 input을 걷는다',
    dom.window.document.querySelectorAll('input[type="file"]').length,
    0,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const editor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const reason = new Error('file read failed');
  const reported: unknown[] = [];
  const mounted = mountFile({
    ...editor,
    store: browserFileStore(dom.window.document),
    onError: (error) => {
      reported.push(error);
    },
  });
  const opening = mounted.open();
  const input = dom.window.document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: [{ name: 'bad.nabi', text: () => Promise.reject(reason) }],
  });
  input.dispatchEvent(new dom.window.Event('change'));
  ok('browser picker - file.text rejection은 open false로 끝난다', !(await opening));
  eq('browser picker - 실제 읽기 실패는 취소와 달리 onError에 정확히 한 번 보고한다', reported, [reason]);
  mounted.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const owner = dom.window.document;
  const prototype = dom.window.HTMLInputElement.prototype;
  const click = prototype.click;
  let errors = 0;
  let cancels = 0;
  prototype.click = () => {
    throw new Error('click failed');
  };
  const dispose = openFilePicker(owner, {
    onFiles: () => undefined,
    onCancel: () => {
      cancels += 1;
    },
    onError: () => {
      errors += 1;
      throw new Error('report failed');
    },
  });
  prototype.click = click;
  dispose();
  dom.window.dispatchEvent(new dom.window.Event('focus'));
  await tick();
  ok(
    'picker click throw - onError가 다시 던져도 input/listener를 한 번에 정리한다',
    errors === 1 && cancels === 0 && owner.querySelector('input[type="file"]') === null,
  );

  const append = owner.body.append;
  owner.body.append = () => {
    throw new Error('append failed');
  };
  let appendErrors = 0;
  openFilePicker(owner, {
    onFiles: () => undefined,
    onError: () => {
      appendErrors += 1;
      throw new Error('append report failed');
    },
  });
  owner.body.append = append;
  dom.window.dispatchEvent(new dom.window.Event('focus'));
  await tick();
  ok(
    'picker append throw - 연결 전 예외도 listener/input을 남기지 않는다',
    appendErrors === 1 && owner.querySelector('input[type="file"]') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="surface"></div></body></html>');
  const registry = makeRegistry(defaultWings);
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const mounted = mountFile({ nabi, registry, store: browserFileStore(dom.window.document) });
  const opening = mounted.open();
  ok(
    'file picker unmount - picker가 열린 동안 input이 선다',
    dom.window.document.querySelector('input[type="file"]') !== null,
  );
  mounted.unmount();
  ok(
    'file picker unmount - signal abort가 host error 없이 open을 false로 끝내고 input을 걷는다',
    !(await opening) && dom.window.document.querySelector('input[type="file"]') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body><div id="toolbar"></div><div id="surface"></div></body></html>');
  const root = dom.window.document.getElementById('toolbar') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: [] }] });
  let files = 0;
  const toolbar = mountToolbar({
    ...editor,
    root,
    surface,
    onFiles: () => {
      files += 1;
    },
  });
  toolbar.buttons.find((button) => button.w === 'upload')?.press();
  ok(
    'toolbar picker - file action이 숨은 input을 세운다',
    dom.window.document.querySelector('input[type="file"]') !== null,
  );
  toolbar.unmount();
  ok(
    'toolbar picker - unmount는 onFiles를 부르지 않고 input/listener만 정리한다',
    files === 0 && dom.window.document.querySelector('input[type="file"]') === null,
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const view = dom.window;
  const request = view.requestAnimationFrame;
  const cancel = view.cancelAnimationFrame;
  const frameState: { callback?: FrameRequestCallback } = {};
  const cancelled: number[] = [];
  view.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    frameState.callback = callback;
    return 41;
  };
  view.cancelAnimationFrame = (id: number): void => {
    cancelled.push(id);
  };
  let calls = 0;
  const first = watchSettle(view.document, { quietMs: 1 });
  first.afterViewport(() => {
    calls += 1;
  });
  first.unmount();
  eq('settle teardown - 예약 rAF를 unmount에서 취소한다', cancelled, [41]);
  frameState.callback?.(0);
  await tick();
  eq('settle teardown - 취소된 rAF를 강제로 불러도 callback이 돌지 않는다', calls, 0);

  delete frameState.callback;
  const second = watchSettle(view.document, { quietMs: 1 });
  second.afterViewport(() => {
    calls += 1;
  });
  const kick = (): FrameRequestCallback | undefined => frameState.callback;
  const scheduled = kick();
  if (scheduled) scheduled(0);
  second.unmount();
  await tick();
  eq('settle teardown - rAF가 만든 timeout도 unmount에서 취소한다', calls, 0);

  const third = watchSettle(view.document, { quietMs: 1 });
  let secondListener = 0;
  third.onSettle(() => {
    throw new Error('listener failed');
  });
  third.onSettle(() => {
    secondListener += 1;
  });
  view.document.dispatchEvent(new view.Event('pointerdown', { bubbles: true }));
  view.document.dispatchEvent(new view.Event('pointerup', { bubbles: true }));
  eq('settle callback 격리 - 한 listener가 throw해도 다음 listener를 부른다', secondListener, 1);

  third.afterViewport(() => {
    throw new Error('viewport callback failed');
  });
  const thrownViewport = kick();
  if (thrownViewport) thrownViewport(0);
  await tick();
  third.afterViewport(() => {
    calls += 1;
  });
  const nextViewport = kick();
  if (nextViewport) nextViewport(0);
  await tick();
  eq('settle callback 격리 - afterViewport throw 뒤에도 다음 예약을 완료한다', calls, 1);
  third.unmount();
  view.requestAnimationFrame = request;
  view.cancelAnimationFrame = cancel;
  dom.window.close();
}

{
  const source: HistoryRecord = {
    sessionId: 'source',
    summary: 'source',
    body: JSON.stringify([{ w: 'p', ch: ['source'] }]),
    savedAt: 1,
    createdAt: 1,
  };
  const data = new Map<string, string>([[HISTORY_KEY, JSON.stringify([source])]]);
  let rejectWrites = true;
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (rejectWrites) throw new Error('quota');
      data.set(key, value);
    },
    removeItem: (key: string) => data.delete(key),
  };
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['current'] }] });
  const history = mountLocalHistory({ nabi, storage, minIntervalMs: 0 });
  ok('local history restore - 문서 자체는 undo 가능한 command로 복원한다', history.restore(source));
  ok(
    'local history restore - 새 session write가 실패하면 원 기록을 먼저 지우지 않는다',
    history.list().some((record) => record.sessionId === source.sessionId),
  );
  rejectWrites = false;
  ok('local history restore - write가 성공하면 restore를 완료한다', history.restore(source));
  ok(
    'local history restore - 새 session write 성공 뒤에만 원 기록을 실제로 지운다',
    !history.list().some((record) => record.sessionId === source.sessionId) &&
      history.list().some((record) => record.sessionId === nabi.sessionId),
  );
  history.unmount();
}

{
  const data = new Map<string, string>();
  let attempts = 0;
  let rejectWrites = true;
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      attempts += 1;
      if (rejectWrites) throw new Error('quota');
      data.set(key, value);
    },
    removeItem: (key: string) => data.delete(key),
  };
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['A'] }] });
  const history = mountLocalHistory({ nabi, storage, minIntervalMs: 3000, now: () => 1 });
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('insertText', { text: 'B' });
  history.unmount();
  rejectWrites = false;
  history.unmount();
  ok(
    'local history unmount - 실패한 trailing flush도 두 번째 unmount에서 재시도하지 않는다',
    attempts === 1 && !data.has(HISTORY_KEY),
    `attempts=${attempts}`,
  );
}

{
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  const owner = dom.window.document;
  const external = owner.createElement('style');
  external.textContent = '.external { color: red; }';
  owner.head.append(external);
  const releaseExternal = injectSheets(owner, ['.external { color: red; }']);
  releaseExternal();
  ok('CSS ownership - host가 먼저 둔 정확히 같은 CSS는 refcount가 0이어도 제거하지 않는다', external.isConnected);

  const first = injectSheets(owner, ['.same { color: red; }']);
  const second = injectSheets(owner, ['.same { color: red; }']);
  second();
  eq('CSS refcount reverse - 둘째를 먼저 떼어도 첫째 시트가 남는다', owner.head.querySelectorAll('style').length, 2);
  const managed = [...owner.head.querySelectorAll('style')].find((style) => style !== external) as HTMLStyleElement;
  managed.textContent = '.host-changed { color: blue; }';
  const reacquired = injectSheets(owner, ['.same { color: red; }']);
  ok(
    'CSS exact reacquire - 활성 시트를 host가 바꾸면 정확한 원문을 가진 새 시트를 세운다',
    [...owner.head.querySelectorAll('style')].some((style) => style.textContent === '.same { color: red; }'),
  );
  first();
  ok('CSS compare-and-restore - host가 시트 내용을 바꾸면 마지막 disposer가 제거하지 않는다', managed.isConnected);
  reacquired();

  const other = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  const releaseMoved = injectSheets(owner, ['.moved { display: block; }']);
  const moved = [...owner.head.querySelectorAll('style')].find(
    (style) => style.textContent === '.moved { display: block; }',
  ) as HTMLStyleElement;
  other.window.document.head.append(moved);
  const releaseReplacement = injectSheets(owner, ['.moved { display: block; }']);
  const replacement = [...owner.head.querySelectorAll('style')].find(
    (style) => style.textContent === '.moved { display: block; }',
  );
  releaseMoved();
  ok(
    'CSS owner reacquire - 다른 Document로 옮겨진 cache를 재사용하거나 원래 disposer로 제거하지 않는다',
    replacement !== undefined &&
      replacement !== moved &&
      moved.isConnected &&
      moved.ownerDocument === other.window.document,
  );
  releaseReplacement();
  other.window.close();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="toolbar"><span data-host="before"></span></div><div id="surface"></div>');
  const root = dom.window.document.getElementById('toolbar') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const first = mountToolbar({ ...editor, root, surface, locale: 'ar' });
  let duplicate = false;
  try {
    mountToolbar({ ...editor, root, surface });
  } catch {
    duplicate = true;
  }
  root.setAttribute('dir', 'auto');
  const host = dom.window.document.createElement('span');
  host.setAttribute('data-host', 'mid');
  root.append(host);
  first.unmount();
  ok(
    'toolbar root/cleanup - duplicate를 막고 host 중간 attr/DOM은 보존하며 조작 UI만 걷는다',
    duplicate &&
      root.getAttribute('dir') === 'auto' &&
      root.querySelector('[data-host="mid"]') === host &&
      root.querySelector('.nabi-strip, .nabi-group, .nabi-toasts') === null,
    root.outerHTML,
  );
  const retry = mountToolbar({ ...editor, root, surface });
  retry.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="toolbar-first"></div><div id="toolbar-second"></div><div id="surface"></div>');
  const firstRoot = dom.window.document.getElementById('toolbar-first') as HTMLElement;
  const secondRoot = dom.window.document.getElementById('toolbar-second') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([], { doc: [{ w: 'p', ch: [] }], locale: 'de' });

  const sameFirst = mountToolbar({ ...editor, root: firstRoot, surface, locale: 'en' });
  const sameSecond = mountToolbar({ ...editor, root: secondRoot, surface, locale: 'en' });
  sameFirst.unmount();
  const identicalLocaleSurvives = hostOf(editor.nabi).locale() === 'en';
  sameSecond.unmount();

  const first = mountToolbar({ ...editor, root: firstRoot, surface, locale: 'en' });
  const second = mountToolbar({ ...editor, root: secondRoot, surface, locale: 'ar' });
  second.unmount();
  const restoredLocale = hostOf(editor.nabi).locale() === 'en';
  hostOf(editor.nabi).toast('info', 'first toolbar', 60_000);
  const restoredToast =
    firstRoot.querySelector('.nabi-toast')?.textContent === 'first toolbar' &&
    secondRoot.querySelector('.nabi-toast') === null;
  const answer = hostOf(editor.nabi).ask.choose?.('Pick', [{ label: 'A' }, { label: 'B' }]);
  const restoredChoose = dom.window.document.querySelector('.nabi-choose') !== null;
  dom.window.document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  const cancelled = (await answer) === -1;
  first.unmount();
  ok(
    'toolbar sink layers - distinct root를 역순으로 떼어도 toast/choose/locale의 살아 있는 아래 layer를 복원한다',
    identicalLocaleSurvives &&
      restoredLocale &&
      restoredToast &&
      restoredChoose &&
      cancelled &&
      hostOf(editor.nabi).locale() === 'de',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="context"></div><div id="surface"></div>');
  const root = dom.window.document.getElementById('context') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const first = mountContextToolbar({ ...editor, root, surface, locale: 'ar' });
  let duplicate = false;
  try {
    mountContextToolbar({ ...editor, root, surface });
  } catch {
    duplicate = true;
  }
  root.setAttribute('dir', 'auto');
  const host = dom.window.document.createElement('span');
  host.setAttribute('data-host', 'mid');
  root.append(host);
  first.unmount();
  ok(
    'context root/cleanup - duplicate를 막고 host 중간 attr/DOM은 보존하며 context UI만 걷는다',
    duplicate &&
      root.getAttribute('dir') === 'auto' &&
      root.querySelector('[data-host="mid"]') === host &&
      root.querySelector('.nabi-ctx-group') === null,
    root.outerHTML,
  );
  const retry = mountContextToolbar({ ...editor, root, surface });
  retry.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="diff"></div></body></html>');
  const root = dom.window.document.getElementById('diff') as HTMLElement;
  const registry = makeRegistry([]);
  const first = mountDiff({ root, registry, before: [{ w: 'p', ch: ['A'] }], after: [{ w: 'p', ch: ['B'] }] });
  let duplicate = false;
  try {
    mountDiff({ root, registry, before: [], after: [] });
  } catch {
    duplicate = true;
  }
  root.classList.add('host-mid');
  const host = dom.window.document.createElement('span');
  host.setAttribute('data-host', 'mid');
  root.append(host);
  first.unmount();
  ok(
    'diff root/cleanup - duplicate를 막고 host 중간 class/DOM은 보존하며 diff UI/CSS만 걷는다',
    duplicate &&
      root.classList.contains('host-mid') &&
      root.querySelector('[data-host="mid"]') === host &&
      root.querySelector('.nabi-diff-bar, .nabi-diff-body') === null &&
      dom.window.document.head.querySelector('style[data-nabi-diff]') === null,
    root.outerHTML,
  );
  const retry = mountDiff({ root, registry, before: [], after: [] });
  retry.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="toolbar"><i>baseline</i></div><div id="surface"></div>');
  const root = dom.window.document.getElementById('toolbar') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const baseline = root.firstElementChild as HTMLElement;
  let baselineClicks = 0;
  baseline.addEventListener('click', () => {
    baselineClicks += 1;
  });
  const append = root.append;
  root.append = () => {
    throw new Error('toolbar append failed');
  };
  let threw = false;
  try {
    mountToolbar({ ...editor, root, surface });
  } catch {
    threw = true;
  }
  root.append = append;
  baseline.click();
  const rolledBack = root.firstElementChild === baseline && baselineClicks === 1;
  const retry = mountToolbar({ ...editor, root, surface });
  retry.unmount();
  ok(
    'toolbar transaction - constructor throw 뒤 child identity/listener/claim을 rollback해 다시 mount한다',
    threw && rolledBack && root.innerHTML === '<i>baseline</i>',
  );
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="context" class="host"><i>baseline</i></div><div id="surface"></div>');
  const root = dom.window.document.getElementById('context') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([], { doc: [{ w: 'p', ch: [] }] });
  const baseline = root.firstElementChild as HTMLElement;
  let baselineClicks = 0;
  baseline.addEventListener('click', () => {
    baselineClicks += 1;
  });
  const toggle = root.classList.toggle;
  root.classList.toggle = () => {
    throw new Error('context class failed');
  };
  let threw = false;
  try {
    mountContextToolbar({ ...editor, root, surface });
  } catch {
    threw = true;
  }
  root.classList.toggle = toggle;
  baseline.click();
  const rolledBack = root.firstElementChild === baseline && baselineClicks === 1;
  const retry = mountContextToolbar({ ...editor, root, surface });
  retry.unmount();
  ok(
    'context transaction - constructor throw 뒤 child identity/listener/attribute/claim을 rollback한다',
    threw && rolledBack && root.className === 'host',
  );
  dom.window.close();
}

{
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="diff" class="host"><i>baseline</i></div></body></html>',
  );
  const root = dom.window.document.getElementById('diff') as HTMLElement;
  const registry = makeRegistry([]);
  const baseline = root.firstElementChild as HTMLElement;
  let baselineClicks = 0;
  baseline.addEventListener('click', () => {
    baselineClicks += 1;
  });
  const replace = root.replaceChildren;
  root.replaceChildren = () => {
    throw new Error('diff replace failed');
  };
  let threw = false;
  try {
    mountDiff({ root, registry, before: [], after: [] });
  } catch {
    threw = true;
  }
  root.replaceChildren = replace;
  baseline.click();
  const rolledBack =
    root.firstElementChild === baseline &&
    baselineClicks === 1 &&
    root.className === 'host' &&
    root.innerHTML === '<i>baseline</i>' &&
    dom.window.document.head.querySelector('style[data-nabi-diff]') === null;
  const retry = mountDiff({ root, registry, before: [], after: [] });
  retry.unmount();
  ok(
    'diff transaction - constructor throw 뒤 DOM/attribute/CSS/claim을 rollback한다',
    threw && rolledBack && dom.window.document.head.querySelector('style[data-nabi-diff]') === null,
    [root.outerHTML, dom.window.document.head.innerHTML, `threw=${String(threw)}`],
  );
  dom.window.close();
}

{
  let failRefresh = true;
  const lateWing: Wing = {
    w: 'exLateWire',
    place: 'attr',
    attrKey: 'h',
    attrValues: [1],
    currentValue: () => {
      if (failRefresh) throw new Error('late refresh failed');
      return undefined;
    },
    button: {
      group: 'heading',
      label: { en: 'Late wire' },
      action: { kind: 'host' },
    },
  };
  const dom = new JSDOM('<div id="toolbar"></div><div id="surface"></div>');
  const root = dom.window.document.getElementById('toolbar') as HTMLElement;
  const surface = dom.window.document.getElementById('surface') as HTMLElement;
  const editor = createNabiWith([lateWing], { doc: [{ w: 'p', ch: ['A'] }] });
  root.innerHTML = renderToolbarHtml({ registry: editor.registry, locale: 'en' });
  const button = root.querySelector('button[data-name="exLateWire"]') as HTMLButtonElement;
  let calls = 0;
  let threw = false;
  try {
    mountToolbar({
      ...editor,
      root,
      surface,
      locale: 'en',
      onHost: () => {
        calls += 1;
      },
    });
  } catch {
    threw = true;
  }
  const afterFailure = new dom.window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
  button.dispatchEvent(afterFailure);
  failRefresh = false;
  const toolbar = mountToolbar({
    ...editor,
    root,
    surface,
    locale: 'en',
    onHost: () => {
      calls += 1;
    },
  });
  const whileMounted = new dom.window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
  button.dispatchEvent(whileMounted);
  button.click();
  toolbar.unmount();
  const afterUnmount = new dom.window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
  button.dispatchEvent(afterUnmount);
  ok(
    'SSR toolbar transaction - late throw/unmount가 기존 button 배선을 떼고 retry click을 한 번만 처리한다',
    threw &&
      root.querySelector('button') === null &&
      !afterFailure.defaultPrevented &&
      whileMounted.defaultPrevented &&
      !afterUnmount.defaultPrevented &&
      calls === 1,
    `calls=${calls}`,
  );
  dom.window.close();
}

done('regression-lifecycle-phase5');
