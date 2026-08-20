---
title: 上传文件
---

# 上传文件

## 说明

上传分成三块——光注册翅膀什么也不会发生。

1. **`uploadWing`**——往工具栏上挂一个选文件的按钮。这个翅膀自己既不造 `img`
   也不造 `a`——上去的文件是以图片、链接翅膀画出来的东西提交的，所以**必须把
   `imageWing` 或 `linkWing` 一起注册**，结果才留得进文档。两个都没有的话，
   **就在注册的那一刻抛异常**（不会晚点才炸）。
2. **`mountUpload({ … })`**——真正接住文件、跑 `uploader` 的是这一边。拖放、
   粘贴、选文件按钮全都流到这里来。**漏了这个 mount，按钮在也照样什么都不会
   发生。**
3. **`mountUploadView({ … })`**——把进度占位立到画面上的是这一边。没有它上传
   照样能成，只是跑着的时候画面什么都不说。

`uploader` 的形状是 `(task) => Promise<{ uri } | null>`——**答出地址就算成功，
`null` 就算失败**，占位随之撤走。用 `task.onProgress(0~100)` 报告进度，
`task.signal` 一中断就停止。

限制只有 `extensions`、`maxFileSize`、`maxTotalSize` 三个，全都可选（给 0 或
不给就是不限）。被挡下的文件走 `onReject`。

## 上去之后留下什么

图片以 `imageWing` 的块提交，别的文件以 `linkWing` 的附件链接提交。

- **附件的名字不是文件名，而是一个 i18n 名称**——中文里就是"附件"。文件名一般
  留在文档里太长，而且最要紧的是它得能改。改名字的办法是把光标放到那个链接上，
  在[上下文工具栏的名称框](../inline/link)里改。
- **扩展名以标记的形式留着**——`data-nabi-file="pdf"`。这个值是从真正的文件名
  里抽出来的，样式表把它画成一枚角标。改了名字，标记照样跟着走。
- 链接不接受的地址（没开 `allowLocalUrls` 却送来的 `blob:` 之类）会被降成纯
  文本的文件名——不会绕过白名单。

## 上传途中看得见什么

上传途中那个位置上会立起一个临时的盒子——它只在编辑器的 DOM 里，nabi-tree 里
没有它，所以存下来的值里一个字都不会留。

- **图片**会立刻显示用选中文件做出的预览图，上面盖一层格子。进度走到哪儿，格子
  就一格一格揭开、变得清晰。格子揭开的顺序每个文件都会打乱，一次上传好几张也
  不会重复同一种花样。
- **不是图片的文件**没有格子，只拿到一个立着 📎 和"附件"名称的盒子，扩展名会
  一起以大写角标（`PDF` 等）显示。画不出预览图的图片也会落到这里。
- 进度以 `data-nabi-per` 挂在盒子上，由样式表画出来。上传途中每个盒子上都立着
  取消（×）按钮，批次跑着的时候编辑是锁住的。

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

// 上传要有图片、链接翅膀才能留下结果——没有的话这里直接抛异常
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// 立进度占位的一边——先造好，下面接上
const view = mountUploadView({ nabi, surface, locale: 'zh' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'zh',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // 在这里放真正往服务器上传的代码。答出地址就算成功，null 就算失败
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
  // 工具栏选文件按钮选中的文件流向这里
  onFiles: (files) => upload.take(files),
})
```

## 演示

这个站点没有可以上传的服务器，只是装个样子，把 `URL.createObjectURL()` 造出来
的 `blob:` 地址原样还回去。结果只留在这个页面里面。

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
