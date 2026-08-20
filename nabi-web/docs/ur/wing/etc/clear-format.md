---
title: فارمیٹنگ صاف کرنا
---

# فارمیٹنگ صاف کرنا

## تفصیل

`clearFormatWing` ایک **مکمل بنا ہوا کانسٹنٹ** ہے۔ صف میں رکھ دینا کافی ہے — کوئی
آپشن نہیں دیا جاتا۔

`place: 'tool'` ہے، اس لیے یہ دستاویز میں اپنا node کھڑا نہیں کرتی۔ صرف ایک
command (`clearFormat`) اور ایک ٹول بار بٹن ہی سب کچھ ہے۔

- **مٹانے کی فہرست کور میں طے شدہ ہے۔** گیارہ inline mark (`b`·`i`·`u`·`s`·
  `sub`·`sup`·`hl`·`tc`·`fs`·`tf`·`a`) اور تین پیراگراف کی خاصیات (`h` سرخی ·
  `a` سیدھ · `dc` ڈراپ کیپ)۔ میزبان کو یہ فہرست سنبھالنے کی ضرورت نہیں، اور
  خود بنائی wing کے mark **یہاں سے نہیں مٹتے۔**
- **حد منتخب کر کے دبائیں تو** اس حصے کے mark اور اس میں آنے والے پیراگراف کی
  خاصیات ایک ساتھ اتر جاتی ہیں۔
- **صرف کیریٹ ہو تو ایک ایک تہہ اتارتی ہے** — کیریٹ کی جگہ سے **سب سے اندر کے
  mark** سے شروع، اسی مقدار میں جتنا وہ mark آگے چلتا ہے۔ اترنے کو کوئی mark نہ
  ہو تو تب پیراگراف کی خاصیت اتارتی ہے۔
- **attachment لنک نہیں اترتا** — `file` خاصیت رکھنے والا لنک (`a`) ہر جگہ
  محفوظ ہے۔ اس کا خول اتاریں تو attachment مرا ہوا سادہ متن بن جاتا ہے۔
- **جسم رکھنے والے پیراگراف کی سیدھ رہتی ہے۔** تصویر یا جدول تھامنے والے
  wrapper پیراگراف پر صرف سیدھ (`a`) نہیں اترتی — اس سے فارمیٹ مٹاتے ہوئے
  تصویر بائیں طرف چھلانگ لگانے سے بچ جاتی ہے۔
- اترنے کو کچھ نہ ہو تو command `null` جواب دیتا ہے۔ undo کا نکتہ نہیں جمتا۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
