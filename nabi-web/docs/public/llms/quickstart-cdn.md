# Quickstart - CDN

No build step. Two tags:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Pin a version instead of `@latest` once you rely on this in production - jsDelivr caches the
unpinned path for a long time, which can mix a stale bundle with a newer stylesheet or vice
versa.

Everything the package exports hangs off one global, `NabiNote` (abbreviated `N` below). The
stylesheet is not injected automatically - forgetting the `<link>` leaves the editor unstyled.

## Skeleton

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div class="nabi-toolbar-row">
      <span id="tools"></span>
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

Element `id`s are free to rename - mounts take the element itself, not a name. The four classes
(`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) are the stylesheet's hooks and should
stay as-is. Skip `<span id="tools">` and the `mountViewTools` call below if you do not want
preview/fullscreen - `mountViewTools` builds its own floating box regardless of which container
you hand it, so passing the toolbar's own container is fine.

## Picking wings

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `.all()` starts from every official wing. **Not calling it means an empty set** - only what
  `.use()` adds gets mounted.
- `.use('name', options?)` adds one. Calling it again on an already-included wing just layers
  options on top (as above with `tf`). If a wing needs another one to stand on (`upload` needs
  either an image or a link wing present), that dependency is pulled in quietly.
- `.drop('name')` removes one. Dropping a wing something else depends on throws immediately and
  names what else must be dropped with it.
- Names are the short key stored in documents - `b` (bold), `tf` (typeface), `upload`, etc. List
  them all with `console.log(N.wingNames())`.
- **A bad call throws right there.** Typos, unknown option keys, and out-of-list values all throw
  with a fix in the message - `use('bod')` answers "did you mean 'b'?". Nothing is silently
  ignored.

`createNabiWith` accepts the builder directly - no need to call `.build()`. Only code that
specifically needs an array calls it:

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

A hand-built wing is added as an object: `N.wings().all().use(customWing)`. Its `w` id must start
with `ex` (e.g. `exNote`) - a collision with an official name would make an already-saved
document read differently later. See `llms/custom-wing.md`.

## Assembling

```html
<script>
  var wings = N.wings().all().drop('upload')
  var app = document.getElementById('app')
  var editor = document.getElementById('editor')

  var built = N.createNabiWith(wings)
  var nabi = built.nabi
  var registry = built.registry

  N.mountSurface({ nabi: nabi, registry: registry, root: editor })

  var shared = { nabi: nabi, registry: registry, surface: editor, locale: 'en' }
  var toolbar = N.mountToolbar(Object.assign({ root: document.getElementById('toolbar') }, shared))
  N.mountContextToolbar(Object.assign({ root: document.getElementById('context') }, shared))
  N.mountViewTools({
    nabi: nabi,
    surface: editor,
    root: app,
    container: document.getElementById('toolbar'),
    locale: 'en',
  })

  // nabi.onChange(function () { user_callback(nabi.getHtml()) })
</script>
```

The full mount list, locale/RTL behavior, reading/writing documents, toast, and the `ask` dialog
hooks are identical to the npm path - see `llms/quickstart-npm.md`. Only the module syntax
differs: every `import { x } from 'nabi-note'` becomes `N.x`.

## Reading side - showing stored content with no editor

A page that only displays saved content does not need an editor. Loading the same stylesheet and
placing the value inside `.nabi-content` reproduces exactly what the editor showed:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- the value saved from getHtml() -->
</div>
```

If the content was saved as NABI TREE (JSON) rather than HTML, render it with no editor at all -
this only needs the saved tree and the registered wing list:

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['One comment line'] }]  // a NABI TREE received from the server
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

`renderStoredHtml` returns `null` for anything that is not a valid NABI TREE, and otherwise
produces output byte-identical to what the editor's own `getHtml()` would produce - the same XSS
filtering applies, so a reading-only page is never less safe than an editing one. This door uses
no DOM, so it runs on a server (Node.js) too - see `llms/ssr.md` for rendering the whole document
(and the editor's own markup) ahead of time.

## Extracting values

| | |
|---|---|
| `nabi.getHtml()` | Output HTML for storage/publishing |
| `nabi.getJson()` | NABI TREE (JSON) |
| `nabi.setHtml(html)` / `nabi.setJson(json)` | Load a document back in |
| `nabi.onChange(fn)` | Fires on every change |
| `N.renderStoredHtml(json, registry)` | Render a stored tree to HTML with no editor (see above) |

## Addresses

Pin a version in the URL; unpkg serves the same file.

| | URL |
|---|---|
| Bundle (latest) | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| Bundle (unpkg) | `https://unpkg.com/nabi-note` |
| Stylesheet (latest) | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |

There is no separately-published CDN artifact - the bundle ships inside the same npm package.

## See also

- `llms/quickstart-npm.md` - the same assembly through a bundler, plus the full mount/API list
- `llms/wings.md` - every built-in wing
- `llms/ssr.md` - rendering documents with no editor mounted (also covers hydrating a
  server-rendered editor)
- `llms/styling.md` - CSS variables and the two ways to load the stylesheet
