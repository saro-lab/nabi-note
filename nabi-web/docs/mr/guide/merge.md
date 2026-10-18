---
title: मर्ज
description: संपादनाची सुरुवातीची, स्वतःची आणि दरम्यान जतन झालेली आवृत्ती जोडा; उरलेले संघर्ष संपादित करून सोडवा.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# मर्ज

तुमच्या संपादनादरम्यान दुसरे बदल जतन झाले तर सुरुवातीच्या आवृत्तीवर दोन्ही बाजू जोडा. आपोआप जोडता येणारे सर्व बदल आधीच लागू होतात; आच्छादित बदलच संघर्ष राहतात. हे `nabi-note/merge` चे स्वतंत्र दृश्य आहे, wing नाही.

| डावे | मधले | उजवे |
| --- | --- | --- |
| संपादन सुरू झाले तेव्हाची आवृत्ती | स्वयंचलित मर्जनंतर तुमचा सध्याचा दस्तऐवज | तुमच्या संपादनादरम्यान जतन झालेली आवृत्ती |
| फक्त वाचन | थेट संपादन | फक्त वाचन |

मध्ये सामान्य संपादकाप्रमाणे मजकूर, स्वरूप, तक्ते, याद्या, चित्रे बदलता येतात. दिलेले wings सुविधा ठरवतात. संघर्ष चिन्हे आणि सोडवण्याची स्थिती जतन केलेल्या मजकुरात जात नाहीत.

## पूर्ण स्वयंचलित मर्जचे उदाहरण

तुम्ही वेळ **सकाळी ११**, दुसऱ्याने जागा **तिसऱ्या मजल्यावरील बैठक कक्ष** केली. भिन्न परिच्छेद असल्याने मधल्या निकालात दोन्ही बदल येतात.

संघर्ष उरलेला नाही; लगेच **पुष्टी करा** दाबा किंवा आधी मधला मजकूर सुधारा. खालील अंतिम दस्तऐवज पुष्टी callback ला मिळालेला प्रत्यक्ष निकाल आहे.

<MergeDemo />

## अंशतः स्वयंचलित मर्जचे उदाहरण

यावेळी तुम्ही वेळ **सकाळी ११**, दुसऱ्याने **दुपारी २** केली. एकाच परिच्छेदाचे भिन्न बदल असल्याने वेळ संघर्ष राहतो. समन्वयक **जिमिन आणि सोयॉन** व जागा **तिसऱ्या मजल्यावरील बैठक कक्ष** करण्याचे बदल आपोआप लागू होतात.

संघर्ष यापैकी एका प्रकारे सोडवा:

- डावे **&gt;&gt;**: सुरुवातीच्या आवृत्तीचा संबंधित मजकूर घ्या.
- उजवे **&lt;&lt;**: नव्या जतन केलेल्या आवृत्तीचा संबंधित मजकूर घ्या.
- **सध्याच्या मजकुराने सोडवा**: मधला मजकूर ठेवा किंवा बदला आणि सोडवले म्हणून नोंदवा.

मधले वेळेचे वाक्य बदलून **सध्याच्या मजकुराने सोडवा** दाबा. सर्व संघर्ष सुटल्यावरच पुष्टी होते.

<MergeDemo partial />

सुटलेला भाग पुन्हा संपादित केला तरी स्थिती राहते. सोडवणे पूर्ववत केल्यास स्थितीही मागे जाते; पुन्हा केल्यास परत येते. फक्त मजकूर पुसणे किंवा बदलणे खुले संघर्ष आपोआप सोडवत नाही.

## स्वयंचलित मर्ज आणि संघर्षाचे नियम

सुरुवातीपासून तुमच्या दस्तऐवजापर्यंत आणि त्याच सुरुवातीपासून नव्या आवृत्तीपर्यंतचे बदल तुलना होतात. एकतर्फी आणि दोन्हीकडचे समान बदल आपोआप लागू होतात. वेगळ्या परिच्छेद किंवा ओळींचे बदलही जोडतात.

