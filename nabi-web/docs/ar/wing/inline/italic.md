---
title: مائل
---

# مائل

## الوصف

`italicWing` هو مالك (claim) الوسم `<i>`. يُستخدم للنص الذي يختلف نسيجه عمّا حوله،
ككلمة غريبة أو اقتباس.

- عند الدخول يقبل `<i>` و`<em>` معًا، وعند الخروج يجمعهما في `<i>` واحد.
  ولا يُبقي أي سمة.
- اختصار وضع التلميح (نقر مزدوج على Shift) هو `I` — يُلتقط بالمفتاح الفعلي
  (`KeyI`) فيعمل حتى مع لوحة مفاتيح غير لاتينية.
- الضغط عليه والنص محدَّد يعمل كمبدِّل.
- إن لم تسجِّل الجناح، يُجرَّد `<i>` من غلافه ويسقط إلى نص عادي.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
