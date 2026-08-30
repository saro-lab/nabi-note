---
title: 清除格式
description: 清除选区中的文字格式和段落格式。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 清除格式

一次性清除选中范围内的文字格式。注册的默认 mark，例如加粗、颜色、字体，以及标题、对齐、首字下沉等段落属性都会包含在内。快速按两次 Esc 也会执行同样的操作。

它不会把列表、表格、引用或图片等文档结构变成纯文本。图片和视频的外部对齐方式，以及上传生成的附件链接，会保持原样。

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

要清除的格式 wing 本身也必须被选中，否则无法移除它的格式。
