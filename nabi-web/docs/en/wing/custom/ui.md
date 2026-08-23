---
title: UI and actions
description: Toolbar buttons (button), the context toolbar (context), sheets (styles) — the three places a wing stands in front of a person.
---

# UI and actions

There are three places a wing stands in front of a person.

| Field | Where |
|---|---|
| `button` · `buttons` | the **toolbar** up top — the place that is always visible |
| `context` | the **context toolbar** — the place that only appears for whatever the caret is touching |
| `styles` | the **CSS** this wing carries |

---

## Toolbar buttons

```ts
button: {
  group: 'emphasis',                   // which cluster it stands in — required
  svg: '<path d="…"/>',                // the insides on a 16×16 grid. Without one it stands as text
  label: { en: 'Bold' },
  shortcut: 'B',                       // this letter in hint mode
  accelerator: 'mod+b',                // the Ctrl/⌘ combination
  action: { kind: 'mark' },
}
```

For several buttons, write an array in `buttons` — this is how a single alignment wing stands up
left, center and right. Then `name` tells them apart and `value` says which value each one
stands for.

### `group` — the cluster decides the order

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**This order is nailed down.** Wherever you put a wing in the array, its button stands in its
cluster's place. Registration order only lines things up **within** a cluster. Use a name that is
not on the list and a new cluster appears at the very end.

When a cluster empties out entirely (all its buttons hidden) that cluster disappears from the
screen — no empty divider is left behind.

### `action` — what happens when it is pressed

