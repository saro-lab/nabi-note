---
title: Quote
---

# Quote

## Description

`quoteWing` (name `quote`) owns the quote box (`<blockquote>`). It is
`place: 'container'` with `holds: 'blocks'`, so blocks live inside it — and like
any other lump the quote itself stands at the top level wearing a wrapper
paragraph.

**It sets no `allows`.** Inside a quote follows the same rules as the top level, so
a table or an image can stand in there too, wearing a wrapper paragraph of its own
— paste or load HTML shaped that way and it survives as it stands.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["text"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

What does *not* reach inside is **the insert buttons**. Anything that stands
through `insertLump` — images, tables, dividers — always takes its place at the
**top level**, so with the caret inside a quote the new lump lands *after* the
quote, not in it. To put one inside, paste it in.

Press the button and every top-level block the selection covers is wrapped into a
quote. It unwraps only when **every** covered block is already a quote — a mixed
stretch gets wrapped once more as a whole.

Type `>` at the start of a line and then a space and that line becomes a quote —
that auto-conversion is **triggered by the space** (not by Enter), because you go
on writing on the same line.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
