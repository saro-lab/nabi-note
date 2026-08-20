---
title: 字体
---

# 字体

## 说明

`typefaceWing`（名字 `tf`）是**行内值标记**。是做好的常量，直接放进数组
就行，没有选项要传。出去的时候画成 `<span data-nabi-typeface="serif">`。

值是 `sans`·`serif`·`mono`·`cursive` 四个（`TYPEFACES`）。

- **一个字体名字都不拿着。** 挑的是**类别**，实际出来的是哪一款字体，由宿主
  搭在 `--nabi-font`·`--nabi-font-serif`·`--nabi-font-mono`·
  `--nabi-font-cursive` 这四个标记上的值决定。
- 四个类别全由**一只翅膀**拿着。挑选的地方是上下文工具栏的四个格子
  （`select`），另外还有一个工具栏按钮作为入口。按下按钮会挂上 `serif`。
- **什么都没挂的文字穿的是 `--nabi-typeface-base`。** 这个标记是整个编辑器
  的底色字体，不动它就跟着 `--nabi-font` 走。没有单独一格用来选"默认"——
  把已经挂着的类别**再选一次就会脱掉**，回到那个位置。
- 挑选的格子都用**自己指的那款字体**来显示。衬线格子用衬线写，等宽格子用
  等宽写，不知道名字也能看出选的是什么。
- **只有光标时会挂到整个段落**上。一个字都没有的段落上会留成预约，接下来
  敲的字会带着这个字体出来。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

宿主搭上去的字体是 CSS 里的一处。在一个类别下面堆好几款字体，浏览器会为每个
字从前往后找，用第一款带这个字的字体来画，所以不管写进什么语言，那个类别的
样子都保持得住。

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## 演示

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
