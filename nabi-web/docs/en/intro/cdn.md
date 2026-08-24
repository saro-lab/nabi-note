---
title: Using it from a CDN
description: How to use NABI NOTE directly with HTML tags, with no build tooling at all.
---

# Using it from a CDN

<CdnDemo />

---

## How it's put together

The demo above runs from a single HTML file, with no bundler or build step involved.

### Two tags to wire it up

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Everything the package exports hangs off the global `NabiNote` (or its short alias `N`). **You have to link the stylesheet yourself** — the mount functions never inject CSS, so drop the `<link>` tag and the editor shows up with no styling at all.

### HTML structure

```html
<div id="app" class="nabi">                    <!-- root: color theme, corner radius, font -->
  <div id="chrome" class="nabi-toolbar">        <!-- fixed header wrapping the toolbar and context bar -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- preview / fullscreen buttons (right-aligned) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- context bar, appears dynamically at the caret -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

The `id` on each element is up to you — a mount function takes the actual DOM element, not an id string. The four class names (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) are required hooks the stylesheet relies on, so leave them as they are. If you don't need preview/fullscreen, drop the `<span id="tools">` element and the `mountViewTools` call together — `mountViewTools` builds its own button area inside whatever container you hand it.

### Picking wings

You assemble wings with a builder chain. The example above starts from the 26 basic wings — the ones that work with no host integration — adds save/open on top, and narrows the typeface picker to two choices.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` turns on every official wing. Skip it and none of the default wings load — only what you name with `use()` gets registered.
- `allBasic()` picks the **26 official wings that work with no extra host integration.** Upload, save, and open are left out because they need something the host has to supply — a server endpoint or a file store — which is why the example above adds them back explicitly with `use()`.
- `use('name', options?)` adds a wing. Call it again on a wing that's already registered and it just updates the options (as `use('tf', { values: [...] })` does above). If a wing depends on another (upload needs either the image or the link wing), that dependency is pulled in automatically.
- `drop('name')` removes a wing from the list. Try to drop one that another wing depends on and it throws, naming the wings you'd have to drop along with it.
- A wing's name is the short, unique key (`w`) stored in the nabi-tree — `b` (bold), `tf` (typeface), `upload`, and so on. See the full list with `console.log(N.wingNames())`.
- **A bad name or option throws right away.** A typo, an unsupported option key, a value outside the valid range — any of these raise an error that tells you how to fix it.

`createNabiWith` accepts a builder instance directly, so there's no need to call `build()` yourself. You can also hand it wings as a plain array:

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

A custom wing you wrote yourself is passed in as an object (`N.wings().all().use(customWing)`). Give its `w` identifier an `ex` prefix (e.g. `exNote`) to avoid colliding with an official wing's identifier. See [{{ t('menu_wing_custom') }}](../wing/custom) for how to build one.

Full specs for every wing live under [{{ t('menu_wing') }}](../wing/inline/bold).

### Dialogs and notifications

The example above wires the `ask` option to the browser's built-in `alert` and `confirm` — so a prompt like "You have unsaved changes. Continue anyway?" shows up as a native browser popup.

Skip `ask` and confirmation dialogs default to cancel (`false`), while plain notices fall back to the core's built-in toast UI, shown under the toolbar. See [{{ t('menu_intro_usage') }}](./usage) for details.

`ask` also takes a `choose` handler for picking among several options. That said, **the format picker shown on clipboard paste works out of the box, with no setup at all** — the core wires its own popup UI to it automatically once `mountToolbar` is mounted, so any page using the toolbar gets the picker for free. Only pass `ask.choose` if you want to swap in a modal of your own.

### I/O methods

| Method | Description |
|---|---|
| `nabi.getHtml()` | returns HTML for saving/publishing |
| `nabi.getJson()` | returns the nabi-tree (JSON) data |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | replaces the document with new data |
| `nabi.onChange(fn)` | registers a listener for document changes |
| `N.renderStoredHtml(json, registry)` | turns a nabi-tree into HTML with no editor involved (see [Read-only viewer](#read-only-viewer-viewer) below) |

---

## CDN addresses

To pin a specific version, include the version number in the CDN URL. Both jsDelivr and unpkg are supported.

An unversioned URL (`/npm/nabi-note`) can end up with the script and the CSS out of sync due to CDN caching, so pin a version or use the `@latest` tag explicitly.

| Type | Address |
|---|---|
| **Bundle (latest)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Bundle (pinned)** | <code>{{ CDN_BUNDLE }}</code> |
| **Stylesheet (latest)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Stylesheet (pinned)** | <code>{{ CDN_SHEET }}</code> |
| **Bundle (unpkg)** | `https://unpkg.com/nabi-note` |

The CDN bundle is identical to the `dist/` build shipped inside the npm package.

---

## Read-only viewer (Viewer)

A page that only **displays** a saved HTML document doesn't need an editor instance at all. Link the same stylesheet and render the HTML inside a `.nabi-content` container, and it looks exactly as it did in the editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- HTML string saved via nabi.getHtml() -->
</div>
```

If you saved the document as a **nabi-tree (JSON)** instead, call the render function to turn it into HTML with plain JavaScript — no editor required. It takes the saved JSON data and the registered wing list (`registry`) as arguments.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['a line of comment'] }]   // nabi-tree loaded from the server
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Anything that isn't a valid nabi-tree comes back as `null`, and what passes is identical, character for character, to what an editor instance's `getHtml()` produces — the same XSS filtering applies. Since it touches no DOM, it runs the same way on a server (Node.js, etc.) too (see [{{ t('menu_intro_ssr') }}](./ssr)).

In a server environment that pulls in the npm package, use the lightweight **`nabi-note/ssr`** module instead of the global bundle — it carries only the rendering logic, so the editing surface and UI code never end up in the server bundle.

The stylesheet **carries the styles for every wing.**

Basic formatting comes entirely from CSS, but **sorting tables and highlighting code syntax both need client-side JavaScript.** Wire up the lightweight viewer runtime if you want column-header sorting or tokenized, colorized code:

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'en' })
</script>
```

- The document still displays fine without the viewer wired in — you only lose table sorting and code coloring.
- Table sorting only kicks in for a table where sorting was turned on in the editor (marked with a `data-nabi-sortable` attribute).
- Code highlighting ships with a built-in tokenizer, so it needs no external dependency. To use an outside highlighter such as Shiki, pass it in through the `{ locale: 'en', highlight }` option.
- The global `NabiNote` bundle carries no viewer entry point — it ships on its own as `nabi-note/viewer` to keep read-only pages lean.

---

## Next up

- [{{ t('menu_intro_usage') }}](./usage) — installing via npm and the full editor API
- [{{ t('menu_wing_custom') }}](../wing/custom) — building a custom formatting wing of your own

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// the version number is read dynamically from the package version
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
