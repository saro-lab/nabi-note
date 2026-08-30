---
title: Cỡ chữ
description: Thay đổi cỡ chữ trong các mức được cho phép.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Cỡ chữ

Thay đổi mức cỡ chữ đã chọn. Khi chọn một phạm vi, nó áp dụng cho phạm vi đó; khi chỉ có con trỏ, nó thay đổi cỡ chữ của đoạn hiện tại. Dữ liệu lưu chỉ giữ các mức được cho phép, không giữ giá trị tùy ý như `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

Nếu bỏ qua `values`, các mức `xs`, `sm`, `lg`, `xl` được dùng. Khi thu hẹp danh sách, các mức khác có trong tài liệu cũ cũng bị xóa khi tải.

## Kiểu CSS

Bạn có thể thay đổi cỡ bằng bộ chọn mức đã lưu như `.nabi-content [data-nabi-size="xs"]`. Không tạo mức tùy ý không có trong tài liệu; chỉ điều chỉnh CSS trong `values` đã đăng ký.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Giữ chênh lệch cỡ giữa các mức nhất quán để ý nghĩa tác giả chọn trong trình soạn thảo vẫn được duy trì trên trang xuất bản.
