# CDN quickstart

The browser build exposes the root API as a single global. Pin a package version in production.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@1.0.0/dist/nabi.css">

<div id="editor" class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/nabi-note@1.0.0/dist/browser/nabi-note.min.js"></script>
<script>
  const N = window.NabiNote;
  const content = document.querySelector('#content');
  const toolbarRoot = document.querySelector('#toolbar');

  const built = N.createNabiWith(N.wings().allBasic(), { locale: 'en' });

  const surface = N.mountSurface({
    nabi: built.nabi,
    registry: built.registry,
    root: content,
    locale: 'en'
  });

  const toolbar = N.mountToolbar({
    nabi: built.nabi,
    registry: built.registry,
    root: toolbarRoot,
    surface: content,
    locale: 'en'
  });
</script>
```

The global name is `NabiNote`. The CDN bundle contains the root `nabi-note` entry only. It does not create separate globals for `/ssr`, `/viewer`, or `/diff`.

## Wing picker

```js
const chosen = N.wings()
  .all()
  .drop('upload')
  .drop('save')
  .drop('open')
  .use('fs', { values: ['sm', 'lg'] });

const built = N.createNabiWith(chosen);
```

The picker throws descriptive runtime errors because CDN JavaScript has no TypeScript check. `N.wingNames()` returns all official names.

## Published HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@1.0.0/dist/nabi.css">
<article id="article" class="nabi-content"></article>
<script>
  article.innerHTML = built.nabi.getHtml();
</script>
```

The root bundle does not include `attachViewer`. Use an ESM CDN import for the viewer subpath when table sorting or code paint is required:

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@1.0.0/dist/viewer/index.js';
  const viewer = attachViewer(document.querySelector('#article'), { locale: 'en' });
  // Call viewer.refresh() after replacing article HTML.
  // Call viewer.unmount() before removing the page.
</script>
```

When the CDN does not honor package export maps, use the concrete `dist` paths shown above. Check the selected CDN's ESM behavior before shipping.

## Limits

- CDN use does not change the HTML trust boundary. Do not assign arbitrary HTML directly to the editor root.
- Do not edit the live surface DOM during composition.
- Do not store `getEditorHtml()`.
- `all()` includes host-wired tools. Mount their integrations or choose `allBasic()`.
- Pin the exact package version; unpinned URLs can change application behavior.

For complete assembly and IO examples, read `quickstart-npm.md`.

## Icon assets in 1.1.0 and later builds

For 1.1.0 and later builds, keep the same package version for JS, CSS, and `dist/icons/`. Manual hosting must copy the icons directory beside `nabi.css`; the local CDN demo already includes it. Keep `dist/browser/` relative to `dist/icons/` when using runtime CSS injection with the IIFE. The pinned 1.0.0 examples above describe the earlier baseline; icon themes and individual `showPreview`/`showFullscreen` options require 1.1.0 or later. See `icons.md`.

## Toolbar configuration in 1.3.1 builds

The pinned 1.0.0 examples above describe the earlier published baseline. To use the 1.3.1 toolbar contract, load a matching 1.3.1 JavaScript/CSS build from your own build or an available package version. This document does not claim that 1.3.1 has been published to a CDN.

```js
const toolbar = N.mountToolbar({
  nabi: built.nabi,
  registry: built.registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
  layout: 'compact',
  quick: ['b', 'i', 'tc', 'fs']
});
```

Compact is the default. On desktop it shows all main-toolbar commands and wraps like fullscreen, even inside a narrow editor. Mobile keeps a single row; `quick` contains its toolbar slot names in priority order. The viewport width and `--nabi-mobile-breakpoint` determine the switch. Commands that do not fit remain in the mobile Tools palette, which shows available icons together in their original wing groups without category tabs, group borders, or a title/close header. Desktop and mobile toolbar buttons use `2rem` with `.875rem` icons. Use `layout: 'wrap'` for the explicit wrapping main toolbar. A context toolbar mounted on its own sibling root for the same `nabi` automatically shows available object properties below the main toolbar; do not nest its mount root inside `toolbarRoot`. The property row takes up layout space, wraps on desktop and mobile, and moves with the main row inside their shared sticky wrapper. Connected preview/fullscreen controls remain in the main toolbar. There is no Object properties entry button or back-to-tools button. The full palette contains registered wing buttons only, without duplicate view controls or added undo/redo buttons.

With `N.mountHints({ toolbar, root: document.querySelector('#editor'), surface: content })`, double-Shift opens the mobile compact palette or focuses the visible toolbar on desktop and in fullscreen. Tab/Shift+Tab cycle groups, arrow keys move between icons, Enter/Space activate, and Escape returns to editing. Letter badges are no longer used; see `styling.md` for the complete navigation rules.

The toolbar stays sticky at the top within its own editor on desktop and mobile, and scrolls out of view with that editor. Mobile selection/menu panels open from the toolbar within the available viewport space, while text-input prompts replace the toolbar row. See `styling.md` for the breakpoint, viewport, and physical-device IME validation limits.

## Custom image panels in 1.3.1 builds

When mounting the toolbar above, add `panels` to its options:

```js
panels: {
  img: {
    mode: 'inline',
    render: ({ root, signal, close, insertImage }) =>
      mountMyImagePicker(root, {
        signal,
        onClose: close,
        onSelect: (url) => insertImage(url, 'pointer')
      })
  }
}
```

`mountMyImagePicker` is your own synchronous renderer; it fills the empty `root` with HTML or framework UI and returns a cleanup function. Use `modal` for a window over a full-page translucent backdrop, or `inline` for a panel near the tool button on desktop that fills the screen on mobile. Viewport width and `--nabi-mobile-breakpoint` determine mobile behavior. No title, URL input, or buttons are generated. Function-only entries keep their previous display behavior.

Connect custom controls to `close()` and `insertImage(url)`. Insertion closes the panel and uses the opening selection; a closed panel or changed document returns `false`. Use `signal` for asynchronous requests started inside the renderer, and do not make `render` itself async. See `quickstart-npm.md` and `api-reference.md` for cleanup and the full callback contract.

## Live language changes

Use `var locale = NabiNote.createLocale('en')` and pass that object as `locale`
to the editor and all mounts that should follow it. Call `locale.setLocale('ko')`
from the language selector. Keep the existing editor and surface mounted; do not
reload their document. See `quickstart-npm.md` for the state-preservation contract.
