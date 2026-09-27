# npm quickstart

## Install

```sh
npm install nabi-note
```

NABI NOTE declares zero runtime dependencies. The package declares Node.js 20 or newer and a browser baseline of Chrome/Edge 120, Firefox 120, and Safari 17.

## Minimal editor

```html
<div id="editor" class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  wings,
} from 'nabi-note';
import 'nabi-note/nabi.css';

const root = document.querySelector<HTMLElement>('#editor')!;
const content = document.querySelector<HTMLElement>('#content')!;
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!;

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
});

const surface = mountSurface({ nabi, registry, root: content, locale: 'en' });
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
});

// Later:
// toolbar.unmount();
// surface.unmount();
```

Do not set `contenteditable` yourself. `mountSurface()` sets it and adds `.nabi-editing`. Give every active surface, toolbar, context toolbar, and standalone diff its own separate, non-overlapping root. A duplicate root or an active ancestor and descendant overlap throws. After the owning mount unmounts, the other root can be mounted. Mount roots should otherwise start without host-owned child DOM. Matching direct groups from `renderToolbarHtml()` are the package-owned SSR toolbar exception. The host supplies `.nabi`, `.nabi-toolbar`, and `.nabi-content` placement classes.

The browser factory wires its internal `DOMParser` adapter automatically, so `setHtml()`, HTML files, and HTML paste need no parser option.

`undoLimit` defaults to 200 and accepts integers of 1 or greater. `typingMergeMs` defaults to 1000 milliseconds; set it to 0 to keep every insertion as a separate undo step. Invalid values throw during editor creation. `onError` receives isolated command, repair, normalization, listener, and host callback failures.

## Change the UI language without resetting editing state

```ts
import { createLocale, createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note';

const locale = createLocale('en');
const { nabi, registry } = createNabiWith(wings().allBasic(), { locale });
const surface = mountSurface({ nabi, registry, root: content, locale });
const toolbar = mountToolbar({ nabi, registry, root: toolbarRoot, surface: content, locale });

// Call from the host's language selector:
locale.setLocale('ko');
```

Share this same `locale` with context/view toolbars, file/upload mounts, upload
views, history/save/preview panels, diff mounts and viewer attachments that
should follow the switch. A string locale stays fixed. For dictionary overrides,
use `makeTranslator(locale, extraDictionary)` and pass it as `translator` to UI
mounts. Make one controller per independently localized editor, or deliberately
share one between editors. Built-in notices and input prompts use polite wording
in every supported locale; preserve that tone in custom dictionary overrides.

Do not unmount, recreate the editor, call `setHtml`/`setJson`, or redraw the
surface for a locale change. Content, undo/redo, selection, dirty state, session,
local history, diff baseline and in-flight work stay intact. UI labels and explicit
locale-derived direction update in place. If the document direction must remain
independent of UI language, leave the surface's `locale` unset and manage its
`dir` yourself; give the controller to the UI mounts instead.

## Choosing wings

```ts
import { boldWing, createNabiWith, imageWing, wings } from 'nabi-note';

createNabiWith([boldWing, imageWing]);
createNabiWith(wings().all());
createNabiWith(wings().allBasic().use('save').use('open'));
createNabiWith(wings().all().drop('upload').use('fs', { values: ['sm', 'lg'] }));
```

- `all()` includes all 30 official wings.
- `allBasic()` includes 26 and omits `upload`, `save`, `open`, and `diff`, which need host wiring.
- A direct array is the tree-shakable route for a small set.
- `use('upload')` pulls its first available dependency, `img`, if neither `img` nor `a` is present.
- `drop()` refuses to break a dependency and never cascades.
- The builder validates unknown names, unknown option keys, option shapes, and custom names immediately.

See `wings.md` for the catalog.

## Read and write

```ts
const json = nabi.getJson();
const html = nabi.getHtml();

nabi.setJson(json);
nabi.setHtml(html);

const stop = nabi.onChange((change) => {
  if (change.doc) console.log(nabi.getJson());
});
stop();
```

