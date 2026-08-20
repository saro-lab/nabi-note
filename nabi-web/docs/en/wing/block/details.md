---
title: Details
---

# Details

## Description

`detailsWing` (name `details`, shortcut `D`) owns the fold-away box (`<details>` +
`<summary>`). The summary line comes along through `parts`, so it is never
registered separately — and `parts` is a record, not an array.

```ts
parts: { summary: { holds: 'inline' } }
```

Press the button and the blocks the selection covers are wrapped into a new
fold-away box with an empty summary line at the front. Press Enter in the summary
line and you move down into the contents (the summary itself never splits).

**The editor draws it exactly as it will be stored.** A box saved closed is closed
in the editor too, and the triangle folds and unfolds it right there — that press
is what changes the stored value (`o`). Fold it while the caret is inside and the
caret is moved out of the box.

::: tip There is no context row
There used to be two buttons, **save it open** and **save it closed**. Back when
the editing view always drew the box open, that was the only way to say which way
it would be stored. Now the view draws the stored value and the triangle changes
it, so those buttons were saying the same thing twice and were removed.
:::

## Usage

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
