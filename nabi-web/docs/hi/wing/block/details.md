---
title: फ़ोल्ड ब्लॉक
---

# फ़ोल्ड ब्लॉक

## विवरण

`detailsWing` (id `details`, शॉर्टकट `D`) फ़ोल्ड बॉक्स (`<details>` + `<summary>`)
का स्वामी है। शीर्षक-पंक्ति `parts` के ज़रिए साथ आती है, इसलिए उसे अलग से रजिस्टर
नहीं करना पड़ता — यह ऐरे नहीं, रिकॉर्ड है।

```ts
parts: { summary: { holds: 'inline' } }
```

बटन दबाने पर कर्सर से छुए ब्लॉक एक नए फ़ोल्ड बॉक्स में लिपट जाते हैं, और एक खाली
शीर्षक-पंक्ति सबसे आगे बैठती है। शीर्षक-पंक्ति में Enter दबाने पर कर्सर सामग्री
में उतर जाता है (शीर्षक-पंक्ति ख़ुद नहीं टूटती)।

**एडिटर सहेजे गए रूप को ठीक वैसा ही खींचता है।** मुड़ी हुई अवस्था में सहेजा गया
बॉक्स एडिटर में भी मुड़ा हुआ ही दिखता है, और तिकोना निशान दबाने पर वहीं खुलता-मुड़ता
है — वह दबाना ही सहेजे गए मान (`o`) को बदल देता है। मोड़ते समय कर्सर भीतर हो तो
कर्सर बॉक्स से बाहर आ जाता है।

::: tip कॉन्टेक्स्ट पंक्ति नहीं है
पहले **खुला रखकर सहेजें** · **मोड़कर सहेजें** नाम के दो बटन थे। जब स्क्रीन हमेशा
खुली हुई ही खींचती थी, तब सहेजने पर कौन-सी अवस्था जाएगी यह बताने का यही एक रास्ता
था। अब स्क्रीन सहेजे गए मान को ज्यों का त्यों खींचती है और तिकोना निशान ही उसे
बदलता है, इसलिए यही बात दो बार कहने वाली जगह बन गई थी और हटा दी गई।
:::

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
