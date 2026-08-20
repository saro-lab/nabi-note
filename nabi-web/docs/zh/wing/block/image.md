---
title: 图片
---

# 图片

## 说明

`imageWing`（名字 `img`）拥有图片（`<img>`）。和 `hr`·`youtube` 一样是**没有
内容的块状物件**。按下按钮会弹出地址输入面板。

**地址是靠协议来过滤的，不是靠扩展名。** 只放行 `http:`·`https:` 和相对路径，
`//example.com/a.png` 这种协议相对地址会被拒绝。是不是以 `.png` 结尾**没有
人看**——因为不带扩展名也能给出图片的地址很常见。

光标进不到图片里面去，所以点一下图片，那张图就整个被选中，上下文工具栏跟着
出现。

| 类别 | 格子 |
|---|---|
| 宽度 | 从 `30` 到 `100`，每十一格，共八格（默认 `60`）——是一根刻度，现在的值会一起显示 |
| 查看 | 只把这一张图放大看——不改动文档 |

**上下文工具栏只有这两个。** 左、中、右对齐的格子不在这里——图片的位置不是
图片自己的属性，而是**包着它的包装段落**的属性,所以是工具栏的对齐按钮管这
件事。

**新插入的图片是居中的**——因为 `insertLump` 立起来的时候会给包装段落穿上
对齐 `c`。

出去的时候宽度挂在图片上，对齐挂在包着它的段落上。

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

对齐值是 `l`·`c`·`r`。不会有内联 `style` 出去——实际的样子由挂着 `nabi.css`
的 `.nabi-content` 里那张读这些属性的样式表来画。

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

打开 `allowLocalUrls`，`blob:`·`data:image/...` 这类地址也放行——只在没有
服务器、要先把文件预览出来的演示和上传场景里打开。默认是关的。

图片坏掉时（地址失效了、过期了，或者 blob 消失了）占位块会自动出现——这件事
翅膀用 `attach` 拿着，`mountSurface` 会一并挂上已注册翅膀的 `attach`。
**不需要另外 mount。** 这个标记只给画面看，绝不会留在存下来的值里。

`allowLocalUrls` 能在两处打开——整个编辑器（`createNabiWith(wings,
{ allowLocalUrls: true })`），或者只给图片翅膀一个（`makeImageWing({
allowLocalUrls: true })`）。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

想把上传得来的文件（`blob:` 地址）就那么开着，就写：

```ts
makeImageWing({ allowLocalUrls: true })
```

## 演示

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
