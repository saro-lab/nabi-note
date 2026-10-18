---
title: 合并
description: 合并开始编辑时的版本、自己的版本和期间保存的新版本，编辑并解决剩余冲突。
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# 合并

如果编辑期间有其他修改被保存，则以开始编辑时的版本为基准合并双方变化。能自动合并的内容会从一开始全部应用，只有重叠变化保留为冲突。合并是 `nabi-note/merge` 的独立界面，不是翼。

| 左侧 | 中间 | 右侧 |
| --- | --- | --- |
| 开始编辑时的版本 | 将自动合并应用到自己的当前文档后的结果 | 编辑期间保存的新版本 |
| 只读 | 可直接编辑 | 只读 |

中间区域可以像普通编辑器一样修改文字、格式、表格、列表、图片等。可用功能由传入的翼决定，冲突标记和解决状态不会混入保存的内容。

## 可全部自动合并的示例

你将会议时间改为 **上午11点**，另一人将地点改为 **3楼会议室**。修改涉及不同段落，因此中间结果同时包含两项修改。

没有剩余冲突，可以直接点击 **确认**。也可以先润色中间文字再确认。下方显示的最终文档是确认回调收到的实际结果。

<MergeDemo />

## 只能部分自动合并的示例

这次你将会议时间改为 **上午11点**，另一人改为 **下午2点**。同一段落的修改不同，所以时间保留为冲突。你将主持人改为 **智旻和瑞妍**，另一人将地点改为 **3楼会议室**，这两项会自动应用。

用以下任一方式解决冲突：

- 左侧 **&gt;&gt;**：采用开始编辑时版本的对应内容。
- 右侧 **&lt;&lt;**：采用新保存版本的对应内容。
- **使用当前内容解决**：保留或编辑中间内容，然后标记为已解决。

将中间的时间句子改成所需内容，再点击 **使用当前内容解决**。只有所有剩余冲突都解决后才能确认。

<MergeDemo partial />

再次编辑已解决区域仍会保留解决状态。撤销解决操作会同时撤销状态，重做则恢复。仅删除或编辑文字不会自动解决未解决的冲突。

## 自动合并与冲突规则

比较从开始编辑文档到自己的文档，以及从同一开始文档到新版本的变化。仅一方修改和双方相同的修改会自动应用。不同段落或行的变化也会一起应用。

与 Git 文本合并一样，按段落和行判断变化是否重叠。即使修改同一行的不同单词，也不会自动混合，而是保留为冲突。同一位置插入不同内容，或一方删除而另一方修改时，也需要手动决定。

表格、列表、浮动区域等结构块如果双方修改不同，则整个结构作为冲突。不会任意混合单元格或列表项，需要选择内容或在中间直接编辑。移动与编辑重叠且位置无法可靠确定时，也不会自动应用。

## 连接独立合并界面

`base`、`local`、`incoming` 接收已保存的 NABI TREE JSON 或 HTML 字符串。使用与创建文档的编辑器相同的翼和选项。`mountMerge()` 一并创建中间编辑器和工具栏、两侧原文、冲突选择工具和确认按钮。

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
  locale: 'zh',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` 接收所有冲突已解决的当前结果的 JSON、发布用 HTML、编辑 revision 和 `incomingVersion`。返回 `false` 不会完成确认。Promise 等待期间暂时阻止编辑结果、选择冲突和重复确认。卸载界面会中止该结果的 `signal`。韩文输入法组字期间需等待组字结束后才能确认。

服务的图片选择器、上传等独立操作按普通编辑器的方式连接。通过 `toolbarOptions` 传入工具栏面板与宿主操作，通过 `surfaceOptions` 传入编辑表面选项。

`incomingVersion` 原样返回服务传入的值。保存时由服务与服务器最新版本比较。如果合并期间又保存了新版本，应获取最新文档重新合并，避免用旧结果覆盖。

也可以从界面外读取状态或调用确认。

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

通过 `merge.nabi.getJson()` 和 `merge.nabi.getHtml()` 读取当前结果。不要保存编辑 DOM 或 `getEditorHtml()`。如只需在两个版本之间选择并应用旧内容，请使用[比较](./compare)中的点击合并。

## 上传完成后确认

使用文件按钮、粘贴和拖放时，请连接 `upload` 翼和 `mountUpload()`。`sendUpload` 将文件发送到服务器并返回 `{ uri }`。完整的服务器连接和进度显示示例见[文件上传](../wing/etc/upload)。

对于上传等尚未反映到文档的异步操作，用 `merge.session.hold()` 暂停确认和冲突选择。完成、取消或卸载时调用返回的函数解除暂停。应在 **插入文档之后** 解除，而非刚上传到服务器时，以免最终结果遗漏文件。

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
  locale: 'zh',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'zh',
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

`merge.content` 是中间编辑 DOM，`merge.surface` 和 `merge.toolbar` 是已挂载的编辑表面和工具栏。不要在同一位置再次挂载。先卸载额外添加的上传、进度显示等 mount，最后调用 `merge.unmount()`。
