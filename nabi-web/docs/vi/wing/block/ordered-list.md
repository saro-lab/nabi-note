---
title: Danh sách đánh số
description: Tạo danh sách đánh số cho các mục có thứ tự quan trọng.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Danh sách đánh số

Tạo danh sách đánh số cho các mục có thứ tự quan trọng. Trong đoạn trống, nhập số và dấu chấm như `1.` rồi nhấn Space, hoặc chuyển các đoạn đã chọn bằng thanh công cụ.

Số hiển thị được tính theo vị trí của mục, nên tự động nối tiếp khi bạn thêm hoặc thụt mục. Tính năng lưu số bắt đầu đã nhập để đếm từ một số tùy ý không được cung cấp.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
