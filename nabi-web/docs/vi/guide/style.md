---
title: Chủ đề CSS
description: Cấu hình màu sắc, phông chữ, kích thước và chế độ tối cho trình soạn thảo lẫn nội dung xuất bản bằng biến CSS.
---

# Chủ đề CSS

NABI NOTE dùng cùng CSS cho nội dung soạn thảo và xuất bản. Tải stylesheet của gói một lần, rồi chỉ ghi đè các biến cần thiết trên vùng chứa của dịch vụ.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Đặt token dùng chung trên phần tử cha chung để trình soạn thảo và chế độ xem đã xuất bản giữ cùng ngôn ngữ hình ảnh.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Biến thường dùng

| Mục đích | Biến |
| --- | --- |
| Văn bản và nền | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Viền và màu nhấn | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Góc và bóng | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Họ phông chữ | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Bề mặt soạn thảo | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Thanh công cụ dính và bản xem trước | `--nabi-sticky-top`, `--nabi-preview-width` |
| Điều khiển cảm ứng | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Chiều rộng chuyển sang chế độ di động | `--nabi-mobile-breakpoint` |

Token tô sáng và màu văn bản dùng `--nabi-hl-<name>` và `--nabi-tc-<name>`. Ví dụ, đổi `--nabi-hl-yellow` sẽ đổi màu hiển thị của phần tô sáng `yellow` đã lưu mà không thay đổi dữ liệu tài liệu.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## Ngưỡng chế độ di động

Chế độ di động bật khi chiều rộng thanh công cụ, hàng ngữ cảnh hoặc vùng nhìn nhỏ hơn `36rem`. Ở đúng `36rem`, bố cục thông thường được giữ nguyên. Trong chế độ di động, thanh công cụ và hàng ngữ cảnh cuộn ngang, các bảng nằm giữa và lưới chọn bảng giảm còn 5×5 ô phù hợp với thao tác chạm.

Đặt `--nabi-mobile-breakpoint` trên `:root`, phần tử tổ tiên hoặc từng `.nabi`. Dùng độ dài CSS không âm như `rem`, `px` hoặc `calc()`. Thay đổi giá trị CSS, cỡ chữ gốc, chiều rộng vùng chứa hoặc vùng nhìn cũng tự động cập nhật các bảng đang mở. Bảng nhập liệu được chuyển xuống dưới `body` vẫn dùng ngưỡng của trình soạn thảo ban đầu.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Thiết bị cảm ứng vẫn giữ các điều khiển lớn hơn khi vượt ngưỡng này.

## Chế độ tối

Chế độ sáng là mặc định. Thêm `.dark` vào `html` hoặc `body`, hoặc đặt `data-nabi-theme="dark"` trên một trình soạn thảo hay phần thân nội dung xuất bản cụ thể.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Dùng `data-nabi-theme="light"` để không áp dụng `.dark` của phần tử tổ tiên. Ứng dụng của bạn điều khiển việc đổi chủ đề; gói không tự động theo `prefers-color-scheme`.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Tạo kiểu cả nội dung xuất bản

HTML đã xuất bản cũng cần `.nabi-content` và cùng CSS. Bảng, khối mã, ảnh, danh sách kiểm tra và chữ cái đầu đoạn lớn được kết xuất không cần JavaScript. Chỉ thêm `nabi-note/viewer` cho các hành vi như sắp xếp bảng hoặc tô sáng mã.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

Đặt bố cục mà gói không quản lý, như chiều rộng phần thân và chiều cao dòng, trên lớp của dịch vụ.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Không thay đổi cấu trúc soạn thảo

Không thay đổi `display` hoặc `white-space` trên nút `[data-key]` đang soạn thảo, không thêm phần tử giả trong văn bản có thể sửa, cũng không vô hiệu hóa hành vi con trỏ trên phần bao đối tượng. Các quy tắc này có thể làm hỏng hình học con trỏ và ánh xạ tài liệu.

Chữ cái đầu đoạn lớn khi xuất bản dùng `::first-letter`, còn bề mặt soạn thảo dùng phần tử thật `[data-nabi-dropcap-letter]`. Đừng thêm quy tắc `::first-letter` khác trong `.nabi-editing` hoặc thay thế phần tử đó.
