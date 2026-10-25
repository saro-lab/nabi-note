---
title: सबस्क्रिप्ट
description: चयनित पाठ को baseline से नीचे करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# सबस्क्रिप्ट

चुने हुए पाठ को आधार रेखा के नीचे छोटे आकार में दिखाता है। यह रासायनिक सूत्र `H₂O` जैसे अधोलिपि वाले लेखन के लिए उपयुक्त है। यह स्वरूप सूत्रों की गणना नहीं जोड़ता; इसका उपयोग लिखावट को सुरक्षित रखने के लिए करें।

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
