---
title: سیدھ
---

# سیدھ

## تفصیل

`alignWing` (id `align`) **ایک ہی** بائیں، درمیان، دائیں تینوں تھامتی ہے۔ ٹول
بار میں **کانسٹنٹ** ہے — انہیں جوڑنے والی کوئی `align()` فیکٹری نہیں بلکہ ہر
قدر کا اپنا بٹن ہے۔ بلاک پر `data-nabi-align` خاصیت لگاتی ہے۔

- ٹیگ ویسا ہی رہے، صرف خاصیت لگے، یہ **بلاک کی خاصیت** ہے۔
  `<p data-nabi-align="center">` جیسے، پیراگراف خود نہیں بدلتا۔
- **پیراگراف اور سرخی دونوں پر لگتی ہے۔** `<h2 data-nabi-align="c">` بھی درست
  ہے — کیونکہ سرخی بھی عام متن کی سطر ہی ہے۔ پیراگراف کی چار خاصیات میں صرف
  سیدھ ایسی ہے، متن کا سائز، typeface اور ڈراپ کیپ پھر بھی صرف پیراگراف تک
  محدود ہیں۔
- ایک وقت میں صرف ایک قدر ہوتی ہے — بائیں سیدھ لگی ہو اور درمیان دبائیں تو
  بائیں اتر جاتی ہے اور درمیان لگ جاتی ہے۔ لگی قدر دوبارہ دبائیں تو خاصیت
  مکمل اتر جاتی ہے (default سیدھ پر واپس)۔
- **Enter سیدھ کو دونوں طرف ویسی ہی منتقل کر دیتا ہے۔** پیراگراف توڑنے سے دونوں
  پیراگراف ایک ہی سیدھ کے ساتھ نکلتے ہیں — سرخی (`h`) کے خالی طرف سے اترنے اور
  ڈراپ کیپ (`dc`) کے صرف ایک طرف چلنے کے برعکس، سیدھ میں ایسا کوئی استثنا نہیں۔
- تینوں ایک ہی wing کے **تین بٹن** ہیں (`buttons`) — الگ سے آن آف نہیں ہو سکتے،
  صرف `alignWing` ایک ہی wings کی صف میں رکھی جاتی ہے۔
- **جدول، تصویر، یوٹیوب کی جگہ بھی یہی wing لگاتی ہے۔** جسم اپنے wrapper
  پیراگراف کے اندر رہتا ہے، اور وہی پیراگراف سیدھ اٹھاتا ہے، اس لیے "درمیان میں
  سیدھی تصویر" دراصل "درمیان میں سیدھے پیراگراف کے اندر تصویر" ہی ہے۔ اسی لیے
  تصویر یا جدول کی سیاق سطر میں سیدھ کا خانہ سرے سے نہیں ہوتا، اور صرف سیدھ
  ٹول بار میں نہیں چھپتی چاہے کیریٹ جسم کے اوپر ہی ہو۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
