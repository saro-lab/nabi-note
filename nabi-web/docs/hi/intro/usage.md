---
title: बुनियादी इस्तेमाल
description: npm से इंस्टॉल करके एक nabi ऑब्जेक्ट खड़ा करें, और दस्तावेज़ को चार इनपुट और तीन आउटपुट से आगे-पीछे भेजें।
---

# बुनियादी इस्तेमाल

npm से इंस्टॉल करने वाला रास्ता। सिर्फ़ एक `<script>` वाला रास्ता
[{{ t('menu_intro_cdn') }}](./cdn) में है।

```sh
npm i nabi-note
```

---

## टुकड़े जोड़ते हुए

होस्ट जगह बनाता है और `mount` एक-एक करके जोड़ता है। नीचे न्यूनतम रचना है, और हर
wing दस्तावेज़ में दिखने वाले उदाहरण सब इसी ढाँचे में एक-दो wing जोड़े हुए हैं।

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची किस्म का ज्ञान·कमांड·बिल्डर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'hi' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'hi' })
mountSticky({ root: app, surface })

// मान बदलने पर हर बार — यहाँ अपना कोड जोड़ें
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

जगह होस्ट बनाता है, पर **यह जगह कैसी दिखती है यह कोर जानता है** — `mount` खुद अपने
कंटेनर पर `.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` जोड़ता है, और अपना
टूल-बॉक्स भी खुद खड़ा करता है। मतलब होस्ट को बिछावट (layout) डिज़ाइन नहीं करनी
पड़ती, इसीलिए ऊपर के मार्कअप में सिर्फ़ तीन क्लास हैं।

- **`class="nabi"`** — रंग-टोकन और शीट सिर्फ़ इसी के भीतर रहते हैं। यह वह बक्सा भी
  है जिसे फ़ुल-स्क्रीन पूरा जकड़ता है, इसलिए टूलबार और संपादन क्षेत्र **साथ** इसके
  भीतर होने चाहिए।
- **`class="nabi-toolbar"`** — टूलबार पंक्ति और कॉन्टेक्स्ट पंक्ति को एक टुकड़े में
  जोड़कर **ऊपर चिपका (sticky)** देता है। दोनों अलग-अलग चिपकें तो कॉन्टेक्स्ट पंक्ति
  उभरने पर पाठ खिसक जाता है और स्क्रीन काँपती है।
- **`class="nabi-content" contenteditable`** — यही संपादन क्षेत्र है।

साइट पर ऊपर कोई स्थिर हेडर हो तो `--nabi-sticky-top` से उतना नीचे खिसका दें, और
`mountSticky()` जोड़ें तो मोबाइल कीबोर्ड ने स्क्रीन को जितना धकेला उतना कोर नापकर
वापस लौटा देता है।

**शीट होस्ट खुद जोड़ता है।** बंडलर इस्तेमाल हो तो `import 'nabi-note/nabi.css'`
काफ़ी है, और सिर्फ़ रजिस्टर किए wing की शीट चाहिए तो
`injectSheets(document, collectSheets(registry))` बुलाएँ।

दिखने वाली भाषा हर `mount` पर `locale` से तय होती है — दस्तावेज़ का पाठ वैसा ही
रहता है, सिर्फ़ टूलबार-कॉन्टेक्स्ट पंक्ति के नाम बदलते हैं। चुनने वाला (picker)
बनाना हो तो पैकेज से निर्यात होने वाला `LOCALES` (कोड की सूची) इस्तेमाल करें।

