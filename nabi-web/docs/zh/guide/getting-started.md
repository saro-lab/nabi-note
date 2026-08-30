---
title: 基本用法
description: 在浏览器中组装 NABI NOTE 编辑器，并保存、恢复文档的基本流程。
---

# 基本用法

本指南说明浏览器中的客户端渲染（CSR）编辑器：选择 wing，挂载编辑器和 UI，然后保存和恢复 NABI TREE JSON。

## 安装并添加基本标记

```bash
npm install nabi-note
```

编辑器和发布内容都加载同一份样式表。不要自己添加 `contenteditable`；它由 `mountSurface()` 管理。

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## 挂载编辑器

`allBasic()` 会选择不需要应用专用连接也能工作的官方 wing。上传、文件保存、文档 diff 等需要服务端连接的 wing，请按各自指南添加。

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'zh',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'zh',
  placeholder: '写点什么。',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'zh',
})
```

`locale` 控制工具栏和辅助文字；请把同一个值传给每个 UI mount。`placeholder` 只在空编辑器中显示。`onError` 接收命令和回调中隔离出来的失败。`undoLimit` 是 undo 记录数量，默认 200。`typingMergeMs` 是把连续输入合并为一个 undo 步骤的时间间隔；设为 `0` 时，每次插入都会分开记录。

每个编辑器都需要互不重叠的内容 root 和工具栏 root。在一个页面上有多个编辑器时，请通过 `surface` 为每个工具栏指定自己的编辑 surface，避免焦点和快捷键串到别的编辑器。

## 选择 wing

用 `use()` 和 `drop()` 只保留需要的功能。每个 wing 页面都会说明它接受的选项。

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'zh' })
```

如果想要更小的 bundle，可以只把需要的 wing，例如 `boldWing` 和 `imageWing`，作为数组传入。未知名称、无效选项和缺少的依赖会在创建编辑器时立即失败。

## 保存和读取

如果文档之后还要继续编辑，请把 `getJson()` 的输出保存为 NABI TREE JSON。`getHtml()` 用于发布输出。不要保存编辑器专用的 `getEditorHtml()` 结果。

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

使用 `setHtml()` 导入外部 HTML。浏览器编辑器已经提供 HTML parser，因此不需要 parser 选项。`setJson()` 和 `setHtml()` 在收到无效的非空输入时会返回 `false`，并保持当前文档不变。

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON 和 HTML 都是不可信输入。NABI NOTE 会通过已注册的 wing 及其允许规则读取它们，但这不能替代上传授权或你的服务安全策略。

## 常用 API

| 任务 | API |
| --- | --- |
| 创建编辑器 | `createNabiWith`, `wings` |
| 挂载 surface 和工具栏 | `mountSurface`, `mountToolbar` |
| 保存和恢复 | `getJson`, `setJson`, `getHtml`, `setHtml` |
| 监听变更 | `nabi.onChange(listener)` |
| 撤销和重做 | `nabi.undo()`, `nabi.redo()` |
| 在服务器上渲染 HTML | `nabi-note/ssr` 的 `renderStoredHtml` |
| 添加发布页面行为 | `nabi-note/viewer` 的 `attachViewer` |
| 比较文档 | `nabi-note/diff` 的 `diffDocs` |

准确的类型和所有参数，请先查看已安装包的声明。自动化工具也可以使用[英文 API reference](https://nabi.saro.me/llms/api-reference.md)。

## 释放 mount

按创建顺序的反方向 unmount。不要直接修改编辑 root 的 `innerHTML`；请通过 `setJson()`、`setHtml()` 或 `applyCommand()` 等公开 API 修改文档。

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
