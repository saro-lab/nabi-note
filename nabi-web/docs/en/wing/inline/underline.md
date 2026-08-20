---
title: Underline
---

# Underline

## Description

`underlineWing` is the owner (claim) of `<u>`.

- The only tag it accepts is `<u>`, and on the way out it is always `<u>`. Not one
  attribute survives. **`<ins>` is not accepted** — its shell is stripped and only
  the text remains. Unlike bold (`<b>`, `<strong>`) or strikethrough (`<s>`,
  `<strike>`, `<del>`), this mark takes no synonym.
- The hint-mode shortcut is `U` and the accelerator is `Ctrl`/`⌘`+`U` (`mod+u`).
- Pressing it with text selected is a toggle.
- Leave the wing unregistered and `<u>` is stripped of its shell and drops to
  plain text.
- Underline and link may look alike on screen, but they are separate marks owned
  by different wings (`a`) — the same text can carry both.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
