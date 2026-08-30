---
title: فونٹ کا حجم
description: اجازت یافتہ درجوں کے اندر متن کا حجم بدلیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# فونٹ کا حجم

منتخب متن کو حجم کے کسی درجے میں بدلیں۔ اگر حد منتخب ہے تو درجہ اسی حد پر لاگو ہوتا ہے؛ اگر صرف کرسر ہے تو موجودہ پیراگراف کے متن کا حجم بدلتا ہے۔ محفوظ شدہ ڈیٹا میں `px` جیسی من مانی اقدار کے بجائے صرف اجازت یافتہ درجے ہوتے ہیں۔

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

اگر `values` حذف ہو تو `xs`، `sm`، `lg` اور `xl` درجے استعمال ہوتے ہیں۔ فہرست محدود کرنے پر پرانی دستاویزات میں پہلے سے موجود دیگر درجے لوڈ کرتے وقت ہٹا دیے جاتے ہیں۔

## CSS طرزیں

آپ `.nabi-content [data-nabi-size="xs"]` جیسے محفوظ درجے کے سلیکٹرز سے حجم بدل سکتے ہیں۔ دستاویز میں نہ ہونے والے من مانے درجے نہ بنائیں؛ CSS کو صرف رجسٹر شدہ `values` کے اندر ایڈجسٹ کریں۔

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

درجوں کے درمیان حجم کا فرق یکساں رکھنے سے دستاویز شائع ہونے پر ایڈیٹر میں مصنف کے منتخب کردہ معنی برقرار رہتے ہیں۔
