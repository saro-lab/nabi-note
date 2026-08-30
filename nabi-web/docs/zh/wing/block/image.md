---
title: 图片
description: 插入图片地址，并调整宽度和对齐方式。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 图片

插入图片地址，并调整宽度和对齐方式。默认情况下，地址限制为 `http:`、`https:` 或同站路径，新图片会以 60% 宽度居中开始。

宽度只保存为固定档位，对齐方式保存在包裹图片的段落上。要使用 `blob:` 或 `data:image/...` 预览，需要在图片 wing 和编辑器组装处都明确允许本地 URL。不允许 SVG data URL。

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

这个 wing 只是把地址插入文档，并不会上传文件。要把文件发送到服务器，请连接[上传 wing](/zh/wing/etc/upload)。

## CSS 样式

用 `.nabi-content img` 设置图片样式。保持保存的宽度和对齐方式不变，只改变边框或阴影等视觉细节。

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

保留 `max-inline-size`、`block-size`、width 和对齐方式的默认规则。图片大小保存在文档中，因此强制设置固定 CSS 宽度可能会和作者选择的宽度冲突。
