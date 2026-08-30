---
title: Màu chữ
description: Áp dụng tên màu đã cho phép cho chữ được chọn.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Màu chữ

Áp dụng tên màu cho chữ được chọn. Giá trị lưu không phải chuỗi màu CSS mà là tên đã cho phép; màu thực được xác định bằng biến CSS `--nabi-tc-<name>`. Vì vậy cùng một tài liệu có thể được điều chỉnh để dễ đọc trong giao diện sáng và tối.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

Nếu bỏ qua `values`, bảng màu mặc định (`green`, `coral`, `violet`, `amber`, `blue`) được dùng. Khi rút gọn danh sách, các màu khác không được chấp nhận cả trong lệnh lẫn khi tải.

## Kiểu CSS

Tài liệu chỉ lưu tên màu. Màu thực trong trình soạn thảo và trang xuất bản được xác định bằng biến CSS.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Hãy điều chỉnh màu chữ cùng màu nền để kiểm tra độ tương phản. Trong giao diện tối, bạn có thể gán giá trị khác cho cùng tên màu.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
