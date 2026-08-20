---
title: 任务列表
---

# 任务列表

## 说明

`taskListWing`（名字 `tl`，快捷键 `K`）和项目符号列表共用一个标签
（`<ul>`），但是另一份实现——出去的时候用 `data-nabi-list="task"` 表明这是
任务列表，每个条目用 `data-nabi-checked` 记录勾选状态。

条目用 `parts` 一起带过来——不是数组，是记录。

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

存值里勾选是 `ck`，值只有 `1` 一个——关闭的状态不是 `0`，而是**这一格根本不
存在**。出去的 HTML 里会被展开成 `data-nabi-checked="true"`/`"false"`。

按下按钮，光标所在的块（或选区碰到的那些块）会被包成任务列表。在行首敲
`[ ] ` 或者 `[x] `（不分大小写）效果一样；敲的是哪一种，决定了它从一开始
是不是已勾选的条目。不需要是空行，只在段落的第一行生效。

复选框不是 `<input>`，而是用 CSS 画出来的记号——因为在 `contenteditable`
里面放一个真的 input，光标会打结。选中的格子是强调色底上的白色 ✕，那一行
会变淡并且划上横线。

**能点开关的地方就是格子本身**——要按条目最前面那一小条（大约一个字符宽）
才会切换，按到文字那边就只是移动光标。从右往左写的文字里，那一条会立到反
方向。这件事翅膀用 `attach` 拿着，所以**不需要另外 mount。**

用 `Tab`/`Shift+Tab` 增减缩进、在空条目上按 Enter 结束列表，这些都和
[项目符号列表](./bullet-list)一样。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
