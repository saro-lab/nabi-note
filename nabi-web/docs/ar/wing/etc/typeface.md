---
title: نمط الخط
description: يطبّق فئة خط على النص المحدد أو الفقرة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# نمط الخط

يطبّق فئة خط على النص المحدد. يغيّر النطاق وحده عند تحديده، ويطبّقها على نص الفقرة الحالية عند وجود مؤشر الكتابة فقط. تحدد CSS الخاصة بالخدمة ملفات الخطوط الفعلية و`font-family`.

الفئات الأساسية هي `sans` و`serif` و`mono` و`cursive`. ومن الأفضل في الخدمات متعددة نظم الكتابة تحديد الخط المرتبط بكل فئة بوضوح.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

عند حذف `values` تُستخدم جميع الفئات الأساسية. ولا يسمح المستند إلا بالقيم المدرجة في `values`.

## أنماط CSS

يُحفظ اسم الفئة فقط في المستند، بينما تحدد CSS ملف الخط. غيّر المتغيرات في الحاوية نفسها للمحرر وصفحة النشر.

```css
.nabi-content {
  --nabi-font-serif: "Noto Naskh Arabic", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

عند استخدام خط ويب، حمّل ملفه أولًا. وغالبًا لا يدعم خط `cursive` كل نظم الكتابة، لذلك لا تعرض هذه الفئة إلا بعد تعيين خط تستخدمه الخدمة فعلًا.
