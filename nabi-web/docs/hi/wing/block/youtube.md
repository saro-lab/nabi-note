---
title: YouTube
---

# YouTube

## विवरण

`youtubeWing` (id `youtube`, कोई शॉर्टकट नहीं) YouTube एम्बेड (`<iframe>`) का
स्वामी है। यह `hr`·`img` जैसी ही **भीतर-कुछ-न-रखने वाली वस्तु** है (`place: 'void'`)।
बटन दबाने पर पता भरने की लेयर खुलती है, और सिर्फ़ `watch?v=`·`youtu.be/`·
`/embed/`·`/shorts/`·`/v/`·`/live/` रूप वाले YouTube पते पार होते हैं (`www.`·
`m.`·`music.` उपसर्ग और `youtube-nocookie.com` समेत) — फ़ैसला स्ट्रिंग के भीतर
खोज से नहीं बल्कि `URL()` पार्सिंग से होता है, इसलिए `youtube.com.evil.test` जैसा
पता पकड़ में नहीं आता।

आए हुए पते पर जस का तस भरोसा नहीं किया जाता — उसमें से सिर्फ़ **11 अक्षरों की
वीडियो id** निकालकर सहेजी जाती है। पता सहेजे गए मान में नहीं बचता — बचता है सिर्फ़
`{"w":"youtube","a":{"v":"<id>","w":"70"}}`, और बाहर जाते समय
`https://www.youtube-nocookie.com/embed/<id>` इसी एक रूप में नए सिरे से जोड़ा
जाता है।

`hr` वाले ही कारण से कर्सर भीतर नहीं जाता, और ठीक पहले या ठीक बाद Backspace·Delete
दबाने पर वह पूरा का पूरा मिट जाता है। YouTube के अलावा कोई और एम्बेड इम्पोर्ट के
समय **पूरा फेंक दिया जाता है** — अनजान दस्तावेज़ को अपने दस्तावेज़ के भीतर नहीं
खड़ा किया जाता।

## कॉन्टेक्स्ट पंक्ति

वीडियो पर क्लिक करने पर दो कक्ष दिखते हैं।

| किस्म | कक्ष |
|---|---|
| चौड़ाई | `50` `60` `70` `80` `90` `100` — छह पायदान (डिफ़ॉल्ट `70`), नाप-पट्टी जैसा, अभी का मान साथ दिखता है |
| पता | अभी की वीडियो id भरी हुई इनपुट-लेयर |

**बाएँ·बीच·दाएँ जैसे कक्ष यहाँ नहीं हैं।** वीडियो की जगह वीडियो नहीं, **उसे धारण
करने वाला रैपर-पैराग्राफ़** तय करता है, इसलिए यह काम टूलबार का संरेखण बटन करता
है। नई डाली गई वीडियो का रैपर-पैराग्राफ़ बीच-संरेखण (`c`) पहनकर बैठता है।

इसीलिए बाहर जाते समय चौड़ाई वीडियो पर और संरेखण उसे लपेटने वाले पैराग्राफ़ पर
लगता है।

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

इनलाइन `style` बाहर नहीं जाता। होस्ट अपने UI से डालना चाहे तो कमांड सीधे बुला
सकता है — `applyCommand('insertYoutube', { v: पता, w: '80' })`, सिर्फ़ चौड़ाई
बदलनी हो तो `applyCommand('setYoutubeWidth', { w: '80' })`। सूची से बाहर की
चौड़ाई ठुकरा दी जाती है।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
