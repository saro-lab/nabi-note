---
title: 表格
description: 创建行和列，支持单元格编辑和列排序。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 表格

从工具栏选择行数和列数来创建表格。在单元格内，内容会用换行继续，而不是创建多个段落；Tab 和 Shift+Tab 会移动到下一个或上一个单元格。

添加、删除行列、合并单元格和切换表头单元格，都会围绕选中的单元格执行。如果保存了可排序表格，并想在发布页面中使用列排序，请连接 `nabi-note/viewer` 的 `attachViewer()`。带有合并单元格的表格不会排序。

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS 样式

用 `.nabi-content table` 设置表格样式，用 `.nabi-content :is(th, td)` 设置单元格样式。不要改变单元格结构，也不要改变 viewer 插入的排序按钮结构。

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

如果连接了 viewer，请保留 `.nabi-sort` 按钮。强行覆盖单元格的 `position` 或右侧 padding，可能会让它和排序按钮重叠。
