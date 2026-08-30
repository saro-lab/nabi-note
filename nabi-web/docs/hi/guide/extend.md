---
title: कस्टम विंग
description: सहेजे जा सकने वाले नए दस्तावेज़ फ़ीचर बनाते समय पालन किए जाने वाले अनुबंध और कार्यान्वयन क्रम।
---

# कस्टम विंग

कस्टम विंग केवल एक टूलबार बटन जोड़ने की सुविधा नहीं है। यह दस्तावेज़ में सहेजी जाने वाली संरचना, कमांड,
HTML और Markdown रूपांतरण, आयात नियम और स्क्रीन व्यवहार को एक घोषणा में बाँधने वाली विस्तार इकाई है। रजिस्ट्री
एडिटर बनाने से पहले घोषणा की जाँच करती है, इसलिए गलत संरचना दस्तावेज़ में मिल जाने से बचती है।

## पहले सबसे छोटी फ़ैक्टरी चुनें

सामान्य स्वरूपण के लिए पूरी घोषणा शुरू से बनाने की आवश्यकता नहीं है। बिना मान वाले इनलाइन स्वरूपण के लिए
`simpleMark()`, सीमित मान वाले स्वरूपण के लिए `valueMark()`, बिना बच्चे वाले ब्लॉक के लिए `boxObject()`,
और सूची के लिए `listFamily()` का उपयोग करें।

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong),
)
```

## प्रकार के अनुसार सीधे बनाएँ

नीचे के उदाहरण अलग-अलग संग्रहित संरचनाएँ दिखाते हैं। शुरुआत में एक फ़ैक्टरी चुनकर पंजीकृत करें और
`getJson()` तथा `getHtml()` का परिणाम देखें। फ़ीचर को स्क्रीन पर डालने या बदलने के लिए उसके बाद कमांड और
बटन जोड़ें।

### 1. बिना मान वाला इनलाइन स्वरूपण: ज़ोर देना

केवल अक्षरों को घेरने वाले फ़ीचर के लिए `simpleMark()` उपयुक्त है। यह उदाहरण दस्तावेज़ में `exStrong` को
सहेजता है और HTML में `<strong>` के रूप में निकालता है।

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` देने पर स्वरूपण मिटाने से यह मार्क भी हटाया जा सकता है। बटन लगाने से पहले इसे
`nabi.applyCommand()` या किसी दूसरे कस्टम कमांड से लागू करें। प्रकाशित दृश्य की CSS में
`.nabi-content strong` जैसे एडिटर वाले ही चयनक का उपयोग करें।

### 2. मान वाला इनलाइन स्वरूपण: स्थिति लेबल

रंग, आकार या स्थिति जैसे अनुमत मानों में से एक चुनना हो तो `valueMark()` का उपयोग करें। मान JSON के
`a.v` में सहेजा जाता है और सूची से बाहर का मान `repair()` चरण में हटा दिया जाता है।

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

संग्रहण का उदाहरण `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["महत्वपूर्ण"] }` है।
CSS संग्रहित मान के चयनक से प्रकाशित दृश्य भी बदलती है। मानों की सूची घटाने पर मौजूदा दस्तावेज़ों के दूसरे
मान भी पढ़ते समय गायब हो सकते हैं, इसलिए पहले से सहेजे हुए दस्तावेज़ हों तो मान लापरवाही से न हटाएँ।

### 3. बच्चे रहित ब्लॉक: सूचना विभाजक

चित्र, वीडियो या विभाजक जैसे बच्चे रहित स्वतंत्र ब्लॉक `boxObject()` से बनाए जाते हैं। बिना किसी विशेषता वाला
विभाजक सबसे छोटा उदाहरण है।

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

पते या चौड़ाई जैसी विशेषता वाला ब्लॉक हो तो `attrs` में मान-जाँच फ़ंक्शन घोषित करें, और जो मान अनिवार्य हो
उसे `requires` में डालें। जाँचे न जा सकने वाले मान को डिफ़ॉल्ट मान में बदलने से बेहतर है उसे `null` से अस्वीकार
करना, ताकि संग्रहित डेटा और स्क्रीन में अंतर न आए।

### 4. कई अनुच्छेद रखने वाला ब्लॉक: मार्गदर्शन बॉक्स

मुख्य सामग्री रखने वाले ब्लॉक के लिए सीधे `container` घोषणा का उपयोग करें। `holds: 'blocks'` का अर्थ है कि
यह अनुच्छेद, सूची और चित्र जैसे ब्लॉक बच्चों को स्वीकार करता है।

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

