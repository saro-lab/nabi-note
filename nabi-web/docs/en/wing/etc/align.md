---
title: Align
---

# Align

## Description

The `alignWing` (id `align`) is a paragraph-attribute wing that handles text alignment — left, centre, or right — for paragraphs and block elements.

- It gives the block node a `data-nabi-align` attribute (`<p data-nabi-align="center">`).
- **It applies not just to paragraphs but to headings (`h1`–`h6`) as well** (`<h2 data-nabi-align="c">`).
- Only one alignment value holds at a time. Click an already-active alignment button again and the attribute comes off, restoring the default alignment.
- Split a paragraph mid-way with Enter and both halves keep the same alignment attribute.
- **This wing also handles alignment for block objects** such as images, tables, and YouTube embeds. A block object sits inside the wrapper paragraph (`<div data-nabi-p>`) that holds it, so the toolbar's alignment buttons control the object's left/right/centre placement through that wrapper.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
