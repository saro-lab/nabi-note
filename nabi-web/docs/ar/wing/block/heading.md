---
title: عنوان
---

# عنوان

## الوصف

جناح واحد هو `headingWing` (المعرّف `h`) يحمل المستويات الستة كلها. العنوان ليس
عقدة مستقلة بل **خاصية للفقرة نفسها** — القيمة المخزَّنة هي `{"w":"p","a":{"h":2}}`،
وتخرج عند التصدير وسمًا `<h2>`.

بما أن الفقرة نفسها تصير عنوانًا، تُحمَل معه خصائص الفقرة الأخرى كالمحاذاة
والحرف الاستهلالي معًا (`<h2 data-nabi-align="c">`).

## زر واحد في شريط الأدوات، والمستوى من الشريط السياقي

**زر شريط الأدوات واحد لا غير هو `H`.** الضغط عليه في فقرة يجعلها عنوانًا 1،
وإذا وقف المؤشر داخل عنوان ظهرت في الشريط السياقي حقول `عنوان`و`H1` إلى `H6` —
يظهر مستواك الحالي حقلًا مضغوطًا، والضغط على حقل آخر ينقلك إلى ذلك المستوى.
والضغط على حقل `عنوان` يعيدك فقرة.

وإن كتبت في سطر فارغ من `#` بعدد المستوى (`##` لـ h2) ثم ضغطت مسافة صار عنوانًا
من ذلك المستوى تلقائيًّا — وتُمحى علامات `#` والمسافة نفسها.

## مثال الاستخدام

الشريط السياقي (ومنه حقول اختيار المستوى) يرسمه `mountContextToolbar`.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وذلك هو `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

ويمكن أيضًا استدعاؤه مباشرة بأمر.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // عنوانًا من المستوى 2
nabi.applyCommand('setHeading', { value: 2 })  // نفس المستوى مرة أخرى — يعود فقرة
```

وإذا حدَّدتَ عدة فقرات وطبّقت الأمر يُطبَّق على **كل الفقرات المحدَّدة**. أما الكتل
التي تشغل مكان الفقرة كالجدول والقوائم فتُتخطى — لأن العنوان خاصية للفقرة النصّية.

## عرض توضيحي

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
