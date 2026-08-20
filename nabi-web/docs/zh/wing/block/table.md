---
title: 表格
---

# 表格

## 说明

`tableWings`（名字 `table`，快捷键 `T`）拥有 `table > tr > td` 这套结构。

行（`tr`）和格（`td`）不用单独注册——表格翅膀用 `parts` 把它们一起带过来，
关掉表格，行、格也会一起退场。

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

格是 `singleParagraph` 这一点守住了格子——在格子里按 <kbd>Enter</kbd> 段落不会
一分为二，跨两个格子的选区删掉也不会把两格合并。

按下按钮出来的不是切换，而是一张行×列的尺寸格子（最多 8×8）；选定尺寸的表格会
落到光标的位置，光标随即移到第一格。

只有光标在表格里面时，上下文工具栏上才会出现这些命令。

| 类别 | 格子 |
|---|---|
| 行 | 在上方插入行 · 在下方插入行 · 删除行 |
| 列 | 在左侧插入列 · 在右侧插入列 · 删除列 |
| 合并 | 合并（一个切换开关） |
| 标题 | 将此行设为标题行 · 将此列设为标题列（会变成 `<th>`） |
| 排序 | 打开/关闭排序（在读者一侧给列排序） |
| 删除 | 删除表格 |

**合并是一个切换开关**——不是分方向的按钮。选中好几个格子按下去就合成一个，
光标放在合并过的格子上再按一次就拆开。

**把表格盒子放在左、中、右的格子不在这一行里。** 表格的位置不是表格自己的属性，
而是包着它的那层包装段落的属性，所以是工具栏上的对齐按钮管这件事。

::: warning 排序标记和合并
排序只是**一个标记**而已。编辑器会照样把这个标记挂在合并过的表格上，合并这个
动作也不会把已经挂着的标记剥掉。

只是**读者一侧会拒绝**——`attachTableSort` 对看得见合并格子的表格根本不会挂
上去。合并的行绑在一起，重新排列会破坏格子结构。所以合并过的表格就算挂着标记，
也什么都不会发生。
:::

## 宽度由内容说了算

表格没有宽度设置。表格**只按内容**撑开，比位置更宽时就在那个位置上**横向
滚动**——页面不会被顶开。也没有一层包着的 `<div>`。存下来的值里出现的只有一个
`<table>`，附上的属性只有对齐（`data-nabi-align`）和排序标记。

## 移动与选择

用 `Tab`/`Shift+Tab` 在格子之间移动（到了表格尽头就停在原地）。格子只装行内
内容，所以 Enter 不会把格子劈开，而是**在那个格子里面换行**——因为要劈开就得
造出格子装不下的块。方向键跟着格子走，不是跟着画面走。

可以用鼠标跨多个格子拖选。这个拖选也是翅膀用 `attach` 拿着的，**不需要另外
mount** ——`mountSurface` 会一并挂上。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
