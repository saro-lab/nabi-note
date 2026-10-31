---
title: 链接
description: 连接安全的网址，并显示上传附件。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 链接

选中文字后为它附加地址。如果没有选择文字就输入地址，地址本身会作为链接文字插入。输入 `http://` 或 `https://` 地址后按 Space 或 Enter，也会自动变成链接。

链接只保存 `http:`、`https:`，以及以 `.` 或 `/` 开头的同站路径。像 `javascript:` 或 `//example.com` 这样无法明确识别 origin 的地址会被拒绝。上传生成的附件链接还会保存文件信息，不能像普通链接一样手动创建。

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## 粘贴 URL

如果去掉首尾空白后的全部粘贴内容是有效的 `http://` 或 `https://` URL，就会立即作为链接插入。句子中的 URL、包含多个 URL 的文本以及相对路径仍按现有粘贴方式处理。在代码块或未启用链接 wing 的编辑器中，内容保持为文本。从编辑器复制的有效内部剪贴板数据优先处理，以保留原有格式。

可以通过 `mountSurface()` 的 `onPasteUrl` 回调设置链接的显示文字。

| 参数 | 值 |
| --- | --- |
| `url` | 去掉首尾空白后的完整 URL |
| `isSameOrigin` | URL 的协议、主机和端口是否与编辑器所在文档的源相同 |
| `path` | 以 `/` 开头的路径，包含查询字符串和片段。例如：`/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

返回包含非空白字符的字符串时，该字符串会作为显示文字。如果没有回调，或回调返回空值、非字符串值或发生错误，则继续显示粘贴的 URL。返回的字符串不会被解释为 HTML，也不会改变链接地址。

回调也支持 `async` 函数和 Promise。等待响应时会立即插入 URL 链接；之后收到有效结果时，只更新该链接的显示文字。如果期间链接已被修改或删除、加载了新文档，或 surface 已卸载，则忽略迟到的结果。

## CSS 样式

普通链接用 `.nabi-content a` 设置样式，附件链接用 `.nabi-content a[data-nabi-file]` 另行设置。

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

附件链接的 `::before` 和 `::after` 用来显示文件图标和扩展名，所以通常不要替换或移除它们的 `content`。
