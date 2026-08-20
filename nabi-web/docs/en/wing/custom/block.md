---
title: Blocks and paragraph attributes
description: void, container, attr — building the things that take up a place. A lump always lives inside a wrapper paragraph.
---

# Blocks and paragraph attributes

Things that take up a place come in three kinds.

| `place` | What | Example |
|---|---|---|
| `'void'` | **A lump with no inside.** The caret cannot get in | divider, image, YouTube |
| `'container'` | **A lump with text inside** | quote, details, table, list, code |
| `'attr'` | A value laid on the paragraph itself. It erects no node | heading, align, drop cap |

---

## A lump lives inside a wrapper paragraph

The document is **an array of blocks**, and the only thing that may stand at the top level is a
paragraph (`p`). A lump never stands at the top level directly — it wears **a paragraph holding
nothing but itself** and stands in that.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

That paragraph is the **wrapper paragraph**, and it is drawn on screen as `<div data-nabi-p>`.

There are two reasons for it. There is always a place for the caret to stand before and after
the lump (because one paragraph is always there), and **the lump takes on paragraph attributes
such as alignment as they are** — a "centred image" is precisely "an image inside a centred
paragraph".

---

## Building a lump with no inside

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { en: 'Star' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` puts the wrapper paragraph on for you.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

Call it on an empty paragraph and it **takes that paragraph over** — you are not left with a
blank line every time you insert. And any alignment that paragraph already carried survives
untouched.

What `boxObject` fills in for you is `place: 'void'` and **the attribute checkers**.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // values off the list drop away
  requires: ['c'],                                                 // without it this lump does not stand
  toHtml: /* … */,
})
```

An attribute you did not list in `attrs` is **an unknown field and drops wholesale.** There is
no place for a value outside the contract to sneak onto the stored value.

---

## Building a lump with an inside

`place: 'container'` must always carry `holds` alongside — leave it out and registration dies.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // paragraphs live inside ('inline' means characters only)
  allows: ['p'],                    // what may come in here
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { en: 'Note' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` is a **toggle**. It wraps the top-level blocks the selection spans in this
container, and if they are already all wrapped it lays the inside back out in place.

```
before          [p"first line", p"second"]
after           [p[ note[ p"first line", p"second" ] ]]
pressed again   [p"first line", p"second"]
```

### `holds`

| | What lives inside | Example |
|---|---|---|
| `'blocks'` | Paragraphs and other lumps | quote, details, a table cell |
| `'inline'` | Characters and marks only | a details summary, code |

### `allows`

Write it and **nothing else may come in.** The core lays on a tidier of its own, so whether it
arrives by paste or from a stored value, anything off the list has its shell stripped and its
text settled down into a paragraph.

Leave it out and everything is allowed. Put an unknown name in `allows` and it **dies right
where you register it.**

---

## `parts` — buttonless inner structure

Structure that **cannot stand on its own and has no toolbar button** — a table's rows and
cells, a details summary — is declared as a part.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // an attribute whose only value is 1 — whether it is open
  parts: { summary: { holds: 'inline' } },            // the summary line
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // every part must have a builder
  repair: repairDetails,
}
```

There are four rules.

- **Only containers** have parts. Write them on another `place` and registration dies.
- Every part must have a `partHtml`. Without it registration dies.
- A part's name may not collide with a wing name or another part's name.
- If a part needs tidying, write it under the part's name in `partRepair`.

`StructureDecl` takes three things — `holds`, `singleParagraph` and `boolAttrs`.

### `singleParagraph`

The inside is **fixed at one paragraph**. This is what a table cell is — press <kbd>Enter</kbd>
inside a cell and the paragraph does not split in two, and deleting a selection spanning two
cells does not merge the cells into each other. This one field is what keeps the grid intact.

### `boolAttrs`

An attribute whose only value is `1` — details' `o` (open), a task list's `ck` (checked), a
paragraph's `dc` (drop cap). The off state is not `0` but **the field not being there at all**.

---

## `repair` — the last door at the stored value's entrance

`repair` tidies this node once, **right before JSON becomes a document**.

```ts
repair: (node) => {
  if (!isValid(node)) return null    // null — this node is stripped, shell and all
  return tidiedNode                  // returning it unchanged is fine (the same object means nothing changed)
}
```

A stored value edited by hand, a document from another build, JSON somebody else made — all of
it goes through this door. Only what gets past becomes a document, which makes this **the one
place a wing can vouch for the shape of its own node.**

Write `allows` and `repair` together and the `allows` tidying runs **first**, with its result
handed on to `repair`.

---

## `requiresAnyOf` — a wing that needs a partner to stand

```ts
requiresAnyOf: ['img', 'a']
```

If not one of these is registered alongside, it **dies right where you register it.** The
upload wing uses this — what it uploads has to be erected as an image or a link, and with
neither present it can upload and then do nothing at all.

---

## Paragraph attributes (`place: 'attr'`)

A paragraph attribute erects no node. It only lays one value onto the paragraph's `a`.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["A centred heading 2"] }
```

::: warning The fields are nailed down at three
`attrKey` must be one of **`h` (heading) · `a` (align) · `dc` (drop cap)**, and any other name
kills registration. In this build **no new paragraph attribute can be made** — a paragraph's
attribute fields are closed at the three the core knows.

For the same reason those three are already taken by `headingWing`, `alignWing` and
`dropCapWing`, which leaves effectively no room to write a new `place: 'attr'` wing. If you want
to lay a value on each paragraph, wrapping in a container is the way to go for now.
:::

There are two fields for handling the value.

| | |
|---|---|
| `attrValues` | The list of values it accepts (for a heading, `[1,2,3,4,5,6]`) |
| `currentValue` | The value this paragraph now carries. The toolbar and the context toolbar paint the pressed slot from this answer |

---

## The public document helpers

This build hands out four editing helpers.

| | What it does |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | Erects one lump, wrapper paragraph and all |
| `removeLump(doc, topIndex, env)` | Takes one top-level wrapper paragraph away whole |
| `toggleWrap(doc, sel, containerW, env)` | Wraps the blocks spanned in a container, or lays them back out |
| `topNodeAt(doc, path)` | The top-level node this path belongs to |

All four answer with `{ doc, caret }`, so you convert once into the shape a command answers
with.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip If you need finer editing than this
The inner helpers that cut and join character by character (laying on a mark, writing a
paragraph attribute and so on) are not public API yet. Until then you may build the `doc` array
anew yourself and answer with it — the document you answer with is tidied once more by
`cocoon`, so a document that breaks the rules never survives as it is.
:::

---

## Next

- [Keys, input rules, paste](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI and actions](../custom/ui) — the toolbar button and the context toolbar

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
