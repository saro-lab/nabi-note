---
title: Using it from a CDN
description: CDN example
---

# Using it from a CDN

<CdnDemo />

---

## What did you just do

The file above runs without you reading any of this. Look here only when you want to change it.

### Two tags are the whole install

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Everything** the package exports hangs on the one global `NabiNote`. **You hang the sheet
yourself** — the mounts inject no CSS, so leave the `<link>` out and the editor stands there bare.

### The skeleton

```html
<div id="app" class="nabi">                    <!-- the root where colors, corners and fonts live -->
  <div id="chrome" class="nabi-toolbar">        <!-- the toolbar and the context row stick as one lump -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- preview and full screen (far right) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- fills itself in according to what the caret points at -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

The `id`s can be any name you like — what you hand a mount is the **element**, not the name. Leave
the four classes (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) as they are; they are
the handles the sheet grabs. If you are not going to use preview and full screen, delete the
`<span id="tools">` and the `mountViewTools` line together. The container can be handed over as is
either way — `mountViewTools` raises its own box that floats to the far right, so handing it the
toolbar itself does not throw the button row out of shape.

### Picking wings

Picking wings is one builder line. The file above starts from the twenty-nine standard wings and
takes out upload, then narrows the typeface down to two.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` starts you off from every official wing. **Skip it and you start with nothing** — only
  what `use()` adds gets loaded.
- `use('name', options?)` adds one. Call it on a wing already in and it just stacks the options —
  the `use('tf', { values: [...] })` above is that shape. If the wing needs another wing to stand
  on (upload needs either image or link), that one is quietly pulled in too.
- `drop('name')` removes one already in. Try to drop a wing that another one stands on and it
  throws right there, naming what to drop along with it.
- The name is the short key that gets written into the stored value — `b` (bold), `tf` (typeface),
  `upload`, and so on. See the full list with `console.log(N.wingNames())`.
- **A wrong call throws on the line that made it.** A misspelled name, an option key it does not
  know, a value outside the enum — all of them, and the thrown message carries the fix —
  `use('bod')` answers "did you mean 'b' (bold)?" There is no spot where a mistake is quietly
  ignored.

`createNabiWith` takes a builder as it is, so there is no need to call `build()` — that only
matters where an array is required. When you are hand-picking just a few, an array is still the
answer.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

A wing you built yourself goes in as an object — like `N.wings().all().use(customWing)`. Its `w`
has to start with `ex` (`exNote`) — if it later collides with an official name in the stored
value, an already-saved document would read as something else. How to build one is at
[{{ t('menu_wing_custom') }}](../wing/custom).

The wings one by one are in [{{ t('menu_wing') }}](../wing/inline/bold).

### Asking and notifying

The file above wires `ask` to the browser's `alert`/`confirm` — a question like "There is unsaved
work. Open anyway?" goes to that box. Skip it and the answer to any question is "no", and a
one-liner that needs no answer surfaces in the toast tray the core carries under the toolbar — an
upload error, say, has nowhere else it needs wiring. More detail is at
[{{ t('menu_intro_usage') }}](./usage).

### Getting the value out

| | |
|---|---|
| `nabi.getHtml()` | the HTML you save and publish |
| `nabi.getJson()` | the nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | putting it back in |
| `nabi.onChange(fn)` | every time the value changes |
| `N.renderStoredHtml(json, registry)` | a stored value to HTML with no editor stood up (see [The reading side](#the-reading-side) below) |

---

## Addresses

To pin the version, hang the version number on the address. unpkg gives you the same file.

**Do not use the address with no version on it (`/npm/nabi-note`)** — jsDelivr caches that spot for
a long time, and the bundle and the sheet can end up mixed from two different versions.

| | Address |
|---|---|
| **bundle (latest)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **bundle (pinned)** | <code>{{ CDN_BUNDLE }}</code> |
| **sheet (latest)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **sheet (pinned)** | <code>{{ CDN_SHEET }}</code> |
| **bundle** (unpkg) | `https://unpkg.com/nabi-note` |

The bundle ships inside the npm release itself, so **the CDN is not a separate release.**

---

## The reading side

A page that only **shows** saved HTML stands no editor up. Hang the same sheet, put the value
inside a `.nabi-content`, and it comes out exactly as it looked in the editor.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- the value you stored with getHtml() -->
</div>
```

If what you stored is **not HTML but a nabi-tree (JSON)**, it renders right there with no editor
stood up. What it takes is the stored value and the registered wing list, both.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['One line of comment'] }]   // a nabi-tree received from the server
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Anything that is not a nabi-tree gets `null` back, and a value that passes does not differ from
the editor's own `getHtml()` by a single character — the same spot filters XSS too. This door
touches no DOM, so it runs the same way on a server (Node.js), which opens the same door onto
**rendering HTML on the server ahead of time and sending it down** (see
[{{ t('menu_intro_ssr') }}](./ssr#rendering-just-the-stored-value-without-standing-an-editor-up)).

A server pulling the package through npm uses **`nabi-note/ssr`**, not the global bundle — it is
the entry point that carries only what rendering needs, so it loads no editing surface and no
screen tools.

The one sheet file holds **the CSS of every wing** — the file cannot know which wings you
registered, so it carries all of them.

What you see is entirely the sheet's doing, but **sorting a table and coloring code is work the
reading side has to do in JavaScript** — clicking a header to reorder rows, or slicing code text
into colored tokens, is something CSS cannot do. Wire the reading-side runtime with one door if
you want it.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'en' })
</script>
```

- Skip it and the document still shows up fine — a table with sorting turned on just does not
  sort, and code stays one color.
- Table sorting only attaches to a table where sorting was turned on in the editor (it leaves a
  `data-nabi-sortable` marker behind).
- Code coloring is answered by a built-in tokenizer, so it needs no dependency. To use a
  highlighter such as Shiki, wire it in as a hook — `{ locale: 'en', highlight }` — and that
  weight belongs to whichever page wired it in.
- The global `NabiNote` bundle has no such door — `nabi-note/viewer` lives on its own so a reading
  page never loads the whole editor. A host pulling the package through npm wires the same door
  onto the preview too, as in
  [{{ t('menu_intro_usage') }}](./usage#hanging-reading-side-runtime-on-the-preview).

---

## Next

- [{{ t('menu_intro_usage') }}](./usage) — the npm way: assembly, inputs and outputs in full
- [{{ t('menu_wing_custom') }}](../wing/custom) — build a format that does not exist yet

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// The version number is never written by hand — it is read straight from nabi-npm's package.json
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
