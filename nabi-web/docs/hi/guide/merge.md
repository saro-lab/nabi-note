---
title: मर्ज
description: संपादन की शुरुआती, अपनी और इस बीच सहेजी गई प्रति जोड़ें और बचे टकराव संपादित करके हल करें।
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# मर्ज

आपके संपादन के दौरान दूसरे बदलाव सहेजे गए हों तो शुरुआती संस्करण के आधार पर दोनों पक्ष जोड़ें। स्वतः जुड़ सकने वाले सभी बदलाव पहले ही लागू होते हैं; केवल एक-दूसरे पर पड़ते बदलाव टकराव रहते हैं। यह `nabi-note/merge` का स्वतंत्र दृश्य है, wing नहीं।

| बायाँ | बीच | दायाँ |
| --- | --- | --- |
| संपादन शुरू होने का संस्करण | स्वतः मर्ज के बाद आपका वर्तमान दस्तावेज़ | आपके संपादन के दौरान सहेजा संस्करण |
| केवल पढ़ने योग्य | सीधे संपादन योग्य | केवल पढ़ने योग्य |

बीच में सामान्य संपादक की तरह पाठ, स्वरूप, तालिका, सूची और चित्र बदल सकते हैं। दिए गए wings सुविधाएँ तय करते हैं। टकराव चिह्न और समाधान की स्थिति सहेजी सामग्री में नहीं मिलते।

## पूरी तरह स्वतः मर्ज होने का उदाहरण

आपने बैठक का समय **सुबह 11 बजे** किया और दूसरे व्यक्ति ने स्थान **तीसरी मंज़िल का बैठक कक्ष** किया। अलग अनुच्छेद होने से बीच के परिणाम में दोनों बदलाव आते हैं।

कोई टकराव नहीं बचा, इसलिए सीधे **पुष्टि करें** दबाएँ या पहले बीच का पाठ सुधारें। नीचे का अंतिम दस्तावेज़ पुष्टि callback को मिला वास्तविक परिणाम है।

<MergeDemo />

## आंशिक स्वतः मर्ज का उदाहरण

इस बार आपने समय **सुबह 11 बजे**, दूसरे ने **दोपहर 2 बजे** किया। एक ही अनुच्छेद के अलग बदलाव से समय टकराव रहता है। संचालक **जिमिन और सोयोन** करने और स्थान **तीसरी मंज़िल का बैठक कक्ष** करने के बदलाव स्वतः लागू होते हैं।

टकराव इनमें से किसी तरह हल करें:

- बायाँ **&gt;&gt;**: शुरुआती संस्करण की संबंधित सामग्री लें।
- दायाँ **&lt;&lt;**: नए सहेजे संस्करण की संबंधित सामग्री लें।
- **वर्तमान सामग्री से हल करें**: बीच की सामग्री रखें या संपादित करें, फिर हल चिह्नित करें।

बीच का समय वाला वाक्य बदलें और **वर्तमान सामग्री से हल करें** दबाएँ। सभी टकराव हल होने पर ही पुष्टि संभव है।

<MergeDemo partial />

हल क्षेत्र फिर संपादित करने पर स्थिति बनी रहती है। समाधान पूर्ववत करने से स्थिति भी लौटती है; फिर करने से बहाल होती है। केवल पाठ मिटाना या बदलना खुले टकराव को स्वतः हल नहीं करता।

## स्वतः मर्ज और टकराव के नियम

शुरुआती दस्तावेज़ से आपके दस्तावेज़ और उसी शुरुआत से नए संस्करण के बदलाव तुलना किए जाते हैं। एकतरफ़ा और दोनों तरफ समान बदलाव स्वतः लागू होते हैं। अलग अनुच्छेद या पंक्तियों के बदलाव भी जुड़ते हैं।

Git पाठ मर्ज की तरह अनुच्छेद और पंक्ति से ओवरलैप तय होता है। एक पंक्ति में अलग शब्द बदलने पर भी टकराव रहता है। एक स्थान पर अलग सामग्री जोड़ना या दूसरे पक्ष की हटाई सामग्री बदलना भी निर्णय माँगता है।

तालिका, सूची या float जैसे संरचित ब्लॉक दोनों तरफ अलग बदलें तो पूरी संरचना टकराव है। सेल और सूची मद मनमाने नहीं मिलते; सामग्री चुनें या बीच में बदलें। स्थान निश्चित न होने वाले साथ हुए स्थानांतरण और संपादन भी स्वतः लागू नहीं होते।

## स्वतंत्र मर्ज दृश्य जोड़ना

`base`, `local`, `incoming` में सहेजा NABI TREE JSON या HTML स्ट्रिंग दें। मूल संपादक के wings और विकल्प इस्तेमाल करें। `mountMerge()` बीच का संपादक, टूलबार, दोनों स्रोत, टकराव चयन और पुष्टि बटन बनाता है।

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'hi',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` को पूरी तरह हल वर्तमान परिणाम का JSON, प्रकाशन HTML, संपादन revision और `incomingVersion` मिलता है। `false` लौटाने से पुष्टि पूरी नहीं होती। Promise लंबित हो तो संपादन, टकराव चयन और दोहरी पुष्टि रुकते हैं। दृश्य हटाने पर परिणाम का `signal` रद्द होता है। कोरियाई IME संयोजन समाप्त होने पर ही पुष्टि करें।

चित्र चयन या अपलोड जैसे सेवा कार्य सामान्य संपादक की तरह जोड़ें। `toolbarOptions` में पैनल और होस्ट कार्य, `surfaceOptions` में संपादन सतह के विकल्प दें।

`incomingVersion` सेवा का दिया मान जस का तस लौटाता है। सहेजते समय सेवा इसे सर्वर के नवीनतम संस्करण से जाँचे। मर्ज के दौरान नया संस्करण सहेजा जाए तो पुराना परिणाम उस पर न लिखें; नवीनतम दस्तावेज़ लेकर नया मर्ज शुरू करें।

दृश्य के बाहर से भी स्थिति पढ़ या पुष्टि बुला सकते हैं।

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

परिणाम `merge.nabi.getJson()` और `merge.nabi.getHtml()` से पढ़ें। संपादन DOM या `getEditorHtml()` न सहेजें। दो संस्करणों में केवल चुनी पुरानी सामग्री लागू करने के लिए [तुलना](./compare) का क्लिक मर्ज लें।

## अपलोड पूरा होने के बाद पुष्टि

फ़ाइल बटन, पेस्ट और ड्रैग-ड्रॉप के लिए `upload` wing और `mountUpload()` जोड़ें। `sendUpload` फ़ाइल सर्वर भेजकर `{ uri }` लौटाता है। पूरा कनेक्शन और प्रगति उदाहरण [फ़ाइल अपलोड](../wing/etc/upload) में देखें।

दस्तावेज़ में अभी न आए अपलोड जैसे अतुल्यकालिक काम में `merge.session.hold()` से पुष्टि और टकराव चयन रोकें। पूर्णता, रद्द करने या दृश्य हटाने पर लौटा फ़ंक्शन बुलाएँ। रोक **दस्तावेज़ में डालने के बाद** हटाएँ, सर्वर अपलोड होते ही नहीं, ताकि फ़ाइल अंतिम परिणाम में रहे।

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'hi',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'hi',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` बीच का संपादन DOM है; `merge.surface` और `merge.toolbar` पहले से जुड़े हैं। उसी जगह दूसरी सतह या टूलबार न बनाएँ। पहले अतिरिक्त अपलोड और प्रगति mount हटाएँ, अंत में `merge.unmount()` बुलाएँ।
