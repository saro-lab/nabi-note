---
title: 项目符号列表
---

# 项目符号列表

## 说明

`bulletListWing`（名字 `ul`，快捷键 `L`）拥有 `<ul>`。条目用 `parts` 一起带
过来，不用单独注册 `li`——不是数组，是记录。

```ts
parts: { li: { holds: 'blocks' } }
```

按下按钮，光标所在的块（或选区碰到的那些块）会被包成列表，再按一次就解开、
回到段落。按别的列表按钮会换成那个类别。

在行首敲一个连字符再敲空格（`- `），结果也一样。**不需要是空行**——检查的
只是光标前面的行首，所以 `- 后面有字`这样敲空格也会触发，后面的字会原样
留在条目里面。不过只在段落的**第一行**生效。

- `Tab` 把这一条缩进一级、变成正上方那个同级条目的子项。第一个条目没有地方
  可以缩进，所以按了没有反应——在列表里面 `Tab` 不会插入空格。
- `Shift+Tab` 把它退到父项的下一个同级——在最上层退出去就离开列表变成段落。
  选区跨了好几个条目的话，碰到的条目会一起动。
- **在空条目上按 Enter 是退出去。** 如果是最上层，列表就在那里结束，光标落
  到下面新的段落里。结束列表走的就是这条路。
- **在条目最前面按 Backspace 会并入前一个条目。** 没有能合并的前一个条目就
  退一级。条目最后面按 Delete 则相反，会把下一个条目拉过来。
- 条目里面是块，所以会包一层段落。标记（加粗等）和别的行内翅膀在那层段落
  里能照常用。
- 标签原本带的 `type` 这类属性活不下来。列表里混进不是条目的东西，不会被
  丢弃，而是包成一个条目。
- 和任务列表共用标签（`<ul>`），但是不同的翅膀——靠一个标记属性区分
  （带 `data-nabi-list="task"` 的是任务列表）。

## 嵌套是真正的标记

结构原样留在存值里。只是**条目装的是块而不是文字**，所以文字会包一层段落，
嵌套的列表会立在包装段落里面。

```html
<li><p>一</p><div data-nabi-p><ul><li><p>二</p></li></ul></div></li>
```

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` 由 `parts` 自动带过来，不要直接放进数组里。

## 演示

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
