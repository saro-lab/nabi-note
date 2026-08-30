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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

把共用 token 放在共同父元素上，让编辑器和发布页面保持同一种视觉语言。

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

荧光笔和文字颜色 token 使用 `--nabi-hl-<name>` 与 `--nabi-tc-<name>`。例如修改 `--nabi-hl-yellow`，会改变已保存的 `yellow` 荧光笔显示颜色，而不会改变文档数据。

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## 深色模式

浅色模式是默认值。可以给 `html` 或 `body` 添加 `.dark`，也可以在某个编辑器或发布正文上设置 `data-nabi-theme="dark"`。

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

使用 `data-nabi-theme="light"` 可以退出祖先元素的 `.dark`。主题切换由你的应用控制；包不会自动跟随 `prefers-color-scheme`。

```css
.dark .brand-note {
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
  --nabi-font: "Noto Serif SC", "Source Serif 4", serif;
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
