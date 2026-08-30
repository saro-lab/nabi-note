---
title: Danh sách kiểm tra
description: Danh sách lưu trạng thái hoàn thành cùng với tài liệu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Danh sách kiểm tra

Đây là danh sách có trạng thái hoàn thành. Trong đoạn trống, nhập Space sau `[ ]` hoặc `[x]`, hoặc tạo từ thanh công cụ, rồi nhấn hộp kiểm để đổi trạng thái.

Trạng thái đã kiểm được lưu cùng tài liệu như thuộc tính của mục. Khi tách một mục, trạng thái kiểm đi theo mục còn chữ thay vì mục trống phía trước, nên trạng thái không bị đảo ngay cả khi bạn tách công việc đã hoàn thành làm hai.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