केवल इस घोषणा से अनुच्छेदों को मार्गदर्शन बॉक्स के भीतर रखने का कमांड नहीं बनता। चुने हुए अनुच्छेद को घेरने वाला
शुद्ध कमांड `commands` में जोड़ें, और उस कमांड को चलाने वाला `button` घोषित करें, तभी इसे एडिटर UI में उपयोग
किया जा सकेगा।

### 5. सूची और आइटम साथ में बनाने वाला फ़ीचर

सूची में माता और आइटम हमेशा जोड़ी में होते हैं, इसलिए `listFamily()` का उपयोग करें। नीचे का उदाहरण `<ul>` और
`<li>` बनाने वाली सबसे छोटी उपयोगकर्ता सूची है।

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` सूची में आइटम के अतिरिक्त कोई ब्लॉक आ जाने पर भी उसे आइटम से घेरकर संरचना ठीक करता है।
चेक की स्थिति जैसे आइटम-वार मान सहेजने के लिए `itemDecl` और `repairItem` जोड़ें।

### पंजीकरण क्रम

कई विंग साथ उपयोग करने हों तो उन्हें एक बार में पंजीकृत करें। सर्वर रेंडरिंग को भी उसी क्रम और घोषणा का उपयोग
करना चाहिए, ताकि एक ही JSON से एक ही HTML निकले।

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ko' })
```

## नाम और संग्रहित संरचना तय करें

दस्तावेज़ में दर्ज नाम `ex[A-Z0-9]...` रूप में होना चाहिए। `exCallout` की तरह `ex` से शुरू होने पर, बाद में
आधिकारिक विंग जुड़ने पर भी सहेजे हुए दस्तावेज़ का अर्थ नहीं बदलेगा।

