---
title: Highlight
description: Apply an allowed highlight color behind selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Highlight

Apply a highlight color behind selected text. Stored data keeps only allowed color names instead of arbitrary CSS color values, so the document data and visual style stay separate.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

If `values` is omitted, the default palette is `yellow`, `green`, `cyan`, `pink`, `purple`, and `orange`. If you narrow the list, colors that are not registered are not preserved even when an existing document is loaded.

## CSS Styles

The document stores only color names. Change the editor and published view colors through CSS variables.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Changing several colors together lets you keep the document's color names while adapting only the product mood.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
