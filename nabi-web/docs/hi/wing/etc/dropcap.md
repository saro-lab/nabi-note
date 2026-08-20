---
title: ड्रॉप कैप
---

# ड्रॉप कैप

## विवरण

`dropCapWing` एक ऐसा एकल-मान वाला पैराग्राफ़-एट्रिब्यूट है जो पैराग्राफ़ पर
`data-nabi-dropcap="1"` लगाता है। यह कोई नया ब्लॉक नहीं बनाता, पहले से मौजूद
पैराग्राफ़ पर सिर्फ़ एक निशान चढ़ा देता है।

- मान बस एक ही है — चालू/बंद। बटन दोबारा दबाएँ तो एट्रिब्यूट उतर जाता है।
- **कितनी पंक्तियाँ घेरनी हैं इसका कोई विकल्प या वेरिएबल नहीं है।** कोर की
  स्टाइलशीट का एक ही `::first-letter` नियम आकार तय करता है —
  `font-size: 5.9em; line-height: .83`। अक्षर असल में कितनी पंक्तियाँ घेरेगा यह
  उस पैराग्राफ़ की लाइन-हाइट पर निर्भर करता है।
- इसका असर सिर्फ़ पहले अक्षर तक पहुँचता है, इसलिए Enter इस एट्रिब्यूट के साथ मार्क
  जैसा बर्ताव करता है — पैराग्राफ़ को दो में बाँटने पर यह दोनों तरफ़ नक़ल नहीं होता,
  बल्कि उसी अक्षर के पीछे-पीछे चलता है।

आकार बदलना हो तो वही नियम ओवरराइड करें।

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
