---
title: सुपरस्क्रिप्ट
description: चयनित पाठ को baseline से ऊपर करें।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# सुपरस्क्रिप्ट

घातों और संदर्भ चिह्नों के लिए चयनित पाठ को baseline से ऊपर करता है। दोबारा लागू करने से फ़ॉर्मैटिंग हट जाती है।

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
