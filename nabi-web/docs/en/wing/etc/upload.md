---
title: Upload
---

# Upload

## Description

Upload comes in three pieces — registering the wing alone does nothing.

1. **`uploadWing`** — puts the file-picker button on the toolbar. The wing itself
   creates neither `img` nor `a`: an uploaded file is committed as something the
   image or link wing draws, so **you must register `imageWing` or `linkWing`
   alongside it** for the result to land in the document. With neither, **it throws
   right where you register it** (never later).
2. **`mountUpload({ … })`** — the side that actually receives the files and runs
   `uploader`. Drops, pastes and the picker button all flow here. **Skip this mount
   and the button is there but nothing happens.**
3. **`mountUploadView({ … })`** — the side that stands progress placeholders on
   screen. Uploads still work without it, but the screen says nothing while they run.

`uploader` has the shape `(task) => Promise<{ uri } | null>` — **a URI means
success, `null` means failure** and the placeholder is taken away. Report progress
with `task.onProgress(0–100)`, and stop when `task.signal` aborts.

The limits are `extensions`, `maxFileSize` and `maxTotalSize`, all optional (0 or
omitted means no limit). Files that get filtered out arrive at `onReject`.

## What is left behind

Images are committed as `imageWing` blocks, everything else as `linkWing`
attachment links.

- **An attachment is named by a localized label, not the file name** —
  "Attachment" in English. File names are usually too long to leave in a document,
  and above all the name has to be editable. Put the caret in the link and change
  it in [the name field of the context toolbar](../inline/link).
- **The extension stays as a marker** — `data-nabi-file="pdf"`. That value is taken
  from the real file name and the sheet draws it as a badge, so renaming the link
  does not lose it.
- A URI the link wing would refuse (a `blob:` address arriving without
  `allowLocalUrls` turned on, for instance) is demoted to the plain file name — the
  whitelist is never bypassed.

## What you see while it uploads

A temporary box stands in place while a file uploads. It lives only in the editor
DOM, never in the nabi tree, so not a character of it reaches the stored value.

- **Images** show a preview built from the file you picked, with a grid laid over
  it. Cells clear one by one as the progress climbs until the picture is sharp. The
  order the cells clear in is shuffled per file, so uploading several at once never
  repeats the same pattern.
- **Files that are not images** get a box with no grid — a 📎 clip and an
  "Attachment" label — with the extension alongside as an uppercase badge (`PDF`
  and so on). An image whose preview cannot be drawn falls here too.
- Progress rides on the box as `data-nabi-per` and the sheet draws it. Each box
  carries a cancel (×) button while it uploads, and editing is locked while the
  batch runs.

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

// Upload needs the image and link wings to leave a result behind — without them this throws right here
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// The side that stands the progress placeholders — build it first and wire it up below
const view = mountUploadView({ nabi, surface, locale: 'en' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'en',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // Put the code that really uploads to your server here. A URI means success, null means failure
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // Where the files picked by the toolbar's file button flow to
  onFiles: (files) => upload.take(files),
})
```

## Demo

This site has no server to upload to, so it only pretends — handing back the
`blob:` URL that `URL.createObjectURL()` made. The result lives inside this page
and nowhere else.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
