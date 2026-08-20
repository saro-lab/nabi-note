---
title: Clear formatting
---

# Clear formatting

## Description

`clearFormatWing` is a **ready-made constant**. Drop it in the array and you are
done — there are no options to pass.

Being `place: 'tool'`, it stands no node of its own in the document. One command
(`clearFormat`) and one toolbar button is all of it.

- **The list it strips is nailed down in the core.** Eleven inline marks (`b`, `i`,
  `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) and three paragraph
  attributes (`h` heading, `a` alignment, `dc` drop cap). The host has no list to
  keep, and marks from wings you wrote yourself are **not stripped here**.
- **Select a range and press it** and the marks in that stretch, along with the
  attributes of every paragraph it touches, come off at once.
- **With just a caret it peels one layer at a time** — starting from the
  **innermost mark** at the caret, across the stretch that mark runs for. When
  there is no mark left to take off, that is when the paragraph attributes go.
- **Attachment links are never stripped** — a link (`a`) carrying a `file`
  attribute is untouchable everywhere, because stripping the shell would leave the
  attachment a dead line of plain text.
- **Alignment survives on a paragraph holding a lump.** On a wrapper paragraph
  around an image or a table, alignment (`a`) alone is not stripped — clearing
  formatting should not send the picture flying back to the left.
- When there is nothing to strip the command answers `null`, so no undo point piles
  up.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