| `kind` | What it does | What goes with it |
|---|---|---|
| `'mark'` | goes to the core's mark toggle. **You do not have to write a command** | — |
| `'command'` | runs one command | `command` · `args?` |
| `'menu'` | opens a value list as a panel | `command` · `argKey` · `values` |
| `'grid'` | opens a rows×columns grid (inserting a table) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | raises input fields and passes what comes back to the command | `command` · `fields` |
| `'file'` | opens the file picker | `accept?` · `multiple?` |
| `'host'` | hands off to the host (`mountToolbar`'s `onHost`) | — |

Leave `action` out and pressing the button does nothing at all.

### `shortcut` and `accelerator`

| | Shape | Rule |
|---|---|---|
| `shortcut` | `'B'` | **one uppercase latin letter or digit** |
| `accelerator` | `'mod+b'` | `mod+` followed by **one lowercase letter** |

Both **die at registration if two wings collide.** One of them never quietly stops working later
on.

Write a separate `accelerated` and pressing the accelerator does something different — the button
opens a panel while <kbd>Ctrl</kbd>+key applies the default straight away, for instance.

::: warning An accelerator hears only keys raised on **this editor's ground**
One place listens for accelerators — the toolbar — and how far its ear reaches is drawn by
`mountToolbar({ surface })`. Only a key raised inside that surface or the toolbar rows belongs to
this editor. **With two editors on one page you must pass it**: without it the toolbar falls back to
listening to the whole document, and the two editors eat each other's keys.

Two more thresholds. **The button has to be standing** (meaning that wing is registered and visible
right now), and **the press has to reach something** before the key is swallowed. A `'host'` action
counts as reaching something only when `onHost` or the save panel is wired; reaching nothing, the key
flows on to the browser as its own.
:::

---

## How a button looks pressed

There is only one basis for painting a button "on right now".

| `place` | What it reads |
|---|---|
| `'mark'` | is that mark at the caret |
| `'attr'` | the `currentValue` of the paragraph the caret stands in |
| `'container'`·`'void'` | is the caret inside or on that lump |
| `'tool'` | **always off** |

A wing with several values (alignment, headings) writes a `value` on each button, and only the
button matching what the wing's `currentValue` answered gets painted.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` answers a string** — even a numeric value goes back through `String()`.
`undefined` means "this node holds no value of mine".

---

## Buttons hide themselves where they cannot stand

| `place` | When it hides |
|---|---|
| `'mark'` | in a place where only text lives (inside a code box, say), when it owns that place |
| `'attr'` | when the caret is on a wrapper paragraph holding a lump. **Alignment (`a`) is the one exception** |
| `'void'`·`'container'` | in a place where only text lives, or when the current container's `allows` will not take it |
| `'tool'` | never hides |

Alignment is the exception for the reason you saw earlier — a lump's alignment is held not by the
lump but by the wrapper paragraph around it. You have to be able to press "center" while standing
on a picture.

Write `allows` and **the toolbar follows on its own.** The table button vanishing inside a code
box is not a separately written rule; it falls out of that one field.

---

## The context toolbar

The row that only appears for whatever the caret is touching right now. Click a picture and the
size control is there; put the caret in a link and the address box is there.

```ts
context: {
  title: { en: 'Note' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { en: 'Tone' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // the attribute slot to read the current value from
      values: [
        { value: 'info', label: { en: 'Info' } },
        { value: 'warn', label: { en: 'Warning' } },
      ],
    },
  ],
}
```

### When it appears

**Everything the caret touches** opens its own row.

- the containers on the caret's path (innermost first, outermost last)
- the aimed lump (a picture selected while on its wrapper paragraph, say)
- the **marks** at the caret — unlike toolbar buttons, marks do get a context row
- a **paragraph attribute** wing whose value the caret's paragraph is holding

Put the caret in a link inside a table and the link row and the table row appear together.

### The seven kinds of `ContextControl`

| `kind` | What | What goes with it |
|---|---|---|
| `'button'` | one press, one command | `command` · `args?` |
| `'toggle'` | two states, on and off | `command` · `token` |
| `'select'` | one out of a list | `command` · `argKey` · `values` · `attr?` |
| `'range'` | sliding a scale (resizing) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | a single text field (a link address) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | several fields as a panel | `command` · `fields` |
| `'lightbox'` | view it large | `src` · `alt?` |

All seven share `name` (required) · `label?` · `svg?` · `tip?` · `visible?`.

`visible: (node) => boolean` is the door for **hiding a control within the same wing** — showing
"unmerge" only on cells that are already merged, for instance.

Write `attr` and the current value is read straight out of that attribute slot for painting.
`'toggle'` uses `token` to compare against the string `currentValue` answered.

---

## `styles` — the CSS a wing carries

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

Four rules.

- **Narrow everything under `.nabi-content`.** It must not bleed into the rest of the host page.
- **Write type sizes in `rem` or `em`.**
- **Tell dark apart by the `.dark` class only.** Do it with a media query and the editor alone
  goes dark on a host that has chosen light.
- **Measure wide and narrow with a container query.** The yardstick is the width of the place the
  editor sits in, not the width of the screen.

If you want only what you registered, gather and inject the sheets yourself.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

A sheet with the same text is loaded **once** — several wings can share the same CSS and only one
copy lands in the document. The answer is a teardown function, and it removes **only what this
call newly added**.

---

## Asking the person

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` takes a `boolean` or a `Promise<boolean>` — plug in the browser's own `confirm`, or
raise a panel of your own and answer later.

A third slot, `choose`, is **one out of several** — this door opens when a paste has two or more
candidates.

```ts
choose: (question, options) => user_callback(question, options),   // the answer is an index
```

The list it receives is an array of `ChooseOption`, which has two fields.

| | |
|---|---|
| `label` | the name that stands in that slot |
| `icon?` | the **inside** of a 16×16 svg (a few paths). The panel puts the shell on, and **without it the name stands alone** |

The answer is **an index** — `0` is the top one, and `-1` (or anything out of range) is a cancel, in
which case nothing is pasted. Both `number` and `Promise<number>` are accepted.

::: warning Left out, `confirm` answers "no" and `choose` answers the top one
Supply no `ask` and a silent default goes in. `message` goes nowhere and `confirm` answers
`false`. The reasoning is that **an ask-then-delete quietly not working** is better than it
quietly happening. Local history's "really delete this?" goes through this door.

`choose` alone runs the other way — its default is **0 (the top one)**. Answering cancel here would
make the paste vanish entirely, and the first candidate in the list is always "the most likely
reading", so with nobody to ask that is the right answer. And `choose` usually needs no plugging in
at all — as the toolbar stands, it hangs its own panel onto the core.
:::

::: tip Commands cannot ask
A command is a pure function; it knows nothing of the screen or of time. Ask outside the command
and call the command **once the answer is in**. Inside a wing, the place for that is `attach`,
where you reach it through `host.nabi.$ask`.
:::

---

## Next

- [Writing an inline mark](../custom/inline) · [Blocks and paragraph attributes](../custom/block) ·
  [Keys, input rules, paste](../custom/input)
- [Theming and CSS variables](../../style/custom) — the variable names the sheets expect

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
