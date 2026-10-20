---
title: तुलना
description: दो दस्तावेज़ साथ रखकर तुलना करें और चुनी हुई पुरानी सामग्री वर्तमान दस्तावेज़ में लागू करें।
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# तुलना

दो सहेजे दस्तावेज़ साथ रखकर बदलाव देखें। संपादक के बिना भी तुलना खुलती है; callback जोड़कर चुनी पुरानी सामग्री वर्तमान दस्तावेज़ में लागू करें।

## चुनी पुरानी सामग्री लागू करना

अलग तुलना दृश्य डिफ़ॉल्ट रूप से केवल पढ़ने के लिए होता है और **&gt;&gt;** लागू करने वाले बटन नहीं दिखाता। इन बटनों के लिए `onMerge` कॉलबैक जोड़ें।

बाईं ओर पुराना और दाईं ओर वर्तमान दस्तावेज़ है। बदलाव के पास **&gt;&gt;** दबाने पर उस अनुच्छेद या पंक्ति समूह की पुरानी सामग्री लागू होती है। चयन अक्षर-अक्षर नहीं होता। हटाई सामग्री वापस ला सकते हैं या नई जोड़ी सामग्री हटा सकते हैं।

नीचे का उदाहरण केवल पढ़ने के लिए है। देखें कि मिलने का समय और लाने वाली चीज़ें कैसे बदली हैं। **फिर से शुरू करें** मूल उदाहरण वापस लाता है।

<CompareDemo />

## स्वतंत्र तुलना दृश्य

`nabi-note/diff` से आयात करें। `before` और `after` में सहेजा NABI TREE JSON या HTML स्ट्रिंग दें। तालिकाएँ, सूचियाँ, चित्र आदि पूरा पढ़ने और दिखाने के लिए मूल संपादक वाले wings से registry बनाएँ।

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'hi',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

डिफ़ॉल्ट में बदलाव और आसपास का संदर्भ दिखता है। समेटने वाला बटन पूरा दस्तावेज़ खोलता है; पिछला/अगला बदलावों में जाते हैं। बदलाव न हो तो पूरा दस्तावेज़ दिखता है। `onMerge` छोड़ने पर दृश्य केवल पढ़ने योग्य है।

## callback से क्लिक मर्ज जोड़ना

क्लिक से प्रस्तावित परिणाम `onMerge` को मिलता है। केवल callback जोड़ने से स्वतः सहेजा नहीं जाता। सेवा को प्रस्ताव स्वीकार कर `update()` बुलाना होगा, तभी तुलना बदलेगी।

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'hi',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` केवल चुना बदलाव लागू किया हुआ NABI TREE JSON है। `before` और `after` क्लिक के समय के दस्तावेज़ हैं; `changeId` बदलाव और `revision` तुलना की स्थिति पहचानता है। यह `revision`, `update()` के तीसरे तर्क में दें: तुलना बदल चुकी हो तो `false` लौटता है और प्रस्ताव लागू नहीं होता।

अतुल्यकालिक callback की प्रतीक्षा में दोबारा क्लिक रोकते हैं। दूसरे दस्तावेज़ से अद्यतन या दृश्य हटाने पर `signal` रद्द होता है। सर्वर पर सहेजते समय संकेत और सर्वर दस्तावेज़ संस्करण दोनों जाँचें, ताकि पुराना परिणाम नई सामग्री न मिटाए।

## संपादक से तुलना खोलना

टूलबार से खोलने के लिए `diff` wing और `mountDiffWing()` जोड़ें। आधार आखिरी लोड किया दस्तावेज़ है। सामान्य संपादन या पूर्ववत से आधार नहीं बदलता।

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'hi',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` का डिफ़ॉल्ट `true` है, इसलिए चुनी हुई पुरानी सामग्री संपादक में लागू की जा सकती है। बदलाव पूर्ववत किया जा सकता है और आधार दस्तावेज़ बना रहता है। दृश्य खुला होने पर मूल संपादक में बदलाव तुलना की दोबारा गणना करता है। केवल पढ़ने वाली तुलना के लिए `merge: false` दें।

दृश्य हटाते समय `toolbar.unmount()` और `comparison.unmount()` बुलाएँ। संपादन शुरू होने वाला संस्करण भी लेकर दोनों पक्ष स्वतः जोड़ने के लिए [मर्ज](./merge) इस्तेमाल करें।
