---
title: विभाजक
description: दस्तावेज़ के प्रवाह को बाँटने वाली क्षैतिज रेखा डालता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# विभाजक

दस्तावेज़ के प्रवाह को बाँटने वाली क्षैतिज रेखा है। खाली अनुच्छेद में तीन या अधिक hyphen लिखकर Enter दबाएँ या टूलबार से डालें।

विभाजक बिना अक्षरों वाला स्वतंत्र block है, इसलिए इसमें heading या रंग जैसा formatting नहीं रहता। इसका उपयोग केवल आगे और पीछे के अनुच्छेदों को अलग करने के लिए करें।

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
