---
title: बोल्ड
description: चयनित पाठ को बोल्ड करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# बोल्ड

चयनित पाठ को बोल्ड करता है। उसी सीमा पर दोबारा लागू करने से फ़ॉर्मैटिंग हट जाती है। सहेजे गए दस्तावेज़ों में mark पाठ के साथ रहती है।

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
