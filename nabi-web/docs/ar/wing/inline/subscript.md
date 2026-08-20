---
title: منخفض
---

# منخفض

## الوصف

`subscriptWing` هو مالك (claim) الوسم `<sub>`. يُستخدم للصيغ الكيميائية
والأرقام التي تُكتب في الأسفل.

- الوسم الوحيد الذي يقبله هو `<sub>`. ولا يُبقي أي سمة.
- لا اختصار له في وضع التلميح ولا مفتاح تسريع. تقف مجموعته في شريط الأدوات
  باسم `script` جنبًا إلى جنب مع المرتفع (المرتفع أولًا بترتيب التسجيل).
- الضغط عليه والنص محدَّد يعمل كمبدِّل.
- الشكل يأتي من صحيفة أنماط يحملها هذا الجناح عبر `Wing.styles`.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**هذه الصحيفة مشتركة مع المرتفع.** يحمل الجناحان النص نفسه، فحتى لو سُجِّلا
معًا لا يُحمَّل في المستند إلا **مرة واحدة** (يجمع `collectSheets` صحائف النص
الواحد). لا يبقى في القيمة المحفوظة (HTML) إلا وسم `<sub>`، والنمط نفسه لا
يُحمَّل معه.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
