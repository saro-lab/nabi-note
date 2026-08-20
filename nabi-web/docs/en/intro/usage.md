---
title: Basic usage
description: Install from npm, stand one nabi object up, and move documents in and out of it.
---

# Basic usage

The npm way. For the one-`<script>` way, see [{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## Joining the pieces together

The host builds the slots and attaches the mounts one by one. Below is the minimal arrangement, and
every example on the wing pages is this same skeleton with a wing or two slotted in.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'en' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'en' })
mountSticky({ root: app, surface })

// Every time the value changes — hang your own code here
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

The host builds the slots and **the core knows what those slots look like** — a mount attaches
`.nabi-toolbar-row`, `.nabi-context` and `.nabi-editing` to its own box itself, and stands its own
tool box up as well. Which means the host never has to work out the layout, and that is why the
markup above carries only three classes.

- **`class="nabi"`** — the color tokens and the sheets live only inside it. It is also the box that
  full screen pins whole, so the toolbar and the writing area have to be inside it **together**.
- **`class="nabi-toolbar"`** — ties the toolbar row and the context row into one lump so they go
  **sticky** together. Stick them separately and the text is shoved down when the context row
  appears, and the screen jumps.
- **`class="nabi-content" contenteditable`** — the writing area itself.

If the site has a fixed header, push the editor down by that much with `--nabi-sticky-top`; attach
`mountSticky()` and the core measures how far a mobile keyboard pushed the screen up and gives it
back.

**The host hangs the sheet.** With a bundler `import 'nabi-note/nabi.css'` is all it takes, and if
you want only what the registered wings carry, call
`injectSheets(document, collectSheets(registry))`. **A page whose document is rendered ahead of
time on the server should take the file route** — injection attaches only after the editor's
JavaScript arrives, and the document paints bare once in the gap before that.

**Locale also decides text direction.** Hand it Arabic (`ar`) or Urdu (`ur`) and that mount's root
gets `dir="rtl"` and stands right-to-left — even if the page's own `<html dir>` says nothing.
**Leave `locale` out and nothing is touched** — a host that holds direction in its own hands is
never overridden. Which language runs which direction is answered by `localeDirection(code)`.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // the writing area goes RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // the toolbar mirrors too
```

The display language is decided per mount with `locale` — the document's text stays as it is and
only the names on the toolbar and the context row change. **The host only has to declare the
locale once** — bundle it into one shared object as in the example above and pass it to the
mounts, and the toolbar, once it stands, also wires its own `locale` into the core
(`nabi.$bindLocale`), so what the core itself says (toasts, and so on) comes out in the same
language too. A slot run without a toolbar gets its locale from the `locale` option of
`createNabiWith`. To draw a picker, use `LOCALES` (the list of codes) that the package exports.

### The hint an empty editor shows

An editor with nothing in it stands a dimmed hint on its first line. It goes the moment a single
character arrives, and comes back when the last one is deleted. **It shows without you doing
anything** — the word comes from the core dictionary, so it follows that mount's language. Where it
stands is decided by text direction (left in LTR, right in RTL): the hint does not follow a centred
or right-aligned line.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: 'Leave a note here' })
mountSurface({ nabi, registry, root: surface, placeholder: 'First line\nSecond line' })
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // no hint at all
```

A newline (`\n`) becomes a line break. The hint stands **out of the flow** though (so that it never
pushes the caret), so on an editing area only one line tall a multi-line hint spills below it — give
the area that much minimum height when you use more than one line.

The word goes onto the editing root as `--nabi-placeholder`, and the sheet is what draws it. To
change its color or feel, write over this rule.

```css
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before {
  color: #999;
}
```

