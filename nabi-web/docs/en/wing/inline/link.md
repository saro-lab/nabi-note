---
title: Link
description: Connect safe web addresses and show uploaded attachments.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Select text and attach an address to it. If you enter an address without selecting text, the address itself is inserted as the link text. Typing an `http://` or `https://` address and then pressing Space or Enter also turns it into a link.

Links only store `http:`, `https:`, and same-site paths that begin with `.` or `/`. Addresses whose origin cannot be clearly identified, such as `javascript:` or `//example.com`, are rejected. Attachment links created by uploads also store file information, and cannot be created manually like ordinary links.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS Styles

Style ordinary links with `.nabi-content a`, and attachment links separately with `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

The `::before` and `::after` parts of attachment links are used to show the file icon and extension, so it is usually best not to replace or remove their `content`.
