---
title: Gạch ngang
description: Hiển thị gạch ngang trên giá trị đã bỏ hoặc nội dung trước khi thay đổi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Gạch ngang

Kẻ một đường qua giữa chữ được chọn. Dùng để giữ lại cách diễn đạt đã sửa hoặc nội dung không còn hiệu lực mà không xóa chúng. Áp dụng lại cho cùng vùng chọn sẽ bỏ định dạng.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
