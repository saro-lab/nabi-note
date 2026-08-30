---
title: Chỉ số dưới
description: Hiển thị chữ nhỏ dưới đường cơ sở, như trong công thức hóa học.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chỉ số dưới

Hiển thị chữ đã chọn nhỏ dưới đường cơ sở. Phù hợp với ký hiệu cần chỉ số dưới như `H₂O` trong công thức hóa học. Đây không phải định dạng bổ sung chức năng tính toán công thức, nên dùng khi cần giữ chính biểu diễn đó.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
