---
title: Quote
---

# Quote

## تفصیل

`quoteWing` (نام `quote`) quote کے ڈبے (`<blockquote>`) کی مالک ہے۔ یہ
`place: 'container'` اور `holds: 'blocks'` ہے — اندر بلاک رہتے ہیں۔ دوسرے
جسم کی طرح quote خود بھی ایک wrapper پیراگراف پہن کر سب سے اوپر کھڑی ہوتی ہے۔

**`allows` نہیں لگایا گیا۔** quote کے اندر سب سے اوپر جیسا ہی قاعدہ چلتا ہے،
اس لیے جدول یا تصویر بھی اپنا wrapper پیراگراف پہن کر اس کے اندر کھڑی ہو سکتی
ہے — ایسا HTML پیسٹ کریں یا import کریں تو ویسا ہی رہتا ہے۔

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["متن"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

مگر **ڈالنے والے بٹن quote کے اندر نہیں جاتے۔** تصویر، جدول، divider جیسی چیز
جو `insertLump` سے کھڑی ہوتی ہے وہ ہمیشہ **سب سے اوپر** کھڑی ہوتی ہے، اس لیے
کیریٹ quote کے اندر ہو تب بھی نیا جسم quote کے **بعد** کھڑا ہوتا ہے۔ quote کے
اندر ڈالنا ہو تو پیسٹ کا راستہ استعمال کریں۔

بٹن دبانے سے انتخاب میں آنے والے سب سے اوپر کے بلاکس quote میں لپیٹ دیے جاتے
ہیں۔ کھلتی تب ہے جب سب **پہلے سے quote ہوں** — ملے جلے ہوں تو ایک بار مزید
پوری طرح لپیٹ دی جاتی ہے۔

سطر کے شروع میں صرف `>` لکھ کر space دبائیں تو بھی وہ سطر quote بن جاتی ہے —
اس خودکار تبدیلی کا **trigger space ہے** (Enter نہیں)، کیونکہ یہ اسی سطر میں
جاری لکھنا ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
