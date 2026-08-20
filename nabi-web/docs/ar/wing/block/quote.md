---
title: اقتباس
---

# اقتباس

## الوصف

`quoteWing` (اسمه `quote`) يملك صندوق الاقتباس (`<blockquote>`). وهو
`place: 'container'` و`holds: 'blocks'` — تعيش الكتل في جوفه. كسائر الأجسام
يلبس الاقتباس نفسه فقرة حاضنة واحدة ويقف في المستوى الأعلى.

**لا تُكتَب `allows` له.** داخل الاقتباس نفس قواعد المستوى الأعلى، فيمكن
للصورة أو الجدول أن تقف فيه لابسةً فقرتها الحاضنة — ذلك الـHTML إن لُصِق أو
استُورِد يبقى كما هو.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["نص"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

إلا أن **أزرار الإدراج لا تدخل الاقتباس.** ما يقوم عبر `insertLump` كالصورة
والجدول والفاصل يقف دائمًا في **المستوى الأعلى**، فحتى لو كان المؤشر داخل
الاقتباس يقف الجسم الجديد **بعده**. لإدراج شيء داخل الاقتباس تُستعمل اللصق.

الضغط على الزر يلفّ كل الكتل في المستوى الأعلى التي يطالها التحديد باقتباس.
لا يُفكّ إلا إن كانت الكتل المشمولة **كلها اقتباسًا بالفعل** — أما إن اختلطت
فتُلَف مرة أخرى كاملة.

كتابة `>` وحدها في أول السطر ثم الضغط على مسافة يحوّل ذلك السطر إلى اقتباس
أيضًا — و**الزناد في هذا التحويل التلقائي هو المسافة** (لا Enter)، لأنك
تواصل الكتابة في السطر نفسه.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
