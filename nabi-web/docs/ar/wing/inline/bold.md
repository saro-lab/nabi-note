---
title: عريض
---

# عريض

## الوصف

`boldWing` هو مالك (claim) الوسم `<b>`. اختر نصًّا واضغط **B** في شريط الأدوات،
أو استخدم وضع التلميح (نقر مزدوج على Shift ثم `B`)، فيصبح ذلك النطاق عريضًا.

- عند الدخول يقبل `<b>` و`<strong>` معًا، وعند الخروج يخرج دائمًا بوسم `<b>` واحد.
  ولا يُبقي أي سمة — `class` و`style` و`data-*` تسقط جميعها ولا يبقى إلا الوسم.
- الضغط عليه والنص محدَّد يعمل كمبدِّل (`toggleMark`) — إن كان النطاق كله عريضًا
  أزاله، وإلا طبَّقه.
- إن لم تسجِّل الجناح، يُجرَّد `<b>` من غلافه ويسقط إلى نص عادي (هذا مصير كل وسم
  غير مسجَّل — إنها قاعدة nabi كلها).

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
