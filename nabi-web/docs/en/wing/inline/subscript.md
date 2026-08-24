---
title: Subscript
---

# Subscript

## Description

`subscriptWing` is an inline mark wing that handles subscript formatting (`<sub>`).
Use it for chemical formulas, footnote numbers, and the like.

- Recognizes the `<sub>` tag on the way in, and renders back out the same way.
- Sits in the toolbar's `script` group, next to Superscript.
- Pressing it with text selected toggles the mark.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
