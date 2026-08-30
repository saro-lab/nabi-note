---
title: Chỉ số trên
description: Hiển thị chữ nhỏ trên đường cơ sở, như chú thích và số mũ.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chỉ số trên

Hiển thị chữ đã chọn nhỏ trên đường cơ sở. Có thể dùng cho số mũ hoặc ký hiệu chú thích và chỉ áp dụng cho phạm vi đã chọn.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
