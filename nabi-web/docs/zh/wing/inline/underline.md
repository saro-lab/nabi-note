---
title: 下划线
---

# 下划线

## 说明

`underlineWing` 是 `<u>` 的归属者（claim）。

- 进来时 `<u>` 和 `<ins>` 都认，出去时永远是 `<u>`。属性一个都不留。
- 提示模式的快捷键是 `U`。
- 选中文字后按下去是切换。
- 下划线和链接在画面上样子可能重合，但它们是由不同的 wing（`a`）归属的两个独立
  标记 —— 同一段文字上可以同时挂着两者。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