Git मजकूर मर्जप्रमाणे परिच्छेद आणि ओळीनुसार आच्छादन ठरते. एकाच ओळीत भिन्न शब्द बदलले तरी संघर्ष राहतो. एकाच जागी भिन्न भर किंवा दुसऱ्याने काढलेला मजकूर बदलणेही निर्णय मागते.

तक्ता, यादी किंवा float सारखा रचनाबद्ध ब्लॉक दोन्हीकडे वेगळा बदलला तर पूर्ण रचना संघर्ष होते. सेल किंवा यादीतील घटक मनमानी मिसळत नाहीत; मजकूर निवडा किंवा मध्ये बदला. हलवणे आणि संपादन आच्छादित असून जागा निश्चित नसल्यासही आपोआप लागू होत नाही.

## स्वतंत्र मर्ज दृश्य जोडणे

`base`, `local`, `incoming` मध्ये जतन केलेले NABI TREE JSON किंवा HTML स्ट्रिंग द्या. मूळ संपादकाचे wings आणि पर्याय वापरा. `mountMerge()` मधला संपादक, टूलबार, दोन्ही स्रोत, संघर्ष निवड आणि पुष्टी बटण बनवते.

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
  locale: 'mr',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` पूर्ण सुटलेल्या सध्याच्या निकालाचे JSON, प्रकाशन HTML, संपादन revision आणि `incomingVersion` घेते. `false` परत केल्यास पुष्टी पूर्ण होत नाही. Promise प्रलंबित असेल तर संपादन, संघर्ष निवड आणि दुबार पुष्टी थांबतात. दृश्य काढल्यावर निकालाचा `signal` रद्द होतो. कोरियन IME अक्षररचना संपल्यावरच पुष्टी करता येते.

चित्र निवड किंवा अपलोडसारखी सेवेची कामे सामान्य संपादकाप्रमाणे जोडा. `toolbarOptions` मध्ये पॅनेल आणि होस्ट क्रिया, `surfaceOptions` मध्ये संपादन पृष्ठाचे पर्याय द्या.

`incomingVersion` सेवेचे मूल्य जसेच्या तसे देते. जतन करताना सेवेने सर्व्हरच्या नव्या आवृत्तीशी तपासावे. मर्जदरम्यान नवी आवृत्ती जतन झाली तर जुना निकाल तिच्यावर लिहू नका; नवीन दस्तऐवज घेऊन नवा मर्ज सुरू करा.

दृश्याबाहेरूनही स्थिती वाचता किंवा पुष्टी बोलावता येते.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

निकाल `merge.nabi.getJson()` आणि `merge.nabi.getHtml()` ने वाचा. संपादन DOM किंवा `getEditorHtml()` जतन करू नका. दोन आवृत्त्यांत फक्त निवडलेला जुना मजकूर लावण्यासाठी [तुलना](./compare) मधील क्लिक मर्ज वापरा.

## अपलोडनंतर पुष्टी

फाइल बटण, पेस्ट आणि ड्रॅग-ड्रॉपसाठी `upload` wing आणि `mountUpload()` जोडा. `sendUpload` फाइल सर्व्हरला पाठवून `{ uri }` देते. पूर्ण जोडणी आणि प्रगती उदाहरण [फाइल अपलोड](../wing/etc/upload) मध्ये पाहा.

दस्तऐवजात अजून न आलेल्या अपलोडसारख्या असिंक्रोनस कामात `merge.session.hold()` ने पुष्टी आणि संघर्ष निवड थांबवा. पूर्ण, रद्द किंवा दृश्य काढताना मिळालेले कार्य बोलवा. थांबवणे **दस्तऐवजात घातल्यानंतर** सोडा, सर्व्हरवर अपलोड होताच नाही, म्हणजे फाइल अंतिम निकालात राहील.

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
  locale: 'mr',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'mr',
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

`merge.content` मधला संपादन DOM; `merge.surface` आणि `merge.toolbar` आधीच जोडले आहेत. त्याच जागी दुसरा पृष्ठभाग किंवा टूलबार बनवू नका. आधी अतिरिक्त अपलोड व प्रगती mount काढा, शेवटी `merge.unmount()` बोलवा.
