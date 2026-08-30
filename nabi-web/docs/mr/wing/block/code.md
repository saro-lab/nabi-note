---
title: कोड
description: वाक्यरचना ठळक करण्यासाठी वापरल्या जाणाऱ्या भाषेसह अनेक ओळींचा कोड साठवा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# कोड

साध्या मजकुरापासून वेगळा अनेक ओळींचा कोड घाला. रिकाम्या परिच्छेदात तीन backtick टाइप करून Space किंवा Enter दाबा, किंवा toolbar मधून code block निवडा. backtick नंतर `ts` सारखे भाषा-नाव घातल्यास तेही साठवले जाते.

भाषेचे नाव हे syntax highlighting साठीचे ओळखचिन्ह असते आणि नोंदवलेल्या यादीबाहेरची नावेही हाताने टाइप करता येतात. कोडचा मजकूर व indentation जपणे आवश्यक असल्याने code block वर परिच्छेद संरेखन लागू होत नाही.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## कोड highlighter जोडा

कोड block नोंदवल्यावर संपादकात मूलभूत रंगभरणी वापरली जाते. प्रकाशित दृश्यातही कोड रंगवायचा असल्यास `nabi-note/viewer` जोडा. viewer `pre > code` शोधतो आणि पालक घटकातील `data-nabi-lang` मूल्य भाषा-नाव म्हणून वाचतो. ते मूल्य नसल्यास `code` घटकावरील `language-...` class तपासतो.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'mr',
})

// प्रकाशित HTML बदलल्यानंतर
viewer.refresh()

// स्क्रीन बंद करताना
viewer.unmount()
```

वेगळा highlighter नसेल किंवा तो भाषा हाताळू शकत नसेल तर dependency नसलेला अंतर्भूत tokenizer कोड रंगवतो. highlighter ने घातलेले token span फक्त स्क्रीनवर असतात; ते साठवलेल्या JSON मध्ये किंवा मूळ प्रकाशित HTML मध्ये परत लिहिले जात नाहीत. `refresh()` आणि `unmount()` हे span काढून सध्याच्या मूळ कोडापासून पुन्हा जोडतात.

### NABI वेबसाइट Shiki कसे जोडते

NABI वेबसाइट highlighter गतिमानपणे लोड करते, त्यामुळे Shiki पहिल्या स्क्रीनमध्ये किंवा SSR bundle मध्ये जात नाही. `nabi-web/docs/.vitepress/src/highlight.ts` मधील `loadCodeHighlighting()` Shiki core तयार करते आणि त्या भाषेतील कोड खरोखर लागल्यावरच तिचे grammar आणते. खालील उदाहरण प्रकाशित दृश्यात हाच जोड वापरते.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'mr',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// स्क्रीन बंद करताना
stop?.()
viewer.unmount()
```

एखादी भाषा प्रथम दिसल्यावर तिचे grammar download सुरू होते. तोपर्यंत block अंतर्भूत tokenizer ने किंवा साधा मजकूर म्हणून दिसतो. grammar आल्यावर `onGrammarLoaded()` `viewer.refresh()` कॉल करते आणि block पुन्हा रंगवते. त्यामुळे लागणाऱ्या भाषाच download होतात आणि उशिरा आलेले grammar दुसरे page navigation न करता लागू होते.

संपादक बाजूही तीच `highlight` function वापरते. NABI वेबसाइट demo मध्ये फक्त default `codeWing` चे `attach` बदलून `makeCodeAttach({ highlight, version })` केले आहे. grammar आल्यावर `version` बदलते आणि आधी काढलेल्या कोडाला पुन्हा रंगवण्याचा संकेत म्हणून काम करते. स्वतंत्र सेवेत आधी प्रकाशित दृश्याचा जोड लागू करता येतो; संपादनातही Shiki रंगभरणी हवी असेल तरच पुढे हा मार्ग जोडा.

## CSS शैली

कोड block साठी `.nabi-content pre` आणि कोडसाठी `.nabi-content pre > code` style करा. `white-space` बदलू नका, कारण त्याचा कोडच्या ओळी बदलण्यावर आणि संपादनावर परिणाम होतो. token रंग `[data-nabi-token]` selectors ने बदलता येतात.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
