---
title: SSR support
description: Pre-render stored documents on the server and hydrate the editor and toolbar to pick them up instantly in the browser.
---

# SSR (server-side rendering) support

## Rendering stored documents (read-only views)

A screen that only **displays** a document — a comment list or a post view — doesn't need an editor instance. Rendering a document to HTML only requires the registered wing list (`registry`), so there's a server-only render function for exactly that.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Create once at server startup and reuse across requests.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['one comment line'] }]   // a nabi-tree read from the DB

renderStoredHtml(saved, registry)        // '<p>one comment line</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">one comment line</p>'
```

**`nabi-note/ssr` is a lightweight entry point containing only the core rendering logic.** It never references the editing surface (`surface`) or the on-screen UI tools (`ui`), and architecture-level unit tests guarantee that no DOM code leaks into the server bundle. If your environment already loads the full editor bundle, the same functions are also available from the `nabi-note` package.

| Function | Description |
|---|---|
| `renderStoredHtml(json, registry, options?)` | HTML for storage/publishing — the same value as the editor's `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | HTML for initializing the editor — the same value as `getEditorHtml()` (carries `data-key`) |

- **Uses no DOM API at all.** Runs directly in server environments such as Node.js.
- **Returns `null` for anything that isn't a valid nabi-tree.** The validation rules are the same as `setJson()`. Invalid input never throws — it returns `null` and logs the cause via `console.error`.
- **Matches the editor instance's output exactly.** Both go through the same normalize-and-assemble pipeline, so XSS filtering is applied identically.
- The `options` parameter supports `{ allowLocalUrls?: boolean }`, playing the same role as the identical option on `createNabiWith`.

**The same nabi-tree data always produces the same `data-key`.** Because of this, you can pre-render the editor's initial HTML on the server with `renderStoredEditorHtml`, send it down to the client, and mount it with the `hydrate: true` option — the editor activates instantly with no re-render or flicker.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Even if the server and client render results happen to differ, the client automatically falls back to a normal render, so all you need to keep in sync between server and client is the wing list (`registry`).

::: tip This site's own home demo runs on SSR hydration
The home demo's document is **pre-rendered at build time with `renderStoredEditorHtml`** and embedded in the HTML; once the client script loads, `hydrate` wakes the editor up on top of it. That's why the body text is visible immediately, even before the JS loads — there's no layout shift (CLS).
:::

---

## Pre-rendering the toolbar

The toolbar's button layout **never depends on the document's content.** It's generated purely from the registered wing list, the display language (locale), and the group order, so the output is deterministic. Render it once at server startup, cache it, and reuse it across requests.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'en' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Embed this HTML string inside the toolbar container and send it to the client — the browser's `mountToolbar` recognizes the existing markup and **only binds event listeners, without redrawing it.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Set `class="nabi-toolbar-row"` on the container element yourself
When you ship a pre-rendered toolbar row, it must carry `class="nabi-toolbar-row"` from the very first paint. If it's missing, the class gets added at mount time — and the padding that comes with it lands at that moment, causing **the button row to visibly shift.**
:::

- **Safe even if the structure doesn't match.** If the delivered HTML differs from the current wing list, the client redraws it immediately — nothing stays broken.
- **A pre-rendered toolbar starts in its default state** (nothing pressed, nothing hidden). Pressed state (`aria-pressed`) and context-specific visibility depend on the caret position, so they sync automatically once the client mounts.
- **Use this only on screens that contain an editor.** A plain read-only page has no need for a toolbar.

**The preview and fullscreen buttons can be pre-rendered the same way.** Since they're view-tool components rather than wings, render them separately with `renderViewToolsHtml`.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'en' })
// '<span class="nabi-tools">…</span>'
```

::: tip This site's home demo pre-renders its toolbar too
The home demo's toolbar is **pre-rendered at build time with `renderToolbarHtml` and `renderViewToolsHtml`**, and `mountToolbar`/`mountViewTools` recognize that row and only wire up events. That's why you never see dozens of toolbar icons pop in late.
:::

---

## Next

- [{{ t('menu_intro_usage') }}](./usage) — installing via npm and the full editor usage guide
- [{{ t('menu_intro_cdn') }}](./cdn) — using a single `<script>` tag, no build step

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
