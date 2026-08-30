---
title: Wing tùy chỉnh
description: Hợp đồng và trình tự triển khai để thêm một tính năng tài liệu bền vững.
---

# Wing tùy chỉnh

Wing tùy chỉnh không chỉ là một nút trên thanh công cụ. Đây là phần mở rộng khai báo tập hợp cấu trúc tài liệu đã lưu, lệnh, chuyển đổi HTML và Markdown, quy tắc nhập cùng hành vi hiển thị. Registry xác thực wing trước khi trình soạn thảo tồn tại, ngăn cấu trúc không hợp lệ đi vào tài liệu.

## Bắt đầu với factory hẹp nhất

Đa số định dạng không cần khai báo đầy đủ. Dùng `simpleMark()` cho mark nội tuyến không có giá trị, `valueMark()` cho mark có tập giá trị giới hạn, `boxObject()` cho khối không có phần tử con và `listFamily()` cho danh sách.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Tạo nhiều loại wing

Mỗi ví dụ dưới đây có một dạng lưu trữ khác nhau. Hãy đăng ký một wing trước và kiểm tra `getJson()` cùng `getHtml()`. Chỉ thêm lệnh và nút sau khi cấu trúc đã hoạt động.

### 1. Mark nội tuyến không giá trị: nhấn mạnh

Dùng `simpleMark()` khi tính năng chỉ bọc văn bản. Wing này lưu `exStrong` và kết xuất thành `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Với `clearable: true`, thao tác Xóa định dạng cũng xóa mark này. Trước khi thêm nút, hãy áp dụng nó bằng `nabi.applyCommand()` hoặc một lệnh tùy chỉnh khác. Cùng bộ chọn `.nabi-content strong` tạo kiểu cho cả trình soạn thảo và nội dung xuất bản.

### 2. Mark nội tuyến có giá trị: sắc thái trạng thái

Dùng `valueMark()` cho màu, kích thước hoặc trạng thái được chọn từ tập cho phép. Giá trị được lưu trong `a.v`; giá trị ngoài danh sách bị xóa khi `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Dạng đã lưu là `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Quan trọng"] }`. CSS nhắm đến giá trị đã lưu nên cũng thay đổi nội dung xuất bản. Đừng tùy tiện xóa giá trị khỏi danh sách hiện có: tài liệu đã lưu trước đó có thể mất chúng khi đọc.

### 3. Khối không có phần tử con: đường ngăn cách

Dùng `boxObject()` cho một đối tượng độc lập không có phần tử con, như ảnh, video hoặc đường ngăn cách.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Với đối tượng có giá trị như URL hoặc chiều rộng, hãy khai báo xác thực trong `attrs` và đặt giá trị bắt buộc vào `requires`. Hãy từ chối giá trị không thể xác minh bằng `null` thay vì âm thầm thay bằng giá trị mặc định.

### 4. Khối có nhiều đoạn: callout

Với khối chứa nội dung tài liệu, hãy khai báo `container`. `holds: 'blocks'` cho phép phần tử con là đoạn văn, danh sách và khối đối tượng.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Chỉ khai báo này chưa tạo cách bọc các đoạn đã chọn. Hãy thêm một lệnh thuần trong `commands` và `button` gọi nó trước khi đưa tính năng vào UI trình soạn thảo.

### 5. Cặp danh sách và mục tương ứng

