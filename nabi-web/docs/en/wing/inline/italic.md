---
title: Italic
---

# Italic

## Description

`italicWing` is the owner (claim) of `<i>`. Use it for words in another grain —
a foreign term, a quoted phrase.

- On the way in it accepts both `<i>` and `<em>`; on the way out it gathers them
  into a single `<i>`. Not one attribute survives.
- The hint-mode shortcut (tap Shift twice) is `I` — caught by physical key
  (`KeyI`), so it works on a Korean keyboard layout too. The accelerator is
  `Ctrl`/`⌘`+`I` (`mod+i`).
- Pressing it with text selected is a toggle.
- Leave the wing unregistered and `<i>` is stripped of its shell and drops to
  plain text.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
