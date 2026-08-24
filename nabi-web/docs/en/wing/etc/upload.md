---
title: File Upload
---

# File Upload

## Description

File upload works through the integration of three modules:

1. **`uploadWing`** — adds a file-attach button to the toolbar. Because the uploaded result is inserted into the document as an image or file-link node, **`imageWing` or `linkWing` must be registered alongside it**. If neither is registered, it throws at initialization time.
2. **`mountUpload({ … })`** — receives files coming in through drag-and-drop, clipboard paste, or the toolbar's file picker, and hands them to the host's `uploader` function.
3. **`mountUploadView({ … })`** — renders the upload-progress placeholder UI on screen.

::: warning How a clipboard paste is routed to upload
If the clipboard data **contains any text or HTML** (`text/html` or `text/plain`), it goes through the normal text/Markdown paste pipeline instead of upload. The upload pipeline only fires when the clipboard paste carries file data alone. (A drag-and-drop file attachment always goes through the upload pipeline.)
:::

The `uploader` function has the signature `(task) => Promise<{ uri: string } | null>`. It returns a `{ uri }` object on a successful server upload, and `null` on failure. Report progress through the `task.onProgress(0–100)` callback, and handle cancellation through `task.signal`.

File extension and size limit options: `extensions`, `maxFileSize`, `maxTotalSize` (no limit if omitted). Files that don't pass are handed to the `onReject` callback.

## What the document renders after upload

- **Image files** are inserted as an `imageWing` `<img>` block object.
- **Other attachments** are inserted as a `linkWing` file-download link (`<a data-nabi-file="pdf" href="...">`). The attachment's display text is generated per locale as "Attachment," and can be freely renamed by placing the caret on the link and using the context toolbar.

## Usage example

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The upload wing needs the image or link wing registered alongside it.
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// Mount the upload-progress UI view
const view = mountUploadView({ nabi, surface, locale: 'en' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'en',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // Implement the logic that actually uploads the file to your backend server
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## Demo

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
