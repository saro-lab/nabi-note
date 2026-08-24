---
title: Image
---

# Image

## Description

`imageWing` (id `img`) owns the image element (`<img>`). Like `hr` and `youtube`, it
is a `place: 'void'` lump with nothing inside it. Click the toolbar button and an
image URL prompt appears.

**The URL is validated by protocol scheme, not by file extension.** Only `http:`,
`https:`, and relative paths are allowed — malicious schemes like `javascript:` and
protocol-relative addresses (`//example.com/a.png`) are filtered out. A dynamic API
URL that returns an image with no file extension is supported just fine.

The caret can never enter an image, so clicking one selects the whole image object
and brings up a dedicated context toolbar:

| Control | Description |
|---|---|
| Width | a slider adjusting width from `30%` to `100%` in 10% steps (default `60%`) |
| View large (lightbox) | enlarges the image to its original size in a modal popup |

Left/center/right alignment of an image is a property of the **wrapper paragraph
(`<div data-nabi-p>`)** that holds it, so you align it with the alignment buttons on
the main toolbar.

A newly inserted image is centered (`data-nabi-align="c"`) by default.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

It goes out as semantic attributes with no inline `style` — the actual size and
alignment are rendered by `nabi.css`.

### Allowing local URLs (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Set `allowLocalUrls: true` and local URLs in the `blob:` and `data:image/...`
formats are allowed too — useful for a local preview before a file upload, for
instance (default `false`).

If an image address is invalid, or a blob URL has expired and the image fails to
load, the wing's `attach` hook automatically shows a broken-image placeholder. It
works with no extra mount setup, and being a screen-only UI, it has no effect on
the saved data.

## Usage example

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

To allow `blob:` addresses, use the factory function:

```ts
makeImageWing({ allowLocalUrls: true })
```

## Demo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
