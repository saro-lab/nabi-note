---
title: रेखांकित
---

# रेखांकित

## विवरण

`underlineWing` `<u>` का स्वामी (claim) है।

- स्वीकारा जाने वाला टैग सिर्फ़ `<u>` है। जाते समय भी हमेशा `<u>` ही निकलता है और
  कोई भी एट्रिब्यूट नहीं बचता। **`<ins>` स्वीकार नहीं होता** — उसका खोल उतर जाता है
  और सिर्फ़ टेक्स्ट रह जाता है। यह बोल्ड (`<b>`·`<strong>`) या स्ट्राइकथ्रू
  (`<s>`·`<strike>`·`<del>`) जैसा जोड़ा-टैग स्वीकारने वाला मार्क नहीं है।
- हिंट मोड का शॉर्टकट `U` है, एक्सेलरेटर `Ctrl`/`⌘`+`U` (`mod+u`) है।
- टेक्स्ट चुनकर दबाने पर यह टॉगल है।
- रेखांकित और लिंक स्क्रीन पर दिखने में एक जैसे लग सकते हैं, पर वे अलग-अलग wing
  (`a`) के अधीन अलग मार्क हैं — एक ही टेक्स्ट पर दोनों लग सकते हैं।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
