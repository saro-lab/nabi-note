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

`mode: 'modal'` opens a window over a full-page translucent backdrop. `mode: 'inline'` opens near the tool button on desktop and fills the screen on mobile. Mobile behavior is determined by viewport width and `--nabi-mobile-breakpoint`; crossing that threshold while an `inline` panel is open closes it.

Both modes provide only an empty `root`, with no title, inputs, or buttons. Add your HTML or UI in `render`, connect the close button to `close()`, and connect image selection to `insertImage(url, 'pointer')`. Existing function entries (`img: renderer`) retain their display behavior.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` is a function you implement in your service. It synchronously creates your UI inside the supplied `root` and returns a cleanup function. Connect `signal` to asynchronous work such as loading an image list or uploading, and pass the selected image URL to `onSelect`. This API does not transfer files; the existing image URL policy still applies.

`insertImage(src, by?)` is equivalent to `run('insertImage', { src }, by)`, including its return value and selection restoration rules. Omitting `by` uses `'keyboard'`. Do not make `render` an `async` function.

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
