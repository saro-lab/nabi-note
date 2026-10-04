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

## Connect an image picker

Use `mountToolbar()` with `panels.img` to replace the image button's default URL prompt with your service's image picker. Keys are toolbar slot names; omitted tools retain their default prompts.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` is a function you implement in your service. It synchronously creates your UI inside the supplied `root` and returns a cleanup function. Connect `signal` to asynchronous work such as loading an image list or uploading, and pass the selected image URL to `onSelect`. This API does not transfer files; the existing image URL policy still applies.

Closing the panel or unmounting the toolbar aborts `signal` and calls the cleanup function. `run()` closes the panel and applies a command once at the selection captured when it opened. If the panel is already closed or the document content has changed since it opened, it returns `false` without executing the command.

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
