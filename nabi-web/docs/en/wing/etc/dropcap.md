---
title: Drop cap
---

# Drop cap

## Description

`dropCapWing` is a paragraph-attribute wing that renders a paragraph's first letter as a large decorative letter (`data-nabi-dropcap="1"`).

- It works as a single on/off toggle.
- The first letter's size is fixed by a `::first-letter` rule in the core stylesheet (`font-size: 5.9em; line-height: .83`).
- Split the paragraph with Enter and the drop-cap attribute is not duplicated into both halves — it stays with the original first letter.

To customize the size, override the rule below:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
