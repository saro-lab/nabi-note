# CDN quickstart

The browser build exposes the root API as a single global. Pin a package version in production.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@0.8.5/dist/nabi.css">

<div id="editor" class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/nabi-note@0.8.5/dist/browser/nabi-note.min.js"></script>
<script>
  const N = window.NabiNote;
  const content = document.querySelector('#content');
  const toolbarRoot = document.querySelector('#toolbar');

  const built = N.createNabiWith(N.wings().allBasic(), {
    parseHtml: N.parseNodes,
    locale: 'en'
  });

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

const built = N.createNabiWith(chosen, { parseHtml: N.parseNodes });
```

The picker throws descriptive runtime errors because CDN JavaScript has no TypeScript check. `N.wingNames()` returns all official names.

## Published HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@0.8.5/dist/nabi.css">
<article id="article" class="nabi-content"></article>
<script>
  article.innerHTML = built.nabi.getHtml();
</script>
```

The root bundle does not include `attachViewer`. Use an ESM CDN import for the viewer subpath when table sorting or code paint is required:

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@0.8.5/dist/viewer/index.js';
  attachViewer(document.querySelector('#article'), { locale: 'en' });
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
