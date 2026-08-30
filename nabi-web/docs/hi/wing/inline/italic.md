---
title: इटैलिक
description: चयनित पाठ को इटैलिक करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# इटैलिक

चयनित पाठ को इटैलिक करता है। उसी सीमा पर दोबारा लागू करने से फ़ॉर्मैटिंग हट जाती है, और mark सहेजे गए दस्तावेज़ों में बनी रहती है।

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
