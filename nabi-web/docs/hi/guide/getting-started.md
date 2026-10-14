---
title: मूल उपयोग
description: browser में NABI NOTE editor बनाएँ, फिर उसके दस्तावेज़ save और restore करें।
---

# मूल उपयोग

यह guide browser के client-side rendered (CSR) editor को समझाती है: wings चुनें, editor और UI mount करें, फिर NABI TREE JSON save और restore करें।

## install और base markup

```bash
npm install nabi-note
```

editor और published content दोनों में एक stylesheet load करें। `contenteditable` स्वयं न जोड़ें; इसे `mountSurface()` संभालती है।

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## editor mount करना

`allBasic()` ऐसी official wings चुनती है जिन्हें application-specific wiring नहीं चाहिए। upload, file storage या document diff जैसी service-connected wings उनके guides के अनुसार जोड़ें।

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'hi',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'hi',
  placeholder: 'कुछ लिखें।',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'hi',
})
```

`locale` toolbar और helper text नियंत्रित करती है; हर UI mount को समान value दें। `placeholder` केवल खाली editor में दिखता है। `onError` commands और callbacks की isolated failures लेता है। `undoLimit` undo entries की संख्या है, default 200। `typingMergeMs` लगातार typing को एक undo step में जोड़ने का interval है; हर insertion अलग रखने के लिए `0` दें।

ब्लॉक कंटेनर से निकलने के लिए लगातार Enter दबाने का डिफ़ॉल्ट अंतर 180ms है। Esc और Shift दो बार दबाने का अंतर 350ms रहता है। `mountSurface()` में `doubleEnterMs` स्पष्ट रूप से देने पर Enter के साथ दोहरे Esc का अंतर भी बदलता है।

हर editor को अपने अलग content और toolbar roots चाहिए। कई editors हों तो हर toolbar को `surface` से अपना editor surface दें, ताकि focus और shortcuts आपस में न मिलें।

## टूलबार कॉन्फ़िगर करना

डिफ़ॉल्ट टूलबार शीर्षक, टेक्स्ट फ़ॉर्मेटिंग, संरेखण, सूची, सम्मिलन और दस्तावेज़ टूल इसी क्रम में समूहित करता है, और समूहों के बीच खड़े विभाजक दिखाता है। डेस्कटॉप पर सभी टूल कई पंक्तियों में खुलते हैं; मोबाइल पर त्वरित टूल और सभी टूल का बटन एक पंक्ति में रहते हैं। तालिका, चित्र और फ्लोट क्षेत्र के गुण टूल नीचे दिखते हैं और टेक्स्ट टूल के साथ इस्तेमाल हो सकते हैं।

`groups` से समूहों का क्रम और `quick` से मोबाइल के त्वरित टूल का क्रम बदलें। उदाहरण के लिए, अक्सर चित्र डालने वाला संपादक `media` समूह को आगे ला सकता है।

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'hi',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

त्वरित टूल दिए क्रम में बिना विभाजक के आते हैं। समूह के अंदर विंग पंजीकरण का क्रम रहता है। SSR से टूलबार पहले रेंडर करते समय सर्वर और ब्राउज़र को एक जैसा समूह क्रम दें। स्क्रीन की चौड़ाई के अनुसार लेआउट [CSS थीम](./style#मोबाइल-मोड-की-सीमा) में समझाया गया है।

`mountHints()` जोड़ने पर Shift दो बार दबाकर कीबोर्ड से टूल चुन सकते हैं। Tab समूह बदलता है और तीर कुंजियाँ उसी समूह के आइकनों में चलती हैं। डेस्कटॉप और फ़ुलस्क्रीन में दिखता टूलबार, मोबाइल में सभी टूल का पैलेट इस्तेमाल होता है।

चित्र पैनल, URL इनपुट और फ़ाइल चयनकर्ता खुलने के समय का चयन याद रखते हैं। केवल कर्सर हटाया हो तो मूल जगह पर सम्मिलन होता है; दस्तावेज़ संपादित या बदला हो तो इनपुट रद्द करके सूचना दिखाई जाती है। Undo से समान सामग्री लौट आने पर भी पुराना चयन दोबारा इस्तेमाल नहीं होता।

## wings चुनना

केवल आवश्यक features रखने के लिए `use()` और `drop()` उपयोग करें। हर wing page उसके options बताती है।

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'hi' })
```

छोटे bundle के लिए केवल आवश्यक wings, जैसे `boldWing` और `imageWing`, array में दें। unknown names, invalid options और missing dependencies editor बनते ही fail होती हैं।

## save और load

दस्तावेज़ फिर edit होना हो तो `getJson()` output को NABI TREE JSON के रूप में save करें। `getHtml()` published output के लिए है। editor-only `getEditorHtml()` कभी save न करें।

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('सहेजा हुआ दस्तावेज़ पढ़ा नहीं जा सका।')

const publishedHtml = nabi.getHtml()
```

external HTML import करने के लिए `setHtml()` उपयोग करें। browser editor अपना HTML parser देता है, इसलिए parser option नहीं चाहिए। invalid non-empty input पर `setJson()` और `setHtml()` `false` लौटाकर मौजूदा दस्तावेज़ नहीं बदलते।

```ts
nabi.setHtml('<p>आयात किया गया दस्तावेज़</p>')
```

JSON और HTML दोनों untrusted input हैं। NABI NOTE registered wings और allowed rules से उन्हें पढ़ता है, लेकिन यह upload authorization या service security policy की जगह नहीं लेता।

## सामान्य API

| काम | API |
| --- | --- |
| editor बनाना | `createNabiWith`, `wings` |
| surface और toolbar mount करना | `mountSurface`, `mountToolbar` |
| save और restore | `getJson`, `setJson`, `getHtml`, `setHtml` |
| changes देखना | `nabi.onChange(listener)` |
| undo और redo | `nabi.undo()`, `nabi.redo()` |
| server पर HTML render करना | `renderStoredHtml` from `nabi-note/ssr` |
| published-page behavior जोड़ना | `attachViewer` from `nabi-note/viewer` |
| documents compare करना | `diffDocs` from `nabi-note/diff` |

सटीक types और सभी arguments के लिए पहले installed package declarations देखें। automation tools [English API reference](https://nabi.saro.me/llms/api-reference.md) भी उपयोग कर सकते हैं।

## mounts हटाना

creation के उलटे क्रम में unmount करें। editing root का `innerHTML` सीधे न बदलें; `setJson()`, `setHtml()` या `applyCommand()` जैसे public API उपयोग करें।

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
