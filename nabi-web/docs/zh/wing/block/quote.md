---
title: 引用
---

# 引用

## 说明

`quoteWing`（名字 `quote`）拥有引用框（`<blockquote>`）。`place: 'container'`，
`holds: 'blocks'`——里面住的是块。和别的块状物件一样，引用自己也穿着一层
包装段落站在最上层。

**没有限定 `allows`。** 引用里面的规则和最上层一样，所以表格、图片也能穿着
包装段落立在里面——粘贴或加载这样的 HTML 进来会原样留下来。

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["文字"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

不过**插入按钮不会插到引用里面。** 图片、表格、分割线这类靠 `insertLump`
立起来的东西永远落在**最上层**，就算光标在引用里面，新的块状物件也会立在
引用**后面**。要插进引用里面得靠粘贴。

按下按钮会把选区碰到的最上层块全部包成引用。只有碰到的**全部已经是引用**
时才会解开——混着的话会再包一层。

在行首只有 `>` 的状态下敲空格，那一行也会变成引用——这个自动转换**由空格
触发**（不是 Enter），因为是接着同一行往下写。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
