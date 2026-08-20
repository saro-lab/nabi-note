---
title: متن کا سائز
---

# متن کا سائز

## تفصیل

`fontSizeWing` (نام `fs`) **inline قدر رکھنے والا mark ہے۔** یہ حروف کے اوپر
چڑھایا جانے والا فارمیٹ ہے، پیراگراف کی خاصیت نہیں۔ باہر جاتے وقت
`<span data-nabi-size="lg">` کے طور پر کھینچا جاتا ہے۔

قدر چار ہیں — `xs`·`sm`·`lg`·`xl`، اور default سائز پانچویں قدر نہیں بلکہ **خاصیت
کا سرے سے نہ ہونا** ہے۔

- یہ typeface (`tf`) کی جوڑی ہے — ایک wing سب قدروں کو تھامتی ہے، اور چننے کی
  جگہ سیاق سطر ہے۔ فرق یہ ہے کہ typeface چار خانے قطار میں دکھاتی ہے، جبکہ سائز
  ایک ہی نشان استعمال کرتا ہے۔
- **سیاق سطر ایک نشان (`range`) ہے۔** سائز ترتیب والی قدر ہے (چھوٹا ← بڑا)، اس
  لیے خانے قطار میں لگانے کے بجائے ایک ہینڈل سے سرکایا جاتا ہے۔ ابھی کی قدر
  ہینڈل کی جگہ سے نظر آتی ہے، اور ٹول ٹپ میں اس قدر کا نام بھی ساتھ نکلتا ہے۔
- **نشان کا سب سے پہلا خانہ "default" ہے۔** درمیان کے بجائے شروع میں ہونے کی
  وجہ یہ ہے کہ فہرست چھوٹے سے بڑے کی ترتیب میں ہے، اس لیے اس سے پہلے کی جگہ
  "کچھ نہیں لگا" کی جگہ ہے۔ اس خانے پر جانے سے `base` جیسی کوئی قدر نہیں لکھی
  جاتی بلکہ **mark ہی اتر جاتا ہے۔**
- **خانوں کے نام زبان کے ساتھ بدلتے ہیں** — اردو میں مثلاً: default · بہت
  چھوٹا · چھوٹا · بڑا · بہت بڑا۔
- ٹول بار کا بٹن دبانے سے **`lg` (بڑا)** لگتا ہے۔ نشان چھوٹے سے شروع ہوتا ہے،
  اس لیے ایسے ہی چھوڑ دیں تو پہلا خانہ `xs` لگ جائے گا، اور سائز کا بٹن دبا کر
  کوئی نہیں چاہتا کہ حروف چھوٹے ہو جائیں۔
- **صرف کیریٹ ہو تو پورے پیراگراف پر** لگتا ہے۔ صرف ایک لفظ بڑا کرنا کم ہوتا
  ہے، اس لیے حد منتخب نہ کریں تو پیراگراف نشانہ بنتا ہے (ہائی لائٹ اور متن کا
  رنگ اس سے مختلف ہیں، وہ ابھی کے mark حصے تک ہی محدود رہتے ہیں)۔
- جس پیراگراف میں ایک بھی حرف نہ ہو وہاں دبائیں تو **reservation** کے طور پر
  رہ جاتا ہے — اگلا لکھا جانے والا حرف اسی سائز کے ساتھ نکلتا ہے۔
- وہی قدر دوبارہ لگائیں تو اتر جاتی ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
