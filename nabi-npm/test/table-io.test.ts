import { JSDOM } from 'jsdom';
import { caretAt } from '../src/caret/index.js';
import { nodeAt, positionExists } from '../src/doc/index.js';
import { hostOf } from '../src/editor/index.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/index.js';
import { insertFragmentOp, ioFiltersOf, makePasteFlow, mountSurface, mountUpload } from '../src/surface/index.js';
import { mountToolbar, mountUploadView, type ToolbarPanelContext } from '../src/ui/index.js';
import { $createNabiWith, createNabiWith } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { done, eq, ok } from './net.js';
import { tinyHtml } from './tiny-html.js';

const p = (text = ''): ElementNode => ({ w: 'p', ch: text ? [text] : [] });
const wrap = (w: string, ch: readonly NabiNode[] = [], a?: ElementNode['a']): ElementNode => ({
  w: 'p',
  ch: [{ w, ...(a ? { a } : {}), ch }],
});
const initial = (text = 'ab', header = false): NabiDoc => [
  wrap('table', [
    {
      w: 'tr',
      ch: [
        { w: 'td', ...(header ? { a: { th: 1 } } : {}), ch: [p(text)] },
        { w: 'td', ch: [p('neighbor')] },
      ],
    },
  ]),
  p('outside'),
];
const path = [0, 0, 0, 0, 0];
const cellPath = path.slice(0, -1);
const make = (doc = initial()) => $createNabiWith(defaultWings, { doc, parseHtml: tinyHtml });
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const textOf = (node: NabiNode): string => (typeof node === 'string' ? node : node.ch.map(textOf).join(''));

for (const [name, fragment] of [
  ['image', [wrap('img', [], { src: 'https://example.test/p.png' })]],
  ['list', [wrap('ul', [{ w: 'li', ch: [p('list item')] }])]],
  [
    'mixed',
    [
      p('first'),
      wrap('img', [], { src: 'https://example.test/p.png' }),
      wrap('ol', [{ w: 'oli', ch: [p('list item')] }]),
      p('last'),
    ],
  ],
] as const) {
  const { nabi, registry } = make();
  nabi.select(caretAt({ path, offset: 1 }));
  const before = nabi.getJson();
  ok(`${name}: insert in cell`, hostOf(nabi).applyRaw(insertFragmentOp(fragment), 'insertFragment'));
  const doc = nabi.getJson() as NabiDoc;
  eq(`${name}: outer paragraphs untouched`, doc.slice(1), [p('outside')]);
  eq(`${name}: neighboring cell untouched`, nodeAt(doc, [0, 0, 0, 1])?.ch, [p('neighbor')]);
  const cell = nodeAt(doc, cellPath)!;
  ok(
    `${name}: fragment structures preserved`,
    fragment.every((node) => JSON.stringify(cell.ch).includes(JSON.stringify(node))),
  );
  eq(`${name}: caret stays in cell`, nabi.getSelection().focus.path.slice(0, 4), cellPath);
  ok(`${name}: caret is valid`, positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env));
  ok(`${name}: one undo`, nabi.undo());
  eq(`${name}: undo restores source`, nabi.getJson(), before);
}

{
  const { nabi, registry } = make(initial('', true));
  nabi.select(caretAt({ path, offset: 0 }));
  const fragment = [
    wrap('table', [
      {
        w: 'tr',
        ch: [
          { w: 'td', ch: [p('nested one'), wrap('img', [], { src: '/nested.png' })] },
          { w: 'td', ch: [p('nested two')] },
        ],
      },
    ]),
    wrap('float', [p('float text'), wrap('ul', [{ w: 'li', ch: [{ ...p('heading'), a: { h: 2 } }] }])], {
      side: 'left',
      w: 40,
    }),
  ];
  ok(
    'prohibited wrappers paste without losing contents',
    hostOf(nabi).applyRaw(insertFragmentOp(fragment), 'insertFragment'),
  );
  const cell = nodeAt(nabi.getJson() as NabiDoc, cellPath)!;
  const stored = JSON.stringify(cell.ch);
  ok('nested tables and floats removed', !stored.includes('"w":"table"') && !stored.includes('"w":"float"'));
  eq('unwrapped content preserves order', textOf(cell), 'nested onenested twofloat textheading');
  ok('unwrapped image and list preserved', stored.includes('"w":"img"') && stored.includes('"w":"ul"'));
  ok('header descendants lose heading attributes', !stored.includes('"h":'));
  ok('unwrapping leaves valid caret', positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env));
}

