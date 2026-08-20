---
title: Writing an inline mark
description: place 'mark' — a format laid over characters. You write the way out (toHtml) and the way in (claim) together.
---

# Writing an inline mark

`place: 'mark'` is **a format laid over characters**. It takes up no place of its own, it does
not break the flow of the text, and marks may overlap — bold, italic and highlight are all this
kind.

---

## One mark with everything filled in

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { en: 'Key' },
      shortcut: 'K',
      action: { kind: 'mark' },        // the core does the toggling — no command needed
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

What `simpleMark` fills in for you is two things: `place: 'mark'` and
`escapeKeys: ['Escape']`. Everything else passes through untouched.

---

## The two directions are written separately

| | Direction | Without it |
|---|---|---|
| `toHtml` | document → HTML | **Registration dies.** A wing that erects a node must have a way to draw it |
| `claim` | HTML → document | It draws, but **cannot be read back.** Save and load and the shell is stripped |

The six basic marks (`b`, `i`, `u`, `s`, `sub`, `sup`) and the four value marks (`hl`, `tc`,
`fs`, `tf`) are tags **the core already knows.** That is why `boldWing` carries neither
`toHtml` nor `claim`. A name you invent is unknown to the core, so you write both.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| Argument | What it is |
|---|---|
| `node` | The node as it stands. Attributes come out of `node.a?.['key']` |
| `children()` | The drawn text of the inside. **It draws when called**, so leave it uncalled and the inside never goes out |
| `ctx` | The tools for building safely |

What `ctx` gives you:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | Builds one chunk. Values are escaped for you |
| `ctx.escape(text)` | Escapes text alone |
| `ctx.url(raw)` · `ctx.src(raw)` | Filters an address. An address it cannot trust is **`null`** |
| `ctx.keys` | Whether this render is the **editor's** (`getEditorHtml()`) |

::: warning Never concatenate the string yourself
Write `` `<kbd>${node.a?.['t']}</kbd>` `` and text inside the document becomes markup as it
stands. Always go through `ctx.element` or `ctx.escape`.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — the element exactly as it arrived |
| `inner(block)` | Reads the inside. For a mark `false` (a place for characters), for a block `true` |
| Answer | An array of nodes, or **`null`** (not mine → on to the next wing) |

Wings are asked in array order and **the first to put its hand up** takes it.

There are two places to answer `null` — when it is not my tag, and **when it is my tag but the
value is off the list.** Answering `inner(false)` in the second case strips the shell alone and
keeps the text alive.

---

## A mark that carries a value

For a mark that **picks one out of a fixed list**, like a colour or a size, use `valueMark`.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // the attribute field the value lives in
    values: [...LEVELS],             // nothing outside this is accepted
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // off the list — keep the text alone
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

Two things `valueMark` lays on for you:

- **`currentValue`** — the value where the caret now sits. The toolbar and the context toolbar
  paint which slot is on from this answer.
- **`repair`** — re-checks the value at the JSON door. Off the list or missing, it answers
  `null` and **strips the node, shell and all.** A stored value edited by hand is caught right
  here.

::: tip A command that changes the value
There is no public helper yet for a value mark's "set it to this value" command. The
`action: { kind: 'mark' }` that toggles from a toolbar button alone works as shown, and when
you need value picking, reach for the four built-in value marks (highlight, text colour, font
size, typeface) or spread their declarations.
:::

---

## `escapeKeys` — stepping out of a mark

With the caret at the end of a mark, only the person knows whether the next character belongs
inside it or outside. `escapeKeys` is that door.

```ts
escapeKeys: ['Escape']    // the default for simpleMark and valueMark
```

**The caret does not move.** Pressing the key arms "the next character typed leaves this mark".
Type one character and the arming is spent and gone.

```
<kbd>Ctrl</kbd>(caret)  →  Escape  →  typing "+"  →  <kbd>Ctrl</kbd>+
```

Several wings may claim the same key — the arming only takes hold while the caret really is
inside that mark, so of the marks overlapping there, only the matching ones come off together.
<kbd>Escape</kbd> also serves to **undo** an arming that is already in place.

---

## Marks cannot own keys

Write `onKey` and **it never reaches a mark.** A caret position is `{ path, offset }`, and the
end of `path` is **the holder carrying the characters** — a mark is an inline node inside that
holder, so it never appears on the path at all. The core walks up this path to decide who owns
a key, so it never meets a mark.

The reason is overlap. Press <kbd>Enter</kbd> inside a link inside an italic inside a bold and
there is no way to say which of the three owns it. The one door a mark has onto keys is
`escapeKeys`.

---

## Next

- [Blocks and paragraph attributes](../custom/block) — the things that take up a place
- [Keys, input rules, paste](../custom/input) — `onKey` and `inputRules`
- [UI and actions](../custom/ui) — the toolbar button and the context toolbar

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
