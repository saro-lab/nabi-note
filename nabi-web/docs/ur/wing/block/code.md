---
title: کوڈ
description: متعدد سطروں والا کوڈ، نحو نمایاں کرنے کے لیے استعمال ہونے والی زبان کے ساتھ محفوظ کریں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# کوڈ

متعدد سطروں والا کوڈ عام متن سے الگ شامل کریں۔ خالی پیراگراف میں تین بیک ٹکس لکھ کر Space یا Enter دبائیں، یا ٹول بار سے کوڈ بلاک میں بدلیں۔ اگر بیک ٹکس کے بعد زبان کا نام، مثلاً `ts`، شامل کریں تو وہ نام بھی محفوظ ہو جاتا ہے۔

زبان کا نام نحو نمایاں کرنے کے لیے استعمال ہونے والا شناخت کار ہے، اور رجسٹر شدہ فہرست سے باہر کے نام بھی دستی طور پر لکھے جا سکتے ہیں۔ چونکہ کوڈ کا مواد اور انڈینٹیشن محفوظ رہنا ضروری ہے، کوڈ بلاک پیراگراف کی سیدھ قبول نہیں کرتے۔

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## کوڈ ہائی لائٹر منسلک کرنا

کوڈ بلاک رجسٹر کرنے پر ایڈیٹر کے اندر طے شدہ رنگ کاری استعمال ہوتی ہے۔ شائع شدہ منظر میں بھی کوڈ رنگین کرنے کے لیے `nabi-note/viewer` منسلک کریں۔ ویوئر `pre > code` تلاش کرتا ہے اور والد عنصر کی `data-nabi-lang` قدر کو زبان کے نام کے طور پر پڑھتا ہے۔ اگر وہ قدر موجود نہ ہو تو `code` عنصر پر `language-...` کلاس کو دیکھتا ہے۔

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'en',
})

// After replacing the published HTML
viewer.refresh()

// When closing the screen
viewer.unmount()
```

اگر الگ ہائی لائٹر موجود نہ ہو، یا وہ ہائی لائٹر زبان کو سنبھال نہ سکے، تو انحصار سے پاک اندرونی ٹوکنائزر اس کے بجائے رنگ کاری کرتا ہے۔ ہائی لائٹر کے شامل کردہ ٹوکن spans صرف اسکرین پر ہوتے ہیں اور محفوظ شدہ JSON یا اصل شائع شدہ HTML میں واپس نہیں لکھے جاتے۔ `refresh()` اور `unmount()` ان spans کو ہٹا کر موجودہ اصل کوڈ سے دوبارہ منسلک ہوتے ہیں۔

### NABI ویب سائٹ Shiki کو کیسے منسلک کرتی ہے

NABI ویب سائٹ ہائی لائٹر کو متحرک طور پر لوڈ کرتی ہے تاکہ Shiki پہلی اسکرین یا SSR بنڈل میں شامل نہ ہو۔ `nabi-web/docs/.vitepress/src/highlight.ts` میں `loadCodeHighlighting()` Shiki core بناتا ہے، پھر صرف اسی وقت زبان کی گرامر حاصل کرتا ہے جب اس زبان کے کوڈ کی واقعی ضرورت ہو۔ نیچے کی مثال شائع شدہ منظر میں یہی کنکشن استعمال کرتی ہے۔

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'en',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// When closing the screen
stop?.()
viewer.unmount()
```

جب کوئی زبان پہلی بار ظاہر ہوتی ہے تو گرامر کا ڈاؤن لوڈ شروع ہوتا ہے۔ تب تک بلاک اندرونی ٹوکنائزر کے ساتھ یا سادہ متن کے طور پر دکھایا جاتا ہے۔ گرامر آ جانے پر `onGrammarLoaded()`، `viewer.refresh()` کو چلاتا ہے اور بلاک کو پھر سے رنگین کرتا ہے۔ اس طرح صرف ضروری زبانیں ڈاؤن لوڈ ہوتی ہیں، اور دیر سے آنے والی گرامر کسی دوسری صفحہ منتقلی کے بغیر لاگو ہو جاتی ہے۔

ایڈیٹر کی جانب بھی یہی `highlight` فنکشن استعمال ہوتا ہے۔ NABI ویب سائٹ ڈیمو طے شدہ `codeWing` کے صرف `attach` کو `makeCodeAttach({ highlight, version })` سے بدلتا ہے۔ جب بھی گرامر آتی ہے `version` بدلتا ہے، اور پہلے سے بنے کوڈ کو دوبارہ رنگنے کے اشارے کے طور پر کام کرتا ہے۔ ایک خود مختار سروس پہلے شائع شدہ منظر کا کنکشن بنا سکتی ہے، پھر صرف اس صورت میں یہ طریقہ شامل کرے جب ترمیم کے دوران بھی Shiki رنگ کاری درکار ہو۔

## CSS طرزیں

کوڈ بلاکس کو `.nabi-content pre` اور کوڈ کو `.nabi-content pre > code` سے طرز دیں۔ `white-space` نہ بدلیں، کیونکہ یہ کوڈ کے سطری وقفوں اور ترمیم کو متاثر کرتا ہے۔ ٹوکن کے رنگ `[data-nabi-token]` سلیکٹرز سے بدلے جا سکتے ہیں۔

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
