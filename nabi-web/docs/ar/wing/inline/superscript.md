---
title: مرتفع
---

# مرتفع

## الوصف

`superscriptWing` هو مالك (claim) الوسم `<sup>`. يُستخدم لأُسِّ الوحدات
وأرقام الحواشي.

- الوسم الوحيد الذي يقبله هو `<sup>`. ولا يُبقي أي سمة.
- لا اختصار له في وضع التلميح ولا مفتاح تسريع (من الأجنحة التي لا تظهر لها
  شارة، مثل رفع الملفات). تقف مجموعته في شريط الأدوات باسم `script` جنبًا إلى
  جنب مع المنخفض، وهو الأول بترتيب التسجيل.
- الضغط عليه والنص محدَّد يعمل كمبدِّل.
- الشكل يأتي من صحيفة أنماط يحملها هذا الجناح عبر `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sup { vertical-align: super; }
```

**هذه الصحيفة مشتركة مع المنخفض.** يحمل الجناحان النص نفسه، فحتى لو سُجِّلا
معًا لا يُحمَّل في المستند إلا **مرة واحدة** (يجمع `collectSheets` صحائف النص
الواحد). لا يبقى في القيمة المحفوظة (HTML) إلا وسم `<sup>`، والنمط نفسه لا
يُحمَّل معه.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
