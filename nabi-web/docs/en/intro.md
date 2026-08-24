---
title: Introduction
description: NABI NOTE is an open-source WYSIWYG editor that runs in the browser.
---

# What is NABI NOTE?

NABI NOTE is an **open-source WYSIWYG editor** that runs in the browser.


## The nabi-tree

Handling HTML directly runs into a wall on the server side (Node.js and the like), where
there is no DOM to work with. NABI NOTE instead manages the document as a pure
JavaScript tree object called the **nabi-tree**, serialized both ways to JSON and to
HTML. Malicious content that could trigger XSS is also stripped out automatically during
that conversion between the nabi-tree and HTML.

> Every default wing NABI NOTE officially supports handles XSS prevention. When you write
> or bring in a `custom wing (a third-party plugin)`, though, check with its own author
> whether it does the same.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM-less SSR (server-side rendering) support

A nabi-tree stored in a database or elsewhere can be **read as-is on the server (Node.js
and the like)** and assembled into the HTML sent to the client. The only work that needs
a DOM API is **input** from an external HTML string (`setHtml()`) and the `mount*`
functions that render the editor to the screen.

A screen that only displays a document read-only needs no editor stood up at all — call
the single rendering function (`renderStoredHtml`). It takes the stored nabi-tree data and
the `registry` (the list of registered wings) as arguments and returns a safe HTML string.

**In a server environment, use the `nabi-note/ssr` entry** — a lightweight entry point
that carries only the core logic rendering needs, so the editing area (`surface`) or
UI-tool (`ui`) code never ends up in the server bundle.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// Build the wing list once when the server starts, and reuse it across every request.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['one line of a comment'] }]   // a nabi-tree read from the DB
renderStoredHtml(saved, registry)
// '<p>one line of a comment</p>'
```

**Anything that is not a valid nabi-tree gets `null` back** — the validation rule is
identical to `setJson()`'s. A value that passes validation **matches exactly** the
`getHtml()` result called on an editor instance, because it runs through the same
normalize-then-assemble pipeline — so XSS filtering is applied at the same point too.

To pre-render (SSR) the editor's own editing screen on the server, use the
`renderStoredEditorHtml` function. It produces HTML with a `data-key` attribute added to
every node.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">one line of a comment</p>'
```

The same stored data always produces the same `data-key`. So you can send down the HTML
rendered on the server and, in the browser, hydrate it with
`mountSurface({ nabi, registry, root, hydrate: true })` — the editor takes over without
redrawing the screen. **This site's own home demo runs exactly this way, too** — the
document on the first screen was pre-rendered by the server, and on the client the editor
activates directly on top of that DOM.

### Package entry points

| Entry | What it carries | When |
|---|---|---|
| `nabi-note` | The full editor (the document model, the editing area, the toolbar, and UI tools) | A screen for **writing/editing** a document |
| `nabi-note/ssr` | A lightweight SSR-only module that renders a nabi-tree to HTML | A server environment or a read-only page |
| `nabi-note/viewer` | Read-only behavior (table column sorting, code highlighting, etc.) | A screen for **viewing** published HTML |

`nabi-note/ssr` **never references** the editing area (`surface`) or UI tools (`ui`) at
all. An architecture-level unit test strictly verifies this, so there's no risk of
DOM-dependent code slipping into the server bundle.

## Every format is a wing

What other editors call a "plugin," NABI NOTE calls a **wing**. The editor core directly
handles only the base paragraph (`p`), the line break (`br`), and plain text — every
format and extension, from headings and lists to tables and bold, is provided as an
independent wing.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>bold</b> <i>italic</i></p>')
bare.getHtml()
// '<p>bold italic</p>'                    — no wing is registered, so the tags are stripped and it converts to plain text.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>bold</b> <i>italic</i></p>')
bold.getHtml()
// '<p><b>bold</b> italic</p>'              — only boldWing is registered, so only bold is kept and the rest converts to plain text.
```

Markup not registered as a wing **is automatically converted to plain text.** So any
undeclared HTML element is safely excluded, and every wing NABI NOTE officially supports
thoroughly filters out malicious scripts.


## Interface

The editor's document can only be safely changed through `applyCommand()`.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Toggle bold
nabi.applyCommand('setHeading', { value: 2 })   // Set an H2 heading
nabi.undo()
nabi.redo()
```
A command **returns whether it succeeded as a `boolean`.** When nothing changes it
returns `false` and leaves neither a history entry nor performs any unnecessary work.


