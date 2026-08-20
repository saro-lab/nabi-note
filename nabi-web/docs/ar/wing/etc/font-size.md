---
title: حجم الخط
---

# حجم الخط

## الوصف

`fontSizeWing` (اسمه `fs`) **علامة قيمة مضمَّنة.** تنسيق يُلبَس فوق الحرف، وليس
خاصية فقرة. يُرسَم عند الخروج كـ `<span data-nabi-size="lg">`.

القيم أربع: `xs`·`sm`·`lg`·`xl`، والحجم الافتراضي ليس قيمة خامسة بل **غياب
الخاصية كليًّا.**

- وهو رفيق نوع الخط (`tf`) — جناح واحد يحمل القيم كلها، ومكان الاختيار الشريط
  السياقي. إلا أن نوع الخط يصفّ أربع خانات، بينما الحجم يستعمل مقياسًا واحدًا.
- **الشريط السياقي مقياس (`range`).** الحجم قيمة مرتَّبة (صغير ← كبير)، فبدل
  تصفيف خانات يُحرَّك بمقبض واحد. يظهر مكان المقبض القيمة الحالية، وتظهر مع
  العلامة تسمية باسم تلك القيمة.
- **الخانة الأولى في المقياس هي "الافتراضي".** والسبب في كونها الأولى لا
  الوسطى أن القائمة تبدأ من الأصغر إلى الأكبر، فما قبلها هو مكان "لا شيء
  مُلصَق". الانتقال إلى هذه الخانة لا يكتب قيمة اسمها `base` بل **يُسقِط
  العلامة نفسها.**
- **تسمية الخانات تتبع اللغة** — بالعربية مثلًا: افتراضي · أصغر بكثير · أصغر ·
  أكبر · أكبر بكثير.
- الضغط على زر شريط الأدوات يُلصِق **`lg` (أكبر).** بما أن المقياس يبدأ
  بالأصغر، لو تُرك على حاله لطُبِّقت الخانة الأولى `xs`، ولا أحد يرجو أن يصغر
  الخط حين يضغط زر الحجم.
- **مع المؤشر وحده يُلصَق بالفقرة كلها.** تكبير كلمة واحدة نادر، فبلا تحديد
  نطاق يستهدف الفقرة (خلافًا للتظليل ولون النص اللذين يستهدفان مقطع العلامة
  الحالي فقط).
- الضغط في فقرة خالية تمامًا من النص يبقى **محجوزًا** — الحرف التالي الذي
  يُكتب يخرج بهذا الحجم.
- إلصاق القيمة نفسها ثانية ينزعها.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
