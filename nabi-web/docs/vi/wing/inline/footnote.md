---
title: "Chú thích cuối trang"
description: "Liên kết phần giải thích bổ sung bằng số trong nội dung và danh sách ở cuối tài liệu."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chú thích cuối trang

Liên kết phần giải thích bổ sung bằng số trong nội dung và danh sách ở cuối tài liệu.

Nhập nội dung bằng nút chú thích trên thanh công cụ để chèn chú thích tại con trỏ. Nếu đang chọn văn bản, chú thích được chèn ở cuối vùng chọn và giữ nguyên văn bản. Số không được lưu mà được đánh tự động theo thứ tự tài liệu.

Nhấn số trong nội dung để sửa chú thích ở hàng thuộc tính. Dùng công cụ xóa hoặc nhấn Backspace hay Delete hai lần cạnh chú thích để chọn rồi xóa. Danh sách bên dưới chỉ đọc và biến mất khi không còn chú thích.

Trong bản xem trước và trang đã xuất bản có kết nối viewer, di chuột lên số, nhấp hoặc chạm để đọc nội dung. Chỉ chấp nhận một dòng văn bản thuần, hiển thị bằng phông không chân với kích thước bằng 0,875 lần cỡ chữ cơ bản của nội dung. HTML được hiển thị nguyên dạng văn bản.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
