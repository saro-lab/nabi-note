---
title: क्रमांकित सूची
---

# क्रमांकित सूची

## विवरण

`orderedListWing` (id `ol`, शॉर्टकट `N`) `<ol>` का स्वामी है। आइटम `parts` के
ज़रिए साथ आता है, इसलिए `oli` को अलग से रजिस्टर नहीं करना पड़ता — यह ऐरे नहीं,
रिकॉर्ड है।

```ts
parts: { oli: { holds: 'blocks' } }
```

बटन दबाने पर, कर्सर जिस ब्लॉक में है उसे (या चुनाव में आए ब्लॉकों को) क्रमांकित
सूची में लपेट दिया जाता है, और दोबारा दबाने पर लपेट खुल जाती है। दूसरा सूची बटन
दबाने पर वह उस किस्म में बदल जाता है।

पंक्ति की शुरुआत में अंक और बिंदु लिखकर स्पेस दबाने पर (`1. `) भी वही नतीजा है।
**शुरुआत के लिए कोई भी अंक मान्य है, पर अंकों की संख्या नौ तक** (`1234567890. `
नहीं लगता), और बिंदु के बाद कुछ और जुड़ा हो (जैसे `1.2 `) तो भी नहीं लगता। खाली
पंक्ति होना ज़रूरी नहीं — सिर्फ़ कर्सर से पहले की पंक्ति-शुरुआत देखी जाती है, और
यह सिर्फ़ पैराग्राफ़ की पहली पंक्ति पर ही लगता है।

- `Tab`/`Shift+Tab` से भीतर-बाहर करना, खाली आइटम पर Enter से सूची ख़त्म करना, और
  आइटम की शुरुआत में Backspace से पिछले आइटम में जोड़ना — यह सब
  [बुलेट सूची](./bullet-list) जैसा ही है।
- क्रमांक सहेजे गए मान में नहीं जाता — यह `<ol>` खुद बनाता है, इसलिए आइटम जोड़ने
  या हटाने पर ब्राउज़र खुद-ब-खुद दोबारा गिन लेता है।
- नेस्टिंग भी असली मार्कअप है और सहेजे गए मान में वैसी ही रहती है। आइटम ब्लॉक
  रखता है, इसलिए टेक्स्ट पर पैराग्राफ़ की परत चढ़ती है और नेस्ट की गई सूची
  रैपर-पैराग्राफ़ के भीतर बैठती है।
- `start`·`type` जैसे एट्रिब्यूट नहीं बचते। इसलिए `start="5"` से आई सूची भी 1 से
  ही दोबारा गिनी जाती है।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