| Piece | Required | What it does |
|---|---|---|
| `createNabiWith(wings, options?)` | yes | answers `{ nabi, registry }`. Needs no DOM. Takes the wing array as-is, or the picker builder (`wings()`, see [{{ t('menu_intro_cdn') }}](./cdn#picking-wings)) |
| `mountSurface({ nabi, registry, root })` | yes | fits the caret, IME and input back onto the nabi-tree. It also attaches the `attach` of every registered wing |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | no | the main toolbar. Without it you can still edit directly through `applyCommand()` |
| `mountContextToolbar({ nabi, registry, root, surface? })` | no | the per-caret context row (table rows and columns, code language, a link's address and name, and so on) |
| `mountHints({ toolbar, context?, root, surface? })` | no | the shortcut badges that appear on a double tap of Shift |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | no | the preview and full-screen buttons. `root` is the `.nabi` box full screen will pin, and `onBody` is the hook that hangs reading-side runtime on the preview body (below) |
| `mountSticky({ root, surface })` | no | gives back as much as a mobile keyboard pushed the sticky toolbar up |
| `mountPickedMark({ nabi, surface })` | no | the marking for a picked image or video (the browser does not draw it) |
| `mountFile({ nabi, store, name? })` | with save and open | saving to and opening a `.nabi` file |
| `mountLocalHistory({ nabi, storage })` | with localHistory | a record kept in the browser at a fixed interval. Stand it up even when `storage` is `null` (a blocked spot like `file://`) — that is what lets it tell you by toast why the button does nothing |
| `mountUpload({ … })` + `mountUploadView({ … })` | with upload | running uploads from a drop, a paste or the file picker, and showing them |

**Images, checkboxes, table cell dragging and code coloring have nothing to mount separately** —
the wings hold all of it in `attach` and `mountSurface` attaches it along with them. Code coloring
is the only one that wants somebody plugged in to do the coloring (`makeCodeAttach`, see
[{{ t('menu_wing_code') }}](../wing/block/code)).

### Hanging reading-side runtime on the preview

The preview is static HTML with `getHtml()` plugged straight in, so anything that is **the reading
side's own JavaScript doing work** — table sorting, code coloring — does not attach on its own.
`attachViewer` from `nabi-note/viewer` hangs all of it through one gate, and the `onBody` hook is
where it hangs inside the preview — swap the `mountViewTools` line from the minimal setup above for
this:

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'en',
  onBody: (body) => attachViewer(body, { locale: 'en' }),
})
```

`onBody` is called once the preview body stands, and the release function it hands back is called
when the overlay closes. Hang **that same one line** (`attachViewer`) on the published page too —
a preview has to match the published page, so hanging the same gate on both is the whole point of
this hook. More detail is in
[{{ t('menu_intro_cdn') }} ▸ The reading side](./cdn#the-reading-side).

Code coloring is answered by the built-in tokenizer by default (zero dependencies). A host using a
highlighter such as Shiki passes the same hook as `attachViewer(body, { locale, highlight })` —
keep it the same one handed to `makeCodeAttach({ highlight })` and the editing screen and the
reading screen never disagree on color.

To swap wings out, take all of these pieces down (`unmount()`) and make them again — the markup the
removed wing was holding drops to plain text on the spot. The demos on this site work exactly that
way: toggle a wing chip and the whole assembly is rebuilt.

The CSS variables, colors and shapes included, are in
[{{ t('menu_style_custom') }}](../style/custom).

---

## The three ways out

```ts
nabi.getHtml()        // the HTML you save and publish
nabi.getJson()        // the nabi-tree (JSON)
nabi.getEditorHtml()  // the HTML of the editor screen as it stands (it carries data-key)
```

**Save one of the first two.** `getEditorHtml()` carries a screen-only marker (`data-key`), so it
is not the value you export — it is for pre-rendering an editor on the server (SSR).

The outgoing JSON looks like this. **A document is an array of blocks**, with no root node
wrapping it.

```json
[
  {"w":"p","a":{"h":2},"ch":["Title"]},
  {"w":"p","ch":["text ",{"w":"b","ch":["bold"]}," and ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["a link"]}]},
  {"w":"p","a":{"a":"c"},"ch":["centered"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["one"]}]},
    {"w":"li","ch":[{"w":"p","ch":["two"]}]}]}]}
]
```

Four rules read it, and that is all.

- **`w` is the id of the wing that draws the node.** Only two words are reserved, `p` (paragraph)
  and `br` (line); everything else is the id of a wing you registered — `b`, `ul`, `li` and the
  like. A heading is not a separate wing but **an attribute of the paragraph**
  (`{"w":"p","a":{"h":2}}`).
- **A string is text, an object is a wing.** There is no separate field naming the kind.
- **`a` is the value that wing carries** — a link's address, a highlight's color, a heading's level.
  Absent when there is none. Alignment's value is also `a`, but it lives **inside** this field, so
  the two never get confused (`{"w":"p","a":{"a":"c"}}` — a centered paragraph).
- **Anything taking a paragraph's place, such as a table, a list or an image, is wrapped in one
  layer of paragraph** (look at the `ul` above). That paragraph is what wears the alignment, and it
  is what gives the caret somewhere to stand before and after the lump. In HTML it leaves as
  `<div data-nabi-p>` — because a `<p>` cannot hold a table or a list by the grammar.

The tree that runs on the inside carries one more thing on every node, `_id` — **the internal
address the caret points a node by**. Most edits reissue it, and it is stripped on the way out (464
→ 317 bytes for the example above). What left goes straight back into `setJson()` as it is.

---

## The four ways in

```ts
createNabiWith(wings, { doc })   // start from a nabi-tree already made
nabi.setJson(json)               // swap the whole document for a nabi-tree
nabi.setHtml(html)               // swap the whole document for an HTML string
nabi.applyCommand('setHeading', { value: 2 })  // an editing command (the same gate wings use)
```

All four **answer success or failure with a `boolean`.** They do not throw, and on failure they
leave the document alone. A slightly-off value is **corrected while being read** rather than
rejected — an empty table cell, a non-row child of a table, an overflowing merge — and dangerous
URLs are filtered in that same step. Rejection is reserved for shapes that cannot be read at all.
And even a value that throws mid-read never stops the editor — it turns into a rejection
(`false`), reported through `console.error`.

| Where the answer is `false` | |
|---|---|
| `setJson` | it is not the shape of a nabi-tree (a blank value aside — below) |
| `setHtml` | the `parseHtml` adapter is not plugged in (below), or editing is locked (a blank value aside) |
| `applyCommand` | there is no such command, or **nothing changes** |

**The empty document has one shape — `[{"w":"p","ch":[]}]`.** Wiping everything (select all, then
Backspace) leaves exactly that: the first block's heading or alignment does not survive. Emptying
one paragraph out of several is different — the caret stays there to rewrite the line, so that
paragraph keeps its own attributes.

**A blank value is not a format error — it is the empty document.** Give it `null`, `undefined`, an
empty string (whitespace-only counts) or an empty array and it does not refuse: it **sits down as a
blank screen and answers `true`**. That holds for both `setJson` and `setHtml`, which is what makes
"clear it" always succeed. A blank value has nothing to read, so `setHtml` needs no adapter (below)
for it either. A value of the wrong shape is still refused — blank and malformed are not the same
thing.

That last line is a rule in itself — **when nothing changes, it stays quiet.** Put `setHeading` on
a paragraph that is already a level 2 heading and it answers `false`, leaving neither an undo point
nor a signal behind.

### `setHtml` needs an adapter

Reading HTML is the browser's `DOMParser`'s job. The core knows no DOM, so you plug that adapter in
where you declare it.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` needs no adapter — you can feed stored JSON **straight in from a server (Node.js)**.
Assembly (`getHtml`) uses no DOM either, so the path of reading JSON on a server and sending out
the HTML it makes is open as it stands.

