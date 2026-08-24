---
title: Bold
---

# Bold

## Description

`boldWing` is the inline mark wing that handles bold formatting (`<b>`). Select text and press **B** on the toolbar, reach for it in hint mode (tap Shift twice, then `B`), or use the shortcut (`Ctrl`/`⌘`+`B`) to apply it.

- On the way in it recognizes both `<b>` and `<strong>`; on the way out it always comes out as the standard `<b>` tag.
- Run it with text selected and it toggles — if the selection is already bold it comes off, otherwise it goes on.
- Run the shortcut with just a caret and no selection, and bold is queued for the next text you type.
- Leave the wing unregistered and the `<b>` tag is stripped away automatically, leaving only the plain text inside.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
