---
title: تہہ بلاک
---

# تہہ بلاک

## تفصیل

`detailsWing` (نام `details`، شارٹ کٹ `D`) تہہ بلاک کے ڈبے (`<details>` +
`<summary>`) کی مالک ہے۔ خلاصہ سطر `parts` سے ساتھ لائی جاتی ہے، اس لیے الگ سے
رجسٹر نہیں ہوتی — یہ صف نہیں بلکہ record ہے۔

```ts
parts: { summary: { holds: 'inline' } }
```

بٹن دبانے سے کیریٹ کے آنے والے بلاکس نئے تہہ بلاک کے ڈبے میں لپیٹ دیے جاتے ہیں،
اور خالی خلاصہ سطر شروع میں کھڑی ہوتی ہے۔ خلاصہ سطر میں Enter دبائیں تو مواد
کی طرف نیچے چلا جاتا ہے (خلاصہ سطر خود نہیں ٹوٹتی)۔

**ایڈیٹر ڈبے کو اسی حالت میں کھینچتا ہے جس میں وہ محفوظ ہوگا۔** بند حالت میں
محفوظ ڈبہ ایڈیٹر میں بھی بند نظر آتا ہے، اور مثلث دبانے سے وہیں کھلتا بند ہوتا
ہے — وہی دبانا محفوظ قدر (`o`) بدلتا ہے۔ بند کرتے وقت کیریٹ اندر ہو تو کیریٹ
ڈبے سے باہر آ جاتا ہے۔

::: tip یہاں سیاق سطر نہیں ہے
پہلے **کھلا محفوظ کریں** اور **بند محفوظ کریں** دو بٹن تھے۔ جب سکرین ہمیشہ
کھلا کھینچتی تھی، اس دور میں یہی بتانے کا واحد راستہ تھا کہ کس حالت میں محفوظ
ہوگا۔ اب سکرین محفوظ قدر کو ویسا ہی کھینچتی ہے اور مثلث اسے بدلتا ہے، اس لیے
دونوں بٹن ایک ہی بات دہرانے لگے اور ہٹا دیے گئے۔
:::

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
