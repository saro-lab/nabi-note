---
title: "图标主题"
description: "使用 CSS 变量替换翼模块、预览、全屏、面板、差异比较和表格排序图标。可混用 SVG、WebP 和 PNG；未指定的图标使用默认文件。"
---

# 图标主题

使用 CSS 变量替换翼模块、预览、全屏、面板、差异比较和表格排序图标。可混用 SVG、WebP 和 PNG；未指定的图标使用默认文件。

## 指定文件

加载 CSS，并在编辑器或共同父元素上添加主题类。图片保留原有颜色、透明度和宽高比。

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

请使用 `/icons/...` 这样的根相对路径或完整 HTTPS URL。不能保证相对路径以主题文件所在目录为基准。自行托管 CSS 时，将同版本的 `dist/icons/` 复制到 `nabi.css` 旁。图片加载失败时图标为空，但按钮名称、提示和操作仍然可用。

## 查找其他图标

在图标元素的 `data-nabi-icon` 值前加上 `--nabi-icon-` 即得到 CSS 变量。例如 `diff-close` 对应 `--nabi-icon-diff-close`。上下文、菜单、保存、历史等完整键规则和特殊字符编码见<a href="/llms/icons.md" target="_blank" rel="noopener">图标约定</a>。

## 深色模式和面板

更改主题类或 CSS 变量即可更新图标，无需重新 mount。默认图标遵循浅色和深色主题。自定义文件不继承 `currentColor`，需要时请按上例指定深色版本。在 `body` 下打开的面板也会跟随原编辑器的图标主题及类、样式变化。请将变量放在编辑器或共同父元素上，不要仅放在工具栏内部。

## 默认按钮显示

`showPreview` 和 `showFullscreen` 默认均为 `true`。设为 `false` 会移除对应按钮及其焦点目标和事件。两者均为 `false` 时也不创建空工具区域。

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR 与 mount 应传入相同的显示选项。更改配置时，先调用 `tools.unmount()`，再用新选项 mount。如果两个按钮都不需要，仍可直接省略工具 mount 和 SSR 标记。直接调用 `openPreview()` 和 `setFullscreen()` 的功能保持可用。
