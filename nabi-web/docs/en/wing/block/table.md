---
title: Table
description: Create rows and columns, edit cells, and support column sorting.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Table

Choose rows and columns from the toolbar to create a table. Inside a cell, content continues with line breaks instead of multiple paragraphs, and Tab and Shift+Tab move to the next or previous cell.

Adding and deleting rows or columns, merging cells, and toggling header cells operate around the selected cells. To use column sorting in the published view after saving a table as sortable, connect `attachViewer()` from `nabi-note/viewer`. Tables with merged cells are not sorted.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS Styles

Style the table with `.nabi-content table`, and cells with `.nabi-content :is(th, td)`. Do not change the cell structure or the sort button inserted by the viewer.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

If the viewer is connected, keep the `.nabi-sort` button. If you forcibly override cell `position` or right padding, it can overlap the sort button.
