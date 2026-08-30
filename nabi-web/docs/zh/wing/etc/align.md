---
title: 对齐
description: 改变段落和对象块的水平对齐方式。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 对齐

将当前段落或选中范围内的段落设为左对齐、居中或右对齐。图片、视频、表格等位于段落内部的对象，会通过包裹它们的段落来对齐。

对齐是段落属性，不是文字格式。代码块会从对齐中排除，因为缩进本身在代码中有意义。

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