## Layers of the code

The structure below isn't the order data executes in — it shows the **fourteen layers**
organized in the `src/` directory. The core principle is that **a lower layer never
references an upper one.** So the lower layers (`schema`, `doc`, `html`, and so on)
depend on the DOM not at all, and they run unchanged in a server environment (Node.js) too.

```
src/
├── style/     the core stylesheet — the CSS the editing screen and the viewer share
├── locale/    the multilingual dictionary
├── code/      the pure tokenizer shared by the editing screen and the viewer
├── schema/    the nabi-tree's structure and the cocoon (normalization) definition
├── doc/       node insert · delete · split · range operations — no DOM
├── caret/     cursor position · selection · boundary handling
├── html/      nabi-tree ↔ HTML two-way serialization
├── io/        input/output handling — paste candidates · save · open · markdown
├── editor/    the command interface and the editor instance
├── wing/      wing validation and registration management
├── wings/     the official wing collection (bold · italic … table · upload)
├── surface/   syncs caret · IME · input events onto the tree
├── ui/        the UI layer — toolbar · context bar · popups
├── viewer/    read-only viewer behavior
├── index.ts   the core entry point — `nabi-note`
└── ssr.ts     the SSR-only entry point — `nabi-note/ssr` (does not reference surface · ui)
```

**The line order is the layer order** — arranged not alphabetically but **from the lowest
layer to the highest.** `style` is the lowest layer and `viewer` is the highest.

This layer-dependency rule isn't just a guideline — it's **mechanically verified through
unit tests.** The moment an `import` that violates the layer rule appears, the build and
test stage fails immediately.


## Glossary

| Word | Meaning |
|---|---|
| **mark** | Inline text formatting — e.g. `<b>`, `<i>`, `<a>` |
| **block** | A block-level element — e.g. paragraph, heading, list, table, image |
| **paragraph attribute** | An attribute applied to a whole paragraph — e.g. alignment, drop cap |
| **wrapper paragraph** | The container paragraph wrapping a standalone block object such as a table or image |
| **claim** | The rule deciding which wing a piece of input HTML markup belongs to |
| **parts** | The sub-elements making up the inside of a wing — e.g. a table's rows/columns, a details block's summary line |
| **IO filter** | An extension point handling clipboard paste (input) and save/open (output). It operates outside the wing contract, so it creates no node of its own in the nabi-tree |

### On the editing screen

| Word | Meaning |
|---|---|
| **caret** | The text cursor and selection inside the editor |
| **context row** | The auxiliary toolbar shown dynamically to match the block/format state the caret is in — e.g. a table's row/column controls, the code language picker, a link's address field, a heading's level picker |

### Core

| Word | Meaning |
|---|---|
| **cocoon** | The nabi-tree normalization step. **It runs immediately after every command**, guaranteeing no abnormal tree that breaks the schema rules is ever produced |
| **attach** | A hook a wing declares when it needs to control the DOM directly — e.g. drag-selecting table cells, code syntax highlighting, toggling a checkbox. The hooks of every registered wing are wired up together when `mountSurface` runs |
| **input rule** | A shortcut rule that auto-converts formatting as you type — e.g. typing `- ` converts to a list, typing `# ` converts to a heading |


## Next

- [{{ t('menu_intro_usage') }}](./intro/usage) — the full guide to assembling, taking input, and producing output
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — using a single `<script>` tag with no build tool
- [{{ t('menu_wing_custom') }}](./wing/custom) — build a brand-new custom format wing yourself

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: 'typed by hand · pasted · loaded', kind: 'in' },
  { label: 'setHtml() · setJson()', note: 'function input', kind: 'gate' },
];

const hubCore = { label: 'nabi-tree', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'HTML for the editor', kind: 'out' },
];

</script>
