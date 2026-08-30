---
title: 荧光笔
description: 在选中文字背后应用允许的荧光笔颜色。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 荧光笔

在选中文字背后应用荧光笔颜色。保存的数据只保留允许的颜色名称，而不是任意 CSS 颜色值，因此文档数据和视觉样式保持分离。

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

如果省略 `values`，默认调色板是 `yellow`、`green`、`cyan`、`pink`、`purple` 和 `orange`。如果缩小列表，加载已有文档时未注册的颜色也不会被保留。

## CSS 样式

文档只保存颜色名称。编辑器和发布页面中的实际颜色通过 CSS 变量改变。

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

同时调整多种颜色，可以在保留文档颜色名称的同时，只改变产品的视觉气质。

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
