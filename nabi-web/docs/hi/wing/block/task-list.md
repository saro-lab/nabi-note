---
title: चेकलिस्ट
---

# चेकलिस्ट

## विवरण

`taskListWing` (id `tl`, शॉर्टकट `K`) बुलेट सूची के साथ टैग (`<ul>`) साझा करता है
पर उसका कार्यान्वयन अलग है — बाहर जाते समय `data-nabi-list="task"` से यह चेकलिस्ट
है यह दिखाया जाता है, और हर आइटम पर `data-nabi-checked` से चेक-स्थिति दिखाई जाती
है।

आइटम `parts` के ज़रिए साथ आता है — यह ऐरे नहीं, रिकॉर्ड है।

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

सहेजे गए मान में चेक `ck` है और इसका मान सिर्फ़ `1` होता है — बंद स्थिति `0` नहीं,
**कक्ष का सिरे से न होना** है। बाहर जाने वाले HTML में यह
`data-nabi-checked="true"`/`"false"` में खुलता है।

बटन दबाने पर, कर्सर जिस ब्लॉक में है उसे (या चुनाव में आए ब्लॉकों को) चेकलिस्ट में
लपेट दिया जाता है। पंक्ति की शुरुआत में `[ ] ` या `[x] ` (छोटे-बड़े अक्षर से फ़र्क़
नहीं पड़ता) लिखने पर भी वही नतीजा है, और आपने कौन-सा लिखा उसके हिसाब से आइटम शुरू
से ही चेक किया हुआ बनता है। खाली पंक्ति होना ज़रूरी नहीं, और यह सिर्फ़ पैराग्राफ़
की पहली पंक्ति पर ही लगता है।

चेकबॉक्स `<input>` नहीं, CSS से खींचा गया चिह्न है — `contenteditable` के भीतर
असली input रखने पर कर्सर उलझ जाता है। चालू कक्ष चटख रंग की टाइल पर सफ़ेद ✕ है,
और उस पंक्ति का रंग फीका पड़कर उस पर आड़ी लकीर खिंच जाती है।

**चालू-बंद करने की जगह ख़ुद वह कक्ष ही है** — आइटम के आगे की सँकरी पट्टी (लगभग एक
अक्षर जितनी चौड़ी) दबाने पर ही बदलता है, टेक्स्ट की तरफ़ दबाने पर सिर्फ़ कर्सर वहाँ
जाता है। दाएँ-से-बाएँ लिखी जाने वाली भाषा में वह पट्टी दूसरी तरफ़ बैठती है। यह काम
wing ख़ुद `attach` से करता है, इसलिए **इसके लिए अलग से कुछ mount नहीं करना पड़ता।**

`Tab`/`Shift+Tab` से भीतर-बाहर करना, और खाली आइटम पर Enter से सूची ख़त्म करना
[बुलेट सूची](./bullet-list) जैसा ही है।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
