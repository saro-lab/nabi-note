---
title: Xóa định dạng
description: Bỏ định dạng chữ và đoạn văn trong vùng đã chọn.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Xóa định dạng

Bỏ đồng thời định dạng chữ trong vùng đã chọn. Đối tượng gồm các mark cơ bản đã đăng ký như đậm, màu, kiểu chữ, cùng thuộc tính đoạn văn như tiêu đề, căn chỉnh và chữ cái đầu đoạn. Bạn cũng có thể thực hiện thao tác này bằng cách nhấn Esc nhanh hai lần.

Nó không chuyển cấu trúc tài liệu như danh sách, bảng, trích dẫn và hình ảnh thành văn bản thuần. Căn chỉnh ngoài của ảnh, video và liên kết tệp đính kèm tạo bởi tải lên cũng được giữ nguyên.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Bạn cũng phải chọn các wing định dạng cần xóa thì mới có thể xóa định dạng đó.
