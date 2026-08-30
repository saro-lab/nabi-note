---
title: جدول
description: قطاریں اور کالم بنائیں، خانوں میں ترمیم کریں، اور کالم کی ترتیب کو سہارا دیں۔
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# جدول

جدول بنانے کے لیے ٹول بار سے قطاریں اور کالم منتخب کریں۔ خانے کے اندر مواد متعدد پیراگراف کی بجائے سطر کے وقفوں کے ساتھ جاری رہتا ہے، اور Tab اور Shift+Tab اگلے یا پچھلے خانے میں لے جاتے ہیں۔

قطاریں یا کالم شامل اور حذف کرنا، خانے ملانا، اور سرخی والے خانے بدلنا منتخب خانوں کے گرد کام کرتا ہے۔ جدول کو قابلِ ترتیب بنا کر محفوظ کرنے کے بعد شائع شدہ منظر میں کالم ترتیب استعمال کرنے کے لیے `nabi-note/viewer` سے `attachViewer()` جوڑیں۔ ملے ہوئے خانوں والے جدول ترتیب نہیں دیے جاتے۔

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS طرزیں

جدول کو `.nabi-content table` اور خانوں کو `.nabi-content :is(th, td)` سے طرز دیں۔ خانے کی ساخت یا ویوئر کی شامل کردہ ترتیب بٹن نہ بدلیں۔

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

اگر ویوئر منسلک ہے تو `.nabi-sort` بٹن برقرار رکھیں۔ خانے کی `position` یا دائیں پیڈنگ زبردستی اووررائیڈ کرنے سے یہ ترتیب بٹن پر چڑھ سکتی ہے۔
