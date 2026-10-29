import { JSDOM } from 'jsdom';
import { caretAt } from '../src/caret/index.js';
import { nodeAt } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiDoc } from '../src/schema/index.js';
import { mountSurface, mountUpload } from '../src/surface/index.js';
import { mountUploadView } from '../src/ui/index.js';
import { createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { done, eq, ok } from './net.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const wrap = (w: string, ch: readonly ElementNode[]): ElementNode => ({ w: 'p', ch: [{ w, ch }] });
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const cases = [
  { name: 'root', doc: [p('start'), p('outside')], path: [0], scope: [] },
  { name: 'float', doc: [wrap('float', [p('start'), p('next')]), p('outside')], path: [0, 0, 0], scope: [0, 0] },
  { name: 'empty float', doc: [wrap('float', [p()]), p('outside')], path: [0, 0, 0], scope: [0, 0] },
  {
    name: 'quote in float',
    doc: [wrap('float', [wrap('quote', [p('start')]), p('next')]), p('outside')],
    path: [0, 0, 0, 0, 0],
    scope: [0, 0],
  },
  {
    name: 'list in float',
    doc: [wrap('float', [wrap('ul', [{ w: 'li', ch: [p('start')] }]), p('next')]), p('outside')],
    path: [0, 0, 0, 0, 0, 0],
    scope: [0, 0],
  },
  {
    name: 'cell in float',
    doc: [wrap('float', [wrap('table', [{ w: 'tr', ch: [{ w: 'td', ch: [p('start'), p('next')] }] }])]), p('outside')],
    path: [0, 0, 0, 0, 0, 0, 0],
    scope: [0, 0, 0, 0, 0, 0],
  },
] satisfies readonly { name: string; doc: NabiDoc; path: number[]; scope: number[] }[];

for (const { name, doc, path, scope } of cases) {
  const dom = new JSDOM('<div id="surface"></div>', { pretendToBeVisual: true });
  const root = dom.window.document.querySelector<HTMLElement>('#surface')!;
  const editor = createNabiWith(defaultWings, { doc });
  const { nabi } = editor;
  const surface = mountSurface({ ...editor, root });
  nabi.select(caretAt({ path, offset: 0 }));
  const before = nabi.getJson();
  const anchorPath = path.slice(0, scope.length + 1);
  const anchor = root.querySelector(`[data-key="${nodeAt(hostOf(nabi).doc(), anchorPath)!._id}"]`)!;
  const parent = scope.length ? root.querySelector(`[data-key="${nodeAt(hostOf(nabi).doc(), scope)!._id}"]`)! : root;
  let complete!: (value: { uri: string }) => void;
  const transfer = new Promise<{ uri: string }>((resolve) => {
    complete = resolve;
  });
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const view = mountUploadView({ nabi, surface: root, bandwidth: 0 });
  const upload = mountUpload({
    nabi,
    root,
    uploader: () => transfer,
    onStart: (tasks) => view.start(tasks),
    onProgress: (id, percent) => view.progress(id, percent),
    onSettle: () => {
      nabi.select(caretAt({ path: [1], offset: 0 }));
    },
    onDone: (result) => {
      eq(`${name}: upload commits`, result, { committed: 1, cancelled: false });
      view.done();
      finish();
    },
  });
  upload.take([{ name: 'image.png', size: 1, type: 'image/png' }]);
  const box = root.querySelector('nabi-upload');
  ok(`${name}: progress stays in insertion scope`, box?.parentElement === parent);
  ok(`${name}: progress follows starting block`, anchor.nextElementSibling === box);
  eq(`${name}: progress does not change stored document`, nabi.getJson(), before);

  box?.remove();
  nabi.select(caretAt({ path: [1], offset: 0 }));
  await tick();
  ok(`${name}: progress returns to original scope after redraw`, box?.parentElement === parent);
  ok(`${name}: progress retains original block after caret moves`, anchor.nextElementSibling === box);

  complete({ uri: '/uploaded.png' });
  await finished;
  const committed = nabi.getJson() as NabiDoc;
  const blocks = scope.length ? nodeAt(committed, scope)!.ch : committed;
  ok(`${name}: completed image stays in insertion scope`, JSON.stringify(blocks).includes('/uploaded.png'));
  eq(`${name}: outside paragraph is unchanged`, committed.slice(-1), [p('outside')]);
  eq(`${name}: image caret stays in insertion scope`, nabi.getSelection().focus.path.slice(0, -1), scope);
  eq(`${name}: progress clears on completion`, root.querySelector('nabi-upload'), null);
  ok(`${name}: upload is undoable`, nabi.undo());
  eq(`${name}: one undo restores original document`, nabi.getJson(), before);
  upload.unmount();
  view.unmount();
  surface.unmount();
  dom.window.close();
}

{
  const dom = new JSDOM('<div id="surface"></div>', { pretendToBeVisual: true });
  const root = dom.window.document.querySelector<HTMLElement>('#surface')!;
  const editor = createNabiWith(defaultWings, { doc: [wrap('float', [p('start')]), p('outside')] });
  const surface = mountSurface({ ...editor, root });
  editor.nabi.select(caretAt({ path: [0, 0, 0], offset: 0 }));
  const view = mountUploadView({ nabi: editor.nabi, surface: root, bandwidth: 0 });
  view.start([
    {
      id: 'removed-target',
      file: { name: 'image.png', size: 1, type: 'image/png' },
      name: 'image.png',
      size: 1,
      image: true,
    },
  ]);
  editor.nabi.setJson([p('replacement')]);
  await tick();
  eq('removed float has no progress fallback at document root', root.querySelector('nabi-upload'), null);
  view.unmount();
  surface.unmount();
  dom.window.close();
}

done('upload scope');
