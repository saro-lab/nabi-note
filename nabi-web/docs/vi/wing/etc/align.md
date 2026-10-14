---
title: Căn chỉnh
description: Thay đổi căn chỉnh ngang của đoạn văn và khối đối tượng.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Căn chỉnh

Căn trái, giữa hoặc phải cho đoạn hiện tại và các đoạn trong vùng chọn. Các đối tượng nằm trong đoạn như ảnh, video và bảng cũng được căn theo đoạn văn bọc chúng.

Căn chỉnh được lưu là thuộc tính đoạn văn chứ không phải định dạng chữ. Khối mã không nằm trong đối tượng căn chỉnh vì chính thụt lề của nó mang ý nghĩa.

Trong ô bảng, việc căn chỉnh áp dụng cho đoạn hoặc ảnh tại con trỏ. Kéo để chọn nhiều ô sẽ áp dụng cho mọi đoạn và ảnh có thể căn chỉnh trong các ô đó. Khi vùng chọn có nhiều kiểu căn chỉnh, không nút căn chỉnh nào hiển thị là đang được chọn.

Để căn chỉnh chính bảng, nhấn **Chọn bảng** trong công cụ ngữ cảnh, hoặc đặt con trỏ trước hay sau bảng trong đoạn bao quanh nó rồi dùng nút căn chỉnh trên thanh công cụ chính. Vị trí trái hoặc phải của vùng nổi được đổi bằng công cụ ngữ cảnh của vùng đó, thay vì nút căn chỉnh.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Khi áp dụng lệnh cho vùng chọn hiện tại, dùng `l` cho trái, `c` cho giữa và `r` cho phải.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
