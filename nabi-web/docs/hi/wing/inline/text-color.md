---
title: टेक्स्ट का रंग
---

# टेक्स्ट का रंग

## विवरण

`textColorWing` `<span data-color="...">` का स्वामी (claim) है। यह हाइलाइट की ही
किस्म है — मान रखने वाला इनलाइन मार्क, इसलिए चालू/बंद करने के बजाय रंग चुना जाता
है।

- **टूलबार का बटन (शॉर्टकट `C`) हरा लगाता है** — यह `setTextColor` को `{ c: 'green' }`
  भेजता है। यह बिना आर्ग्युमेंट के चलने वाला बटन नहीं है।
- इसलिए इस बटन का टॉगल **सिर्फ़ हरे के लिए** है — चुना हुआ हिस्सा पूरा हरा हो तभी
  हट जाता है, कोई और रंग लगा हो तो वह हरे में बदल जाता है।
- कर्सर टेक्स्ट-रंग मार्क के भीतर हो तो कॉन्टेक्स्ट टूलबार में रंग के 5 नमूने
  (swatch) दिखते हैं — दबाने पर वहीं का वहीं सिर्फ़ रंग बदल जाता है (मार्क एक के
  ऊपर एक नहीं चढ़ते)। अलग से कोई "हटाएँ" बटन इस wing के पास नहीं है — वही रंग फिर
  से दबाने पर वह हट जाता है, बाकी `clearFormatWing` का काम है।
- **सिर्फ़ कर्सर रखकर (टेक्स्ट चुने बिना) रंग चुनने के दो रास्ते हैं।** मार्क के
  भीतर हो तो वह पूरा मार्क नोड ही लक्ष्य बन जाता है, मार्क के बाहर हो तो
  **आरक्षित** रह जाता है और अगला टाइप किया गया अक्षर उसी रंग में आता है।
- सहेजे गए मान में सिर्फ़ रंग का नाम रहता है — जैसे `data-color="green"`। इनलाइन
  `style` बाहर नहीं जाता। रंग-मान कोर टोकन `--nabi-tc-*` में हैं, स्टाइलशीट
  हाइलाइट के साथ साझा है।
- आते समय (`claim`) सिर्फ़ वही `<span>` देखा जाता है जिस पर `data-color`
  एट्रिब्यूट हो — जिस `<span>` पर `data-color` है ही नहीं, उस पर यह wing दावा
  नहीं करता, इसलिए उसका खोल उतरकर वह सादे टेक्स्ट में गिर जाता है। **एट्रिब्यूट है
  पर उसका मान सूची से बाहर है, तो भी खोल उतरकर सिर्फ़ टेक्स्ट रह जाता है।**
- हाथ से बदला हुआ सहेजा मान का सूची-बाहर मान भी `repair` खोल उतार कर हटा देता है।
- हाइलाइट से यह अलग मार्क है, इसलिए एक ही टेक्स्ट पर दोनों साथ लग सकते हैं —
  हाइलाइट की स्टाइलशीट `color` नहीं लिखती, इसी वजह से यह मुमकिन है।

| रंग का नाम | सहेजा गया मान |
|---|---|
| हरा | `green` |
| मूंगा | `coral` |
| बैंगनी | `violet` |
| अंबर | `amber` |
| नीला | `blue` |

ये पाँच नाम `TEXT_COLORS` के रूप में एक्सपोर्ट होते हैं — यह रंग-मान नहीं,
**सिर्फ़ नामों की सूची** है (`readonly string[]`)।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
