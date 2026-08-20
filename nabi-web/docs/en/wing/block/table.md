---
title: Table
---

# Table

## Description

`tableWings` (name `table`, shortcut `T`) owns the `table > tr > td` structure.

Rows (`tr`) and cells (`td`) are never registered separately — the table wing
brings them along through `parts`, so take the table out and the rows and cells go
with it.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

The cell's `singleParagraph` is what protects the grid — press <kbd>Enter</kbd>
inside a cell and the paragraph will not split in two, and deleting a selection
that spans two cells will not merge them into one.

Pressing the button is not a toggle: a size grid of rows × columns (up to 8×8)
appears, a table of the size you pick goes in at the caret, and the caret moves to
the first cell.

Commands appear on the context toolbar only while the caret is inside a table.

| Group | Fields |
|---|---|
| Row | add row above · add row below · delete row |
| Column | add column left · add column right · delete column |
| Merge | merge (a single toggle) |
| Header | make this row a header · make this column a header (they turn into `<th>`) |
| Sorting | turn sorting on/off (ordering columns on the reading side) |
| Delete | delete table |

**Merge is one toggle**, not a button per direction. Select several cells and press
it and they become one; put the caret in a merged cell and press it again and the
merge comes apart.

**There is no field here for putting the table box left, centre or right.** A table's
placement is carried by the wrapper paragraph holding it, not by the table, so the
alignment buttons on the main toolbar do that job.

::: warning The sorting marker and merged cells
Sorting is **only a marker**. The editor will happily set it on a merged table, and
merging does not strip a marker that was already there.

The reading side is what refuses — `attachTableSort` will not attach at all to a
table with visible merged cells, because merged rows are tied together and
reordering would break the grid. So on a merged table the marker sits there and
nothing happens.
:::

## The content decides the width

A table has no width setting. It grows **only as wide as its content**, and when it
grows wider than the space it has, it **scrolls sideways** in place — the page is
never pushed out. There is no wrapping `<div>` either. What goes into the stored
value is a single `<table>`, and the only attributes on it are the alignment
(`data-nabi-align`) and the sorting marker.

## Moving and selecting

`Tab` / `Shift+Tab` move between cells (at the end of the table they stay put).
Because a cell is fixed to a single paragraph, Enter does not split the cell — it
**breaks the line inside that cell**, since splitting would mean inventing a block
the grid cannot hold. The arrow keys move along the grid rather than along the
screen.

You can drag across several cells with the mouse to select them. That drag
selection is held by the wing itself through `attach`, so **there is nothing extra
to mount** — `mountSurface` wires it up for you.

## Usage example

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
