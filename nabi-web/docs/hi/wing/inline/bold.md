---
title: बोल्ड
---

# बोल्ड

## विवरण

`boldWing` `<b>` का स्वामी (claim) है। टेक्स्ट चुनकर टूलबार का **B** दबाएँ या
हिंट मोड (Shift दो बार दबाने के बाद `B`) से लगाएँ — वह हिस्सा बोल्ड हो जाता है।

- आते समय `<b>` और `<strong>` दोनों को स्वीकारा जाता है, और जाते समय हमेशा
  अकेला `<b>` निकलता है। कोई भी एट्रिब्यूट नहीं बचता — `class`·`style`·`data-*`
  गिर जाते हैं और सिर्फ़ टैग रह जाता है।
- टेक्स्ट चुनकर दबाने पर यह टॉगल (`toggleMark`) है — अगर पूरा हिस्सा पहले से
  बोल्ड है तो हट जाता है, वरना लग जाता है।
- रजिस्टर न करें तो `<b>` का खोल उतर जाता है और वह सादे टेक्स्ट में गिर जाता है
  (रजिस्टर न किए गए सभी टैग के साथ यही होता है — यह पूरे nabi का नियम है)।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
