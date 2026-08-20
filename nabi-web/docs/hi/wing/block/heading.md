---
title: शीर्षक
---

# शीर्षक

## विवरण

एक ही `headingWing` (id `h`) सभी छह स्तर संभालता है। शीर्षक अपना अलग नोड नहीं है
बल्कि **पैराग्राफ़ का एक गुण** है — संचित मान `{"w":"p","a":{"h":2}}` होता है, और
बाहर जाते समय वह `<h2>` बनता है।

चूँकि पैराग्राफ़ स्वयं शीर्षक बनता है, इसलिए संरेखण और ड्रॉप कैप जैसे दूसरे
पैराग्राफ़ गुण भी उसके साथ लगते हैं (`<h2 data-nabi-align="c">`)।

## टूलबार एक ही, स्तर कॉन्टेक्स्ट पंक्ति में

**टूलबार पर बटन सिर्फ़ `H` एक ही है।** पैराग्राफ़ पर उसे दबाएँ तो वह शीर्षक 1 बन
जाता है, और कर्सर शीर्षक के भीतर हो तो कॉन्टेक्स्ट पंक्ति में `शीर्षक`·`H1`~`H6`
कक्ष दिखते हैं — अभी कौन-सा स्तर है यह दबे हुए कक्ष से पता चलता है, और दूसरा कक्ष
दबाने पर वह उस स्तर पर चला जाता है। `शीर्षक` कक्ष दबाने पर वह पैराग्राफ़ में
लौट आता है।

खाली पंक्ति पर स्तर के बराबर `#` (जैसे स्तर 2 के लिए `##`) लिखकर स्पेस दबाएँ तो
वह अपने आप उसी स्तर का शीर्षक बन जाता है — लिखे हुए `#` और स्पेस खुद मिट जाते हैं।

## उपयोग का उदाहरण

स्तर चुनने वाला हिस्सा `mountContextToolbar` खींचता है।

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची किस्म का ज्ञान·कमांड·बिल्डर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

कमांड से सीधे भी लगाया जा सकता है।

```ts
nabi.applyCommand('setHeading', { value: 2 })  // स्तर 2 के शीर्षक में
nabi.applyCommand('setHeading', { value: 2 })  // उसी स्तर को फिर से — पैराग्राफ़ में वापस
```

कई पैराग्राफ़ चुनकर लगाएँ तो चयन जितने भी पैराग्राफ़ छूता है **उन सभी पर** लगता है।
तालिका·सूची जैसी चीज़ें जो पैराग्राफ़ की जगह लेती हैं, छूट जाती हैं — क्योंकि शीर्षक
एक टेक्स्ट पैराग्राफ़ का गुण है।

## डेमो

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
