---
title: 引用
---

# 引用

## 说明

`quoteWing`(标识符 `quote`)负责处理引用块(`<blockquote>`)。它拥有 `place: 'container'` 和 `holds: 'blocks'` 属性,所以除了普通段落之外,里面还能放表格、图片等其他块状元素。

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["引用文字"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

点击工具栏按钮,选中的块就会被包成引用。如果选区已经是引用,同一个按钮会把它解开。

在段落开头输入 `>` 加一个空格,该段落会自动转换成引用。

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
