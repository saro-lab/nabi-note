---
title: 编号列表
---

# 编号列表

## 说明

`orderedListWing`（名字 `ol`，快捷键 `N`）拥有 `<ol>`。条目用 `parts` 一起
带过来，不用单独注册 `oli`——不是数组，是记录。

```ts
parts: { oli: { holds: 'blocks' } }
```

按下按钮，光标所在的块（或选区碰到的那些块）会被包成编号列表，再按一次就
解开。按别的列表按钮会换成那个类别。

在行首敲一个数字加句点加空格（比如 `1. `，数字是几都算起点），结果也一样。
**数字位数最多到九位**（`1234567890. ` 不会触发），句点后面像 `1.2 ` 这样
再接别的东西也不会触发。不需要是空行——检查的只是光标前面的行首，只在段落
的第一行生效。

- 用 `Tab`/`Shift+Tab` 增减缩进、在空条目上按 Enter 结束列表、在条目最前面
  按 Backspace 并入前一条目，这些都和[项目符号列表](./bullet-list)一样。
- 编号不会进存值——是 `<ol>` 自己画出来的，插入或删掉条目浏览器会自动重新
  编号。
- 嵌套也是真正的标记，原样留在存值里。条目装的是块，所以文字会包一层段落，
  嵌套的列表立在包装段落里面。
- `start`·`type` 这类属性活不下来。所以带着 `start="5"` 进来的列表也会
  从一重新数。

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
