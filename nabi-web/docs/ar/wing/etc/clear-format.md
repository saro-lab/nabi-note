---
title: مسح التنسيق
---

# مسح التنسيق

## الوصف

`clearFormatWing` **ثابت جاهز.** يكفي وضعه في المصفوفة — لا خيارات تُمرَّر.

بما أن `place: 'tool'` فهو لا يُقيم عقدته الخاصة في المستند. كل ما فيه أمر واحد
(`clearFormat`) وزر واحد في شريط الأدوات.

- **القائمة التي يمسحها مثبَّتة في النواة.** إحدى عشرة علامة سطرية (`b`·`i`·`u`·
  `s`·`sub`·`sup`·`hl`·`tc`·`fs`·`tf`·`a`) وثلاث خصائص فقرة (`h` العنوان ·
  `a` المحاذاة · `dc` الحرف الاستهلالي). لا حاجة للمضيف لإدارة هذه القائمة، وعلامات
  أي جناح تصنعه بنفسك **لا تُمسَح من هنا.**
- **الضغط عليه بعد تحديد نطاق** ينزع دفعة واحدة علامات ذلك المقطع وخصائص الفقرات
  التي يطالها.
- **مع المؤشر وحده ينزع طبقة واحدة في كل ضغطة** — من **أعمق علامة** في مكان
  المؤشر، بمقدار امتداد تلك العلامة. فإن لم تبقَ علامة يُنزَع منها ينتقل عندها
  إلى خصائص الفقرة.
- **لا يُنزَع رابط المرفق** — الرابط (`a`) الذي يحمل الخاصية `file` محصَّن في كل
  مكان. لأن تجريد غلافه يحوّل المرفق إلى نص عادي ميت.
- **تبقى محاذاة الفقرة الحاضنة لجسم كما هي.** في الفقرة الحاضنة لصورة أو جدول
  لا تُمسَح المحاذاة (`a`) وحدها — فذلك يمنع أن تقفز الصورة إلى اليسار أثناء مسح
  التنسيق.
- إن لم يكن هناك ما يُمسَح يجيب الأمر بـ`null`. لا تتراكم نقطة تراجع.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
