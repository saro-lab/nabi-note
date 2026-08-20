# Quickstart - npm

```sh
npm i nabi-note
```

## Minimal setup

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

// The wing array builds the type knowledge, commands, and assembler together - that bundle is `registry`.
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes, // required for setHtml() - see "Writing documents" below
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'en' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'en' })
mountSticky({ root: app, surface })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

The host only builds the container elements; layout classes (`.nabi-toolbar-row`, `.nabi-context`,
etc.) and the floating tools box are attached by the mounts themselves. Only three classes matter
on the host markup:

- `.nabi` - holds the color/shape CSS tokens and is the box fullscreen pins; toolbar and editor
  area must both live inside it.
- `.nabi-toolbar` - wraps the toolbar row and context row into one sticky unit (if they stick
  separately, the context row popping in/out shifts the page).
- `.nabi-content[contenteditable]` - the editable area itself.

The stylesheet is not injected automatically - `import 'nabi-note/nabi.css'` (bundler) or
`injectSheets(document, collectSheets(registry))` (only the registered wings' sheets). A page
that server-renders the document should use the file/import path, not injection - injection only
attaches once the editor's JavaScript has arrived, so the document would flash unstyled first.
See `llms/styling.md`.

## Locale and text direction

`locale: 'ar'` or `'ur'` on `mountSurface`/`mountToolbar` sets `dir="rtl"` on that mount's root -
even if the page's own `<html>` says nothing about direction. Omit `locale` and direction is left
alone entirely (a host already controlling direction is never overridden). `localeDirection(code)`
answers `'ltr' | 'rtl'` for a given code; `RTL_LOCALES` lists which of the codes are RTL.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })  // edit area mirrors to RTL
mountToolbar({ nabi, registry, surface, root: toolbarEl, locale: 'ar' })  // toolbar mirrors too
```

Passing `locale` to `mountToolbar` also binds it to the editor (`nabi.$bindLocale`), so core
messages (toast text, etc.) speak the same language even without a UI string change elsewhere.
Without a toolbar, pass `locale` directly to `createNabiWith`'s options instead.

### Placeholder

An empty editor shows a dimmed hint on its first line, and it disappears the moment a character
is typed. The word comes from the core dictionary in the mount's language, so nothing has to be
wired for it to appear. It sits at the line start for the text direction (left in LTR, right in
RTL) and does not follow the line's own alignment.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: 'Write your notes here' })
mountSurface({ nabi, registry, root: surface, placeholder: 'First line\nSecond line' })
mountSurface({ nabi, registry, root: surface, placeholder: '' })  // no hint at all
```

A newline (`\n`) in the option becomes a line break. The hint is positioned out of the flow so that
it never pushes the caret, so a multi-line hint spills below an editing area that is only one line
tall - give the area a matching min height when the hint has more than one line.

The stylesheet reads the word from the `--nabi-placeholder` custom property on the editing root
and draws it with
`.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before`,
so its color or style can be restyled from the host CSS.

## Mounts

| Mount | Required | Does |
|---|---|---|
| `createNabiWith(wings, options?)` | yes | Returns `{ nabi, registry }`. No DOM needed. Accepts a plain wing array or the picker builder (`wings()`, see `llms/quickstart-cdn.md`) |
| `mountSurface({ nabi, registry, root })` | yes | Wires caret/IME/input to the document tree; also attaches every registered wing's `attach` |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | no | Main toolbar. Without it, editing still works via `nabi.applyCommand()` |
| `mountContextToolbar({ nabi, registry, root, surface? })` | no | Caret-position context row (table row/column, code language, link address, etc.) |
| `mountHints({ toolbar, context?, root, surface? })` | no | Shortcut badges shown on a fast double-tap of Shift |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | no | Preview and fullscreen buttons. `root` is the `.nabi` box fullscreen pins; `onBody` attaches viewer-side JS to the preview body (see below) |
| `mountSticky({ root, surface })` | no | Undoes the toolbar's sticky offset by however much a mobile keyboard has pushed the viewport |
| `mountPickedMark({ nabi, surface })` | no | Selected-image/video highlight (browsers do not draw this on their own) |
| `mountFile({ nabi, store, name? })` | only with `save`/`open` wings | Save/open as a `.nabi` file |
| `mountLocalHistory({ nabi, storage })` | only with `localHistory` wing | Periodic snapshot to the browser. Still mount it when `storage` is `null` (e.g. blocked on `file://`) so the button can toast why it is disabled |
| `mountUpload({ ... })` + `mountUploadView({ ... })` | only with `upload` wing | Upload progress for drop/paste/file-picker, and its display |