| जोड़ना | ज़रूरी | क्या करता है |
|---|---|---|
| `createNabiWith(wings, options?)` | हाँ | `{ nabi, registry }` लौटाता है। DOM नहीं चाहिए |
| `mountSurface({ nabi, registry, root })` | हाँ | कर्सर·IME·इनपुट को nabi-tree पर बिठाता है। रजिस्टर किए wing का `attach` भी साथ जोड़ता है |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | नहीं | मुख्य टूलबार। इसके बिना भी `applyCommand()` से सीधे संपादन हो सकता है |
| `mountContextToolbar({ nabi, registry, root, surface? })` | नहीं | कर्सर की जगह के हिसाब से कॉन्टेक्स्ट पंक्ति (तालिका की पंक्ति-स्तंभ, कोड की भाषा, लिंक का पता-नाम आदि) |
| `mountHints({ toolbar, context?, root, surface? })` | नहीं | Shift दो बार दबाने पर दिखने वाला शॉर्टकट बैज |
| `mountViewTools({ nabi, surface, root, container })` | नहीं | पूर्वावलोकन और फ़ुल-स्क्रीन दो बटन। `root` वह `.nabi` बक्सा है जिसे फ़ुल-स्क्रीन जकड़ता है |
| `mountSticky({ root, surface })` | नहीं | मोबाइल कीबोर्ड ने स्क्रीन को जितना धकेला, उतना चिपकी टूलबार को वापस लौटाता है |
| `mountPickedMark({ nabi, surface })` | नहीं | छवि·वीडियो चुनने पर का निशान (ब्राउज़र खुद नहीं खींचता) |
| `mountFile({ nabi, store, name? })` | save·open इस्तेमाल होने पर | `.nabi` फ़ाइल में सहेजना-खोलना |
| `mountLocalHistory({ nabi, storage })` | localHistory इस्तेमाल होने पर | तय अंतराल पर ब्राउज़र में रिकॉर्ड करना |
| `mountUpload({ … })` + `mountUploadView({ … })` | upload इस्तेमाल होने पर | ड्रॉप·पेस्ट·फ़ाइल-चयन का अपलोड और उसकी प्रगति दिखाना |

**छवि, चेक, तालिका-कोशिका खींचना, कोड रंगना — इनके लिए अलग से `mount` नहीं चाहिए**
— सब wing अपने `attach` में लिए रहते हैं और `mountSurface` इन्हें साथ जोड़ देता
है। कोड रंगने के लिए बस रंगने वाला जोड़ना है
(`makeCodeAttach`, [{{ t('menu_wing_code') }}](../wing/block/code) देखें)।

wing बदलने हों तो यह पूरा टुकड़ा हटाकर (`unmount()`) फिर से बनाना पड़ता है — हटाए
गए wing के पास जो मार्कअप था वह वहीं सादे टेक्स्ट में बदल जाता है। इस साइट का डेमो
ठीक ऐसे ही काम करता है — किसी wing-चिप को बंद-चालू करने पर पूरी जोड़ाई फिर से बनती
है।

रंग-रूप के CSS वेरिएबल [{{ t('menu_style_custom') }}](../style/custom) में हैं।

---

## दस्तावेज़ निकालने के तीन तरीक़े

```ts
nabi.getHtml()        // सहेजने-प्रकाशित करने वाला HTML
nabi.getJson()        // nabi-tree (JSON)
nabi.getEditorHtml()  // अभी एडिटर स्क्रीन का HTML (इस पर data-key लगा है)
```

**सहेजने वाला मान पहले दो में से एक है।** `getEditorHtml()` पर सिर्फ़ स्क्रीन के
लिए निशान (`data-key`) लगा होता है, इसलिए यह निर्यात करने वाला मान नहीं है — यह उस
जगह के लिए है जब सर्वर-रेंडरिंग (SSR) एडिटर को पहले से खींच देता है।

बाहर जाने वाला JSON ऐसा दिखता है। **दस्तावेज़ ब्लॉक की एक सरणी है**, इसे लपेटने
वाला कोई जड़-नोड नहीं है।

```json
[
  {"w":"p","a":{"h":2},"ch":["शीर्षक"]},
  {"w":"p","ch":["पाठ ",{"w":"b","ch":["बोल्ड"]}," और ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["लिंक"]}]},
  {"w":"p","a":{"a":"c"},"ch":["बीच में"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["एक"]}]},
    {"w":"li","ch":[{"w":"p","ch":["दो"]}]}]}]}
]
```

पढ़ने के नियम सिर्फ़ चार हैं।

