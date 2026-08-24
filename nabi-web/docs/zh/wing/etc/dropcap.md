---
title: 首字下沉
---

# 首字下沉

## 说明

`dropCapWing` 是把段落首字放大装饰显示的段落属性翅膀(`data-nabi-dropcap="1"`)。

- 以开/关单一切换的方式工作。
- 首字的大小由核心样式表中的一条 `::first-letter` 规则固定渲染(`font-size: 5.9em; line-height: .83`)。
- 用 Enter 分割段落时,首字属性不会被复制,只保留在原来的首字上。

想改大小,可以覆盖下面这条 CSS 规则:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
