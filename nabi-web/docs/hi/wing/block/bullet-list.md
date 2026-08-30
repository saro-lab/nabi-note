---
title: बुलेट सूची
description: कई मदों को बिना क्रम के सूचीबद्ध करती है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# बुलेट सूची

कई मदों को बिना क्रम के सूचीबद्ध करती है। खाली अनुच्छेद में `-` के बाद Space दबाएँ या टूलबार से बदलें। चुने हुए अनुच्छेदों को भी एक साथ सूची में बाँधा जा सकता है।

सूची के भीतर Tab एक स्तर अंदर करता है और Shift+Tab बाहर लाता है। Enter अगला मद बनाता है; खाली मद पर दोबारा Enter दबाने से सूची समाप्त होती है।

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
