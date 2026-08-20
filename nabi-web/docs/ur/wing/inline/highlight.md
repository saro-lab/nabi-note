---
title: ہائی لائٹ
---

# ہائی لائٹ

## تفصیل

`highlightWing` (نام `hl`) `<mark data-color="...">` کی مالک (claim) ہے۔ یہ
قدر رکھنے والا inline mark ہے، اس لیے آن آف کرنے والا toggle نہیں بلکہ رنگ
چننے والا خانہ ہے — متن کے رنگ جیسا ہی۔

- **ٹول بار کا بٹن (شارٹ کٹ `H`) پیلا رنگ لگاتا ہے** — `setHighlight` کو
  `{ c: 'yellow' }` کے ساتھ بلاتا ہے۔ یہ بغیر دلیل کے چلنے والا بٹن نہیں۔
- اس لیے اس بٹن کا toggle **صرف پیلے رنگ کا toggle ہے۔** منتخب حصہ **پورا
  پیلا ہو تب ہی** اترتا ہے — پورا سبز ہو تو دبانے سے اترنے کے بجائے پیلے میں
  بدل جاتا ہے، اترنے کے لیے ایک بار مزید دبانا پڑتا ہے۔
- کیریٹ ہائی لائٹ mark کے اندر ہو تو سیاق سطر پر رنگ کے چھ نمونے نکلتے ہیں —
  دبانے سے وہیں صرف رنگ بدل جاتا ہے۔ اس wing میں الگ سے "مٹانے" کا خانہ نہیں
  ہے۔ وہی رنگ دوبارہ دبائیں تو اتر جاتا ہے، اور فارمیٹنگ صاف کرنا
  `clearFormatWing` کا کام ہے (اسے الگ سے رجسٹر کرنا لازم ہے)۔
- **صرف کیریٹ رکھ کر چننے کی دو صورتیں ہیں۔** کیریٹ پہلے سے ہائی لائٹ mark کے
  اندر ہو تو وہ mark جتنا متن ڈھانپتا ہے وہ سب نشانہ بن جاتا ہے (حد دوبارہ
  منتخب کرنے کی ضرورت نہیں)۔ mark سے باہر ہو تو لگانے کو کوئی متن نہیں، اس لیے
  **reservation** کے طور پر رہ جاتا ہے، اگلا لکھا جانے والا حرف اسی رنگ کے
  ساتھ نکلتا ہے۔
- محفوظ قدر میں صرف رنگ کا نام رہتا ہے — جیسے `data-color="yellow"`۔ inline
  `style` باہر نہیں جاتا۔ اصل پس منظر کا رنگ اس wing کی `styles` سے اٹھائی گئی
  سٹائل شیٹ کھینچتی ہے (متن کے رنگ کے ساتھ ایک ہی سیٹ بانٹتی ہے)، اور رنگ کی
  قدر خود کور کے ٹوکن `--nabi-hl-*` میں رہتی ہے — میزبان وہی ٹوکن بدل کر رنگ
  بدلتا ہے۔
- **فہرست سے باہر کی قدر کہیں نہیں ٹھہرتی۔** command سرے سے نہیں چلتا، اور
  اندر آنے والے HTML میں فہرست سے باہر `data-color` رکھنے والے `<mark>` کا خول
  اتر جاتا ہے اور **صرف متن رہ جاتا ہے۔** جس `<mark>` پر `data-color` سرے سے نہ
  ہو اس کا بھی یہی حال ہے — رنگ ہی قدر ہے، اس لیے بغیر قدر کی ہائی لائٹ کی کوئی
  جگہ نہیں۔
- ہاتھ سے بدلی گئی محفوظ قدر پر بھی یہی اصول ہے — `repair` فہرست سے باہر کی
  قدر ملتے ہی اس node کو خول سمیت ہٹا دیتا ہے۔

| رنگ کا نام | محفوظ قدر |
|---|---|
| پیلا | `yellow` |
| سبز | `green` |
| آسمانی | `cyan` |
| گلابی | `pink` |
| ارغوانی | `purple` |
| نارنجی | `orange` |

یہ چھ رنگ `HIGHLIGHT_COLORS` سے باہر نکالے جاتے ہیں — رنگ کی قدر نہیں بلکہ
**ناموں کی صف** ہے (`readonly string[]`)۔ رنگ کی قدر سٹائل شیٹ رکھتی ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
