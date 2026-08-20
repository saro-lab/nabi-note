---
title: Text color
---

# Text color

## Description

`textColorWing` (name `tc`) is the owner (claim) of `<span data-color="...">`.
Same grain as Highlight: an inline mark that carries a value, so you pick a color
rather than switch one on and off.

- **The toolbar button (shortcut `C`) applies green** — it sends `setTextColor`
  with `{ c: 'green' }`. It is not an argument-less button.
- So that button toggles **against green**: it comes off only when the range is
  green all the way through, and a range in some other color is replaced by green.
- When the caret sits inside a text-color mark, five color swatches appear on the
  context toolbar — press one and only the color changes, in place (marks never
  stack on top of each other). This wing has no "clear" field of its own: pressing
  the color already in force takes it off, and the rest belongs to
  `clearFormatWing`.
- **With only a caret there are two cases.** Inside a mark, the text that mark
  covers is the target; outside one it is **armed**, and the next character you
  type comes out in that color.
- Only the color name survives in the saved value — `data-color="green"` and the
  like. No inline `style` goes out. The color values come from the core tokens
  `--nabi-tc-*`, and the sheet is one shared with Highlight.
- On the way in (`claim`) it looks only at `<span>` tags carrying a `data-color`
  attribute. A `<span>` with no `data-color` at all is not claimed by this wing, so
  it is stripped of its shell and drops to plain text — and **if the attribute is
  there but its value is off the list, the shell is stripped just the same**,
  leaving only the text.
- A hand-edited stored value carrying an off-list value is taken away by `repair`,
  shell and all.
- Text color and Highlight are different marks, so the same text can carry both —
  which is why the highlight sheet never sets `color`.

| Color | Stored value |
|---|---|
| Green | `green` |
| Coral | `coral` |
| Violet | `violet` |
| Amber | `amber` |
| Blue | `blue` |

These five are exported as `TEXT_COLORS` — an **array of names**
(`readonly string[]`), not color values.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
