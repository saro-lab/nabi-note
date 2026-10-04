---
title: Hình ảnh
description: Nhập địa chỉ ảnh và điều chỉnh chiều rộng, căn chỉnh.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hình ảnh

Nhập địa chỉ ảnh và điều chỉnh chiều rộng, căn chỉnh. Mặc định chỉ cho phép địa chỉ `http:`, `https:` hoặc đường dẫn cùng trang; ảnh mới bắt đầu với căn giữa và chiều rộng 60%.

Chiều rộng chỉ được lưu trong các mức đã định, còn căn chỉnh được lưu trên đoạn văn bọc ảnh. Để dùng xem trước `blob:` và `data:image/...`, bạn phải cho phép rõ ràng URL cục bộ ở cả image wing và phần lắp ráp trình soạn thảo. URL dữ liệu SVG không được cho phép.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wing này thêm địa chỉ vào tài liệu, không truyền tệp. Để gửi tệp lên máy chủ, hãy kết nối [upload wing](/vi/wing/etc/upload).

## Kết nối trình chọn ảnh

Dùng `panels.img` trong `mountToolbar()` để thay cửa sổ nhập URL mặc định của nút ảnh bằng trình chọn ảnh của dịch vụ. Khóa là tên slot trên thanh công cụ; các công cụ không được chỉ định vẫn dùng cửa sổ mặc định.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` là hàm bạn tự triển khai trong dịch vụ. Hàm tạo giao diện đồng bộ bên trong `root` được truyền vào và trả về một hàm dọn dẹp. Kết nối `signal` với các tác vụ bất đồng bộ như tải danh sách ảnh hoặc tải tệp lên, rồi truyền URL ảnh đã chọn cho `onSelect`. API này không truyền tệp; các quy tắc cho phép URL ảnh hiện có vẫn được áp dụng.

Khi đóng cửa sổ hoặc tháo thanh công cụ, `signal` bị hủy và hàm dọn dẹp được gọi. `run()` đóng cửa sổ rồi áp dụng lệnh một lần tại vùng chọn được lưu khi mở. Nếu cửa sổ đã đóng hoặc nội dung tài liệu thay đổi từ lúc mở, hàm trả về `false` mà không thực thi lệnh.

## Kiểu CSS

Tạo kiểu cho ảnh bằng `.nabi-content img`. Giữ nguyên chiều rộng và căn chỉnh đã lưu, chỉ thay đổi diện mạo như viền hoặc bóng.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Giữ nguyên các quy tắc cơ bản về `max-inline-size`, `block-size`, chiều rộng và căn chỉnh. Kích thước ảnh là giá trị lưu trong tài liệu; ép cố định bằng CSS có thể xung đột với chiều rộng do tác giả chọn.
