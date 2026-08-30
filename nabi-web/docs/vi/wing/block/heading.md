---
title: Tiêu đề
description: Đổi đoạn văn thành tiêu đề và chọn cấp.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tiêu đề

Đổi đoạn văn thành tiêu đề và chọn cấp của nó. Bật tiêu đề trên thanh công cụ rồi chọn từ H1 đến H6, hoặc trong đoạn trống nhập Space sau `#` đến `######`.

Tiêu đề không phải loại khối riêng mà là thuộc tính được lưu trên đoạn văn. Nhấn lại tiêu đề sẽ trở về đoạn văn thường, vì vậy bạn có thể chỉ thay đổi cấp mà vẫn giữ cấu trúc nội dung.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
