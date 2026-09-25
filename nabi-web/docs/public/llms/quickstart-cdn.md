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

## 1.1.0 icon assets

For 1.1.0 builds, keep the same package version for JS, CSS, and `dist/icons/`. Manual hosting must copy the icons directory beside `nabi.css`; the local CDN demo already includes it. Keep `dist/browser/` relative to `dist/icons/` when using runtime CSS injection with the IIFE. The pinned 1.0.0 examples above describe the published baseline; use your 1.1.0 build for the new icon themes and individual `showPreview`/`showFullscreen` options. See `icons.md`.

## Live language changes

Use `var locale = NabiNote.createLocale('en')` and pass that object as `locale`
to the editor and all mounts that should follow it. Call `locale.setLocale('ko')`
from the language selector. Keep the existing editor and surface mounted; do not
reload their document. See `quickstart-npm.md` for the state-preservation contract.
