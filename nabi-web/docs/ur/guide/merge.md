---
title: مرج
description: تدوین کی ابتدائی، اپنی اور اس دوران محفوظ ہوئی شکل ملائیں اور باقی تصادم تدوین کرکے حل کریں۔
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# مرج

آپ کی تدوین کے دوران دوسری تبدیلیاں محفوظ ہوں تو ابتدائی ورژن کی بنیاد پر دونوں طرف ملائیں۔ خودکار مل سکنے والی سب تبدیلیاں پہلے ہی لگتی ہیں؛ صرف ایک دوسرے پر آنے والی تبدیلیاں تصادم رہتی ہیں۔ یہ `nabi-note/merge` کا آزاد منظر ہے، wing نہیں۔

| بائیں | درمیان | دائیں |
| --- | --- | --- |
| تدوین کے آغاز کا ورژن | خودکار مرج کے بعد آپ کی موجودہ دستاویز | آپ کی تدوین کے دوران محفوظ ورژن |
| صرف پڑھنے کے لیے | براہ راست قابل تدوین | صرف پڑھنے کے لیے |

درمیان میں عام ایڈیٹر کی طرح متن، وضع، جدول، فہرست اور تصویر بدلیں۔ دیے wings سہولتیں طے کرتے ہیں۔ تصادم کے نشان اور حل کی حالت محفوظ مواد میں نہیں ملتے۔

## مکمل خودکار مرج کی مثال

آپ نے وقت **صبح 11 بجے** اور دوسرے نے جگہ **تیسری منزل کا اجلاس کمرہ** کی۔ مختلف پیراگراف ہونے سے درمیانی نتیجے میں دونوں تبدیلیاں آتی ہیں۔

کوئی تصادم باقی نہیں، فوراً **تصدیق کریں** دبائیں یا پہلے درمیان کا متن نکھاریں۔ نیچے حتمی دستاویز تصدیق callback کو ملا اصل نتیجہ ہے۔

<MergeDemo />

## جزوی خودکار مرج کی مثال

اس بار آپ نے وقت **صبح 11 بجے**، دوسرے نے **دوپہر 2 بجے** کیا۔ ایک پیراگراف کی مختلف تبدیلی سے وقت تصادم رہتا ہے۔ منتظمین **جمن اور سویون** اور جگہ **تیسری منزل کا اجلاس کمرہ** کرنے کی تبدیلیاں خودکار لگتی ہیں۔

تصادم ان طریقوں سے حل کریں:

- بائیں **&gt;&gt;**: ابتدائی ورژن کا متعلقہ مواد لیں۔
- دائیں **&lt;&lt;**: نئے محفوظ ورژن کا متعلقہ مواد لیں۔
- **موجودہ مواد سے حل کریں**: درمیان رکھیں یا بدلیں، پھر حل شدہ نشان لگائیں۔

درمیان کا وقت والا جملہ بدلیں اور **موجودہ مواد سے حل کریں** دبائیں۔ سب تصادم حل ہونے پر ہی تصدیق ہو سکتی ہے۔

<MergeDemo partial />

حل شدہ حصے کی دوبارہ تدوین حالت برقرار رکھتی ہے۔ حل واپس کرنے سے حالت بھی پلٹتی ہے؛ دوبارہ کرنے سے بحال ہوتی ہے۔ صرف متن مٹانا یا بدلنا کھلا تصادم خودکار حل نہیں کرتا۔

## خودکار مرج اور تصادم کے اصول

ابتدائی دستاویز سے اپنی اور اسی ابتدا سے نئے ورژن کی تبدیلیاں موازنہ ہوتی ہیں۔ یک طرفہ اور دونوں طرف یکساں تبدیلیاں خودکار لگتی ہیں۔ مختلف پیراگراف یا سطروں کی تبدیلیاں بھی ملتی ہیں۔

Git متن مرج کی طرح پیراگراف اور سطر سے اوورلیپ طے ہوتا ہے۔ ایک سطر کے مختلف الفاظ بدلنے پر بھی تصادم رہتا ہے۔ ایک جگہ مختلف اضافہ یا دوسرے طرف کے حذف کردہ مواد کی تدوین بھی فیصلہ چاہتی ہے۔

