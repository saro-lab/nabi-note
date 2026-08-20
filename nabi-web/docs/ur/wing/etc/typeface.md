---
title: Typeface
---

# Typeface

## تفصیل

`typefaceWing` (نام `tf`) **inline قدر رکھنے والا mark ہے۔** مکمل بنا ہوا
کانسٹنٹ ہے، صف میں رکھنا کافی ہے، کوئی آپشن نہیں دیا جاتا۔ باہر جاتے وقت
`<span data-nabi-typeface="serif">` کے طور پر کھینچا جاتا ہے۔

قدر چار ہیں (`TYPEFACES`): `sans`·`serif`·`mono`·`cursive`۔

- **کوئی فونٹ کا نام خود نہیں تھامتی۔** چنا جانے والا **صنف** ہے، اصل میں کون
  سا فونٹ نظر آئے گا یہ میزبان کے چار ٹوکن — `--nabi-font`·`--nabi-font-serif`·
  `--nabi-font-mono`·`--nabi-font-cursive` — پر رکھی گئی قدر طے کرتی ہے۔
- چاروں صنف **ایک ہی wing** تھامتی ہے۔ چننے کی جگہ سیاق سطر کے چار خانے
  (`select`) ہیں، اور اندر آنے کا ایک دروازہ ٹول بار کا بٹن ہے۔ بٹن دبانے سے
  `serif` لگتا ہے۔
- **جس متن پر کچھ نہ لگا ہو وہ `--nabi-typeface-base` پہنتا ہے۔** یہ ٹوکن پورے
  ایڈیٹر کا بنیادی فونٹ ہے، اور نہ بدلیں تو `--nabi-font` کی پیروی کرتا ہے۔
  "default" چننے کا الگ خانہ نہیں ہے — ابھی لگی ہوئی صنف کو **دوبارہ چننے سے**
  وہ **اتر جاتی ہے** اور اسی جگہ واپس آ جاتی ہے۔
- چننے کے خانے **اپنی اشارہ کردہ طرز میں** کھینچے جاتے ہیں — serif کا خانہ
  serif میں لکھا ہے، mono کا خانہ یکساں چوڑائی میں، اس لیے نام معلوم ہونے کی
  ضرورت نہیں، نظر آ جاتا ہے کہ کیا چنا جا رہا ہے۔
- **صرف کیریٹ ہو تو پورے پیراگراف پر** لگتا ہے۔ جس پیراگراف میں ایک بھی حرف نہ
  ہو وہاں یہ reservation کے طور پر رہ جاتا ہے؛ اگلا لکھا جانے والا حرف اسی
  فونٹ کے ساتھ نکلتا ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

میزبان جو فونٹ رکھتا ہے وہ CSS کی ایک جگہ ہے۔ ایک صنف پر کئی فونٹ اوپر تلے
رکھیں تو براؤزر ہر حرف کے لیے شروع سے فہرست چھانتا ہے اور اسی حرف کو رکھنے
والے پہلے فونٹ سے کھینچتا ہے، اس لیے جو بھی زبان لکھی جائے اس صنف کی شکل قائم
رہتی ہے۔

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Nastaliq Urdu', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Nastaliq Urdu', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', cursive;
}
```

## ڈیمو

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
