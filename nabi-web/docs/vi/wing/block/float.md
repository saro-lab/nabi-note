---
title: Vùng nổi
description: Đặt chữ, hình ảnh và bảng bên cạnh nội dung chính để các đoạn văn sau chảy dọc bên cạnh.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Vùng nổi

Đặt mô tả ngắn, hình ảnh hoặc bảng nhỏ ở bên trái hay phải để nội dung chính chảy bên cạnh. Bạn có thể sửa nội dung vùng ngay trong cùng trình soạn thảo. Viền nét đứt chỉ hiện khi chỉnh sửa; bản xem trước và màn hình đã xuất bản chỉ còn nội dung và bố cục.

Đặt con trỏ vào vùng trong ví dụ bên dưới rồi đổi phía và chiều rộng tối đa bằng công cụ thuộc tính. Trong bản xem trước, bạn có thể xem nội dung tiếp nối mà không có viền nét đứt.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Vùng nổi nằm trong các cánh cơ bản. Nếu chỉ lắp những cánh cần thiết, dùng `wings().use('float')` hoặc đăng ký trực tiếp `floatWing`. Cũng cần đăng ký các cánh hình ảnh, bảng, danh sách và nội dung khác sẽ dùng trong vùng.

## Tạo và bố trí

Đặt con trỏ trong nội dung chính rồi nhấn **Vùng nổi** để tạo vùng trống. Mặc định vùng nằm bên phải với chiều rộng tối đa 40%. Nếu chọn nhiều đoạn văn trước khi nhấn, tất cả đoạn văn mà vùng chọn chạm tới sẽ được gói trọn vào một vùng. Không thể bọc lại vùng nổi đã có hoặc tạo vùng nổi khác bên trong nó.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Khi con trỏ ở trong vùng, dùng công cụ thuộc tính để đổi sang trái hoặc phải và thay chiều rộng tối đa. Chọn 20%, 30%, 40% hoặc 50%. Tỷ lệ dựa trên chiều rộng nội dung chính, không phải toàn màn hình; nếu nội dung ngắn, chiều rộng thực tế của vùng có thể nhỏ hơn.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Dán chữ, hình ảnh, bảng, chuyển đổi khối và tải lên đều giữ nội dung trong vùng. Xóa bảng bên trong chỉ xóa bảng đó. Không thể chèn hoặc chuyển đổi khối bên trong khi vùng chọn bao gồm cả bên trong lẫn bên ngoài vùng.

Nút **Bỏ vùng nổi** bên cạnh giá trị chiều rộng đưa nội dung trở lại nội dung chính mà không xóa nó. Tạo, thay đổi bố cục và bỏ lớp bọc đều hỗ trợ hoàn tác và làm lại.

```ts
nabi.applyCommand('unwrapFloat')
```

## Cách nội dung chảy quanh vùng

Các đoạn văn tiếp theo chảy bên cạnh vùng, rồi trở lại toàn bộ chiều rộng nội dung chính sau khi vùng kết thúc. Tiêu đề, bảng, khối mã, đường phân cách hoặc vùng nổi mới tiếp theo bắt đầu phía dưới vùng trước đó.

Khi chiều rộng nội dung chính nhỏ hơn `36rem`, vùng và nội dung được bố trí thành một cột. Khi in cũng dùng một cột, đồng thời giữ nguyên phía và chiều rộng tối đa đã lưu. Màn hình so sánh tài liệu giữ phía và chiều rộng tối đa của từng vùng nhưng hiển thị riêng khối tiếp theo ở phía dưới để dễ đọc các thay đổi.

## Lưu và tải

JSON lưu `a.side` và `a.w` của nút `float` cùng với các khối bên trong. HTML dùng thuộc tính `data-nabi-float` và `data-nabi-float-width` trên một `div` nằm trong đoạn văn đối tượng thông thường.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Đây là phần mô tả đặt bên cạnh nội dung chính.</p>
  </div>
</div>
<p>Đoạn văn này tiếp tục bên cạnh vùng.</p>
```

Khi xuất Markdown, vùng được giữ dưới dạng HTML. Các kiểu CSS `float` tùy ý không được nhập, vì vậy hãy dùng JSON hoặc HTML do NABI NOTE tạo để lưu và khôi phục. Kết nối cùng các cánh và CSS ở trình soạn thảo, SSR, bản xem trước và màn hình đã xuất bản để giữ nguyên phía và chiều rộng.

## Kiểu CSS

Bạn có thể định kiểu màu và khoảng cách trong vùng bằng bộ chọn `[data-nabi-float]`. Đoạn văn ngoài quản lý bố cục và chiều rộng tối đa, nên không ghi đè trực tiếp `float`, `display` hoặc chiều rộng.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
