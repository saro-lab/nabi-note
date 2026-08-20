---
title: विभाजक
---

# विभाजक

## विवरण

`dividerWing` (id `hr`) अकेले `<hr>` का स्वामी है। **`place: 'void'`** — यह ऐसी
वस्तु है जिसके भीतर कुछ रखा ही नहीं जाता, इसलिए कर्सर के लिए भीतर जाने की कोई जगह
नहीं होती। विभाजक के ठीक पहले या ठीक बाद Backspace·Delete दबाएँ तो वह पूरा ब्लॉक
एक साथ मिट जाता है, और दायरा चुनकर मिटाने पर भी वही नतीजा है।

बटन दबाने पर विभाजक **अपना रैपर-पैराग्राफ़ पहनकर** बैठता है। इसके साथ कोई अलग
खाली पैराग्राफ़ नहीं बनता — कर्सर उसी रैपर-पैराग्राफ़ पर, विभाजक के ठीक बाद जा
बैठता है।

वह कहाँ बैठता है यह इस पर निर्भर है कि कर्सर वाले पैराग्राफ़ में टेक्स्ट है या
नहीं।

| कर्सर कहाँ था | नतीजा |
|---|---|
| टेक्स्ट वाला पैराग्राफ़ | उस पैराग्राफ़ के **बाद** बैठता है |
| खाली पैराग्राफ़ | उस पैराग्राफ़ की **जगह ले लेता है** — कोई खाली पंक्ति पीछे नहीं बचती |

खाली पैराग्राफ़ की जगह लेते समय उस पैराग्राफ़ का संरेखण (alignment) वैसा ही बचा
रहता है।

पंक्ति की शुरुआत में तीन या उससे अधिक हाइफ़न (`---`) लिखकर Enter दबाने पर भी वही
नतीजा है — इस स्वचालित रूपांतरण का **ट्रिगर Enter है**।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
