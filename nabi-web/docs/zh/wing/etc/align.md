---
title: 对齐
---

# 对齐

## 说明

`alignWing`（id `align`）**只有一个**，左、中、右三个全靠它一个拿着。在工具栏
上是个常量——不是把三个捆成一个的 `align()` 工厂,而是每个值各有自己的按钮。
往块上挂 `data-nabi-align` 属性。

- 这是标签原封不动、只加属性的**块属性**。像 `<p data-nabi-align="center">`
  这样，段落本身不会变。
- **挂得上段落，也挂得上标题。** `<h2 data-nabi-align="c">` 也行——因为标题
  也是一行普通的文字。段落的四个属性里只有对齐是这样，文字大小、字体、首字
  下沉仍然是段落专用的。
- 值一次只能有一个——挂着左对齐时按居中对齐，左对齐就掉下来、居中对齐挂上去。
  按当前已挂着的那个值，属性会整个掉下来（回到默认对齐）。
- **Enter 会把对齐原样传给两边。** 拆开一个段落,两个段落都会带着同样的对齐
  出来——这和标题（`h`）在空的那一边掉下来、首字下沉（`dc`）只跟着一边走不同,
  对齐没有这种例外。
- 三个是一只翅膀的**三个按钮**（`buttons`）——不能分开关闭或打开,只把
  `alignWing` 这一个放进 wings 数组。
- **表格、图片、YouTube 的位置也是这只翅膀管的。** 块状物件住在包着它的
  包装段落里面，是那层段落带着对齐,所以"居中对齐的图片"其实就是"居中对齐的
  段落里的图片"。所以图片、表格的上下文工具栏里根本没有对齐格子,而且唯独
  对齐，就算光标停在块状物件上，工具栏里也不会藏起来。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
