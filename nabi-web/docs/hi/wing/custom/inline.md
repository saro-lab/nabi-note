---
title: इनलाइन मार्क बनाना
description: place 'mark' — अक्षर के ऊपर लगने वाला फ़ॉर्मेट। बाहर जाने का रास्ता (toHtml) और भीतर आने का रास्ता (claim) साथ-साथ लिखे जाते हैं।
---

# इनलाइन मार्क बनाना

`place: 'mark'` **अक्षर के ऊपर लगने वाला फ़ॉर्मेट** है। यह अपनी अलग जगह नहीं
घेरता, पाठ के प्रवाह को नहीं तोड़ता, और एक-दूसरे पर पड़ सकता है — बोल्ड,
इटैलिक, हाइलाइट सब इसी समूह के हैं।

---

## एक पूरा मार्क

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { hi: 'शॉर्टकट कुंजी' },
      shortcut: 'K',
      action: { kind: 'mark' },        // टॉगल कोर करता है — कमांड नहीं चाहिए
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` जो ख़ुद भर देता है वह है `place: 'mark'` और
`escapeKeys: ['Escape']` — दोनों। बाक़ी ज्यों का त्यों निकल जाता है।

---

## दोनों दिशाएँ अलग-अलग लिखी जाती हैं

| | दिशा | न हो तो |
|---|---|---|
| `toHtml` | दस्तावेज़ → HTML | **रजिस्ट्रेशन मर जाता है।** जो wing नोड खड़ा करे उसके पास खींचने का तरीक़ा होना चाहिए |
| `claim` | HTML → दस्तावेज़ | खिंचता तो है, पर **दोबारा पढ़ा नहीं जा सकता।** सहेजकर फिर लोड करने पर खोल उतर जाता है |

छह मूल मार्क (`b`·`i`·`u`·`s`·`sub`·`sup`) और चार मान-मार्क (`hl`·`tc`·`fs`·`tf`)
के टैग **कोर पहले से जानता है।** इसीलिए `boldWing` में न `toHtml` है न `claim`।
हाथ से बनाया नाम कोर नहीं जानता, इसलिए दोनों लिखने होते हैं।

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| तर्क | क्या है |
|---|---|
| `node` | अभी का नोड। attribute `node.a?.['कुंजी']` से निकाले जाते हैं |
| `children()` | भीतर का खींचा हुआ पाठ। **बुलाने पर ही खिंचता है**, न बुलाएँ तो भीतरी सामग्री बाहर नहीं जाती |
| `ctx` | सुरक्षित तरीक़े से बनाने के औज़ार |

`ctx` जो देता है:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | एक पूरा टुकड़ा बनाता है। मान अपने-आप escape हो जाते हैं |
| `ctx.escape(text)` | सिर्फ़ पाठ को escape करता है |
| `ctx.url(raw)` · `ctx.src(raw)` | पते को छानता है। भरोसे लायक न हो तो **`null`** |
| `ctx.keys` | अभी की जोड़ाई **एडिटर के लिए** है क्या (`getEditorHtml()`) |

::: warning पाठ को हाथ से जोड़कर मत लिखें
`` `<kbd>${node.a?.['t']}</kbd>` `` जैसा लिखेंगे तो दस्तावेज़ का पाठ ज्यों का
त्यों मार्कअप बन जाता है। हमेशा `ctx.element` या `ctx.escape` से गुज़ारें।
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — जैसा आया वैसा एलिमेंट |
| `inner(block)` | भीतर पढ़ता है। मार्क हो तो `false` (पाठ की जगह), ब्लॉक हो तो `true` |
| जवाब | नोड की सरणी, या **`null`** (मेरा नहीं है → अगले wing को) |

wing की सरणी के क्रम में पूछा जाता है और **जो पहले हाथ उठाए** वही ले लेता है।

`null` जवाब देने की दो जगहें हैं — मेरा टैग न हो तब, और **मेरा टैग हो पर मान
सूची से बाहर हो तब।** दूसरी हालत में `inner(false)` दें तो सिर्फ़ खोल उतरता है,
पाठ बचा रहता है।

---

## मान रखने वाला मार्क

रंग या आकार जैसा मार्क जो **तय सूची में से एक चुनता है**, उसके लिए `valueMark`
इस्तेमाल होता है।

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // जिस attribute-कक्ष में मान रहता है
    values: [...LEVELS],             // इससे बाहर का मान स्वीकार नहीं होता
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // सूची से बाहर — सिर्फ़ पाठ बचाता है
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` जो दो चीज़ें जोड़ता है:

