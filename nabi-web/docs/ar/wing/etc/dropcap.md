---
title: حرف استهلالي
---

# حرف استهلالي

## الوصف

`dropCapWing` سمة كتلة أحادية القيمة تُلصِق بالفقرة `data-nabi-dropcap="1"`.
لا يُنشئ كتلة جديدة، بل يضع علامة فقط على فقرة قائمة.

- القيمة واحدة: مُشغَّل أو مُطفَأ — الضغط على الزر ثانية يُسقط السمة.
- **لا خيار ولا متغيّر يحدّد عدد الأسطر التي يغطّيها.** قاعدة واحدة في صحيفة
  النواة (`::first-letter`) تثبّت الحجم — `font-size: 5.9em; line-height: .83`.
  عدد الأسطر التي يغطّيها الحرف فعليًّا يحدّده ارتفاع سطر تلك الفقرة.
- ولأنه لا يمس إلا الحرف الأول، تعامل Enter هذه السمة معاملة العلامة — فلو
  شُطرت الفقرة نصفين لم تُستنسَخ في النصفين، بل تتبع ذلك الحرف.

لتغيير الحجم تُتجاوَز تلك القاعدة.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
