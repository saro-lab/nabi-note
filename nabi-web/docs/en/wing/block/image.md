---
title: Image
---

# Image

## Description

`imageWing` (id `img`) owns the image (`<img>`). Like `hr` and `youtube`, it is a
lump that holds nothing. Press the button and an address prompt appears.

An address gets through on its **scheme**, not its extension: `http:` and
`https:`, plus plain relative paths. Protocol-relative `//host/…` is refused, and
so is everything else — `javascript:` and friends never get near the document. An
image with no usable address is not an image at all, so it is dropped rather than
stored as a ghost.

The caret never goes inside an image, so clicking one selects the whole image and
brings up the context row.

| Control | What it does |
|---|---|
| Width | a slider over `30` `40` `50` `60` `70` `80` `90` `100` (per cent, `60` by default) |
| View | the picture alone, large — it changes nothing in the document |

**There is no alignment control here.** A lump's alignment belongs to the wrapper
paragraph that holds it, so it comes from the [Align](../etc/align) wing, whose
buttons stay live on a wrapper paragraph for exactly this reason. An image is
inserted into a centred wrapper paragraph by default.

On the way out the width lands on the picture and the alignment on the paragraph
wrapping it.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Alignment values are `l`, `c` and `r`. No inline `style` goes out. The actual shape of the picture is drawn by the sheet
that reads that attribute inside a `.nabi-content` with `nabi.css` linked. A width
outside the list is refused rather than snapped to the nearest step.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Turn `allowLocalUrls` on and `blob:` and `data:image/...` addresses are allowed
too — turn it on only for demos and upload scenarios that preview a file without a
server. It is off by default, and `data:image/svg` stays refused either way.

You can turn it on in two places — for the whole editor with
`createNabiWith(wings, { allowLocalUrls: true })`, or for the image wing alone with
`makeImageWing({ allowLocalUrls: true })`. `imageWing` is the ready-made constant
with it off.

When an image is broken (a dead address, an expired one, a blob that is gone) a
placeholder appears by itself — the wing carries that in its own `attach`, and
`mountSurface` wires up the `attach` of every registered wing. **There is nothing
extra to mount.** The marker is for the screen only and never survives into the
saved value.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

To leave a file received from an upload (a `blob:` address) open as it is:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
