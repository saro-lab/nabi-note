---
title: Đường phân cách
description: Chèn đường ngang để chia mạch tài liệu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Đường phân cách

Đây là đường ngang ngăn cách mạch tài liệu. Trong đoạn trống, nhập ba dấu gạch nối trở lên rồi nhấn Enter, hoặc chèn từ thanh công cụ.

Đường phân cách là một khối độc lập không có chữ, nên không chứa định dạng như tiêu đề hay màu sắc. Chỉ dùng nó để tách các đoạn trước và sau.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
