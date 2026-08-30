---
title: Chữ cái đầu đoạn
description: Đặt chữ cái đầu đoạn lớn để mở đầu nội dung.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Chữ cái đầu đoạn

Đặt chữ cái đầu của đoạn lớn để các dòng còn lại chảy bên cạnh nó. Đây là định dạng ở cấp đoạn, nên không áp dụng bằng cách chỉ chọn một phần chữ.

Trang xuất bản và màn hình chỉnh sửa giữ cùng diện mạo. Khi chỉnh sửa, chữ cái đầu được bọc trong phần tử thực để vị trí con trỏ và xóa không bị lệch; phần tử này không thuộc nội dung tài liệu được lưu.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Kiểu CSS

Trang xuất bản và màn hình chỉnh sửa chỉ khác bộ chọn trỏ đến chữ cái đầu. Trang xuất bản dùng `[data-nabi-dropcap="1"]::first-letter`, còn màn hình chỉnh sửa dùng phần tử thực `[data-nabi-dropcap-letter]`. Khi thay đổi giá trị hiển thị như màu, phông và cỡ, phải luôn viết cả hai bộ chọn để diện mạo khi chỉnh sửa và xuất bản giống nhau.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Nếu cần thay đổi cỡ và chiều cao dòng, hãy áp dụng cùng giá trị cho cả hai bộ chọn.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Chữ cái đầu đoạn tính luồng dòng quanh ký tự đầu, nên thay đổi chỉ một bên hoặc tăng giá trị quá nhiều có thể làm hỏng diện mạo WYSIWYG. Vẫn nên tránh thêm mới `::first-letter` vào màn hình chỉnh sửa. Trong trình soạn thảo, chỉ tạo kiểu cho `[data-nabi-dropcap-letter]` đã có.
