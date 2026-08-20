---
title: Align
---

# Align

## Description

**One** `alignWing` (id `align`) carries all three of left, centre and right. It
is a constant, not an `align()` factory, and it puts one button on the toolbar per
value. What it writes is the `a` paragraph attribute, which goes out as
`data-nabi-align`.

- It is a **paragraph attribute**: the tag is left alone and only the attribute is
  added, as in `<p data-nabi-align="c">` — the values are `l`, `c` and `r`.
- **It applies to paragraphs and headings.** `<h2 data-nabi-align="c">` works
  too, because a heading is a line of text like any other — a heading is itself
  just another attribute (`h`) on the same paragraph, so the two sit side by side.
- Only one value stands at a time. Press centre on a left-aligned paragraph and
  the left value drops as the centre one lands. Press the value already on and the
  attribute comes off entirely, back to the default alignment.
- **Enter passes the alignment to both halves.** Split a paragraph and both come
  out carrying the same alignment — unlike the heading (`h`), which is dropped from
  whichever half ends up empty, and the drop cap (`dc`), which follows only one
  side. Alignment has no such exception.
- The three are **three buttons on one wing** (`buttons`) — they cannot be turned
  on and off separately. Put the single `alignWing` in the wings array.
- **It is the one paragraph attribute that stays on a wrapper paragraph.** Every
  other paragraph attribute hides its button when the caret is on a paragraph
  holding a lump; alignment does not, because a lump's alignment is carried by the
  wrapper paragraph rather than by the lump. A centred image *is* an image inside a
  centred paragraph.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
