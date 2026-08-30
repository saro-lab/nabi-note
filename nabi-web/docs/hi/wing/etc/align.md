---
title: संरेखण
description: अनुच्छेदों और object blocks का क्षैतिज संरेखण बदलता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# संरेखण

मौजूदा अनुच्छेद और चुने हुए दायरे के अनुच्छेदों को बाएँ, बीच या दाएँ संरेखित करता है। चित्र, वीडियो और तालिका जैसे अनुच्छेद में रखे object भी उन्हें समेटने वाले अनुच्छेद के आधार पर संरेखित होते हैं।

संरेखण अक्षर formatting नहीं, अनुच्छेद के गुण के रूप में सहेजा जाता है। code block में indentation का अपना अर्थ होता है, इसलिए उस पर संरेखण लागू नहीं होता।

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
