# NABI NOTE - Overview

NABI NOTE is a browser WYSIWYG editor written in plain vanilla JS, with **zero runtime
dependencies** (`dependencies`/`peerDependencies` are empty) and **no framework import** - it
mounts onto a plain `HTMLElement` with pure DOM APIs, so it drops into React, Vue, or nothing at
all. A page can host multiple independent instances; there is no global or module-level mutable
state. Formatting is extended only through **wings** - independent modules the core never
special-cases - and documents round-trip through an allow-list rebuild rather than a
sanitize-after-the-fact pass, so **XSS is blocked at the root**.

## Entry points

| Import | Environment | Carries |
|---|---|---|
| `nabi-note` | Browser | Everything: wings, `createNabiWith`, `mountSurface`, `mountToolbar`, UI mounts |
| `nabi-note/ssr` | Node.js / DOM-free | `makeRegistry`, `renderStoredHtml`, `renderStoredEditorHtml` - no `surface`/`ui` code, verified by a boundary test |
| `nabi-note/viewer` | Browser, read-only pages | Opt-in view-side behaviors (table sort, image lightbox) via `nabiViewer(root, { wings })` - nothing here writes to the document |
| `nabi-note/nabi.css` | Any | The bundled stylesheet (core + all built-in wings), for hosts that skip runtime style injection |

## The four-layer runtime model

What a host builds, from data to DOM. Layers below are unaware of layers above.

| Layer | What it is | Lifetime / sharing |
|---|---|---|
| **Registry** | The output of `makeRegistry(wings)` - env, builders, commands, claim rules, attaches for the wings you registered | Pure, read-only, no mutable state. **Share one registry across many editors** (comment threads, etc.) instead of rebuilding it per instance |
| **Stylesheets** | `collectSheets(registry)` + `injectSheets(document, sheets)`, or a static `<link>` to `nabi-note/nabi.css` | Deduplicated by content hash - mounting several editors never doubles up a `<style>` tag |
| **Nabi state engine** | `createNabi`'s closure - the document tree, caret, undo history | One per open document. Reusable only by swapping documents into it with `setJson()`, not by sharing the instance |
| **Surface & chrome mounts** | `mountSurface`, `mountToolbar`, `mountContextToolbar`, `mountViewTools`, `mountUpload`, `mountLocalHistory`, and more | Bound to the `HTMLElement`s you pass in; `destroy()` unwinds every listener (all registered through one `AbortSignal`) |

The registry and stylesheet layers are cheap and shareable; only the state engine and DOM mounts
are per-document. Measured (Node, all built-in wings, a comment-sized document, 200-run
average): `makeRegistry` 0.038ms, a full `createNabiWith` 0.036ms, a stored-JSON-to-HTML render
0.013ms - building a fresh instance per document is not the expensive part. The DOM-bound mount
layer is. See `llms/ssr.md` for rendering documents with no editor mounted at all, and
`llms/custom-wing.md`/`llms/wings.md` for what a wing is.

## Document model

- Documents are stored as **NABI TREE**, a JSON array of blocks - there is no wrapping root
  node. `getJson()`/`setJson()` move it in and out.
- HTML has four names depending on where it sits, and the codebase does not use them
  interchangeably:

| Name | What it is | Carries |
|---|---|---|
| `sourceHtml` | Untrusted HTML arriving from outside (the `html` option, `setHtml()`, paste) | Anything |
| `soul` | The normalized HTML string after the allow-list filter - the document's one source of truth | Only `data-nabi-*` attributes, no `style` |
| `flutter` | The live `contenteditable` DOM commands actually edit | `soul` plus screen-only markup (`contenteditable="false"`, selection markers, upload placeholders) |
| `outputHtml` | What leaves the editor (`getHtml()`, `onChange`) | `data-nabi-*` translated to inline `style` where meaning would otherwise be lost without the stylesheet |

```
sourceHtml -(fromSourceHtml -> filterToSoul)-> soul -> flutter
flutter -(filterToSoul -> toOutputHtml)-> soul -> outputHtml
```

`getHtml()` always re-filters the live DOM; it never trusts a cached string, and `soul` itself is
never persisted. `outputHtml` is safe as freshly produced, but a value pulled back out of storage
still needs host-side sanitizing before it is rendered - there is no guarantee a stored value is
still what the editor produced (a database row can be edited directly). The library does not ship
a sanitizer itself; re-sanitize on the host side right before storing, using an allow-list
sanitizer of your choice.

## Non-negotiable invariants

1. **Zero runtime dependencies** - no `dependencies`, no `peerDependencies`.
2. **Framework-agnostic** - pure DOM API only, no React/Vue import in the core.
3. **No `document.execCommand`** - editing goes through `beforeinput` interception plus
   `Range`/`Selection`, because `execCommand` is deprecated and inconsistent across browsers.
4. **All formatting is a wing** - the core's only built-in markup is the block slot and `<br>`.
5. **Editing has one gateway** - every mutation passes through `#afterEdit()`
   (`context.commit()`/`editor.commit()` from a wing), which restores invariants, snapshots undo,
   and fires `onChange`. There is no way to change the document that skips it.

## Extending

New formatting is added by registering a **wing** - see `llms/wings.md` for the built-in set and
`llms/custom-wing.md` for the contract to build your own. Full function signatures live in
`llms/api-reference.md`.
