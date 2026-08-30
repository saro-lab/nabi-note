---
title: स्ट्राइकथ्रू
description: चयनित पाठ पर काटने की रेखा लगाएँ।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# स्ट्राइकथ्रू

चयनित पाठ पर काटने की रेखा लगाता है। उसी सीमा पर दोबारा लागू करने से फ़ॉर्मैटिंग हट जाती है, और mark सहेजे गए दस्तावेज़ों में बनी रहती है।

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
