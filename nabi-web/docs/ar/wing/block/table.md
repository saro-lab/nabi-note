---
title: جدول
description: ينشئ صفوفًا وأعمدة ويدعم تحرير الخلايا وفرز الأعمدة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# جدول

اختر عدد الصفوف والأعمدة من شريط الأدوات لإنشاء جدول. داخل الخلية يُتابع المحتوى بفواصل أسطر بدل فقرات متعددة، وينقل Tab وShift+Tab إلى الخلية التالية والسابقة.

تعمل إضافة الصفوف والأعمدة وحذفها ودمج الخلايا وتحويل خلية العنوان نسبةً إلى الخلية المحددة. لاستخدام فرز الأعمدة في صفحة النشر بعد حفظ الجدول كقابل للفرز، صِل `attachViewer()` من `nabi-note/viewer`. ولا تُفرز الجداول التي تحتوي خلايا مدمجة.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## أنماط CSS

نسّق الجدول عبر `.nabi-content table` والخلايا عبر `.nabi-content :is(th, td)`. لا تغيّر بنية الخلية ولا زر الفرز الذي يضيفه viewer.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

إذا كان viewer متصلًا، فأبقِ زر `.nabi-sort`. وقد يؤدي فرض `position` أو padding الأيمن للخلية إلى تداخله مع زر الفرز.
