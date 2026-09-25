---
title: "Icon themes"
description: "Use CSS variables to replace wing, preview, fullscreen, panel, diff, and table-sort icons. Mix SVG, WebP, and PNG files; unspecified icons use the packaged defaults."
---

# Icon themes

Use CSS variables to replace wing, preview, fullscreen, panel, diff, and table-sort icons. Mix SVG, WebP, and PNG files; unspecified icons use the packaged defaults.

## Choose files

Load the CSS and add a theme class to the editor or a shared parent. Images keep their original colors, transparency, and aspect ratio.

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

Use root-relative paths such as `/icons/...` or full HTTPS URLs. Relative paths are not guaranteed to resolve beside the theme file. When hosting CSS yourself, copy the matching version of `dist/icons/` beside `nabi.css`. A failed image leaves an empty icon, but the button name, tooltip, and action remain available.

## Find other icons

Prefix an icon element's `data-nabi-icon` value with `--nabi-icon-` to get its CSS variable. For example, `diff-close` uses `--nabi-icon-diff-close`. See the <a href="/llms/icons.md" target="_blank" rel="noopener">icon contract</a> for all context, menu, save, history, and other key rules, including special-character encoding.

## Dark mode and panels

Changing a theme class or CSS variable updates icons without mounting again. Default icons follow light/dark themes. Custom files do not inherit `currentColor`; assign dark variants as above when needed. Panels opened under `body` also follow the source editor's icon theme and class/style changes. Put variables on the editor or a shared parent, not only inside the toolbar.

## Choose default buttons

`showPreview` and `showFullscreen` both default to `true`. Setting either to `false` removes that button, its focus target, and its events. Both `false` also omits the empty tools region.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

Pass the same visibility options to SSR and mounting. To change the configuration, call `tools.unmount()` and mount with new options. If neither button is needed, you can still omit the tools mount and SSR markup entirely. Direct calls to `openPreview()` and `setFullscreen()` remain available.
