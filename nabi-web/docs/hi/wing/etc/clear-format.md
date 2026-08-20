---
title: फ़ॉर्मैटिंग हटाना
---

# फ़ॉर्मैटिंग हटाना

## विवरण

`clearFormatWing` एक **तैयार स्थिरांक** है। बस सरणी में डाल देना काफ़ी है —
इसे कोई विकल्प नहीं देना पड़ता।

`place: 'tool'` होने से यह दस्तावेज़ में अपना कोई नोड नहीं खड़ा करता। बस एक
कमांड (`clearFormat`) और एक टूलबार बटन ही सब कुछ है।

- **हटाई जाने वाली सूची कोर में तय है।** इनलाइन मार्क ग्यारह (`b`·`i`·`u`·`s`·
  `sub`·`sup`·`hl`·`tc`·`fs`·`tf`·`a`) और पैराग्राफ़ के तीन गुण (`h` शीर्षक ·
  `a` संरेखण · `dc` ड्रॉप कैप)। होस्ट को कोई सूची सँभालनी नहीं पड़ती, और हाथ से
  बनाए wing का मार्क **यहाँ नहीं हटता।**
- **रेंज चुनकर दबाएँ** तो उस हिस्से के मार्क और छुए गए पैराग्राफ़ों के गुण एक
  साथ उतर जाते हैं।
- **सिर्फ़ कर्सर हो तो एक बार में एक परत** उतरती है — कर्सर जिस जगह है वहाँ के
  **सबसे भीतरी मार्क** से शुरू करके, वह मार्क जितना फैला है उतना। उतारने को
  मार्क न बचे तो तब पैराग्राफ़ के गुण हटते हैं।
- **अटैचमेंट लिंक नहीं हटते** — जिस लिंक (`a`) पर `file` attribute लगा हो, वह
  कहीं भी अछूत है। खोल उतारने से अटैचमेंट मरा हुआ सादा टेक्स्ट बन जाएगा।
- **किसी चीज़ को धारण करने वाले पैराग्राफ़ का संरेखण बचा रहता है।** छवि या
  तालिका वाले रैपर पैराग्राफ़ पर सिर्फ़ संरेखण (`a`) नहीं हटता — इससे
  फ़ॉर्मैटिंग हटाते समय छवि के बाईं ओर उछल जाने से बचाव होता है।
- हटाने को कुछ न बचे तो कमांड `null` लौटाता है। कोई अनडू-बिंदु नहीं जुड़ता।

## उपयोग का उदाहरण

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची किस्म का ज्ञान·कमांड·बिल्डर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
