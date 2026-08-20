---
title: Highlight
---

# Highlight

## Description

`highlightWing` (name `hl`) is the owner (claim) of `<mark data-color="...">`. It
is an inline mark that carries a value, so it is not an on/off toggle but a choice
among colors — the same grain as Text color.

- **The toolbar button (shortcut `H`) applies yellow** — it sends `setHighlight`
  with `{ c: 'yellow' }`. It is not an argument-less button.
- So that button toggles **against yellow**. It comes off only when the range is
  yellow **all the way through** — press it over a range that is entirely green
  and the green is replaced by yellow rather than removed, and it takes a second
  press to strip it.
- When the caret sits inside a highlight mark, six color swatches appear on the
  context toolbar — press one and only the color changes, in place. This wing has
  no "clear" field of its own: pressing the color already in force takes it off,
  and clearing formatting belongs to `clearFormatWing` (register it separately).
- **With only a caret there are two cases.** If the caret is already inside a
  highlight mark, the text that mark covers is the target (no need to select the
  range again). Outside a mark there is no text to lay it on, so it is **armed** —
  the next character you type comes out in that color.
- Only the color name survives in the saved value — `data-color="yellow"` and the
  like. No inline `style` goes out. The background is drawn by the sheet this wing
  carries in `styles` (one sheet shared with Text color), and the color values
  themselves come from the core tokens `--nabi-hl-*`, which the host overrides.
- **A value off the list never survives anywhere.** The command refuses to run at
  all, and on the way in a `<mark>` carrying a `data-color` that is not on the list
  is stripped of its shell, leaving **only the text**. A `<mark>` with no
  `data-color` goes the same way — the color *is* the value, so a highlight without
  one has nowhere to stand.
- A hand-edited stored value is treated the same: `repair` meets an off-list value
  and takes the node away, shell and all.

| Color | Stored value |
|---|---|
| Yellow | `yellow` |
| Green | `green` |
| Cyan | `cyan` |
| Pink | `pink` |
| Purple | `purple` |
| Orange | `orange` |

These six are exported as `HIGHLIGHT_COLORS` — an **array of names**
(`readonly string[]`), not color values. The values live in the sheet.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
