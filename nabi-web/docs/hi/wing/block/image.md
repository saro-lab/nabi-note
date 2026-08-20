---
title: छवि
---

# छवि

## विवरण

`imageWing` (id `img`) छवि (`<img>`) का स्वामी है। `hr`·`youtube` की तरह यह भी
**भीतर-कुछ-न-रखने वाली वस्तु** है। बटन दबाने पर पता भरने की लेयर खुलती है।

**पता एक्सटेंशन से नहीं, स्कीम से जाँचा जाता है।** सिर्फ़ `http:`·`https:` और
सापेक्ष (relative) पते पार होते हैं, `//example.com/a.png` जैसे प्रोटोकॉल-सापेक्ष
पते ठुकरा दिए जाते हैं। `.png` पर ख़त्म होता है या नहीं — यह **कोई नहीं देखता**,
क्योंकि बिना एक्सटेंशन के छवि देने वाले पते आम हैं।

कर्सर छवि के भीतर नहीं जाता, इसलिए छवि पर क्लिक करने पर वह पूरी छवि चुन ली जाती है
और कॉन्टेक्स्ट पंक्ति दिखने लगती है।

| किस्म | कक्ष |
|---|---|
| चौड़ाई | `30` से `100` तक दस-दस के अंतर पर आठ कक्ष (डिफ़ॉल्ट `60`) — नाप-पट्टी जैसा, अभी का मान साथ दिखता है |
| देखें | सिर्फ़ वह एक तस्वीर बड़ी करके — दस्तावेज़ में कोई बदलाव नहीं होता |

**कॉन्टेक्स्ट पंक्ति में यही दो कक्ष हैं।** बाएँ·बीच·दाएँ जैसे कक्ष यहाँ नहीं हैं
— छवि की जगह छवि नहीं, **उसे धारण करने वाला रैपर-पैराग्राफ़** तय करता है, इसलिए
यह काम टूलबार का संरेखण बटन करता है।

**नई डाली गई छवि बीच में बैठती है** — `insertLump` उसके रैपर-पैराग्राफ़ को
बीच-संरेखण (`c`) पहनाकर खड़ा करता है।

बाहर जाते समय चौड़ाई छवि पर और संरेखण उसे लपेटने वाले पैराग्राफ़ पर लगता है।

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

संरेखण के मान `l`·`c`·`r` हैं। इनलाइन `style` बाहर नहीं जाता — असली रूप वह
स्टाइलशीट खींचती है जो `nabi.css` लगे `.nabi-content` के भीतर उन एट्रिब्यूट को
पढ़ती है।

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls` चालू करें तो `blob:`·`data:image/...` पते भी स्वीकार हो जाते हैं —
इसे सिर्फ़ उन डेमो और अपलोड परिदृश्यों में चालू करें जहाँ सर्वर के बिना फ़ाइल का
पूर्वावलोकन दिखाना है। डिफ़ॉल्ट बंद है।

छवि टूटने पर (पता मर गया हो, समय बीत गया हो, या blob ग़ायब हो गया हो) प्लेसहोल्डर
अपने-आप दिख जाता है — यह काम wing ख़ुद `attach` से करता है, और `mountSurface`
रजिस्टर हुए wing का `attach` साथ ही जोड़ देता है। **इसके लिए अलग से कुछ mount
नहीं करना पड़ता।** यह चिह्न सिर्फ़ स्क्रीन के लिए है और सहेजे गए मान में कभी नहीं
जाता।

`allowLocalUrls` दो जगह चालू किया जा सकता है — पूरे एडिटर के लिए
(`createNabiWith(wings, { allowLocalUrls: true })`), या सिर्फ़ छवि-wing के लिए
(`makeImageWing({ allowLocalUrls: true })`)।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

अपलोड से मिली फ़ाइल (`blob:` पता) वैसी ही खुली रखनी हो तो:

```ts
makeImageWing({ allowLocalUrls: true })
```

## डेमो

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
