---
title: Chỉ số dưới
description: Hiển thị chữ nhỏ dưới đường cơ sở, như trong công thức hóa học.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chỉ số dưới

Hiển thị chữ được chọn với cỡ nhỏ hơn bên dưới đường cơ sở. Phù hợp với ký hiệu cần chỉ số dưới, như công thức hóa học `H₂O`. Định dạng này không bổ sung khả năng tính toán công thức; hãy dùng để giữ nguyên cách viết ký hiệu.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
