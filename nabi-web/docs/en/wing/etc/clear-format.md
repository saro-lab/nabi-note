---
title: Clear formatting
---

# Clear formatting

## Description

`clearFormatWing` is a tool wing (`place: 'tool'`) that strips applied formatting and resets the text to plain.

- **What it strips**: 11 inline marks (`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) and 3 paragraph attributes (`h` heading, `a` alignment, `dc` drop cap).
- **Run it with a range selected** and every inline mark and paragraph attribute inside that range comes off at once.
- **Run it with just a caret** and it peels off marks one at a time, starting from the innermost mark at the caret — once there is no mark left to peel, the paragraph attributes reset.
- **Attachment links (`data-nabi-file`) are protected** — unlike an ordinary web link, a file-attachment link is excluded from clearing, so the file information survives.
- **Alignment on the wrapper paragraph of a block object** (an image, a table, etc.) **is kept.**

## Two taps of <kbd>Esc</kbd>

Besides the toolbar button, tapping <kbd>Esc</kbd> **twice within 350ms** fires the clear-formatting command immediately.

- Whether there is a text selection or just a caret, it strips formatting in stages exactly as pressing the toolbar button would.
- <kbd>Esc</kbd>'s priority is handled as the lowest of all — even if the first tap armed a mark-escape, the second tap still fires clear formatting correctly.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
