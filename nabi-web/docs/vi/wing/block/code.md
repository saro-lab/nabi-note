---
title: Mã
description: Chứa mã nhiều dòng và thông tin ngôn ngữ để tô sáng cú pháp.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Mã

Chèn mã nhiều dòng tách biệt với nội dung thường. Trong đoạn trống, nhập ba dấu backtick rồi nhấn Space hoặc Enter, hoặc chuyển đổi từ thanh công cụ. Nếu thêm tên ngôn ngữ như `ts` sau backtick, tên đó cũng được lưu.

Tên ngôn ngữ là mã định danh dùng để tô sáng cú pháp; bạn có thể nhập trực tiếp cả tên ngoài danh sách đăng ký. Vì cần giữ nguyên nội dung mã và thụt lề, khối mã không áp dụng căn chỉnh đoạn văn.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Kết nối trình tô sáng mã

Khi đăng ký khối mã, trình soạn thảo dùng màu mặc định. Để tô màu cả trên trang xuất bản, hãy kết nối `nabi-note/viewer`. Viewer tìm `pre > code` và đọc giá trị `data-nabi-lang` của phần tử cha làm tên ngôn ngữ. Nếu không có giá trị đó, nó kiểm tra lớp `language-...` của phần tử `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'ko',
})

// Sau khi thay đổi HTML xuất bản
viewer.refresh()

// Khi đóng màn hình
viewer.unmount()
```

Nếu không có trình tô sáng riêng hoặc nó không xử lý được ngôn ngữ đó, bộ tách từ tích hợp không phụ thuộc sẽ tô màu thay thế. Các span token do trình tô sáng thêm chỉ tồn tại trên màn hình, không còn trong JSON đã lưu hay nguồn HTML xuất bản. `refresh()` và `unmount()` xóa các span này và kết nối lại với mã nguồn hiện tại.

### Cách website NABI kết nối Shiki

Để loại Shiki khỏi màn hình đầu tiên và gói SSR, website NABI tải trình tô sáng động. `loadCodeHighlighting()` trong `nabi-web/docs/.vitepress/src/highlight.ts` tạo Shiki core và chỉ lấy ngữ pháp của ngôn ngữ khi mã thực sự cần đến. Dưới đây là cùng cách kết nối dùng trên trang xuất bản.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'ko',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Khi đóng màn hình
stop?.()
viewer.unmount()
```

Khi gặp một ngôn ngữ lần đầu, việc tải ngữ pháp bắt đầu và trong lúc đó mã hiển thị bằng bộ tách từ tích hợp hoặc văn bản thuần. Khi ngữ pháp đến, `onGrammarLoaded()` gọi `viewer.refresh()` để tô màu lại. Nhờ vậy chỉ ngôn ngữ cần thiết được tải, và ngữ pháp đến muộn cũng được phản ánh mà không cần chuyển màn hình.

Phía trình soạn thảo cũng dùng cùng hàm `highlight`. Bản demo của website NABI chỉ thay `attach` của `codeWing` mặc định bằng `makeCodeAttach({ highlight, version })`. `version` thay đổi mỗi khi một ngữ pháp đến và là dấu hiệu để tô lại cả mã đã vẽ. Dịch vụ độc lập nên kết nối trang xuất bản trước, rồi thêm cách này khi thật sự cần tô màu Shiki trong lúc chỉnh sửa.

## Kiểu CSS

Tạo kiểu khối mã bằng `.nabi-content pre`, mã bằng `.nabi-content pre > code`. Không thay đổi `white-space` vì nó ảnh hưởng đến ngắt dòng và việc chỉnh sửa mã. Bạn có thể đổi màu token bằng bộ chọn `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
