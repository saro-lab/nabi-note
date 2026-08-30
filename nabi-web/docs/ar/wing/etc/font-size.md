---
title: حجم النص
description: يغيّر حجم النص ضمن الدرجات المسموح بها.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# حجم النص

يغيّر درجة حجم النص المحدد. عند تحديد نطاق يطبّقها عليه، وعند وجود مؤشر الكتابة فقط يغيّر حجم نص الفقرة الحالية. لا تُحفظ قيم عشوائية مثل `px`، بل الدرجات المسموح بها فقط.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

عند حذف `values` تُستخدم الدرجات `xs` و`sm` و`lg` و`xl`. وإذا ضُيّقت القائمة، تُزال عند التحميل الدرجات الأخرى الموجودة في المستندات السابقة.

## أنماط CSS

يمكن تغيير الحجم بمحدد الدرجة المحفوظة مثل `.nabi-content [data-nabi-size="xs"]`. لا تنشئ درجات عشوائية غير موجودة في المستند، واضبط CSS ضمن `values` المسجلة فقط.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

يحافظ فرق ثابت بين الدرجات على معنى اختيار الكاتب في المحرر عند عرض صفحة النشر.
