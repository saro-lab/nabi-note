---
title: Divider
---

# Divider

## Description

`dividerWing` (id `hr`) handles the horizontal divider (`<hr>`). It is a `place: 'void'`
object with no text inside it — press Backspace or Delete right before or after the
divider and the whole divider block is deleted.

Click the button and the divider is inserted **wrapped in a dedicated wrapper paragraph
(`<div data-nabi-p>`)**. The caret lands right after the divider.

Where it lands depends on the state of the paragraph the caret was in:

| Where the caret was | Result |
|---|---|
| a paragraph with text | the new divider is inserted **after** that paragraph |
| an empty paragraph | that empty paragraph **is replaced** by the divider (no stray blank line) |

When an empty paragraph is replaced, the text alignment it was carrying is preserved.

Type three or more hyphens on an empty line and press Enter (`---` + Enter) and it
converts to a divider automatically.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
