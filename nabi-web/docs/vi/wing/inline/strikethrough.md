---
title: Gạch ngang
description: Hiển thị gạch ngang trên giá trị đã bỏ hoặc nội dung trước khi thay đổi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Gạch ngang

Kẻ một đường qua giữa chữ đã chọn. Dùng khi muốn giữ lại thay vì xóa nội dung đã thay đổi hoặc không còn hiệu lực; áp dụng lại trên cùng phạm vi để bỏ.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