`place` संग्रहित संरचना तय करता है। वाक्य को घेरने वाला स्वरूपण `mark`, बच्चे रहित स्वतंत्र ब्लॉक `void`,
और बच्चों को रखने वाला ब्लॉक `container` है। अनुच्छेद विशेषता `attr` है और दस्तावेज़ न बनाने वाला स्क्रीन उपकरण
`tool` है। `container` के लिए `holds: 'blocks' | 'inline'` और `toHtml()` आवश्यक हैं।

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts` संग्रहित संरचना की सीमाएँ घोषित करने वाले विकल्प हैं।
`parts` का उपयोग करने पर हर part के लिए मेल खाता `partHtml` भी अवश्य घोषित करें। मान चुनने वाले विंग के लिए
`attrKey` और `attrValues` से अनुमत सीमा संकीर्ण करें।

## घोषणा के सभी विकल्प

केवल आवश्यक चीज़ें घोषित करें। फ़ैक्टरी का उपयोग करते समय फ़ैक्टरी द्वारा तय मान दोबारा न लिखें।

| वर्ग | विकल्प | उपयोग |
| --- | --- | --- |
| मूल | `w`, `place`, `basic`, `styles` | नाम, संरचना का प्रकार, मूल विंग शामिल करना, मूल CSS |
| संरचना | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | बच्चों का प्रकार, Enter व्यवहार, अनुमत विशेषताएँ, बूलियन विशेषताएँ |
| संरचना | `parts`, `allows`, `noAlign`, `requiresAnyOf` | आंतरिक भाग, अनुमत बच्चे, संरेखण निषिद्ध, आश्रित विंग |
| मान चयन | `attrKey`, `attrValues`, `currentValue` | संग्रहित मान की कुंजी व सूची और वर्तमान चयनित मान का निर्धारण |
| कमांड·इनपुट | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | कमांड, कुंजी व्यवहार, Escape·लगातार कुंजी·स्वचालित रूपांतरण |
| स्क्रीन जोड़ना | `attach` | सतह के लिए आवश्यक DOM व्यवहार और हटाने की प्रक्रिया |
| रूपांतरण | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML·Markdown आउटपुट |
| आयात·सुधार | `claim`, `ioFilter`, `repair`, `partRepair` | HTML आयात, फ़ाइल प्रसंस्करण, JSON जाँच·सुधार |
| UI | `button`, `buttons`, `context` | टूलबार और प्रसंग उपकरण घोषणा |
| स्वरूपण मिटाना | `clearable` | स्वरूपण मिटाने का लक्ष्य है या नहीं |

`w` और `place` हमेशा आवश्यक हैं। `mark`, `void`, `container` जैसे दस्तावेज़ नोड बनाने वाले विंग के लिए
`toHtml()` भी आवश्यक है। `container` के लिए `holds`, और `parts` के लिए उसी नाम का `partHtml` चाहिए।
`attr` और `tool` दस्तावेज़ नोड नहीं बनाते, इसलिए यह नियम अलग है।

## HTML, Markdown और JSON को साथ रखें

`toHtml()` संग्रहित नोड को स्क्रीन HTML में बदलता है और `toMd()` Markdown निर्यात संभालता है। Markdown
रूपांतरण घोषित न करने पर बनाया हुआ HTML रह जाता है, इसलिए जानकारी गायब नहीं होती। HTML को फिर पढ़ना हो तो
`claim()` में केवल अपने तत्व और विशेषताएँ जाँचकर उसे नोड में बदलें।

`repair()` JSON लोड करते समय और कमांड चलने के बाद फिर चलता है। अनुमत न होने वाले विशेषता मानों को ठीक करके
लौटाएँ, और बचाए न जा सकने वाले नोड के लिए `null` लौटाएँ। HTML को `ctx.element()`, `ctx.escape()`,
`ctx.url()` जैसे कॉन्टेक्स्ट फ़ंक्शन से बनाएँ। स्ट्रिंग जोड़कर टैग, विशेषता और URL जाँच को दरकिनार न करें।

## कमांड और स्क्रीन व्यवहार अलग रखें

कमांड दस्तावेज़ और चयन स्थान लेकर नया दस्तावेज़ तथा उसमें स्थित चयन स्थान लौटाने वाला शुद्ध फ़ंक्शन है।
यह DOM को न पढ़ता है, न बदलता है; और बदले न जा सकने वाले अनुरोध पर `null` लौटाता है। कमांड का नाम
`insertNote` की तरह क्रिया से शुरू होने वाले लोअर कैमल केस में रखें।

तालिका में खींचकर चुनने जैसे, कमांड से व्यक्त करना कठिन स्क्रीन व्यवहार को `attach(host)` में रखें। इवेंट
लिस्नर या विशेषता बदलते ही `host.onDispose()` से पूर्वावस्था लौटाने वाला फ़ंक्शन पंजीकृत करें, ताकि बाद की
सेटिंग विफल होने पर भी सफ़ाई हो जाए। संयोजन में मौजूद पाठ DOM या सतह की चयन मैपिंग को सीधे न बदलें।

टूलबार और प्रसंग उपकरण `button`, `buttons`, `context` घोषणाओं से बनाएँ। समान कमांड नियम को एप्लिकेशन UI में
अलग से लागू करने पर टूलबार और दस्तावेज़ मॉडल में अंतर आ सकता है।

## CSS शैली

विंग की `styles` में आवश्यक मूल CSS घोषित की जा सकती है। पंजीकृत विंग की CSS `nabi-note/nabi.css` में शामिल
होती है। केवल चुनी हुई रजिस्ट्री की CSS को रनटाइम पर बनाने पर ब्राउज़र में `collectSheets()` और
`injectSheets()` का उपयोग किया जा सकता है, लेकिन SSR में CSS फ़ाइल को लिंक करें।

प्रकाशित दृश्य में भी एडिटर जैसे क्लास और डेटा विशेषताओं से CSS लागू करें। एडिटर में उपयोग होने वाले चयनक और
प्रकाशित दृश्य में उपयोग होने वाले चयनक अलग रखें, और `[data-key]` एडिटिंग नोड की संरचना या `display`,
`white-space` को न बदलें। CSS केवल रूप बदलनी चाहिए और दस्तावेज़ संरचना तथा कैरेट मैपिंग को नहीं छूना चाहिए।

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

केवल `toHtml()` द्वारा बनाई गई क्लास या डेटा विशेषताओं को लक्ष्य बनाने पर, एक ही JSON को एडिटर और प्रकाशित
दृश्य में सुरक्षित रूप से अलग ढंग से सजाया जा सकता है। सेवा-विशिष्ट बदलाव को `.article-body .ex-callout` जैसे
और संकरे चयनक से अलग रखें।

## जाँचने योग्य बातें

जाँचें कि सहेजा हुआ JSON फिर लोड करने पर वही संरचना और HTML देता है। गलत नाम, डुप्लीकेट कमांड, अनुपस्थित
`builder` और पूरी न हुई निर्भरताओं को रजिस्ट्री अस्वीकार करती है या नहीं, इसका भी परीक्षण करें। HTML आयात और
`repair()` के गलत इनपुट, कमांड का चयन स्थान, SSR आउटपुट और CSS लगी प्रकाशित स्क्रीन तक जाँचने पर परिणाम
सुरक्षित रहता है।

पूर्ण प्रकार और फ़ैक्टरी के आर्ग्युमेंट स्थापित पैकेज की प्रकार घोषणाओं तथा
[अंग्रेज़ी API संदर्भ](https://nabi.saro.me/llms/api-reference.md) में देखे जा सकते हैं।
