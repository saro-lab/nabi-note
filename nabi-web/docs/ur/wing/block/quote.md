---
title: اقتباس
description: اقتباس شدہ متن کو گروپ کریں یا متعدد پیراگراف میں سیاق الگ کریں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# اقتباس

اقتباس شدہ متن کو گروپ کریں یا متعدد پیراگراف میں سیاق الگ کریں۔ خالی پیراگراف میں `>` لکھ کر Space دبائیں، یا ٹول بار سے منتخب پیراگراف کو اقتباس میں بدلیں۔

اقتباس میں عام پیراگراف کے ساتھ فہرستوں اور تصاویر جیسے بلاک بھی شامل ہو سکتے ہیں۔ اسی حد کو دوبارہ بدلنے سے یہ واپس بیرونی پیراگراف بن جاتا ہے۔

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS طرزیں

بارڈر اور فاصلے بدل کر `.nabi-content blockquote` سے اقتباسات کی طرز مقرر کریں۔

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` کے اندر پیراگراف کی ساخت برقرار رکھیں، اور صرف ظاہری انداز جیسے بیرونی فاصلہ، بارڈر اور رنگ تبدیل کریں۔