for (const nesting of ['quote', 'list'] as const) {
  const nested = nesting === 'quote' ? wrap('quote', [p('ab')]) : wrap('ul', [{ w: 'li', ch: [p('ab')] }]);
  const { nabi, registry } = make([
    wrap('table', [
      {
        w: 'tr',
        ch: [
          { w: 'td', ch: [nested] },
          { w: 'td', ch: [p('neighbor')] },
        ],
      },
    ]),
    p('outside'),
  ]);
  const nestedPath = [...path, 0, ...(nesting === 'list' ? [0] : []), 0];
  nabi.select(caretAt({ path: nestedPath, offset: 1 }));
  const before = nabi.getJson();
  const paste = makePasteFlow({ nabi, filters: ioFiltersOf({ registry, parse: tinyHtml }), locale: () => 'en' });
  ok(
    `${nesting}: rich nested-table paste succeeds`,
    paste(
      {
        files: [],
        types: [],
        custom: '',
        plain: '',
        html: '<table><tr><td><p>text</p><p><img src="/nested-paste.png"></p><ul><li>item</li></ul></td></tr></table>',
      },
      [],
    ),
  );
  const doc = nabi.getJson() as NabiDoc;
  const inner = nodeAt(doc, nestedPath.slice(0, -1))!;
  eq(`${nesting}: original text split around all pasted blocks`, inner.ch, [
    p('a'),
    p('text'),
    wrap('img', [], { src: '/nested-paste.png' }),
    wrap('ul', [{ w: 'li', ch: [p('item')] }]),
    p('b'),
  ]);
  eq(`${nesting}: adjacent cell untouched`, nodeAt(doc, [0, 0, 0, 1])?.ch, [p('neighbor')]);
  eq(`${nesting}: outside paragraph untouched`, doc.slice(1), [p('outside')]);
  ok(`${nesting}: valid caret`, positionExists(hostOf(nabi).doc(), nabi.getSelection().focus, registry.env));
  eq(
    `${nesting}: caret stays in original inner container`,
    nabi.getSelection().focus.path.slice(0, -1),
    nestedPath.slice(0, -1),
  );
  ok(`${nesting}: one undo restores nested source`, nabi.undo());
  eq(`${nesting}: source restored`, nabi.getJson(), before);
}

for (const kind of ['code', 'summary'] as const) {
  const nested = kind === 'code' ? wrap('code', ['ab']) : wrap('details', [{ w: 'summary', ch: ['ab'] }, p('body')]);
  const { nabi } = make([wrap('table', [{ w: 'tr', ch: [{ w: 'td', ch: [nested] }] }])]);
  const inlinePath = [...path, 0, ...(kind === 'summary' ? [0] : [])];
  nabi.select(caretAt({ path: inlinePath, offset: 1 }));
  ok(
    `${kind}: block paste keeps inline fallback`,
    hostOf(nabi).applyRaw(insertFragmentOp([p('first'), p('second')]), 'insertFragment'),
  );
  eq(`${kind}: paragraphs become line breaks`, nodeAt(nabi.getJson() as NabiDoc, inlinePath)?.ch, [
    'afirst',
    { w: 'br', ch: [] },
    'secondb',
  ]);
  eq(`${kind}: caret stays in inline holder`, nabi.getSelection().focus.path, inlinePath);
}

{
  const { nabi, registry } = make(initial(''));
  const paste = makePasteFlow({ nabi, filters: ioFiltersOf({ registry, parse: tinyHtml }), locale: () => 'en' });
  const target = caretAt({ path, offset: 0 });
  nabi.select(caretAt({ path: [1], offset: 1 }));
  ok(
    'drop target is honored',
    paste(
      {
        files: [],
        types: [],
        custom: '',
        plain: '',
        html: '<p>first</p><ul><li>item</li></ul><p><img src="/drop.png"></p>',
      },
      [],
      target,
    ),
  );
  const cell = nodeAt(nabi.getJson() as NabiDoc, cellPath)!;
  ok(
    'HTML drop inserts rich blocks into target cell',
    JSON.stringify(cell).includes('"w":"img"') && JSON.stringify(cell).includes('"w":"ul"'),
  );
  eq('HTML drop leaves outside paragraph', (nabi.getJson() as NabiDoc).slice(1), [p('outside')]);
  const before = nabi.getJson();
  nabi.select({ anchor: { path, offset: 0 }, focus: { path: [0, 0, 0, 1, 0], offset: 1 } });
  ok('paste across cells rejected', !paste({ files: [], types: [], custom: '', plain: 'replace', html: '' }, []));
  eq('cross-cell paste keeps all content', nabi.getJson(), before);
}

