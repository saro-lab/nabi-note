---
title: UI and actions
description: Toolbar buttons (button/buttons), the context toolbar (context), and a wing's own CSS (styles) — how a wing plugs into the interface.
---

# UI and actions

A wing can put itself in front of the person using the editor in three places: the **main toolbar** (`button`/`buttons`), the **context toolbar** (`context`), and its **own CSS** (`styles`).

---

## Toolbar buttons (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // which group it belongs to (required)
  svg: '<path d="…"/>',                // an SVG path string inside a 16×16 viewBox
  label: { en: 'Bold' },
  shortcut: 'B',                       // the letter shown in hint mode (double-tap Shift)
  accelerator: 'mod+b',                // the keyboard shortcut (Ctrl/⌘ combo)
  action: { kind: 'mark' },            // toggles an inline mark
}
```

When a single wing needs several buttons, define them as a `buttons` array — a text-alignment wing offering left/center/right, for instance. Each button is told apart by its `name`, and `value` carries the value that button stands for.

### The order of button groups (`group`)

The toolbar renders button groups in this fixed order:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

Wherever a wing is declared in the array, its button lands in its group's slot — only within the same group does registration order matter. Naming a group not on this list adds a brand-new group at the very end of the toolbar.

When every button in a group is hidden under the current state, that group and its divider disappear automatically.

### Kinds of button `action`

| `kind` | What it does | Extra fields |
|---|---|---|
| `'mark'` | Toggles an inline mark (handled by the core's default logic) | — |
| `'command'` | Runs the given command | `command`, `args?` |
| `'menu'` | Shows a dropdown to pick a value | `command`, `argKey`, `values` |
| `'grid'` | Shows a row×column grid picker for inserting a table | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | Opens an input popup and passes the value to the command | `command`, `fields` |
| `'file'` | Opens the file picker | `accept?`, `multiple?` |
| `'host'` | Hands off to the host callback (`onHost` on `mountToolbar`) | — |

A button with no `action` defined does nothing when clicked.

### Shortcuts (`shortcut` and `accelerator`)

| Field | Shape | Rule |
|---|---|---|
| `shortcut` | `'B'` | **One uppercase Latin letter or digit** |
| `accelerator` | `'mod+b'` | The `mod+` prefix followed by **one lowercase letter** |

If two wings declare the same shortcut, initialization throws immediately.

Set `accelerated` to branch into a different action only when triggered by the shortcut — a button click can open an options modal, say, while the shortcut applies the default value straight away.

::: warning Shortcuts only work inside the editor area you told them about
A shortcut only fires for key presses raised inside the editing surface passed to `mountToolbar({ surface })`. With more than one editor on the same page, you must pass `surface` or the shortcuts from each editor will interfere with each other.
:::

---

## Rules for showing a button as pressed

Whether a toolbar button paints itself as "currently pressed" depends on the wing's kind (`place`):

| `place` | What decides it |
|---|---|
| `'mark'` | Whether that inline mark applies at the current cursor position |
| `'attr'` | Whether the current paragraph node's `currentValue` matches the button's `value` |
| `'container'` · `'void'` | Whether the cursor is inside or on that block object |
| `'tool'` | Always stays unpressed |

For a wing with several values (heading, alignment), only the button whose `value` matches the string `currentValue` returns gets painted as pressed.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## Rules for buttons hiding themselves

The editor core automatically disables or hides toolbar buttons wherever formatting cannot apply:

- **In places where formatting is restricted** (inside a code block, say), inline marks and other block-creating buttons hide automatically.
- On the wrapper paragraph of a block object (an image, a table), paragraph attributes such as heading hide — except **text alignment (`a`), which stays as the exception** for aligning the object itself.
- A wing whose button isn't in the parent container's `allows` list hides automatically.

---

## The dynamic context toolbar (`context`)

A secondary toolbar that offers controls specific to whatever the cursor is currently on — a size slider when you click an image, a URL field when you click a link, row/column buttons when the cursor sits inside a table.

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
      attr: 't',                                    // the node attribute key to read the current value from
      values: [
        { value: 'info', label: { en: 'Info' } },
        { value: 'warn', label: { en: 'Warning' } },
      ],
    },
  ],
}
```

### Kinds of context toolbar control (`ContextControl`)

| `kind` | Shape | Main fields |
|---|---|---|
| `'button'` | A plain button click | `command`, `args?` |
| `'toggle'` | An on/off switch | `command`, `token` |
| `'select'` | A dropdown | `command`, `argKey`, `values`, `attr?` |
| `'range'` | A slider (resizing, say) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | A text field (a link URL, say) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | A popup with several fields | `command`, `fields` |
| `'lightbox'` | An enlarged image popup | `src`, `alt?` |

Every control shares `name` (required), `label?`, `svg?`, `tip?`, and `visible?`. A `visible(node)` function lets you show a control only under certain conditions — an "unmerge" button that only appears on an already-merged cell, for instance.

---

## A wing's own CSS (`styles`)

A wing can carry whatever CSS it needs, built in.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

`collectSheets(registry)` and `injectSheets(document, sheets)` let you inject only the registered wings' styles into the document dynamically, and the same style string is never injected twice.

---

## Wiring up dialogs with the person (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: shows a plain notice (`(text: string) => void`)
- `confirm`: an OK/cancel choice (`(text: string) => boolean | Promise<boolean>`)
- `choose`: a multi-option choice (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

A `ChooseOption` is shaped `{ label: string, icon?: string }`, and the return value is the chosen option's 0-based index (`-1` on cancel).

::: warning What happens with no `ask` handler
Leave out an `ask` handler and `confirm` defaults to `false` (cancel) for safety. Leave out `choose` and the first candidate (index `0`) is chosen by default — UI such as the paste-format picker binds its own core-built panel automatically once `mountToolbar` is mounted, so most setups never need to implement `choose` themselves.
:::

---

## Next

- [Writing an inline mark](../custom/inline) · [Blocks and paragraph attributes](../custom/block) · [Keys, input rules, and paste](../custom/input)
- [Custom styling](../../style/custom) — the CSS variables and theming guide

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
