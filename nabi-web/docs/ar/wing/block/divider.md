---
title: فاصل
---

# فاصل

## الوصف

`dividerWing` (اسمه `hr`) يملك وسمًا واحدًا هو `<hr>`. **`place: 'void'`** —
جسم بلا جوف، فلا مكان يدخله المؤشر. الضغط على Backspace أو Delete قبل الفاصل
مباشرة أو بعده يمحو تلك الكتلة بأسرها، والنتيجة نفسها إن حدَّدت نطاقًا يشملها.

الضغط على الزر يُقيم الفاصل **لابسًا فقرته الحاضنة الخاصة به**. لا تُنشأ فقرة
فارغة معه — يقف المؤشر فوق تلك الفقرة الحاضنة، خلف الفاصل مباشرة.

المكان الذي يقف فيه يتحدد بوجود نص في الفقرة التي كان المؤشر فيها أم لا.

| مكان المؤشر | النتيجة |
|---|---|
| فقرة فيها نص | يقف **بعد** تلك الفقرة |
| فقرة فارغة | **يأخذ مكانها** — لا يبقى سطر فارغ خلفه |

حين يأخذ مكان فقرة فارغة تبقى المحاذاة التي كانت تلك الفقرة تحملها كما هي.

كتابة ثلاث شرطات فأكثر (`---`) وحدها في بداية السطر ثم الضغط على Enter تعطي
النتيجة نفسها — و**الزناد في هذا التحويل التلقائي هو Enter**.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