Image selection highlighting, checkbox toggling, table-cell drag, and code coloring need no
separate mount - every one of those is a wing's `attach`, wired in automatically by
`mountSurface`. Code coloring only needs a highlighter plugged in (`makeCodeAttach`, see
`llms/wings.md`).

Swapping which wings are registered means unmounting everything (`unmount()`) and building fresh
- markup owned by a dropped wing falls back to plain text at that point.

## Reading documents

```ts
nabi.getHtml()        // Output HTML - what you store or publish
nabi.getJson()        // NABI TREE (JSON)
nabi.getEditorHtml()  // Current editor-screen HTML (carries data-key) - not for storage
```

Store one of the first two. `getJson()` returns an array of blocks with no wrapping root node:

```json
[
  {"w":"p","a":{"h":2},"ch":["Title"]},
  {"w":"p","ch":["Text ",{"w":"b","ch":["bold"]}," and ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["a link"]}]}
]
```

Reading rules (four, no more):

- `w` is the id of the wing that draws the node. The only reserved ids are `p` (paragraph) and
  `br` (line break); everything else is a registered wing's id. A heading is not its own wing -
  it is a paragraph attribute (`{"w":"p","a":{"h":2}}`).
- A string is text; an object is a wing node. There is no separate "kind" field.
- `a` is the wing's own value payload (a link's href, a highlight's color, a heading's level). No
  value, no `a` key.
- Anything occupying a paragraph's slot (tables, lists, images) is wrapped in one paragraph node
  (see `ul` above) - that paragraph carries alignment and gives the caret a place to sit before
  and after the object. It emits as `<div data-nabi-p>` because `<p>` cannot legally contain a
  table or list.

The live in-memory tree also carries an internal `_id` per node (a caret address) that is
stripped on the way out; feed the exported JSON straight back into `setJson()`.

## Writing documents

```ts
createNabiWith(wings, { doc })                  // start from an existing NABI TREE
nabi.setJson(json)                              // swap the whole document for this tree
nabi.setHtml(html)                              // swap the whole document for this HTML string
nabi.applyCommand('setHeading', { value: 2 })   // an edit command (the same door wings use)
```

All four return a `boolean` and never throw; on failure the document is untouched.

| Returns `false` when |
|---|
| `setJson` - value is not a valid NABI TREE |
| `setHtml` - no `parseHtml` adapter was given (below), or editing is locked |
| `applyCommand` - no such command, or **nothing would change** |

**The empty document has exactly one shape: `[{"w":"p","ch":[]}]`.** Deleting everything (select
all, then Backspace) leaves that, not a paragraph that keeps the first block's heading or
alignment - so a wiped editor always starts plain. Emptying just one paragraph out of several
keeps that paragraph's own attributes, since the caret stays there to rewrite the line.

**A blank value is not a format error - it is the empty document.** `null`, `undefined`, an
empty or whitespace-only string, and an empty array all load the blank editor and return
`true`, on both `setJson` and `setHtml`, so clearing the editor always succeeds. A blank value
needs no `parseHtml` adapter either: there is nothing to read. Values of the wrong shape are
still rejected - blank and malformed are different things.

That last row is a rule: applying `setHeading` to a paragraph that is already heading level 2
returns `false` and leaves no undo point - a no-op edit is silent.

