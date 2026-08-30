---
title: उद्धरण
description: उद्धृत मजकूर किंवा वेगळा संदर्भ अनेक paragraphs मध्ये एकत्र करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# उद्धरण

उद्धृत मजकूर किंवा वेगळा संदर्भ अनेक paragraphs मध्ये एकत्र करा. रिकाम्या paragraph मध्ये `>` नंतर Space टाइप करा, किंवा toolbar मधून निवडलेले paragraphs quote मध्ये बदला.

quote मध्ये सामान्य paragraphs तसेच lists आणि images सारखे blocks असू शकतात. तीच range पुन्हा switch केल्यास ती बाहेरील paragraphs मध्ये परत उलगडते.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS शैली

border आणि spacing बदलून `.nabi-content blockquote` ने quotes style करा.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` मधील paragraph structure जशी आहे तशी ठेवा, आणि बाहेरील spacing, borders व color यांसारखे presentationच बदला.
