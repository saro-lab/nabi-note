---
title: موازنہ
description: دو دستاویزات ساتھ رکھ کر موازنہ کریں اور منتخب پرانا مواد موجودہ دستاویز میں لگائیں۔
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# موازنہ

دو محفوظ دستاویزات ساتھ رکھ کر تبدیلیاں دیکھیں۔ ایڈیٹر کے بغیر بھی منظر کھلتا ہے؛ callback جوڑ کر منتخب پرانا مواد موجودہ دستاویز میں لگائیں۔

## منتخب پرانا مواد لگانا

بائیں پرانی اور دائیں موجودہ دستاویز ہے۔ تبدیلی کے پاس **&gt;&gt;** متعلقہ پیراگراف یا سطروں کے گروہ کا پرانا مواد لگاتا ہے۔ انتخاب حرف بہ حرف نہیں ہے۔ حذف شدہ مواد واپس یا نیا شامل مواد ہٹا بھی سکتے ہیں۔

نیچے صرف ملاقات کا وقت یا لانے کی چیزیں واپس کریں۔ نتیجہ دیکھنے کے لیے **callback سے تازہ کردہ موجودہ دستاویز** کھولیں۔ **دوبارہ شروع کریں** اصل مثال لوٹاتا ہے۔

<CompareDemo />

## آزاد موازنہ منظر

`nabi-note/diff` سے درآمد کریں۔ `before` اور `after` میں محفوظ NABI TREE JSON یا HTML سٹرنگ دیں۔ جدول، فہرست، تصاویر اور باقی مواد مکمل پڑھنے اور دکھانے کے لیے اصل ایڈیٹر والے wings سے registry بنائیں۔

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ur',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

پہلے صرف تبدیلیاں اور آس پاس کا سیاق دکھتا ہے۔ سمیٹنے کا بٹن پوری دستاویز کھولتا ہے؛ پچھلا/اگلا تبدیلیوں میں جاتے ہیں۔ تبدیلی نہ ہو تو پوری دستاویز دکھتی ہے۔ `onMerge` چھوڑیں تو صرف پڑھنے کا منظر ہے۔

## callback سے کلک مرج جوڑنا

کلک مجوزہ نتیجہ `onMerge` کو دیتا ہے۔ صرف callback جوڑنے سے خودکار محفوظ نہیں ہوتا۔ سروس تجویز قبول کرکے `update()` بلائے تب موازنہ بدلتا ہے۔

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ur',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` صرف منتخب تبدیلی والا NABI TREE JSON ہے۔ `before` اور `after` کلک کے وقت کی دستاویزات ہیں؛ `changeId` تبدیلی اور `revision` موازنے کی حالت بتاتا ہے۔ یہ `revision`، `update()` کے تیسرے آرگومنٹ میں دیں: موازنہ بدل چکا ہو تو `false` لوٹتا ہے اور تجویز نہیں لگتی۔

غیر ہم وقت callback کے انتظار میں بار بار کلک بند ہے۔ دوسری دستاویزات سے تازہ کرنے یا منظر ہٹانے سے `signal` منسوخ ہوتا ہے۔ سرور پر محفوظ کرتے وقت سگنل اور سرور دستاویز کا ورژن دیکھیں تاکہ پرانا نتیجہ نئی دستاویز پر نہ لکھے۔

## ایڈیٹر سے موازنہ کھولنا

ٹول بار سے کھولنے کے لیے `diff` wing اور `mountDiffWing()` جوڑیں۔ بنیاد آخری لوڈ کردہ دستاویز ہے۔ عام تدوین اور واپس کرنا بنیاد نہیں بدلتے۔

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ur',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge: true` سے منتخب پرانا مواد ایڈیٹر میں لگتا ہے۔ اسے واپس کر سکتے ہیں، بنیاد برقرار رہتی ہے۔ کھلے منظر میں اصل ایڈیٹر بدلے تو موازنہ پھر حساب ہوتا ہے۔ `merge` چھوڑنے سے صرف پڑھنے کا منظر رہتا ہے۔

منظر ہٹاتے وقت `toolbar.unmount()` اور `comparison.unmount()` بلائیں۔ تدوین شروع ہونے کا ورژن بھی لے کر دونوں طرف خودکار ملانے کے لیے [مرج](./merge) استعمال کریں۔