`applyCommand`'s third argument is the calling hand: `applyCommand(name, args?, by?)`, where `by`
is `'keyboard' | 'pointer'` (type `CommandHand`), defaulting to keyboard. It matters for a mark
command with a collapsed caret: keyboard queues the mark for the next typed character; pointer
returns `false` and toasts "nothing to apply to" instead. Building custom UI that calls commands
from a click handler should pass `'pointer'`.

`setHtml` needs a browser adapter, since the core does not know the DOM:

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` needs no adapter - a stored JSON tree can be fed in directly even on a server
(Node.js), and `getHtml()` needs no DOM either, so reading JSON and emitting HTML server-side
works out of the box (see `llms/ssr.md`).

## Notifications (toast)

Upload errors, local-history messages, "nothing to apply to" - all of it goes through one path.
The default container is built into the core; nothing needs to be wired for it to appear (pinned
below the toolbar once one is mounted).

- Three levels: `'info' | 'warn' | 'error'` - how alarmed the reader should be, not
  success/failure.
- Default 1s lifetime (fades from the last 0.5s), dismissible by click. Up to 3 shown at once by
  default; over that, the one with the least time left is dropped first.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // lifetime, default 1000ms (a caller can also override per call)
  toastMax: 5,     // concurrent cap, default 3
  // A host with its own notification system replaces the display only - the core's own
  // container is never drawn:
  // toast: (level, message, ms) => user_callback(level, message),
})
```

Wings speak through the same door: `nabi.$toast(level, message, ms?)`.

## Asking the user

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| Slot | Shape |
|---|---|
| `message` | `(text: string) => void` - one statement, no answer expected |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` - sync or async |

The core never reaches for the browser's own dialogs automatically - a host with its own dialog
system should not have a native gray box interrupt it, and plugin hosts (IntelliJ, VS Code) have
no `window.confirm` at all. Fill only what you need: an unfilled `message` falls back to a core
info toast; an unfilled `confirm` answers `false`. A confirm with no host answer means "no" -
canceling, pressing Escape, or closing the window all mean the same thing, and this is the gate
for prompts like "discard unsaved changes and open anyway?" - never default that to "yes" just
because nobody answered. This is per-editor, not global, so two editors on one page can ask
differently. Wings receive the same door as `nabi.$ask`.

## Editor identity and change tracking

```ts
nabi.sessionId   // '1755245678901-1x9k3af' - <unix time>-<nonce>, one per instance
nabi.isChanged() // has the document moved since the last baseline
```

`sessionId` is created once and never changes - useful as a tag for drafts, logs, or autosave
keys. Three things redraw the `isChanged()` baseline: loading a whole document
(`createNabiWith({ doc })`, `setJson()`, `setHtml()`), and reporting a completed save:

```ts
nabi.$markSaved(savedDoc)   // after a save succeeds - pass the tree that was actually saved
```

Pass the tree **as of the moment the save started**, not the current tree - characters typed
while the save was in flight must still count as "changed". The `save` wing calls this after the
file write actually lands, so saving to `.nabi` makes `isChanged()` false. Undoing back to the
saved state also returns to `false` - NABI TREE is immutable and replaced wholesale on every
edit, so sameness is known immediately, with no diffing or hashing.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

## Rendering a preview

A preview is static HTML built from `getHtml()`, so reader-side JavaScript (table sort, code
color) does not attach on its own. `nabi-note/viewer`'s `attachViewer` wires all of that in one
call; in a preview it goes through the `onBody` hook:

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

Call the same `attachViewer(el, { locale })` on a published page too, so the preview and the
published result look and behave identically. The built-in code tokenizer needs no dependency; a
host using something like Shiki passes `{ locale, highlight }` to both `attachViewer` and
`makeCodeAttach({ highlight })` so editing and reading colorize the same way.

## See also

- `llms/quickstart-cdn.md` - the same assembly with no build step
- `llms/wings.md` - every built-in wing
- `llms/custom-wing.md` - building your own
- `llms/api-reference.md` - full function signatures
- `llms/ssr.md` - rendering documents with no editor mounted
- `llms/styling.md` - CSS variables and stylesheet loading
