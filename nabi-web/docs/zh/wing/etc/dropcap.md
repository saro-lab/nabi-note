---
title: 首字下沉
---

# 首字下沉

## 说明

`dropCapWing` 是往段落上挂 `data-nabi-dropcap="1"` 的单值段落属性。不会造出
新的块,只在已有的段落上添一个标记。

- 值只有开和关一种——再按一次按钮,属性就掉下来。
- **没有决定包住几行的选项,也没有变量。** 核心样式表里一条 `::first-letter`
  规则把大小定死了——`font-size: 5.9em; line-height: .83`。实际会盖住几行,
  由那个段落的行高决定。
- 碰到的只有开头那一个字,所以 Enter 把这个属性当标记来处理——把段落一分
  为二,它不会复制到两边,而是跟着那个字走。

想改大小就覆盖那条规则。

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
