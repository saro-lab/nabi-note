---
title: بنیادی استعمال
description: براؤزر پر مبنی NABI NOTE ایڈیٹر بنائیں، پھر اس کی دستاویزات محفوظ اور بحال کریں۔
---

# بنیادی استعمال

یہ گائیڈ براؤزر میں client-side rendered (CSR) ایڈیٹر کا احاطہ کرتی ہے: ونگز منتخب کریں، ایڈیٹر اور اس کا UI mount کریں، پھر NABI TREE JSON محفوظ اور بحال کریں۔

## انسٹال کریں اور بنیادی مارک اپ شامل کریں

```bash
npm install nabi-note
```

ایڈیٹر اور شائع شدہ مواد دونوں کے لیے ایک ہی اسٹائل شیٹ لوڈ کریں۔ `contenteditable` خود شامل نہ کریں؛ یہ `mountSurface()` کے اختیار میں ہے۔

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## ایڈیٹر mount کریں

`allBasic()` ان سرکاری ونگز کو منتخب کرتا ہے جو ایپلیکیشن مخصوص wiring کے بغیر کام کرتے ہیں۔ اپ لوڈ، فائل اسٹوریج، یا دستاویز diffing جیسے سروس سے منسلک ونگز کو ان کی انفرادی گائیڈز کے مطابق شامل کریں۔

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'en',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'en',
  placeholder: 'Write something.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'en',
})
```

`locale` ٹول بار اور مددگار متن کو کنٹرول کرتا ہے؛ ہر UI mount کو ایک ہی قدر دیں۔ `placeholder` صرف خالی ایڈیٹر کے لیے دکھایا جاتا ہے۔ `onError` commands اور callbacks کی الگ ناکامیاں وصول کرتا ہے۔ `undoLimit` undo اندراجات کی تعداد ہے (طے شدہ طور پر 200)۔ `typingMergeMs` وہ وقفہ ہے جو مسلسل ٹائپنگ کو ایک undo قدم میں ملاتا ہے؛ ہر شامل کرنے کو الگ رکھنے کے لیے اسے `0` مقرر کریں۔

ہر ایڈیٹر کو اپنے غیر متداخل content اور toolbar roots درکار ہیں۔ متعدد ایڈیٹر والے صفحے پر ہر ٹول بار کو `surface` کے ذریعے اپنا ایڈیٹر surface دیں تاکہ فوکس اور شارٹ کٹس ایک دوسرے میں نہ آئیں۔

## ونگز منتخب کریں

صرف مطلوبہ خصوصیات رکھنے کے لیے `use()` اور `drop()` استعمال کریں۔ ہر ونگ صفحہ اس کے قبول کردہ اختیارات دستاویز کرتا ہے۔

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

چھوٹے بنڈل کے لیے صرف مطلوبہ ونگز، جیسے `boldWing` اور `imageWing`، کو array کے طور پر دیں۔ نامعلوم نام، غلط اختیارات اور غائب انحصار ایڈیٹر بناتے وقت فوراً ناکام ہو جاتے ہیں۔

## محفوظ اور لوڈ کریں

جب دستاویز میں دوبارہ ترمیم ہونی ہو تو `getJson()` آؤٹ پٹ کو NABI TREE JSON کے طور پر محفوظ کریں۔ `getHtml()` شائع شدہ آؤٹ پٹ کے لیے ہے۔ `getEditorHtml()` کا صرف ایڈیٹر کے لیے نتیجہ کبھی محفوظ نہ کریں۔

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

بیرونی HTML امپورٹ کرنے کے لیے `setHtml()` استعمال کریں۔ براؤزر ایڈیٹر پہلے ہی اپنا HTML parser فراہم کرتا ہے، اس لیے parser کا کوئی اختیار درکار نہیں۔ `setJson()` اور `setHtml()` غلط غیر خالی ان پٹ کے لیے `false` واپس کرتے ہیں اور موجودہ دستاویز کو نہیں چھیڑتے۔

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON اور HTML، دونوں ناقابلِ اعتماد ان پٹ ہیں۔ NABI NOTE انہیں رجسٹر شدہ ونگز اور ان کے اجازت یافتہ قواعد کے ذریعے پڑھتا ہے، مگر یہ اپ لوڈ کی اجازت یا آپ کی سروس کی حفاظتی پالیسی کا متبادل نہیں ہے۔

## عام APIs

| کام | API |
| --- | --- |
| ایڈیٹر بنائیں | `createNabiWith`, `wings` |
| surface اور toolbar mount کریں | `mountSurface`, `mountToolbar` |
| محفوظ اور بحال کریں | `getJson`, `setJson`, `getHtml`, `setHtml` |
| تبدیلیوں کا مشاہدہ کریں | `nabi.onChange(listener)` |
| Undo اور redo | `nabi.undo()`, `nabi.redo()` |
| سرور پر HTML رینڈر کریں | `nabi-note/ssr` سے `renderStoredHtml` |
| شائع شدہ صفحے کا رویہ شامل کریں | `nabi-note/viewer` سے `attachViewer` |
| دستاویزات کا موازنہ کریں | `nabi-note/diff` سے `diffDocs` |

عین اقسام اور ہر argument کے لیے پہلے نصب شدہ پیکیج کے اعلانات دیکھیں۔ خودکار سازی کے ٹولز [انگریزی API حوالہ](https://nabi.saro.me/llms/api-reference.md) بھی استعمال کر سکتے ہیں۔

## mounts کو ختم کریں

تخلیق کی الٹی ترتیب میں unmount کریں۔ ترمیمی root کے `innerHTML` کو براہ راست تبدیل نہ کریں؛ دستاویزات کو `setJson()`، `setHtml()` یا `applyCommand()` جیسے عوامی APIs کے ذریعے تبدیل کریں۔

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