- **`w` उस wing का id है जो उस नोड को खींचता है।** आरक्षित शब्द सिर्फ़ दो हैं —
  `p` (पैराग्राफ़) और `br` (लाइन) — बाक़ी सब रजिस्टर किए गए wing के id हैं, जैसे
  `b`·`ul`·`li`। शीर्षक अलग wing नहीं बल्कि **पैराग्राफ़ का गुण** है
  (`{"w":"p","a":{"h":2}}`)।
- **स्ट्रिंग हो तो अक्षर, ऑब्जेक्ट हो तो wing।** किस्म बताने के लिए अलग कक्ष नहीं
  है।
- **`a` उस wing का साथ लाया मान है** — लिंक का पता, हाइलाइट का रंग, शीर्षक का
  स्तर जैसा कुछ। मान न हो तो कक्ष भी नहीं होता। संरेखण का मान भी `a` है, पर वह इस
  कक्ष के **भीतर** रहता है इसलिए गड़बड़ नहीं होती
  (`{"w":"p","a":{"a":"c"}}` — बीच में संरेखित पैराग्राफ़)।
- **तालिका·सूची·छवि जैसी पैराग्राफ़ की जगह घेरने वाली चीज़ों को एक पैराग्राफ़ एक
  परत में लपेटता है** (ऊपर का `ul` देखें)। यही पैराग्राफ़ संरेखण ओढ़ता है, और
  कर्सर को उस चीज़ के आगे-पीछे खड़े होने की जगह देता है। HTML में यह
  `<div data-nabi-p>` बनकर निकलता है — क्योंकि व्याकरण के हिसाब से `<p>` तालिका या
  सूची नहीं रख सकता।

भीतर घूमने वाले ट्री में हर नोड पर एक `_id` और होता है — **कर्सर जिससे नोड की
ओर इशारा करता है वह आंतरिक पता**, जो ज़्यादातर संपादन में नए सिरे से दिया जाता है
और बाहर जाते समय हटा दिया जाता है (ऊपर के उदाहरण में 470 से 323 बाइट)। बाहर गया
मान `setJson()` में ज्यों का त्यों वापस डाला जा सकता है।

---

## दस्तावेज़ डालने के चार तरीक़े

```ts
createNabiWith(wings, { doc })   // पहले से बने nabi-tree से शुरू
nabi.setJson(json)               // पूरा nabi-tree से बदल देना
nabi.setHtml(html)               // पूरा HTML स्ट्रिंग से बदल देना
nabi.applyCommand('setHeading', { value: 2 })  // संपादन कमांड (वही दरवाज़ा जो wing इस्तेमाल करते हैं)
```

चारों **सफलता-विफलता `boolean` में बताते हैं।** अपवाद नहीं फेंकते, और विफल हों तो
दस्तावेज़ को छूते नहीं।

| जवाब `false` कब | |
|---|---|
| `setJson` | nabi-tree की शक्ल नहीं है |
| `setHtml` | `parseHtml` अडैप्टर नहीं जोड़ा गया (नीचे देखें), या संपादन बंद है |
| `applyCommand` | ऐसा कोई कमांड नहीं है, या **कुछ भी नहीं बदलता** |

आख़िरी पंक्ति एक ही नियम है — **कुछ न बदले तो चुप रहता है।** पहले से स्तर-2
शीर्षक वाले पैराग्राफ़ पर फिर `setHeading` लगाएँ तो `false` जवाब देता है, और न
अनडू-बिंदु छोड़ता है न सिग्नल।

### `setHtml` को अडैप्टर चाहिए

