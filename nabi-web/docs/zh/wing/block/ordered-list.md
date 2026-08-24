---
title: 编号列表
---

# 编号列表

## 说明

`orderedListWing`(名字 `ol`，快捷键 `N`)拥有 `<ol>`。条目通过 `parts` 一起带
过来，不用单独注册 `oli`。

```ts
parts: { oli: { holds: 'blocks' } }
```

按下按钮，光标所在的块(或选区碰到的那些块)会变成编号列表，再按一次就恢复
成普通段落。按别的列表按钮会立刻换成那个类别。

在段落开头敲 `1. `(数字、句点、空格)也会自动转换成编号列表。起始数字随便
填，最多能认到九位。

### 快捷键与编辑行为

- 用 `Tab`/`Shift+Tab` 增减缩进、在空条目上按 Enter 结束列表、在条目最前面
  按 Backspace 并入前一条目，这些都和[项目符号列表](./bullet-list)一样。
- 每个条目的编号由 HTML `<ol>` 标签在浏览器里动态渲染，所以中间插入或删除
  条目时编号会自动重新计算。
- 嵌套列表结构通过包装段落(`<div data-nabi-p>`)安全地嵌套渲染。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
