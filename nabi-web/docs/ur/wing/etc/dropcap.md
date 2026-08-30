---
title: ڈراپ کیپ
description: متن کا آغاز بڑے پہلے حرف سے کریں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ڈراپ کیپ

پیراگراف کے پہلے حرف کو بڑے حجم میں رکھیں اور بعد کی سطروں کو اس کے ساتھ بہنے دیں۔ یہ پیراگراف سطح کی فارمیٹنگ ہے، اس لیے یہ منتخب لفظ کے صرف ایک حصے پر لاگو نہیں ہوتی۔

شائع شدہ اور ترمیمی منظر ایک ہی شکل برقرار رکھتے ہیں۔ ترمیم کے دوران پہلا حرف ایک حقیقی عنصر میں لپیٹا جاتا ہے تاکہ کرسر اور حذف کی جگہیں نہ سرکیں؛ یہ عنصر محفوظ شدہ دستاویز کے مواد میں شامل نہیں ہوتا۔

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS طرزیں

شائع شدہ اور ترمیمی منظر پہلے حرف کے لیے مختلف سلیکٹر استعمال کرتے ہیں۔ شائع شدہ منظر `[data-nabi-dropcap="1"]::first-letter` استعمال کرتا ہے، جبکہ ترمیمی منظر حقیقی عنصر `[data-nabi-dropcap-letter]` استعمال کرتا ہے۔ رنگ، فونٹ یا حجم جیسی نمایاں اقدار بدلتے وقت دونوں سلیکٹرز ایک ساتھ لکھیں تاکہ ترمیمی اور شائع شدہ نتیجہ ایک جیسا دکھے۔

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

حجم اور لائن کی اونچائی بدلیں تو دونوں سلیکٹرز پر ایک جیسی اقدار لاگو کریں۔

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

ڈراپ کیپ پہلے حرف کے گرد سطر کے بہاؤ کا حساب لگاتے ہیں، اس لیے صرف ایک طرف بدلنے یا اقدار بہت بڑی کرنے سے WYSIWYG شکل خراب ہو سکتی ہے۔ پھر بھی ایڈیٹر میں نیا `::first-letter` قاعدہ شامل نہ کریں۔ ایڈیٹر میں صرف موجودہ `[data-nabi-dropcap-letter]` کو طرز دیں۔
