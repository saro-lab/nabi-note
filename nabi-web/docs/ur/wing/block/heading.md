---
title: سرخی
---

# سرخی

## تفصیل

`headingWing` (id `h`) **ایک ہی** چھ درجے تھامتی ہے۔ سرخی الگ node نہیں بلکہ
**پیراگراف کی خاصیت** ہے — محفوظ قدر `{"w":"p","a":{"h":2}}` ہے، اور باہر جاتے
وقت `<h2>` بنتی ہے۔

پیراگراف خود سرخی بنتا ہے، اس لیے سیدھ اور ڈراپ کیپ جیسی دوسری پیراگراف کی
خاصیات بھی ساتھ لگتی ہیں (`<h2 data-nabi-align="c">`)۔

## ٹول بار ایک، درجہ سیاق سطر سے

**ٹول بار میں صرف ایک بٹن `H` ہے۔** پیراگراف پر دبائیں تو سرخی 1 بن جاتی ہے،
اور کیریٹ سرخی کے اندر ہو تو سیاق سطر پر `سرخی`·`H1` سے `H6` تک خانے نکلتے ہیں —
ابھی کا درجہ دبے ہوئے خانے کے طور پر نظر آتا ہے، دوسرا خانہ دبانے سے وہی درجہ
لگ جاتا ہے۔ `سرخی` خانہ دبانے سے پیراگراف پر واپس آ جاتی ہے۔

خالی سطر پر `#` کو درجے کی تعداد کے برابر (درجہ 2 ہو تو `##`) لکھ کر space دبائیں
تو خودکار طور پر اسی درجے کی سرخی بن جاتی ہے — لکھے گئے `#` اور space خود مٹ
جاتے ہیں۔

## استعمال کی مثال

درجہ چننے والا سیاق سطر `mountContextToolbar` بناتی ہے۔

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

command سے بھی سیدھا لگایا جا سکتا ہے۔

```ts
nabi.applyCommand('setHeading', { value: 2 })  // درجہ 2 کی سرخی
nabi.applyCommand('setHeading', { value: 2 })  // وہی درجہ دوبارہ — پیراگراف پر واپس
```

کئی پیراگراف منتخب کر کے لگائیں تو **منتخب سب پیراگراف** پر لگتی ہے۔ جدول،
فہرست جیسی پیراگراف کی جگہ لینے والی چیزیں چھوڑ دی جاتی ہیں — کیونکہ سرخی عام
متن والے پیراگراف کی خاصیت ہے۔

## ڈیمو

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
