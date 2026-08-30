---
title: 文字颜色
description: 给选中的文字应用允许的颜色名称。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 文字颜色

给选中文字应用颜色名称。保存的值不是 CSS 颜色字符串，而是允许的名称；实际颜色由 `--nabi-tc-<name>` CSS 变量定义。这样同一份文档在浅色和深色主题中都能保持可读。

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

如果省略 `values`，默认调色板是 `green`、`coral`、`violet`、`amber` 和 `blue`。如果缩小列表，其他颜色会在命令执行和文档加载时被拒绝。

## CSS 样式

文档只保存颜色名称。编辑器和发布页面中的实际颜色通过 CSS 变量设置。

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

请和背景色一起检查对比度。在深色主题中，同一个颜色名称可以使用不同的值。

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