HTML पढ़ने का काम ब्राउज़र का `DOMParser` करता है। कोर DOM नहीं जानता, इसलिए
इंस्टेंस घोषित करते समय यह अडैप्टर जोड़ना होता है।

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` को अडैप्टर नहीं चाहिए — सहेजा गया JSON **सर्वर (Node.js) से भी ज्यों का
त्यों डाला जा सकता है।** जोड़ना (`getHtml`) भी DOM इस्तेमाल नहीं करता, इसलिए
सर्वर पर JSON पढ़कर वहीं HTML बनाकर भेजने का रास्ता खुला रहता है।

---

## एडिटर के इंसान से पूछने का रास्ता

फ़ाइल खोलते समय "बिना सहेजा पाठ है, फिर भी खोलें?" जैसा सवाल चाहिए। वह बक्सा
**इंस्टेंस घोषित करते समय एक बार** जोड़ा जाता है।

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | शक्ल |
|---|---|
| `message` | `(text: string) => void` — एक बात, जवाब नहीं लेता |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — सिंक्रोनस या असिंक्रोनस दोनों लेता है |

**कोर ब्राउज़र के डायलॉग खुद-ब-खुद इस्तेमाल नहीं करता।** क्योंकि जिस पेज के अपने
डायलॉग हैं वहाँ कोई पराया धूसर बक्सा नहीं घुसना चाहिए, और प्लगइन (IntelliJ, VS Code)
में `window.confirm` सिरे से होता ही नहीं। ऊपर की तीन पंक्तियाँ होस्ट खुद बनाता है।

::: warning न दें तो जवाब "नहीं" है
जिस सवाल का किसी ने जवाब नहीं दिया वह "हाँ" नहीं गिना जाता — रद्द करने, Escape या
विंडो बंद करने जैसा ही मतलब है। यहाँ यह जवाब "बिना सहेजे पाठ छोड़कर फिर भी खोलूँ?"
तय करता है, इसलिए पूछने वाला कोई न हो तो छोड़ने की तरफ़ नहीं झुकना चाहिए। सर्वर
(Node) पर भी इसी मान से चुपचाप निकल जाता है।
:::

**यह हर एडिटर का अपना है** — वैश्विक नहीं, इसलिए एक ही पेज के दो एडिटर अलग-अलग
पूछ सकते हैं। wing को भी यही मिलता है (`nabi.$ask`) — इसकी बात
[{{ t('menu_wing_custom') }} ▸ UI और व्यवहार](../wing/custom/ui) में है।

---

## इस एडिटर का नाम और "बदला क्या"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <यूनिक्स-समय>-<nonce>, हर इंस्टेंस का अपना
nabi.isChanged() // पिछली आधार-रेखा के बाद दस्तावेज़ हिला क्या
```

`sessionId` एक बार बनता है और बदलता नहीं। समय बताता है यह एडिटर कब खड़ा हुआ और
अपने आप क्रम में रहता है, nonce एक ही मिलीसेकंड में खड़े दो एडिटर को अलग करता है।
यह ड्राफ़्ट, लॉग, ऑटो-सेव कुंजियों पर लगने वाला लेबल है।

`isChanged()` की **आधार-रेखा नए सिरे से खींचने वाली तीन चीज़ें हैं** — पूरा
दस्तावेज़ डालना (`createNabiWith({ doc })`·`setJson()`·`setHtml()`), और सहेजे
जाने की सूचना देना।

```ts
nabi.$markSaved(savedDoc)   // सहेजना पूरा होने के बाद — उसी वक़्त सहेजे गए दस्तावेज़ को देकर
```

**सहेजने के उसी क्षण का ट्री दिया जाता है** (अभी का ट्री नहीं)। क्योंकि सहेजने
में देर लगने के दौरान टाइप किए अक्षर अब भी "बदला हुआ" ही गिनने चाहिए। save wing
(`save`) फ़ाइल असल में लिखे जाने के बाद इसे बुलाता है, इसलिए `.nabi` में सहेजने पर
`isChanged()` `false` हो जाता है।

**अनडू करके शुरुआती जगह पर लौटें तो फिर `false`** — nabi-tree अपरिवर्तनीय है और
हर संपादन में पूरा बदल जाता है, इसलिए वही दस्तावेज़ है या नहीं यह घूमकर या हैश
निकालकर नहीं, तुरंत पता चल जाता है।

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## आगे

- [{{ t('menu_intro_ssr') }}](./ssr) — सहेजा दस्तावेज़ सर्वर पर पहले से खींचना और `hydrate` से आगे बढ़ाना
- [{{ t('menu_intro_cdn') }}](./cdn) — बिना बिल्ड-टूल के सिर्फ़ एक `<script>`
- [{{ t('menu_wing_custom') }}](../wing/custom) — जो फ़ॉर्मेट अभी नहीं है उसे खुद बनाना

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
