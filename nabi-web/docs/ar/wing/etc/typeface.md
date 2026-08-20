---
title: نوع الخط
---

# نوع الخط

## الوصف

`typefaceWing` (اسمه `tf`) **علامة قيمة مضمَّنة.** ثابت جاهز لا يحتاج خيارات —
يكفي وضعه في المصفوفة. يُرسَم عند الخروج كـ `<span data-nabi-typeface="serif">`.

القيم أربع (`TYPEFACES`): `sans`·`serif`·`mono`·`cursive`.

- **لا يحمل أي اسم خط بذاته.** الذي يُختار **صنف**، أما الخط الذي يظهر فعلًا
  فتحدّده القيم التي يضعها المضيف في أربعة رموز: `--nabi-font` و
  `--nabi-font-serif` و`--nabi-font-mono` و`--nabi-font-cursive`.
- **جناح واحد** يحمل الأصناف الأربعة كلها. مكان الاختيار أربع خانات (`select`)
  في الشريط السياقي، وله زر واحد في شريط الأدوات بابًا للدخول. الضغط على الزر
  يُلصِق `serif`.
- **النص الذي لا شيء عليه يلبس `--nabi-typeface-base`.** هذا الرمز هو خط
  الأساس للمحرِّر كله، وإن لم يُضبَط يتبع `--nabi-font`. لا توجد خانة منفصلة
  لاختيار "الافتراضي" — **إعادة اختيار** الصنف الملصَق حاليًّا **تُسقطه** وتعود
  إلى ذلك المكان.
- تُرسَم خانات الاختيار **بالخط الذي تشير إليه** — خانة serif مكتوبة بخط
  serif، وخانة mono بخط أحادي العرض، فيظهر ما تختاره دون الحاجة لمعرفة اسمه.
- **مع المؤشر وحده يُلصَق بالفقرة كلها.** في فقرة خالية تمامًا من النص يبقى
  محجوزًا؛ الحرف التالي الذي يُكتب يلبس هذا الخط.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

الخط الذي يضعه المضيف موضع واحد في CSS. وإن كدّست عدة خطوط على صنف واحد، مسح
المتصفح القائمة من أولها لكل حرف ورسمه بأول خط يملكه، فيبقى شكل ذلك الصنف
محفوظًا مهما كانت اللغة المكتوبة.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## عرض توضيحي

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
