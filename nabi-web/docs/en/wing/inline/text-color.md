---
title: Text Color
description: Apply an allowed color name to selected text.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Text Color

Apply a color name to selected text. The stored value is not a CSS color string; it is an allowed name, and the actual color is defined by the `--nabi-tc-<name>` CSS variable. That lets the same document stay readable in both light and dark themes.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

If `values` is omitted, the default palette is `green`, `coral`, `violet`, `amber`, and `blue`. If you reduce the list, other colors are rejected by commands and when loading documents.

## CSS Styles

The document stores only color names. Set the actual editor and published view colors with CSS variables.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Check contrast together with the background color. In a dark theme, the same color name can receive a different value.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
