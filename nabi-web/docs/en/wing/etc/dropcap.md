---
title: Drop Cap
description: Begin body text with a large first letter.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Drop Cap

Place the first letter of a paragraph at a larger size and let the following lines flow beside it. This is paragraph-level formatting, so it is not applied to only part of a selected word.

The published view and editing view keep the same shape. While editing, the first letter is wrapped in a real element so caret and delete positions do not drift; that element is not included in the saved document content.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS Styles

The published view and editing view use different selectors for the first letter. The published view uses `[data-nabi-dropcap="1"]::first-letter`, while the editing view uses the real element `[data-nabi-dropcap-letter]`. When changing visible values such as color, font, or size, write both selectors together so editing and published output look the same.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

If you change size and line height, apply the same values to both selectors.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Drop caps calculate the line flow around the first letter, so changing only one side or making the values too large can break the WYSIWYG shape. Still avoid adding a new `::first-letter` rule to the editor. In the editor, style only the existing `[data-nabi-dropcap-letter]`.
