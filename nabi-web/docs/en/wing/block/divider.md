---
title: Divider
---

# Divider

## Description

`dividerWing` (name `hr`) owns a single `<hr>`. It is **`place: 'void'`** — a lump
with no inside, so there is nowhere for the caret to go. Press Backspace or Delete
right before or right after a divider and that one block disappears whole;
selecting a range across it gives the same result.

Press the button and the divider stands **wearing a wrapper paragraph of its own**.
No extra empty paragraph comes with it — the caret sits on that wrapper paragraph,
just past the divider.

Where it lands depends on whether the paragraph the caret was in had any text.

| Where the caret was | Result |
|---|---|
| a paragraph with text | it stands **after** that paragraph |
| an empty paragraph | it **takes that paragraph's place** — no blank line is left behind |

When it takes an empty paragraph's place, the alignment that paragraph was
carrying survives.

Type three or more hyphens (`---`) at the start of a line and press Enter for the
same result — that auto-conversion is **triggered by Enter**.

## Usage

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// The wing list builds the kind knowledge, the commands and the builders together — that is the `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
