---
title: Typeface
---

# Typeface

## Description

`typefaceWing` (name `tf`) is an **inline value mark**. It is a ready-made
constant — drop it in the array and you are done, with no options to pass. On the
way out it is drawn as `<span data-nabi-typeface="serif">`.

The values are the four in `TYPEFACES` — `sans`, `serif`, `mono`, `cursive`.

- **It holds no font names at all.** What you pick is a **generic family**, and
  which font actually appears is decided by the values the host puts on the four
  tokens `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono` and
  `--nabi-font-cursive`.
- **One wing** holds all four values. The place you pick from is a `select` of four
  fields on the context toolbar, and a single toolbar button is the way in —
  pressing it applies `serif`.
- **Text with nothing applied wears `--nabi-typeface-base`.** That token is the
  editor's ground typeface, and left alone it follows `--nabi-font`. There is no
  separate field for "default" — **pick the family already on and it comes off**,
  returning to that ground.
- **The fields are drawn in the face they name.** The serif field is set in serif,
  the monospace field in monospace, so you can see what you are picking without
  knowing the names.
- **With just a caret it applies to the whole paragraph.** In a paragraph with no
  text at all it is armed instead, and the next character you type comes out in
  that face.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

The fonts the host lays on are one place in CSS. Stack several fonts on one family
and the browser walks the list per character, drawing each with the first font that
has it — so whichever language gets typed in, the family keeps its shape.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## Demo

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
