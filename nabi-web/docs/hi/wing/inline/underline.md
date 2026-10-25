---
title: रेखांकन
description: चयनित पाठ को रेखांकित करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# रेखांकन

चुने हुए पाठ के नीचे रेखा खींचता है। यह लिंक जैसा दिख सकता है, लेकिन केवल पाठ का स्वरूप है; इसमें कोई पता या कहीं जाने की क्रिया नहीं जुड़ती।

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
