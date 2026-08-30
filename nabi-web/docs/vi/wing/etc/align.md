---
title: Căn chỉnh
description: Thay đổi căn chỉnh ngang của đoạn văn và khối đối tượng.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Căn chỉnh

Căn trái, giữa hoặc phải cho đoạn hiện tại và các đoạn trong vùng chọn. Các đối tượng nằm trong đoạn như ảnh, video và bảng cũng được căn theo đoạn văn bọc chúng.

Căn chỉnh được lưu là thuộc tính đoạn văn chứ không phải định dạng chữ. Khối mã không nằm trong đối tượng căn chỉnh vì chính thụt lề của nó mang ý nghĩa.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