{
  const { nabi } = make(initial(''));
  const transfer = deferred<{ uri: string }>();
  let result: unknown;
  nabi.select(caretAt({ path, offset: 0 }));
  const upload = mountUpload({
    nabi,
    uploader: () => transfer.promise,
    onSettle: () => {
      nabi.select(caretAt({ path: [1], offset: 1 }));
    },
    onDone: (value) => {
      result = value;
    },
  });
  const before = nabi.getJson();
  upload.take([{ name: 'image.png', size: 1, type: 'image/png' }]);
  transfer.resolve({ uri: '/uploaded.png' });
  await tick();
  ok(
    'upload returns to starting cell',
    JSON.stringify(nodeAt(nabi.getJson() as NabiDoc, cellPath)).includes('/uploaded.png'),
  );
  eq('upload does not follow moved selection outside', (nabi.getJson() as NabiDoc).slice(1), [p('outside')]);
  eq('upload reports committed result', result, { committed: 1, cancelled: false });
  ok('upload one undo', nabi.undo());
  eq('upload undo restores source', nabi.getJson(), before);
  upload.unmount();
}

for (const mutation of ['replace', 'remove-cell', 'remove-paragraph'] as const) {
  const notices: string[] = [];
  const { nabi } = $createNabiWith(defaultWings, {
    doc: initial(''),
    parseHtml: tinyHtml,
    toast: (_level, message) => {
      notices.push(message);
    },
  });
  nabi.select(caretAt({ path, offset: 0 }));
  let after: unknown;
  let result: unknown;
  const upload = mountUpload({
    nabi,
    uploader: () => ({ uri: '/late.png' }),
    onSettle: () => {
      if (mutation === 'replace') nabi.setJson([p('replacement')]);
      else if (mutation === 'remove-cell') nabi.applyCommand('deleteColumn');
      else
        hostOf(nabi).applyRaw(
          (doc, selection) => ({
            doc: [
              {
                ...doc[0]!,
                ch: [
                  {
                    ...(doc[0]!.ch[0] as ElementNode),
                    ch: [
                      {
                        w: 'tr',
                        ch: [
                          { w: 'td', ch: [p('new paragraph')] },
                          { w: 'td', ch: [p('neighbor')] },
                        ],
                      },
                    ],
                  },
                ],
              },
              doc[1]!,
            ],
            selection,
          }),
          'replaceParagraph',
        );
      after = nabi.getJson();
    },
    onDone: (value) => {
      result = value;
    },
    locale: 'en',
  });
  upload.take([{ name: 'image.png', size: 1, type: 'image/png' }]);
  await tick();
  eq(`${mutation}: stale upload is cancelled`, result, { committed: 0, cancelled: true });
  eq(`${mutation}: upload does not change edited document`, nabi.getJson(), after);
  ok(
    `${mutation}: feedback explains cancellation`,
    notices.some((message) => message.includes('document changed')),
  );
  eq(`${mutation}: editor unlocked`, hostOf(nabi).lockedBy(), null);
  upload.unmount();
}

{
  const dom = new JSDOM('<div id="surface"></div>', { pretendToBeVisual: true });
  const surfaceRoot = dom.window.document.querySelector('#surface') as HTMLElement;
  const editor = createNabiWith(defaultWings, { doc: initial('') });
  const surface = mountSurface({ ...editor, root: surfaceRoot });
  editor.nabi.select(caretAt({ path, offset: 0 }));
  const view = mountUploadView({ nabi: editor.nabi, surface: surfaceRoot, bandwidth: 0 });
  view.start([
    {
      id: 'cell-upload',
      file: { name: 'a.pdf', size: 1, type: 'application/pdf' },
      name: 'a.pdf',
      size: 1,
      image: false,
    },
  ]);
  eq(
    'upload placeholder is inside original cell',
    surfaceRoot.querySelector('nabi-upload')?.parentElement?.tagName,
    'TD',
  );
  const original = surfaceRoot.querySelector('nabi-upload')!.parentElement;
  editor.nabi.select(caretAt({ path: [1], offset: 0 }));
  await tick();
  ok('moving caret does not move placeholder', surfaceRoot.querySelector('nabi-upload')?.parentElement === original);
  editor.nabi.setJson([p('replaced')]);
  await tick();
  eq('removed placeholder target has no root fallback', surfaceRoot.querySelector('nabi-upload'), null);
  view.unmount();
  surface.unmount();
  dom.window.close();
}

