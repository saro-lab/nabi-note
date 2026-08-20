---
title: يتوسطه خط
---

# يتوسطه خط

## الوصف

`strikeWing` هو مالك (claim) الوسم `<s>`. يُستخدم لقيمة حُذفت لكنك تريد
إبقاءها ظاهرة.

- عند الدخول يقبل الثلاثة `<s>` و`<strike>` و`<del>`، وعند الخروج يخرج دائمًا
  بوسم `<s>`. ولا يُبقي أي سمة — حتى وقت `<del datetime="…">` لا يبقى.
- اختصار وضع التلميح هو `S`. **لا مفتاح تسريع له** — خلافًا للغامق والمائل
  والتسطير في مجموعة `emphasis` نفسها، لا تركيبة `Ctrl`/`⌘` مربوطة به.
- الضغط عليه والنص محدَّد يعمل كمبدِّل.
- بدون تسجيله يسقط غلاف `<s>` ويخرج النص عاديًا.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
