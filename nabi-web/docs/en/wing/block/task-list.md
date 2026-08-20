---
title: Checklist
---

# Checklist

## Description

`taskListWing` (name `tl`, shortcut `K`) shares the tag (`<ul>`) with Bullet list
but is a separate implementation — on the way out `data-nabi-list="task"` says that
this is a checklist, and `data-nabi-checked` on each item carries its checked state.

The item comes along through `parts` — a record, not an array.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

In the saved value the check is `ck`, and its only value is `1` — "off" is not `0`
but **the key being absent altogether**. On the way out that unfolds into
`data-nabi-checked="true"` / `"false"`.

Press the button and the block the caret sits in (or every block the selection
covers) is wrapped into a checklist. Typing `[ ] ` or `[x] ` (case does not matter)
at the start of a line gets the same result, and which of the two you typed decides
whether the item starts out checked. The line does not have to be empty, and it
only fires on the first line of a paragraph.

The checkbox is not an `<input>` but a marker drawn in CSS — put a real input
inside `contenteditable` and the caret gets tangled. A checked box is a white ✕ on
an accent-coloured tile, and its line goes muted with a strikethrough.

**The place that toggles it is the box itself** — you have to press the narrow band
at the start of the item (about one character wide); press the text and you just
get the caret. In right-to-left text that band sits on the other side. This is
carried by the wing's own `attach`, so **there is nothing extra to mount.**

Indenting and outdenting with `Tab` / `Shift+Tab`, and ending the list with Enter
on an empty item, work as they do for [Bullet list](./bullet-list).

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
