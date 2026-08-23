---
title: Introduction
description: NABI NOTE is an open-source WYSIWYG editor that runs in the browser.
---

# What is NABI NOTE?

NABI NOTE is an **open-source WYSIWYG editor** that runs in the browser.


## The nabi-tree

Handling HTML directly runs into a wall on the server side, where there is no DOM to work with. So
the document is instead carried as a JavaScript object called the **nabi-tree**, serialized both
ways to JSON and to HTML. XSS-bearing content is stripped out during that conversion, in both
directions.

> Every wing NABI NOTE ships handles XSS on its own. For a `custom wing (a third-party plugin)`,
> check with its author whether it does the same.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM-less SSR support

A stored nabi-tree can be read straight from the **server (Node.js)** and assembled into the HTML
you send down. A DOM is needed only for **input** (`setHtml()`) and for the `mount*` calls that
attach to the screen.

A page that only displays something needs no editor stood up — one function is enough. What it
takes is the stored value and the `registry` (the list of registered wings); what it answers with
is an HTML string.

**On the server, bind to `nabi-note/ssr`** — an entry point carrying only what rendering needs, so
the editing surface and the on-screen tools never get loaded at all.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Build the wing list once, when the server starts — every stored value shares this one registry.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['one line of a comment'] }]   // a nabi-tree read from the database
renderStoredHtml(saved, registry)
// '<p>one line of a comment</p>'
```

**Anything that is not a nabi-tree gets `null` back** — the same rejection rule as `setJson()`. A
value that passes through is **not one character different** from the editor's own `getHtml()`,
because it walks the same steps (normalize, then assemble) — so XSS is filtered at the exact same
point too.

To pre-render the editor itself on the server, reach for its counterpart — the only thing it adds
is `data-key`.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">one line of a comment</p>'
```

The same stored value always gets the same `data-key`, so you can send this HTML down as it is and
have the browser adopt it with `mountSurface({ nabi, registry, root, hydrate: true })` instead of
redrawing the screen. **This site's own home demo runs exactly that way** — the document on first
paint was rendered by the server, and the editor wakes up on top of it.

### Three entry points

| Bind to | What it carries | When |
|---|---|---|
| `nabi-note` | the whole editor — assembly, surface, on-screen tools | where you **write** |
| `nabi-note/ssr` | only what renders a stored value to HTML | the server, or a page that only reads |
| `nabi-note/viewer` | reading-side behavior (table sorting, code coloring) | where you **display** published HTML |

`nabi-note/ssr` does not load a single file from the editing surface (`surface`) or the on-screen
tools (`ui`) — a net sweeps the source and enforces this. So there is no way for DOM code to slip
into the server bundle.

## Every format is a wing

What other editors call a "plugin" we call a **wing**. What the core knows directly is the
paragraph (`p`), the line (`br`) and plain text; headings, lists, tables and bold are all wings.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>bold</b> <i>italic</i></p>')
bare.getHtml()
// '<p>bold italic</p>'                    — no wing was declared, so it all drops to plain text.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>bold</b> <i>italic</i></p>')
bold.getHtml()
// '<p><b>bold</b> italic</p>'              — only boldWing was declared, so only bold survives.
```

Markup you did not register as a wing **is converted to plain text.** That is why undeclared HTML
never comes through, and why every officially-supported wing strips out malicious script as it
does.


## Interface

The document can only be changed through `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Bold
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```

Commands **answer with a `boolean`, telling you whether they succeeded.** When nothing changes,
they answer `false` and leave neither a history entry nor an edit behind.


## Layers of the code

**This is not the order values flow in.** These are the **fourteen folders** you see when you open
`src`, one folder to a layer, and there is one rule — **a lower layer never knows an upper one.**
That is why the layers written near the top (`schema`, `doc`, `html`) never touch the DOM, and why
they run unchanged on the server. The path values actually travel is the nabi-tree diagram above.

```
src/
├── style/     the core sheet — the CSS the editing screen and the published text share
├── locale/    language
├── code/      the pure tokenizer shared by the editing screen and the reading side
├── schema/    the shape of the nabi-tree and the cocoon definition
├── doc/       insert · delete · split · range — DOM-less
├── caret/     the cursor's position, selection, and boundaries
├── html/      nabi-tree ↔ HTML
├── io/        the doors in and out — paste candidates, save, open, markdown
├── editor/    the instance carrying the command interface
├── wing/      checks on the wings at registration time
├── wings/     the official wings (bold · italic … table · upload)
├── surface/   fits the caret, IME, and input onto the tree
├── ui/        the UI layer
├── viewer/    read-only
├── index.ts   the core entry — `nabi-note`
└── ssr.ts     the SSR entry — `nabi-note/ssr` (it touches not one file of surface or ui)
```

**The order of the lines is the order of the layers** — not alphabetical but **bottom layer
first.** `style` is the floor and `viewer` is the top.

This order is not a promise written in prose — **a net enforces it by machine.** The moment a
single import runs against this direction, the check fails right there.


## Glossary

| Word | Meaning |
|---|---|
| **mark** | formatting — e.g. `<b>` · `<i>` · `<a>` |
| **block** | e.g. paragraph, heading, list, table, image |
| **paragraph attribute** | an attribute of a paragraph — e.g. alignment, drop cap |
| **wrapper paragraph** | the paragraph wrapping a single-paragraph object such as a table, list or image |
| **claim** | the judgment of which wing a piece of markup belongs to |
| **parts** | a feature inside a wing — e.g. a table's rows and cells, a Details' summary line |
| **IO filter** | the extension point that handles pasting (the door in) and saving and opening (the door out) as one set. It sits **outside the wing contract**, so it stands no node of its own in the document |

### On the editing screen

| Word | Meaning |
|---|---|
| **caret** | the selection cursor inside the editor |
| **context row** | the toolbar controlling whatever the caret currently has selected — e.g. a table's row/column commands, code's language field, a link's address/name fields, a heading's H1–H6 |

### Core

| Word | Meaning |
|---|---|
| **cocoon** | the normalizing step for the nabi-tree. It runs **after every command**, so no command can leave behind a document that breaks the rules |
| **attach** | the hook a wing declares when it has to touch the screen — e.g. a table's cell dragging, code coloring, the task toggle. `mountSurface` attaches the ones belonging to the registered wings |
| **input rule** | a conversion that happens from typing alone — e.g. a hyphen and a space become a list, a `#` and a space become a heading |


## Next

- [{{ t('menu_intro_usage') }}](./intro/usage) — assembly, input and output in full
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — one `<script>`, no build tool
- [{{ t('menu_wing_custom') }}](./wing/custom) — build a format that does not exist yet

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'typed by hand · pasted · loaded from storage', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'function input', kind: 'gate' },
];

const hubCore = { label: 'nabi-tree', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML for the editor', kind: 'out' },
];

</script>
