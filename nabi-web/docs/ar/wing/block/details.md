---
title: كتلة قابلة للطي
---

# كتلة قابلة للطي

## الوصف

`detailsWing` (اسمه `details`، اختصاره `D`) يملك صندوق الطي (`<details>` +
`<summary>`). يُجلَب سطر الملخص عبر `parts` فلا يُسجَّل على حدة — وهو سجل لا
مصفوفة.

```ts
parts: { summary: { holds: 'inline' } }
```

الضغط على الزر يلفّ الكتل التي يشملها المؤشر في صندوق طي جديد، ويقف سطر ملخص
فارغ في أوله. الضغط على Enter في سطر الملخص ينزل إلى المحتوى (سطر الملخص نفسه
لا ينشطر).

**يرسم المحرر الصندوق بالحالة نفسها التي سيُحفَظ بها.** الصندوق المحفوظ مطويًّا
يظهر مطويًّا في المحرر أيضًا، والضغط على المثلث يفتحه أو يطويه في مكانه —
وذلك الضغط نفسه هو ما يغيّر القيمة المحفوظة (`o`). إن كان المؤشر داخله عند
الطي خرج المؤشر إلى خارج الصندوق.

::: tip لا شريط سياقي هنا
كان هناك سابقًا زران: **يُحفَظ مفتوحًا** و**يُحفَظ مطويًّا**. في زمن كانت
الشاشة ترسم الصندوق مفتوحًا دائمًا، كان ذلك الطريق الوحيد لتحديد الحالة التي
سيُحفَظ بها. أما الآن فترسم الشاشة القيمة المحفوظة كما هي والمثلث هو من
يغيّرها، فصار الزران يكرران الكلام نفسه فأُزيلا.
:::

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
