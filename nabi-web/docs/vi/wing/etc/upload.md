---
title: Tải tệp lên
description: Kết nối việc truyền tệp với trình tải lên của dịch vụ.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tải tệp lên

Kết nối chọn tệp, kéo thả và dán chỉ chứa tệp với luồng tải lên. Bản demo trên trang này không gửi lên máy chủ; trong dịch vụ, bạn phải tự kết nối trình tải lên nhận tệp và trả về URL.

Để đưa kết quả tải lên vào khối ảnh cần image wing; để đưa tệp khác vào liên kết đính kèm cần link wing. Dịch vụ nhận cả hai loại phải chọn rõ ràng cả hai wing. Trong khi tải lên, trình soạn thảo bị khóa và các tệp thành công được thêm cùng một bước hoàn tác.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Nếu chỉ chọn `upload`, một phụ thuộc còn thiếu trong ảnh và liên kết sẽ được tự động bổ sung. Kết nối truyền tệp bằng `mountUpload()`, và thường kết nối hiển thị tiến độ trên màn hình chỉnh sửa bằng `mountUploadView()`. Nếu máy chủ trả URL HTTPS, không cần tùy chọn cho phép URL cục bộ.

## Cam kết API máy chủ

NABI NOTE không gửi tệp tới máy chủ. Hàm `uploader` gửi một tệp tới máy chủ và khi thành công chỉ trả URL `https:` công khai hoặc đã xác thực. Cam kết API đơn giản nhất như sau.

```text
POST /api/uploads
Content-Type: multipart/form-data
Tên trường: file

Thành công: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Thất bại: phản hồi 4xx hoặc 5xx
```

Máy chủ không được chỉ tin tên tệp gốc, phần mở rộng hay MIME do trình duyệt gửi. Hãy kiểm tra xác thực và quyền trước, giới hạn kích thước tệp ở giai đoạn truyền luồng, và kiểm tra định dạng tệp thực. Máy chủ phải tạo tên lưu mới; với ảnh, hãy mã hóa lại hoặc tạo ảnh thu nhỏ khi cần. Nếu dịch vụ không cho người khác tải tệp lên xuống, hãy trả đường dẫn tải xuống cần xác thực thay vì URL.

| Cần kiểm tra trên máy chủ | Lý do |
| --- | --- |
| Người dùng đã đăng nhập và quyền tải lên | Ngăn dùng không gian lưu trữ của người khác |
| Kích thước mỗi tệp và tổng kích thước yêu cầu | Ngăn cạn bộ nhớ và không gian lưu trữ |
| MIME thực tế và phần mở rộng được cho phép | Chặn tệp thực thi chỉ đổi tên |
| Tên lưu ngẫu nhiên và kho lưu trữ tách biệt | Ngăn thao túng đường dẫn và ghi đè tệp hiện có |
| Quyền truy cập và chính sách hết hạn của URL phản hồi | Ngăn lộ tệp riêng tư chỉ bằng URL |

`extensions`, `maxFileSize` phía máy khách chỉ là bước đầu để thông báo nhanh cho người dùng. Phải áp dụng cùng giới hạn trên máy chủ.

## Kết nối trình tải lên trong trình duyệt

Ví dụ dưới đây là kết nối thực tế mà NABI NOTE mong đợi. Dùng `XMLHttpRequest` vì `fetch()` mặc định của trình duyệt không cung cấp tiến độ tải lên. Khi chỉ trả `url` từ máy chủ, ảnh được đưa vào khối ảnh và tệp khác thành liên kết đính kèm.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'ko' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Yêu cầu tải lên thất bại.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'ko',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ko' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ko',
})
```

Bạn phải kết nối `fileSink: upload.take` để kéo thả và dán chỉ có tệp đi vào quá trình tải lên. Nút chọn tệp trong UI của upload wing chuyển tệp qua `upload.take()`. Trong khi tải lên, trình soạn thảo bị khóa và các tệp thành công được thêm một lần hoàn tác cho mỗi lô. Nút hủy của `upload.cancel()` hoặc `uploadView` ngắt yêu cầu đang chạy qua `AbortSignal`.

## Thất bại và giải phóng giao diện

Nếu máy chủ trả phản hồi lỗi hoặc `uploader` trả `null`, tệp đó không được đưa vào tài liệu. Các tệp khác trong cùng lô vẫn tiếp tục xử lý. Nếu vượt quá giới hạn tổng kích thước, toàn bộ lô không khởi chạy. Khi đóng màn hình, giải phóng theo thứ tự ngược với lúc tạo.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Chỉ trong lúc phát triển, bạn có thể dùng URL `blob:` để tạo xem trước ngay. Trong trường hợp này, phải bật `allowLocalUrls: true` ở phần lắp ráp trình soạn thảo, image wing và upload wing. Nếu máy chủ thực trả URL HTTPS, không bật tùy chọn này sẽ an toàn hơn.

## Kiểu CSS

Tệp thường đã hoàn thành hiển thị bằng `a[data-nabi-file]` của link wing. Dùng bộ chọn này khi chỉ muốn đổi diện mạo tệp đính kèm trên trang xuất bản.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Kết quả tải ảnh lên tuân theo CSS của image wing. Hiển thị tiến độ tải lên chỉ có trên màn hình chỉnh sửa, nên không cần tạo trạng thái tiến độ bằng CSS trang xuất bản.
