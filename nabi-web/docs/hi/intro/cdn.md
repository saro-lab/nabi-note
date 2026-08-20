---
title: CDN से इस्तेमाल करना
description: CDN उदाहरण
---

# CDN से इस्तेमाल करना

<CdnDemo />

---

## अभी आपने क्या किया

ऊपर वाली फ़ाइल बिना इसे पढ़े भी चलती है। जब बदलना हो तभी यहाँ देखें।

### दो टैग ही पूरी इंस्टॉल है

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

पैकेज जो कुछ भी निर्यात करता है वह **सब** एक ही वैश्विक `NabiNote` पर टँगा है।
**शीट खुद जोड़नी होती है** — mount CSS इंजेक्ट नहीं करते, इसलिए `<link>` छूट जाए तो
एडिटर बिना सजावट के दिखेगा।

### ढाँचा

```html
<div id="app" class="nabi">                    <!-- रंग, कोने, फ़ॉन्ट जहाँ रहते हैं वह जड़ -->
  <div id="chrome" class="nabi-toolbar">        <!-- टूलबार और कॉन्टेक्स्ट पंक्ति एक साथ चिपकते हैं -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- पूर्वावलोकन·फ़ुल-स्क्रीन (दाएँ छोर पर) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- कर्सर जिस चीज़ पर है उसके हिसाब से खुद भरता है -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` कोई भी नाम रख सकते हैं — mount को जो दिया जाता है वह **एलिमेंट** है, नाम नहीं।
चार क्लास (`nabi`·`nabi-toolbar`·`nabi-toolbar-row`·`nabi-content`) वैसे ही रहने
दें — शीट इन्हीं को पकड़ती है। पूर्वावलोकन·फ़ुल-स्क्रीन नहीं चाहिए तो
`<span id="tools">` और `mountViewTools` वाली लाइन दोनों हटा दें — पर **इसे टूलबार
के भीतर न रखें।** यह जगह दाईं ओर तैरती है, इसलिए बटनों के बीच फँसने पर पंक्ति बिगड़
जाती है।

### wing चुनना

`defaultWings` उनतीस मूल wing की सूची है। ऊपर वाली फ़ाइल ने सिर्फ़ upload हटाया है।
सिर्फ़ चाहिए वाले चुनने हों तो नाम से लिख दें।

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

हर wing को एक-एक करके [{{ t('menu_wing') }}](../wing/inline/bold) में देखें।

### मान निकालना

| | |
|---|---|
| `nabi.getHtml()` | सहेजने-प्रकाशित करने वाला HTML |
| `nabi.getJson()` | nabi-tree (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | वापस डालना |
| `nabi.onChange(fn)` | मान बदलने पर हर बार |
| `N.renderStoredHtml(json, registry)` | सहेजा दस्तावेज़ बिना एडिटर के HTML में (नीचे [पढ़ने वाला पक्ष](#पढ़ने-वाला-पक्ष)) |

---

## पते

वर्ज़न स्थिर रखने के लिए पते पर वर्ज़न नंबर टाँगें। unpkg भी वही फ़ाइल देता है।

**बिना वर्ज़न वाला पता (`/npm/nabi-note`) इस्तेमाल न करें** — jsDelivr उस जगह को
लंबे समय तक कैश करता है, जिससे बंडल और शीट अलग-अलग वर्ज़न से मिलकर गड़बड़ हो सकते हैं।

| | पता |
|---|---|
| **बंडल (नवीनतम)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **बंडल (स्थिर)** | <code>{{ CDN_BUNDLE }}</code> |
| **शीट (नवीनतम)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **शीट (स्थिर)** | <code>{{ CDN_SHEET }}</code> |
| **बंडल** (unpkg) | `https://unpkg.com/nabi-note` |

बंडल npm रिलीज़ के भीतर ही साथ जाता है, इसलिए **CDN अलग से जारी नहीं किया जाता।**

---

## पढ़ने वाला पक्ष

सहेजे HTML को सिर्फ़ **दिखाने वाला पेज** एडिटर खड़ा नहीं करता। वही शीट लगाकर मान को
`.nabi-content` के भीतर डाल दें, तो वह ठीक वैसा ही दिखेगा जैसा एडिटर में दिखता था।

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- getHtml() से सहेजा गया मान -->
</div>
```

एक ही शीट फ़ाइल में **हर wing का CSS** होता है — फ़ाइल यह नहीं जान सकती कि आपने
कौन-से wing रजिस्टर किए हैं, इसलिए सबको साथ ढोती है।

HTML नहीं बल्कि **nabi-tree (JSON) में सहेजा हो**, तो एडिटर खड़ा किए बिना उसी जगह
खींचा जा सकता है। इसमें सहेजा दस्तावेज़ और रजिस्टर किए wing की सूची — दोनों चाहिए।

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['टिप्पणी की एक पंक्ति'] }]   // सर्वर से मिला nabi-tree
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

nabi-tree न हो तो `null` देता है, और पास हुआ मान एडिटर के दिए `getHtml()` से एक अक्षर
भी अलग नहीं होता — XSS छनने की जगह भी वही है। यह रास्ता DOM इस्तेमाल नहीं करता, इसलिए
सर्वर (Node.js) पर भी वैसे ही चलता है, और **HTML सर्वर पर पहले से बनाकर भेजने का रास्ता**
भी उसी दरवाज़े से खुलता है ([{{ t('menu_intro_ssr') }}](./ssr#केवल-सहेजा-हुआ-रूप-बनाने-की-जगह-एडिटर-खड़ा-नहीं-करता) देखें)।

---

## आगे

- [{{ t('menu_intro_usage') }}](./usage) — npm वाला रास्ता: जोड़ना, इनपुट और आउटपुट पूरे विस्तार से
- [{{ t('menu_wing_custom') }}](../wing/custom) — जो फ़ॉर्मेट अभी नहीं है उसे खुद बनाना

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// वर्ज़न नंबर कभी हाथ से नहीं लिखा जाता — nabi-npm के package.json से सीधे पढ़ा जाता है
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
