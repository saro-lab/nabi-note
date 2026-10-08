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

`mode: 'modal'` संपूर्ण पान झाकणाऱ्या अर्धपारदर्शक पार्श्वभूमीवर विंडो उघडतो. `mode: 'inline'` संगणकावर साधनाच्या बटणाजवळ आणि मोबाइलवर पूर्ण स्क्रीनमध्ये उघडतो. व्ह्यूपोर्टची रुंदी आणि `--nabi-mobile-breakpoint` यांवर मोबाइल दृश्य ठरते; `inline` पॅनेल उघडे असताना ही मर्यादा ओलांडल्यास पॅनेल बंद होते.

दोन्ही मोड फक्त रिकामा `root` देतात; शीर्षक, इनपुट फील्ड किंवा बटणे तयार करत नाहीत. `render` मध्ये तुमचे HTML किंवा UI जोडा, बंद करण्याचे बटण `close()` शी आणि प्रतिमा निवड `insertImage(url, 'pointer')` शी जोडा. विद्यमान फंक्शन स्वरूपातील सेटिंग (`img: renderer`) आधीची प्रदर्शन पद्धत कायम ठेवते.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` हे तुमच्या सेवेत तयार करायचे फंक्शन आहे. ते मिळालेल्या `root` मध्ये तुमचा UI समकालिकपणे तयार करते आणि साफसफाईचे फंक्शन परत करते. प्रतिमांची यादी आणणे किंवा अपलोड करणे अशा असमकालिक कामांशी `signal` जोडा आणि निवडलेल्या प्रतिमेचा URL `onSelect` ला द्या. हा API फाइल पाठवत नाही; प्रतिमांच्या URL साठीचे विद्यमान परवानगीचे नियम लागू राहतात.

`insertImage(src, by?)` हे `run('insertImage', { src }, by)` सारखेच आहे; परत मिळणारे मूल्य आणि निवड पुनर्स्थापित करण्याचे नियमही तेच आहेत. `by` वगळल्यास `'keyboard'` वापरले जाते. `render` ला `async` फंक्शन बनवू नका.

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
