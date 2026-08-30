---
title: YouTube
description: 在文档中嵌入 YouTube 视频并调整宽度。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

接受 YouTube 视频 URL 或视频 ID，并把它转换为嵌入块。文档只保存 11 个字符的视频 ID 和宽度，不保存完整 URL；新视频会以 70% 宽度居中开始。

宽度从固定档位中选择，对齐方式保存在包裹视频的段落上。在编辑器中，第一次点击会选中视频；选中后再次点击可以播放。要修改地址，请删除视频后重新插入。

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS 样式

用 `.nabi-content iframe` 改变视频的边框或圆角。不要改变保存的宽度或对齐方式。

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

包会使用 `aspect-ratio`、width 和对齐 margin 来保持视频尺寸正确，因此不要覆盖它们。
