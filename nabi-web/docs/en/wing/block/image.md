---
title: Image
description: Insert an image URL and adjust width and alignment.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Image

Insert an image URL and adjust its width and alignment. By default, addresses are limited to `http:`, `https:`, or same-site paths, and a new image starts centered at 60% width.

Width is stored only in fixed steps, and alignment is stored on the paragraph that wraps the image. To use `blob:` or `data:image/...` previews, explicitly allow local URLs both in the image wing and in editor assembly. SVG data URLs are not allowed.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

This wing inserts an address into the document; it does not upload files. To send files to a server, connect the [upload wing](/en/wing/etc/upload).

## CSS Styles

Style images with `.nabi-content img`. Keep the stored width and alignment intact, and change only visual details such as borders or shadows.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Keep the default rules for `max-inline-size`, `block-size`, width, and alignment. Image size is stored in the document, so forcing a fixed CSS width can conflict with the width chosen by the author.
