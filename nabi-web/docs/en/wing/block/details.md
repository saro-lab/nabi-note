---
title: Details
description: Group a summary and body, and store whether it starts open.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Details

Group a short summary and body into one block. When you create it from the toolbar, you enter the summary first and continue writing content below it.

The open state set with the triangle is stored in the document and becomes the initial state in the published view. While editing, the body is kept open so it can be changed, but the stored state value is preserved.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS Styles

Style the details block with `.nabi-content details`, and the title with `.nabi-content details > summary`.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

The `open` attribute is the initial open state saved by the author. CSS can style this state, but it is better not to force the state itself.
