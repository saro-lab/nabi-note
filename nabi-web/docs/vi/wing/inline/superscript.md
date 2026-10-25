---
title: Chỉ số trên
description: Hiển thị chữ nhỏ trên đường cơ sở, như chú thích và số mũ.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chỉ số trên

Hiển thị chữ được chọn với cỡ nhỏ hơn bên trên đường cơ sở. Có thể dùng cho số mũ hoặc dấu chú thích cuối trang và chỉ áp dụng cho vùng được chọn.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