Dùng `listFamily()` khi danh sách và mục phải luôn xuất hiện cùng nhau.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` sửa một khối trong danh sách bằng cách bọc nó trong một mục. Thêm `itemDecl` và `repairItem` cho giá trị ở cấp mục, như trạng thái đã chọn.

### Đăng ký trong một tập chọn có thứ tự

Dùng cùng các khai báo theo cùng thứ tự trên máy chủ và trong trình duyệt.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## Xác định tên và cấu trúc tài liệu

Tên đi vào tài liệu phải khớp `ex[A-Z0-9]...`. Tên như `exCallout` ngăn wing chính thức trong tương lai thay đổi ý nghĩa của nội dung đã lưu.

`place` xác định dạng lưu trữ: `mark` bọc nội dung nội tuyến, `void` là khối không có phần tử con, `container` chứa phần tử con, `attr` thay đổi thuộc tính đoạn văn và `tool` không tạo nút tài liệu. Một `container` cần `holds: 'blocks' | 'inline'` và `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` và `parts` khai báo ràng buộc cấu trúc. Khai báo `parts` cũng cần `partHtml` cho từng phần. Dùng `attrKey` và `attrValues` để ràng buộc wing chọn giá trị.

## Mọi tùy chọn khai báo

Chỉ khai báo những gì wing cần. Factory đã cung cấp sẵn một số trường.

| Phạm vi | Tùy chọn | Mục đích |
| --- | --- | --- |
| Cơ bản | `w`, `place`, `basic`, `styles` | Tên, loại cấu trúc, thuộc catalog cơ bản, CSS mặc định |
| Cấu trúc | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Loại phần tử con, hành vi Enter, thuộc tính được phép, thuộc tính Boolean |
| Cấu trúc | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Phần bên trong, phần tử con được phép, loại trừ căn chỉnh, phụ thuộc wing |
| Giá trị | `attrKey`, `attrValues`, `currentValue` | Khóa và danh sách giá trị lưu trữ, phát hiện giá trị hiện tại |
| Lệnh và đầu vào | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Lệnh, xử lý phím, hành vi Escape/phím đôi, quy tắc tự định dạng |
| Hành vi bề mặt | `attach` | Hành vi DOM và dọn dẹp cho bề mặt |
| Chuyển đổi | `toHtml`, `partHtml`, `toMd`, `partMd` | Đầu ra HTML và Markdown |
| Nhập và sửa | `claim`, `ioFilter`, `repair`, `partRepair` | Nhập HTML, xử lý tệp, xác thực và sửa JSON |
| UI | `button`, `buttons`, `context` | Khai báo UI thanh công cụ và ngữ cảnh |
| Xóa định dạng | `clearable` | Có bị Xóa định dạng loại bỏ hay không |

`w` và `place` luôn bắt buộc. Wing `mark`, `void` và `container` tạo nút cũng cần `toHtml()`. Container cần `holds`; mỗi phần được khai báo cần `partHtml` tương ứng.

## Giữ HTML, Markdown và JSON cùng nhau

`toHtml()` kết xuất một nút đã lưu thành HTML, còn `toMd()` xuất Markdown. Nếu không có bộ dựng Markdown, HTML được tạo sẽ được giữ lại để thông tin không mất. Khi nhập, dùng `claim()` chỉ để nhận diện phần tử HTML của chính bạn và các thuộc tính đã xác thực.

`repair()` chạy khi tải JSON và một lần nữa sau các lệnh. Trả về nút đã sửa cho thuộc tính không hợp lệ, hoặc `null` cho nút không thể giữ lại. Tạo HTML bằng `ctx.element()`, `ctx.escape()` và `ctx.url()`; đừng bao giờ nối thẻ, thuộc tính hoặc URL quanh các bước kiểm tra đó.

## Tách lệnh khỏi hành vi hiển thị

Lệnh là hàm thuần của tài liệu và vùng chọn, trả về tài liệu tiếp theo cùng vùng chọn bên trong nó. Lệnh không bao giờ đọc hoặc thay đổi DOM và trả về `null` khi không thể tạo thay đổi hợp lệ. Đặt tên lệnh theo lower camel case bắt đầu bằng động từ, như `insertNote`.

Đặt hành vi chỉ dành cho DOM, như kéo để chọn bảng, trong `attach(host)`. Đăng ký ngay việc dọn dẹp cho mọi listener hoặc thuộc tính thay đổi bằng `host.onDispose()` để thiết lập thất bại vẫn được dọn. Không sửa DOM văn bản đang soạn hoặc ánh xạ vùng chọn của bề mặt.

Khai báo điều khiển thanh công cụ và ngữ cảnh bằng `button`, `buttons` và `context`; sao chép quy tắc lệnh của chúng trong UI ứng dụng có thể khiến UI và mô hình tài liệu lệch nhau.

## Kiểu CSS

Đặt CSS nền tảng bắt buộc của wing trong `styles`. Kiểu wing dựng sẵn đã có trong `nabi-note/nabi.css`. Trình duyệt lắp ráp kiểu registry đã chọn có thể dùng `collectSheets()` và `injectSheets()`; SSR nên liên kết tệp CSS thay thế.

Dùng cùng lớp và thuộc tính dữ liệu cho nội dung soạn thảo lẫn xuất bản, nhưng không thay đổi cấu trúc `[data-key]`, `display` hoặc `white-space` khi soạn thảo. CSS chỉ được đổi diện mạo, không được đổi ánh xạ con trỏ.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Chỉ nhắm đến lớp hoặc thuộc tính dữ liệu do `toHtml()` tạo. Giữ thay đổi riêng cho dịch vụ ở phạm vi hẹp hơn, ví dụ `.article-body .ex-callout`.

## Xác minh toàn bộ hợp đồng

Xác minh rằng tài liệu JSON đã lưu tải lại thành cùng cấu trúc và HTML. Kiểm tra registry từ chối tên không hợp lệ, lệnh trùng lặp, builder thiếu và phần phụ thuộc chưa thỏa mãn. Bao quát HTML nhập không hợp lệ và đầu vào `repair()`, xử lý vùng chọn của lệnh, đầu ra SSR và chế độ xem đã xuất bản có kiểu.

Để xem đầy đủ kiểu và đối số factory, hãy kiểm tra các khai báo đã cài và [tài liệu tham khảo API bằng tiếng Anh](https://nabi.saro.me/llms/api-reference.md).
