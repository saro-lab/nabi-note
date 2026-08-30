---
title: उद्धरण
description: उद्धरण या अलग संदर्भ को कई अनुच्छेदों में बाँधता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# उद्धरण

उद्धरण या अलग संदर्भ को कई अनुच्छेदों में बाँधता है। खाली अनुच्छेद में `>` के बाद Space दबाएँ, या चुने हुए अनुच्छेदों को टूलबार से उद्धरण में बदलें।

उद्धरण के भीतर सामान्य अनुच्छेद के साथ सूची और चित्र जैसे blocks भी रख सकते हैं। उसी दायरे को दोबारा बदलने पर वह बाहर के सामान्य अनुच्छेद बन जाता है।

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS शैलियाँ

उद्धरण की सीमा और खाली जगह `.nabi-content blockquote` से बदली जा सकती है।

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` के भीतर अनुच्छेद संरचना वैसी ही रखें और केवल बाहरी margin, सीमा और रंग जैसी प्रस्तुति बदलें।
