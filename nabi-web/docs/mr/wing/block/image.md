---
title: प्रतिमा
description: image URL घाला आणि width व alignment समायोजित करा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# प्रतिमा

image URL घाला आणि त्याची width व alignment समायोजित करा. default ने addresses `http:`, `https:` किंवा त्याच site च्या paths पुरते मर्यादित असतात आणि नवी image 60% width वर मध्यभागी सुरू होते.

width फक्त ठराविक steps मध्ये साठवली जाते आणि alignment image ला wrap करणाऱ्या paragraph वर साठवले जाते. `blob:` किंवा `data:image/...` previews साठी image wing आणि editor assembly दोन्हींमध्ये local URLs स्पष्टपणे allow करा. SVG data URLs ला परवानगी नाही.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

हा wing document मध्ये address घालतो; तो files upload करत नाही. server वर files पाठवण्यासाठी [upload wing](/mr/wing/etc/upload) जोडा.

## प्रतिमा निवडण्याची खिडकी जोडणे

प्रतिमा बटणाची मूलभूत URL इनपुट खिडकी तुमच्या सेवेतील प्रतिमा निवडण्याच्या खिडकीने बदलण्यासाठी `mountToolbar()` मध्ये `panels.img` वापरा. कळा म्हणजे टूलबार स्लॉटची नावे; न दिलेली साधने त्यांच्या मूलभूत खिडक्या वापरत राहतात.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: ({ root, signal, run }) =>
      mountMyImagePicker(root, {
        signal,
        onSelect: (url: string) => run('insertImage', { src: url }),
      }),
  },
})
```

`mountMyImagePicker` हे तुमच्या सेवेत तयार करायचे फंक्शन आहे. ते मिळालेल्या `root` मध्ये तुमचा UI समकालिकपणे तयार करते आणि साफसफाईचे फंक्शन परत करते. प्रतिमांची यादी आणणे किंवा अपलोड करणे अशा असमकालिक कामांशी `signal` जोडा आणि निवडलेल्या प्रतिमेचा URL `onSelect` ला द्या. हा API फाइल पाठवत नाही; प्रतिमांच्या URL साठीचे विद्यमान परवानगीचे नियम लागू राहतात.

खिडकी बंद केल्यावर किंवा टूलबार अनमाउंट केल्यावर `signal` रद्द होतो आणि साफसफाईचे फंक्शन चालते. `run()` खिडकी बंद करते आणि ती उघडताना नोंदवलेल्या निवडीवर आदेश एकदा लागू करते. खिडकी आधीच बंद झाली असेल किंवा उघडल्यानंतर दस्तऐवजाचा मजकूर बदलला असेल, तर आदेश न चालवता `false` परत करते.

## CSS शैली

`.nabi-content img` ने images style करा. साठवलेली width आणि alignment जशी आहे तशी ठेवा व borders किंवा shadows सारखे दृश्य तपशीलच बदला.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, width आणि alignment यांचे default rules ठेवा. image size document मध्ये साठवली जाते, म्हणून निश्चित CSS width सक्तीने लावल्यास लेखकाने निवडलेल्या width शी संघर्ष होऊ शकतो.
