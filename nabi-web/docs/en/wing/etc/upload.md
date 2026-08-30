---
title: File Upload
description: Connect file transfer to your service uploader.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# File Upload

Connect file selection, drag and drop, and paste operations that contain only files to an upload flow. The demo on this page does not send files to a server; in a real service, you must connect an uploader that receives a file and returns a URL.

To insert upload results as image blocks, you need the image wing. To insert other files as attachment links, you need the link wing. If your service accepts both formats, select both wings explicitly. While upload is running, the editor is locked, and successful files are inserted together as one undo step.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

If you select only `upload`, it automatically supplies whichever one of the image or link dependencies is missing. Transfer is connected with `mountUpload()`, and the editing-screen progress UI is usually connected with `mountUploadView()`. If the server returns HTTPS URLs, the local URL option is not needed.

## Server API Contract

NABI NOTE does not send files to your server by itself. The `uploader` function sends one file to the server, and on success returns only a public or authenticated `https:` URL. The simplest API contract looks like this.

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

The server must not trust only the original file name, extension, or MIME value sent by the browser. Check authentication and permission first, limit file size while streaming, and inspect the real file type. Create the stored name on the server. For images, re-encode them or create thumbnails when needed. If uploaded files should not be downloadable by everyone, return a download path that requires authentication instead of a public URL.

| Check on the server | Why |
| --- | --- |
| Logged-in user and upload permission | Prevents writing into another user's storage |
| Per-file size and total request size | Prevents memory and storage exhaustion |
| Allowed real MIME type and extension | Blocks executable files with renamed extensions |
| Random stored name and isolated storage | Prevents path manipulation and overwriting existing files |
| Response URL access and expiry policy | Prevents private files from being exposed by URL alone |

Client-side `extensions` and `maxFileSize` are only the first step for fast feedback to the user. Put the same limits on the server as well.

## Connecting the Uploader in the Browser

The example below is the real connection NABI NOTE expects. It uses `XMLHttpRequest` because the browser's standard `fetch()` does not provide upload progress. Return only the `url` from the server response; images become image blocks, and other files become attachment links.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'en' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'en',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'en' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'en',
})
```

Connect `fileSink: upload.take` so drag and drop, and paste operations that contain only files, enter the upload flow. The upload wing UI passes file selection button results to `upload.take()`. While upload is running, the editor is locked, and successful files from each batch are inserted as one undo step. `upload.cancel()` or the cancel button in `uploadView` aborts in-progress requests through `AbortSignal`.

## Failure and Cleanup

If the server returns an error response or the `uploader` returns `null`, that file is not inserted into the document. Other files in the same batch continue to be processed. If the total size limit is exceeded, the entire batch does not start. When closing the screen, unmount in the reverse order of creation.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

During development only, you can use `blob:` URLs for immediate preview. In that case, turn on `allowLocalUrls: true` in editor assembly, the image wing, and the upload wing. If real server uploads return HTTPS URLs, it is safer not to enable this option.

## CSS Styles

Completed ordinary files are shown through the link wing as `a[data-nabi-file]`. Use this selector when you only want to change the attachment look in the published view.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Image upload results follow the image wing's CSS. Upload progress appears only in the editing view, so the published view CSS does not need to create a progress state.
