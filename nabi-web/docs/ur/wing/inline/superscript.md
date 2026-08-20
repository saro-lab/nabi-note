---
title: اوپر کا ہندسہ
---

# اوپر کا ہندسہ

## تفصیل

`superscriptWing` `<sup>` کی مالک (claim) ہے۔ اکائی کی power یا footnote کے
ہندسے کے لیے استعمال ہوتی ہے۔

- صرف `<sup>` ٹیگ قبول کرتی ہے۔ کوئی خاصیت نہیں بچاتی۔
- hint mode کا شارٹ کٹ اور accelerator دونوں نہیں ہیں (اپ لوڈ جیسی وہ wing جن
  پر بیج نہیں نکلتا، ان میں سے ایک)۔ ٹول بار کا گروہ `script` ہے، نیچے کے
  ہندسے کے ساتھ کھڑا ہوتا ہے مگر رجسٹریشن کی ترتیب سے یہ پہلے آتا ہے۔
- متن منتخب کر کے دبائیں تو toggle کا کام کرتی ہے۔
- شکل اس wing کے `Wing.styles` سے اٹھائی گئی سٹائل شیٹ دیتی ہے۔

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**یہ سٹائل شیٹ نیچے کے ہندسے کے ساتھ مشترک ہے۔** دونوں wing ایک ہی متن رکھتی
ہیں، اس لیے دونوں رجسٹر کریں تب بھی دستاویز میں **صرف ایک بار** لگتی ہے
(`collectSheets` ایک جیسے متن کی سٹائل شیٹ چھان کر ہٹا دیتا ہے)۔ محفوظ قدر
(HTML) میں صرف `<sup>` ٹیگ رہتا ہے، سٹائل خود نہیں لگتی۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
