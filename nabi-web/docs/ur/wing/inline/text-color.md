---
title: متن کا رنگ
---

# متن کا رنگ

## تفصیل

`textColorWing` (نام `tc`) `<span data-color="...">` کی مالک (claim) ہے۔ یہ
ہائی لائٹ جیسی ہی قسم ہے، قدر رکھنے والا inline mark ہے، اس لیے آن آف نہیں
بلکہ رنگ چنا جاتا ہے۔

- **ٹول بار کا بٹن (شارٹ کٹ `C`) سبز رنگ لگاتا ہے** — `setTextColor` کو
  `{ c: 'green' }` کے ساتھ بلاتا ہے۔ یہ بغیر دلیل کے چلنے والا بٹن نہیں۔
- اس لیے اس بٹن کا toggle **صرف سبز رنگ کا toggle ہے۔** منتخب حصہ پورا سبز ہو
  تب ہی اترتا ہے، کوئی اور رنگ لگا ہو تو سبز میں بدل جاتا ہے۔
- کیریٹ متن کے رنگ والے mark کے اندر ہو تو سیاق سطر پر رنگ کے پانچ نمونے
  نکلتے ہیں — دبانے سے وہیں صرف رنگ بدل جاتا ہے (mark ایک دوسرے پر نہیں چڑھتے)۔
  اس wing میں الگ سے "مٹانے" کا خانہ نہیں ہے — وہی رنگ دوبارہ دبائیں تو اتر
  جاتا ہے، باقی سب `clearFormatWing` کا کام ہے۔
- **صرف کیریٹ رکھ کر چننے کی دو صورتیں ہیں۔** mark کے اندر ہو تو وہ mark جتنا
  متن ڈھانپتا ہے وہ سب نشانہ بنتا ہے، mark سے باہر ہو تو **reservation** کے
  طور پر رہ جاتا ہے، اگلا لکھا جانے والا حرف اسی رنگ کے ساتھ نکلتا ہے۔
- محفوظ قدر میں صرف رنگ کا نام رہتا ہے — جیسے `data-color="green"`۔ inline
  `style` باہر نہیں جاتا۔ رنگ کی قدر کور کے ٹوکن `--nabi-tc-*` میں رہتی ہے، اور
  سٹائل شیٹ ہائی لائٹ کے ساتھ ایک ہی سیٹ بانٹتی ہے۔
- اندر آتے وقت (`claim`) صرف وہ `<span>` دیکھتی ہے جس پر `data-color` خاصیت
  ہو۔ جس `<span>` پر `data-color` سرے سے نہ ہو اس کا دعویٰ یہ wing نہیں کرتی،
  اس لیے اس کا خول اتر جاتا ہے اور سادہ متن رہ جاتا ہے، اور **خاصیت موجود ہو
  مگر قدر فہرست سے باہر ہو تو تب بھی خول اتر جاتا ہے اور صرف متن رہتا ہے۔**
- ہاتھ سے بدلی گئی محفوظ قدر کی فہرست سے باہر کی قدر کو بھی `repair` خول سمیت
  ہٹا دیتا ہے۔
- ہائی لائٹ سے یہ الگ mark ہے، اس لیے ایک ہی متن پر ساتھ لگ سکتے ہیں — ہائی
  لائٹ کی سٹائل شیٹ میں `color` نہ لکھا ہونا اسی کی وجہ ہے۔

| رنگ کا نام | محفوظ قدر |
|---|---|
| سبز | `green` |
| مونگا | `coral` |
| بنفشی | `violet` |
| کہربائی | `amber` |
| نیلا | `blue` |

یہ پانچ رنگ `TEXT_COLORS` سے باہر نکالے جاتے ہیں — رنگ کی قدر نہیں بلکہ
**ناموں کی صف** ہے (`readonly string[]`)۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
