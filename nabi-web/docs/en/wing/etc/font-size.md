---
title: Font size
---

# Font size

## Description

`fontSizeWing` (name `fs`) is an **inline value mark**. It is formatting laid over
the text, not a paragraph attribute. On the way out it is drawn as
`<span data-nabi-size="lg">`.

There are four values — `xs`, `sm`, `lg`, `xl` — and the default size is not a
fifth value but **the absence of the attribute**.

- It pairs with typeface (`tf`) — one wing holds every value, and the place you
  pick from is the context toolbar. Typeface lays out four fields, though, while
  size uses a single scale.
- **The context control is a scale (`range`).** Size is an ordered value (small →
  large), so instead of laying out fields it gives you one handle to slide. The
  value in force shows as the handle's position, and its name rides alongside on
  the label.
- **The first slot on the scale is "Default"** — first rather than middle, because
  the list runs small to large and the place before it is where "nothing applied"
  belongs. Move the handle there and it does not write some `base` value; it
  **takes the mark off**.
- **The field labels take the locale** — "Default · Extra small · Small · Large ·
  Extra large" in English.
- Press the toolbar button and you get **`lg` (Large)**. The scale runs
  small-to-large, so leaving it alone would apply the first slot, `xs` — and nobody
  presses a size button meaning to make the text smaller.
- **With just a caret it applies to the whole paragraph.** It is rare to want a
  single word resized, so with no range selected it aims at the paragraph
  (highlight and text colour, by contrast, aim at the mark run you are standing in).
- Press it in a paragraph with no text at all and it is **armed** — the next
  character you type comes out at that size.
- Apply the same value again and it comes off.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
