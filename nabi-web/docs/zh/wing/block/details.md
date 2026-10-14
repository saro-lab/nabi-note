---
title: 折叠
description: 将摘要和正文组合起来，并保存初始展开状态。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 折叠

把简短摘要和正文组合成一个块。从工具栏创建时，先输入摘要，再在下面继续编写内容。

通过三角按钮设置的展开状态会保存在文档中，成为发布页面的初始状态。编辑时也可以点击三角按钮展开或收起。

在表格单元格或其他块内，也只会展开或收起当前折叠块。如果光标或选区位于即将收起的正文内，会将其移到外部；其他位置的选区保持不变。

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS 样式

用 `.nabi-content details` 设置折叠块样式，用 `.nabi-content details > summary` 设置标题样式。

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` 属性是作者保存的初始展开状态。CSS 可以为这个状态设置样式，但最好不要强行改变状态本身。
