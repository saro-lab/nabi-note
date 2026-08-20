---
title: 文字大小
---

# 文字大小

## 说明

`fontSizeWing`（名字 `fs`）是**行内值标记**。是罩在文字上的格式，不是段落
属性。出去的时候画成 `<span data-nabi-size="lg">`。

值有 `xs`·`sm`·`lg`·`xl` 四个，默认大小不是第五个值，而是**根本没有这个
属性**。

- 和字体（`tf`）是一对——一只翅膀拿着全部的值，挑选的地方是上下文工具栏。
  只是字体是并排摆四个格子，大小用的是一根刻度。
- **上下文工具栏是一个刻度（`range`）。** 大小是有顺序的值（从小到大），
  所以不用并排的格子，而是用一个滑块来推。现在挂着的值显示成滑块的位置，
  提示文字上会带着那个值的名字。
- **刻度最前面那一格是"默认"。** 之所以在最前面而不是正中间，是因为清单是
  从小到大排的，最前面正好是"什么都没挂"的位置。滑到这一格，写进去的不是
  `base` 这样的值，而是**标记直接被剥掉**。
- **格子的提示文字跟着语言走**——中文里是"默认 · 特别小 · 小 · 大 ·
  特别大"。
- 按工具栏按钮会挂上 **`lg`（大）**。因为刻度是从小的那头起的，什么都不做
  的话挂上的会是第一格 `xs`，可没人希望按一下调大字号的按钮字反而变小。
- **只有光标时会挂到整个段落**上。让字变大很少只是为了一个词，所以没选中
  范围就瞄准整个段落（这一点和荧光笔、文字色不同，那两个只瞄准现在标记
  延续的那一段）。
- 在一个字都没有的段落上按下去，会留成**预约**——接下来敲的字会带着这个
  大小出来。
- 再挂一次同样的值就会脱掉。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
