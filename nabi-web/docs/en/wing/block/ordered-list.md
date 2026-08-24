---
title: Numbered list
---

# Numbered list

## Description

`orderedListWing` (id `ol`, shortcut `N`) owns `<ol>`. The item comes along through
`parts`, so `oli` is never registered separately.

```ts
parts: { oli: { holds: 'blocks' } }
```

Press the button and the block the caret sits in (or every block the selection
covers) turns into a numbered list; press it again and it reverts to an ordinary
paragraph. Press another list button and it switches to that kind immediately.

Typing `1. ` (a digit, a period, a space) at the start of a paragraph also converts
it into a numbered list automatically. The starting number is free to pick and is
recognized up to nine digits.

### Shortcuts and editing behavior

- Indenting/outdenting with `Tab`/`Shift+Tab`, ending the list with `Enter` on an
  empty item, and merging into the previous item with `Backspace` at the start of
  an item all work exactly as they do for [Bullet list](./bullet-list).
- The number of each item is rendered dynamically in the browser by the HTML `<ol>`
  tag, so inserting or deleting an item in the middle automatically recalculates
  the numbering.
- Nested list structures render safely nested through a wrapper paragraph
  (`<div data-nabi-p>`).

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
