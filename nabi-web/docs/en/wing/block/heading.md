---
title: Heading
---

# Heading

## Description

A single `headingWing` (id `h`) carries all six levels. A heading is not a node of
its own but **an attribute of the paragraph** — the stored value is
`{"w":"p","a":{"h":2}}`, and on the way out it becomes `<h2>`.

Because the paragraph itself becomes the heading, other paragraph attributes such
as alignment and drop cap apply alongside it (`<h2 data-nabi-align="c">`).

## One toolbar button, the level from the context toolbar

**There is only one toolbar button, `H`.** Press it in a paragraph and you get a
heading 1; with the caret inside a heading, the fields `Heading` and `H1`–`H6`
appear on the context toolbar — the level you are on shows as the pressed field,
and pressing another moves you to that level. Press `Heading` and you are back to
a paragraph.

Type as many `#` as the level (`##` for level 2) on an empty line and press space
and it becomes a heading at that level automatically — the `#` and the space you
typed are removed.

## Usage example

The level picker is drawn by `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

You can also apply it directly with a command.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // to a level 2 heading
nabi.applyCommand('setHeading', { value: 2 })  // the same level again — back to a paragraph
```

Apply it across a selection of several paragraphs and it applies to **every
paragraph** the selection touches. Lumps that take up a paragraph's place, such as
tables and lists, are skipped — a heading is an attribute of a text paragraph.

## Demo

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
