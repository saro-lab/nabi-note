---
title: Bảng
description: Đưa nhiều đoạn văn và khối vào ô, rồi chỉnh màu nền, gộp ô và căn chỉnh.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bảng

Chọn số hàng và cột trên thanh công cụ để tạo bảng. Ô có thể chứa nhiều đoạn văn, hình ảnh, danh sách, trích dẫn, mã, phần thu gọn và video. Đặt con trỏ trong ô để chỉnh hàng, cột, gộp ô, ô tiêu đề và màu nền bằng các công cụ thuộc tính bên dưới.

Hãy thử sửa đoạn văn và danh sách trong các ô của ví dụ bên dưới, rồi kéo chọn nhiều ô để đổi màu nền cùng lúc. Nhấn **Chọn bảng** trong công cụ thuộc tính để căn chỉnh chính bảng đó từ thanh công cụ chính.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Bạn cũng cần đăng ký các cánh muốn dùng bên trong ô. Với trình soạn thảo dùng tất cả cánh cơ bản, hãy lắp bằng `wings().allBasic()`.

## Nhập nội dung trong ô

| Thao tác nhập | Hành vi |
| --- | --- |
| Enter trong đoạn văn thường | Tạo đoạn văn mới trong cùng ô. |
| Shift+Enter | Xuống dòng trong đoạn văn hoặc mục danh sách hiện tại. |
| Tab / Shift+Tab trong đoạn văn thường | Chuyển sang ô tiếp theo / trước đó. |
| Tab / Shift+Tab trong danh sách hoặc mã | Dùng thao tác tăng / giảm thụt lề của khối đó. |

Enter trong danh sách và mã tuân theo quy tắc nhập của từng khối. Ngay cả khi mã không thể giảm thụt lề thêm, Shift+Tab cũng không chuyển sang ô trước. Nhấn Backspace hoặc Delete ở đầu hay cuối ô không gộp ô đó với ô bên cạnh hoặc đoạn văn ngoài bảng.

Dán và chèn hình ảnh hoặc khối đều nằm trong ô nơi thao tác bắt đầu. Không thể chèn khối hoặc dán khi vùng chọn vượt qua ranh giới ô. Không thể lồng bảng hay [vùng nổi](./float) trong ô; khi nhập hoặc dán các cấu trúc như vậy, nội dung bên trong được tháo ra theo thứ tự.

Ô thường có thể chứa tiêu đề, nhưng định dạng tiêu đề không áp dụng cho ô tiêu đề bảng. Khi chuyển thành ô tiêu đề bảng, các tiêu đề bên trong trở thành đoạn văn thường, còn chữ và các định dạng khác được giữ nguyên.

## Màu nền ô

Màu nền áp dụng cho một ô hoặc vùng hình chữ nhật được chọn bằng cách kéo. Dù chỉ chọn một phần chữ, nền của toàn bộ ô chứa chữ đó vẫn thay đổi. Các màu nhạt thích ứng với giao diện sáng và tối. Nếu các ô được chọn có màu khác nhau, không có một màu riêng nào được hiển thị là đang chọn.

Bạn cũng có thể đổi màu bằng lệnh mà vẫn giữ vùng chọn ô hiện tại.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Các giá trị được phép là `yellow`, `green`, `cyan`, `pink`, `purple` và `orange`. Để trở về nền mặc định, chọn **Mặc định** trong công cụ thuộc tính hoặc truyền chuỗi rỗng.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Xóa nội dung, cắt và xóa định dạng không xóa màu nền ô. Khi gộp, màu của ô trên cùng bên trái được dùng; khi tách, các ô mới cũng nhận cùng màu đó. Hàng và cột mới thêm bắt đầu với nền mặc định. Thay đổi màu nền hỗ trợ hoàn tác và làm lại.

## Căn chỉnh nội dung ô và bảng

