---
title: Italic
---

# Italic

## Description

`italicWing` is the inline mark wing that handles italic formatting (`<i>`). Reach for
it to set text apart in tone — emphasis, a foreign word, and the like.

- On the way in it recognizes both `<i>` and `<em>`; on the way out it always becomes
  the standard `<i>` tag.
- Supports hint mode (double-tap Shift, then `I`) and the shortcut `Ctrl`/`⌘`+`I`.
- Run it with text selected and it toggles.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
