---
title: 斜体
description: 将选中的文字倾斜，以便与正文区分。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 斜体

将选中的文字显示为斜体。适合用来让作品名称、外语词汇等与正文略有区别。在已应用斜体的范围内再次点击即可取消。

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