---

## Notifications come out as a toast

A single line — an upload error, a note from local history, "there is nothing to apply to" — comes
out through **one toast road**, always. The core holds the default box, so nothing has to be
plugged in for it to work — once a toolbar stands, it lands in a fixed spot below the toolbar (a
spot that does not move even as the context row appears and disappears).

- There are three levels — `'info' | 'warn' | 'error'`. Not a verdict of success or failure, but a
  scale of **how tense the reader needs to be.**
- It clears after 1 second by default (fading from the last 0.5s), and a click closes it too. Up to
  3 stand at once by default — past that, the one with the least time left goes first.
- A message can carry `\n`, and it draws correctly in both light and dark.

Two options bend the grain, one swaps the display out entirely, all on `createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // how long it lives — 1000ms by default. A caller can also add its own per call
  toastMax: 5,     // the cap standing at once — 3 by default
  // A page with its own notification system swaps only the display — the core's own box never draws
  // toast: (level, message, ms) => user_callback(level, message),
})
```

Wings speak through this same one gate — `nabi.$toast(level, message, ms?)`. Since the time rides
along with the message, there is no need to stretch the whole default just for one long notice.

---

## How the editor asks

Opening a file wants a question like "there is writing here already. Open anyway?". You plug that
box in **once, where you declare the editor**.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Shape |
|---|---|
| `message` | `(text: string) => void` — one message, no answer taken |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — synchronous or asynchronous, both accepted |

**The core never reaches for the browser's own on its own.** A grey box must not barge into a page
that has dialogs of its own, and a plugin host (IntelliJ, VS Code) has no `window.confirm` at all.
Those three lines are the host's to build.

::: warning Left out, the answer is "no"
A question nobody answered is not a "yes" — it means what cancel, Escape and closing the window
mean. The place this answer lands is "throw the writing away and open?", so when there is nobody to
ask, it must not go the throwing-away way. On a server (Node) it passes quietly by this value too.
:::

**It belongs to one editor** — not the page, so two editors on one page may ask in two different
ways. Wings get the same thing (`nabi.$ask`) — that story is in
[{{ t('menu_wing_custom') }} ▸ UI and behavior](../wing/custom/ui).

---

## This editor's name, and "did it change"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <unixtime>-<nonce>, one per instance
nabi.isChanged() // has the document moved since the last baseline
```

`sessionId` is made once and never changes. The time says when this editor stood up and sorts by
itself, and the nonce keeps two editors made in the same millisecond apart. It is a tag to hang on
a draft, a log line or an autosave key.

**Three things draw a fresh baseline** for `isChanged()` — putting a whole document in
(`createNabiWith({ doc })`, `setJson()`, `setHtml()`), and telling it a save went through.

```ts
nabi.$markSaved(savedDoc)   // after a save succeeds — hand it the document you saved then
```

**Hand it the tree from the moment you were saving** (not the tree as it stands now). Letters typed
during a slow save have to stay "changed". The save wing (`save`) calls this once the file is
actually written, so saving to `.nabi` makes `isChanged()` `false`.

**Undo back to where it started and it is `false` again** — the nabi-tree is immutable and replaced
whole on every edit, so this is known on the spot, without walking or hashing to ask whether it is
the same document.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Next

- [{{ t('menu_intro_ssr') }}](./ssr) — pre-render stored content on the server and pick it up with `hydrate`
- [{{ t('menu_intro_cdn') }}](./cdn) — one `<script>`, no build step
- [{{ t('menu_wing_custom') }}](../wing/custom) — build a format that does not exist yet

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
