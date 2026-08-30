---
title: YouTube
description: Embed a YouTube video in the document and adjust its width.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Accept a YouTube video URL or video ID and turn it into an embed block. The document stores only the 11-character video ID and width, not the full URL, and a new video starts centered at 70% width.

Width is chosen from fixed steps, and alignment is stored on the paragraph that wraps the video. In the editor, the first click selects the video; after it is selected, clicking again can play it. To change the address, delete the video and insert a new one.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS Styles

Use `.nabi-content iframe` to change the border or corners of the video. Do not change the stored width or alignment.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

The package uses `aspect-ratio`, width, and alignment margins to keep the video sized correctly, so do not override them.
