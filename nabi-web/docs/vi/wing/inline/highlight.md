---
title: Đánh dấu
description: Tô màu đánh dấu đã cho phép phía sau chữ được chọn.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Đánh dấu

Tô màu đánh dấu phía sau chữ được chọn. Dữ liệu lưu chỉ giữ tên màu được cho phép thay vì giá trị màu CSS tùy ý, vì vậy bạn có thể tách kiểu hiển thị khỏi dữ liệu tài liệu.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

Nếu bỏ qua `values`, các màu `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` được dùng. Khi thu hẹp danh sách, màu không đăng ký sẽ không được giữ cả trong tài liệu đã tải.

## Kiểu CSS

Tài liệu chỉ lưu tên màu. Thay đổi màu trong trình soạn thảo và trang xuất bản bằng biến CSS.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Khi đổi nhiều màu cùng lúc, bạn có thể đổi không khí của dịch vụ mà vẫn giữ nguyên tên màu trong tài liệu.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
