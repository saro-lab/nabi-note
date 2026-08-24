---
title: Quote
---

# Quote

## Description

`quoteWing` (id `quote`) handles the quote block (`<blockquote>`). It has `place: 'container'` and `holds: 'blocks'`, so besides plain paragraphs it can hold other block elements too, such as a table or an image.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["quoted text"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

Click the toolbar button and the blocks in the selection are wrapped into a quote. If the selection is already a quote, the same button unwraps it.

Type `>` followed by a space at the start of a paragraph and it converts to a quote automatically.

## Usage example

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
