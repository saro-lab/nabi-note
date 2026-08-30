---
title: कोड
description: कई पंक्तियों का कोड और syntax highlighting के लिए भाषा की जानकारी रखता है।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# कोड

कई पंक्तियों के code को सामान्य पाठ से अलग रखता है। खाली अनुच्छेद में तीन backticks लिखकर Space या Enter दबाएँ या टूलबार से बदलें। backticks के बाद `ts` जैसा भाषा नाम लिखने पर वह भी सहेजा जाता है।

भाषा नाम syntax highlighting का identifier है और registered list से बाहर का नाम भी सीधे लिखा जा सकता है। code content और indentation बचाए रखने के लिए code block पर paragraph alignment लागू नहीं होता।

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## कोड highlighter जोड़ना

code block register करने पर editor basic coloring उपयोग करता है। प्रकाशित पृष्ठ पर भी रंग चाहिए तो `nabi-note/viewer` जोड़ें। viewer `pre > code` ढूँढकर parent का `data-nabi-lang` भाषा नाम के रूप में पढ़ता है। वह न हो तो `code` element का `language-...` class देखता है।

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'hi',
})

// प्रकाशित HTML बदलने के बाद
viewer.refresh()

// screen बंद करते समय
viewer.unmount()
```

अलग highlighter न हो या भाषा संभाल न सके तो dependency-free built-in tokenizer रंग देता है। highlighter के token spans केवल screen पर होते हैं और saved JSON या मूल प्रकाशित HTML में नहीं जाते। `refresh()` और `unmount()` इन spans को हटाकर मौजूदा source code से दोबारा जोड़ते हैं।

### NABI वेबसाइट का Shiki integration

NABI वेबसाइट पहले screen और SSR bundle से Shiki को बाहर रखने के लिए highlighter dynamically लोड करती है। `nabi-web/docs/.vitepress/src/highlight.ts` की `loadCodeHighlighting()` Shiki core बनाती है और किसी code भाषा की वास्तव में आवश्यकता होने पर केवल उसी की grammar लाती है। नीचे प्रकाशित पृष्ठ का वही तरीका है।

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'hi',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// screen बंद करते समय
stop?.()
viewer.unmount()
```

किसी भाषा के पहली बार मिलने पर उसकी grammar download शुरू होती है; तब तक built-in tokenizer या plain text दिखता है। grammar आने पर `onGrammarLoaded()` फिर रंगने के लिए `viewer.refresh()` बुलाता है। इससे केवल आवश्यक भाषाएँ डाउनलोड होती हैं और देर से आई grammar अगली screen पर जाए बिना लागू होती है।

editor भी वही `highlight` function उपयोग करता है। NABI वेबसाइट के demo में basic `codeWing` का केवल `attach`, `makeCodeAttach({ highlight, version })` से बदला जाता है। हर grammar आने पर `version` बदलती है और पहले से बनाए code को फिर रंगने का संकेत देती है। स्वतंत्र service पहले केवल published view integration बनाए; editing में Shiki अनिवार्य हो तभी यह तरीका जोड़े।

## CSS शैलियाँ

code block को `.nabi-content pre` और code को `.nabi-content pre > code` से सजाएँ। `white-space` code wrapping और editing को प्रभावित करता है, इसलिए न बदलें। token colors `[data-nabi-token]` selector से बदल सकते हैं।

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
