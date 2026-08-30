---
title: SSR 设置
description: 在服务器上安全地把保存的 NABI TREE 转为 HTML，并在浏览器中接回编辑器。
---

# SSR 设置

在服务器上只导入 `nabi-note/ssr`，不要导入浏览器 surface 或 UI。它会验证保存的 NABI TREE JSON，并把它转换为发布用 HTML 或可 hydrate 的编辑器 HTML。

## 渲染发布 HTML

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` 会验证并规范化 JSON 输入，然后返回发布 HTML。`null` 表示当前 registry 无法读取该输入。在发布页面中包含包 CSS，并给内容加上 `.nabi-content`。

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

只有在需要表格排序或代码高亮等交互功能时，才在浏览器中加入 `nabi-note/viewer` 的 `attachViewer()`。普通发布内容只需要 CSS。

## hydrate 预渲染的编辑器标记

要让编辑器从首屏开始显示，请在服务器上用 `renderStoredEditorHtml()` 渲染，并在浏览器 surface 中传入 `hydrate: true`。

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

服务器和浏览器必须使用同一份文档、同一顺序的 wing 声明，以及会影响 HTML 的相同选项。把服务器输出原样作为内容 root 的直接子节点插入，不要预先在该 root 上设置 `contenteditable`。如果结构不同，surface 会重新渲染新的编辑器 HTML。

## 也预渲染工具栏

`renderToolbarHtml()` 和 `renderViewToolsHtml()` 可以在服务器上预渲染工具栏控件。浏览器挂载时，如果 registry、locale 和分组顺序一致，会连接这些控件。不支持在工具栏 root 内放任意 host DOM。

SSR 期间不要使用 `injectSheets()` 这样的浏览器 API。请链接构建好的 `nabi-note/nabi.css` 文件，或把它包含在你的 CSS bundle 中。
