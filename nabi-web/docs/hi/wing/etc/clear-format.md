---
title: फ़ॉर्मैट हटाना
description: चुने हुए दायरे से अक्षर और अनुच्छेद formatting हटाता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# फ़ॉर्मैट हटाना

चुने हुए दायरे का अक्षर formatting एक साथ हटाता है। इसमें bold, रंग और typeface जैसे registered basic marks तथा heading, alignment और drop cap जैसे अनुच्छेद गुण शामिल हैं। Esc को जल्दी दो बार दबाने पर भी यही कार्रवाई होती है।

यह सूची, तालिका, उद्धरण और चित्र जैसी दस्तावेज़ संरचना को plain text में नहीं बदलता। चित्र और वीडियो का बाहरी संरेखण तथा upload से बने attachment links भी बने रहते हैं।

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

जिस formatting को हटाना है, उसकी wing भी चुनी होनी चाहिए।
