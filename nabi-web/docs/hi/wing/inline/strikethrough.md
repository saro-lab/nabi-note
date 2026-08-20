---
title: स्ट्राइकथ्रू
---

# स्ट्राइकथ्रू

## विवरण

`strikeWing` `<s>` का स्वामी (claim) है। जिसे हटा तो दिया पर छोड़ रखना है,
ऐसे मान पर इसका उपयोग होता है।

- आते समय `<s>`·`<strike>`·`<del>` तीनों को स्वीकारा जाता है, और जाते समय हमेशा
  `<s>` निकलता है। कोई भी attribute नहीं बचता — `<del datetime="…">` का समय भी
  नहीं रहता।
- हिंट मोड का शॉर्टकट `S` है। **इसका कोई accelerator नहीं है** — उसी `emphasis`
  समूह के बोल्ड·इटैलिक·अंडरलाइन के विपरीत, इस पर `Ctrl`/`⌘` का संयोजन नहीं
  लगा है।
- टेक्स्ट चुनकर दबाने पर यह टॉगल है।
- रजिस्टर न करें तो `<s>` का खोल उतरकर वह सादा टेक्स्ट बन जाता है।

## उपयोग का उदाहरण

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची किस्म का ज्ञान·कमांड·बिल्डर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
