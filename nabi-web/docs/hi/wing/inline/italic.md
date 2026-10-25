---
title: इटैलिक
description: चयनित पाठ को इटैलिक करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# इटैलिक

चुने हुए पाठ को तिरछा दिखाता है। रचनाओं के शीर्षकों या विदेशी शब्दों को मुख्य पाठ से थोड़ा अलग दिखाने के लिए यह उपयोगी है। पहले से तिरछे पाठ पर फिर से दबाने से यह स्वरूप हट जाता है।

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
