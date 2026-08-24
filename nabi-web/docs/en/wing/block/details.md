---
title: Details
---

# Details

## Description

`detailsWing` (id `details`, shortcut `D`) handles the accordion fold-away block (`<details>` +
`<summary>`). The summary line (`<summary>`) is built in through the `parts` attribute, so there's
no need to register it separately.

```ts
parts: { summary: { holds: 'inline' } }
```

Click the toolbar button and the blocks the caret touches are wrapped into a fold-away block, with
an empty summary line created at the top. Press Enter in the summary line and you move down into
the body content (a line break inside the summary line never splits it).

**The editing screen renders exactly what will actually be stored.** A block saved closed
(`open` not set) loads closed in the editor too, and clicking the arrow icon on the left opens or
closes it at any time (that click changes the nabi-tree's `o` attribute immediately). If the caret
was inside the body when you fold the block, it moves safely outside the block.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
