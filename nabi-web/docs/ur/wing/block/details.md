---
title: تفصیلات
description: خلاصہ اور متن کو گروپ کریں، اور محفوظ کریں کہ یہ ابتدا میں کھلا ہو گا یا نہیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# تفصیلات

مختصر خلاصے اور متن کو ایک بلاک میں گروپ کریں۔ ٹول بار سے اسے بناتے وقت پہلے خلاصہ درج کریں، پھر اس کے نیچے مواد لکھنا جاری رکھیں۔

مثلث سے مقرر کردہ کھلی حالت دستاویز میں محفوظ ہوتی ہے اور شائع شدہ منظر کی ابتدائی حالت بنتی ہے۔ ترمیم کے دوران بھی مثلث پر کلک کر کے بلاک کھول یا بند کر سکتے ہیں۔

جدول کے خانے یا کسی دوسرے بلاک کے اندر صرف متعلقہ تہہ ہونے والا بلاک کھلتا اور بند ہوتا ہے۔ اگر کرسر یا انتخاب بند ہونے والے متن کے اندر ہو تو اسے باہر منتقل کیا جاتا ہے؛ دوسری جگہ کا انتخاب برقرار رہتا ہے۔

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS طرزیں

تفصیلات بلاک کو `.nabi-content details` اور عنوان کو `.nabi-content details > summary` سے طرز دیں۔

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` وصف مصنف کی محفوظ کردہ ابتدائی کھلی حالت ہے۔ CSS اس حالت کی طرز بدل سکتی ہے، مگر حالت خود کو زبردستی نافذ نہ کرنا بہتر ہے۔
