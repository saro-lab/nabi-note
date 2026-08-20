---
title: Bold
---

# Bold

## Description

`boldWing` is the owner (claim) of `<b>`. Select some text and press **B** on the
toolbar, or reach for it in hint mode (tap Shift twice, then `B`), and the range
turns bold.

- On the way in it accepts both `<b>` and `<strong>`; on the way out it is always
  a single `<b>`. Not one attribute survives — `class`, `style` and `data-*` fall
  off and only the tag remains.
- The hint-mode shortcut is `B` and the accelerator is `Ctrl`/`⌘`+`B` (`mod+b`).
- Pressing it with text selected is a toggle (`toggleMark`) — already bold all the
  way through and it comes off, otherwise it goes on. The wing declares no command
  of its own: its button is `action: { kind: 'mark' }`, which goes straight to the
  core's `toggleMark`.
- Leave the wing unregistered and `<b>` is stripped of its shell and drops to
  plain text (every unregistered tag ends this way — it is a rule of the whole of
  nabi).

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
