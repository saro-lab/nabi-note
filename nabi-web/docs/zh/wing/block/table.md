---
title: 表格
description: 在单元格中放入多个段落和块，并编辑背景色、合并与对齐方式。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 表格

在工具栏中选择行数和列数即可创建表格。单元格可以包含多个段落、图片、列表、引用、代码、折叠块和视频。将光标放在单元格中，即可通过下方的属性工具编辑行列、合并、表头和背景色。

试着修改下面示例中单元格内的段落和列表，再拖动选择多个单元格，一起更改背景色。点击属性工具中的 **选择整个表格**，即可通过主工具栏调整表格本身的对齐方式。

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

还需要注册单元格中要使用的翼。如果编辑器使用全部基础翼，可以通过 `wings().allBasic()` 组装。

## 在单元格中输入

| 输入 | 行为 |
| --- | --- |
| 在普通段落中按 Enter | 在同一单元格内新建段落。 |
| Shift+Enter | 在当前段落或列表项内换行。 |
| 在普通段落中按 Tab / Shift+Tab | 移动到下一个 / 上一个单元格。 |
| 在列表或代码中按 Tab / Shift+Tab | 使用该块的增加 / 减少缩进功能。 |

列表和代码中的 Enter 遵循各自块的输入规则。即使代码无法继续减少缩进，Shift+Tab 也不会移动到上一个单元格。在单元格开头或末尾按 Backspace、Delete，也不会与相邻单元格或表格外的段落合并。

粘贴以及插入图片或块都会留在操作开始的单元格内。选区跨越单元格边界时，无法插入块或粘贴。单元格内不能嵌套表格或 [浮动区域](./float)；导入或粘贴这类结构时，会按顺序展开其中的内容。

普通单元格可以使用标题，但表头单元格不应用标题格式。转换为表头时，内部标题会变为普通段落，文字和其他格式保持不变。

## 单元格背景色

背景色应用于单个单元格，或通过拖动选中的矩形范围。即使只选中部分文字，也会改变这些文字所在的整个单元格的背景。浅色会适配浅色和深色主题；如果多个单元格的颜色不同，不会将某一种颜色显示为已选中。

也可以在保留当前单元格选区的情况下，通过命令更改颜色。

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

允许的值为 `yellow`、`green`、`cyan`、`pink`、`purple`、`orange`。要恢复默认背景，请在属性工具中选择 **默认**，或传入空字符串。

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

删除内容、剪切和清除格式不会清除单元格背景色。合并时使用左上角单元格的颜色，拆分时新生成的单元格也使用相同颜色。新添加的行列从默认背景开始。背景色更改支持撤销和重做。

## 单元格内容对齐与表格对齐

光标位于单元格内时，对齐应用于内部段落或图片。选中多个单元格时，会一起应用于其中可对齐的段落和对象，但不包括代码。标题、对齐和首字下沉的工具栏状态也根据实际选中的内部段落显示。如果选中段落的值不一致，不会显示为某个单一值。

要对齐表格本身，先点击属性工具中的 **选择整个表格**，再使用主工具栏的对齐按钮。将光标放在包裹表格的段落前后，出现虚线边框时，也可以使用相同的对齐功能。该边框仅提示操作对象，不会将光标变为整个表格的选区。

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

添加和删除行列、合并与拆分均以选中的单元格为准。合并后，各单元格的块按行顺序保留；拆分后，内容留在原单元格中，其他单元格为空。

## 复制与保存

选中多个单元格进行复制时，会复制屏幕上显示的整个矩形范围，包括最后一个单元格。HTML 和内部剪贴板格式会保留空单元格、合并、块、文字格式和背景色。纯文本用制表符和换行分隔单元格，并保留单元格内块之间的换行以及图片、视频地址。剪切只会清空选中单元格的内容，撤销一次即可恢复。

光标位于表格前后并显示虚线边框时，复制和剪切作用于包裹表格的整个段落。剪切会在成功写入剪贴板后，同时删除段落和表格。剪切或删除浮动区域中的表格时，外层浮动区域会保留。

保存为 JSON 和 HTML 会保留单元格中的块和背景色。简单表格导出为 Markdown 表格；包含多个块或背景色的表格则保留为 HTML，以保全内容。在 HTML 中，单元格颜色名称存储在 `td` 或 `th` 的 `data-nabi-cell-color` 属性中。外部 HTML 中任意设置的背景色样式不会导入为单元格背景色。

要在发布页面使用列排序，请将表格保存为可排序状态，并连接 `nabi-note/viewer` 的 `attachViewer()`。包含合并单元格的表格不支持列排序。

## CSS 样式

使用 `.nabi-content table` 设置表格样式，使用 `.nabi-content :is(th, td)` 设置单元格样式。条纹和表头背景只应用于未设置颜色的单元格，以免覆盖指定的背景色。

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

单元格背景色本身可通过 `--nabi-cell-yellow` 等带有颜色名称的 CSS 变量修改。请在包的 CSS 之后加载以下 CSS，并将 `table-note` 类和当前主题的 `data-nabi-theme` 值直接设置在编辑器的 `.nabi` 元素或发布页面的 `.nabi-content` 元素上。

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

如果已连接 viewer，请保留 `.nabi-sort` 按钮。强制覆盖单元格的 `position` 或右侧 padding，可能会与排序按钮重叠。
