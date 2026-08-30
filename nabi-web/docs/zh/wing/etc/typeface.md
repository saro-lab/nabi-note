---
title: 字体
description: 给选中的文字或段落应用字体类别。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 字体

给选中文字应用字体类别。如果选中了范围，只改变该范围；如果只有光标，则应用到当前段落中的文字。实际字体文件和 `font-family` 值由服务端 CSS 定义。

默认类别是 `sans`、`serif`、`mono`、`cursive`。尤其在包含中文或其他多语言内容的服务中，最好明确决定每个类别要使用哪些字体。

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

如果省略 `values`，会使用所有默认类别。文档中只允许 `values` 包含的值。

## CSS 样式

文档只保存字体类别名称，CSS 决定实际字体文件。编辑器和发布页面应在同一个容器上修改变量。

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif SC", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

如果使用 Web 字体，请先加载字体文件。`cursive` 通常对多种语言覆盖不好，所以最好在选定服务实际使用的字体之后再提供。
