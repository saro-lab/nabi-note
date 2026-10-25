---
title: सुपरस्क्रिप्ट
description: चयनित पाठ को baseline से ऊपर करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# सुपरस्क्रिप्ट

चुने हुए पाठ को आधार रेखा के ऊपर छोटे आकार में दिखाता है। इसका उपयोग घातांक या पादटिप्पणी के चिह्नों के लिए किया जा सकता है और यह केवल चुने हुए हिस्से पर लागू होता है।

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
