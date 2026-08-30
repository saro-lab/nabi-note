---
title: Font Size
description: Change text size within the allowed steps.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Font Size

Change selected text to a size step. If a range is selected, the step applies to that range; if there is only a caret, it changes the text size of the current paragraph. Stored data keeps only allowed steps, not arbitrary values such as `px`.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

If `values` is omitted, the `xs`, `sm`, `lg`, and `xl` steps are used. If you narrow the list, other steps already present in older documents are removed when loaded.

## CSS Styles

You can change sizes through stored-step selectors such as `.nabi-content [data-nabi-size="xs"]`. Do not invent arbitrary steps that are not in the document; adjust CSS only within registered `values`.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Keeping the size difference between steps consistent preserves the meaning the author chose in the editor when the document is published.
