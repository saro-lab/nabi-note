---
title: قائمة مرقمة
---

# قائمة مرقمة

## الوصف

`orderedListWing` (اسمه `ol`، اختصاره `N`) يملك `<ol>`. يُجلَب العنصر عبر
`parts` فلا يُسجَّل `oli` على حدة — وهو سجل لا مصفوفة.

```ts
parts: { oli: { holds: 'blocks' } }
```

الضغط على الزر يلفّ الكتلة التي يقف فيها المؤشر (أو الكتل التي يشملها
التحديد) بقائمة مرقمة، والضغط ثانية يفكّها. الضغط على زر قائمة أخرى يبدّل
الصنف.

كتابة رقم ونقطة ومسافة في أول السطر (`1. ` مثلًا) تعطي النتيجة نفسها. **أي رقم
يُقبل بداية لكن حتى تسع خانات فقط** (`1234567890. ` لا يعمل)، وإن جاء بعد
النقطة شيء آخر كما في `1.2 ` لا يُفعَّل. لا حاجة لأن يكون السطر فارغًا — المقاس
هو أول السطر قبل المؤشر، ويعمل فقط في أول سطر من الفقرة.

- الإزاحة داخلًا وخارجًا بـ`Tab`/`Shift+Tab`، وإنهاء القائمة بـEnter في عنصر
  فارغ، ودمج Backspace في أول العنصر بالعنصر السابق، كلها كما في
  [القائمة النقطية](./bullet-list).
- الرقم لا يدخل القيمة المحفوظة — يرسمه `<ol>` نفسه، فإدراج عنصر أو حذفه يعيد
  الترقيم تلقائيًّا عبر المتصفح.
- التعشيش أيضًا يُحفَظ في القيمة المحفوظة ترميزًا حقيقيًّا. بما أن العنصر يحمل
  كتلًا، يُلبَس النص فقرة واحدة وتقف القائمة المتعشِّشة داخل فقرة حاضنة.
- السمات مثل `start` و`type` لا تنجو. فالقائمة الواردة بـ`start="5"` تُعاد
  عدّها من واحد.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
