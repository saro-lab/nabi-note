---
title: Nghiêng
description: In nghiêng chữ đã chọn để phân biệt với nội dung chính.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nghiêng

Hiển thị chữ được chọn ở dạng nghiêng. Cách này phù hợp để phân biệt nhẹ tên tác phẩm hoặc từ nước ngoài với phần thân bài. Nhấn lại trên vùng đã in nghiêng để bỏ định dạng.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
