---
title: Đậm
description: Hiển thị chữ đã chọn bằng chữ đậm.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Đậm

Hiển thị chữ đã chọn bằng chữ đậm. Áp dụng lại trên cùng phạm vi để bỏ chữ đậm. Định dạng đậm được giữ cùng chữ trong tài liệu đã lưu.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
