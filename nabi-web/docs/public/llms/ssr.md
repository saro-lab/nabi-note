# SSR and hydration

## The `nabi-note/ssr` entry point

Everything needed to turn a stored NABI TREE into HTML on a server, and nothing else - no
caret, no toolbar, no floating boxes. A boundary test enforces that this entry never imports
`surface` or `ui` code, so a server bundle can never accidentally carry DOM-only code. Measured
against the main entry (2026-08-19): 112 files / 18,453 lines vs. **74 files / 11,750 lines** -
the 38 dropped files are all `ui` (24) and `surface` (13), code a server never calls.

It works in the browser too - a read-only page (a comment list, say) that renders stored content
without mounting an editor uses the exact same door.

```ts
import {
  makeRegistry, renderStoredHtml, renderStoredEditorHtml,
  renderToolbarHtml, renderViewToolsHtml, toolbarSlots, TOOLBAR_GROUPS,
  defaultWings, extraWings, wingNames, wings,
  renderHtml, renderEditorHtml, safeUrl,
  isElement, isText, BR, P,
  LOCALES, RTL_LOCALES, localeDirection, localeOf, translate,
} from 'nabi-note/ssr'
```

Not here: `createNabiWith`, `mountSurface`, any `mount*`, `openPreview` - assembling an actual
editor is screen work and lives in the main `nabi-note` entry.

## Rendering a stored document with no editor

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Once, at server startup - shared across however many stored documents you render
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['One comment line'] }]  // a NABI TREE read from a database

renderStoredHtml(saved, registry)        // '<p>One comment line</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">One comment line</p>'
```

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | The HTML you store/publish - identical to `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | Editor HTML - identical to `getEditorHtml()` (carries `data-key`) |

- **Neither touches the DOM** - both run as-is on a server.
- **Not a NABI TREE means `null`** - the same rejection rule as `setJson()` (the whole document
  must be an array of blocks). Neither throws - a value that throws mid-read also answers `null`,
  reported through `console.error`.
- **Byte-identical to what an editor produces** - both pass through the same normalize-then-build
  steps as `getHtml()`/`getEditorHtml()`, so XSS filtering is exactly as strict on the reading
  side as on the editing side.
- `options` is just `{ allowLocalUrls }`, the same meaning as `createNabiWith`'s option of the
  same name.

## Hydrating a server-rendered editor

The same stored document always gets the same `data-key`s, because they come from a deterministic
id assignment. That means a server can pre-render the editor's own markup and the browser can
adopt it instead of redrawing:

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

A mismatch redraws just that spot, so the only requirement is that server and client use the
same wing list. This is exactly what this project's own homepage does: the demo document is
rendered with `renderStoredEditorHtml` at build time and embedded in the page; the editor wakes
up on top of it with `hydrate`, so text is already legible before the editor's JavaScript has
even arrived.

## Pre-rendering the toolbar

The button row does not look at the document - only at the registered wings, the locale, and a
fixed group order - so its output is a constant. Render it once at server startup and reuse the
string for every request:

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)
const toolbarHtml = renderToolbarHtml({ registry, locale: 'en' })
// '<div class="nabi-group" data-group="font">...</div>'
```

Send that string inside the toolbar container. In the browser, `mountToolbar` calls **the same
function** - if a matching row is already standing, it only wires up behavior instead of
redrawing:

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

Rules to keep this safe:

- **Put `class="nabi-toolbar-row"` on the container in the pre-rendered markup itself.** Without
  it, the core adds the class on mount, and the margin that arrives with it shifts the button row
  sideways once. Pre-declare it and the core leaves it alone (it only ever removes what it itself
  added).
- **Never breaks** - if the standing row does not match the current wing list, it is redrawn on
  the spot. The only cost is losing the pre-rendered value; the screen is always correct.
- **The pre-rendered row is in a neutral state** - nothing pressed, nothing hidden. Pressed state
  (`aria-pressed`) and caret-driven hiding are decided by the caret, which the server does not
  know about. If your layout hides buttons based on caret position, expect a few to disappear and
  the row to reflow right after mount.
- **Only send this on pages that mount an editor.** A read-only page has no toolbar and no reason
  to receive this markup.

The preview/fullscreen pair works the same way - those two buttons are chrome, not wings, so they
are not part of the toolbar markup above and render separately into whatever container
`mountViewTools` will use:

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'en' })
// '<span class="nabi-tools">...</span>'
```

## Lower-level: rendering an already-parsed tree

`renderHtml`/`renderEditorHtml` sit one step below `renderStoredHtml`/`renderStoredEditorHtml` -
for code that already holds the internal tree (tests, custom assembly) rather than raw external
JSON. Prefer the `renderStored*` pair for anything that receives untrusted/external input, since
that pair also normalizes and validates it.

## See also

- `llms/overview.md` - the four-layer runtime model and why the registry/stylesheet layers are
  cheap to share across many rendered documents
- `llms/quickstart-npm.md` - `mountSurface({ hydrate: true })` in the context of a full assembly
- `llms/quickstart-cdn.md` - the same `renderStoredHtml` call under a CDN script tag
- `llms/styling.md` - loading the stylesheet on a server-rendered page (must be the file/import
  path, not runtime injection, or the page flashes unstyled)
