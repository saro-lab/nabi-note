---
title: "Footnote"
description: "Connect extra explanations with numbers in the text and a list at the end of the document."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Footnote

Connect extra explanations with numbers in the text and a list at the end of the document.

Enter text using the footnote toolbar button to insert a footnote at the caret. With a text selection, it is inserted at the end without replacing the selected text. Numbers are not stored; they are assigned automatically in document order.

Click a number in the body to edit its text in the property row. Use the delete control, or press Backspace or Delete twice beside the footnote to select and then remove it. The list below is read-only and disappears when there are no footnotes.

In preview and published pages with the viewer attached, hover over, click, or tap a number to read its text. Content accepts one line of plain text and uses a sans-serif font at 0.875 of the body’s base size. HTML is displayed literally.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
