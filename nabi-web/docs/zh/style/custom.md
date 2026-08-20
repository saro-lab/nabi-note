---
title: 自定义样式
description: 颜色、外观都用 CSS 变量来覆盖。
---

# 自定义样式

样式表**由宿主来挂**——用打包工具就是一行 `import 'nabi-note/nabi.css'`，
CDN 就是一行 `<link>`。挂上之后，剩下的只要覆盖变量就行。

组件规则里**没有一个字的颜色字面量。** 全都用 `--nabi-*` 变量画出来，所以只要
覆盖变量，其余的都会跟着变。

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

类名叠三遍的原因在下面的[不被特异度挡住](#不被特异度挡住)里。

::: tip 这篇文档的大前提——存下来的值不能独自站起来
导出的 HTML（`getHtml()`）里**没有一个字的内联 `style`。** 存下来的值只用属性
说"是什么"（`data-nabi-align="center"`），"看起来怎样"由这份样式表来说。所以
读取存下来的 HTML 去画的那一边，也要**挂着这份样式表的 `.nabi-content` 里面**
才会和编辑器长得一样——见下面[在外面画存下来的 HTML 时](#在外面画存下来的html时)。
:::

::: tip 深色·浅色已经内置好了
为了主题，宿主**不需要**覆盖任何标记。核心样式表自带浅色默认值、`.dark` 覆盖、
显式 `.light` 覆盖三套。这个站点自己在编辑器里面除了四个字体标记之外，什么都
没有覆盖。
:::

## 颜色·外观标记

| 标记 | 意思 | 默认值（浅色） |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 底色 · 略微按下去的面 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 文字 · 淡文字 · 强调色上的文字 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 线条 · 强调色 | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 危险色 · 那上面的文字 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | 盒子阴影 · 预览背景 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 圆角 | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 层（面板、预览、灯箱）的圆角 | `.25rem` |
| `--nabi-z-sticky` | 贴住的那一行的层级 | `20` |
| `--nabi-grid-cell` | 表格尺寸格子的单格大小 | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 荧光笔六色 | 半透明色 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 文字色五色 | 深色 |

这张表只列了核心样式表（`nabi.css`）**自己声明**的部分。声明的地方不是只有
`.nabi` 一处，而是三处——`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`。
预览浮层是 `body` 的子元素，从 `.nabi` 那儿继承不到；孤零零站在编辑器外面的
`.nabi-content` 也得直接拿到标记才行。

同一份清单写了三遍（浅色默认值·`.dark`·显式 `.light`）。**覆盖的一方不需要看
全部三遍**——只要赢过特异度，覆盖一次就对三种情况都生效。只是想在深色下用别的
值，就得自己加上 `.dark` 条件。

## 只引用、没有值的标记

下面是核心**只引用、不声明**的变量。宿主不给值的话，括号里的后备值就会生效。
因为没有声明的地方，**写在 `:root` 里就直接生效**——这正是和上面颜色·外观
标记的区别（那些声明在 `.nabi` 上，继承赢不了）。

| 标记 | 意思 | 后备值 |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | 实际接到字体翅膀四个分支上的字体 | 系统字体 |
| `--nabi-cursive-adjust` | 手写体的 `font-size-adjust`。手写体字形的 x-高度偏低，同样的 px 看起来会更小，这个值按 x-高度重新配平 | `0.4` |
| `--nabi-sticky-top` | 贴住的行要往下让多少。站点上有固定头部的话就是它的高度 | `0px` |
| `--nabi-preview-width` | 预览卡片的宽度。**`openPreview` 打开时会量出编辑区域的宽度直接写在卡片上**，宿主从外面覆盖也拗不过那个内联值 | `720px` |

`--nabi-typeface-base` 不属于这一类——**是核心声明的**（默认跟着 `--nabi-font`
走）。字体翅膀没有选项能定这个值，想改就覆盖这个标记。

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` 也站在同样的位置，但这个是
**核心自己写的**——`mountSticky()` 量出手机键盘顶起画面的距离写在这里，贴住的行
和全屏读的就是这个值。不是手写的值。

## 没有标记的地方——要覆盖规则本身

下面三处**没有变量。** 核心把值钉死在规则里，想改就得覆盖那个选择器。

**文字大小四级**——用 `em`，所以跟着父级大小走。

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**首字下沉的大小**——不是定几行的值，而是一个字号。实际盖住几行由那个段落的
行高决定。

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**代码标记颜色**——代码翅膀的样式表直接给 `[data-nabi-token]` 写颜色。现在有
颜色的分支是**五个**。

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

上色器答出的 `type` 是任意字符串——答出上面五个之外的名字就没有颜色，想用的
分支由宿主用同样的写法自己加规则。深色下想用别的颜色，要自己加 `.dark` 条件——
核心没有给这五个配深色版本。

上传翅膀的进度动画（`--nabi-per`·`--nabi-t`·`--nabi-span`·`--nabi-clear`·
`--nabi-blur-max`）是**翅膀内部实现用的**——名字虽然以 `--nabi-` 开头，但不是
开放给宿主覆盖的地方。

---

## 外观尺寸用的是 `rem`

按钮、留白、工具栏标签这些外观尺寸大多是 `rem`，**跟着根元素（`html`）的字号
一起变大。** 用户在浏览器或系统里调大字号，编辑器的框架也会跟着变大。想改大小
就改根元素的 `font-size`。边框（`border`）不是尺寸而是**线**，所以有的地方还
留着 `px`。

---

## 不被特异度挡住

要覆盖颜色·外观标记，得叠上**三个类名**。

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--我的强调色);
}
```

数一下是这样的。浅色默认规则 `:is(.nabi, …)` 因为 `:is()` 按参数里最高的算，
所以是 **(0,1,0)**；深色规则 `:where(html, body).dark :is(.nabi, …)` 里
`:where()` 算 0，`.dark` 和 `:is()` 各算一个类，所以是 **(0,2,0)**。因此
`.nabi.nabi` 和深色规则打**平手**——平手时后写的那条赢，而核心样式表完全可能
比宿主样式表晚加载。叠到三个变成 (0,3,0) 才不用靠加载顺序。

预览浮层立在 `.nabi` 外面（`body` 的子元素），那边的选择器也要一起写，颜色
才会一致。

**像字体这种核心不声明的标记不需要打这场仗**——没有声明的地方，光靠继承就够得
到，`:root` 写一行就行。

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## 浅色·深色

`html` 或 `body` **两者之一**上有 `dark` 类就是深色，`light` 就是浅色。没有类
的话浅色是默认，两个都有的话显式的 `light` 赢（`.light` 规则加载在 `.dark`
规则后面）。

```html
<html class="dark"><!-- 或者 <body class="dark"> --></html>
```

切换类名之后 CSS 会自动反应。没有要调用的 API。主题只换颜色变量，组件规则不变
——自己写的样式只要用 `--nabi-*` 变量，也会跟着深色走。

---

## 挂样式表的两条路

**① 一个文件**——最常见的路。装着所有翅膀的 CSS。

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② 只注入注册过的**——只想装真正打开的那些翅膀的样式表时用。

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// 调用 drop() 只撤掉这次调用放进去的部分
```

同一段文字的样式表**只会进去一次**——去重的钥匙是样式表的**内容**，所以一份
文档里立好几个编辑器也不会叠加，就算翅膀组合各不相同也会合并成一份并集。

:::: tip 两者有两点不一样——装的是什么，什么时候挂上
**装的是什么。** 文件没法知道注册了哪些翅膀，所以**全部**装进去。注入会看
`registry`，**只装注册过的**。只展示保存的 HTML、没有编辑器的页面没有
`registry`，就用文件那条路。

**什么时候挂上。** 文件以 `<link>` 的样子进头部，加载期间**挡住画面渲染**；
注入则要等**编辑器的 JavaScript 到达之后**才会挂上。所以在服务器上把文档
预先画好送下去的页面，该走文件这条路——走注入的话，服务器送来的文档会先
光秃秃地画一遍，样式贴上去之后又要重新排布局。
::::

注册的翅膀的样式表加载在核心样式表**之后**，所以同等优先级下翅膀会赢。

---

## 能挂东西的地方

变量做不到的，就直接瞄准真实存在的类名。

| 选择器 | 是什么 | 谁挂上去的 |
|---|---|---|
| `.nabi` | 包住整个编辑器（工具栏区 + 编辑区域）的外壳。颜色·外观标记挂在这里 | 宿主 |
| `.nabi-content[contenteditable]` | 编辑区域本身 | 宿主 |
| `.nabi-toolbar` | 包住工具栏行 + 上下文工具栏行的地方。这个类名本身就是"贴在上面" | 宿主 |
| `.nabi-toolbar-row` | 工具栏坐进去的容器 | `mountToolbar()` |
| `.nabi-context` | 上下文工具栏坐进去的容器 | `mountContextToolbar()` |
| `.nabi-tools` | 预览、全屏两个按钮的位置——核心会浮到右上角 | `mountViewTools()` |
| `.nabi-tool` | 那两个按钮本身 | `mountViewTools()` |
| `.tb-group` | 工具栏的按钮分组 | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | 上下文工具栏的分组·按钮·色样·文字框 | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | 表格尺寸格子等按钮下弹出的盒子 | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | 新建时弹出的地址输入层 | `mountToolbar()` |
| `.nabi-hints [data-hint]` | 连按两下 Shift 弹出的快捷键提示——标签是 `::before`，名字是 `::after`，两个一起显示 | `mountHints()` |
| `[data-nabi-tip]` | 提示（tooltip）——只用 CSS `::after` 画 | 核心整体 |
| `.nabi-content.nabi-dropping` | 拖着文件悬停时的编辑区域。提示文字挂在 `data-nabi-drop` 属性上 | `mountUpload()` |

预览、全屏也是**核心自己搭的。**

| 选择器 | 是什么 | 谁 |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | 文档预览浮层 | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 单张图片放大看的盒子 | `openImageLightbox()` |
| `.nabi.is-fullscreen` | 全屏——把 `.nabi` 容器固定到整个画面 | `setFullscreen()`（类名是 `FULLSCREEN_CLASS`） |

挂上 `mountViewTools()`，那两个按钮就会自己开关这些。想自己手动开，就调用
`openPreview({ nabi, editor })` · `openImageLightbox({ editor, src, alt?, locale })` ·
`setFullscreen(root, on)` · `isFullscreen(root)`。

::: tip 工具的位置是自己立起来的
`mountViewTools` 会自己造出 `.nabi-tools` 盒子，塞进拿到的容器最前面。宿主不用
自己先把 `<span>` 放在工具栏前面——先占好位置反而会立出两个盒子。
:::

编辑画面专用的标记也能瞄准——`[data-nabi-token]`（代码块的标记颜色）、
`[data-nabi-lang]`（代码块的语言）、`[data-color]`（荧光笔·文字色——靠
`<mark>`·`<span>` 标签区分）、`data-nabi-align`·`data-nabi-typeface`·
`data-nabi-size`·`data-nabi-dropcap`（段落属性）。这些标记的真正名字以各个
翅膀文件里的 `*_ATTR` 常量为准。

---

## 在外面画存下来的 HTML 时

导出的值（`getHtml()`）是留着 `data-nabi-*` 属性的 HTML，**一个字的内联
`style` 都没有。** 意思是外观全归样式表管，所以没有样式表去画的话，就是一段
没有对齐、没有字号、没有表格分隔线的裸 HTML。

想画得和编辑器一样，用 `.nabi-content` 包起来——这个类名不用 `.nabi` 包着也能
直接拿到颜色·外观标记（`nabi.css` 的 `.nabi-content:where(:not(.nabi *))`
规则）。

```html
<div class="nabi-content">保存下来的 HTML</div>
```

样式表照上面「挂样式表的两条路」那样挂就行——打包工具就是 `import
'nabi-note/nabi.css'`，其余情况一行 `<link>`。就算不立编辑器的页面，只要有
`.nabi-content`，核心样式表就会把标记声明好。

### 只在阅读一侧跑的行为——表格排序

现在**只有表格排序**是以只读一侧专用函数的形式提供的。还没有让任意翅膀各自挂
读取端行为的通用体系。

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'zh' })
```

会找出挂着 `data-nabi-sortable` 的表格，往表头格上加排序按钮。解绑函数
（`detach`）会撤掉插上去的按钮、还原换过的行顺序。

::: danger 不要挂在正在编辑的元素上
`attachTableSort()` 会往 DOM 里插按钮、改行顺序。挂着的时候把 DOM 存下来，
这些改动就会被固化进值里——只读一侧只该挂在只读的副本上。
:::

---

## 接下来的文档

- [{{ t('menu_wing_custom') }}](../wing/custom) —— 亲手做出没有的格式
- [{{ t('menu_intro_index') }}](../intro) —— 这篇文档用的词

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
