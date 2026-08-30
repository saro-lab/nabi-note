---
title: Danh sách đầu dòng
description: Liệt kê nhiều mục không theo thứ tự.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Danh sách đầu dòng

Đây là danh sách liệt kê nhiều mục không theo thứ tự. Trong đoạn trống, nhập Space sau dấu `-` hoặc chuyển đổi bằng thanh công cụ. Bạn cũng có thể gộp các đoạn đã chọn thành danh sách cùng lúc.

Trong danh sách, dùng Tab để thụt vào một cấp và Shift+Tab để thụt ra. Enter tạo mục tiếp theo; nhấn Enter thêm lần nữa trên mục trống để kết thúc danh sách.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
