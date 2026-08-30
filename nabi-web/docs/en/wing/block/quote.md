---
title: Quote
description: Group quoted text or separate context across multiple paragraphs.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Quote

Group quoted text or separate context across multiple paragraphs. Type `>` followed by Space in an empty paragraph, or switch selected paragraphs to a quote from the toolbar.

A quote can contain ordinary paragraphs as well as blocks such as lists and images. Switching the same range again unwraps it back into outside paragraphs.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS Styles

Style quotes with `.nabi-content blockquote` by changing borders and spacing.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

Keep the paragraph structure inside `blockquote`, and change only presentation such as outside spacing, borders, and color.
