---
title: टाइपफ़ेस
---

# टाइपफ़ेस

## विवरण

`typefaceWing` (नाम `tf`) एक **इनलाइन मान-मार्क** है। यह पहले से तैयार
स्थिरांक है, इसलिए बस सरणी में डाल देना काफ़ी है — इसे कोई विकल्प नहीं देना
पड़ता। बाहर जाते समय यह `<span data-nabi-typeface="serif">` बनकर खिंचता है।

मान चार हैं (`TYPEFACES`) — `sans`·`serif`·`mono`·`cursive`।

- **इसके भीतर एक भी फ़ॉन्ट का नाम नहीं है।** जो चुना जाता है वह **परिवार** है,
  और असल में कौन-सा फ़ॉन्ट दिखेगा यह होस्ट के `--nabi-font`·`--nabi-font-serif`·
  `--nabi-font-mono`·`--nabi-font-cursive` — इन चार टोकन पर रखे मान तय करते
  हैं।
- चारों परिवार **एक ही wing** ढोता है। चुनने की जगह कॉन्टेक्स्ट पंक्ति के चार
  कक्ष (`select`) हैं, और भीतर आने का रास्ता टूलबार का एक बटन है। बटन दबाने
  पर `serif` लगता है।
- **जिस पाठ पर कुछ नहीं लगा वह `--nabi-typeface-base` ओढ़ता है।** यह टोकन
  पूरे एडिटर का बुनियादी टाइपफ़ेस है, और न छुआ जाए तो `--nabi-font` का
  अनुसरण करता है। "डिफ़ॉल्ट" चुनने का कोई अलग कक्ष नहीं है — पहले से लगा
  परिवार **फिर से चुनें** तो वह **उतर जाता है** और वापस उसी जगह लौट आता है।
- चुनने वाले कक्ष **जिस रूप को दिखाते हैं उसी टाइपफ़ेस में लिखे होते हैं।**
  सेरिफ़ का कक्ष सेरिफ़ में, मोनोस्पेस का कक्ष मोनोस्पेस में लिखा है, इसलिए
  नाम न जानें तो भी दिखता है कि क्या चुना जा रहा है।
- **सिर्फ़ कर्सर हो तो पूरे पैराग्राफ़ पर** लगता है। जिस पैराग्राफ़ में एक भी
  अक्षर न हो वहाँ आरक्षण के रूप में बचा रहता है, और अगला टाइप किया अक्षर उसी
  टाइपफ़ेस में निकलता है।

## उपयोग का उदाहरण

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची किस्म का ज्ञान·कमांड·बिल्डर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

होस्ट जो फ़ॉन्ट रखता है वह CSS की एक ही जगह है। एक ही परिवार में कई फ़ॉन्ट एक
के बाद एक रखें तो ब्राउज़र हर अक्षर के लिए शुरू से जाँचकर उसे रखने वाले पहले
फ़ॉन्ट से खींचता है, इसलिए कोई भी भाषा लिखी जाए, उस परिवार का रूप बना रहता है।

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans KR', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif Devanagari', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Tillana', cursive;
}
```

## डेमो

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
