---
title: فائل اپ لوڈ
---

# فائل اپ لوڈ

## تفصیل

اپ لوڈ تین ٹکڑوں میں بٹا ہے — صرف wing رجسٹر کرنے سے کچھ نہیں ہوتا۔

1. **`uploadWing`** — ٹول بار میں فائل چننے کا بٹن لگاتی ہے۔ یہ wing خود نہ
   `img` بناتی ہے نہ `a` — چڑھایا گیا مواد تصویر یا لنک wing کے کھینچے ہوئے
   کے طور پر جمع ہوتا ہے، اس لیے **`imageWing` یا `linkWing` بھی ساتھ رجسٹر
   کرنا** لازم ہے تاکہ نتیجہ دستاویز میں رہے۔ دونوں میں سے کوئی نہ ہو تو
   **رجسٹر کرتے ہی exception آتی ہے** (دیر سے نہیں پھٹتی)۔
2. **`mountUpload({ … })`** — وہ حصہ جو حقیقت میں فائل وصول کر کے `uploader`
   چلاتا ہے۔ ڈراپ، پیسٹ، فائل چننا — سب یہیں آتا ہے۔ **یہ mount نہ ہو تو بٹن
   موجود رہتا ہے مگر کچھ نہیں ہوتا۔**
3. **`mountUploadView({ … })`** — پیش رفت کی جگہ رکھنے والا سکرین پر کھڑا کرتی
   ہے۔ اس کے بغیر بھی اپ لوڈ ہوتا ہے، مگر چڑھتے وقت سکرین کچھ نہیں بتاتی۔

`uploader` کی شکل `(task) => Promise<{ uri } | null>` ہے — **پتہ جواب دیں تو
کامیابی، `null` ہو تو ناکامی**، تب جگہ رکھنے والا ہٹ جاتا ہے۔ `task.onProgress(0~100)`
سے پیش رفت بتائی جاتی ہے، اور `task.signal` منسوخ ہو تو رک جاتا ہے۔

حد تین ہیں — `extensions`·`maxFileSize`·`maxTotalSize`، سب اختیاری ہیں (0 یا
چھوڑ دیں تو کوئی حد نہیں)۔ چھانی گئی فائل `onReject` سے آتی ہے۔

## چڑھنے کے بعد کیا رہتا ہے

تصویر `imageWing` کے بلاک کے طور پر، اور باقی فائلیں `linkWing` کے attachment
لنک کے طور پر جمع ہوتی ہیں۔

- **attachment کا نام فائل کا نام نہیں بلکہ i18n لیبل ہے** — اردو میں مثلاً
  "منسلکہ"۔ فائل کا نام اکثر دستاویز میں رہنے کے لیے لمبا ہوتا ہے، اور سب سے
  بڑھ کر اسے بدلا جا سکنا چاہیے۔ نام بدلنے کے لیے کیریٹ اس لنک پر رکھ کر
  [سیاق سطر کے نام کے خانے](../inline/link) سے بدلیں۔
- **extension نشان کے طور پر رہتا ہے** — `data-nabi-file="pdf"`۔ یہ قدر اصلی
  فائل کے نام سے نکالی جاتی ہے، اور سٹائل شیٹ اسے بیج کے طور پر کھینچتی ہے۔ نام
  بدلنے سے یہ نشان نہیں بدلتا۔
- جو پتہ لنک قبول نہیں کرتا (جیسے `allowLocalUrls` آن نہ ہونے پر آیا `blob:`)
  وہ سادہ متن والے فائل کے نام تک محدود ہو جاتا ہے — whitelist کو نظرانداز نہیں
  کیا جاتا۔

## چڑھتے وقت جو نظر آتا ہے

چڑھتے وقت اس جگہ ایک عارضی ڈبہ کھڑا ہوتا ہے — یہ صرف ایڈیٹر کے DOM میں ہے،
nabi-tree میں نہیں، اس لیے محفوظ قدر میں اس کا ایک حرف بھی نہیں رہتا۔

- **تصویر** کا چنی گئی فائل سے بنا پیش نظارہ فوراً نظر آتا ہے، اور اس کے اوپر
  ایک grid چڑھی ہوتی ہے۔ پیش رفت کے مطابق ایک ایک خانہ ہٹتا جاتا ہے اور تصویر
  واضح ہوتی جاتی ہے۔ خانے ہٹنے کی ترتیب ہر فائل کے لیے الگ ملائی جاتی ہے، اس
  لیے کئی تصویریں ایک ساتھ چڑھائیں تو ایک جیسا نمونہ نہیں دہرایا جاتا۔
- **تصویر نہ ہونے والی فائل** کو بغیر grid کے 📎 اور "منسلکہ" لیبل والا ڈبہ ملتا
  ہے، اور extension بڑے حروف کے بیج (`PDF` وغیرہ) کے طور پر ساتھ نظر آتا ہے۔ جس
  تصویر کا پیش نظارہ نہ بن سکے وہ بھی یہاں گرتی ہے۔
- پیش رفت ڈبے پر `data-nabi-per` سے لگتی ہے اور سٹائل شیٹ اسے کھینچتی ہے۔
  چڑھنے کے دوران ہر ڈبے پر منسوخی (×) کا بٹن کھڑا ہوتا ہے، اور بیچ چلنے کے دوران
  ترمیم لاک رہتی ہے۔

## استعمال کی مثال

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// اپ لوڈ کا نتیجہ رہنے کے لیے تصویر اور لنک wing دونوں چاہیے — نہ ہوں تو یہیں exception
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// پیش رفت کی جگہ کھڑا کرنے والا حصہ — پہلے بنا کر نیچے سے جوڑا جاتا ہے
const view = mountUploadView({ nabi, surface, locale: 'ur' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ur',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // یہاں سرور پر حقیقتاً چڑھانے والا کوڈ لکھیں۔ پتہ جواب دیں تو کامیابی، null ہو تو ناکامی
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // ٹول بار کے فائل چننے کے بٹن سے چنی گئی فائل یہاں جاتی ہے
  onFiles: (files) => upload.take(files),
})
```

## ڈیمو

اس سائٹ کے پاس چڑھانے کے لیے حقیقی سرور نہیں، اس لیے `URL.createObjectURL()`
سے بنایا گیا `blob:` پتہ ہی واپس دے کر صرف دکھاوا کرتی ہے۔ نتیجہ صرف اس صفحے
کے اندر رہتا ہے۔

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
