---
title: Strikethrough
---

# Strikethrough

## Description

`strikeWing` is the owner (claim) of `<s>`. Use it for a value that has been
struck but is worth leaving in place.

- On the way in it accepts all three of `<s>`, `<strike>` and `<del>`; on the way
  out it is always `<s>`. Not one attribute survives — not even the timestamp on
  `<del datetime="…">`.
- The hint-mode shortcut is `S`. **There is no accelerator** — unlike bold, italic
  and underline in the same `emphasis` group, no `Ctrl`/`⌘` combination is bound
  to it.
- Pressing it with text selected is a toggle.
- Leave the wing unregistered and `<s>` is stripped of its shell and drops to
  plain text.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
