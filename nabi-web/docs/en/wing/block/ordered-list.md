---
title: Numbered list
---

# Numbered list

## Description

`orderedListWing` (name `ol`, shortcut `N`) owns `<ol>`. The item comes along
through `parts`, so `oli` is never registered separately — and `parts` is a record,
not an array.

```ts
parts: { oli: { holds: 'blocks' } }
```

Press the button and the block the caret sits in (or every block the selection
covers) is wrapped into a numbered list; press it again and the wrapping comes off.
Press another list button and it changes into that kind.

Typing digits and a period at the start of a line and then a space (`1. `) gets the
same result. **Any number counts as a start, up to nine digits** (`1234567890. `
does not fire), and anything after the period stops it — `1.2 ` is not a list. The
line does not have to be empty: all that is measured is the line prefix in front of
the caret, and it only fires on the first line of a paragraph.

- Indenting and outdenting with `Tab` / `Shift+Tab`, ending the list with Enter on
  an empty item, and Backspace at the start of an item joining it into the one
  above all work exactly as they do for [Bullet list](./bullet-list).
- The numbers are not in the saved value — `<ol>` draws them, so the browser
  recounts on its own when you insert or delete an item.
- Nesting, too, is real markup and survives into the saved value as it stands.
  Because an item holds blocks, the text wears a paragraph and a nested list stands
  inside a wrapper paragraph.
- Attributes such as `start` and `type` do not survive, so a list that came in with
  `start="5"` counts from 1 again.

## Usage

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
