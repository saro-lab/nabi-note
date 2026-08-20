---
title: कोड
---

# कोड

## विवरण

`codeWing` (id `code`) कोड ब्लॉक (`<pre>`) का स्वामी **स्थिरांक (constant)** है —
इसे कोष्ठक लगाकर नहीं बुलाया जाता।

यह `holds: 'inline'` वाला डिब्बा है, और भीतर का हिस्सा `repair` ख़ुद सादा टेक्स्ट
बनाए रखता है — न मार्क घुस सकता है, न दूसरा wing। यह कोई अलग कॉन्ट्रैक्ट-कक्ष नहीं
है, wing ख़ुद अपने भीतर को सँवारता है।

खाली पंक्ति पर ` ``` ` लिखकर स्पेस या Enter दबाएँ तो वह कोड ब्लॉक बन जाता है —
` ```ts ` की तरह भाषा आगे लिख दें तो वह भाषा भी साथ ही पकड़ ली जाती है।
`Tab`/`Shift+Tab` से पंक्तियाँ भीतर-बाहर होती हैं (कई पंक्तियाँ चुनें तो एक साथ)।
Enter पिछली पंक्ति का इंडेंट आगे ले चलता है।

कॉन्टेक्स्ट पंक्ति सिर्फ़ तभी दिखती है जब कर्सर कोड के भीतर हो — उसमें भाषा सीधे
लिखने का इनपुट कक्ष, "कोई भाषा नहीं", और अक्सर काम आने वाली भाषाओं के कक्ष होते
हैं।

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

यह सूची सिर्फ़ एक **छोटा रास्ता** है — यह उन भाषाओं की सूची नहीं है जिन्हें कोर
जानता है। जो भाषा यहाँ नहीं है उसे पहले कक्ष में सीधे लिख दें, और वह मान ज्यों का
त्यों हाइलाइटर तक पहुँच जाता है।

## रंग चढ़ाना wing में जोड़ा जाता है

`highlight` ऐसा **हुक है जो रंग नहीं, किस्म लौटाता है** — उसका रूप है
`(सोर्स, भाषा) => {text, type?}[]`, और `type` इन्हीं चौदह में से एक तय मान होता है
(`CODE_TOKEN_TYPES`): `keyword`·`string`·`number`·`comment`·`function`·`class`·
`variable`·`operator`·`punctuation`·`tag`·`attribute`·`literal`·`regexp`·`meta`।

रंग कोर की स्टाइलशीट `[data-nabi-token="…"]` सिलेक्टर से ख़ुद तय करती है — **सिर्फ़
पाँच किस्मों का रंग है** (`comment`·`string`·`keyword`·`number`·`literal`)। बाक़ी
किस्मों पर सिर्फ़ चिह्न लगता है, रंग-नियम नहीं होता इसलिए वे मुख्य टेक्स्ट के रंग
में ही दिखती हैं। मान CSS वेरिएबल नहीं, तय रंग हैं, इसलिए दूसरा रंग या डार्क थीम
चाहिए तो वह सिलेक्टर सीधे ओवरराइड करना पड़ता है।

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

सिंटैक्स का शब्दकोश ख़ुद पैकेज में नहीं है — Prism·highlight.js·Shiki जैसा कुछ
आपको ख़ुद जोड़ना होता है।

रंग चढ़ाने वाला हिस्सा **wing में जोड़ा जाता है** — अलग से mount नहीं करना पड़ता।
`makeCodeAttach` से `attach` बनाकर कोड-wing में बदल दें, तो `mountSurface` ख़ुद
उसे जोड़ देता है। इसी साइट का डेमो Shiki को इसी तरह जोड़ने का उदाहरण है
(`.vitepress/src/highlight.ts`)।

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// wing स्थिरांक है — सिर्फ़ जुड़ने वाला हिस्सा (`attach`) बदला जाता है
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

`version` साथ दें तो **दस्तावेज़ तो वैसा ही है पर रंग चढ़ाने वाला पक्ष बदल गया हो**
तब दोबारा रंग चढ़ता है। ऐसा उन हाइलाइटरों के साथ होता है जो सिंटैक्स असिंक्रोनस
रूप से लाते हैं (Shiki किसी भाषा से पहली बार मिलने पर ऐसा ही करता है) — सिंटैक्स आ
जाने पर भी दस्तावेज़ नहीं बदला, इसलिए `onChange` नहीं बजता, और इसके बिना कोई भी एक
अक्षर और टाइप किए बग़ैर रंग नहीं चढ़ता।

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// जब सिंटैक्स देर से पहुँचे — गिनती बढ़ाएँ तो दोबारा रंग चढ़ता है
grammarAge += 1
```

सहेजा गया मान बाहर के चलन का पालन करता है —
`<pre data-nabi-lang="ts"><code class="language-ts">`, और रंग `data-nabi-token`
एट्रिब्यूट के रूप में जाते हैं (इनलाइन `style` के रूप में नहीं)।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
