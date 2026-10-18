---
title: 比较
description: 并排比较两个文档，将选中的旧内容应用到当前文档。
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# 比较

并排查看两个已保存文档的变化。无需编辑器也能打开比较界面；连接回调后，可以将选中的旧内容应用到当前文档。

## 选择并应用旧内容

左侧是旧文档，右侧是当前文档。点击变化旁的 **&gt;&gt;**，即可将该段落或行组的旧内容应用到当前文档，并非逐字选择。也可以恢复已删除的内容，或移除当前文档新增的内容。

试着只还原下面示例的聚会时间或携带物品。展开 **回调更新后的当前文档** 查看结果，点击 **重新开始** 恢复原始示例。

<CompareDemo />

## 独立比较界面

从 `nabi-note/diff` 导入。`before` 和 `after` 接收已保存的 NABI TREE JSON 或 HTML 字符串。使用与创建文档的编辑器相同的翼构建 registry，才能完整读取并显示表格、列表、图片等内容。

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'zh',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

默认只显示变化及其前后上下文。折叠按钮可展开全文，上一个和下一个按钮可跳转到变化位置。没有变化时显示全文。省略 `onMerge` 则为只读比较界面。

## 通过回调连接点击合并

点击按钮会向 `onMerge` 传递候选结果。仅连接回调并不会自动保存文档；服务接受候选结果并调用 `update()` 后，比较结果才会更新。

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'zh',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` 是仅应用所选变化的 NABI TREE JSON。`before`、`after` 是点击时的文档，`changeId` 标识所选变化，`revision` 标识比较状态。将该 `revision` 作为 `update()` 的第三个参数传入，如果比较界面已变化，就会返回 `false` 而不应用候选结果。

等待异步回调时会阻止重复点击。更新为其他文档或卸载比较界面会中止 `signal`。保存到服务器的服务应同时检查此信号和服务器文档版本，避免用旧结果覆盖新文档。

## 从编辑器打开比较

连接 `diff` 翼和 `mountDiffWing()`，即可从工具栏打开比较。基准为最后加载的文档，普通编辑和撤销不会改变基准文档。

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'zh',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

设置 `merge: true` 后，比较界面选中的旧内容会应用到编辑器。此操作可撤销，并保留基准文档。比较打开期间原编辑器发生变化时会重新计算比较。省略 `merge` 则保留只读比较。

移除界面时调用 `toolbar.unmount()` 和 `comparison.unmount()`。如需一并查看开始编辑时的版本并自动合并双方变化，请使用[合并](./merge)。
