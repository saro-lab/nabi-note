---
title: Typeface
description: Apply a typeface family to selected text or a paragraph.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Typeface

Apply a typeface family to selected text. If a range is selected, only that range changes; if there is only a caret, it applies to the text in the current paragraph. The actual font files and `font-family` values are defined by the service CSS.

The default families are `sans`, `serif`, `mono`, and `cursive`. Especially in services that include Korean or other multilingual content, it is better to decide explicitly which fonts each family should use.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

If `values` is omitted, all default families are used. Only values included in `values` are allowed in documents.

## CSS Styles

The document stores only the family name, and CSS chooses the font files. Change the variables on the same container for both the editor and published view.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

If you use web fonts, load those font files first. `cursive` often lacks good coverage for many languages, so it is better to provide it only after choosing the actual font your service will use.
