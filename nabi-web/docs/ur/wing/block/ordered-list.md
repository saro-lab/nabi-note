---
title: نمبر والی فہرست
---

# نمبر والی فہرست

## تفصیل

`orderedListWing` (نام `ol`، شارٹ کٹ `N`) `<ol>` کی مالک ہے۔ item کو `parts`
سے ساتھ لایا جاتا ہے، اس لیے `oli` الگ سے رجسٹر نہیں ہوتی — یہ صف نہیں بلکہ
record ہے۔

```ts
parts: { oli: { holds: 'blocks' } }
```

بٹن دبانے سے کیریٹ جس بلاک میں ہے (یا انتخاب میں آنے والے بلاکس) کو نمبر والی
فہرست میں لپیٹ دیتا ہے، دوبارہ دبائیں تو کھل جاتی ہے۔ کسی اور فہرست کا بٹن
دبائیں تو وہی صنف لگ جاتا ہے۔

سطر کے شروع میں ہندسہ اور نقطہ لکھ کر space دبائیں (`1. `) تو بھی وہی نتیجہ
ملتا ہے۔ **کوئی بھی ہندسہ شروع کے طور پر قبول ہوتا ہے مگر نو ہندسوں تک ہی**
(`1234567890. ` نہیں پکڑا جاتا)، اور `1.2 ` جیسے نقطے کے بعد کچھ اور آ جائے تو
نہیں پکڑا جاتا۔ سطر کا خالی ہونا ضروری نہیں — صرف کیریٹ کے آگے کی سطر کا شروع
دیکھا جاتا ہے، اور یہ صرف پیراگراف کی پہلی سطر پر پکڑا جاتا ہے۔

- `Tab`/`Shift+Tab` سے اندر باہر کرنا، خالی item پر Enter سے فہرست ختم کرنا،
  اور item کے شروع میں Backspace سے پچھلے item میں ملنا — سب
  [بلٹ فہرست](./bullet-list) جیسا ہی ہے۔
- نمبر محفوظ قدر میں نہیں جاتا — یہ `<ol>` خود کھینچتا ہے، اس لیے item جوڑنے
  یا مٹانے پر براؤزر خود دوبارہ نمبر لگا دیتا ہے۔
- اندر دوسری فہرست ہونا بھی اصلی مارک اپ کے طور پر محفوظ قدر میں رہتا ہے۔ item
  بلاک تھامتا ہے، اس لیے متن ایک پیراگراف پہنتا ہے اور اندر کی فہرست wrapper
  پیراگراف کے اندر کھڑی ہوتی ہے۔
- `start`·`type` جیسی خاصیات نہیں بچتیں۔ اس لیے `start="5"` سے آئی فہرست بھی
  ایک سے دوبارہ شمار ہوتی ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
