---
title: تسطير
---

# تسطير

## الوصف

`underlineWing` هو مالك (claim) الوسم `<u>`.

- عند الدخول يقبل `<u>` و`<ins>` معًا، وعند الخروج يخرج دائمًا بوسم `<u>`.
  ولا يُبقي أي سمة.
- اختصار وضع التلميح هو `U`.
- الضغط عليه والنص محدَّد يعمل كمبدِّل.
- قد يتشابه شكل التسطير والرابط على الشاشة، لكنهما علامتان منفصلتان يملكهما
  جناحان مختلفان (`a` للرابط) — ويمكن أن تجتمعا على النص نفسه.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