Khi con trỏ ở trong ô, căn chỉnh áp dụng cho các đoạn văn hoặc hình ảnh bên trong. Khi chọn nhiều ô, căn chỉnh áp dụng đồng thời cho các đoạn văn và đối tượng có thể căn chỉnh trong đó, ngoại trừ mã. Trạng thái công cụ tiêu đề, căn chỉnh và chữ cái đầu lớn cũng theo các đoạn văn bên trong thực sự được chọn. Nếu các đoạn văn được chọn có giá trị khác nhau, chúng không được hiển thị thành một giá trị duy nhất.

Để căn chỉnh chính bảng, nhấn **Chọn bảng** trong công cụ thuộc tính rồi dùng nút căn chỉnh trên thanh công cụ chính. Cách căn chỉnh này cũng dùng được khi đặt con trỏ trước hoặc sau đoạn văn bao quanh bảng và thấy viền nét đứt. Viền chỉ cho biết đối tượng tác động, không biến con trỏ thành vùng chọn toàn bộ bảng.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Thêm hoặc xóa hàng và cột, gộp và tách đều dựa trên các ô được chọn. Khi gộp, các khối của từng ô được giữ theo thứ tự hàng. Khi tách, nội dung ở lại ô ban đầu và các ô còn lại để trống.

## Sao chép và lưu

Sao chép nhiều ô được chọn sẽ sao chép vùng hình chữ nhật đang hiển thị đến hết ô cuối cùng. HTML và định dạng bảng nhớ tạm nội bộ giữ nguyên ô trống, ô gộp, khối, định dạng chữ và màu nền. Văn bản thuần phân tách ô bằng tab và xuống dòng, đồng thời giữ xuống dòng giữa các khối trong ô cũng như địa chỉ hình ảnh và video. Cắt chỉ làm trống nội dung các ô được chọn và có thể khôi phục bằng một lần hoàn tác.

Khi con trỏ ở trước hoặc sau bảng và viền nét đứt xuất hiện, sao chép và cắt áp dụng cho toàn bộ đoạn văn bao quanh bảng. Cắt chỉ xóa cả đoạn văn và bảng sau khi ghi thành công vào bảng nhớ tạm. Cắt hoặc xóa bảng bên trong vùng nổi vẫn giữ vùng nổi bên ngoài.

Lưu bằng JSON hoặc HTML giữ nguyên các khối và màu nền ô. Bảng đơn giản được xuất thành bảng Markdown; bảng có nhiều khối hoặc màu nền được giữ dưới dạng HTML để bảo toàn nội dung. Trong HTML, tên màu ô được lưu ở thuộc tính `data-nabi-cell-color` của `td` hoặc `th`. Các kiểu màu nền tùy ý từ HTML bên ngoài không được nhập thành màu nền ô.

Để sắp xếp cột trong màn hình đã xuất bản, lưu bảng ở trạng thái có thể sắp xếp và kết nối `attachViewer()` từ `nabi-note/viewer`. Bảng có ô gộp không thuộc đối tượng sắp xếp cột.

## Kiểu CSS

Định kiểu bảng bằng `.nabi-content table` và ô bằng `.nabi-content :is(th, td)`. Chỉ áp dụng nền xen kẽ và nền tiêu đề cho ô chưa có màu để không ghi đè màu nền đã chỉ định.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Thay đổi chính màu nền ô bằng biến CSS có tên màu, chẳng hạn `--nabi-cell-yellow`. Tải CSS dưới đây sau CSS của gói, rồi gán lớp `table-note` và giá trị `data-nabi-theme` của giao diện hiện tại trực tiếp lên phần tử `.nabi` của trình soạn thảo hoặc `.nabi-content` của màn hình đã xuất bản.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Nếu đã kết nối viewer, hãy giữ nút `.nabi-sort`. Ép ghi đè `position` hoặc padding bên phải của ô có thể gây chồng lấn với nút sắp xếp.
