---
title: Nghiêng
description: In nghiêng chữ đã chọn để phân biệt với nội dung chính.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nghiêng

Hiển thị chữ đã chọn bằng chữ nghiêng. Phù hợp để tách nhẹ khỏi nội dung chính, như tên tác phẩm hay từ nước ngoài; nhấn lại trên phạm vi đã nghiêng để bỏ định dạng.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
