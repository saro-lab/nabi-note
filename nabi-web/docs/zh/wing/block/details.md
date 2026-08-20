---
title: 折叠块
---

# 折叠块

## 说明

`detailsWing`（名字 `details`，快捷键 `D`）拥有折叠框（`<details>` +
`<summary>`）。摘要行用 `parts` 一起带过来，不用单独注册——不是数组，是
记录。

```ts
parts: { summary: { holds: 'inline' } }
```

按下按钮，光标碰到的块会被包进一个新的折叠框，一个空的摘要行立在最前面。
在摘要行上按 Enter 会落到内容里面（摘要行本身不会被拆开）。

**编辑器照存下来的样子画。** 存成折叠状态的框在编辑器里也是折叠的，按小
三角就会当场展开或折叠——这一按会直接改动存值（`o`）。折叠的时候如果光标
正好在里面，光标会被移到框外面。

::: tip 没有上下文工具栏
以前有**存成展开**·**存成折叠**两个按钮。那是因为画面总是画成展开的样子,
只有这两个按钮才能说清楚要存成哪一种。现在画面照存值原样画,小三角本身
就能改动它,两个按钮说的是同一件事,所以撤掉了。
:::

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
