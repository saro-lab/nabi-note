---
title: Table
description: Put multiple paragraphs and blocks in cells, and edit backgrounds, merging, and alignment.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Table

Choose rows and columns from the toolbar to create a table. Cells can contain multiple paragraphs, images, lists, quotes, code, collapsible sections, and videos. Place the cursor in a cell to edit rows, columns, merging, headers, and background colors using the property tools below.

Try editing the paragraphs and lists inside the cells in the example below, then drag across several cells to change their backgrounds together. Click **Select table** in the property tools to align the table itself from the main toolbar.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Register the wings you want to use inside cells as well. For an editor with all basic wings, assemble it with `wings().allBasic()`.

## Writing inside cells

| Input | Behavior |
| --- | --- |
| Enter in a regular paragraph | Creates a new paragraph in the same cell. |
| Shift+Enter | Inserts a line break in the current paragraph or list item. |
| Tab / Shift+Tab in a regular paragraph | Moves to the next / previous cell. |
| Tab / Shift+Tab in a list or code | Uses that block's indent / outdent behavior. |

Enter in lists and code follows each block's input rules. Even when code cannot be outdented further, Shift+Tab does not move to the previous cell. Backspace or Delete at the start or end of a cell does not merge it with an adjacent cell or a paragraph outside the table.

Pasting and inserting images or blocks stays within the cell where the operation began. Block insertion and pasting are unavailable for selections crossing cell boundaries. Tables and [float regions](./float) cannot be nested inside cells; importing or pasting such structures unwraps their contents in order.

Regular cells can contain headings, but heading formatting is not applied in header cells. Converting a cell to a header turns its headings into regular paragraphs while preserving text and other formatting.

## Cell background colors

Background colors apply to one cell or a rectangular range selected by dragging. Even when only part of the text is selected, the entire containing cell's background changes. The pale colors adapt to light and dark themes. When selected cells have different colors, no single color is shown as selected.

You can also change the color with a command while keeping the current cell selection.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Allowed values are `yellow`, `green`, `cyan`, `pink`, `purple`, and `orange`. To restore the default background, choose **Default** in the property tools or pass an empty string.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Deleting content, cutting, and clearing formatting do not clear cell background colors. Merging uses the top-left cell's color; splitting gives newly created cells the same color. Newly added rows and columns start with the default background. Background color changes support undo and redo.

## Aligning cell content and tables

With the cursor in a cell, alignment applies to its paragraphs or images. Selecting multiple cells applies alignment to all alignable paragraphs and objects inside them, excluding code. The toolbar states for headings, alignment, and drop caps also follow the actual selected inner paragraphs. Mixed values across selected paragraphs are not displayed as a single value.

To align the table itself, click **Select table** in the property tools, then use the main toolbar's alignment buttons. The same alignment is available when the cursor is before or after the paragraph wrapping the table and a dashed border appears. This border only indicates the target; it does not turn the cursor into a whole-table selection.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Adding or deleting rows and columns, merging, and splitting operate on the selected cells. Merging keeps each cell's blocks in row order. Splitting keeps the content in the original cell and leaves the other cells empty.

## Copying and saving

Copying a selection of multiple cells copies the visible rectangular range through the last cell. HTML and the internal clipboard format preserve empty cells, merges, blocks, text formatting, and background colors. Plain text separates cells with tabs and line breaks, preserving line breaks between blocks within a cell and image and video URLs. Cutting only empties the selected cells' content and can be reversed with one undo.

When the cursor is before or after a table and the dashed border appears, copying and cutting apply to the entire paragraph wrapping the table. Cutting removes both the paragraph and the table after writing to the clipboard succeeds. Cutting or deleting a table inside a float region leaves the outer float region in place.

Saving to JSON or HTML preserves cell blocks and background colors. Simple tables export as Markdown tables; tables with multiple blocks or background colors remain HTML to preserve their content. In HTML, the cell color name is stored in the `data-nabi-cell-color` attribute on `td` or `th`. Arbitrary background color styles from external HTML are not imported as cell background colors.

To enable column sorting in the published view, save the table as sortable and connect `attachViewer()` from `nabi-note/viewer`. Tables with merged cells are excluded from column sorting.

## CSS styles

Style tables with `.nabi-content table` and cells with `.nabi-content :is(th, td)`. Apply stripes and header backgrounds only to cells without a color, so they do not override assigned background colors.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Change cell background colors themselves through CSS variables named after the colors, such as `--nabi-cell-yellow`. Load the following CSS after the package CSS, and assign the `table-note` class and the current theme's `data-nabi-theme` value directly to the editor's `.nabi` element or the published view's `.nabi-content` element.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

If the viewer is connected, keep the `.nabi-sort` button. Forcibly overriding cell `position` or right padding may cause overlap with the sort button.
