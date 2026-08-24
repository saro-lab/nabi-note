---
title: Font size
---

# Font size

## Description

`fontSizeWing` (id `fs`) is a value-based inline mark wing that adjusts a text run's font size (`<span data-nabi-size="lg">`).

It supports four size levels — `xs`, `sm`, `lg`, `xl` — and the default size is simply the absence of the attribute, not a fifth value.

- Clicking the main toolbar button applies **`lg` (Large)** by default.
- With the caret inside a font-size mark, the dynamic context toolbar shows a slider (`range`) where you can pick Default, Extra small, Small, Large, or Extra large. Moving the slider to Default removes the mark.
- Picking a size with just a caret — no text selected — applies it to the whole paragraph.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