- **`currentValue`** — अभी कर्सर जहाँ है वहाँ का मान। इसी जवाब से टूलबार और
  कॉन्टेक्स्ट पंक्ति दिखाती हैं कि कौन-सा कक्ष दबा है।
- **`repair`** — JSON के प्रवेश-द्वार पर मान को फिर जाँचता है। सूची से बाहर हो
  या न हो तो `null` देकर **खोल समेत हटा देता है।** हाथ से सुधारा गया सहेजा मान
  भी यहाँ पकड़ में आता है।

::: tip मान बदलने वाला कमांड
मान-मार्क का "इस मान में बदलो" कमांड अभी सार्वजनिक सहायक के रूप में नहीं है।
सिर्फ़ टूलबार बटन से चालू-बंद करने वाला `action: { kind: 'mark' }` ज्यों का
त्यों इस्तेमाल हो सकता है, और मान चुनना चाहिए तो अभी के लिए मूल चार मान-मार्क
(हाइलाइट·टेक्स्ट-रंग·अक्षर-आकार·टाइपफ़ेस) इस्तेमाल करें या उनकी घोषणा फैलाकर
लिखें।
:::

---

## `escapeKeys` — मार्क से बाहर निकलना

मार्क के अंत में कर्सर खड़ा हो तो अगला अक्षर मार्क के भीतर जाएगा या बाहर, यह
सिर्फ़ इंसान जानता है। `escapeKeys` वही दरवाज़ा है।

```ts
escapeKeys: ['Escape']    // simpleMark · valueMark का डिफ़ॉल्ट
```

**कर्सर हिलता नहीं।** यह कुंजी दबाते ही "अगला टाइप किया अक्षर इस मार्क से
बाहर जाएगा" वाला आरक्षण लग जाता है। एक अक्षर टाइप करते ही आरक्षण इस्तेमाल होकर
मिट जाता है।

```
<kbd>Ctrl</kbd>(कर्सर)  →  Escape  →  "+" टाइप किया  →  <kbd>Ctrl</kbd>+
```

कई wing एक ही कुंजी इस्तेमाल कर सकते हैं — कर्सर अभी सच में उस मार्क के भीतर हो
तभी आरक्षण लगता है, इसलिए एक-दूसरे पर पड़े मार्क में से सिर्फ़ जो लागू हों वही
साथ छूटते हैं। <kbd>Escape</kbd> लगे हुए आरक्षण को **वापस लेने** के लिए भी
इस्तेमाल होता है।

---

## मार्क को अपनी कुंजी नहीं मिलती

`onKey` लिखें भी तो **मार्क तक नहीं पहुँचता।** कर्सर की जगह `{ path, offset }`
है, और `path` का आख़िरी छोर **पाठ रखने वाला धारक** होता है — मार्क उस धारक के
भीतर का इनलाइन नोड है, इसलिए वह रास्ते में आता ही नहीं। कुंजी का मालिक तय करते
समय कोर यही रास्ता ऊपर की ओर चलता है, इसलिए मार्क से कभी सामना नहीं होता।

वजह है एक-दूसरे पर पड़ना (overlap)। बोल्ड के भीतर इटैलिक के भीतर लिंक में
<kbd>Enter</kbd> दबाने पर तीनों में से कौन मालिक है यह तय करने का कोई तरीक़ा
नहीं है। कुंजी के सामने मार्क के पास सिर्फ़ एक ही दरवाज़ा है — `escapeKeys`।

---

## आगे

- [ब्लॉक और पैराग्राफ़ गुण](../custom/block) — जगह घेरने वाली चीज़ें
- [कुंजी·ऑटो-रूपांतरण·पेस्ट](../custom/input) — `onKey` और `inputRules`
- [UI और व्यवहार](../custom/ui) — टूलबार बटन और कॉन्टेक्स्ट पंक्ति

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
