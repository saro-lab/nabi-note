---
title: रेखांकन
description: चयनित पाठ को रेखांकित करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# रेखांकन

चयनित पाठ को रेखांकित करता है। उसी सीमा पर दोबारा लागू करने से फ़ॉर्मैटिंग हट जाती है, और mark सहेजे गए दस्तावेज़ों में बनी रहती है।

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
