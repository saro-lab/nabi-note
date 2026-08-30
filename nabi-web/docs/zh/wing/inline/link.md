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
