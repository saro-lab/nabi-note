---
title: نیچے کا ہندسہ
---

# نیچے کا ہندسہ

## تفصیل

`subscriptWing` `<sub>` کی مالک (claim) ہے۔ کیمیائی فارمولے یا نیچے لکھے جانے
والے ہندسے کے لیے استعمال ہوتی ہے۔

- صرف `<sub>` ٹیگ قبول کرتی ہے۔ کوئی خاصیت نہیں بچاتی۔
- hint mode کا شارٹ کٹ اور accelerator دونوں نہیں ہیں۔ ٹول بار کا گروہ `script`
  ہے، اوپر کے ہندسے کے ساتھ کھڑا ہوتا ہے (رجسٹریشن کی ترتیب سے اوپر کا ہندسہ
  پہلے آتا ہے)۔
- متن منتخب کر کے دبائیں تو toggle کا کام کرتی ہے۔
- شکل اس wing کے `Wing.styles` سے اٹھائی گئی سٹائل شیٹ دیتی ہے۔

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**یہ سٹائل شیٹ اوپر کے ہندسے کے ساتھ مشترک ہے۔** دونوں wing ایک ہی متن رکھتی
ہیں، اس لیے دونوں رجسٹر کریں تب بھی دستاویز میں **صرف ایک بار** لگتی ہے
(`collectSheets` ایک جیسے متن کی سٹائل شیٹ چھان کر ہٹا دیتا ہے)۔ محفوظ قدر
(HTML) میں صرف `<sub>` ٹیگ رہتا ہے، سٹائل خود نہیں لگتی۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
