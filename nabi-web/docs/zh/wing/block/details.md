---
title: 折叠块
---

# 折叠块

## 说明

`detailsWing`（标识符 `details`，快捷键 `D`）处理手风琴式折叠块（`<details>` +
`<summary>`）。摘要行（`<summary>`）通过 `parts` 属性内置，不需要单独注册。

```ts
parts: { summary: { holds: 'inline' } }
```

点击工具栏按钮，光标所在的块会被包进一个折叠块，顶部会生成一个空的摘要行。在摘要行上按
Enter 会移动到正文内容区域（摘要行内部不会因换行而被拆开）。

**编辑画面也会照实际存储的状态渲染。** 存成折叠状态（未设置 `open`）的块在编辑器里也会以
折叠状态加载，点击左侧箭头图标可以随时展开或折叠（点击箭头会立即改动纳比树的 `o`
属性）。折叠块时如果光标原本在正文内部，光标会被安全地移到块外面。

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
