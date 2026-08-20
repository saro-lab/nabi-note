---
title: تصویر
---

# تصویر

## تفصیل

`imageWing` (نام `img`) تصویر (`<img>`) کی مالک ہے۔ `hr`·`youtube` جیسا
**بغیر اندرونی مواد کا جسم** ہے۔ بٹن دبانے سے پتہ درج کرنے کا panel کھلتا ہے۔

**پتہ کو extension کے بجائے scheme سے پرکھا جاتا ہے۔** صرف `http:`·`https:` اور
relative path گزرتے ہیں، اور `//example.com/a.png` جیسا protocol-relative پتہ
مسترد ہو جاتا ہے۔ `.png` پر ختم ہوتا ہے یا نہیں یہ **کوئی نہیں دیکھتا** — کیونکہ
تصویر دینے والے بہت سے پتے extension کے بغیر آتے ہیں۔

کیریٹ تصویر کے اندر نہیں جا سکتا، اس لیے تصویر پر کلک کرنے سے وہ پوری منتخب ہو
جاتی ہے اور سیاق سطر نکل آتی ہے۔

| قسم | خانے |
|---|---|
| چوڑائی | `30` سے `100` تک دس دس کے فرق سے آٹھ خانے (default `60`) — یہ ایک نشان ہے، ابھی کی قدر ساتھ نظر آتی ہے |
| نظارہ | صرف ایک تصویر بڑی — دستاویز نہیں بدلتی |

**سیاق سطر میں صرف یہی دو ہیں۔** بائیں، درمیان، دائیں کے خانے یہاں نہیں ہیں —
تصویر کی جگہ خود تصویر نہیں بلکہ **اسے تھامنے والا wrapper پیراگراف** رکھتا
ہے، اس لیے یہ کام ٹول بار کا سیدھ کا بٹن کرتا ہے۔

**نئی ڈالی گئی تصویر درمیان میں ہوتی ہے** — کیونکہ `insertLump` wrapper
پیراگراف کو سیدھ `c` پہنا کر کھڑا کرتا ہے۔

باہر جاتے وقت چوڑائی تصویر پر اور سیدھ اسے لپیٹنے والے پیراگراف پر لگتی ہے۔

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

سیدھ کی قدر `l`·`c`·`r` ہیں۔ inline `style` باہر نہیں جاتا — اصلی شکل
`nabi.css` سے جڑی `.nabi-content` کے اندر وہ خاصیت پڑھنے والی سٹائل شیٹ
کھینچتی ہے۔

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls` آن کریں تو `blob:`·`data:image/...` پتے بھی قبول ہوتے ہیں —
صرف سرور کے بغیر فائل دکھانے والے ڈیمو اور اپ لوڈ کے منظرناموں میں آن کریں۔
default بند ہے۔

تصویر ٹوٹی ہو (پتہ مر گیا، معیاد ختم ہو گئی، یا blob غائب ہو گیا) تو جگہ رکھنے
والا خود بخود نظر آ جاتا ہے — یہ کام wing خود `attach` سے تھامتی ہے، اور
`mountSurface` رجسٹر شدہ wing کا `attach` ساتھ لگاتا ہے۔ **الگ سے کوئی mount
نہیں چاہیے۔** یہ نشان صرف سکرین کے لیے ہے اور محفوظ قدر میں کبھی نہیں رہتا۔

`allowLocalUrls` دو جگہوں سے آن ہو سکتا ہے — پورے ایڈیٹر کے لیے
(`createNabiWith(wings, { allowLocalUrls: true })`)، یا صرف تصویر کی wing کے
لیے (`makeImageWing({ allowLocalUrls: true })`)۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

اپ لوڈ سے ملی فائل (`blob:` پتہ) کو جوں کا توں کھلا رکھنے کے لیے:

```ts
makeImageWing({ allowLocalUrls: true })
```

## ڈیمو

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
