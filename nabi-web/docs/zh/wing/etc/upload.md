---
title: 文件上传
description: 将文件传输连接到服务的上传器。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 文件上传

把文件选择、拖放，以及只包含文件的粘贴操作连接到上传流程。本页 demo 不会把文件发送到服务器；在真实服务中，必须连接一个接收文件并返回 URL 的上传器。

要把上传结果插入为图片块，需要图片 wing。要把其他文件插入为附件链接，需要链接 wing。如果服务同时接受两种格式，请明确选择两个 wing。上传进行期间编辑器会被锁定，成功上传的文件会作为一个 undo 步骤一起插入。

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

如果只选择 `upload`，它会自动补上图片或链接依赖中缺少的一个。传输通过 `mountUpload()` 连接，编辑画面中的进度 UI 通常通过 `mountUploadView()` 连接。如果服务器返回 HTTPS URL，就不需要本地 URL 选项。

## 服务器 API 约定

NABI NOTE 不会自行把文件发送到你的服务器。`uploader` 函数负责把一个文件发送到服务器，并在成功时只返回一个公开或需要认证的 `https:` URL。最简单的 API 约定如下。

```text
POST /api/uploads
Content-Type: multipart/form-data
Field name: file

Success: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Failure: 4xx or 5xx response
```

服务器不能只信任浏览器发送的原始文件名、扩展名或 MIME 值。先检查认证和权限，在流式处理时限制文件大小，并检查真实文件类型。保存名称应由服务器生成。图片需要时应重新编码或生成缩略图。如果上传文件不应被所有人下载，请返回需要认证的下载路径，而不是公开 URL。

| 服务器检查项 | 原因 |
| --- | --- |
| 已登录用户和上传权限 | 防止写入其他用户的存储空间 |
| 单文件大小和总请求大小 | 防止内存和存储耗尽 |
| 允许的真实 MIME 类型和扩展名 | 阻止改名后的可执行文件 |
| 随机保存名和隔离存储 | 防止路径操纵和覆盖已有文件 |
| 响应 URL 的访问和过期策略 | 防止私有文件仅凭 URL 暴露 |

客户端的 `extensions` 和 `maxFileSize` 只是给用户快速反馈的第一步。服务器端也必须设置同样的限制。

## 在浏览器中连接上传器

下面的例子是 NABI NOTE 期望的真实连接方式。它使用 `XMLHttpRequest`，因为浏览器标准 `fetch()` 不提供上传进度。只返回服务器响应中的 `url`；图片会变成图片块，其他文件会变成附件链接。

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
  { locale: 'zh' },
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
  locale: 'zh',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'zh' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'zh',
})
```

连接 `fileSink: upload.take`，让拖放和只包含文件的粘贴操作进入上传流程。上传 wing UI 会把文件选择按钮的结果传给 `upload.take()`。上传进行期间编辑器会被锁定，每批成功上传的文件会作为一个 undo 步骤插入。`upload.cancel()` 或 `uploadView` 中的取消按钮会通过 `AbortSignal` 中止进行中的请求。

## 失败和清理

如果服务器返回错误响应，或 `uploader` 返回 `null`，该文件不会插入文档。同一批中的其他文件会继续处理。如果超过总大小限制，整批都不会开始。关闭画面时，请按创建顺序的反方向 unmount。

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

仅在开发期间，可以使用 `blob:` URL 立即预览。此时需要在编辑器组装、图片 wing 和上传 wing 中都打开 `allowLocalUrls: true`。如果真实服务器上传返回 HTTPS URL，不启用这个选项更安全。

## CSS 样式

完成上传的普通文件会通过链接 wing 显示为 `a[data-nabi-file]`。如果只想改变发布页面中的附件外观，请使用这个选择器。

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

图片上传结果遵循图片 wing 的 CSS。上传进度只出现在编辑页面中，因此发布页面 CSS 不需要创建进度状态。
