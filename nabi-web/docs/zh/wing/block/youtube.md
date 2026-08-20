---
title: YouTube
---

# YouTube

## 说明

`youtubeWing`（名字 `youtube`，没有快捷键）拥有 YouTube 嵌入（`<iframe>`）。
和 `hr`·`img` 一样是**没有内容的块状物件**（`place: 'void'`）。按下按钮会
弹出地址输入面板，只有 `watch?v=`·`youtu.be/`·`/embed/`·`/shorts/`·`/v/`·
`/live/` 这几种形态的 YouTube 地址能通过（包括 `www.`·`m.`·`music.` 前缀和
`youtube-nocookie.com`）——判定不是靠字符串包含检查，而是用 `URL()` 解析，
所以像 `youtube.com.evil.test` 这样的地址混不过去。

不会照单全收传进来的地址，只抽出**11 位的视频 id** 存下来。地址不会留在
存值里——留下来的只有 `{"w":"youtube","a":{"v":"<id>","w":"70"}}`，出去
的时候会重新拼成 `https://www.youtube-nocookie.com/embed/<id>` 这一个
样子。

和 `hr` 一样的理由，光标进不到里面去，紧前紧后按 Backspace、Delete 会整个
消失。不是 YouTube 的嵌入进来时会**整个丢掉**——不把陌生的文档立进我们的
文档里。

## 上下文工具栏

点一下视频会出现两个格子。

| 类别 | 格子 |
|---|---|
| 宽度 | `50`·`60`·`70`·`80`·`90`·`100` 六档（默认 `70`）——是一根刻度，现在的值一起显示 |
| 地址 | 填着现在这个视频 id 的输入面板 |

**左、中、右对齐的格子不在这里。** 视频的位置不是视频自己的属性，而是
**包着它的包装段落**的属性，所以是工具栏的对齐按钮管这件事。新插入的视频
会让包装段落穿上居中对齐（`c`）。

所以出去的时候宽度挂在视频上，对齐挂在包着它的段落上。

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

不会有内联 `style` 出去。宿主想用自己的 UI 插入，可以直接调用命令——
`applyCommand('insertYoutube', { v: 地址, w: '80' })`，只想改宽度就用
`applyCommand('setYoutubeWidth', { w: '80' })`。清单外的宽度会被拒绝。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
