---
title: CSS 主题
description: 用 CSS 变量设置编辑器和发布页面的颜色、字体、大小和深色模式。
---

# CSS 主题

NABI NOTE 在编辑和发布内容中使用同一套 CSS。先加载一次包样式表，然后只在服务容器上覆盖需要的变量。

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

为编辑器的 `.nabi` 和发布页面的 `.nabi-content` 指定相同的主题类，即可对两者应用相同变量。在包的 CSS 之后加载业务 CSS，并通过 `data-nabi-theme` 指定当前主题。

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## 常用变量

| 用途 | 变量 |
| --- | --- |
| 文字和背景 | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| 边框和强调色 | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| 圆角和阴影 | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| 字体族 | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| 编辑 surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| 粘性工具栏和预览 | `--nabi-sticky-top`, `--nabi-preview-width` |
| 触控控件 | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| 移动模式切换宽度 | `--nabi-mobile-breakpoint` |

高亮和文字颜色分别使用 `--nabi-hl-<name>`、`--nabi-tc-<name>`。表格单元格背景色使用 `--nabi-cell-<name>`，支持 `yellow`、`green`、`cyan`、`pink`、`purple`、`orange`。变量只改变显示颜色，不改变存储的颜色名称。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

默认主题使用浅淡的单元格背景色。深色模式保留相同的颜色名称，但使用另一组更明亮、饱和度更低的颜色，让它们在深色背景上也容易区分。这些颜色为半透明，会透出底色；自定义时请在实际页面背景上检查与文字的对比度。要覆盖元素的默认颜色变量，应像上例一样，把主题类指定在实际的编辑器或发布内容元素上，而不是任意外层父元素上。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## 移动模式切换宽度

默认 `layout: 'compact'` 工具栏在屏幕宽度小于 `36rem` 时切换为移动端单行布局。恰好为 `36rem` 时保留桌面布局。桌面端即使编辑器本身较窄，也会换行显示全部工具。对象属性工具也会在下方换行，两行都占据正文上方的空间。全屏模式无论屏幕宽度如何，都展开全部工具。

移动端的主工具栏保留快捷工具、全部工具按钮，以及已连接的预览和全屏按钮。属性工具出现时，这些按钮仍可一起使用。全部工具面板沿用桌面端的分组顺序和分隔线。`layout: 'wrap'` 始终换行显示全部工具。

移动端面板在工具栏和属性工具周围的可用空间内打开。表格尺寸选择器是例外：它会在半透明背景上居中打开，显示便于触摸的 5×5 网格。它不等待键盘关闭，选好尺寸后插入一个表格并关闭。

可在 `:root`、祖先元素或单个 `.nabi` 上设置 `--nabi-mobile-breakpoint` 来改变阈值。使用 `rem`、`px`、`calc()` 等非负 CSS 长度值。CSS 值、根字号或屏幕宽度变化时，已打开的面板也会自动更新。移至 `body` 下的输入面板仍遵循原编辑器的阈值。

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

浮动区域切换为单列的阈值是独立的。它依据正文容器的宽度，而非屏幕宽度；低于 `36rem` 时显示为一列，打印时也使用相同布局。

## 深色模式

浅色模式是默认值。可以给 `html` 或 `body` 添加 `.dark`，也可以在某个编辑器或发布正文上设置 `data-nabi-theme="dark"`。

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

使用 `data-nabi-theme="light"` 可以退出祖先元素的 `.dark`。主题切换由你的应用控制；包不会自动跟随 `prefers-color-scheme`。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## 发布页面也应用 CSS

发布 HTML 也需要 `.nabi-content` 和同一套 CSS。表格、代码块、图片、任务列表和首字下沉不需要 JavaScript 也能呈现。只有在需要表格排序或代码高亮等行为时才添加 `nabi-note/viewer`。

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

正文宽度和行高等包不负责的布局，请在服务自己的 class 上设置。

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## 不要改变编辑结构

不要在编辑中的 `[data-key]` 节点上改变 `display` 或 `white-space`，不要在可编辑文字中添加伪元素，也不要禁用对象 wrapper 的 pointer 行为。这些规则可能破坏光标几何和文档映射。

发布页面的首字下沉使用 `::first-letter`，而编辑 surface 使用真实的 `[data-nabi-dropcap-letter]` 元素。不要在 `.nabi-editing` 内再添加另一个 `::first-letter` 规则，也不要替换这个元素。
