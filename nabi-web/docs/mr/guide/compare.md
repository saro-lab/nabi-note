---
title: तुलना
description: दोन दस्तऐवज शेजारी तुलना करून निवडलेला जुना मजकूर सध्याच्या दस्तऐवजात लावा.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# तुलना

दोन जतन केलेले दस्तऐवज शेजारी ठेवून बदल पाहा. संपादकाशिवाय तुलना उघडते; callback जोडून निवडलेला जुना मजकूर सध्याच्या दस्तऐवजात लावा.

## निवडलेला जुना मजकूर लावणे

डावीकडे जुना, उजवीकडे सध्याचा दस्तऐवज आहे. बदलाजवळ **&gt;&gt;** दाबल्यास त्या परिच्छेदाचा किंवा ओळींच्या गटाचा जुना मजकूर लागू होतो. अक्षरशः निवड नसते. काढलेला मजकूर परत आणता किंवा नवीन मजकूर काढता येतो.

खाली फक्त बैठकीची वेळ किंवा आणायच्या वस्तू पूर्ववत करा. **callback ने अद्ययावत केलेला सध्याचा दस्तऐवज** उघडून निकाल पाहा. **पुन्हा सुरू करा** मूळ उदाहरण आणते.

<CompareDemo />

## स्वतंत्र तुलना दृश्य

`nabi-note/diff` मधून आयात करा. `before` आणि `after` मध्ये जतन केलेले NABI TREE JSON किंवा HTML स्ट्रिंग द्या. तक्ते, याद्या, चित्रे पूर्ण वाचण्यासाठी आणि दाखवण्यासाठी मूळ संपादकाचेच wings वापरून registry बनवा.

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
  locale: 'mr',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

सुरुवातीला बदल आणि आसपासचा संदर्भ दिसतो. घडीचे बटण संपूर्ण दस्तऐवज उघडते; मागील/पुढील बदलांकडे नेतात. बदल नसल्यास पूर्ण दस्तऐवज दिसतो. `onMerge` वगळल्यास फक्त वाचता येते.

## callback ने क्लिक मर्ज जोडणे

क्लिक प्रस्तावित निकाल `onMerge` ला देते. केवळ callback जोडल्याने आपोआप जतन होत नाही. सेवेने प्रस्ताव स्वीकारून `update()` बोलावल्यावर तुलना बदलते.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'mr',
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

`proposal.result` फक्त निवडलेला बदल लावलेले NABI TREE JSON आहे. `before` आणि `after` क्लिकवेळचे दस्तऐवज; `changeId` बदल, `revision` तुलनेची स्थिती ओळखते. हे `revision` `update()` च्या तिसऱ्या घटकात द्या: तुलना बदलली असल्यास `false` मिळते आणि प्रस्ताव लागू होत नाही.

असिंक्रोनस callback च्या प्रतीक्षेत पुन्हा क्लिक रोखले जातात. दुसरे दस्तऐवज दिल्यास किंवा दृश्य काढल्यास `signal` रद्द होते. सर्व्हरवर जतन करताना संकेत आणि दस्तऐवजाची सर्व्हर आवृत्ती तपासा, म्हणजे जुना निकाल नवा दस्तऐवज पुसणार नाही.

## संपादकातून तुलना उघडणे

टूलबारमधून उघडण्यासाठी `diff` wing आणि `mountDiffWing()` जोडा. आधार शेवटचा लोड केलेला दस्तऐवज. सामान्य संपादन आणि पूर्ववत करणे आधार बदलत नाहीत.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'mr',
  merge: true,
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

`merge: true` दिल्यास निवडलेला जुना मजकूर संपादकात लागू होतो. तो पूर्ववत करता येतो, आधार कायम राहतो. दृश्य उघडे असताना मूळ संपादक बदलल्यास तुलना पुन्हा मोजली जाते. `merge` वगळल्यास वाचन दृश्य राहते.

दृश्य काढताना `toolbar.unmount()` आणि `comparison.unmount()` बोलवा. संपादन सुरू झालेली आवृत्तीही घेऊन दोन्ही बाजू आपोआप जोडण्यासाठी [मर्ज](./merge) वापरा.
