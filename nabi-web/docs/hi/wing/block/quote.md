---
title: उद्धरण
---

# उद्धरण

## विवरण

`quoteWing` (id `quote`) उद्धरण-बॉक्स (`<blockquote>`) का स्वामी है। यह
`place: 'container'` और `holds: 'blocks'` है — इसके भीतर ब्लॉक रहते हैं। बाकी वस्तुओं
की तरह उद्धरण भी ख़ुद एक रैपर-पैराग्राफ़ पहनकर शीर्ष स्तर पर बैठता है।

**इस पर `allows` नहीं लगा है।** उद्धरण के भीतर वही नियम चलता है जो शीर्ष स्तर पर
चलता है, इसलिए तालिका या छवि भी रैपर-पैराग्राफ़ पहनकर उसके भीतर बैठ सकती है — ऐसा
HTML पेस्ट करने या इम्पोर्ट करने पर वह जैसा है वैसा ही बचा रहता है।

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["टेक्स्ट"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

पर **डालने वाला बटन उद्धरण के भीतर नहीं जाता।** छवि·तालिका·विभाजक जैसी चीज़ें जो
`insertLump` से बैठती हैं, वे हमेशा **शीर्ष स्तर** पर ही जगह लेती हैं — इसलिए कर्सर
उद्धरण के भीतर हो तब भी नई वस्तु उद्धरण के **बाद** बैठती है। उद्धरण के भीतर डालना हो
तो पेस्ट करके डालना पड़ता है।

बटन दबाने पर चुनाव में आए शीर्ष-स्तर के सारे ब्लॉक उद्धरण में लिपट जाते हैं। जो
चुना है वह **पूरा पहले से उद्धरण हो तभी** खुलता है — मिला-जुला हो तो एक बार और
लपेट दिया जाता है।

पंक्ति की शुरुआत में सिर्फ़ `>` लिखकर स्पेस दबाने पर भी वह पंक्ति उद्धरण बन जाती
है — इस स्वचालित रूपांतरण का **ट्रिगर स्पेस है** (Enter नहीं), क्योंकि लिखना उसी
पंक्ति पर आगे बढ़ता है।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
