---
title: SSR support
description: Pre-render stored content on the server, and hydrate the editor and toolbar to pick it up.
---

# SSR support

## Rendering just the stored value — without standing an editor up

A spot that only **shows** something, such as a comment list, needs no editor. Drawing a document
takes only the list of registered wings (`registry`), so there is a door that takes just that.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Once, when the server stands up — however many stored values there are, they share this one
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['one comment line'] }]   // a nabi-tree read from the DB

renderStoredHtml(saved, registry)        // '<p>one comment line</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">one comment line</p>'
```

**`nabi-note/ssr` is the entry point carrying only what rendering needs.** It touches not one file
of the editing surface (`surface`) or the screen tools (`ui`) — a net enforces this — so no DOM code
slips into a server bundle. The same gate lives in `nabi-note` too, so a page that already loads the
editor can just use that one instead.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | the HTML you save and publish — the same value as `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | editor HTML — the same value as `getEditorHtml()` (it carries `data-key`) |

- **Neither touches the DOM** — both run as they are on a server.
- **Anything that is not a nabi-tree answers `null`.** The rejection rule is the same as
  `setJson()` (the whole document has to be an array). Neither throws — even a value that throws
  mid-read turns into `null`, reported through `console.error`.
- **Not one character differs from what the editor itself puts out.** Both pass through the same
  steps (normalize → assemble), so wherever XSS gets filtered out is the same place too — nothing
  gets a lighter wash just because it is only being shown.
- `options` is one thing, `{ allowLocalUrls }` — the same meaning as that option on
  `createNabiWith`.

**The same stored value always gets the same `data-key`.** Which is why, when the server sends an
editor down pre-rendered with `renderStoredEditorHtml` and the browser picks it up with `hydrate`,
the screen is not redrawn.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

A mismatch just redraws on the spot, so all that has to match is the wing list on the server and on
the client.

::: tip This site's own home page is that very sample
The home demo's document is **pre-rendered at build time with `renderStoredEditorHtml`** and
planted right in the page, and the editor wakes up on top of it through `hydrate`. So the text is
already readable before the editor's code even arrives — there is no stretch where a blank spot
suddenly fills in.
:::

---

## The toolbar can be pre-rendered too

The button row **never looks at the document.** It only looks at the registered wing list, the
language and the group order, so what comes out is a **constant** — call it once when the server
stands up and keep using that text. No need to call it again on every request.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'en' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Send this text straight into the toolbar's box, and in the browser `mountToolbar` draws it with
**that same function** — if the same row is already standing, it **does not redraw it, only wires
it up.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Write `class="nabi-toolbar-row"` on the box yourself
When you send a pre-rendered row down, this class has to be there **from the very first paint**.
The core attaches it itself at mount time if it is missing, and then the left-right padding lands
at that moment and **the button row shifts sideways once.** Write it in ahead of time and the core
leaves it alone (it only ever removes what it itself attached).

```html
<div class="nabi-toolbar-row">a pre-rendered row</div>
```
:::

- **A mismatch never breaks anything** — if the row standing there differs from the current wing
  list, it is redrawn on the spot. All that is lost is the pre-rendered value; the screen is always
  correct.
- **A pre-rendered row is in the state "nothing pressed, nothing hidden."** Pressed state
  (`aria-pressed`) and hiding are decided by the caret, which the server does not know. In a setup
  where buttons hide depending on the caret, a few may vanish right after mount and the row folds
  again.
- **Only put this where you are standing an editor up.** A read-only page has no toolbar, so there
  is no reason for it to receive this text.

**The preview and full-screen buttons take the same road.** The two of them are not wings but parts
of the overlay, so they are not in the toolbar text above — render them separately and put them in
the box `mountViewTools` will stand up.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'en' })
// '<span class="nabi-tools">…</span>'
```

::: tip This site's own home page is that very sample
The home demo's toolbar is **pre-rendered at build time with `renderToolbarHtml` and
`renderViewToolsHtml`** and planted in the page, and `mountToolbar`/`mountViewTools` recognize that
row and only wire it up. So there is no stretch where thirty-five icons pop in late.
:::

---

## Next

- [{{ t('menu_intro_usage') }}](./usage) — the npm way, the full assembly, input and output
- [{{ t('menu_intro_cdn') }}](./cdn) — one `<script>`, no build step

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
