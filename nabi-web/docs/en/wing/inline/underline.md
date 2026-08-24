---
title: Underline
---

# Underline

## Description

`underlineWing` is the inline mark wing that handles underline formatting (`<u>`).

- Recognizes `<u>` on input, and always comes back out as standard `<u>` on output.
- Supports hint mode (double-tap Shift, then `U`) and the accelerator (`Ctrl`/`⌘`+`U`).
- Run it with text selected and it acts as a toggle.
- Underline and link (`<a>`) can look alike on screen, but they are independent wings — the same text can carry both an underline and a link at once.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
