---
title: स्ट्राइकथ्रू
description: चयनित पाठ पर काटने की रेखा लगाएँ।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# स्ट्राइकथ्रू

चुने हुए पाठ के बीच में एक रेखा खींचता है। बदली हुई शब्दावली या अब मान्य न रही जानकारी को मिटाए बिना दिखाने के लिए इसका उपयोग करें। उसी चयन पर दोबारा लगाने से यह स्वरूप हट जाता है।

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