Blank `null`, `undefined`, whitespace, or an empty array loads a valid empty document. Invalid nonblank input returns `false` and leaves the current document unchanged. Successful `setJson()` and `setHtml()` establish a clean saved baseline and can be undone.

Store JSON or published HTML. Never store `getEditorHtml()`.

## Recommended UI composition

```ts
import {
  mountContextToolbar,
  mountHints,
  mountPickedMark,
  mountSticky,
  mountViewTools,
} from 'nabi-note';
import { attachViewer } from 'nabi-note/viewer';

const contextRoot = document.createElement('div');
toolbarRoot.append(contextRoot);

const context = mountContextToolbar({
  nabi, registry, root: contextRoot, surface: content, locale: 'en',
});
const hints = mountHints({ toolbar, context, root, surface: content });
const picked = mountPickedMark({ nabi, surface: content });
const sticky = mountSticky({ root: toolbarRoot, surface: content, nabi });
const view = mountViewTools({
  nabi,
  surface: content,
  root,
  container: toolbarRoot,
  locale: 'en',
  onBody: (body) => {
    const viewer = attachViewer(body, { locale: 'en' });
    return () => viewer.unmount();
  },
});
```

Pass `surface` to toolbar-like mounts. It scopes keyboard accelerators and focus restoration, which is required when multiple editors share a page.

## Files

The built-in file filters save `.nabi`, `.nhtml`, and `.md`. They open those formats plus ordinary `.html`.

```ts
import {
  browserFileStore,
  mountFile,
  openSavePanel,
} from 'nabi-note';

const file = mountFile({
  nabi,
  registry,
  store: browserFileStore(document),
  locale: 'en',
});

file.save();
file.saveAs('markdown', 'draft');
await file.open();
openSavePanel({ file, surface: content, locale: 'en' });
```

Only a `.nabi` save moves the saved baseline. `.nhtml` and `.md` are exports. Markdown is marked lossy and falls back to embedded HTML for registered nodes without Markdown syntax.

## Upload wiring

```ts
import { mountUpload, mountUploadView } from 'nabi-note';

const uploadView = mountUploadView({ nabi, surface: content });
const upload = mountUpload({
  nabi,
  uploader: async ({ file, onProgress, signal }) => {
    const uri = await sendToServer(file, { onProgress, signal });
    return { uri };
  },
  onStart: uploadView.start,
  onProgress: uploadView.progress,
  onSettle: uploadView.settle,
  onDone: () => uploadView.done(),
});
```

The uploader return URI is validated when committed. If local `blob:` or `data:image/...` URIs are required, enable the document import, image wing, and upload wing boundaries separately. See `io-security.md`.

## Local history

```ts
import { browserHistoryStorage, mountLocalHistory } from 'nabi-note';

const history = mountLocalHistory({
  nabi,
  storage: browserHistoryStorage(window),
});
```

Defaults: key `nabi-note.history`, limit 20, and at most one automatic snapshot per 3000 ms. Pass `storage: null` when storage is unavailable so UI can report the blocked state.

## Locale

Set the same locale on editor assembly and mounts. Default is `en`. Supported dictionary codes are `en`, `zh`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`, `ur`, `de`, `ja`, `fa`, `mr`, `vi`, `te`, `ha`, `tr`, `sw`, `ta`, `ko`, `th`, and `it`; regional tags normalize to their base language, and `ar`, `ur`, and `fa` (including regional variants) are RTL.

## Cleanup

Unmount in reverse ownership order. Every observer, UI mount, surface, upload, file, and history mount owns listeners or registrations.

## More

- Exact signatures: `api-reference.md`
- IO and URL rules: `io-security.md`
- SSR and hydration: `ssr.md`

## Icon files and optional view controls

Keep `dist/icons/` with the package CSS when hosting static files yourself; a bundler must emit the referenced image assets. SVG, WebP, and PNG overrides use `--nabi-icon-<key>` CSS variables. `mountViewTools({ ...options, showPreview: false })` omits only preview, and `showFullscreen: false` omits only fullscreen. Both default to true. See `icons.md` for SSR, keys, and theme examples.
