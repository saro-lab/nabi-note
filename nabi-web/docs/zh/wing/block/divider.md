---
title: 分割线
---

# 分割线

## 说明

`dividerWing`（名字 `hr`）拥有一个 `<hr>`。**`place: 'void'`**——没有内容的
块状物件，光标没有地方能进去。在分割线紧前或紧后按 Backspace、Delete，那
一个块就整个消失，拉出范围选中它结果也一样。

按下按钮，分割线会**穿着自己的包装段落**立起来。不会连带生出一个空段落——
光标会落在那层包装段落上，紧跟在分割线后面。

立的位置由光标所在段落有没有文字决定。

| 光标原本在哪里 | 结果 |
|---|---|
| 有文字的段落 | 立在那个段落**后面** |
| 空段落 | **换掉**那个段落——不会留下一行空行 |

换掉空段落时，那个段落原本带着的对齐会原样保留。

在行首只有三个或以上连字符（`---`）的状态下按 Enter，结果也一样——这个
自动转换**由 Enter 触发**。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
