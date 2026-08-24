---
title: 自定义样式
description: 介绍如何用 CSS 变量自定义 NABI NOTE 的颜色、字体、留白等样式。
---

# 自定义样式

样式表**由宿主应用自己来挂**——打包工具环境下用一行 `import 'nabi-note/nabi.css'`，CDN 环境下用一个 `<link>` 标签。之后只要覆盖需要的 CSS 变量，整个编辑器的主题就会跟着一起变。

NABI NOTE 的所有 UI 组件都**只用 `--nabi-*` CSS 变量来画样式，没有一个写死的颜色字面量**，所以只要覆盖变量就能轻松配出自己的品牌色。

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

类选择器叠三遍的原因，请看下面的 [CSS 特异度指南](#css-特异度specificity-指南) 一节。

::: tip 存下来的 HTML 里没有内联样式
编辑器输出的 HTML(`getHtml()`)**里没有一个内联 `style` 属性。** HTML 标记只表示语义结构和属性（比如 `data-nabi-align="center"`），视觉表现全部交给样式表。所以在外部页面渲染存下来的 HTML 时，也要把它**放进挂着 `nabi.css` 的 `.nabi-content` 容器里面**，才会和编辑器画面长得一样。

详情见下面的[在外面渲染存下来的 HTML 时](#在外面渲染存下来的html时)一节。
:::

::: tip 浅色和深色主题已经内置好了
为了默认主题，宿主不需要额外定义任何变量。核心样式表里已经装好了浅色默认值、`.dark` 主题和显式的 `.light` 主题这三套。
:::

## 颜色·主题标记

| 标记 | 意思 | 默认值（浅色） |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 底色 · 略微按下去的面 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 文字 · 淡文字 · 强调色上的文字 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 线条 · 主强调色(聚焦/激活) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 危险色 · 那上面的文字 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | 下拉阴影 · 弹窗/预览的暗背景 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 圆角(默认·小·最小) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 弹出层/弹窗的圆角 | `.25rem` |
| `--nabi-z-sticky` | 顶部固定头部的 z-index | `20` |
| `--nabi-grid-cell` | 表格插入选择器等的格子大小 | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 荧光笔六色 | 半透明色 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 文字色五色 | 深色 |

上表里的变量都是核心样式表(`nabi.css`)**直接声明**的标记。声明的地方不只是 `.nabi`，为了支持独立渲染，还绑定在 `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` 这三个选择器上。

## 只引用的标记(可以写在 :root)

下面这些是核心样式表**不直接声明、只用 `var(--变量, 后备值)` 形式引用**的标记。宿主不给值的话，就用指定的后备值。因为核心层没有声明它们，所以**可以写在 `:root` 里全局生效**。

| 标记 | 意思 | 默认后备值 |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | 编辑器和字体翅膀各分支实际用到的字体 | 系统字体 |
| `--nabi-cursive-adjust` | 手写体字体的 `font-size-adjust` 比例 | `0.4` |
| `--nabi-sticky-top` | 顶部固定工具栏的上边距(设为固定头部的高度) | `0px` |
| `--nabi-preview-width` | 预览弹窗卡片的默认宽度 | `720px` |
| `--nabi-placeholder` | 空编辑器要显示的占位文字 | 无 |
| `--nabi-placeholder-color` | 占位文字的颜色(不指定就用各主题的后备色) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | 空编辑器编辑区域的最小高度(只作用于编辑区域 `.nabi-editing`) | `12.5rem` |
| `--nabi-touch-font-size` | 触屏设备(`pointer: coarse` 或宽度 40rem 以下)上表单输入框(`.nabi-input`)的字号(防止 iOS Safari 自动放大) | `16px` |

`--nabi-typeface-base` 不属于只引用的一类——**是核心直接声明的**标记(默认会引用 `--nabi-font`)。要改默认字体的话，覆盖 `--nabi-font` 就行。

`--nabi-keyboard-top` 和 `--nabi-keyboard-bottom` 是 **`mountSticky()` 量出移动端键盘高度后动态写入**的内部变量。

`--nabi-bar-height` 同样是 **`mountSticky()` 量出工具栏实际高度后写入**的内部变量。`.nabi-content > *` 元素的 `scroll-margin-block-start` 会用这个值，滚动定位时才不会被工具栏挡住。

## 没有变量的固定样式——要覆盖规则

下面这三处不是用 CSS 变量、而是用固定的 CSS 规则定义的，想改就直接覆盖对应的类选择器。

**文字大小四级**(用 `em`，跟着父级大小走)：

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**首字下沉的大小**：

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**代码块标记颜色**：

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## 单位规格

按钮大小、留白、工具栏高度等大多数 UI 尺寸都用 `rem` 定义，所以会**跟着根元素(`html`)的字号设置成比例缩放**。用户在浏览器或系统里调大默认字号，编辑器 UI 也会自然跟着一起变大。

---

## CSS 特异度(Specificity)指南

要覆盖核心声明的主题颜色变量时，为了确实把样式优先级提上去，推荐**叠三个类名**的写法。

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- 浅色默认规则 `:is(.nabi, …)` 的特异度是 **(0, 1, 0)**。
- 深色模式规则 `:where(html, body).dark :is(.nabi, …)` 的特异度是 **(0, 2, 0)**。
- 所以像 `.nabi.nabi.nabi` 这样叠三个类名，就能拿到 **(0, 3, 0)** 的特异度，不管 CSS 加载顺序如何都能稳定覆盖。

预览弹窗是挂在 `body` 的直接子元素上的，所以要同时写上 `.nabi-scrim.nabi-scrim.nabi-scrim` 选择器，那边才会用上一样的主题颜色。
像字体标记这种核心不声明、只引用的标记，在 `:root` 里声明一次就能正常生效。

---

## 浅色 / 深色主题

`html` 或 `body` 元素上有 `dark` 类就用深色主题，有 `light` 类就用浅色主题。没有类名的话默认走浅色主题，两个类名都有的话显式的 `light` 优先。

```html
<html class="dark"><!-- 或者 <body class="dark"> --></html>
```

切换主题只靠切类名就会立刻反应，不需要额外调用 JavaScript API。写自定义样式时，只要用上 `--nabi-*` 变量，切换主题时颜色也会自动跟着联动。

---

## 挂样式表的方式

**1. 整个导入 CSS 文件**(最常见、最推荐的方式)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. 只动态注入注册过的翅膀的样式**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// 调用 drop() 后，注入进去的样式会从 DOM 里清除
```

同一份样式表内容不会被重复注入，会作为单个标签统一管理。
在服务端渲染(SSR)环境下，为了防止客户端 JS 跑起来之前出现样式闪烁(FOUC)，最好用加载静态 CSS 文件的方式，而不是注入。

---

## 可自定义的 CSS 类和 UI 元素

| 选择器 | 说明 | 创建方 |
|---|---|---|
| `.nabi` | 包住整个编辑器(工具栏+编辑区域)的最上层容器 | 宿主 |
| `.nabi-content[contenteditable]` | 实际的正文编辑区域 | 宿主 |
| `.nabi-toolbar` | 包住工具栏和上下文栏的固定头部容器 | 宿主 |
| `.nabi-toolbar-row` | 主工具栏的按钮行 | `mountToolbar()` |
| `.nabi-context` | 动态上下文工具栏容器 | `mountContextToolbar()` |
| `.nabi-tools` | 预览和全屏按钮的外层 | `mountViewTools()` |
| `.nabi-hints [data-hint]` | 连按两下 Shift 时出现的快捷键提示徽标 | `mountHints()` |
| `[data-nabi-tip]` | 按钮提示(用 CSS `::after` 渲染) | 核心组件 |
| `.nabi-content.nabi-dropping` | 正在拖拽文件时的编辑区域 | `mountUpload()` |

### 弹窗和浮层元素

| 选择器 | 说明 | 创建函数 |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | 文档预览弹窗 | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 图片灯箱弹窗 | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | 粘贴格式选择弹窗 | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | 文件保存弹窗(文件名输入和格式选择) | `openSavePanel()` |
| `.nabi.is-fullscreen` | 编辑器全屏模式激活时的类 | `setFullscreen()` |

---

## 在外面渲染存下来的 HTML 时

用 `getHtml()` 取出的 HTML 字符串只由语义标记和 `data-nabi-*` 属性组成，没有内联 `style`。
想在外部页面用和编辑器一样的样式渲染，就把正文包在 `.nabi-content` 类里面，再挂上 `nabi.css`。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- 用 nabi.getHtml() 存下来的 HTML 正文 -->
</div>
```

就算不用 `.nabi` 包起来，`.nabi-content` 自己也能拿到主题和字体标记，所以能原样还原编辑器里看到的样式。

### 开启只读表格排序功能

想在发布出去的 HTML 页面里开启表格列排序功能，就挂上 `attachTableSort` 函数。

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'zh' })
```

会检测带有 `data-nabi-sortable` 属性的表格，往列标题上加排序按钮。调用返回的 `detach()` 函数，就会撤掉加上去的 DOM 按钮，还原成原来的行顺序。

::: warning 不要把 attachTableSort 用在正在编辑的 DOM 上
`attachTableSort()` 直接操作 DOM 结构，如果用在正在编辑的编辑器区域上，排序按钮的 UI 可能会被永久存进文档正文里。一定要只用在只读的浏览页面上。
:::

---

## 接下来的文档

- [{{ t('menu_wing_custom') }}](../wing/custom) —— 亲手做一个还没有的自定义格式翅膀
- [{{ t('menu_intro_index') }}](../intro) —— NABI NOTE 的介绍和架构

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
