---
title: इटैलिक
---

# इटैलिक

## विवरण

`italicWing` `<i>` का स्वामी (claim) है। अनजाने शब्दों या उद्धरण जैसे अलग रंगत
वाले टेक्स्ट पर इसका उपयोग होता है।

- आते समय `<i>` और `<em>` दोनों को स्वीकारा जाता है, और जाते समय सब अकेले `<i>`
  में समेट दिया जाता है। कोई भी एट्रिब्यूट नहीं बचता।
- हिंट मोड (Shift दो बार दबाना) का शॉर्टकट `I` है — इसे भौतिक कुंजी (`KeyI`) से
  पकड़ा जाता है, इसलिए कोरियाई कीबोर्ड पर भी काम करता है।
- टेक्स्ट चुनकर दबाने पर यह टॉगल है।
- रजिस्टर न करें तो `<i>` का खोल उतर जाता है और वह सादे टेक्स्ट में गिर जाता है।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
