---
title: Kiểu chữ
description: Áp dụng nhóm kiểu chữ cho chữ hoặc đoạn văn đã chọn.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kiểu chữ

Áp dụng nhóm kiểu chữ cho chữ đã chọn. Khi chọn một phạm vi, chỉ phạm vi đó thay đổi; khi chỉ có con trỏ, nó áp dụng cho chữ trong đoạn hiện tại. Tệp phông thực tế và `font-family` do CSS của dịch vụ xác định.

Các nhóm mặc định là `sans`, `serif`, `mono`, `cursive`. Đặc biệt, với dịch vụ có tiếng Hàn, nên tự xác định phông nào kết nối với mỗi nhóm.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Nếu bỏ qua `values`, tất cả nhóm mặc định được dùng. Chỉ các giá trị đưa vào `values` mới được cho phép trong tài liệu.

## Kiểu CSS

Tài liệu chỉ lưu tên nhóm, còn CSS xác định tệp phông. Thay đổi biến trên cùng vùng chứa của trình soạn thảo và trang xuất bản.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Nếu dùng phông web, trước hết bạn cũng cần tải các tệp phông đó. `cursive` thường không có phông hỗ trợ tiếng Hàn, vì vậy nên cung cấp nó sau khi chỉ định phông thực sự dùng trong dịch vụ.
