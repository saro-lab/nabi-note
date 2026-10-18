---
title: Gộp
description: Gộp phiên bản bắt đầu sửa, phiên bản của bạn và phiên bản được lưu trong lúc đó, rồi sửa để giải quyết xung đột còn lại.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Gộp

Nếu thay đổi khác được lưu trong lúc bạn sửa, gộp hai bên dựa trên phiên bản lúc bắt đầu. Mọi thay đổi có thể gộp tự động được áp dụng ngay; chỉ phần chồng lấn còn xung đột. Đây là giao diện độc lập của `nabi-note/merge`, không phải wing.

| Trái | Giữa | Phải |
| --- | --- | --- |
| Phiên bản lúc bắt đầu sửa | Tài liệu hiện tại của bạn sau gộp tự động | Phiên bản được lưu khi bạn đang sửa |
| Chỉ đọc | Sửa trực tiếp | Chỉ đọc |

Ở giữa có thể sửa chữ, định dạng, bảng, danh sách và ảnh như trình soạn thảo thường. Wing được truyền vào quyết định tính năng. Dấu xung đột và trạng thái giải quyết không lẫn vào nội dung lưu.

## Ví dụ gộp tự động hoàn toàn

Bạn đổi giờ họp thành **11 giờ sáng**, người khác đổi nơi họp thành **phòng họp tầng 3**. Hai đoạn khác nhau nên cả hai sửa đổi đều có trong kết quả giữa.

Không còn xung đột, bạn có thể nhấn **Xác nhận** ngay hoặc trau chuốt nội dung giữa trước. Tài liệu cuối bên dưới là kết quả thật mà callback xác nhận nhận được.

<MergeDemo />

## Ví dụ chỉ gộp tự động một phần

Lần này bạn đổi giờ thành **11 giờ sáng**, người khác đổi thành **2 giờ chiều**. Sửa khác nhau trong cùng đoạn khiến giờ còn xung đột. Việc bạn đổi người phụ trách thành **Jimin và Seoyeon** và người kia đổi nơi họp thành **phòng họp tầng 3** được áp dụng tự động.

Giải quyết xung đột bằng một trong các cách:

- Trái **&gt;&gt;**: lấy nội dung tương ứng từ phiên bản bắt đầu sửa.
- Phải **&lt;&lt;**: lấy nội dung tương ứng từ phiên bản mới lưu.
- **Giải quyết bằng nội dung hiện tại**: giữ hoặc sửa nội dung giữa rồi đánh dấu đã giải quyết.

Sửa câu giờ họp ở giữa rồi nhấn **Giải quyết bằng nội dung hiện tại**. Chỉ xác nhận được khi mọi xung đột đã giải quyết.

<MergeDemo partial />

Sửa lại vùng đã giải quyết vẫn giữ trạng thái. Hoàn tác thao tác giải quyết cũng hoàn tác trạng thái; làm lại khôi phục nó. Chỉ xóa hoặc sửa chữ không tự giải quyết xung đột còn mở.

## Quy tắc gộp tự động và xung đột

So sánh thay đổi từ tài liệu ban đầu đến tài liệu của bạn và từ cùng bản đầu đến bản mới. Thay đổi một phía và thay đổi giống nhau ở hai phía tự được áp dụng. Thay đổi các đoạn hoặc dòng riêng cũng được gộp.

Giống gộp văn bản Git, phần chồng lấn được xét theo đoạn và dòng. Dù sửa từ khác nhau trên cùng dòng vẫn là xung đột. Chèn khác nội dung cùng vị trí hoặc sửa nội dung phía kia đã xóa cũng cần quyết định.

Nếu hai phía sửa khác nhau một khối có cấu trúc như bảng, danh sách hay vùng nổi, cả cấu trúc thành xung đột. Không trộn tùy tiện ô hoặc mục danh sách: chọn nội dung hoặc sửa ở giữa. Di chuyển và sửa chồng lấn không xác định chắc vị trí cũng không tự áp dụng.

## Kết nối giao diện gộp độc lập

Truyền NABI TREE JSON đã lưu hoặc chuỗi HTML vào `base`, `local`, `incoming`. Dùng cùng wing và tùy chọn như trình soạn thảo gốc. `mountMerge()` tạo trình soạn thảo giữa, thanh công cụ, hai nguồn, công cụ chọn xung đột và nút xác nhận.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'vi',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` nhận JSON, HTML xuất bản, revision sửa và `incomingVersion` của kết quả hiện tại đã giải quyết hết xung đột. Trả `false` không hoàn tất xác nhận. Khi chờ Promise, sửa kết quả, chọn xung đột và xác nhận lặp bị chặn. Tháo giao diện hủy `signal` của kết quả. Khi đang tổ hợp ký tự tiếng Hàn bằng IME, phải kết thúc tổ hợp mới xác nhận được.

Nối tác vụ riêng như chọn ảnh hoặc tải lên như trình soạn thảo thường. `toolbarOptions` nhận bảng công cụ và tác vụ host; `surfaceOptions` nhận tùy chọn bề mặt soạn thảo.

`incomingVersion` trả nguyên giá trị dịch vụ đã truyền. Dịch vụ phải so với phiên bản máy chủ mới nhất khi lưu. Nếu bản khác được lưu trong lúc gộp, tải tài liệu mới nhất và bắt đầu gộp mới, đừng ghi đè bằng kết quả cũ.

Cũng có thể đọc trạng thái hoặc gọi xác nhận từ ngoài giao diện.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Đọc kết quả bằng `merge.nabi.getJson()` và `merge.nabi.getHtml()`. Không lưu DOM soạn thảo hay `getEditorHtml()`. Để chỉ áp dụng nội dung cũ đã chọn giữa hai phiên bản, dùng gộp bằng nhấp chuột trong [So sánh](./compare).

## Xác nhận sau khi tải lên xong

Nối wing `upload` và `mountUpload()` cho nút tệp, dán và kéo thả. `sendUpload` gửi tệp lên máy chủ rồi trả `{ uri }`. Xem [Tải tệp lên](../wing/etc/upload) để có ví dụ đầy đủ về kết nối và tiến trình.

Dùng `merge.session.hold()` để hoãn xác nhận và chọn xung đột khi tác vụ bất đồng bộ như tải lên chưa vào tài liệu. Gọi hàm trả về lúc hoàn tất, hủy hoặc tháo giao diện. Giải phóng **sau khi chèn vào tài liệu**, không ngay sau khi gửi lên máy chủ, để tệp không thiếu trong kết quả cuối.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'vi',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'vi',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` là DOM soạn thảo giữa; `merge.surface` và `merge.toolbar` đã được gắn. Không tạo thêm bề mặt hay thanh công cụ cùng chỗ. Tháo các mount tải lên và tiến trình bổ sung trước, cuối cùng gọi `merge.unmount()`.
