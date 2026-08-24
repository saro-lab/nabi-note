---
title: 上传文件
---

# 上传文件

## 说明

文件上传由三个模块配合完成：

1. **`uploadWing`**——在工具栏上添加一个文件选择按钮。上传的结果会以图片或文件链接节点插入文档，所以**必须同时注册 `imageWing` 或 `linkWing`**。两者都没注册的话，会在初始化时抛出异常。
2. **`mountUpload({ … })`**——接住通过拖放、剪贴板粘贴、工具栏选择文件流入的文件，并交给主机的 `uploader` 函数。
3. **`mountUploadView({ … })`**——把上传进度占位 UI 画在屏幕上。

::: warning 剪贴板粘贴时的文件上传处理规则
如果剪贴板数据中**混有文字或 HTML**（`text/html` 或 `text/plain`），就会走普通的文字/Markdown 粘贴流程，而不是文件上传。只有剪贴板粘贴内容**只包含文件数据**时，才会调用上传流程。（拖放文件附件始终走上传流程。）
:::

`uploader` 函数的签名是 `(task) => Promise<{ uri: string } | null>`。服务器上传成功时返回 `{ uri }` 对象，失败时返回 `null`。可以通过 `task.onProgress(0~100)` 回调更新上传进度，并通过 `task.signal` 处理取消信号。

文件扩展名与容量限制选项：`extensions`、`maxFileSize`、`maxTotalSize`（省略则不限制）。不符合条件的文件会传给 `onReject` 回调。

## 上传完成后文档如何渲染

- **图片文件**：以 `imageWing` 的 `<img>` 块对象插入。
- **一般附件**：以 `linkWing` 的文件下载链接（`<a data-nabi-file="pdf" href="...">`）插入。附件的显示文字会按语言生成为"附件"，把光标放在链接上，即可在上下文工具栏里自由修改显示名称。

## 使用示例

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

// 上传翅膀需要同时注册图片或链接翅膀
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// 挂载上传进度 UI 视图
const view = mountUploadView({ nabi, surface, locale: 'zh' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'zh',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // 在这里实现真正向后端服务器上传文件的逻辑
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

## 演示

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