for (const changed of [false, true]) {
  const dom = new JSDOM('<div class="nabi"><div id="toolbar"></div><div id="surface"></div></div>', {
    pretendToBeVisual: true,
  });
  const owner = dom.window.document;
  const notices: string[] = [];
  const editor = createNabiWith(defaultWings, {
    doc: initial(''),
    toast: (_level, message) => {
      notices.push(message);
    },
  });
  const surfaceRoot = owner.querySelector('#surface') as HTMLElement;
  const surface = mountSurface({ ...editor, root: surfaceRoot });
  let panel!: ToolbarPanelContext;
  const toolbar = mountToolbar({
    ...editor,
    root: owner.querySelector('#toolbar') as HTMLElement,
    surface: surfaceRoot,
    panels: {
      img: (context) => {
        panel = context;
      },
    },
  });
  editor.nabi.select(caretAt({ path, offset: 0 }));
  ok('image panel opens inside cell', toolbar.buttons.find((button) => button.w === 'img')!.press('pointer'));
  if (changed) editor.nabi.setJson([p('replacement')]);
  else editor.nabi.select(caretAt({ path: [1], offset: 0 }));
  eq('image panel respects saved target validity', panel.insertImage('/panel.png'), !changed);
  if (changed) {
    eq('stale panel preserves replacement document', editor.nabi.getJson(), [p('replacement')]);
    ok(
      'stale panel provides feedback',
      notices.some((message) => message.includes('document changed')),
    );
  } else {
    ok(
      'image panel inserts inside opening cell',
      JSON.stringify(nodeAt(editor.nabi.getJson() as NabiDoc, cellPath)).includes('/panel.png'),
    );
    eq('image panel never follows outside caret', (editor.nabi.getJson() as NabiDoc).slice(1), [p('outside')]);
  }
  toolbar.unmount();
  surface.unmount();
  dom.window.close();
}

for (const entry of ['prompt', 'file'] as const) {
  for (const changed of [false, true]) {
    const dom = new JSDOM('<div class="nabi"><div id="toolbar"></div><div id="surface"></div></div>', {
      pretendToBeVisual: true,
    });
    const owner = dom.window.document;
    const notices: string[] = [];
    const editor = createNabiWith(defaultWings, {
      doc: initial(''),
      toast: (_level, message) => {
        notices.push(message);
      },
    });
    const surfaceRoot = owner.querySelector('#surface') as HTMLElement;
    const surface = mountSurface({ ...editor, root: surfaceRoot });
    let filesAt: unknown;
    const toolbar = mountToolbar({
      ...editor,
      root: owner.querySelector('#toolbar') as HTMLElement,
      surface: surfaceRoot,
      onFiles: () => {
        filesAt = editor.nabi.getSelection();
      },
    });
    const target = caretAt({ path, offset: 0 });
    editor.nabi.select(target);
    toolbar.buttons.find((button) => button.w === (entry === 'prompt' ? 'img' : 'upload'))!.press('pointer');
    if (changed) editor.nabi.setJson([p('replacement')]);
    else editor.nabi.select(caretAt({ path: [1], offset: 0 }));
    if (entry === 'prompt') {
      const input = owner.querySelector('.nabi-prompt input[data-name="src"]') as HTMLInputElement;
      input.value = '/prompt.png';
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      if (!changed)
        ok(
          'URL prompt retains opening cell',
          JSON.stringify(nodeAt(editor.nabi.getJson() as NabiDoc, cellPath)).includes('/prompt.png'),
        );
    } else {
      const input = owner.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [new dom.window.File(['x'], 'image.png', { type: 'image/png' })],
      });
      input.dispatchEvent(new dom.window.Event('change'));
      eq('file picker retains opening target or cancels stale target', filesAt, changed ? undefined : target);
    }
    if (changed) {
      eq(`${entry}: stale input preserves new document`, editor.nabi.getJson(), [p('replacement')]);
      ok(
        `${entry}: stale input provides feedback`,
        notices.some((message) => message.includes('document changed')),
      );
    }
    toolbar.unmount();
    surface.unmount();
    dom.window.close();
  }
}

done('table-io');