جدول، فہرست یا float جیسے ساختی بلاک دونوں طرف مختلف بدلیں تو پوری ساخت تصادم ہے۔ سیل اور فہرست کے عناصر من مانے نہیں ملتے؛ مواد چنیں یا درمیان بدلیں۔ منتقل کرنے اور تدوین کے اوورلیپ میں مقام غیر یقینی ہو تو وہ بھی خودکار نہیں لگتا۔

## آزاد مرج منظر جوڑنا

`base`، `local`، `incoming` میں محفوظ NABI TREE JSON یا HTML سٹرنگ دیں۔ اصل ایڈیٹر کے wings اور اختیار استعمال کریں۔ `mountMerge()` درمیانی ایڈیٹر، ٹول بار، دونوں ماخذ، تصادم انتخاب اور تصدیق بٹن بناتا ہے۔

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'ur',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` مکمل حل شدہ موجودہ نتیجے کا JSON، اشاعتی HTML، تدوینی revision اور `incomingVersion` لیتا ہے۔ `false` لوٹانا تصدیق مکمل نہیں کرتا۔ Promise کے انتظار میں تدوین، تصادم انتخاب اور دہرائی تصدیق بند ہیں۔ منظر ہٹانا نتیجے کا `signal` منسوخ کرتا ہے۔ کوریائی IME ترکیب ختم ہونے کے بعد ہی تصدیق کریں۔

تصویر چننا یا اپ لوڈ جیسے سروس کام عام ایڈیٹر کی طرح جوڑیں۔ `toolbarOptions` میں پینل اور ہوسٹ عمل، `surfaceOptions` میں تدوینی سطح کے اختیار دیں۔

`incomingVersion` سروس کی قدر جوں کی توں لوٹاتا ہے۔ محفوظ کرتے وقت سروس اسے سرور کے تازہ ورژن سے ملائے۔ مرج کے دوران نیا ورژن محفوظ ہو تو پرانا نتیجہ اس پر نہ لکھیں؛ تازہ دستاویز لے کر نیا مرج شروع کریں۔

منظر کے باہر بھی حالت پڑھ یا تصدیق بلا سکتے ہیں۔

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

نتیجہ `merge.nabi.getJson()` اور `merge.nabi.getHtml()` سے پڑھیں۔ تدوینی DOM یا `getEditorHtml()` محفوظ نہ کریں۔ دو ورژنوں میں صرف منتخب پرانا مواد لگانے کے لیے [موازنہ](./compare) کا کلک مرج لیں۔

## اپ لوڈ مکمل ہونے پر تصدیق

فائل بٹن، پیسٹ اور ڈریگ ڈراپ کے لیے `upload` wing اور `mountUpload()` جوڑیں۔ `sendUpload` فائل سرور بھیج کر `{ uri }` لوٹاتا ہے۔ مکمل اتصال اور پیش رفت مثال [فائل اپ لوڈ](../wing/etc/upload) میں دیکھیں۔

دستاویز میں ابھی نہ آئے اپ لوڈ جیسے غیر ہم وقت کام میں `merge.session.hold()` سے تصدیق اور تصادم انتخاب روکیں۔ مکمل، منسوخ یا منظر ہٹاتے وقت لوٹایا فنکشن بلائیں۔ روک **دستاویز میں شامل ہونے کے بعد** ہٹائیں، سرور اپ لوڈ ہوتے ہی نہیں، تاکہ فائل حتمی نتیجے میں رہے۔

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'ur',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'ur',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` درمیانی تدوینی DOM ہے؛ `merge.surface` اور `merge.toolbar` پہلے جڑے ہیں۔ اسی جگہ دوسری سطح یا ٹول بار نہ بنائیں۔ پہلے اضافی اپ لوڈ اور پیش رفت mount ہٹائیں، آخر میں `merge.unmount()` بلائیں۔
