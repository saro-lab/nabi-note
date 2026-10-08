# npm quickstart

## Install

```sh
npm install nabi-note
```

NABI NOTE declares zero runtime dependencies. The package declares Node.js 20 or newer and a browser baseline of Chrome/Edge 120, Firefox 120, and Safari 17.

## Minimal editor

```html
<div id="editor" class="nabi">
  <div id="toolbar-chrome" class="nabi-toolbar">
    <div id="toolbar" class="nabi-toolbar-row"></div>
    <div id="context" class="nabi-context"></div>
  </div>
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
const toolbarChrome = document.querySelector<HTMLElement>('#toolbar-chrome')!;

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
  layout: 'compact',
  quick: ['b', 'i', 'tc', 'fs'],
});

// Later:
// toolbar.unmount();
// surface.unmount();
```

Do not set `contenteditable` yourself. `mountSurface()` sets it and adds `.nabi-editing`. Give every active surface, toolbar, context toolbar, and standalone diff its own separate, non-overlapping root. A duplicate root or an active ancestor and descendant overlap throws. After the owning mount unmounts, the other root can be mounted. Mount roots should otherwise start without host-owned child DOM. Matching direct groups from `renderToolbarHtml()` are the package-owned SSR toolbar exception. The host supplies `.nabi`, `.nabi-toolbar`, and `.nabi-content` placement classes.

`layout: 'compact'` is the default: desktop shows all main-toolbar commands, wrapping like fullscreen, while mobile keeps quick tools in a single row and puts the full command set in the Tools palette. The viewport width and `--nabi-mobile-breakpoint` determine this switch, even when the desktop editor itself is narrow. Available object properties appear automatically below the main toolbar. `quick` lists toolbar slot names in priority order for the mobile compact row. Use `layout: 'wrap'` for the explicit wrapping main toolbar. The toolbar and property row stay sticky together at the top within their own editor on desktop and mobile, and scroll out of view with that editor. See `styling.md` for dimensions, layout, and keyboard details.

The browser factory wires its internal `DOMParser` adapter automatically, so `setHtml()`, HTML files, and HTML paste need no parser option.

`undoLimit` defaults to 200 and accepts integers of 1 or greater. `typingMergeMs` defaults to 1000 milliseconds; set it to 0 to keep every insertion as a separate undo step. Invalid values throw during editor creation. `onError` receives isolated command, repair, normalization, listener, and host callback failures.

## Replace the image URL prompt with host UI

Supply `panels` when mounting the toolbar. Its keys are toolbar slot names; `img` replaces the image button's default URL prompt. Omitted slots keep their default behavior.

```ts
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
});
```

Use `mode: 'modal'` for a window over a full-page translucent backdrop, or `mode: 'inline'` for a panel near the desktop tool button that fills the screen on mobile. Both modes provide an empty root with no built-in controls. Mobile behavior uses viewport width and `--nabi-mobile-breakpoint`; an open inline panel closes when that threshold is crossed. Function-only entries (`img: renderer`) retain their previous placement.

`mountMyImagePicker` is supplied by your application, not NABI NOTE. It synchronously renders DOM or a framework component inside the given `root` and returns a cleanup function. Forward `signal` to asynchronous image-list or upload requests, and send the selected image URL to `onSelect`. The renderer itself must not be `async`. For effects that need cleanup if rendering throws midway, use the context's `onDispose()` as soon as each effect starts.

The package manages panel positioning, closing, focus, and teardown. Closing or unmounting aborts the signal and calls cleanup. `insertImage()` (or the generic `run()`) closes the panel and applies one command at the selection captured when it opened; a closed panel or changed document returns `false` without insertion. The image wing must be registered, and its URL policy is unchanged. This API does not transfer files. See `api-reference.md` for `ToolbarPanelContext`, and `io-security.md` for URL and upload boundaries.

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

- `all()` includes all official wings.
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

const contextRoot = document.querySelector<HTMLElement>('#context')!;

const context = mountContextToolbar({
  nabi, registry, root: contextRoot, surface: content, locale: 'en',
});
const hints = mountHints({ toolbar, context, root, surface: content });
const picked = mountPickedMark({ nabi, surface: content });
const sticky = mountSticky({ root: toolbarChrome, surface: content, nabi });
const view = mountViewTools({
  nabi,
  surface: content,
  root,
  container: toolbarChrome,
  locale: 'en',
  onBody: (body) => {
    const viewer = attachViewer(body, { locale: 'en' });
    return () => viewer.unmount();
  },
});
```

The context toolbar follows the compact toolbar mounted for the same `nabi`; do not give it a separate layout option. Keep the toolbar and context roots as siblings. Available object properties appear automatically in the context root below the main toolbar, take up layout space, and wrap on desktop and mobile. Both rows move together inside the shared `toolbarChrome` wrapper. The desktop main toolbar shows all available commands; mobile keeps quick actions in its main row. View controls remain visible, subject to their individual visibility options. There is no Object properties entry button or back-to-tools button. The mobile full palette contains registered wing buttons only, with no duplicate view controls or added undo/redo buttons. Without a compact toolbar, the context and view mounts retain their standalone placement.

`mountHints()` makes double-Shift open the mobile compact palette or focus the visible toolbar on desktop and in fullscreen. Tab/Shift+Tab cycle groups, arrow keys move between icons, Enter/Space activate, and Escape returns to editing. The former letter badges are no longer used. See `styling.md` for wrapping and visual-row navigation rules.

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
